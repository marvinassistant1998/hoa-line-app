import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  Timestamp,
} from 'firebase/firestore';
import type { Resident, Vendor, RepairTicket, Meeting, PaymentRecord, Invoice, ServiceRecord } from '@/types';

// Firebase 設定
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const PROJECT_ID = import.meta.env.VITE_FIREBASE_PROJECT_ID;
const API_KEY = import.meta.env.VITE_FIREBASE_API_KEY;

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ==================== REST API 備用方案 ====================
// 當 SDK 超時時使用 REST API
const FIRESTORE_REST_BASE = `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents`;

async function fetchWithRest<T>(collectionName: string): Promise<T[]> {
  const response = await fetch(`${FIRESTORE_REST_BASE}/${collectionName}`);
  if (!response.ok) {
    throw new Error(`REST API error: ${response.status}`);
  }
  const data = await response.json();
  
  if (!data.documents) return [];
  
  return data.documents.map((doc: any) => {
    const id = doc.name.split('/').pop();
    const fields = doc.fields || {};
    
    // 轉換 Firestore REST API 格式到普通物件
    const converted: any = { id };
    for (const [key, value] of Object.entries(fields)) {
      converted[key] = convertFirestoreValue(value as any);
    }
    return converted as T;
  });
}

// 將普通值轉換為 Firestore REST API 格式
function convertToFirestoreValue(value: any): any {
  if (value === null || value === undefined) {
    return { nullValue: null };
  }
  if (typeof value === 'string') {
    return { stringValue: value };
  }
  if (typeof value === 'number') {
    if (Number.isInteger(value)) {
      return { integerValue: value.toString() };
    }
    return { doubleValue: value };
  }
  if (typeof value === 'boolean') {
    return { booleanValue: value };
  }
  if (Array.isArray(value)) {
    return {
      arrayValue: {
        values: value.map(convertToFirestoreValue),
      },
    };
  }
  if (typeof value === 'object') {
    const fields: any = {};
    for (const [k, v] of Object.entries(value)) {
      fields[k] = convertToFirestoreValue(v);
    }
    return { mapValue: { fields } };
  }
  return { stringValue: String(value) };
}

// 使用 REST API 創建文件
async function createWithRest(collectionName: string, data: any): Promise<string> {
  const fields: any = {};
  for (const [key, value] of Object.entries(data)) {
    fields[key] = convertToFirestoreValue(value);
  }

  // 加入 API Key 進行認證
  const url = `${FIRESTORE_REST_BASE}/${collectionName}?key=${API_KEY}`;
  
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ fields }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('REST API 寫入錯誤:', errorText);
    throw new Error(`REST API write error: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  // 從回應中提取文件 ID
  const docId = result.name.split('/').pop();
  return docId;
}

function convertFirestoreValue(value: any): any {
  if (value.stringValue !== undefined) return value.stringValue;
  if (value.integerValue !== undefined) return parseInt(value.integerValue);
  if (value.doubleValue !== undefined) return value.doubleValue;
  if (value.booleanValue !== undefined) return value.booleanValue;
  if (value.nullValue !== undefined) return null;
  if (value.timestampValue !== undefined) return value.timestampValue;
  if (value.arrayValue !== undefined) {
    return (value.arrayValue.values || []).map(convertFirestoreValue);
  }
  if (value.mapValue !== undefined) {
    const result: any = {};
    for (const [k, v] of Object.entries(value.mapValue.fields || {})) {
      result[k] = convertFirestoreValue(v as any);
    }
    return result;
  }
  return value;
}

// ==================== Collection 名稱 ====================
const COLLECTIONS = {
  RESIDENTS: 'residents',
  VENDORS: 'vendors',
  REPAIRS: 'repairs',
  MEETINGS: 'meetings',
  COMMUNITIES: 'communities',
} as const;

// ==================== 住戶 CRUD ====================
export const residentsService = {
  // 取得所有住戶（優先使用 REST API，更穩定）
  async getAll(communityId?: string): Promise<Resident[]> {
    try {
      // 直接使用 REST API（在 Vercel 環境更穩定）
      console.log('使用 REST API 讀取住戶資料...');
      const residents = await fetchWithRest<Resident>(COLLECTIONS.RESIDENTS);
      console.log('REST API 讀取成功，筆數:', residents.length);
      
      // 如果有 communityId 過濾
      const filtered = communityId 
        ? residents.filter(r => (r as any).communityId === communityId)
        : residents;
      
      // 在客戶端排序
      return filtered.sort((a, b) => (a.unit || '').localeCompare(b.unit || ''));
    } catch (error) {
      console.error('REST API 失敗，嘗試使用 SDK:', error);
      
      // 備用：使用 SDK
      const ref = collection(db, COLLECTIONS.RESIDENTS);
      const snapshot = communityId
        ? await getDocs(query(ref, where('communityId', '==', communityId)))
        : await getDocs(ref);

      const residents = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Resident[];

      return residents.sort((a, b) => a.unit.localeCompare(b.unit));
    }
  },

  // 取得單一住戶
  async getById(id: string): Promise<Resident | null> {
    const docRef = doc(db, COLLECTIONS.RESIDENTS, id);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() } as Resident;
  },

  // 新增住戶（使用 REST API）
  async create(data: Omit<Resident, 'id'>): Promise<string> {
    try {
      console.log('使用 REST API 新增住戶...');
      const now = new Date().toISOString();
      const docId = await createWithRest(COLLECTIONS.RESIDENTS, {
        ...data,
        createdAt: now,
        updatedAt: now,
      });
      console.log('REST API 新增成功，ID:', docId);
      return docId;
    } catch (error) {
      console.error('REST API 新增失敗，嘗試使用 SDK:', error);
      // 備用：使用 SDK
      const ref = collection(db, COLLECTIONS.RESIDENTS);
      const docRef = await addDoc(ref, {
        ...data,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      return docRef.id;
    }
  },

  // 更新住戶
  async update(id: string, data: Partial<Resident>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.RESIDENTS, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  },

  // 刪除住戶
  async delete(id: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.RESIDENTS, id);
    await deleteDoc(docRef);
  },

  // 更新繳費紀錄
  async updatePayment(
    id: string,
    payment: PaymentRecord
  ): Promise<void> {
    const resident = await this.getById(id);
    if (!resident) throw new Error('住戶不存在');

    const paymentHistory = resident.paymentHistory || [];
    const existingIndex = paymentHistory.findIndex(
      (p) => p.year === payment.year && p.month === payment.month
    );

    if (existingIndex >= 0) {
      paymentHistory[existingIndex] = payment;
    } else {
      paymentHistory.push(payment);
    }

    await this.update(id, { paymentHistory });
  },

  // 取得未繳費住戶
  async getUnpaid(communityId?: string): Promise<Resident[]> {
    const residents = await this.getAll(communityId);
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth() + 1;

    return residents.filter((r) => {
      const currentPayment = r.paymentHistory?.find(
        (p) => p.year === currentYear && p.month === currentMonth
      );
      return !currentPayment?.paid;
    });
  },
};

// ==================== 廠商 CRUD ====================
export const vendorsService = {
  // 取得所有廠商（優先使用 REST API）
  async getAll(communityId?: string): Promise<Vendor[]> {
    try {
      console.log('使用 REST API 讀取廠商資料...');
      const vendors = await fetchWithRest<Vendor>(COLLECTIONS.VENDORS);
      console.log('REST API 讀取廠商成功，筆數:', vendors.length);
      
      const filtered = communityId 
        ? vendors.filter(v => (v as any).communityId === communityId)
        : vendors;
      
      return filtered.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
    } catch (error) {
      console.error('REST API 失敗，嘗試使用 SDK:', error);
      
      const ref = collection(db, COLLECTIONS.VENDORS);
      const snapshot = communityId
        ? await getDocs(query(ref, where('communityId', '==', communityId)))
        : await getDocs(ref);

      const vendors = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Vendor[];

      return vendors.sort((a, b) => a.name.localeCompare(b.name));
    }
  },

  // 取得單一廠商
  async getById(id: string): Promise<Vendor | null> {
    const docRef = doc(db, COLLECTIONS.VENDORS, id);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() } as Vendor;
  },

  // 新增廠商
  async create(data: Omit<Vendor, 'id'>): Promise<string> {
    const ref = collection(db, COLLECTIONS.VENDORS);
    const docRef = await addDoc(ref, {
      ...data,
      invoices: [],
      serviceRecords: [],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  },

  // 更新廠商
  async update(id: string, data: Partial<Vendor>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.VENDORS, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  },

  // 刪除廠商
  async delete(id: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.VENDORS, id);
    await deleteDoc(docRef);
  },

  // 新增單據
  async addInvoice(vendorId: string, invoice: Omit<Invoice, 'id'>): Promise<void> {
    const vendor = await this.getById(vendorId);
    if (!vendor) throw new Error('廠商不存在');

    const invoices = vendor.invoices || [];
    const newInvoice: Invoice = {
      ...invoice,
      id: `INV${Date.now()}`,
    };
    invoices.push(newInvoice);

    await this.update(vendorId, { invoices });
  },

  // 新增服務紀錄
  async addServiceRecord(vendorId: string, record: ServiceRecord): Promise<void> {
    const vendor = await this.getById(vendorId);
    if (!vendor) throw new Error('廠商不存在');

    const serviceRecords = vendor.serviceRecords || [];
    serviceRecords.push(record);

    await this.update(vendorId, { serviceRecords });
  },
};

// ==================== 維修單 CRUD ====================
export const repairsService = {
  // 取得所有維修單（優先使用 REST API）
  async getAll(communityId?: string): Promise<RepairTicket[]> {
    try {
      console.log('使用 REST API 讀取維修單資料...');
      const repairs = await fetchWithRest<RepairTicket>(COLLECTIONS.REPAIRS);
      console.log('REST API 讀取維修單成功，筆數:', repairs.length);
      
      const filtered = communityId 
        ? repairs.filter(r => (r as any).communityId === communityId)
        : repairs;
      
      return filtered.sort((a, b) => (b.reportedDate || '').localeCompare(a.reportedDate || ''));
    } catch (error) {
      console.error('REST API 失敗，嘗試使用 SDK:', error);
      
      const ref = collection(db, COLLECTIONS.REPAIRS);
      const snapshot = communityId
        ? await getDocs(query(ref, where('communityId', '==', communityId)))
        : await getDocs(ref);

      const repairs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as RepairTicket[];

      return repairs.sort((a, b) => b.reportedDate.localeCompare(a.reportedDate));
    }
  },

  // 取得單一維修單
  async getById(id: string): Promise<RepairTicket | null> {
    const docRef = doc(db, COLLECTIONS.REPAIRS, id);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() } as RepairTicket;
  },

  // 新增維修單
  async create(data: Omit<RepairTicket, 'id'>): Promise<string> {
    const ref = collection(db, COLLECTIONS.REPAIRS);
    const docRef = await addDoc(ref, {
      ...data,
      status: 'pending',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  },

  // 更新維修單
  async update(id: string, data: Partial<RepairTicket>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.REPAIRS, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  },

  // 刪除維修單
  async delete(id: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.REPAIRS, id);
    await deleteDoc(docRef);
  },

  // 依狀態取得維修單
  async getByStatus(status: string, communityId?: string): Promise<RepairTicket[]> {
    const ref = collection(db, COLLECTIONS.REPAIRS);
    const constraints = [where('status', '==', status)];

    if (communityId) {
      constraints.push(where('communityId', '==', communityId));
    }

    const q = query(ref, ...constraints);
    const snapshot = await getDocs(q);

    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as RepairTicket[];
  },
};

// ==================== 會議 CRUD ====================
export const meetingsService = {
  // 取得所有會議（優先使用 REST API）
  async getAll(communityId?: string): Promise<Meeting[]> {
    try {
      console.log('使用 REST API 讀取會議資料...');
      const meetings = await fetchWithRest<Meeting>(COLLECTIONS.MEETINGS);
      console.log('REST API 讀取會議成功，筆數:', meetings.length);
      
      const filtered = communityId 
        ? meetings.filter(m => (m as any).communityId === communityId)
        : meetings;
      
      return filtered.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    } catch (error) {
      console.error('REST API 失敗，嘗試使用 SDK:', error);
      
      const ref = collection(db, COLLECTIONS.MEETINGS);
      const snapshot = communityId
        ? await getDocs(query(ref, where('communityId', '==', communityId)))
        : await getDocs(ref);

      const meetings = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Meeting[];

      return meetings.sort((a, b) => b.date.localeCompare(a.date));
    }
  },

  // 取得單一會議
  async getById(id: string): Promise<Meeting | null> {
    const docRef = doc(db, COLLECTIONS.MEETINGS, id);
    const snapshot = await getDoc(docRef);

    if (!snapshot.exists()) return null;
    return { id: snapshot.id, ...snapshot.data() } as Meeting;
  },

  // 新增會議
  async create(data: Omit<Meeting, 'id'>): Promise<string> {
    const ref = collection(db, COLLECTIONS.MEETINGS);
    const docRef = await addDoc(ref, {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
    });
    return docRef.id;
  },

  // 更新會議
  async update(id: string, data: Partial<Meeting>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.MEETINGS, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now(),
    });
  },

  // 刪除會議
  async delete(id: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.MEETINGS, id);
    await deleteDoc(docRef);
  },
};

// 匯出 Firebase 實例
export { db, app };

// 匯出所有服務
export const firebaseServices = {
  residents: residentsService,
  vendors: vendorsService,
  repairs: repairsService,
  meetings: meetingsService,
};

export default firebaseServices;

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
  serverTimestamp,
} from 'firebase/firestore';
import type {
  Resident,
  Vendor,
  RepairTicket,
  Meeting,
} from '@/types';

// ==================== Firebase 初始化 ====================
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Collection 名稱
const COLLECTIONS = {
  RESIDENTS: 'residents',
  VENDORS: 'vendors',
  REPAIRS: 'repairs',
  MEETINGS: 'meetings',
} as const;

// ==================== 共用工具 ====================
// Firestore 文件轉型別
function docToData<T>(doc: any): T {
  return { id: doc.id, ...doc.data() } as T;
}

// ==================== 住戶服務 ====================
export const residentsService = {
  async getAll(): Promise<Resident[]> {
    const ref = collection(db, COLLECTIONS.RESIDENTS);
    const snapshot = await getDocs(ref);
    return snapshot.docs
      .map((d) => docToData<Resident>(d))
      .sort((a, b) => a.unit.localeCompare(b.unit));
  },

  async getById(id: string): Promise<Resident | null> {
    const docRef = doc(db, COLLECTIONS.RESIDENTS, id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return docToData<Resident>(snapshot);
  },

  async create(data: Omit<Resident, 'id'>): Promise<string> {
    const ref = collection(db, COLLECTIONS.RESIDENTS);
    const docRef = await addDoc(ref, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async update(id: string, data: Partial<Resident>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.RESIDENTS, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },

  async delete(id: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.RESIDENTS, id);
    await deleteDoc(docRef);
  },
};

// ==================== 廠商服務 ====================
export const vendorsService = {
  async getAll(): Promise<Vendor[]> {
    const ref = collection(db, COLLECTIONS.VENDORS);
    const snapshot = await getDocs(ref);
    return snapshot.docs
      .map((d) => docToData<Vendor>(d))
      .sort((a, b) => a.name.localeCompare(b.name));
  },

  async getById(id: string): Promise<Vendor | null> {
    const docRef = doc(db, COLLECTIONS.VENDORS, id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return docToData<Vendor>(snapshot);
  },

  async create(data: Omit<Vendor, 'id'>): Promise<string> {
    const ref = collection(db, COLLECTIONS.VENDORS);
    const docRef = await addDoc(ref, {
      ...data,
      invoices: data.invoices || [],
      serviceRecords: data.serviceRecords || [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async update(id: string, data: Partial<Vendor>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.VENDORS, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },

  async delete(id: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.VENDORS, id);
    await deleteDoc(docRef);
  },
};

// ==================== 維修單服務 ====================
export const repairsService = {
  async getAll(): Promise<RepairTicket[]> {
    const ref = collection(db, COLLECTIONS.REPAIRS);
    const snapshot = await getDocs(ref);
    return snapshot.docs
      .map((d) => docToData<RepairTicket>(d))
      .sort((a, b) => b.reportedDate.localeCompare(a.reportedDate));
  },

  async getById(id: string): Promise<RepairTicket | null> {
    const docRef = doc(db, COLLECTIONS.REPAIRS, id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return docToData<RepairTicket>(snapshot);
  },

  async create(data: Omit<RepairTicket, 'id'>): Promise<string> {
    const ref = collection(db, COLLECTIONS.REPAIRS);
    const docRef = await addDoc(ref, {
      ...data,
      status: data.status || 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async update(id: string, data: Partial<RepairTicket>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.REPAIRS, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },

  async delete(id: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.REPAIRS, id);
    await deleteDoc(docRef);
  },
};

// ==================== 會議服務 ====================
export const meetingsService = {
  async getAll(): Promise<Meeting[]> {
    const ref = collection(db, COLLECTIONS.MEETINGS);
    const snapshot = await getDocs(ref);
    return snapshot.docs
      .map((d) => docToData<Meeting>(d))
      .sort((a, b) => b.date.localeCompare(a.date));
  },

  async getById(id: string): Promise<Meeting | null> {
    const docRef = doc(db, COLLECTIONS.MEETINGS, id);
    const snapshot = await getDoc(docRef);
    if (!snapshot.exists()) return null;
    return docToData<Meeting>(snapshot);
  },

  async create(data: Omit<Meeting, 'id'>): Promise<string> {
    const ref = collection(db, COLLECTIONS.MEETINGS);
    const docRef = await addDoc(ref, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  },

  async update(id: string, data: Partial<Meeting>): Promise<void> {
    const docRef = doc(db, COLLECTIONS.MEETINGS, id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  },

  async delete(id: string): Promise<void> {
    const docRef = doc(db, COLLECTIONS.MEETINGS, id);
    await deleteDoc(docRef);
  },
};

// ==================== 匯出 ====================
export { db, app };

export const firebaseServices = {
  residents: residentsService,
  vendors: vendorsService,
  repairs: repairsService,
  meetings: meetingsService,
};

export default firebaseServices;

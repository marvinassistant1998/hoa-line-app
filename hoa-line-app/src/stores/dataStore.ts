import { create } from 'zustand';
import type { Resident, Vendor, RepairTicket, Meeting } from '@/types';
import { residentsService, vendorsService, repairsService, meetingsService } from '@/services/firebase';
import { mockResidents, mockVendors, mockRepairs, mockMeetings } from '@/data/mockData';

// 判斷是否使用 Mock 資料（Firebase 未設定時）
const USE_MOCK = !import.meta.env.VITE_FIREBASE_API_KEY;

interface DataState {
  // 資料
  residents: Resident[];
  vendors: Vendor[];
  repairs: RepairTicket[];
  meetings: Meeting[];

  // 狀態
  isLoading: boolean;
  error: string | null;

  // 住戶動作
  fetchResidents: () => Promise<void>;
  addResident: (data: Omit<Resident, 'id'>) => Promise<void>;
  updateResident: (id: string, data: Partial<Resident>) => Promise<void>;
  deleteResident: (id: string) => Promise<void>;

  // 廠商動作
  fetchVendors: () => Promise<void>;
  addVendor: (data: Omit<Vendor, 'id'>) => Promise<void>;
  updateVendor: (id: string, data: Partial<Vendor>) => Promise<void>;
  deleteVendor: (id: string) => Promise<void>;

  // 維修單動作
  fetchRepairs: () => Promise<void>;
  addRepair: (data: Omit<RepairTicket, 'id'>) => Promise<void>;
  updateRepair: (id: string, data: Partial<RepairTicket>) => Promise<void>;
  deleteRepair: (id: string) => Promise<void>;

  // 會議動作
  fetchMeetings: () => Promise<void>;
  addMeeting: (data: Omit<Meeting, 'id'>) => Promise<void>;
  updateMeeting: (id: string, data: Partial<Meeting>) => Promise<void>;
  deleteMeeting: (id: string) => Promise<void>;

  // 初始化
  initializeData: () => Promise<void>;
}

export const useDataStore = create<DataState>((set, get) => ({
  // 初始狀態
  residents: [],
  vendors: [],
  repairs: [],
  meetings: [],
  isLoading: false,
  error: null,

  // ==================== 住戶 ====================
  fetchResidents: async () => {
    set({ isLoading: true, error: null });
    try {
      if (USE_MOCK) {
        console.log('使用 Mock 資料');
        set({ residents: mockResidents, isLoading: false });
      } else {
        console.log('從 Firebase 讀取住戶資料...');
        // 加入 15 秒超時機制
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('讀取超時（15秒）')), 15000)
        );
        const residents = await Promise.race([
          residentsService.getAll().then(data => {
            console.log('Firebase 讀取成功，筆數:', data.length);
            return data;
          }),
          timeoutPromise,
        ]);
        set({ residents, isLoading: false });
      }
    } catch (error) {
      console.error('fetchResidents error:', error);
      // 發生錯誤時顯示空列表
      set({ residents: [], error: (error as Error).message, isLoading: false });
    }
  },

  addResident: async (data) => {
    set({ isLoading: true, error: null });
    try {
      if (USE_MOCK) {
        const newResident = { ...data, id: `R${Date.now()}` } as Resident;
        set((state) => ({
          residents: [...state.residents, newResident],
          isLoading: false,
        }));
      } else {
        // 加入 10 秒超時機制（寫入需要更長時間）
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('寫入超時')), 10000)
        );
        const id = await Promise.race([
          residentsService.create(data),
          timeoutPromise,
        ]);
        const newResident = { ...data, id } as Resident;
        set((state) => ({
          residents: [...state.residents, newResident],
          isLoading: false,
        }));
      }
    } catch (error) {
      console.error('addResident error:', error);
      set({ error: (error as Error).message, isLoading: false });
      throw error; // 重新拋出錯誤讓 UI 層知道
    }
  },

  updateResident: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      if (!USE_MOCK) {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('更新超時')), 10000)
        );
        await Promise.race([
          residentsService.update(id, data),
          timeoutPromise,
        ]);
      }
      set((state) => ({
        residents: state.residents.map((r) =>
          r.id === id ? { ...r, ...data } : r
        ),
        isLoading: false,
      }));
    } catch (error) {
      console.error('updateResident error:', error);
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  deleteResident: async (id) => {
    set({ isLoading: true, error: null });
    try {
      if (!USE_MOCK) {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('刪除超時')), 10000)
        );
        await Promise.race([
          residentsService.delete(id),
          timeoutPromise,
        ]);
      }
      set((state) => ({
        residents: state.residents.filter((r) => r.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      console.error('deleteResident error:', error);
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  // ==================== 廠商 ====================
  fetchVendors: async () => {
    set({ isLoading: true, error: null });
    try {
      if (USE_MOCK) {
        set({ vendors: mockVendors, isLoading: false });
      } else {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('連線超時')), 5000)
        );
        const vendors = await Promise.race([
          vendorsService.getAll(),
          timeoutPromise,
        ]);
        set({ vendors, isLoading: false });
      }
    } catch (error) {
      console.error('fetchVendors error:', error);
      set({ vendors: [], error: (error as Error).message, isLoading: false });
    }
  },

  addVendor: async (data) => {
    set({ isLoading: true, error: null });
    try {
      if (USE_MOCK) {
        const newVendor = { ...data, id: `V${Date.now()}` } as Vendor;
        set((state) => ({
          vendors: [...state.vendors, newVendor],
          isLoading: false,
        }));
      } else {
        const id = await vendorsService.create(data);
        const newVendor = { ...data, id } as Vendor;
        set((state) => ({
          vendors: [...state.vendors, newVendor],
          isLoading: false,
        }));
      }
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateVendor: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      if (!USE_MOCK) {
        await vendorsService.update(id, data);
      }
      set((state) => ({
        vendors: state.vendors.map((v) =>
          v.id === id ? { ...v, ...data } : v
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  deleteVendor: async (id) => {
    set({ isLoading: true, error: null });
    try {
      if (!USE_MOCK) {
        await vendorsService.delete(id);
      }
      set((state) => ({
        vendors: state.vendors.filter((v) => v.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  // ==================== 維修單 ====================
  fetchRepairs: async () => {
    set({ isLoading: true, error: null });
    try {
      if (USE_MOCK) {
        set({ repairs: mockRepairs, isLoading: false });
      } else {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('連線超時')), 5000)
        );
        const repairs = await Promise.race([
          repairsService.getAll(),
          timeoutPromise,
        ]);
        set({ repairs, isLoading: false });
      }
    } catch (error) {
      console.error('fetchRepairs error:', error);
      set({ repairs: [], error: (error as Error).message, isLoading: false });
    }
  },

  addRepair: async (data) => {
    set({ isLoading: true, error: null });
    try {
      if (USE_MOCK) {
        const newRepair = { ...data, id: `RP${Date.now()}` } as RepairTicket;
        set((state) => ({
          repairs: [...state.repairs, newRepair],
          isLoading: false,
        }));
      } else {
        const id = await repairsService.create(data);
        const newRepair = { ...data, id } as RepairTicket;
        set((state) => ({
          repairs: [...state.repairs, newRepair],
          isLoading: false,
        }));
      }
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateRepair: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      if (!USE_MOCK) {
        await repairsService.update(id, data);
      }
      set((state) => ({
        repairs: state.repairs.map((r) =>
          r.id === id ? { ...r, ...data } : r
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  deleteRepair: async (id) => {
    set({ isLoading: true, error: null });
    try {
      if (!USE_MOCK) {
        await repairsService.delete(id);
      }
      set((state) => ({
        repairs: state.repairs.filter((r) => r.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  // ==================== 會議 ====================
  fetchMeetings: async () => {
    set({ isLoading: true, error: null });
    try {
      if (USE_MOCK) {
        set({ meetings: mockMeetings, isLoading: false });
      } else {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('連線超時')), 5000)
        );
        const meetings = await Promise.race([
          meetingsService.getAll(),
          timeoutPromise,
        ]);
        set({ meetings, isLoading: false });
      }
    } catch (error) {
      console.error('fetchMeetings error:', error);
      set({ meetings: [], error: (error as Error).message, isLoading: false });
    }
  },

  addMeeting: async (data) => {
    set({ isLoading: true, error: null });
    try {
      if (USE_MOCK) {
        const newMeeting = { ...data, id: `M${Date.now()}` } as Meeting;
        set((state) => ({
          meetings: [...state.meetings, newMeeting],
          isLoading: false,
        }));
      } else {
        const id = await meetingsService.create(data);
        const newMeeting = { ...data, id } as Meeting;
        set((state) => ({
          meetings: [...state.meetings, newMeeting],
          isLoading: false,
        }));
      }
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateMeeting: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      if (!USE_MOCK) {
        await meetingsService.update(id, data);
      }
      set((state) => ({
        meetings: state.meetings.map((m) =>
          m.id === id ? { ...m, ...data } : m
        ),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  deleteMeeting: async (id) => {
    set({ isLoading: true, error: null });
    try {
      if (!USE_MOCK) {
        await meetingsService.delete(id);
      }
      set((state) => ({
        meetings: state.meetings.filter((m) => m.id !== id),
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  // ==================== 初始化 ====================
  initializeData: async () => {
    const { fetchResidents, fetchVendors, fetchRepairs, fetchMeetings } = get();
    await Promise.all([
      fetchResidents(),
      fetchVendors(),
      fetchRepairs(),
      fetchMeetings(),
    ]);
  },
}));

export default useDataStore;

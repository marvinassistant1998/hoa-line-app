import { create } from 'zustand';
import type { Resident, Vendor, RepairTicket, Meeting } from '@/types';
import { residentsService, vendorsService, repairsService, meetingsService } from '@/services/firebase';
import { mockResidents, mockVendors, mockRepairs, mockMeetings } from '@/data/mockData';

// 當 Firebase API Key 未設定時，使用 Mock 資料
const USE_MOCK = !import.meta.env.VITE_FIREBASE_API_KEY;

// 統一的超時包裝
function withTimeout<T>(promise: Promise<T>, ms: number, label: string): Promise<T> {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`${label}超時（${ms / 1000}秒）`)), ms)
    ),
  ]);
}

interface DataState {
  residents: Resident[];
  vendors: Vendor[];
  repairs: RepairTicket[];
  meetings: Meeting[];
  isLoading: boolean;
  error: string | null;

  // 住戶
  fetchResidents: () => Promise<void>;
  addResident: (data: Omit<Resident, 'id'>) => Promise<void>;
  updateResident: (id: string, data: Partial<Resident>) => Promise<void>;
  deleteResident: (id: string) => Promise<void>;

  // 廠商
  fetchVendors: () => Promise<void>;
  addVendor: (data: Omit<Vendor, 'id'>) => Promise<void>;
  updateVendor: (id: string, data: Partial<Vendor>) => Promise<void>;
  deleteVendor: (id: string) => Promise<void>;

  // 維修單
  fetchRepairs: () => Promise<void>;
  addRepair: (data: Omit<RepairTicket, 'id'>) => Promise<void>;
  updateRepair: (id: string, data: Partial<RepairTicket>) => Promise<void>;
  deleteRepair: (id: string) => Promise<void>;

  // 會議
  fetchMeetings: () => Promise<void>;
  addMeeting: (data: Omit<Meeting, 'id'>) => Promise<void>;
  updateMeeting: (id: string, data: Partial<Meeting>) => Promise<void>;
  deleteMeeting: (id: string) => Promise<void>;

  // 初始化
  initializeData: () => Promise<void>;
}

export const useDataStore = create<DataState>((set, get) => ({
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
        set({ residents: mockResidents, isLoading: false });
      } else {
        const residents = await withTimeout(residentsService.getAll(), 15000, '讀取住戶');
        set({ residents, isLoading: false });
      }
    } catch (error) {
      console.error('fetchResidents error:', error);
      set({ residents: USE_MOCK ? mockResidents : [], error: (error as Error).message, isLoading: false });
    }
  },

  addResident: async (data) => {
    set({ isLoading: true, error: null });
    try {
      if (USE_MOCK) {
        const newResident = { ...data, id: `R${Date.now()}` } as Resident;
        set((state) => ({ residents: [...state.residents, newResident], isLoading: false }));
      } else {
        const id = await withTimeout(residentsService.create(data), 10000, '新增住戶');
        const newResident = { ...data, id } as Resident;
        set((state) => ({ residents: [...state.residents, newResident], isLoading: false }));
      }
    } catch (error) {
      console.error('addResident error:', error);
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  updateResident: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      if (!USE_MOCK) {
        await withTimeout(residentsService.update(id, data), 10000, '更新住戶');
      }
      set((state) => ({
        residents: state.residents.map((r) => (r.id === id ? { ...r, ...data } : r)),
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
        await withTimeout(residentsService.delete(id), 10000, '刪除住戶');
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
        const vendors = await withTimeout(vendorsService.getAll(), 15000, '讀取廠商');
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
        set((state) => ({ vendors: [...state.vendors, newVendor], isLoading: false }));
      } else {
        const id = await withTimeout(vendorsService.create(data), 10000, '新增廠商');
        const newVendor = { ...data, id } as Vendor;
        set((state) => ({ vendors: [...state.vendors, newVendor], isLoading: false }));
      }
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateVendor: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      if (!USE_MOCK) {
        await withTimeout(vendorsService.update(id, data), 10000, '更新廠商');
      }
      set((state) => ({
        vendors: state.vendors.map((v) => (v.id === id ? { ...v, ...data } : v)),
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
        await withTimeout(vendorsService.delete(id), 10000, '刪除廠商');
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
        const repairs = await withTimeout(repairsService.getAll(), 15000, '讀取維修單');
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
        set((state) => ({ repairs: [...state.repairs, newRepair], isLoading: false }));
      } else {
        const id = await withTimeout(repairsService.create(data), 10000, '新增維修單');
        const newRepair = { ...data, id } as RepairTicket;
        set((state) => ({ repairs: [...state.repairs, newRepair], isLoading: false }));
      }
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateRepair: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      if (!USE_MOCK) {
        await withTimeout(repairsService.update(id, data), 10000, '更新維修單');
      }
      set((state) => ({
        repairs: state.repairs.map((r) => (r.id === id ? { ...r, ...data } : r)),
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
        await withTimeout(repairsService.delete(id), 10000, '刪除維修單');
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
        const meetings = await withTimeout(meetingsService.getAll(), 15000, '讀取會議');
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
        set((state) => ({ meetings: [...state.meetings, newMeeting], isLoading: false }));
      } else {
        const id = await withTimeout(meetingsService.create(data), 10000, '新增會議');
        const newMeeting = { ...data, id } as Meeting;
        set((state) => ({ meetings: [...state.meetings, newMeeting], isLoading: false }));
      }
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },

  updateMeeting: async (id, data) => {
    set({ isLoading: true, error: null });
    try {
      if (!USE_MOCK) {
        await withTimeout(meetingsService.update(id, data), 10000, '更新會議');
      }
      set((state) => ({
        meetings: state.meetings.map((m) => (m.id === id ? { ...m, ...data } : m)),
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
        await withTimeout(meetingsService.delete(id), 10000, '刪除會議');
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

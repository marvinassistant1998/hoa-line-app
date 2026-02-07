import { create } from 'zustand';
import type { LineUserProfile, Resident, Vendor, ResidentRoleLabel } from '@/types';
import { liffService } from '@/services/liff';
import { residentsService } from '@/services/firebase';

type RegistrationStatus = 'unknown' | 'registered' | 'unregistered';

interface AppState {
  // LIFF 狀態
  isLiffInitialized: boolean;
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;
  userProfile: LineUserProfile | null;

  // 角色與權限
  userRole: ResidentRoleLabel | null;
  currentResidentId: string | null;
  currentResident: Resident | null;
  registrationStatus: RegistrationStatus;

  // 導航狀態
  currentScreen: string;
  selectedResident: Resident | null;
  selectedVendor: Vendor | null;

  // 動作
  initializeLiff: () => Promise<void>;
  detectUserRole: (lineUserId: string) => Promise<void>;
  setCurrentScreen: (screen: string) => void;
  setSelectedResident: (resident: Resident | null) => void;
  setSelectedVendor: (vendor: Vendor | null) => void;
  handleBack: (screen: string) => void;

  // 開發用：手動切換角色
  devSetRole: (role: ResidentRoleLabel) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // 初始狀態
  isLiffInitialized: false,
  isLoggedIn: false,
  isLoading: true,
  error: null,
  userProfile: null,

  // 角色初始狀態
  userRole: null,
  currentResidentId: null,
  currentResident: null,
  registrationStatus: 'unknown',

  currentScreen: 'home',
  selectedResident: null,
  selectedVendor: null,

  // 初始化 LIFF
  initializeLiff: async () => {
    try {
      set({ isLoading: true, error: null });

      await liffService.initialize();

      const isLoggedIn = liffService.isLoggedIn();
      let userProfile: LineUserProfile | null = null;

      if (isLoggedIn) {
        userProfile = await liffService.getProfile();
      }

      set({
        isLiffInitialized: true,
        isLoggedIn,
        userProfile,
        isLoading: false,
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'LIFF 初始化失敗';
      set({
        isLiffInitialized: false,
        isLoading: false,
        error: errorMessage,
      });
    }
  },

  // 偵測用戶角色
  detectUserRole: async (lineUserId: string) => {
    try {
      const residents = await residentsService.getAll();
      const matched = residents.find(
        (r) => r.lineUserId === lineUserId || r.lineId === lineUserId
      );

      if (matched) {
        set({
          userRole: matched.role,
          currentResidentId: matched.id,
          currentResident: matched,
          registrationStatus: 'registered',
        });
      } else {
        set({
          userRole: null,
          currentResidentId: null,
          currentResident: null,
          registrationStatus: 'unregistered',
        });
      }
    } catch (error) {
      console.error('角色偵測失敗:', error);
      // 偵測失敗時預設為住戶，不阻擋使用
      set({
        userRole: '住戶',
        registrationStatus: 'unregistered',
      });
    }
  },

  // 開發用：手動切換角色
  devSetRole: (role: ResidentRoleLabel) => {
    set({ userRole: role, registrationStatus: 'registered' });
  },

  // 設定當前畫面
  setCurrentScreen: (screen) => {
    set({ currentScreen: screen, selectedResident: null, selectedVendor: null });
  },

  // 設定選中的住戶
  setSelectedResident: (resident) => {
    set({ selectedResident: resident });
  },

  // 設定選中的廠商
  setSelectedVendor: (vendor) => {
    set({ selectedVendor: vendor });
  },

  // 處理返回
  handleBack: (screen) => {
    set({ currentScreen: screen, selectedResident: null, selectedVendor: null });
  },
}));

export default useAppStore;

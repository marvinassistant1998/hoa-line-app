import { create } from 'zustand';
import type { LineUserProfile, Resident, Vendor } from '@/types';
import { liffService } from '@/services/liff';

interface AppState {
  // LIFF 狀態
  isLiffInitialized: boolean;
  isLoggedIn: boolean;
  isLoading: boolean;
  error: string | null;
  userProfile: LineUserProfile | null;

  // 導航狀態
  currentScreen: string;
  selectedResident: Resident | null;
  selectedVendor: Vendor | null;

  // 動作
  initializeLiff: () => Promise<void>;
  setCurrentScreen: (screen: string) => void;
  setSelectedResident: (resident: Resident | null) => void;
  setSelectedVendor: (vendor: Vendor | null) => void;
  handleBack: (screen: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  // 初始狀態
  isLiffInitialized: false,
  isLoggedIn: false,
  isLoading: true,
  error: null,
  userProfile: null,
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

import { create } from 'zustand';

interface ToastState {
  message: string;
  visible: boolean;
  showToast: (msg: string) => void;
}

export const useToastStore = create<ToastState>((set) => ({
  message: '',
  visible: false,
  showToast: (msg: string) => {
    set({ message: msg, visible: true });
    setTimeout(() => {
      set({ visible: false });
    }, 2000);
  },
}));

export const showToast = (msg: string) => {
  useToastStore.getState().showToast(msg);
};

import liff from '@line/liff';
import type { LineUserProfile } from '@/types';

// 暫時硬編碼 LIFF ID，避免環境變數換行問題
const LIFF_ID = '2009004300-wqzTZcHc';

export interface LiffService {
  initialize: () => Promise<void>;
  isLoggedIn: () => boolean;
  login: () => void;
  logout: () => void;
  getProfile: () => Promise<LineUserProfile | null>;
  sendMessage: (message: string) => Promise<void>;
  shareMessage: (message: string) => Promise<void>;
  closeWindow: () => void;
  isInClient: () => boolean;
}

class LiffServiceImpl implements LiffService {
  private initialized = false;

  async initialize(): Promise<void> {
    if (this.initialized) return;

    try {
      await liff.init({ liffId: LIFF_ID });
      this.initialized = true;
      console.log('LIFF 初始化成功');
    } catch (error) {
      console.error('LIFF 初始化失敗:', error);
      throw error;
    }
  }

  isLoggedIn(): boolean {
    return liff.isLoggedIn();
  }

  login(): void {
    if (!liff.isLoggedIn()) {
      liff.login();
    }
  }

  logout(): void {
    if (liff.isLoggedIn()) {
      liff.logout();
      window.location.reload();
    }
  }

  async getProfile(): Promise<LineUserProfile | null> {
    try {
      if (!liff.isLoggedIn()) {
        return null;
      }

      const profile = await liff.getProfile();
      return {
        userId: profile.userId,
        displayName: profile.displayName,
        pictureUrl: profile.pictureUrl,
        statusMessage: profile.statusMessage,
      };
    } catch (error) {
      console.error('取得使用者資料失敗:', error);
      return null;
    }
  }

  async sendMessage(message: string): Promise<void> {
    try {
      if (!liff.isInClient()) {
        console.warn('不在 LINE 內部，無法發送訊息');
        return;
      }

      await liff.sendMessages([
        {
          type: 'text',
          text: message,
        },
      ]);
    } catch (error) {
      console.error('發送訊息失敗:', error);
      throw error;
    }
  }

  async shareMessage(message: string): Promise<void> {
    try {
      if (!liff.isApiAvailable('shareTargetPicker')) {
        console.warn('shareTargetPicker 不可用');
        return;
      }

      await liff.shareTargetPicker([
        {
          type: 'text',
          text: message,
        },
      ]);
    } catch (error) {
      console.error('分享訊息失敗:', error);
      throw error;
    }
  }

  closeWindow(): void {
    liff.closeWindow();
  }

  isInClient(): boolean {
    return liff.isInClient();
  }
}

export const liffService = new LiffServiceImpl();

// 催繳訊息模板
export const createPaymentReminderMessage = (
  residentName: string,
  unit: string,
  amount: number,
  months: string[]
): string => {
  return `【管理費繳納提醒】

親愛的 ${residentName} 住戶您好：

您的住戶（${unit}）尚有以下月份的管理費未繳納：
${months.map((m) => `• ${m}`).join('\n')}

未繳金額：NT$ ${amount.toLocaleString()}

請您盡快完成繳款，如有任何問題請與管委會聯繫。

感謝您的配合！
幸福社區管委會`;
};

// 維修通知訊息模板
export const createRepairNotificationMessage = (
  title: string,
  description: string,
  status: string
): string => {
  const statusText = {
    pending: '待處理',
    in_progress: '處理中',
    completed: '已完成',
  }[status] || status;

  return `【維修進度通知】

項目：${title}
說明：${description}
狀態：${statusText}

如有任何問題請與管委會聯繫。

幸福社區管委會`;
};

export default liffService;

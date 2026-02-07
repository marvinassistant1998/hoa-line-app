# 管委會 AI 虛擬總幹事 - LINE LIFF App 專案指令

## 專案背景

這是一個為台灣小型社區（30-150戶）管委會設計的 LINE LIFF App。目標是自動化管委會的重複性行政工作，讓沒有專職總幹事的社區委員能更輕鬆管理社區事務。

## 目前進度

我已經有一個 React prototype（v6），包含以下功能的 UI：
- 首頁儀表板（待辦事項、管理費收繳進度、維修追蹤）
- 住戶管理（列表、搜尋、篩選、詳情、繳費歷史、LINE 催繳）
- 廠商管理（列表、詳情、單據上傳、服務紀錄、評價）
- 設定頁（方案管理、使用量統計、管理者管理）

Prototype 檔案我會放在專案資料夾中。

## 請幫我完成

### 1. 建立專案架構

使用以下技術：
- **框架**: Vite + React + TypeScript
- **樣式**: Tailwind CSS
- **路由**: React Router
- **狀態管理**: Zustand 或 React Context
- **LINE LIFF SDK**: @line/liff

專案結構建議：
```
hoa-line-app/
├── src/
│   ├── components/     # 共用元件
│   ├── screens/        # 頁面
│   ├── hooks/          # Custom hooks
│   ├── stores/         # 狀態管理
│   ├── services/       # API 呼叫
│   ├── types/          # TypeScript 型別
│   ├── utils/          # 工具函數
│   └── assets/         # 圖片等資源
├── public/
└── ...config files
```

### 2. 整合 LINE LIFF

- 初始化 LIFF SDK
- 取得用戶資料（LINE userId, displayName, pictureUrl）
- 實作「發送訊息到聊天室」功能（用於催繳通知、公告）
- 實作「分享」功能

LIFF 初始化範例：
```typescript
import liff from '@line/liff';

const initializeLiff = async () => {
  try {
    await liff.init({ liffId: import.meta.env.VITE_LIFF_ID });
    if (!liff.isLoggedIn()) {
      liff.login();
    }
  } catch (error) {
    console.error('LIFF 初始化失敗', error);
  }
};
```

### 3. 後端/資料庫（第二階段）

初期使用 Firebase 或 Supabase：
- **Authentication**: LINE Login
- **Database**: Firestore 或 Supabase PostgreSQL
- **Storage**: 用於上傳單據照片、會議錄音

資料結構：
```typescript
// 社區
interface Community {
  id: string;
  name: string;
  address: string;
  totalUnits: number;
  monthlyFee: number;
  createdAt: Date;
}

// 住戶
interface Resident {
  id: string;
  communityId: string;
  unit: string;
  name: string;
  phone: string;
  lineUserId?: string;
  role: 'resident' | 'chairman' | 'treasurer' | 'supervisor';
  moveInDate: Date;
}

// 繳費紀錄
interface Payment {
  id: string;
  residentId: string;
  year: number;
  month: number;
  amount: number;
  paid: boolean;
  paidDate?: Date;
}

// 廠商
interface Vendor {
  id: string;
  communityId: string;
  name: string;
  category: string;
  contact: string;
  phone: string;
  lineId?: string;
  rating: number;
  notes?: string;
}

// 維修單
interface RepairTicket {
  id: string;
  communityId: string;
  title: string;
  description: string;
  reportedBy: string;
  reportedDate: Date;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  assignedVendorId?: string;
  completedDate?: Date;
  cost?: number;
  photos: string[];
}

// 會議紀錄
interface Meeting {
  id: string;
  communityId: string;
  title: string;
  date: Date;
  duration: string;
  location: string;
  attendees: string[];
  absentees: string[];
  audioUrl?: string;
  transcript?: string;
  summary?: string;
  resolutions: string[];
}
```

### 4. 環境變數

建立 `.env` 檔案：
```
VITE_LIFF_ID=your-liff-id
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-auth-domain
VITE_FIREBASE_PROJECT_ID=your-project-id
```

### 5. 部署

使用 Vercel 部署：
- 連結 GitHub repo
- 設定環境變數
- 自動部署

## 開發順序建議

1. **Phase 1 - 基礎架構**（現在）
   - 建立專案、安裝依賴
   - 整合 prototype 程式碼
   - 設定路由
   - 確認可以本地運行

2. **Phase 2 - LIFF 整合**
   - 註冊 LINE Developers
   - 建立 LIFF App
   - 整合 LIFF SDK
   - 測試 LINE 登入

3. **Phase 3 - 後端整合**
   - 設定 Firebase/Supabase
   - 建立資料結構
   - 實作 CRUD API
   - 連接前端

4. **Phase 4 - 進階功能**
   - 會議錄音 + AI 轉文字
   - AI 財務報表產生
   - 推播通知

## 現有 Prototype 檔案說明

- `hoa-line-app-v6-preview.jsx` - 單檔完整版（可參考 UI 和邏輯）
- `App.jsx` - 主程式入口
- `icons.jsx` - SVG 圖示元件
- `components.jsx` - 共用 UI 元件（TabBar, Header, Card, Modal 等）
- `mockData.js` - 模擬資料
- `screens/HomeScreen.jsx` - 首頁
- `screens/ResidentsScreen.jsx` - 住戶管理
- `screens/VendorsScreen.jsx` - 廠商管理
- `screens/SettingsScreen.jsx` - 設定頁

## 請先執行

1. 初始化專案 `npm create vite@latest . -- --template react-ts`
2. 安裝依賴 `npm install`
3. 安裝額外套件 `npm install @line/liff react-router-dom zustand tailwindcss postcss autoprefixer`
4. 設定 Tailwind CSS
5. 將 prototype 轉換為 TypeScript 並整合進專案
6. 確認 `npm run dev` 可以正常運行

準備好後告訴我，我們再進行下一步！

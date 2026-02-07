// 社區
export interface Community {
  id: string;
  name: string;
  address: string;
  totalUnits: number;
  monthlyFee: number;
  floors?: number;
  unitsPerFloor?: number;
  latitude?: number;
  longitude?: number;
  createdBy?: string;
  createdAt: Date;
}

// 住戶角色
export type ResidentRole = 'resident' | 'chairman' | 'treasurer' | 'supervisor';
export type ResidentRoleLabel = '住戶' | '主委' | '財委' | '監委';

// 繳費紀錄
export interface PaymentRecord {
  year: number;
  month: number;
  paid: boolean;
  amount: number;
  paidDate: string | null;
}

// 住戶
export interface Resident {
  id: string;
  communityId?: string;
  unit: string;
  name: string;
  phone: string;
  lineId?: string;
  lineUserId?: string;
  role: ResidentRoleLabel;
  moveInDate: string;
  paymentHistory: PaymentRecord[];
}

// 單據
export interface Invoice {
  id: string;
  date: string;
  amount: number;
  description: string;
  image: string | null;
}

// 服務紀錄
export interface ServiceRecord {
  date: string;
  type: string;
  workers: number;
  duration: string;
  description: string;
  photos: string[];
}

// 廠商
export interface Vendor {
  id: string;
  communityId?: string;
  name: string;
  category: string;
  contact: string;
  phone: string;
  lineId?: string;
  contractStart: string | null;
  contractEnd: string | null;
  rating: number;
  notes?: string;
  invoices: Invoice[];
  serviceRecords: ServiceRecord[];
}

// 維修單狀態
export type RepairStatus = 'pending' | 'in_progress' | 'completed';
export type RepairPriority = 'low' | 'medium' | 'high';

// 維修單
export interface RepairTicket {
  id: string;
  communityId?: string;
  title: string;
  description: string;
  reportedBy: string;
  reportedDate: string;
  status: RepairStatus;
  priority: RepairPriority;
  assignedVendor: string | null;
  completedDate: string | null;
  cost: number | null;
  photos: string[];
}

// 會議紀錄
export interface Meeting {
  id: string;
  communityId?: string;
  title: string;
  date: string;
  time: string;
  duration: string;
  location: string;
  attendees: string[];
  absentees: string[];
  hasAudio: boolean;
  hasTranscript: boolean;
  transcript?: string;
  summary?: string;
  resolutions: string[];
}

// 文件
export interface Document {
  id: string;
  name: string;
  category: string;
  uploadDate: string;
  fileType: string;
  size: string;
}

// 提醒
export interface Alert {
  type: 'payment' | 'repair' | 'meeting';
  message: string;
  priority: 'low' | 'medium' | 'high';
}

// 方案類型
export type PlanType = 'free' | 'pro' | 'enterprise';

// 使用量
export interface Usage {
  meetings: number;
  maxMeetings: number;
  reports: number;
  maxReports: number;
}

// 管理者
export interface Admin {
  id: string;
  name: string;
  role: string;
  isOwner: boolean;
}

// LINE 使用者資料
export interface LineUserProfile {
  userId: string;
  displayName: string;
  pictureUrl?: string;
  statusMessage?: string;
}

// 應用程式狀態
export interface AppState {
  isLiffInitialized: boolean;
  isLoggedIn: boolean;
  userProfile: LineUserProfile | null;
  isLoading: boolean;
  error: string | null;
}

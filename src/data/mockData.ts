import type {
  Resident,
  Vendor,
  RepairTicket,
  Meeting,
  Document,
  Alert,
} from '@/types';

// 住戶資料
export const mockResidents: Resident[] = [
  {
    id: 'R001',
    unit: '3F-1',
    name: '王大明',
    phone: '0912-345-678',
    lineId: 'wang.daming',
    role: '主委',
    moveInDate: '2019-03-15',
    paymentHistory: [
      { year: 2024, month: 1, paid: true, amount: 2000, paidDate: '2024-01-05' },
      { year: 2024, month: 2, paid: true, amount: 2000, paidDate: '2024-02-03' },
      { year: 2024, month: 3, paid: true, amount: 2000, paidDate: '2024-03-08' },
      { year: 2024, month: 4, paid: false, amount: 2000, paidDate: null },
      { year: 2024, month: 5, paid: false, amount: 2000, paidDate: null },
    ],
  },
  {
    id: 'R002',
    unit: '5F-2',
    name: '李小華',
    phone: '0923-456-789',
    lineId: 'lee.xiaohua',
    role: '財委',
    moveInDate: '2020-06-01',
    paymentHistory: [
      { year: 2024, month: 1, paid: true, amount: 2000, paidDate: '2024-01-10' },
      { year: 2024, month: 2, paid: true, amount: 2000, paidDate: '2024-02-12' },
      { year: 2024, month: 3, paid: true, amount: 2000, paidDate: '2024-03-05' },
      { year: 2024, month: 4, paid: true, amount: 2000, paidDate: '2024-04-08' },
      { year: 2024, month: 5, paid: true, amount: 2000, paidDate: '2024-05-02' },
    ],
  },
  {
    id: 'R003',
    unit: '2F-1',
    name: '張美玲',
    phone: '0934-567-890',
    lineId: 'zhang.meiling',
    role: '住戶',
    moveInDate: '2021-01-20',
    paymentHistory: [
      { year: 2024, month: 1, paid: true, amount: 2000, paidDate: '2024-01-15' },
      { year: 2024, month: 2, paid: false, amount: 2000, paidDate: null },
      { year: 2024, month: 3, paid: false, amount: 2000, paidDate: null },
      { year: 2024, month: 4, paid: false, amount: 2000, paidDate: null },
      { year: 2024, month: 5, paid: false, amount: 2000, paidDate: null },
    ],
  },
  {
    id: 'R004',
    unit: '7F-1',
    name: '陳建宏',
    phone: '0945-678-901',
    lineId: 'chen.jianhong',
    role: '監委',
    moveInDate: '2018-09-10',
    paymentHistory: [
      { year: 2024, month: 1, paid: true, amount: 2000, paidDate: '2024-01-03' },
      { year: 2024, month: 2, paid: true, amount: 2000, paidDate: '2024-02-01' },
      { year: 2024, month: 3, paid: true, amount: 2000, paidDate: '2024-03-02' },
      { year: 2024, month: 4, paid: true, amount: 2000, paidDate: '2024-04-05' },
      { year: 2024, month: 5, paid: true, amount: 2000, paidDate: '2024-05-01' },
    ],
  },
  {
    id: 'R005',
    unit: '4F-2',
    name: '林志玲',
    phone: '0956-789-012',
    lineId: 'lin.zhiling',
    role: '住戶',
    moveInDate: '2022-04-01',
    paymentHistory: [
      { year: 2024, month: 1, paid: true, amount: 2000, paidDate: '2024-01-20' },
      { year: 2024, month: 2, paid: true, amount: 2000, paidDate: '2024-02-18' },
      { year: 2024, month: 3, paid: true, amount: 2000, paidDate: '2024-03-22' },
      { year: 2024, month: 4, paid: false, amount: 2000, paidDate: null },
      { year: 2024, month: 5, paid: false, amount: 2000, paidDate: null },
    ],
  },
];

// 廠商資料
export const mockVendors: Vendor[] = [
  {
    id: 'V001',
    name: '永信電梯',
    category: '電梯維護',
    contact: '陳經理',
    phone: '02-2345-6789',
    lineId: 'yongxin.elevator',
    contractStart: '2023-01-01',
    contractEnd: '2025-12-31',
    rating: 4.5,
    notes: '每月定期保養，反應快速',
    invoices: [
      { id: 'INV001', date: '2024-03-15', amount: 5000, description: '3月保養', image: null },
      { id: 'INV002', date: '2024-04-15', amount: 5000, description: '4月保養', image: null },
    ],
    serviceRecords: [
      { date: '2024-04-20', type: '緊急維修', workers: 2, duration: '2小時', description: '電梯異音處理', photos: [] },
      { date: '2024-03-15', type: '定期保養', workers: 1, duration: '1小時', description: '例行保養', photos: [] },
    ],
  },
  {
    id: 'V002',
    name: '大安清潔',
    category: '清潔服務',
    contact: '林小姐',
    phone: '02-3456-7890',
    lineId: 'daan.clean',
    contractStart: '2024-01-01',
    contractEnd: '2024-12-31',
    rating: 4.0,
    notes: '每週二、五打掃公共區域',
    invoices: [
      { id: 'INV003', date: '2024-04-30', amount: 8000, description: '4月清潔費', image: null },
    ],
    serviceRecords: [
      { date: '2024-05-03', type: '例行清潔', workers: 2, duration: '3小時', description: '公共區域清潔', photos: [] },
    ],
  },
  {
    id: 'V003',
    name: '台北水電行',
    category: '水電維修',
    contact: '張師傅',
    phone: '0922-333-444',
    lineId: 'taipei.plumber',
    contractStart: null,
    contractEnd: null,
    rating: 4.8,
    notes: '叫修制，收費合理',
    invoices: [],
    serviceRecords: [
      { date: '2024-04-10', type: '維修', workers: 1, duration: '1.5小時', description: '地下室水管漏水修繕', photos: [] },
    ],
  },
];

// 維修單資料
export const mockRepairs: RepairTicket[] = [
  {
    id: 'RP001',
    title: '電梯異音',
    description: '電梯運行時有異常聲音',
    reportedBy: 'R001',
    reportedDate: '2024-05-01',
    status: 'completed',
    priority: 'high',
    assignedVendor: 'V001',
    completedDate: '2024-05-03',
    cost: 3500,
    photos: [],
  },
  {
    id: 'RP002',
    title: '地下室漏水',
    description: 'B1停車場天花板滲水',
    reportedBy: 'R002',
    reportedDate: '2024-05-05',
    status: 'in_progress',
    priority: 'high',
    assignedVendor: 'V003',
    completedDate: null,
    cost: null,
    photos: [],
  },
  {
    id: 'RP003',
    title: '大廳燈泡更換',
    description: '大廳有兩盞燈不亮',
    reportedBy: 'R003',
    reportedDate: '2024-05-08',
    status: 'pending',
    priority: 'low',
    assignedVendor: null,
    completedDate: null,
    cost: null,
    photos: [],
  },
];

// 會議紀錄資料
export const mockMeetings: Meeting[] = [
  {
    id: 'M001',
    title: '第三屆第五次管委會',
    date: '2024-05-01',
    time: '19:30',
    duration: '1:45:00',
    location: '社區會議室',
    attendees: ['王大明', '李小華', '陳建宏'],
    absentees: ['張美玲'],
    hasAudio: true,
    hasTranscript: true,
    transcript: '主委：各位委員好，今天開會主要討論...',
    summary: '本次會議討論電梯維修、清潔合約續約及管理費調整三項議題。',
    resolutions: [
      '通過電梯維修案，預算三萬五千元',
      '清潔合約續約一年，費用維持不變',
      '管理費調整案保留至區權會討論',
    ],
  },
  {
    id: 'M002',
    title: '第三屆第四次管委會',
    date: '2024-04-03',
    time: '19:30',
    duration: '1:20:00',
    location: '社區會議室',
    attendees: ['王大明', '李小華', '陳建宏', '張美玲'],
    absentees: [],
    hasAudio: true,
    hasTranscript: true,
    transcript: '...',
    summary: '討論春節社區佈置、公共區域消毒等事項。',
    resolutions: [
      '春節佈置預算一萬元',
      '安排月底全社區消毒',
    ],
  },
];

// 文件資料
export const mockDocuments: Document[] = [
  {
    id: 'D001',
    name: '社區規約',
    category: '規約',
    uploadDate: '2023-01-15',
    fileType: 'pdf',
    size: '2.3 MB',
  },
  {
    id: 'D002',
    name: '2024年度預算表',
    category: '財務',
    uploadDate: '2024-01-10',
    fileType: 'xlsx',
    size: '156 KB',
  },
  {
    id: 'D003',
    name: '電梯保養合約',
    category: '合約',
    uploadDate: '2023-01-20',
    fileType: 'pdf',
    size: '1.8 MB',
  },
  {
    id: 'D004',
    name: '消防設備檢查報告',
    category: '檢查報告',
    uploadDate: '2024-03-20',
    fileType: 'pdf',
    size: '5.2 MB',
  },
];

// 近期事項
export const mockAlerts: Alert[] = [
  { type: 'payment', message: '3 戶尚未繳納本月管理費', priority: 'high' },
  { type: 'repair', message: '2 件維修單待處理', priority: 'medium' },
  { type: 'meeting', message: '下次管委會：5/15（三）19:30', priority: 'low' },
];

export default {
  residents: mockResidents,
  vendors: mockVendors,
  repairs: mockRepairs,
  meetings: mockMeetings,
  documents: mockDocuments,
  alerts: mockAlerts,
};

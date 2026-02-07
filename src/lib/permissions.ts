import type { ResidentRoleLabel } from '@/types';

// ==================== 權限定義 ====================
export type Permission =
  | 'view_dashboard'        // 查看完整儀表板
  | 'view_residents'        // 查看所有住戶
  | 'edit_residents'        // 新增/編輯住戶
  | 'delete_residents'      // 刪除住戶
  | 'view_payments'         // 查看繳費紀錄
  | 'edit_payments'         // 更新繳費狀態
  | 'send_reminders'        // 催繳通知
  | 'view_vendors'          // 查看廠商
  | 'edit_vendors'          // 新增/編輯廠商
  | 'upload_invoices'       // 上傳單據
  | 'view_repairs'          // 查看維修單
  | 'edit_repairs'          // 新增/編輯維修單
  | 'access_settings'       // 進入設定頁面
  | 'manage_admins';        // 管理者設定

// ==================== 權限矩陣 ====================
const ROLE_PERMISSIONS: Record<ResidentRoleLabel, Permission[]> = {
  '主委': [
    'view_dashboard', 'view_residents', 'edit_residents', 'delete_residents',
    'view_payments', 'edit_payments', 'send_reminders',
    'view_vendors', 'edit_vendors', 'upload_invoices',
    'view_repairs', 'edit_repairs',
    'access_settings', 'manage_admins',
  ],
  '財委': [
    'view_dashboard', 'view_residents',
    'view_payments', 'edit_payments', 'send_reminders',
    'view_vendors', 'edit_vendors', 'upload_invoices',
    'view_repairs',
  ],
  '監委': [
    'view_dashboard', 'view_residents',
    'view_payments',
    'view_vendors',
    'view_repairs',
  ],
  '住戶': [
    'view_vendors',
  ],
};

// ==================== 工具函數 ====================

/** 檢查角色是否有特定權限 */
export function hasPermission(role: ResidentRoleLabel | null, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

/** 取得角色可見的 Tab 列表 */
export function getVisibleTabs(role: ResidentRoleLabel | null): string[] {
  if (!role) return ['home'];
  const tabs: string[] = ['home'];
  tabs.push('directory'); // 所有角色都能看通訊錄
  if (hasPermission(role, 'view_residents')) tabs.push('residents');
  tabs.push('vendors'); // 所有角色都能看廠商
  if (hasPermission(role, 'access_settings')) tabs.push('settings');
  return tabs;
}

/** 是否為管委會成員（主委/財委/監委） */
export function isCommitteeMember(role: ResidentRoleLabel | null): boolean {
  if (!role) return false;
  return ['主委', '財委', '監委'].includes(role);
}

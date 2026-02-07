import { useAppStore } from '@/stores/appStore';
import { hasPermission, type Permission } from '@/lib/permissions';

/** 檢查當前登入用戶是否有特定權限 */
export function usePermission(permission: Permission): boolean {
  const userRole = useAppStore((s) => s.userRole);
  return hasPermission(userRole, permission);
}

/** 取得當前用戶角色 */
export function useUserRole() {
  return useAppStore((s) => s.userRole);
}

/** 取得當前用戶的住戶 ID */
export function useCurrentResidentId() {
  return useAppStore((s) => s.currentResidentId);
}

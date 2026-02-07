import React, { useEffect } from 'react';
import {
  AlertCircleIcon,
  DollarSignIcon,
  WrenchIcon,
  CalendarIcon,
  UsersIcon,
  BuildingIcon,
  MicIcon,
  FolderIcon,
  ChevronRightIcon,
} from '@/components/Icons';
import { Card, Badge } from '@/components/ui';
import { useDataStore } from '@/stores/dataStore';
import { useAppStore } from '@/stores/appStore';
import { usePermission } from '@/hooks/usePermission';
import { showToast } from '@/hooks/useToast';
import type { Resident, RepairTicket } from '@/types';

interface HomeScreenProps {
  setCurrentScreen: (screen: string) => void;
  setSelectedResident: (resident: Resident | null) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  setCurrentScreen,
  setSelectedResident,
}) => {
  const { residents, repairs, vendors, meetings, initializeData } = useDataStore();
  const { userRole, currentResident, currentCommunityId } = useAppStore();
  const communities = useDataStore((s) => s.communities);
  const canViewDashboard = usePermission('view_dashboard');
  const canSendReminders = usePermission('send_reminders');

  // 初始化資料
  useEffect(() => {
    initializeData();
  }, [initializeData]);

  // 社區名稱
  const communityName = communities.find((c) => c.id === currentCommunityId)?.name || '我的社區';

  // 計算統計數據
  const unpaidResidents = residents.filter((r) => {
    const latestPayment = r.paymentHistory?.[r.paymentHistory.length - 1];
    return !latestPayment?.paid;
  });

  const pendingRepairs = repairs.filter((r) => r.status === 'pending');
  const inProgressRepairs = repairs.filter((r) => r.status === 'in_progress');

  // === 住戶角色：顯示個人資訊 ===
  if (!canViewDashboard) {
    const myPayments = currentResident?.paymentHistory || [];
    const myUnpaid = myPayments.filter((p) => !p.paid);

    return (
      <div className="pb-24">
        <div className="bg-gradient-to-b from-[#06C755] to-[#05A847] text-white">
          <div className="h-12" />
          <div className="px-5 py-6">
            <p className="text-white/80 text-sm">早安 👋</p>
            <h1 className="text-2xl font-bold mt-1">
              {currentResident?.name || '住戶'}
            </h1>
            <p className="text-white/70 text-sm mt-1">
              {currentResident?.unit || ''} · {communityName}
            </p>
          </div>
        </div>

        <div className="px-5 -mt-4 space-y-4">
          {/* 社區公告 */}
          <Card className="shadow-lg cursor-pointer" onClick={() => setCurrentScreen('announcements')}>
            <h2 className="font-semibold text-[#1D1D1F] mb-3">社區公告</h2>
            <AlertItem
              icon={<CalendarIcon className="w-4 h-4" color="#06C755" />}
              text="下次管委會：5/15（三）19:30"
              variant="primary"
              onClick={() => setCurrentScreen('announcements')}
            />
          </Card>

          {/* 快速功能 */}
          <div className="grid grid-cols-2 gap-3">
            <QuickActionCard
              icon={<BuildingIcon className="w-6 h-6" color="#007AFF" />}
              title="社區廠商"
              subtitle={`${vendors.length} 家`}
              onClick={() => setCurrentScreen('vendors')}
            />
            <QuickActionCard
              icon={<DollarSignIcon className="w-6 h-6" color="#FF9500" />}
              title="繳費查詢"
              subtitle="查看繳費狀態"
              onClick={() => showToast('繳費查詢功能開發中')}
            />
          </div>

          {/* 我的繳費狀態 */}
          <Card>
            <h2 className="font-semibold text-[#1D1D1F] mb-3">我的繳費狀態</h2>
            {myUnpaid.length > 0 ? (
              <div className="space-y-2">
                {myUnpaid.map((p, i) => (
                  <div key={i} className="flex justify-between items-center py-2 border-b border-[#E8E8ED] last:border-0">
                    <span className="text-[#1D1D1F]">{p.year}年{p.month}月</span>
                    <span className="text-[#FF3B30] font-medium">${p.amount.toLocaleString()} 未繳</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[#34C759] text-center py-4">所有管理費已繳清 ✓</p>
            )}
          </Card>
        </div>
      </div>
    );
  }

  // === 管委角色：完整儀表板 ===
  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#06C755] to-[#05A847] text-white">
        <div className="h-12" /> {/* Status bar */}
        <div className="px-5 py-6">
          <p className="text-white/80 text-sm">早安 👋</p>
          <h1 className="text-2xl font-bold mt-1">{communityName}</h1>
          {userRole && (
            <p className="text-white/70 text-sm mt-1">身份：{userRole}</p>
          )}
        </div>
      </div>

      <div className="px-5 -mt-4 space-y-4">
        {/* 重要提醒卡片 */}
        <Card className="shadow-lg">
          <h2 className="font-semibold text-[#1D1D1F] mb-3 flex items-center gap-2">
            <AlertCircleIcon className="w-5 h-5" color="#FF9500" />
            近期重要事項
          </h2>
          <div className="space-y-3">
            {unpaidResidents.length > 0 && (
              <AlertItem
                icon={<DollarSignIcon className="w-4 h-4" color="#FF3B30" />}
                text={`${unpaidResidents.length} 戶尚未繳納本月管理費`}
                variant="danger"
                onClick={() => setCurrentScreen('residents')}
              />
            )}
            {(pendingRepairs.length > 0 || inProgressRepairs.length > 0) && (
              <AlertItem
                icon={<WrenchIcon className="w-4 h-4" color="#FF9500" />}
                text={`${pendingRepairs.length + inProgressRepairs.length} 件維修單待處理`}
                variant="warning"
                onClick={() => setCurrentScreen('home')}
              />
            )}
            <AlertItem
              icon={<CalendarIcon className="w-4 h-4" color="#06C755" />}
              text="下次管委會：5/15（三）19:30"
              variant="primary"
            />
          </div>
        </Card>

        {/* 快速功能入口 */}
        <div className="grid grid-cols-2 gap-3">
          <QuickActionCard
            icon={<UsersIcon className="w-6 h-6" color="#06C755" />}
            title="住戶管理"
            subtitle={`${residents.length} 戶`}
            onClick={() => setCurrentScreen('residents')}
          />
          <QuickActionCard
            icon={<BuildingIcon className="w-6 h-6" color="#007AFF" />}
            title="廠商管理"
            subtitle={`${vendors.length} 家合作廠商`}
            onClick={() => setCurrentScreen('vendors')}
          />
          <QuickActionCard
            icon={<MicIcon className="w-6 h-6" color="#AF52DE" />}
            title="會議紀錄"
            subtitle={`${meetings.length} 份紀錄`}
            onClick={() => showToast('會議紀錄功能開發中')}
          />
          <QuickActionCard
            icon={<FolderIcon className="w-6 h-6" color="#FF9500" />}
            title="文件庫"
            subtitle="4 份文件"
            onClick={() => showToast('文件庫功能開發中')}
          />
        </div>

        {/* 管理費收繳狀況 */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#1D1D1F]">本月管理費收繳</h2>
            <button
              onClick={() => setCurrentScreen('residents')}
              className="text-sm text-[#06C755]"
            >
              查看全部
            </button>
          </div>

          {/* 進度條 */}
          <div className="mb-3">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-[#86868B]">收繳進度</span>
              <span className="text-[#1D1D1F] font-medium">
                {residents.length - unpaidResidents.length}/{residents.length} 戶
              </span>
            </div>
            <div className="h-2 bg-[#E8E8ED] rounded-full overflow-hidden">
              <div
                className="h-full bg-[#34C759] rounded-full transition-all"
                style={{
                  width: residents.length > 0
                    ? `${((residents.length - unpaidResidents.length) / residents.length) * 100}%`
                    : '0%',
                }}
              />
            </div>
          </div>

          {/* 未繳名單 */}
          {unpaidResidents.length > 0 && (
            <div className="pt-3 border-t border-[#E8E8ED]">
              <p className="text-sm text-[#86868B] mb-2">未繳住戶</p>
              <div className="space-y-2">
                {unpaidResidents.slice(0, 3).map((resident) => (
                  <div
                    key={resident.id}
                    className="flex items-center justify-between py-2 cursor-pointer"
                    onClick={() => setSelectedResident(resident)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#FF3B30]/10 flex items-center justify-center">
                        <span className="text-sm font-medium text-[#FF3B30]">
                          {resident.unit.split('-')[0]}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-[#1D1D1F]">{resident.name}</p>
                        <p className="text-xs text-[#86868B]">{resident.unit}</p>
                      </div>
                    </div>
                    {canSendReminders && (
                      <button className="px-3 py-1 bg-[#06C755] text-white text-xs rounded-full">
                        催繳
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        {/* 維修追蹤 */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-semibold text-[#1D1D1F]">維修追蹤</h2>
            <button onClick={() => showToast('維修管理功能開發中')} className="text-sm text-[#06C755]">查看全部</button>
          </div>

          <div className="space-y-3">
            {repairs.slice(0, 3).map((repair) => (
              <RepairItem key={repair.id} repair={repair} />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

// 提醒項目
interface AlertItemProps {
  icon: React.ReactNode;
  text: string;
  variant: 'danger' | 'warning' | 'primary';
  onClick?: () => void;
}

const AlertItem: React.FC<AlertItemProps> = ({ icon, text, variant, onClick }) => {
  const bgColors = {
    danger: 'bg-[#FF3B30]/5',
    warning: 'bg-[#FF9500]/5',
    primary: 'bg-[#06C755]/5',
  };

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-3 p-3 rounded-xl ${bgColors[variant]} active:opacity-70`}
    >
      <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm">
        {icon}
      </div>
      <span className="text-sm text-[#1D1D1F] flex-1 text-left">{text}</span>
      <ChevronRightIcon className="w-4 h-4" color="#C7C7CC" />
    </button>
  );
};

// 快速功能卡片
interface QuickActionCardProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  onClick: () => void;
}

const QuickActionCard: React.FC<QuickActionCardProps> = ({ icon, title, subtitle, onClick }) => (
  <button
    onClick={onClick}
    className="bg-white rounded-2xl p-4 text-left active:bg-gray-50 shadow-sm"
  >
    <div className="w-12 h-12 rounded-xl bg-[#F5F5F7] flex items-center justify-center mb-3">
      {icon}
    </div>
    <p className="font-semibold text-[#1D1D1F]">{title}</p>
    <p className="text-sm text-[#86868B]">{subtitle}</p>
  </button>
);

// 維修項目
interface RepairItemProps {
  repair: RepairTicket;
}

const RepairItem: React.FC<RepairItemProps> = ({ repair }) => {
  const statusConfig: Record<string, { label: string; variant: 'warning' | 'primary' | 'success' }> = {
    pending: { label: '待處理', variant: 'warning' },
    in_progress: { label: '處理中', variant: 'primary' },
    completed: { label: '已完成', variant: 'success' },
  };

  const status = statusConfig[repair.status];

  return (
    <div className="flex items-center gap-3 p-3 bg-[#F5F5F7] rounded-xl">
      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
        <WrenchIcon className="w-5 h-5" color="#86868B" />
      </div>
      <div className="flex-1">
        <p className="font-medium text-[#1D1D1F]">{repair.title}</p>
        <p className="text-xs text-[#86868B]">{repair.reportedDate}</p>
      </div>
      <Badge variant={status.variant}>{status.label}</Badge>
    </div>
  );
};

export default HomeScreen;

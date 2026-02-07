// 首頁畫面
import React from 'react';
import { Icons } from './icons.jsx';
import { Card, Badge } from './components.jsx';
import { mockResidents, mockRepairs, mockAlerts } from './mockData.js';

export const HomeScreen = ({ setCurrentScreen, setSelectedResident, setSelectedRepair }) => {
  // 計算統計數據
  const unpaidResidents = mockResidents.filter(r => {
    const latestPayment = r.paymentHistory[r.paymentHistory.length - 1];
    return !latestPayment?.paid;
  });

  const pendingRepairs = mockRepairs.filter(r => r.status === 'pending');
  const inProgressRepairs = mockRepairs.filter(r => r.status === 'in_progress');

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#06C755] to-[#05A847] text-white">
        <div className="h-12" /> {/* Status bar */}
        <div className="px-5 py-6">
          <p className="text-white/80 text-sm">早安 👋</p>
          <h1 className="text-2xl font-bold mt-1">幸福社區管委會</h1>
        </div>
      </div>

      <div className="px-5 -mt-4 space-y-4">
        {/* 重要提醒卡片 */}
        <Card className="shadow-lg">
          <h2 className="font-semibold text-[#1D1D1F] mb-3 flex items-center gap-2">
            <Icons.alertCircle className="w-5 h-5" color="#FF9500" />
            近期重要事項
          </h2>
          <div className="space-y-3">
            {unpaidResidents.length > 0 && (
              <AlertItem
                icon={<Icons.dollarSign className="w-4 h-4" color="#FF3B30" />}
                text={`${unpaidResidents.length} 戶尚未繳納本月管理費`}
                variant="danger"
                onClick={() => setCurrentScreen('residents')}
              />
            )}
            {(pendingRepairs.length > 0 || inProgressRepairs.length > 0) && (
              <AlertItem
                icon={<Icons.wrench className="w-4 h-4" color="#FF9500" />}
                text={`${pendingRepairs.length + inProgressRepairs.length} 件維修單待處理`}
                variant="warning"
                onClick={() => setCurrentScreen('home')} // TODO: repairs screen
              />
            )}
            <AlertItem
              icon={<Icons.calendar className="w-4 h-4" color="#06C755" />}
              text="下次管委會：5/15（三）19:30"
              variant="primary"
            />
          </div>
        </Card>

        {/* 快速功能入口 */}
        <div className="grid grid-cols-2 gap-3">
          <QuickActionCard
            icon={<Icons.users className="w-6 h-6" color="#06C755" />}
            title="住戶管理"
            subtitle={`${mockResidents.length} 戶`}
            onClick={() => setCurrentScreen('residents')}
          />
          <QuickActionCard
            icon={<Icons.building className="w-6 h-6" color="#007AFF" />}
            title="廠商管理"
            subtitle="3 家合作廠商"
            onClick={() => setCurrentScreen('vendors')}
          />
          <QuickActionCard
            icon={<Icons.mic className="w-6 h-6" color="#AF52DE" />}
            title="會議紀錄"
            subtitle="2 份紀錄"
            onClick={() => {}} // TODO: meetings screen
          />
          <QuickActionCard
            icon={<Icons.folder className="w-6 h-6" color="#FF9500" />}
            title="文件庫"
            subtitle="4 份文件"
            onClick={() => {}} // TODO: documents screen
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
                {mockResidents.length - unpaidResidents.length}/{mockResidents.length} 戶
              </span>
            </div>
            <div className="h-2 bg-[#E8E8ED] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#34C759] rounded-full transition-all"
                style={{ 
                  width: `${((mockResidents.length - unpaidResidents.length) / mockResidents.length) * 100}%` 
                }}
              />
            </div>
          </div>

          {/* 未繳名單 */}
          {unpaidResidents.length > 0 && (
            <div className="pt-3 border-t border-[#E8E8ED]">
              <p className="text-sm text-[#86868B] mb-2">未繳住戶</p>
              <div className="space-y-2">
                {unpaidResidents.slice(0, 3).map(resident => (
                  <div 
                    key={resident.id}
                    className="flex items-center justify-between py-2"
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
                    <button className="px-3 py-1 bg-[#06C755] text-white text-xs rounded-full">
                      催繳
                    </button>
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
            <button className="text-sm text-[#06C755]">查看全部</button>
          </div>
          
          <div className="space-y-3">
            {mockRepairs.slice(0, 3).map(repair => (
              <RepairItem key={repair.id} repair={repair} />
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

// 提醒項目
const AlertItem = ({ icon, text, variant, onClick }) => {
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
      <Icons.chevronRight className="w-4 h-4" color="#C7C7CC" />
    </button>
  );
};

// 快速功能卡片
const QuickActionCard = ({ icon, title, subtitle, onClick }) => (
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
const RepairItem = ({ repair }) => {
  const statusConfig = {
    pending: { label: '待處理', variant: 'warning' },
    in_progress: { label: '處理中', variant: 'primary' },
    completed: { label: '已完成', variant: 'success' },
  };

  const status = statusConfig[repair.status];

  return (
    <div className="flex items-center gap-3 p-3 bg-[#F5F5F7] rounded-xl">
      <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center">
        <Icons.wrench className="w-5 h-5" color="#86868B" />
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

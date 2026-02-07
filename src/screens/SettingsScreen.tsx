import React, { useState } from 'react';
import {
  ChevronRightIcon,
  CheckIcon,
  PlusIcon,
  TrashIcon,
} from '@/components/Icons';
import { Header, Card, Badge, Modal } from '@/components/ui';
import type { Admin, PlanType, Usage } from '@/types';

export const SettingsScreen: React.FC = () => {
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);

  // 模擬資料
  const currentPlan: PlanType = 'free';
  const usage: Usage = { meetings: 2, maxMeetings: 3, reports: 1, maxReports: 2 };
  const admins: Admin[] = [
    { id: 'A1', name: '王大明', role: '主委', isOwner: true },
    { id: 'A2', name: '李小華', role: '財委', isOwner: false },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F7] pb-24">
      <Header title="設定" />

      <div className="px-5 space-y-4">
        {/* 方案資訊 */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-sm text-[#86868B]">目前方案</p>
              <p className="text-xl font-bold text-[#1D1D1F]">
                {currentPlan === 'free'
                  ? '免費版'
                  : currentPlan === 'pro'
                    ? '進階版'
                    : '專業版'}
              </p>
            </div>
            <button
              onClick={() => setShowPlanModal(true)}
              className="px-4 py-2 bg-[#06C755] text-white rounded-full text-sm font-medium"
            >
              升級方案
            </button>
          </div>

          {/* 使用量 */}
          <div className="space-y-3 pt-4 border-t border-[#E8E8ED]">
            <UsageBar label="AI 會議紀錄" used={usage.meetings} max={usage.maxMeetings} />
            <UsageBar label="AI 財務報表" used={usage.reports} max={usage.maxReports} />
          </div>
        </Card>

        {/* 管理者設定 */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#1D1D1F]">管理者</h3>
            <button onClick={() => setShowAdminModal(true)} className="text-sm text-[#06C755]">
              管理
            </button>
          </div>
          <div className="space-y-2">
            {admins.map((admin) => (
              <div key={admin.id} className="flex items-center justify-between py-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#06C755]/10 flex items-center justify-center">
                    <span className="font-medium text-[#06C755]">{admin.name[0]}</span>
                  </div>
                  <div>
                    <p className="font-medium text-[#1D1D1F]">{admin.name}</p>
                    <p className="text-xs text-[#86868B]">{admin.role}</p>
                  </div>
                </div>
                {admin.isOwner && <Badge variant="primary">擁有者</Badge>}
              </div>
            ))}
          </div>
        </Card>

        {/* 社區資訊 */}
        <Card>
          <h3 className="font-semibold text-[#1D1D1F] mb-3">社區資訊</h3>
          <SettingRow label="社區名稱" value="幸福社區" />
          <SettingRow label="戶數" value="48 戶" />
          <SettingRow label="管理費" value="NT$ 2,000/月" />
          <SettingRow label="地址" value="台北市大安區幸福路123號" isLast />
        </Card>

        {/* 其他設定 */}
        <Card>
          <h3 className="font-semibold text-[#1D1D1F] mb-3">其他</h3>
          <SettingLink label="通知設定" />
          <SettingLink label="資料匯出" />
          <SettingLink label="使用說明" />
          <SettingLink label="關於" isLast />
        </Card>

        {/* 退出 */}
        <button className="w-full py-4 bg-white rounded-xl text-[#FF3B30] font-medium">
          退出管理者身份
        </button>
      </div>

      {/* 方案選擇 Modal */}
      <PlanModal
        isOpen={showPlanModal}
        onClose={() => setShowPlanModal(false)}
        currentPlan={currentPlan}
      />

      {/* 管理者管理 Modal */}
      <AdminModal
        isOpen={showAdminModal}
        onClose={() => setShowAdminModal(false)}
        admins={admins}
      />
    </div>
  );
};

// ==================== 子元件 ====================

interface UsageBarProps {
  label: string;
  used: number;
  max: number;
}

const UsageBar: React.FC<UsageBarProps> = ({ label, used, max }) => {
  const percentage = (used / max) * 100;
  const isNearLimit = percentage >= 80;

  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="text-[#86868B]">{label}</span>
        <span className={isNearLimit ? 'text-[#FF9500]' : 'text-[#1D1D1F]'}>
          {used}/{max} 次
        </span>
      </div>
      <div className="h-2 bg-[#E8E8ED] rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${isNearLimit ? 'bg-[#FF9500]' : 'bg-[#34C759]'}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

interface SettingRowProps {
  label: string;
  value: string;
  isLast?: boolean;
}

const SettingRow: React.FC<SettingRowProps> = ({ label, value, isLast = false }) => (
  <div className={`flex justify-between py-3 ${!isLast ? 'border-b border-[#E8E8ED]' : ''}`}>
    <span className="text-[#86868B]">{label}</span>
    <span className="text-[#1D1D1F]">{value}</span>
  </div>
);

interface SettingLinkProps {
  label: string;
  isLast?: boolean;
}

const SettingLink: React.FC<SettingLinkProps> = ({ label, isLast = false }) => (
  <button
    className={`w-full flex items-center justify-between py-3 ${!isLast ? 'border-b border-[#E8E8ED]' : ''}`}
  >
    <span className="text-[#1D1D1F]">{label}</span>
    <ChevronRightIcon className="w-5 h-5" color="#C7C7CC" />
  </button>
);

// ==================== Modals ====================

interface PlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan: PlanType;
}

const PlanModal: React.FC<PlanModalProps> = ({ isOpen, onClose, currentPlan }) => {
  if (!isOpen) return null;

  const plans = [
    {
      id: 'free' as PlanType,
      name: '免費版',
      price: 'NT$ 0',
      features: ['3 次/月 AI 會議紀錄', '2 次/月 AI 財務報表', '1 位管理者', '基本功能'],
    },
    {
      id: 'pro' as PlanType,
      name: '進階版',
      price: 'NT$ 990/月',
      features: ['10 次/月 AI 會議紀錄', '5 次/月 AI 財務報表', '3 位管理者', '優先客服'],
      recommended: true,
    },
    {
      id: 'enterprise' as PlanType,
      name: '專業版',
      price: 'NT$ 2,490/月',
      features: [
        '無限 AI 會議紀錄',
        '無限 AI 財務報表',
        '10 位管理者',
        '專屬客服',
        'API 整合',
      ],
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="選擇方案">
      <div className="p-5 space-y-4">
        {plans.map((plan) => (
          <div
            key={plan.id}
            className={`relative p-4 rounded-xl border-2 ${
              plan.id === currentPlan ? 'border-[#06C755] bg-[#06C755]/5' : 'border-[#E8E8ED]'
            }`}
          >
            {plan.recommended && (
              <span className="absolute -top-3 left-4 px-2 py-1 bg-[#FF9500] text-white text-xs rounded-full">
                推薦
              </span>
            )}
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-semibold text-[#1D1D1F]">{plan.name}</h4>
                <p className="text-xl font-bold text-[#06C755]">{plan.price}</p>
              </div>
              {plan.id === currentPlan && <Badge variant="success">目前方案</Badge>}
            </div>
            <ul className="space-y-1">
              {plan.features.map((f, i) => (
                <li key={i} className="text-sm text-[#86868B] flex items-center gap-2">
                  <CheckIcon className="w-4 h-4" color="#34C759" />
                  {f}
                </li>
              ))}
            </ul>
            {plan.id !== currentPlan && (
              <button className="w-full mt-4 py-3 bg-[#06C755] text-white rounded-xl font-medium">
                {plan.id === 'free' ? '降級' : '升級'}到{plan.name}
              </button>
            )}
          </div>
        ))}
      </div>
    </Modal>
  );
};

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  admins: Admin[];
}

const AdminModal: React.FC<AdminModalProps> = ({ isOpen, onClose, admins }) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="管理者設定">
      <div className="p-5 space-y-4">
        <button className="w-full py-3 bg-[#06C755] text-white rounded-xl font-medium flex items-center justify-center gap-2">
          <PlusIcon className="w-5 h-5" color="white" />
          邀請管理者
        </button>

        <div className="space-y-2">
          {admins.map((admin) => (
            <div
              key={admin.id}
              className="flex items-center justify-between p-3 bg-[#F5F5F7] rounded-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#06C755]/10 flex items-center justify-center">
                  <span className="font-medium text-[#06C755]">{admin.name[0]}</span>
                </div>
                <div>
                  <p className="font-medium text-[#1D1D1F]">{admin.name}</p>
                  <p className="text-xs text-[#86868B]">{admin.role}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {admin.isOwner ? (
                  <Badge variant="primary">擁有者</Badge>
                ) : (
                  <button className="p-2 text-[#FF3B30]">
                    <TrashIcon className="w-5 h-5" color="#FF3B30" />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-[#86868B] text-center">
          免費版最多 1 位管理者，升級可增加管理者人數
        </p>
      </div>
    </Modal>
  );
};

export default SettingsScreen;

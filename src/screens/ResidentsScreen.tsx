import React, { useState, useEffect } from 'react';
import {
  UsersIcon,
  ChevronRightIcon,
  LineIcon,
  PhoneIcon,
  TrashIcon,
} from '@/components/Icons';
import {
  Header,
  SearchBar,
  Card,
  Badge,
  FloatingButton,
  Modal,
  ConfirmDialog,
} from '@/components/ui';
import { useDataStore } from '@/stores/dataStore';
import { usePermission } from '@/hooks/usePermission';
import type { Resident, PaymentRecord, ResidentRoleLabel } from '@/types';

// ==================== 住戶列表 ====================
interface ResidentsScreenProps {
  setCurrentScreen: (screen: string) => void;
  setSelectedResident: (resident: Resident | null) => void;
}

export const ResidentsScreen: React.FC<ResidentsScreenProps> = ({
  setSelectedResident,
}) => {
  const { residents, fetchResidents, addResident, isLoading } = useDataStore();
  const canViewResidents = usePermission('view_residents');
  const canEdit = usePermission('edit_residents');
  const canSendReminders = usePermission('send_reminders');
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'unpaid' | 'committee'>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    fetchResidents();
  }, [fetchResidents]);

  // 權限守衛：住戶角色不能看到住戶列表
  if (!canViewResidents) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
        <div className="text-center px-8">
          <p className="text-4xl mb-4">🔒</p>
          <p className="text-lg font-semibold text-[#1D1D1F]">無權限存取</p>
          <p className="text-sm text-[#86868B] mt-2">此頁面僅限管委會成員查看</p>
        </div>
      </div>
    );
  }

  // 篩選住戶
  const filteredResidents = residents.filter((resident) => {
    const matchesSearch =
      resident.name.includes(searchQuery) ||
      resident.unit.includes(searchQuery) ||
      resident.phone.includes(searchQuery);

    if (!matchesSearch) return false;

    if (filter === 'unpaid') {
      const latestPayment = resident.paymentHistory?.[resident.paymentHistory.length - 1];
      return !latestPayment?.paid;
    }
    if (filter === 'committee') {
      return ['主委', '財委', '監委'].includes(resident.role);
    }
    return true;
  });

  // 計算未繳數量
  const unpaidCount = residents.filter((r) => {
    const latestPayment = r.paymentHistory?.[r.paymentHistory.length - 1];
    return !latestPayment?.paid;
  }).length;

  const handleAddResident = async (data: Omit<Resident, 'id'>): Promise<void> => {
    await addResident(data);
    // 成功後會由 Modal 自動關閉
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] pb-24">
      <Header title="住戶管理" />

      <div className="px-5 space-y-4">
        {/* 搜尋框 */}
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="搜尋住戶姓名、門牌、電話..."
        />

        {/* 篩選標籤 */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          <FilterChip
            label="全部"
            active={filter === 'all'}
            onClick={() => setFilter('all')}
          />
          <FilterChip
            label={`未繳 (${unpaidCount})`}
            active={filter === 'unpaid'}
            onClick={() => setFilter('unpaid')}
            variant="danger"
          />
          <FilterChip
            label="管委會"
            active={filter === 'committee'}
            onClick={() => setFilter('committee')}
          />
        </div>

        {/* 批次催繳按鈕（僅主委/財委） */}
        {canSendReminders && filter === 'unpaid' && unpaidCount > 0 && (
          <button className="w-full py-3 bg-[#06C755] text-white rounded-xl font-medium flex items-center justify-center gap-2">
            <LineIcon className="w-5 h-5" color="white" />
            一鍵催繳 {unpaidCount} 戶
          </button>
        )}

        {/* 載入中 */}
        {isLoading && (
          <div className="text-center py-8">
            <div className="w-8 h-8 border-4 border-[#06C755] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-[#86868B]">載入中...</p>
          </div>
        )}

        {/* 住戶列表 */}
        {!isLoading && (
          <div className="space-y-2">
            {filteredResidents.map((resident) => (
              <ResidentCard
                key={resident.id}
                resident={resident}
                onClick={() => setSelectedResident(resident)}
              />
            ))}
          </div>
        )}

        {!isLoading && filteredResidents.length === 0 && (
          <div className="text-center py-12">
            <UsersIcon className="w-12 h-12 mx-auto mb-3" color="#C7C7CC" />
            <p className="text-[#86868B]">沒有符合條件的住戶</p>
          </div>
        )}
      </div>

      {/* 新增住戶按鈕（僅主委） */}
      {canEdit && <FloatingButton onClick={() => setShowAddModal(true)} />}

      {/* 新增住戶 Modal */}
      {canEdit && (
        <AddResidentModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddResident}
        />
      )}
    </div>
  );
};

// ==================== 住戶詳情 ====================
interface ResidentDetailScreenProps {
  resident: Resident;
  onBack: () => void;
}

export const ResidentDetailScreen: React.FC<ResidentDetailScreenProps> = ({
  resident: initialResident,
  onBack,
}) => {
  const { residents, updateResident, deleteResident } = useDataStore();
  const canEditResident = usePermission('edit_residents');
  const canDeleteResident = usePermission('delete_residents');
  const canEditPayments = usePermission('edit_payments');
  const canSendReminders = usePermission('send_reminders');
  const [activeTab, setActiveTab] = useState<'info' | 'payments'>('info');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // 從 store 取得最新資料
  const resident = residents.find(r => r.id === initialResident.id) || initialResident;

  // 計算繳費統計
  const paymentHistory = resident.paymentHistory || [];
  const paidCount = paymentHistory.filter((p) => p.paid).length;
  const totalCount = paymentHistory.length;
  const totalUnpaid = paymentHistory
    .filter((p) => !p.paid)
    .reduce((sum, p) => sum + p.amount, 0);

  const handleUpdate = async (data: Partial<Resident>) => {
    await updateResident(resident.id, data);
    setShowEditModal(false);
  };

  const handleDelete = async () => {
    await deleteResident(resident.id);
    onBack();
  };

  const handleUpdatePayment = async (payment: PaymentRecord) => {
    const updatedHistory = [...paymentHistory];
    const existingIndex = updatedHistory.findIndex(
      (p) => p.year === payment.year && p.month === payment.month
    );

    if (existingIndex >= 0) {
      updatedHistory[existingIndex] = payment;
    } else {
      updatedHistory.push(payment);
    }

    // 按時間排序
    updatedHistory.sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return a.month - b.month;
    });

    await updateResident(resident.id, { paymentHistory: updatedHistory });
    setShowPaymentModal(false);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] pb-24">
      <Header
        title="住戶詳情"
        showBack
        onBack={onBack}
        rightAction={
          canEditResident ? (
            <button onClick={() => setShowEditModal(true)} className="text-[#06C755]">
              編輯
            </button>
          ) : null
        }
      />

      {/* 住戶基本資訊卡片 */}
      <div className="px-5 -mt-2">
        <Card className="shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-[#06C755]/10 flex items-center justify-center">
              <span className="text-xl font-bold text-[#06C755]">
                {resident.unit.split('-')[0]}
              </span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#1D1D1F]">{resident.name}</h2>
                {resident.role !== '住戶' && <Badge variant="primary">{resident.role}</Badge>}
              </div>
              <p className="text-[#86868B]">{resident.unit}</p>
            </div>
          </div>

          {/* 聯絡方式 */}
          <div className={`grid ${canDeleteResident ? 'grid-cols-3' : 'grid-cols-2'} gap-2`}>
            <ContactButton
              icon={<LineIcon className="w-5 h-5" color="#06C755" />}
              label="LINE"
              onClick={() => {
                if (resident.lineId) {
                  window.open(`https://line.me/R/ti/p/${resident.lineId}`);
                }
              }}
            />
            <ContactButton
              icon={<PhoneIcon className="w-5 h-5" color="#007AFF" />}
              label="通話"
              onClick={() => window.open(`tel:${resident.phone}`)}
            />
            {canDeleteResident && (
              <ContactButton
                icon={<TrashIcon className="w-5 h-5" color="#FF3B30" />}
                label="刪除"
                onClick={() => setShowDeleteConfirm(true)}
              />
            )}
          </div>
        </Card>
      </div>

      {/* Tab 切換 */}
      <div className="px-5 mt-4">
        <div className="flex bg-[#E8E8ED] rounded-xl p-1">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'info' ? 'bg-white text-[#1D1D1F] shadow-sm' : 'text-[#86868B]'
            }`}
          >
            基本資料
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'payments' ? 'bg-white text-[#1D1D1F] shadow-sm' : 'text-[#86868B]'
            }`}
          >
            繳費紀錄
          </button>
        </div>
      </div>

      {/* Tab 內容 */}
      <div className="px-5 mt-4">
        {activeTab === 'info' ? (
          <Card>
            <InfoRow label="電話" value={resident.phone} />
            <InfoRow label="LINE ID" value={resident.lineId || '-'} />
            <InfoRow label="入住日期" value={resident.moveInDate} />
            <InfoRow label="身份" value={resident.role} isLast />
          </Card>
        ) : (
          <div className="space-y-4">
            {/* 繳費統計 */}
            <Card>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <p className="text-2xl font-bold text-[#34C759]">{paidCount}</p>
                  <p className="text-xs text-[#86868B]">已繳</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#FF3B30]">{totalCount - paidCount}</p>
                  <p className="text-xs text-[#86868B]">未繳</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-[#FF9500]">
                    ${totalUnpaid.toLocaleString()}
                  </p>
                  <p className="text-xs text-[#86868B]">欠繳金額</p>
                </div>
              </div>
            </Card>

            {/* 新增繳費紀錄按鈕（僅主委/財委） */}
            {canEditPayments && (
              <button
                onClick={() => setShowPaymentModal(true)}
                className="w-full py-3 bg-[#06C755] text-white rounded-xl font-medium"
              >
                更新繳費狀態
              </button>
            )}

            {/* 繳費歷史列表 */}
            <Card>
              <h3 className="font-semibold text-[#1D1D1F] mb-3">繳費歷史</h3>
              {paymentHistory.length > 0 ? (
                <div className="space-y-2">
                  {[...paymentHistory].reverse().map((payment, index) => (
                    <PaymentRow key={index} payment={payment} />
                  ))}
                </div>
              ) : (
                <p className="text-center text-[#86868B] py-4">尚無繳費紀錄</p>
              )}
            </Card>

            {/* 催繳按鈕（僅主委/財委） */}
            {canSendReminders && totalUnpaid > 0 && (
              <button className="w-full py-4 bg-[#06C755] text-white rounded-xl font-semibold flex items-center justify-center gap-2">
                <LineIcon className="w-5 h-5" color="white" />
                發送催繳通知
              </button>
            )}
          </div>
        )}
      </div>

      {/* 編輯住戶 Modal */}
      <EditResidentModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        resident={resident}
        onSubmit={handleUpdate}
      />

      {/* 刪除確認 Dialog */}
      <ConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="確認刪除"
        message={`確定要刪除住戶「${resident.name}」嗎？此操作無法復原。`}
      />

      {/* 更新繳費狀態 Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onSubmit={handleUpdatePayment}
      />
    </div>
  );
};

// ==================== 子元件 ====================

// 篩選標籤
interface FilterChipProps {
  label: string;
  active: boolean;
  onClick: () => void;
  variant?: 'default' | 'danger';
}

const FilterChip: React.FC<FilterChipProps> = ({
  label,
  active,
  onClick,
  variant = 'default',
}) => {
  const activeStyles = variant === 'danger' ? 'bg-[#FF3B30] text-white' : 'bg-[#06C755] text-white';

  return (
    <button
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
        active ? activeStyles : 'bg-white text-[#1D1D1F]'
      }`}
    >
      {label}
    </button>
  );
};

// 住戶卡片
interface ResidentCardProps {
  resident: Resident;
  onClick: () => void;
}

const ResidentCard: React.FC<ResidentCardProps> = ({ resident, onClick }) => {
  const latestPayment = resident.paymentHistory?.[resident.paymentHistory.length - 1];
  const isPaid = latestPayment?.paid ?? true;

  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-xl p-4 flex items-center gap-3 active:bg-gray-50"
    >
      <div
        className={`w-12 h-12 rounded-full flex items-center justify-center ${
          isPaid ? 'bg-[#34C759]/10' : 'bg-[#FF3B30]/10'
        }`}
      >
        <span className={`font-bold ${isPaid ? 'text-[#34C759]' : 'text-[#FF3B30]'}`}>
          {resident.unit.split('-')[0]}
        </span>
      </div>
      <div className="flex-1 text-left">
        <div className="flex items-center gap-2">
          <span className="font-medium text-[#1D1D1F]">{resident.name}</span>
          {resident.role !== '住戶' && <Badge variant="primary">{resident.role}</Badge>}
        </div>
        <p className="text-sm text-[#86868B]">
          {resident.unit} · {resident.phone}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {!isPaid && <Badge variant="danger">未繳</Badge>}
        <ChevronRightIcon className="w-5 h-5" color="#C7C7CC" />
      </div>
    </button>
  );
};

// 聯絡按鈕
interface ContactButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}

const ContactButton: React.FC<ContactButtonProps> = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center gap-1 py-3 bg-[#F5F5F7] rounded-xl active:bg-[#E8E8ED]"
  >
    {icon}
    <span className="text-xs text-[#86868B]">{label}</span>
  </button>
);

// 資訊列
interface InfoRowProps {
  label: string;
  value: string;
  isLast?: boolean;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, isLast = false }) => (
  <div className={`flex justify-between py-3 ${!isLast ? 'border-b border-[#E8E8ED]' : ''}`}>
    <span className="text-[#86868B]">{label}</span>
    <span className="text-[#1D1D1F] font-medium">{value}</span>
  </div>
);

// 繳費記錄列
interface PaymentRowProps {
  payment: PaymentRecord;
}

const PaymentRow: React.FC<PaymentRowProps> = ({ payment }) => (
  <div className="flex items-center justify-between py-2 border-b border-[#E8E8ED] last:border-0">
    <div>
      <p className="font-medium text-[#1D1D1F]">
        {payment.year}年{payment.month}月
      </p>
      {payment.paidDate && (
        <p className="text-xs text-[#86868B]">繳納日期：{payment.paidDate}</p>
      )}
    </div>
    <div className="text-right">
      <p className="font-medium text-[#1D1D1F]">${payment.amount.toLocaleString()}</p>
      {payment.paid ? (
        <span className="text-xs text-[#34C759]">✓ 已繳</span>
      ) : (
        <span className="text-xs text-[#FF3B30]">未繳</span>
      )}
    </div>
  </div>
);

// ==================== Modals ====================

// 新增住戶 Modal
interface AddResidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Resident, 'id'>) => Promise<void>;
}

const AddResidentModal: React.FC<AddResidentModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    unit: '',
    name: '',
    phone: '',
    lineId: '',
    lineUserId: '',
    role: '住戶' as ResidentRoleLabel,
    moveInDate: new Date().toISOString().split('T')[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetForm = () => {
    setFormData({
      unit: '',
      name: '',
      phone: '',
      lineId: '',
      lineUserId: '',
      role: '住戶',
      moveInDate: new Date().toISOString().split('T')[0],
    });
  };

  const handleSubmit = async () => {
    if (!formData.unit || !formData.name || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        ...formData,
        paymentHistory: [],
      });
      // 成功後重置表單並關閉 Modal
      resetForm();
      onClose();
    } catch (error) {
      console.error('新增住戶失敗:', error);
      alert('新增失敗：' + (error as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 邀請 LINE 好友成為住戶
  const handleInviteFriend = () => {
    const LIFF_ID = '2009004300-wqzTZcHc';
    const inviteUrl = `https://liff.line.me/${LIFF_ID}?register=true&unit=${encodeURIComponent(formData.unit || '待填寫')}`;

    // 先用 window.location 導向 LINE 分享頁面（避免被瀏覽器攔截彈出視窗）
    // 這樣不會被 popup blocker 擋住，因為是同步的使用者點擊事件
    const lineShareUrl = `https://line.me/R/share?text=${encodeURIComponent('邀請您加入幸福社區住戶登記：\n' + inviteUrl)}`;
    window.location.href = lineShareUrl;
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="新增住戶">
      <div className="p-5 space-y-4">
        {/* 邀請好友區塊 */}
        <div className="bg-[#F5F5F7] rounded-xl p-4">
          <button
            onClick={handleInviteFriend}
            className="w-full py-3 bg-[#06C755] text-white rounded-xl font-medium flex items-center justify-center gap-2"
          >
            <LineIcon className="w-5 h-5" color="white" />
            發送加入邀請給 LINE 好友
          </button>
          <p className="text-xs text-[#86868B] text-center mt-3 leading-relaxed">
            📱 選擇好友後會發送邀請訊息<br />
            住戶只要在 LINE 中點一下，即可自動加入清單
          </p>
        </div>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-white text-[#86868B]">或手動輸入資料</span>
          </div>
        </div>

        <div>
          <label className="block text-sm text-[#86868B] mb-1">門牌號碼 *</label>
          <input
            type="text"
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            placeholder="例：3F-1"
            className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3 text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#06C755]"
          />
        </div>
        <div>
          <label className="block text-sm text-[#86868B] mb-1">姓名 *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="住戶姓名"
            className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3 text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#06C755]"
          />
        </div>
        <div>
          <label className="block text-sm text-[#86868B] mb-1">電話</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="0912-345-678"
            className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3 text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#06C755]"
          />
        </div>
        <div>
          <label className="block text-sm text-[#86868B] mb-1">LINE ID</label>
          <input
            type="text"
            value={formData.lineId}
            onChange={(e) => setFormData({ ...formData, lineId: e.target.value })}
            placeholder="選填"
            className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3 text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#06C755]"
          />
        </div>
        <div>
          <label className="block text-sm text-[#86868B] mb-1">身份</label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as ResidentRoleLabel })}
            className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3 text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#06C755]"
          >
            <option value="住戶">住戶</option>
            <option value="主委">主委</option>
            <option value="財委">財委</option>
            <option value="監委">監委</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-[#86868B] mb-1">入住日期</label>
          <input
            type="date"
            value={formData.moveInDate}
            onChange={(e) => setFormData({ ...formData, moveInDate: e.target.value })}
            className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3 text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#06C755]"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!formData.unit || !formData.name || isSubmitting}
          className={`w-full py-4 rounded-xl font-semibold ${
            formData.unit && formData.name && !isSubmitting
              ? 'bg-[#06C755] text-white'
              : 'bg-[#E8E8ED] text-[#86868B]'
          }`}
        >
          {isSubmitting ? '新增中...' : '手動新增住戶'}
        </button>
      </div>
    </Modal>
  );
};

// 編輯住戶 Modal
interface EditResidentModalProps {
  isOpen: boolean;
  onClose: () => void;
  resident: Resident;
  onSubmit: (data: Partial<Resident>) => void;
}

const EditResidentModal: React.FC<EditResidentModalProps> = ({
  isOpen,
  onClose,
  resident,
  onSubmit,
}) => {
  const [formData, setFormData] = useState({
    unit: resident.unit,
    name: resident.name,
    phone: resident.phone,
    lineId: resident.lineId || '',
    role: resident.role,
    moveInDate: resident.moveInDate,
  });

  useEffect(() => {
    setFormData({
      unit: resident.unit,
      name: resident.name,
      phone: resident.phone,
      lineId: resident.lineId || '',
      role: resident.role,
      moveInDate: resident.moveInDate,
    });
  }, [resident]);

  const handleSubmit = () => {
    if (!formData.unit || !formData.name) return;
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="編輯住戶">
      <div className="p-5 space-y-4">
        <div>
          <label className="block text-sm text-[#86868B] mb-1">門牌號碼 *</label>
          <input
            type="text"
            value={formData.unit}
            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
            placeholder="例：3F-1"
            className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3 text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#06C755]"
          />
        </div>
        <div>
          <label className="block text-sm text-[#86868B] mb-1">姓名 *</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="住戶姓名"
            className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3 text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#06C755]"
          />
        </div>
        <div>
          <label className="block text-sm text-[#86868B] mb-1">電話</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
            placeholder="0912-345-678"
            className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3 text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#06C755]"
          />
        </div>
        <div>
          <label className="block text-sm text-[#86868B] mb-1">LINE ID</label>
          <input
            type="text"
            value={formData.lineId}
            onChange={(e) => setFormData({ ...formData, lineId: e.target.value })}
            placeholder="選填"
            className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3 text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#06C755]"
          />
        </div>
        <div>
          <label className="block text-sm text-[#86868B] mb-1">身份</label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value as ResidentRoleLabel })}
            className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3 text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#06C755]"
          >
            <option value="住戶">住戶</option>
            <option value="主委">主委</option>
            <option value="財委">財委</option>
            <option value="監委">監委</option>
          </select>
        </div>
        <div>
          <label className="block text-sm text-[#86868B] mb-1">入住日期</label>
          <input
            type="date"
            value={formData.moveInDate}
            onChange={(e) => setFormData({ ...formData, moveInDate: e.target.value })}
            className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3 text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#06C755]"
          />
        </div>

        <button
          onClick={handleSubmit}
          disabled={!formData.unit || !formData.name}
          className={`w-full py-4 rounded-xl font-semibold ${
            formData.unit && formData.name
              ? 'bg-[#06C755] text-white'
              : 'bg-[#E8E8ED] text-[#86868B]'
          }`}
        >
          儲存變更
        </button>
      </div>
    </Modal>
  );
};

// 更新繳費狀態 Modal
interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (payment: PaymentRecord) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const currentDate = new Date();
  const [formData, setFormData] = useState({
    year: currentDate.getFullYear(),
    month: currentDate.getMonth() + 1,
    amount: 2000,
    paid: true,
    paidDate: currentDate.toISOString().split('T')[0],
  });

  const handleSubmit = () => {
    onSubmit({
      ...formData,
      paidDate: formData.paid ? formData.paidDate : null,
    });
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="更新繳費狀態">
      <div className="p-5 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm text-[#86868B] mb-1">年份</label>
            <select
              value={formData.year}
              onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
              className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3 text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#06C755]"
            >
              {[2023, 2024, 2025, 2026].map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm text-[#86868B] mb-1">月份</label>
            <select
              value={formData.month}
              onChange={(e) => setFormData({ ...formData, month: parseInt(e.target.value) })}
              className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3 text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#06C755]"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((m) => (
                <option key={m} value={m}>{m}月</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm text-[#86868B] mb-1">金額</label>
          <input
            type="number"
            value={formData.amount}
            onChange={(e) => setFormData({ ...formData, amount: parseInt(e.target.value) || 0 })}
            className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3 text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#06C755]"
          />
        </div>

        <div>
          <label className="block text-sm text-[#86868B] mb-1">繳費狀態</label>
          <div className="flex gap-3">
            <button
              onClick={() => setFormData({ ...formData, paid: true })}
              className={`flex-1 py-3 rounded-xl font-medium ${
                formData.paid
                  ? 'bg-[#34C759] text-white'
                  : 'bg-[#F5F5F7] text-[#1D1D1F]'
              }`}
            >
              已繳
            </button>
            <button
              onClick={() => setFormData({ ...formData, paid: false })}
              className={`flex-1 py-3 rounded-xl font-medium ${
                !formData.paid
                  ? 'bg-[#FF3B30] text-white'
                  : 'bg-[#F5F5F7] text-[#1D1D1F]'
              }`}
            >
              未繳
            </button>
          </div>
        </div>

        {formData.paid && (
          <div>
            <label className="block text-sm text-[#86868B] mb-1">繳費日期</label>
            <input
              type="date"
              value={formData.paidDate}
              onChange={(e) => setFormData({ ...formData, paidDate: e.target.value })}
              className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3 text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#06C755]"
            />
          </div>
        )}

        <button
          onClick={handleSubmit}
          className="w-full py-4 rounded-xl font-semibold bg-[#06C755] text-white"
        >
          儲存
        </button>
      </div>
    </Modal>
  );
};

export default {
  ResidentsScreen,
  ResidentDetailScreen,
};

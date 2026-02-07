// 住戶管理畫面
import React, { useState } from 'react';
import { Icons } from '../icons.jsx';
import { Header, SearchBar, Card, Badge, FloatingButton, Modal, ListItem } from '../components.jsx';
import { mockResidents } from '../mockData.js';

// ==================== 住戶列表 ====================
export const ResidentsScreen = ({ setCurrentScreen, setSelectedResident }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all'); // all, unpaid, committee
  const [showAddModal, setShowAddModal] = useState(false);

  // 篩選住戶
  const filteredResidents = mockResidents.filter(resident => {
    const matchesSearch = 
      resident.name.includes(searchQuery) || 
      resident.unit.includes(searchQuery) ||
      resident.phone.includes(searchQuery);
    
    if (!matchesSearch) return false;

    if (filter === 'unpaid') {
      const latestPayment = resident.paymentHistory[resident.paymentHistory.length - 1];
      return !latestPayment?.paid;
    }
    if (filter === 'committee') {
      return ['主委', '財委', '監委'].includes(resident.role);
    }
    return true;
  });

  // 計算未繳數量
  const unpaidCount = mockResidents.filter(r => {
    const latestPayment = r.paymentHistory[r.paymentHistory.length - 1];
    return !latestPayment?.paid;
  }).length;

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

        {/* 批次催繳按鈕 */}
        {filter === 'unpaid' && unpaidCount > 0 && (
          <button className="w-full py-3 bg-[#06C755] text-white rounded-xl font-medium flex items-center justify-center gap-2">
            <Icons.line className="w-5 h-5" color="white" />
            一鍵催繳 {unpaidCount} 戶
          </button>
        )}

        {/* 住戶列表 */}
        <div className="space-y-2">
          {filteredResidents.map(resident => (
            <ResidentCard 
              key={resident.id}
              resident={resident}
              onClick={() => setSelectedResident(resident)}
            />
          ))}
        </div>

        {filteredResidents.length === 0 && (
          <div className="text-center py-12">
            <Icons.users className="w-12 h-12 mx-auto mb-3" color="#C7C7CC" />
            <p className="text-[#86868B]">沒有符合條件的住戶</p>
          </div>
        )}
      </div>

      {/* 新增住戶按鈕 */}
      <FloatingButton onClick={() => setShowAddModal(true)} />

      {/* 新增住戶 Modal */}
      <AddResidentModal 
        isOpen={showAddModal} 
        onClose={() => setShowAddModal(false)} 
      />
    </div>
  );
};

// ==================== 住戶詳情 ====================
export const ResidentDetailScreen = ({ resident, onBack }) => {
  const [activeTab, setActiveTab] = useState('info'); // info, payments

  if (!resident) return null;

  // 計算繳費統計
  const paidCount = resident.paymentHistory.filter(p => p.paid).length;
  const totalCount = resident.paymentHistory.length;
  const totalUnpaid = resident.paymentHistory
    .filter(p => !p.paid)
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="min-h-screen bg-[#F5F5F7] pb-24">
      <Header title="住戶詳情" showBack onBack={onBack} />

      {/* 住戶基本資訊卡片 */}
      <div className="px-5 -mt-2">
        <Card className="shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-full bg-[#06C755]/10 flex items-center justify-center">
              <span className="text-xl font-bold text-[#06C755]">{resident.unit.split('-')[0]}</span>
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#1D1D1F]">{resident.name}</h2>
                {resident.role !== '住戶' && (
                  <Badge variant="primary">{resident.role}</Badge>
                )}
              </div>
              <p className="text-[#86868B]">{resident.unit}</p>
            </div>
          </div>

          {/* 聯絡方式 */}
          <div className="grid grid-cols-3 gap-2">
            <ContactButton 
              icon={<Icons.line className="w-5 h-5" color="#06C755" />}
              label="LINE"
              onClick={() => window.open(`https://line.me/R/ti/p/${resident.lineId}`)}
            />
            <ContactButton 
              icon={<Icons.phone className="w-5 h-5" color="#007AFF" />}
              label="通話"
              onClick={() => window.open(`tel:${resident.phone}`)}
            />
            <ContactButton 
              icon={<Icons.phone className="w-5 h-5" color="#34C759" />}
              label="電話"
              onClick={() => window.open(`tel:${resident.phone}`)}
            />
          </div>
        </Card>
      </div>

      {/* Tab 切換 */}
      <div className="px-5 mt-4">
        <div className="flex bg-[#E8E8ED] rounded-xl p-1">
          <button
            onClick={() => setActiveTab('info')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'info' 
                ? 'bg-white text-[#1D1D1F] shadow-sm' 
                : 'text-[#86868B]'
            }`}
          >
            基本資料
          </button>
          <button
            onClick={() => setActiveTab('payments')}
            className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === 'payments' 
                ? 'bg-white text-[#1D1D1F] shadow-sm' 
                : 'text-[#86868B]'
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
            <InfoRow label="LINE ID" value={resident.lineId} />
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
                  <p className="text-2xl font-bold text-[#FF9500]">${totalUnpaid.toLocaleString()}</p>
                  <p className="text-xs text-[#86868B]">欠繳金額</p>
                </div>
              </div>
            </Card>

            {/* 繳費歷史列表 */}
            <Card>
              <h3 className="font-semibold text-[#1D1D1F] mb-3">繳費歷史</h3>
              <div className="space-y-2">
                {resident.paymentHistory.map((payment, index) => (
                  <PaymentRow key={index} payment={payment} />
                ))}
              </div>
            </Card>

            {/* 催繳按鈕 */}
            {totalUnpaid > 0 && (
              <button className="w-full py-4 bg-[#06C755] text-white rounded-xl font-semibold flex items-center justify-center gap-2">
                <Icons.line className="w-5 h-5" color="white" />
                發送催繳通知
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ==================== 子元件 ====================

// 篩選標籤
const FilterChip = ({ label, active, onClick, variant = 'default' }) => {
  const activeStyles = variant === 'danger' 
    ? 'bg-[#FF3B30] text-white' 
    : 'bg-[#06C755] text-white';
  
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
const ResidentCard = ({ resident, onClick }) => {
  const latestPayment = resident.paymentHistory[resident.paymentHistory.length - 1];
  const isPaid = latestPayment?.paid;

  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-xl p-4 flex items-center gap-3 active:bg-gray-50"
    >
      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
        isPaid ? 'bg-[#34C759]/10' : 'bg-[#FF3B30]/10'
      }`}>
        <span className={`font-bold ${isPaid ? 'text-[#34C759]' : 'text-[#FF3B30]'}`}>
          {resident.unit.split('-')[0]}
        </span>
      </div>
      <div className="flex-1 text-left">
        <div className="flex items-center gap-2">
          <span className="font-medium text-[#1D1D1F]">{resident.name}</span>
          {resident.role !== '住戶' && (
            <Badge variant="primary">{resident.role}</Badge>
          )}
        </div>
        <p className="text-sm text-[#86868B]">{resident.unit} · {resident.phone}</p>
      </div>
      <div className="flex items-center gap-2">
        {!isPaid && (
          <Badge variant="danger">未繳</Badge>
        )}
        <Icons.chevronRight className="w-5 h-5" color="#C7C7CC" />
      </div>
    </button>
  );
};

// 聯絡按鈕
const ContactButton = ({ icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex flex-col items-center gap-1 py-3 bg-[#F5F5F7] rounded-xl active:bg-[#E8E8ED]"
  >
    {icon}
    <span className="text-xs text-[#86868B]">{label}</span>
  </button>
);

// 資訊列
const InfoRow = ({ label, value, isLast = false }) => (
  <div className={`flex justify-between py-3 ${!isLast ? 'border-b border-[#E8E8ED]' : ''}`}>
    <span className="text-[#86868B]">{label}</span>
    <span className="text-[#1D1D1F] font-medium">{value}</span>
  </div>
);

// 繳費記錄列
const PaymentRow = ({ payment }) => (
  <div className="flex items-center justify-between py-2 border-b border-[#E8E8ED] last:border-0">
    <div>
      <p className="font-medium text-[#1D1D1F]">{payment.year}年{payment.month}月</p>
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

// 新增住戶 Modal
const AddResidentModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    unit: '',
    name: '',
    phone: '',
    lineId: '',
  });

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="新增住戶">
      <div className="p-5 space-y-4">
        <div>
          <label className="block text-sm text-[#86868B] mb-1">門牌號碼</label>
          <input
            type="text"
            value={formData.unit}
            onChange={(e) => setFormData({...formData, unit: e.target.value})}
            placeholder="例：3F-1"
            className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3 text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#06C755]"
          />
        </div>
        <div>
          <label className="block text-sm text-[#86868B] mb-1">姓名</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            placeholder="住戶姓名"
            className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3 text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#06C755]"
          />
        </div>
        <div>
          <label className="block text-sm text-[#86868B] mb-1">電話</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
            placeholder="0912-345-678"
            className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3 text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#06C755]"
          />
        </div>
        <div>
          <label className="block text-sm text-[#86868B] mb-1">LINE ID</label>
          <input
            type="text"
            value={formData.lineId}
            onChange={(e) => setFormData({...formData, lineId: e.target.value})}
            placeholder="選填"
            className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3 text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#06C755]"
          />
        </div>

        <button
          onClick={() => {
            // TODO: 實際新增邏輯
            onClose();
          }}
          disabled={!formData.unit || !formData.name}
          className={`w-full py-4 rounded-xl font-semibold ${
            formData.unit && formData.name
              ? 'bg-[#06C755] text-white'
              : 'bg-[#E8E8ED] text-[#86868B]'
          }`}
        >
          新增住戶
        </button>
      </div>
    </Modal>
  );
};

export default {
  ResidentsScreen,
  ResidentDetailScreen,
};

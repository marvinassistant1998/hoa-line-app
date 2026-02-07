// 廠商管理畫面
import React, { useState } from 'react';
import { Icons } from '../icons.jsx';
import { Header, SearchBar, Card, Badge, FloatingButton, Modal } from '../components.jsx';
import { mockVendors } from '../mockData.js';

// ==================== 廠商列表 ====================
export const VendorsScreen = ({ setSelectedVendor }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  const categories = ['all', '電梯維護', '清潔服務', '水電維修', '保全', '其他'];

  const filteredVendors = mockVendors.filter(vendor => {
    const matchesSearch = 
      vendor.name.includes(searchQuery) || 
      vendor.category.includes(searchQuery) ||
      vendor.contact.includes(searchQuery);
    
    if (!matchesSearch) return false;
    if (filter === 'all') return true;
    return vendor.category === filter;
  });

  return (
    <div className="min-h-screen bg-[#F5F5F7] pb-24">
      <Header title="廠商管理" />

      <div className="px-5 space-y-4">
        <SearchBar 
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="搜尋廠商名稱、類別..."
        />

        {/* 類別篩選 */}
        <div className="flex gap-2 overflow-x-auto pb-2 -mx-5 px-5">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                filter === cat 
                  ? 'bg-[#06C755] text-white' 
                  : 'bg-white text-[#1D1D1F]'
              }`}
            >
              {cat === 'all' ? '全部' : cat}
            </button>
          ))}
        </div>

        {/* 廠商列表 */}
        <div className="space-y-3">
          {filteredVendors.map(vendor => (
            <VendorCard 
              key={vendor.id}
              vendor={vendor}
              onClick={() => setSelectedVendor(vendor)}
            />
          ))}
        </div>
      </div>

      <FloatingButton onClick={() => setShowAddModal(true)} />
      <AddVendorModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
    </div>
  );
};

// ==================== 廠商詳情 ====================
export const VendorDetailScreen = ({ vendor, onBack }) => {
  const [activeTab, setActiveTab] = useState('info');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);

  if (!vendor) return null;

  return (
    <div className="min-h-screen bg-[#F5F5F7] pb-24">
      <Header title="廠商詳情" showBack onBack={onBack} />

      <div className="px-5 -mt-2">
        <Card className="shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-[#007AFF]/10 flex items-center justify-center">
              <Icons.building className="w-8 h-8" color="#007AFF" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-[#1D1D1F]">{vendor.name}</h2>
              <p className="text-[#86868B]">{vendor.category}</p>
              <div className="flex items-center gap-1 mt-1">
                {[1,2,3,4,5].map(i => (
                  <Icons.star key={i} className="w-4 h-4" color="#FF9500" filled={i <= vendor.rating} />
                ))}
                <span className="text-sm text-[#86868B] ml-1">{vendor.rating}</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <ContactBtn icon={<Icons.line className="w-5 h-5" color="#06C755" />} label="LINE" />
            <ContactBtn icon={<Icons.phone className="w-5 h-5" color="#007AFF" />} label="電話" />
            <ContactBtn icon={<Icons.edit className="w-5 h-5" color="#FF9500" />} label="編輯" />
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="px-5 mt-4">
        <div className="flex bg-[#E8E8ED] rounded-xl p-1">
          {[{id:'info',label:'基本資料'},{id:'invoices',label:'單據'},{id:'services',label:'服務紀錄'}].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                activeTab === t.id ? 'bg-white text-[#1D1D1F] shadow-sm' : 'text-[#86868B]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-5 mt-4 space-y-4">
        {activeTab === 'info' && (
          <Card>
            <InfoRow label="聯絡人" value={vendor.contact} />
            <InfoRow label="電話" value={vendor.phone} />
            <InfoRow label="LINE ID" value={vendor.lineId || '無'} />
            <InfoRow label="備註" value={vendor.notes || '無'} isLast />
          </Card>
        )}

        {activeTab === 'invoices' && (
          <>
            <button onClick={() => setShowInvoiceModal(true)} className="w-full py-3 bg-[#06C755] text-white rounded-xl font-medium flex items-center justify-center gap-2">
              <Icons.upload className="w-5 h-5" color="white" />
              上傳單據
            </button>
            {vendor.invoices.length > 0 ? (
              <Card>
                {vendor.invoices.map((inv, i) => (
                  <InvoiceRow key={inv.id} invoice={inv} isLast={i === vendor.invoices.length - 1} />
                ))}
              </Card>
            ) : (
              <EmptyMsg icon={<Icons.file className="w-12 h-12" color="#C7C7CC" />} text="尚無單據紀錄" />
            )}
          </>
        )}

        {activeTab === 'services' && (
          <>
            <button onClick={() => setShowServiceModal(true)} className="w-full py-3 bg-[#06C755] text-white rounded-xl font-medium flex items-center justify-center gap-2">
              <Icons.plus className="w-5 h-5" color="white" />
              新增服務紀錄
            </button>
            {vendor.serviceRecords.length > 0 ? (
              <div className="space-y-3">
                {vendor.serviceRecords.map((rec, i) => <ServiceCard key={i} record={rec} />)}
              </div>
            ) : (
              <EmptyMsg icon={<Icons.clipboard className="w-12 h-12" color="#C7C7CC" />} text="尚無服務紀錄" />
            )}
          </>
        )}
      </div>

      <UploadInvoiceModal isOpen={showInvoiceModal} onClose={() => setShowInvoiceModal(false)} />
      <AddServiceModal isOpen={showServiceModal} onClose={() => setShowServiceModal(false)} />
    </div>
  );
};

// ==================== 子元件 ====================
const VendorCard = ({ vendor, onClick }) => (
  <button onClick={onClick} className="w-full bg-white rounded-xl p-4 flex items-center gap-3 active:bg-gray-50">
    <div className="w-12 h-12 rounded-xl bg-[#007AFF]/10 flex items-center justify-center">
      <Icons.building className="w-6 h-6" color="#007AFF" />
    </div>
    <div className="flex-1 text-left">
      <p className="font-medium text-[#1D1D1F]">{vendor.name}</p>
      <p className="text-sm text-[#86868B]">{vendor.category} · {vendor.contact}</p>
    </div>
    <Icons.chevronRight className="w-5 h-5" color="#C7C7CC" />
  </button>
);

const ContactBtn = ({ icon, label }) => (
  <button className="flex flex-col items-center gap-1 py-3 bg-[#F5F5F7] rounded-xl active:bg-[#E8E8ED]">
    {icon}
    <span className="text-xs text-[#86868B]">{label}</span>
  </button>
);

const InfoRow = ({ label, value, isLast }) => (
  <div className={`flex justify-between py-3 ${!isLast ? 'border-b border-[#E8E8ED]' : ''}`}>
    <span className="text-[#86868B]">{label}</span>
    <span className="text-[#1D1D1F] font-medium">{value}</span>
  </div>
);

const InvoiceRow = ({ invoice, isLast }) => (
  <div className={`flex items-center justify-between py-3 ${!isLast ? 'border-b border-[#E8E8ED]' : ''}`}>
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-[#F5F5F7] flex items-center justify-center">
        <Icons.file className="w-5 h-5" color="#86868B" />
      </div>
      <div>
        <p className="font-medium text-[#1D1D1F]">{invoice.description}</p>
        <p className="text-xs text-[#86868B]">{invoice.date}</p>
      </div>
    </div>
    <p className="font-semibold">${invoice.amount.toLocaleString()}</p>
  </div>
);

const ServiceCard = ({ record }) => (
  <Card>
    <div className="flex justify-between mb-2">
      <Badge variant={record.type === '緊急維修' ? 'danger' : 'default'}>{record.type}</Badge>
      <span className="text-sm text-[#86868B]">{record.date}</span>
    </div>
    <p className="font-medium text-[#1D1D1F]">{record.description}</p>
    <div className="flex gap-4 text-sm text-[#86868B] mt-3 pt-3 border-t border-[#E8E8ED]">
      <span>👷 {record.workers} 人</span>
      <span>⏱ {record.duration}</span>
    </div>
  </Card>
);

const EmptyMsg = ({ icon, text }) => (
  <div className="text-center py-8">
    {icon}
    <p className="text-[#86868B] mt-3">{text}</p>
  </div>
);

// ==================== Modals ====================
const AddVendorModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="新增廠商">
      <div className="p-5 space-y-4">
        <InputField label="廠商名稱" />
        <SelectField label="類別" options={['電梯維護','清潔服務','水電維修','保全','其他']} />
        <InputField label="聯絡人" />
        <InputField label="電話" type="tel" />
        <button onClick={onClose} className="w-full py-4 rounded-xl font-semibold bg-[#06C755] text-white">新增廠商</button>
      </div>
    </Modal>
  );
};

const UploadInvoiceModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="上傳單據">
      <div className="p-5 space-y-4">
        <InputField label="說明" placeholder="例：4月保養費" />
        <InputField label="金額" type="number" />
        <InputField label="日期" type="date" />
        <div className="border-2 border-dashed border-[#E8E8ED] rounded-xl p-8 text-center">
          <Icons.camera className="w-10 h-10 mx-auto mb-2" color="#C7C7CC" />
          <p className="text-sm text-[#86868B]">點擊拍照或上傳</p>
        </div>
        <button onClick={onClose} className="w-full py-4 rounded-xl font-semibold bg-[#06C755] text-white">儲存單據</button>
      </div>
    </Modal>
  );
};

const AddServiceModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="新增服務紀錄">
      <div className="p-5 space-y-4">
        <SelectField label="類型" options={['定期保養','緊急維修','例行清潔','維修','其他']} />
        <div>
          <label className="block text-sm text-[#86868B] mb-1">說明</label>
          <textarea rows={3} className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3 resize-none" placeholder="服務內容..." />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <InputField label="人數" type="number" />
          <InputField label="時長" placeholder="例：2小時" />
        </div>
        <InputField label="日期" type="date" />
        <button onClick={onClose} className="w-full py-4 rounded-xl font-semibold bg-[#06C755] text-white">儲存紀錄</button>
      </div>
    </Modal>
  );
};

const InputField = ({ label, type = 'text', placeholder }) => (
  <div>
    <label className="block text-sm text-[#86868B] mb-1">{label}</label>
    <input type={type} placeholder={placeholder} className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3" />
  </div>
);

const SelectField = ({ label, options }) => (
  <div>
    <label className="block text-sm text-[#86868B] mb-1">{label}</label>
    <select className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3">
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
  </div>
);

export default { VendorsScreen, VendorDetailScreen };

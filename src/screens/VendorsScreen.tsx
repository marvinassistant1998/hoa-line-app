import React, { useState } from 'react';
import {
  BuildingIcon,
  ChevronRightIcon,
  LineIcon,
  PhoneIcon,
  EditIcon,
  StarIcon,
  UploadIcon,
  PlusIcon,
  FileIcon,
  ClipboardIcon,
  CameraIcon,
} from '@/components/Icons';
import {
  Header,
  SearchBar,
  Card,
  Badge,
  FloatingButton,
  Modal,
  InputField,
  SelectField,
} from '@/components/ui';
import { useDataStore } from '@/stores/dataStore';
import { usePermission } from '@/hooks/usePermission';
import { showToast } from '@/hooks/useToast';
import type { Vendor, Invoice, ServiceRecord } from '@/types';

// ==================== 廠商列表 ====================
interface VendorsScreenProps {
  setSelectedVendor: (vendor: Vendor | null) => void;
}

export const VendorsScreen: React.FC<VendorsScreenProps> = ({ setSelectedVendor }) => {
  const { vendors, fetchVendors } = useDataStore();
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const canEdit = usePermission('edit_vendors');

  React.useEffect(() => {
    fetchVendors();
  }, [fetchVendors]);

  const categories = ['all', '電梯維護', '清潔服務', '水電維修', '保全', '其他'];

  const filteredVendors = vendors.filter((vendor) => {
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
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                filter === cat ? 'bg-[#06C755] text-white' : 'bg-white text-[#1D1D1F]'
              }`}
            >
              {cat === 'all' ? '全部' : cat}
            </button>
          ))}
        </div>

        {/* 廠商列表 */}
        <div className="space-y-3">
          {filteredVendors.map((vendor) => (
            <VendorCard
              key={vendor.id}
              vendor={vendor}
              onClick={() => setSelectedVendor(vendor)}
            />
          ))}
        </div>
      </div>

      {canEdit && <FloatingButton onClick={() => setShowAddModal(true)} />}
      {canEdit && <AddVendorModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />}
    </div>
  );
};

// ==================== 廠商詳情 ====================
interface VendorDetailScreenProps {
  vendor: Vendor;
  onBack: () => void;
}

export const VendorDetailScreen: React.FC<VendorDetailScreenProps> = ({ vendor, onBack }) => {
  const [activeTab, setActiveTab] = useState<'info' | 'invoices' | 'services'>('info');
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showServiceModal, setShowServiceModal] = useState(false);
  const canEditVendor = usePermission('edit_vendors');
  const canUploadInvoices = usePermission('upload_invoices');

  return (
    <div className="min-h-screen bg-[#F5F5F7] pb-24">
      <Header title="廠商詳情" showBack onBack={onBack} />

      <div className="px-5 -mt-2">
        <Card className="shadow-sm">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-[#007AFF]/10 flex items-center justify-center">
              <BuildingIcon className="w-8 h-8" color="#007AFF" />
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-[#1D1D1F]">{vendor.name}</h2>
              <p className="text-[#86868B]">{vendor.category}</p>
              <div className="flex items-center gap-1 mt-1">
                {[1, 2, 3, 4, 5].map((i) => (
                  <StarIcon
                    key={i}
                    className="w-4 h-4"
                    color="#FF9500"
                    filled={i <= vendor.rating}
                  />
                ))}
                <span className="text-sm text-[#86868B] ml-1">{vendor.rating}</span>
              </div>
            </div>
          </div>

          <div className={`grid ${canEditVendor ? 'grid-cols-3' : 'grid-cols-2'} gap-2`}>
            <ContactBtn
              icon={<LineIcon className="w-5 h-5" color="#06C755" />}
              label="LINE"
              onClick={() => {
                if (vendor.lineId) {
                  window.open(`https://line.me/R/ti/p/${vendor.lineId}`, '_blank');
                } else {
                  showToast('此廠商尚未設定 LINE ID');
                }
              }}
            />
            <ContactBtn
              icon={<PhoneIcon className="w-5 h-5" color="#007AFF" />}
              label="電話"
              onClick={() => {
                if (vendor.phone) {
                  window.open(`tel:${vendor.phone}`);
                } else {
                  showToast('此廠商尚未設定電話');
                }
              }}
            />
            {canEditVendor && (
              <ContactBtn
                icon={<EditIcon className="w-5 h-5" color="#FF9500" />}
                label="編輯"
                onClick={() => showToast('廠商編輯功能開發中')}
              />
            )}
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="px-5 mt-4">
        <div className="flex bg-[#E8E8ED] rounded-xl p-1">
          {[
            { id: 'info', label: '基本資料' },
            { id: 'invoices', label: '單據' },
            { id: 'services', label: '服務紀錄' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as 'info' | 'invoices' | 'services')}
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
            {canUploadInvoices && (
              <button
                onClick={() => setShowInvoiceModal(true)}
                className="w-full py-3 bg-[#06C755] text-white rounded-xl font-medium flex items-center justify-center gap-2"
              >
                <UploadIcon className="w-5 h-5" color="white" />
                上傳單據
              </button>
            )}
            {vendor.invoices.length > 0 ? (
              <Card>
                {vendor.invoices.map((inv, i) => (
                  <InvoiceRow
                    key={inv.id}
                    invoice={inv}
                    isLast={i === vendor.invoices.length - 1}
                  />
                ))}
              </Card>
            ) : (
              <EmptyMsg
                icon={<FileIcon className="w-12 h-12" color="#C7C7CC" />}
                text="尚無單據紀錄"
              />
            )}
          </>
        )}

        {activeTab === 'services' && (
          <>
            {canEditVendor && (
              <button
                onClick={() => setShowServiceModal(true)}
                className="w-full py-3 bg-[#06C755] text-white rounded-xl font-medium flex items-center justify-center gap-2"
              >
                <PlusIcon className="w-5 h-5" color="white" />
                新增服務紀錄
              </button>
            )}
            {vendor.serviceRecords.length > 0 ? (
              <div className="space-y-3">
                {vendor.serviceRecords.map((rec, i) => (
                  <ServiceCard key={i} record={rec} />
                ))}
              </div>
            ) : (
              <EmptyMsg
                icon={<ClipboardIcon className="w-12 h-12" color="#C7C7CC" />}
                text="尚無服務紀錄"
              />
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
interface VendorCardProps {
  vendor: Vendor;
  onClick: () => void;
}

const VendorCard: React.FC<VendorCardProps> = ({ vendor, onClick }) => (
  <button
    onClick={onClick}
    className="w-full bg-white rounded-xl p-4 flex items-center gap-3 active:bg-gray-50"
  >
    <div className="w-12 h-12 rounded-xl bg-[#007AFF]/10 flex items-center justify-center">
      <BuildingIcon className="w-6 h-6" color="#007AFF" />
    </div>
    <div className="flex-1 text-left">
      <p className="font-medium text-[#1D1D1F]">{vendor.name}</p>
      <p className="text-sm text-[#86868B]">
        {vendor.category} · {vendor.contact}
      </p>
    </div>
    <ChevronRightIcon className="w-5 h-5" color="#C7C7CC" />
  </button>
);

interface ContactBtnProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

const ContactBtn: React.FC<ContactBtnProps> = ({ icon, label, onClick }) => (
  <button onClick={onClick} className="flex flex-col items-center gap-1 py-3 bg-[#F5F5F7] rounded-xl active:bg-[#E8E8ED]">
    {icon}
    <span className="text-xs text-[#86868B]">{label}</span>
  </button>
);

interface InfoRowProps {
  label: string;
  value: string;
  isLast?: boolean;
}

const InfoRow: React.FC<InfoRowProps> = ({ label, value, isLast }) => (
  <div className={`flex justify-between py-3 ${!isLast ? 'border-b border-[#E8E8ED]' : ''}`}>
    <span className="text-[#86868B]">{label}</span>
    <span className="text-[#1D1D1F] font-medium">{value}</span>
  </div>
);

interface InvoiceRowProps {
  invoice: Invoice;
  isLast: boolean;
}

const InvoiceRow: React.FC<InvoiceRowProps> = ({ invoice, isLast }) => (
  <div
    className={`flex items-center justify-between py-3 ${!isLast ? 'border-b border-[#E8E8ED]' : ''}`}
  >
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 rounded-lg bg-[#F5F5F7] flex items-center justify-center">
        <FileIcon className="w-5 h-5" color="#86868B" />
      </div>
      <div>
        <p className="font-medium text-[#1D1D1F]">{invoice.description}</p>
        <p className="text-xs text-[#86868B]">{invoice.date}</p>
      </div>
    </div>
    <p className="font-semibold">${invoice.amount.toLocaleString()}</p>
  </div>
);

interface ServiceCardProps {
  record: ServiceRecord;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ record }) => (
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

interface EmptyMsgProps {
  icon: React.ReactNode;
  text: string;
}

const EmptyMsg: React.FC<EmptyMsgProps> = ({ icon, text }) => (
  <div className="text-center py-8">
    {icon}
    <p className="text-[#86868B] mt-3">{text}</p>
  </div>
);

// ==================== Modals ====================
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddVendorModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="新增廠商">
      <div className="p-5 space-y-4">
        <InputField label="廠商名稱" />
        <SelectField
          label="類別"
          options={['電梯維護', '清潔服務', '水電維修', '保全', '其他']}
        />
        <InputField label="聯絡人" />
        <InputField label="電話" type="tel" />
        <button
          onClick={onClose}
          className="w-full py-4 rounded-xl font-semibold bg-[#06C755] text-white"
        >
          新增廠商
        </button>
      </div>
    </Modal>
  );
};

const UploadInvoiceModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="上傳單據">
      <div className="p-5 space-y-4">
        <InputField label="說明" placeholder="例：4月保養費" />
        <InputField label="金額" type="number" />
        <InputField label="日期" type="date" />
        <div className="border-2 border-dashed border-[#E8E8ED] rounded-xl p-8 text-center">
          <CameraIcon className="w-10 h-10 mx-auto mb-2" color="#C7C7CC" />
          <p className="text-sm text-[#86868B]">點擊拍照或上傳</p>
        </div>
        <button
          onClick={onClose}
          className="w-full py-4 rounded-xl font-semibold bg-[#06C755] text-white"
        >
          儲存單據
        </button>
      </div>
    </Modal>
  );
};

const AddServiceModal: React.FC<ModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="新增服務紀錄">
      <div className="p-5 space-y-4">
        <SelectField
          label="類型"
          options={['定期保養', '緊急維修', '例行清潔', '維修', '其他']}
        />
        <div>
          <label className="block text-sm text-[#86868B] mb-1">說明</label>
          <textarea
            rows={3}
            className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#06C755]"
            placeholder="服務內容..."
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <InputField label="人數" type="number" />
          <InputField label="時長" placeholder="例：2小時" />
        </div>
        <InputField label="日期" type="date" />
        <button
          onClick={onClose}
          className="w-full py-4 rounded-xl font-semibold bg-[#06C755] text-white"
        >
          儲存紀錄
        </button>
      </div>
    </Modal>
  );
};

export default { VendorsScreen, VendorDetailScreen };

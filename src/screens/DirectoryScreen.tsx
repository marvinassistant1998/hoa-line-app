import React, { useState, useEffect } from 'react';
import {
  SearchIcon,
  PhoneIcon,
  UsersIcon,
  ChevronRightIcon,
} from '@/components/Icons';
import { Header, Badge, FloatingButton, EmptyState } from '@/components/ui';
import { useDataStore } from '@/stores/dataStore';
import { usePermission } from '@/hooks/usePermission';
import type { Resident } from '@/types';

// 從 unit 字串提取樓層（例如 "3F" → "3F", "3F-1" → "3F", "12樓" → "12樓"）
const extractFloor = (unit: string): string => {
  if (!unit || !unit.trim()) return '未知';
  // 匹配 "數字F" 或 "數字樓" 格式
  const match = unit.match(/^(\d+F|\d+樓)/i);
  if (match) return match[1].toUpperCase();
  // 如果有 "-" 分隔，取第一段
  if (unit.includes('-')) return unit.split('-')[0];
  return unit;
};

// 樓層排序（數字由小到大）
const sortFloors = (a: string, b: string): number => {
  const numA = parseInt(a);
  const numB = parseInt(b);
  if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
  return a.localeCompare(b);
};

interface DirectoryScreenProps {
  setCurrentScreen: (screen: string) => void;
}

export const DirectoryScreen: React.FC<DirectoryScreenProps> = ({
  setCurrentScreen,
}) => {
  const { residents, fetchResidents, isLoading } = useDataStore();
  const canEditResidents = usePermission('edit_residents');
  const canViewPayments = usePermission('view_payments');

  const [searchQuery, setSearchQuery] = useState('');
  const [collapsedFloors, setCollapsedFloors] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchResidents();
  }, [fetchResidents]);

  // 搜尋過濾（姓名、門牌）
  const filteredResidents = residents.filter((r) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      r.name.toLowerCase().includes(query) ||
      r.unit.toLowerCase().includes(query) ||
      r.phone?.toLowerCase().includes(query)
    );
  });

  // 按樓層分組
  const groupedByFloor = filteredResidents.reduce<Record<string, Resident[]>>(
    (groups, resident) => {
      const floor = extractFloor(resident.unit);
      if (!groups[floor]) groups[floor] = [];
      groups[floor].push(resident);
      return groups;
    },
    {}
  );

  // 樓層排序
  const sortedFloors = Object.keys(groupedByFloor).sort(sortFloors);

  // 展開/收合樓層
  const toggleFloor = (floor: string) => {
    setCollapsedFloors((prev) => {
      const next = new Set(prev);
      if (next.has(floor)) {
        next.delete(floor);
      } else {
        next.add(floor);
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-[#F5F5F7] pb-24">
      <Header title="通訊錄" />

      <div className="px-5 space-y-4">
        {/* 搜尋框 */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" color="#86868B" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜尋姓名、門牌..."
            aria-label="搜尋住戶"
            className="w-full bg-[#E8E8ED] rounded-xl pl-10 pr-4 py-3 text-[#1D1D1F] placeholder-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#06C755]"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              aria-label="清除搜尋"
              className="absolute right-1 top-1/2 -translate-y-1/2 text-[#86868B] min-w-[44px] min-h-[44px] flex items-center justify-center"
            >
              ✕
            </button>
          )}
        </div>

        {/* 住戶統計 */}
        {!isLoading && (
          <div className="flex items-center gap-2 text-sm text-[#86868B]">
            <UsersIcon className="w-4 h-4" color="#86868B" />
            <span>共 {filteredResidents.length} 位住戶</span>
            {searchQuery && filteredResidents.length !== residents.length && (
              <span>（搜尋結果）</span>
            )}
          </div>
        )}

        {/* 載入中 */}
        {isLoading && (
          <div className="text-center py-12">
            <div className="w-8 h-8 border-4 border-[#06C755] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
            <p className="text-[#86868B]">載入中...</p>
          </div>
        )}

        {/* 空狀態 */}
        {!isLoading && filteredResidents.length === 0 && (
          <EmptyState
            icon={<UsersIcon className="w-8 h-8" color="#C7C7CC" />}
            title={searchQuery ? '找不到符合的住戶' : '尚無住戶資料'}
            description={searchQuery ? '請嘗試其他搜尋條件' : '社區尚未有住戶加入'}
          />
        )}

        {/* 按樓層分組的住戶列表 */}
        {!isLoading && sortedFloors.map((floor) => {
          const isCollapsed = collapsedFloors.has(floor);
          const floorResidents = groupedByFloor[floor];

          return (
            <div key={floor}>
              {/* 樓層標題（可點擊展開/收合） */}
              <button
                onClick={() => toggleFloor(floor)}
                aria-expanded={!isCollapsed}
                className="w-full flex items-center gap-2 mb-2 min-h-[44px] active:opacity-70"
              >
                <ChevronRightIcon
                  className={`w-4 h-4 transition-transform ${isCollapsed ? '' : 'rotate-90'}`}
                  color="#86868B"
                />
                <span className="text-sm font-semibold text-[#1D1D1F]">{floor}</span>
                <div className="flex-1 h-px bg-[#E8E8ED]" />
                <span className="text-xs text-[#86868B]">{floorResidents.length} 戶</span>
              </button>

              {/* 該樓層住戶卡片（展開時顯示） */}
              {!isCollapsed && (
                <div className="space-y-2 mb-4">
                  {floorResidents.map((resident) => (
                    <ContactCard
                      key={resident.id}
                      resident={resident}
                      showPaymentStatus={canViewPayments}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* 主委可看到 FloatingButton 跳轉新增住戶 */}
      {canEditResidents && (
        <FloatingButton onClick={() => setCurrentScreen('residents')} />
      )}
    </div>
  );
};

// ==================== 聯絡人卡片 ====================
interface ContactCardProps {
  resident: Resident;
  showPaymentStatus: boolean;
}

const ContactCard: React.FC<ContactCardProps> = ({ resident, showPaymentStatus }) => {
  const latestPayment = resident.paymentHistory?.[resident.paymentHistory.length - 1];
  const isUnpaid = latestPayment && !latestPayment.paid;
  const isCommittee = ['主委', '財委', '監委'].includes(resident.role);

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (resident.phone) {
      window.open(`tel:${resident.phone}`);
    }
  };

  return (
    <div className="bg-white rounded-xl p-4 flex items-center gap-3 min-h-[56px]">
      {/* 頭像圓圈 */}
      <div
        className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${
          isCommittee ? 'bg-[#06C755]/10' : 'bg-[#F5F5F7]'
        }`}
      >
        <span
          className={`font-bold text-sm ${
            isCommittee ? 'text-[#06C755]' : 'text-[#86868B]'
          }`}
        >
          {resident.name?.[0] || '?'}
        </span>
      </div>

      {/* 姓名 + 門牌 + 角色 */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium text-[#1D1D1F] truncate">{resident.name}</span>
          {resident.role !== '住戶' && (
            <Badge variant="primary">{resident.role}</Badge>
          )}
          {showPaymentStatus && isUnpaid && (
            <Badge variant="danger">未繳</Badge>
          )}
        </div>
        <p className="text-sm text-[#06C755] font-medium truncate">{resident.unit}</p>
      </div>

      {/* 撥打按鈕 */}
      {resident.phone && (
        <button
          onClick={handleCall}
          aria-label={`撥打電話給${resident.name}`}
          className="w-11 h-11 rounded-full bg-[#06C755]/10 flex items-center justify-center flex-shrink-0 active:bg-[#06C755]/20"
        >
          <PhoneIcon className="w-5 h-5" color="#06C755" />
        </button>
      )}
    </div>
  );
};

export default DirectoryScreen;

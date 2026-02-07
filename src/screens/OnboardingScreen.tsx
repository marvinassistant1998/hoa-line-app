import React, { useState, useEffect } from 'react';
import type { Community } from '@/types';
import { communitiesService } from '@/services/firebase';
import { useDataStore } from '@/stores/dataStore';
import { useAppStore } from '@/stores/appStore';
import { liffService } from '@/services/liff';

type OnboardingStep = 'select-community' | 'create-community' | 'personal-info' | 'confirm';

interface OnboardingData {
  community: Community | null;
  floor: string;
  unitNumber: string;
  unit: string; // 組合後的 "3F-1" 格式
  isChairman: boolean;
}

interface Props {
  onComplete: () => void;
}

export const OnboardingScreen: React.FC<Props> = ({ onComplete }) => {
  const [step, setStep] = useState<OnboardingStep>('select-community');
  const [data, setData] = useState<OnboardingData>({
    community: null,
    floor: '',
    unitNumber: '',
    unit: '',
    isChairman: false,
  });

  // 搜尋社區
  const [searchKeyword, setSearchKeyword] = useState('');
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // 建立新社區
  const [newCommunity, setNewCommunity] = useState({
    name: '',
    address: '',
    floors: '',
    unitsPerFloor: '',
  });

  // 送出狀態
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const { addResident, fetchResidents } = useDataStore();
  const { detectUserRole } = useAppStore();

  // 載入所有社區
  useEffect(() => {
    loadCommunities();
  }, []);

  const loadCommunities = async () => {
    setIsSearching(true);
    try {
      const all = await communitiesService.getAll();
      setCommunities(all);
    } catch (err) {
      console.error('載入社區失敗:', err);
    } finally {
      setIsSearching(false);
    }
  };

  // 過濾社區
  const filteredCommunities = communities.filter(
    (c) =>
      c.name.includes(searchKeyword) ||
      c.address.includes(searchKeyword)
  );

  // 選擇社區
  const selectCommunity = (community: Community) => {
    setData({ ...data, community, floor: '', unitNumber: '', unit: '' });
    setStep('personal-info');
  };

  // 建立新社區
  const handleCreateCommunity = async () => {
    if (!newCommunity.name.trim() || !newCommunity.address.trim()) {
      return;
    }

    setIsSubmitting(true);
    try {
      const profile = await liffService.getProfile();
      const communityData = {
        name: newCommunity.name.trim(),
        address: newCommunity.address.trim(),
        totalUnits: 0,
        monthlyFee: 2000,
        floors: newCommunity.floors ? parseInt(newCommunity.floors) : undefined,
        unitsPerFloor: newCommunity.unitsPerFloor ? parseInt(newCommunity.unitsPerFloor) : undefined,
        createdBy: profile?.userId || '',
        createdAt: new Date(),
      };

      const id = await communitiesService.create(communityData);
      const created: Community = { ...communityData, id };

      setData({ ...data, community: created, floor: '', unitNumber: '', unit: '' });
      setStep('personal-info');
    } catch (err) {
      console.error('建立社區失敗:', err);
      setSubmitError('建立社區失敗：' + (err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 產生樓層選項
  const floorOptions = () => {
    const floors = data.community?.floors || 0;
    if (floors <= 0) return [];
    const options: string[] = [];
    // 加入地下樓層
    options.push('B1');
    for (let i = 1; i <= floors; i++) {
      options.push(`${i}F`);
    }
    return options;
  };

  // 產生門號選項
  const unitOptions = () => {
    const units = data.community?.unitsPerFloor || 0;
    if (units <= 0) return [];
    const options: string[] = [];
    for (let i = 1; i <= units; i++) {
      options.push(`${i}`);
    }
    return options;
  };

  // 組合 unit 字串
  const getUnitString = () => {
    if (data.unit) return data.unit; // 自由輸入模式
    if (data.floor && data.unitNumber) return `${data.floor}-${data.unitNumber}`;
    return '';
  };

  // 前往確認頁
  const goToConfirm = () => {
    const unitStr = getUnitString();
    if (!unitStr) return;
    setData({ ...data, unit: unitStr });
    setStep('confirm');
  };

  // 送出註冊
  const handleSubmit = async () => {
    if (!data.community) return;

    setIsSubmitting(true);
    setSubmitError('');

    try {
      const profile = await liffService.getProfile();
      if (!profile) {
        // 若未登入，嘗試登入
        if (!liffService.isLoggedIn()) {
          liffService.login();
          return;
        }
        throw new Error('無法獲取 LINE 資料');
      }

      const unitStr = getUnitString();

      await addResident({
        communityId: data.community.id,
        name: profile.displayName,
        unit: unitStr,
        phone: '',
        lineId: '',
        lineUserId: profile.userId,
        role: data.isChairman ? '主委' : '住戶',
        moveInDate: new Date().toISOString().split('T')[0],
        paymentHistory: [],
      });

      // 更新社區住戶數
      await communitiesService.update(data.community.id, {
        totalUnits: (data.community.totalUnits || 0) + 1,
      });

      await fetchResidents();
      await detectUserRole(profile.userId);

      setSubmitSuccess(true);

      // 3 秒後進入主畫面
      setTimeout(() => {
        onComplete();
      }, 3000);
    } catch (err) {
      console.error('註冊失敗:', err);
      setSubmitError('註冊失敗：' + (err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ===================== 渲染 =====================

  // 進度指示
  const stepIndex = step === 'select-community' || step === 'create-community' ? 0 : step === 'personal-info' ? 1 : 2;

  const renderProgress = () => (
    <div className="flex items-center justify-center gap-2 mb-6">
      {['選擇社區', '填寫資訊', '確認送出'].map((label, i) => (
        <React.Fragment key={label}>
          <div className="flex flex-col items-center">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                i <= stepIndex
                  ? 'bg-[#06C755] text-white'
                  : 'bg-[#E8E8ED] text-[#86868B]'
              }`}
            >
              {i < stepIndex ? '✓' : i + 1}
            </div>
            <span className={`text-xs mt-1 ${i <= stepIndex ? 'text-[#1D1D1F]' : 'text-[#86868B]'}`}>
              {label}
            </span>
          </div>
          {i < 2 && (
            <div className={`w-12 h-0.5 mb-4 ${i < stepIndex ? 'bg-[#06C755]' : 'bg-[#E8E8ED]'}`} />
          )}
        </React.Fragment>
      ))}
    </div>
  );

  // Step 1: 選擇社區
  const renderSelectCommunity = () => (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <div className="text-4xl mb-2">🏢</div>
        <h2 className="text-xl font-bold text-[#1D1D1F]">歡迎使用社區管理</h2>
        <p className="text-[#86868B] text-sm mt-1">請先選擇您所在的社區</p>
      </div>

      {/* 搜尋框 */}
      <div className="relative">
        <input
          type="text"
          placeholder="搜尋社區名稱或地址..."
          value={searchKeyword}
          onChange={(e) => setSearchKeyword(e.target.value)}
          className="w-full px-4 py-3 bg-white rounded-xl border border-[#E8E8ED] text-[15px] focus:outline-none focus:border-[#06C755]"
        />
        {searchKeyword && (
          <button
            onClick={() => setSearchKeyword('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#86868B]"
          >
            ✕
          </button>
        )}
      </div>

      {/* 社區列表 */}
      {isSearching ? (
        <div className="text-center py-8">
          <div className="w-8 h-8 border-3 border-[#06C755] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-[#86868B] text-sm">載入中...</p>
        </div>
      ) : filteredCommunities.length > 0 ? (
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
          {filteredCommunities.map((c) => (
            <button
              key={c.id}
              onClick={() => selectCommunity(c)}
              className="w-full text-left bg-white rounded-xl p-4 border border-[#E8E8ED] hover:border-[#06C755] transition-colors"
            >
              <div className="font-medium text-[#1D1D1F]">{c.name}</div>
              <div className="text-sm text-[#86868B] mt-1">{c.address}</div>
              {c.totalUnits > 0 && (
                <div className="text-xs text-[#86868B] mt-1">{c.totalUnits} 戶</div>
              )}
            </button>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <p className="text-[#86868B]">
            {searchKeyword ? '找不到符合的社區' : '目前沒有已建立的社區'}
          </p>
        </div>
      )}

      {/* 建立新社區按鈕 */}
      <button
        onClick={() => setStep('create-community')}
        className="w-full py-3 bg-white border-2 border-dashed border-[#06C755] text-[#06C755] rounded-xl font-medium text-[15px]"
      >
        ＋ 建立新社區
      </button>
    </div>
  );

  // Step 1b: 建立新社區
  const renderCreateCommunity = () => (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <div className="text-4xl mb-2">🏗️</div>
        <h2 className="text-xl font-bold text-[#1D1D1F]">建立新社區</h2>
        <p className="text-[#86868B] text-sm mt-1">填寫社區基本資訊</p>
      </div>

      <div className="space-y-3">
        <div>
          <label className="text-sm text-[#86868B] mb-1 block">社區名稱 *</label>
          <input
            type="text"
            placeholder="例：陽光花園社區"
            value={newCommunity.name}
            onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })}
            className="w-full px-4 py-3 bg-white rounded-xl border border-[#E8E8ED] text-[15px] focus:outline-none focus:border-[#06C755]"
          />
        </div>
        <div>
          <label className="text-sm text-[#86868B] mb-1 block">地址 *</label>
          <input
            type="text"
            placeholder="例：台北市大安區信義路三段100號"
            value={newCommunity.address}
            onChange={(e) => setNewCommunity({ ...newCommunity, address: e.target.value })}
            className="w-full px-4 py-3 bg-white rounded-xl border border-[#E8E8ED] text-[15px] focus:outline-none focus:border-[#06C755]"
          />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-[#86868B] mb-1 block">總樓層數</label>
            <input
              type="number"
              placeholder="例：12"
              value={newCommunity.floors}
              onChange={(e) => setNewCommunity({ ...newCommunity, floors: e.target.value })}
              className="w-full px-4 py-3 bg-white rounded-xl border border-[#E8E8ED] text-[15px] focus:outline-none focus:border-[#06C755]"
            />
          </div>
          <div>
            <label className="text-sm text-[#86868B] mb-1 block">每層幾戶</label>
            <input
              type="number"
              placeholder="例：4"
              value={newCommunity.unitsPerFloor}
              onChange={(e) => setNewCommunity({ ...newCommunity, unitsPerFloor: e.target.value })}
              className="w-full px-4 py-3 bg-white rounded-xl border border-[#E8E8ED] text-[15px] focus:outline-none focus:border-[#06C755]"
            />
          </div>
        </div>
      </div>

      {submitError && (
        <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl">{submitError}</div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => {
            setStep('select-community');
            setSubmitError('');
          }}
          className="flex-1 py-3 bg-[#E8E8ED] text-[#1D1D1F] rounded-xl font-medium"
        >
          返回
        </button>
        <button
          onClick={handleCreateCommunity}
          disabled={!newCommunity.name.trim() || !newCommunity.address.trim() || isSubmitting}
          className="flex-1 py-3 bg-[#06C755] text-white rounded-xl font-medium disabled:opacity-50"
        >
          {isSubmitting ? '建立中...' : '建立社區'}
        </button>
      </div>
    </div>
  );

  // Step 2: 填寫個人資訊
  const renderPersonalInfo = () => {
    const floors = floorOptions();
    const units = unitOptions();
    const hasFloorConfig = floors.length > 0;
    const hasUnitConfig = units.length > 0;

    return (
      <div className="space-y-4">
        <div className="text-center mb-4">
          <div className="text-4xl mb-2">📝</div>
          <h2 className="text-xl font-bold text-[#1D1D1F]">填寫您的資訊</h2>
          <p className="text-[#86868B] text-sm mt-1">{data.community?.name}</p>
        </div>

        <div className="space-y-3">
          {hasFloorConfig ? (
            <>
              <div>
                <label className="text-sm text-[#86868B] mb-1 block">樓層</label>
                <select
                  value={data.floor}
                  onChange={(e) => setData({ ...data, floor: e.target.value, unit: '' })}
                  className="w-full px-4 py-3 bg-white rounded-xl border border-[#E8E8ED] text-[15px] focus:outline-none focus:border-[#06C755]"
                >
                  <option value="">請選擇樓層</option>
                  {floors.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
              {hasUnitConfig && (
                <div>
                  <label className="text-sm text-[#86868B] mb-1 block">門號</label>
                  <select
                    value={data.unitNumber}
                    onChange={(e) => setData({ ...data, unitNumber: e.target.value, unit: '' })}
                    className="w-full px-4 py-3 bg-white rounded-xl border border-[#E8E8ED] text-[15px] focus:outline-none focus:border-[#06C755]"
                  >
                    <option value="">請選擇門號</option>
                    {units.map((u) => (
                      <option key={u} value={u}>{u}</option>
                    ))}
                  </select>
                </div>
              )}
              {!hasUnitConfig && (
                <div>
                  <label className="text-sm text-[#86868B] mb-1 block">門號</label>
                  <input
                    type="text"
                    placeholder="例：1"
                    value={data.unitNumber}
                    onChange={(e) => setData({ ...data, unitNumber: e.target.value, unit: '' })}
                    className="w-full px-4 py-3 bg-white rounded-xl border border-[#E8E8ED] text-[15px] focus:outline-none focus:border-[#06C755]"
                  />
                </div>
              )}
            </>
          ) : (
            <div>
              <label className="text-sm text-[#86868B] mb-1 block">門牌號碼</label>
              <input
                type="text"
                placeholder="例：3F-1 或 301"
                value={data.unit}
                onChange={(e) => setData({ ...data, unit: e.target.value })}
                className="w-full px-4 py-3 bg-white rounded-xl border border-[#E8E8ED] text-[15px] focus:outline-none focus:border-[#06C755]"
              />
            </div>
          )}

          {/* 主委勾選 */}
          <div
            onClick={() => setData({ ...data, isChairman: !data.isChairman })}
            className="flex items-center gap-3 bg-white rounded-xl p-4 border border-[#E8E8ED] cursor-pointer"
          >
            <div
              className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                data.isChairman
                  ? 'bg-[#06C755] border-[#06C755]'
                  : 'border-[#C7C7CC] bg-white'
              }`}
            >
              {data.isChairman && (
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <div>
              <div className="text-[15px] text-[#1D1D1F] font-medium">我是這棟大樓的主委</div>
              <div className="text-xs text-[#86868B]">勾選後將擁有管理權限</div>
            </div>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => setStep('select-community')}
            className="flex-1 py-3 bg-[#E8E8ED] text-[#1D1D1F] rounded-xl font-medium"
          >
            返回
          </button>
          <button
            onClick={goToConfirm}
            disabled={!getUnitString()}
            className="flex-1 py-3 bg-[#06C755] text-white rounded-xl font-medium disabled:opacity-50"
          >
            下一步
          </button>
        </div>
      </div>
    );
  };

  // Step 3: 確認資訊
  const renderConfirm = () => {
    if (submitSuccess) {
      return (
        <div className="text-center py-12">
          <div className="w-20 h-20 bg-[#06C755] rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#1D1D1F] mb-2">歡迎加入！</h2>
          <p className="text-[#86868B]">您已成功註冊為社區{data.isChairman ? '主委' : '住戶'}</p>
          <p className="text-[#86868B] text-sm mt-2">即將進入主畫面...</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="text-center mb-4">
          <div className="text-4xl mb-2">✅</div>
          <h2 className="text-xl font-bold text-[#1D1D1F]">確認您的資訊</h2>
          <p className="text-[#86868B] text-sm mt-1">請確認以下資訊是否正確</p>
        </div>

        <div className="bg-white rounded-xl p-4 space-y-3 border border-[#E8E8ED]">
          <div>
            <div className="text-xs text-[#86868B]">社區</div>
            <div className="text-[15px] text-[#1D1D1F] font-medium">{data.community?.name}</div>
            <div className="text-sm text-[#86868B]">{data.community?.address}</div>
          </div>
          <div className="border-t border-[#E8E8ED] pt-3">
            <div className="text-xs text-[#86868B]">門牌號碼</div>
            <div className="text-[15px] text-[#1D1D1F] font-medium">{getUnitString()}</div>
          </div>
          <div className="border-t border-[#E8E8ED] pt-3">
            <div className="text-xs text-[#86868B]">角色</div>
            <div className="text-[15px] text-[#1D1D1F] font-medium">
              {data.isChairman ? '🏆 主委' : '🏠 住戶'}
            </div>
          </div>
        </div>

        {submitError && (
          <div className="bg-red-50 text-red-600 text-sm p-3 rounded-xl">{submitError}</div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => {
              setStep('personal-info');
              setSubmitError('');
            }}
            className="flex-1 py-3 bg-[#E8E8ED] text-[#1D1D1F] rounded-xl font-medium"
          >
            修改
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 py-3 bg-[#06C755] text-white rounded-xl font-medium disabled:opacity-50"
          >
            {isSubmitting ? '送出中...' : '確認送出'}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-md mx-auto bg-[#F5F5F7] min-h-screen p-5 pt-8">
      {!submitSuccess && renderProgress()}

      {step === 'select-community' && renderSelectCommunity()}
      {step === 'create-community' && renderCreateCommunity()}
      {step === 'personal-info' && renderPersonalInfo()}
      {step === 'confirm' && renderConfirm()}
    </div>
  );
};

export default OnboardingScreen;

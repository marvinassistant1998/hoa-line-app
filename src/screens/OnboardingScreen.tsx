import React, { useState, useEffect } from 'react';
import type { Community } from '@/types';
import { communitiesService } from '@/services/firebase';
import { useDataStore } from '@/stores/dataStore';
import { useAppStore } from '@/stores/appStore';
import { liffService } from '@/services/liff';
import { useAddressSearch } from '@/hooks/useAddressSearch';

type OnboardingStep = 'select-community' | 'create-community' | 'personal-info' | 'confirm';

interface OnboardingData {
  community: Community | null;
  floor: string;
  unitNumber: string;
  unit: string;
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

  // 搜尋現有社區
  const [searchKeyword, setSearchKeyword] = useState('');
  const [communities, setCommunities] = useState<Community[]>([]);
  const [isLoadingCommunities, setIsLoadingCommunities] = useState(false);

  // 建立新社區：地址 autocomplete
  const [addressInput, setAddressInput] = useState('');
  const [selectedAddress, setSelectedAddress] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const { suggestions, isSearching: isAddressSearching, search: searchAddress, clear: clearSuggestions } = useAddressSearch();
  const [communityName, setCommunityName] = useState('');
  const [useAddressAsName, setUseAddressAsName] = useState(true);
  const [newFloors, setNewFloors] = useState('');
  const [newUnitsPerFloor, setNewUnitsPerFloor] = useState('');

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
    setIsLoadingCommunities(true);
    try {
      const all = await communitiesService.getAll();
      setCommunities(all);
    } catch (err) {
      console.error('載入社區失敗:', err);
    } finally {
      setIsLoadingCommunities(false);
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

  // 地址輸入時觸發 autocomplete
  const handleAddressInput = (value: string) => {
    setAddressInput(value);
    setSelectedAddress('');
    setShowSuggestions(true);
    searchAddress(value);
  };

  // 選擇推薦地址
  const selectSuggestion = (suggestion: { description: string }) => {
    // 去掉尾端的國家名稱
    const addr = suggestion.description
      .replace(/台灣$/i, '')
      .replace(/Taiwan$/i, '')
      .trim();

    setAddressInput(addr);
    setSelectedAddress(addr);
    setShowSuggestions(false);
    clearSuggestions();
  };

  // 確認地址是否已填寫
  const isAddressReady = selectedAddress.trim().length > 0 || addressInput.trim().length >= 5;

  // 建立新社區
  const handleCreateCommunity = async () => {
    const finalAddress = selectedAddress || addressInput.trim();
    if (!finalAddress) return;

    setIsSubmitting(true);
    setSubmitError('');
    try {
      let profile = null;
      try {
        profile = await liffService.getProfile();
      } catch {
        // 測試模式
      }

      const finalName = useAddressAsName || !communityName.trim()
        ? finalAddress
        : communityName.trim();

      const communityData = {
        name: finalName,
        address: finalAddress,
        totalUnits: 0,
        monthlyFee: 2000,
        floors: newFloors ? parseInt(newFloors) : undefined,
        unitsPerFloor: newUnitsPerFloor ? parseInt(newUnitsPerFloor) : undefined,
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
    if (data.unit) return data.unit;
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
      let profile = null;
      try {
        profile = await liffService.getProfile();
      } catch {
        // 測試模式
      }

      if (!profile) {
        try {
          if (!liffService.isLoggedIn()) {
            liffService.login();
            return;
          }
        } catch {
          // 測試模式下忽略
        }
      }

      const unitStr = getUnitString();
      const displayName = profile?.displayName || '測試用戶';
      const userId = profile?.userId || 'test-user';

      await addResident({
        communityId: data.community.id,
        name: displayName,
        unit: unitStr,
        phone: '',
        lineId: '',
        lineUserId: userId,
        role: data.isChairman ? '主委' : '住戶',
        moveInDate: new Date().toISOString().split('T')[0],
        paymentHistory: [],
      });

      await communitiesService.update(data.community.id, {
        totalUnits: (data.community.totalUnits || 0) + 1,
      });

      await fetchResidents();

      if (profile?.userId) {
        await detectUserRole(profile.userId);
      }

      setSubmitSuccess(true);
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
      {isLoadingCommunities ? (
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

  // Step 1b: 建立新社區（智慧地址搜尋）
  const renderCreateCommunity = () => (
    <div className="space-y-4">
      <div className="text-center mb-4">
        <div className="text-4xl mb-2">🏗️</div>
        <h2 className="text-xl font-bold text-[#1D1D1F]">建立新社區</h2>
        <p className="text-[#86868B] text-sm mt-1">輸入社區地址，系統會自動推薦</p>
      </div>

      <div className="space-y-3">
        {/* 地址搜尋欄位 */}
        <div className="relative">
          <label className="text-sm text-[#86868B] mb-1 block">社區地址 *</label>
          <div className="relative">
            <input
              type="text"
              placeholder="輸入地址，例：台北市大安區信義路..."
              value={addressInput}
              onChange={(e) => handleAddressInput(e.target.value)}
              onFocus={() => {
                if (suggestions.length > 0) setShowSuggestions(true);
              }}
              className="w-full px-4 py-3 bg-white rounded-xl border border-[#E8E8ED] text-[15px] focus:outline-none focus:border-[#06C755] pr-10"
            />
            {isAddressSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-5 h-5 border-2 border-[#06C755] border-t-transparent rounded-full animate-spin" />
              </div>
            )}
            {!isAddressSearching && addressInput && (
              <button
                onClick={() => {
                  setAddressInput('');
                  setSelectedAddress('');
                  clearSuggestions();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#86868B]"
              >
                ✕
              </button>
            )}
          </div>

          {/* 推薦下拉選單 */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white rounded-xl border border-[#E8E8ED] shadow-lg max-h-[240px] overflow-y-auto">
              {suggestions.map((s, i) => (
                <button
                  key={s.placeId || i}
                  onClick={() => selectSuggestion(s)}
                  className="w-full text-left px-4 py-3 hover:bg-[#F0FFF4] border-b border-[#F5F5F7] last:border-b-0 transition-colors"
                >
                  <div className="text-[14px] text-[#1D1D1F] font-medium">{s.mainText}</div>
                  {s.secondaryText && (
                    <div className="text-[12px] text-[#86868B] mt-0.5">{s.secondaryText}</div>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* 選中的地址確認 */}
        {selectedAddress && (
          <div className="bg-[#F0FFF4] border border-[#06C755]/20 rounded-xl p-3 flex items-center gap-2">
            <span className="text-[#06C755] text-lg">✓</span>
            <div>
              <div className="text-xs text-[#06C755]">已選擇地址</div>
              <div className="text-[15px] text-[#1D1D1F]">{selectedAddress}</div>
            </div>
          </div>
        )}

        {/* 找不到地址的提示 */}
        {!selectedAddress && addressInput.length >= 5 && (
          <p className="text-xs text-[#86868B]">
            找不到推薦？沒關係，你可以直接輸入完整地址後按「下一步」
          </p>
        )}

        {/* 社區名稱 */}
        <div className="border-t border-[#E8E8ED] pt-3">
          <div
            onClick={() => setUseAddressAsName(!useAddressAsName)}
            className="flex items-center gap-3 cursor-pointer mb-2"
          >
            <div
              className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors ${
                useAddressAsName ? 'bg-[#06C755] border-[#06C755]' : 'border-[#C7C7CC] bg-white'
              }`}
            >
              {useAddressAsName && (
                <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              )}
            </div>
            <span className="text-[15px] text-[#1D1D1F]">使用地址作為社區名稱</span>
          </div>

          {!useAddressAsName && (
            <input
              type="text"
              placeholder="輸入社區名稱，例：陽光花園社區"
              value={communityName}
              onChange={(e) => setCommunityName(e.target.value)}
              className="w-full px-4 py-3 bg-white rounded-xl border border-[#E8E8ED] text-[15px] focus:outline-none focus:border-[#06C755]"
            />
          )}
        </div>

        {/* 大樓設定 */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-sm text-[#86868B] mb-1 block">總樓層數</label>
            <input
              type="number"
              placeholder="例：12"
              value={newFloors}
              onChange={(e) => setNewFloors(e.target.value)}
              className="w-full px-4 py-3 bg-white rounded-xl border border-[#E8E8ED] text-[15px] focus:outline-none focus:border-[#06C755]"
            />
          </div>
          <div>
            <label className="text-sm text-[#86868B] mb-1 block">每層幾戶</label>
            <input
              type="number"
              placeholder="例：4"
              value={newUnitsPerFloor}
              onChange={(e) => setNewUnitsPerFloor(e.target.value)}
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
          disabled={!isAddressReady || isSubmitting}
          className="flex-1 py-3 bg-[#06C755] text-white rounded-xl font-medium disabled:opacity-50"
        >
          {isSubmitting ? '建立中...' : '下一步'}
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
              {hasUnitConfig ? (
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
              ) : (
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
            {data.community?.name !== data.community?.address && (
              <div className="text-sm text-[#86868B]">{data.community?.address}</div>
            )}
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

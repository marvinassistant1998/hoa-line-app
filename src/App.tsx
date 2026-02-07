import React, { useEffect, useState } from 'react';
import { TabBar } from '@/components/ui';
import {
  HomeScreen,
  ResidentsScreen,
  ResidentDetailScreen,
  VendorsScreen,
  VendorDetailScreen,
  SettingsScreen,
} from '@/screens';
import { useAppStore } from '@/stores/appStore';
import { useDataStore } from '@/stores/dataStore';
import { liffService } from '@/services/liff';
import { getVisibleTabs } from '@/lib/permissions';
import type { ResidentRoleLabel } from '@/types';

const App: React.FC = () => {
  const {
    isLoading,
    error,
    userProfile,
    userRole,
    currentScreen,
    selectedResident,
    selectedVendor,
    initializeLiff,
    detectUserRole,
    setCurrentScreen,
    setSelectedResident,
    setSelectedVendor,
    handleBack,
    devSetRole,
  } = useAppStore();

  const { addResident, fetchResidents } = useDataStore();
  const [registerStatus, setRegisterStatus] = useState<'idle' | 'registering' | 'success' | 'error'>('idle');
  const [registerMessage, setRegisterMessage] = useState('');

  // 初始化 LIFF
  useEffect(() => {
    initializeLiff();
  }, [initializeLiff]);

  // LIFF 登入後偵測角色
  useEffect(() => {
    if (!isLoading && userProfile?.userId) {
      detectUserRole(userProfile.userId);
    }
    // Demo 模式（沒有 LIFF）：預設為主委
    if (!isLoading && !userProfile && error) {
      devSetRole('主委');
    }
  }, [isLoading, userProfile, error]);

  // 處理住戶自動註冊（從邀請連結進入）
  useEffect(() => {
    const handleAutoRegister = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const isRegister = urlParams.get('register') === 'true';
      const unit = urlParams.get('unit') || '';

      if (!isRegister) return;

      // 清除 URL 參數，避免重複註冊
      window.history.replaceState({}, '', window.location.pathname);

      setRegisterStatus('registering');
      setRegisterMessage('正在為您登記...');

      try {
        const profile = await liffService.getProfile();

        if (!profile) {
          if (!liffService.isLoggedIn()) {
            liffService.login();
            return;
          }
          throw new Error('無法獲取您的 LINE 資料');
        }

        await addResident({
          name: profile.displayName,
          unit: unit === '待填寫' ? '' : unit,
          phone: '',
          lineId: '',
          lineUserId: profile.userId,
          role: '住戶',
          moveInDate: new Date().toISOString().split('T')[0],
          paymentHistory: [],
        });

        await fetchResidents();
        // 重新偵測角色
        await detectUserRole(profile.userId);

        setRegisterStatus('success');
        setRegisterMessage(`${profile.displayName}，歡迎加入！您已成功登記為社區住戶。`);

        setTimeout(() => {
          setRegisterStatus('idle');
        }, 5000);

      } catch (err) {
        console.error('自動註冊失敗:', err);
        setRegisterStatus('error');
        setRegisterMessage('登記失敗：' + (err as Error).message);

        setTimeout(() => {
          setRegisterStatus('idle');
        }, 5000);
      }
    };

    if (!isLoading) {
      handleAutoRegister();
    }
  }, [isLoading, addResident, fetchResidents]);

  // 載入中畫面
  if (isLoading) {
    return (
      <div className="max-w-md mx-auto bg-[#F5F5F7] min-h-screen flex items-center justify-center font-[-apple-system,BlinkMacSystemFont,sans-serif]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#06C755] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#86868B]">載入中...</p>
        </div>
      </div>
    );
  }

  // 錯誤畫面（但仍可使用 Demo 模式）
  if (error) {
    console.warn('LIFF 初始化失敗，使用 Demo 模式:', error);
  }

  // 可見的 Tab
  const visibleTabs = getVisibleTabs(userRole);

  // 路由渲染
  const renderScreen = () => {
    // 住戶詳情
    if (selectedResident) {
      return (
        <ResidentDetailScreen
          resident={selectedResident}
          onBack={() => handleBack('residents')}
        />
      );
    }

    // 廠商詳情
    if (selectedVendor) {
      return (
        <VendorDetailScreen
          vendor={selectedVendor}
          onBack={() => handleBack('vendors')}
        />
      );
    }

    // 主要畫面
    switch (currentScreen) {
      case 'residents':
        return (
          <ResidentsScreen
            setCurrentScreen={setCurrentScreen}
            setSelectedResident={setSelectedResident}
          />
        );
      case 'vendors':
        return <VendorsScreen setSelectedVendor={setSelectedVendor} />;
      case 'settings':
        return <SettingsScreen />;
      default:
        return (
          <HomeScreen
            setCurrentScreen={setCurrentScreen}
            setSelectedResident={setSelectedResident}
          />
        );
    }
  };

  // 判斷是否顯示 TabBar（詳情頁不顯示）
  const showTabBar = !selectedResident && !selectedVendor;

  return (
    <div className="max-w-md mx-auto bg-[#F5F5F7] min-h-screen font-[-apple-system,BlinkMacSystemFont,sans-serif]">
      {/* 開發用角色切換器 */}
      {(error || !userProfile) && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-100 border-b border-yellow-300 px-3 py-1 z-50 flex items-center justify-between max-w-md mx-auto">
          <span className="text-xs text-yellow-800">Demo 模式 - 角色：</span>
          <div className="flex gap-1">
            {(['主委', '財委', '監委', '住戶'] as ResidentRoleLabel[]).map((role) => (
              <button
                key={role}
                onClick={() => devSetRole(role)}
                className={`text-xs px-2 py-0.5 rounded ${
                  userRole === role
                    ? 'bg-[#06C755] text-white'
                    : 'bg-white text-gray-600'
                }`}
              >
                {role}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* 自動註冊狀態提示 */}
      {registerStatus !== 'idle' && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-5">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full text-center shadow-xl">
            {registerStatus === 'registering' && (
              <>
                <div className="w-12 h-12 border-4 border-[#06C755] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-[#1D1D1F] font-medium">{registerMessage}</p>
              </>
            )}
            {registerStatus === 'success' && (
              <>
                <div className="w-16 h-16 bg-[#06C755] rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <p className="text-[#1D1D1F] font-medium text-lg mb-2">登記成功！</p>
                <p className="text-[#86868B] text-sm">{registerMessage}</p>
              </>
            )}
            {registerStatus === 'error' && (
              <>
                <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <p className="text-[#1D1D1F] font-medium text-lg mb-2">登記失敗</p>
                <p className="text-[#86868B] text-sm">{registerMessage}</p>
              </>
            )}
          </div>
        </div>
      )}

      {renderScreen()}
      {showTabBar && (
        <TabBar
          currentScreen={currentScreen}
          setCurrentScreen={setCurrentScreen}
          visibleTabs={visibleTabs}
        />
      )}
    </div>
  );
};

export default App;

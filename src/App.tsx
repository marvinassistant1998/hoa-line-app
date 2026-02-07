import React, { useEffect, useState } from 'react';
import { TabBar } from '@/components/ui';
import {
  HomeScreen,
  AnnouncementsScreen,
  OnboardingScreen,
  ResidentsScreen,
  ResidentDetailScreen,
  VendorsScreen,
  VendorDetailScreen,
  SettingsScreen,
} from '@/screens';
import { useAppStore } from '@/stores/appStore';
import { useToastStore } from '@/hooks/useToast';
import { clearAllData } from '@/services/firebase';
import { getVisibleTabs } from '@/lib/permissions';
import type { ResidentRoleLabel } from '@/types';

const App: React.FC = () => {
  const {
    isLoading,
    error,
    userProfile,
    userRole,
    registrationStatus,
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

  const { message: toastMessage, visible: toastVisible } = useToastStore();

  const [clearingData, setClearingData] = useState(false);
  const [clearDone, setClearDone] = useState(false);

  // 清除測試資料（?clear-data=true）
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('clear-data') === 'true') {
      setClearingData(true);
      clearAllData().then(() => {
        setClearDone(true);
        setTimeout(() => {
          window.location.replace(window.location.pathname + '?test-onboarding=true');
        }, 1500);
      }).catch(() => {
        setClearingData(false);
        alert('清除失敗');
      });
    }
  }, []);

  // 初始化 LIFF
  useEffect(() => {
    initializeLiff();
  }, [initializeLiff]);

  // LIFF 登入後偵測角色
  useEffect(() => {
    const initRole = async () => {
      if (isLoading) return;

      // Demo 模式（沒有 LIFF）：預設為主委以便測試
      if (!userProfile && error) {
        devSetRole('主委');
        return;
      }

      // 偵測角色
      if (userProfile?.userId) {
        await detectUserRole(userProfile.userId);
      }
    };

    initRole();
  }, [isLoading]);

  // Onboarding 完成後的回調
  const handleOnboardingComplete = () => {
    // OnboardingScreen 內部已經呼叫 detectUserRole 更新了角色
    // 這裡只需要確保畫面切換到首頁
    setCurrentScreen('home');
  };

  // 清除資料畫面
  if (clearingData) {
    return (
      <div className="max-w-md mx-auto bg-[#F5F5F7] min-h-screen flex items-center justify-center font-[-apple-system,BlinkMacSystemFont,sans-serif]">
        <div className="text-center">
          <div className="text-4xl mb-4">{clearDone ? '✅' : '🗑️'}</div>
          <p className="text-[#1D1D1F] font-medium">
            {clearDone ? '資料已清除！即將重新載入...' : '正在清除測試資料...'}
          </p>
        </div>
      </div>
    );
  }

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

  // 未註冊用戶 → 顯示 Onboarding
  // 真實環境：LIFF 登入但 Firestore 沒有此用戶
  // 測試模式：網址帶 ?test-onboarding=true
  const testOnboarding = new URLSearchParams(window.location.search).get('test-onboarding') === 'true';
  const showOnboarding = testOnboarding || (registrationStatus === 'unregistered' && userProfile && !error);

  if (showOnboarding) {
    return (
      <div className="font-[-apple-system,BlinkMacSystemFont,sans-serif]">
        <OnboardingScreen onComplete={handleOnboardingComplete} />
      </div>
    );
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
      case 'announcements':
        return <AnnouncementsScreen onBack={() => setCurrentScreen('home')} />;
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
      {/* 角色切換器：開發環境 或 網址帶 ?dev=true 時顯示 */}
      {(import.meta.env.DEV || new URLSearchParams(window.location.search).get('dev') === 'true') && (error || !userProfile) && (
        <div className="fixed top-0 left-0 right-0 bg-yellow-100 border-b border-yellow-300 px-3 py-1 z-50 flex items-center justify-between max-w-md mx-auto">
          <span className="text-xs text-yellow-800">測試模式 - 角色：</span>
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

      {renderScreen()}
      {showTabBar && (
        <TabBar
          currentScreen={currentScreen}
          setCurrentScreen={setCurrentScreen}
          visibleTabs={visibleTabs}
        />
      )}

      {/* 全局 Toast 提示 */}
      {toastVisible && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-[60] bg-[#1D1D1F] text-white px-5 py-3 rounded-xl shadow-lg text-sm font-medium animate-fade-in max-w-[80%] text-center">
          {toastMessage}
        </div>
      )}
    </div>
  );
};

export default App;

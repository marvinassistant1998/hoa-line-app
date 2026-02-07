// 管委會 AI 虛擬總幹事 - LINE LIFF 版本 v6
// 整合版主程式

import React, { useState } from 'react';
import { TabBar } from './components.jsx';
import { HomeScreen } from './screens/HomeScreen.jsx';
import { ResidentsScreen, ResidentDetailScreen } from './screens/ResidentsScreen.jsx';
import { VendorsScreen, VendorDetailScreen } from './screens/VendorsScreen.jsx';
import { SettingsScreen } from './screens/SettingsScreen.jsx';

const HOALineApp = () => {
  // 導航狀態
  const [currentScreen, setCurrentScreen] = useState('home');
  
  // 資料狀態
  const [selectedResident, setSelectedResident] = useState(null);
  const [selectedVendor, setSelectedVendor] = useState(null);

  // 處理返回
  const handleBack = (screen) => {
    setCurrentScreen(screen);
    setSelectedResident(null);
    setSelectedVendor(null);
  };

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
        return (
          <VendorsScreen 
            setSelectedVendor={setSelectedVendor}
          />
        );
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
      {renderScreen()}
      {showTabBar && (
        <TabBar 
          currentScreen={currentScreen} 
          setCurrentScreen={setCurrentScreen} 
        />
      )}
    </div>
  );
};

export default HOALineApp;

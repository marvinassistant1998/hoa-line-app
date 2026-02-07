// 共用元件 - TabBar, Header, Layout
import React from 'react';
import { Icons } from './icons.jsx';

// 底部導航列
export const TabBar = ({ currentScreen, setCurrentScreen }) => {
  const tabs = [
    { id: 'home', label: '首頁', Icon: Icons.home },
    { id: 'residents', label: '住戶', Icon: Icons.users },
    { id: 'vendors', label: '廠商', Icon: Icons.building },
    { id: 'settings', label: '設定', Icon: Icons.settings },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-xl border-t border-[#E8E8ED] px-6 pt-2 pb-8 z-40">
      <div className="flex justify-around">
        {tabs.map((item) => {
          const isActive = currentScreen === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentScreen(item.id)}
              className={`flex flex-col items-center gap-1 min-w-[64px] ${
                isActive ? 'text-[#06C755]' : 'text-[#86868B]'
              }`}
            >
              <item.Icon 
                className="w-6 h-6" 
                color={isActive ? '#06C755' : '#86868B'} 
                filled={isActive} 
              />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
};

// 頁面標題列
export const Header = ({ 
  title, 
  showBack = false, 
  onBack, 
  rightAction = null,
  transparent = false 
}) => (
  <div className={`sticky top-0 z-30 ${transparent ? '' : 'bg-white/90 backdrop-blur-xl border-b border-[#E8E8ED]'}`}>
    <div className="h-12" /> {/* Status bar spacing */}
    <div className="px-5 py-4 flex items-center justify-between">
      <div className="w-20">
        {showBack && (
          <button onClick={onBack} className="flex items-center text-[#06C755]">
            <Icons.chevronLeft className="w-5 h-5" color="#06C755" />
            <span>返回</span>
          </button>
        )}
      </div>
      <h1 className="text-lg font-semibold text-[#1D1D1F]">{title}</h1>
      <div className="w-20 flex justify-end">
        {rightAction}
      </div>
    </div>
  </div>
);

// 搜尋框
export const SearchBar = ({ value, onChange, placeholder = "搜尋..." }) => (
  <div className="relative">
    <Icons.search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" color="#86868B" />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-[#E8E8ED] rounded-xl pl-10 pr-4 py-3 text-[#1D1D1F] placeholder-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#06C755]"
    />
  </div>
);

// 卡片元件
export const Card = ({ children, className = "", onClick = null }) => (
  <div 
    className={`bg-white rounded-2xl p-4 ${onClick ? 'cursor-pointer active:bg-gray-50' : ''} ${className}`}
    onClick={onClick}
  >
    {children}
  </div>
);

// 列表項目
export const ListItem = ({ 
  icon, 
  title, 
  subtitle, 
  rightContent, 
  onClick,
  showArrow = true 
}) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-3 p-4 bg-white rounded-xl active:bg-gray-50"
  >
    {icon && (
      <div className="w-10 h-10 rounded-full bg-[#F5F5F7] flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
    )}
    <div className="flex-1 text-left">
      <p className="font-medium text-[#1D1D1F]">{title}</p>
      {subtitle && <p className="text-sm text-[#86868B]">{subtitle}</p>}
    </div>
    {rightContent && <div className="flex-shrink-0">{rightContent}</div>}
    {showArrow && <Icons.chevronRight className="w-5 h-5 flex-shrink-0" color="#C7C7CC" />}
  </button>
);

// 徽章
export const Badge = ({ children, variant = 'default' }) => {
  const variants = {
    default: 'bg-[#E8E8ED] text-[#1D1D1F]',
    success: 'bg-[#34C759]/10 text-[#34C759]',
    warning: 'bg-[#FF9500]/10 text-[#FF9500]',
    danger: 'bg-[#FF3B30]/10 text-[#FF3B30]',
    primary: 'bg-[#06C755]/10 text-[#06C755]',
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${variants[variant]}`}>
      {children}
    </span>
  );
};

// 空狀態
export const EmptyState = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
    <div className="w-16 h-16 rounded-full bg-[#F5F5F7] flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-[#1D1D1F] mb-2">{title}</h3>
    {description && <p className="text-[#86868B] mb-4">{description}</p>}
    {action}
  </div>
);

// 浮動按鈕
export const FloatingButton = ({ onClick, icon }) => (
  <button
    onClick={onClick}
    className="fixed right-5 bottom-28 w-14 h-14 bg-[#06C755] rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform z-30"
  >
    {icon || <Icons.plus className="w-6 h-6" color="white" />}
  </button>
);

// Modal 基礎元件
export const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl max-h-[90vh] overflow-hidden">
        <div className="sticky top-0 bg-white border-b border-[#E8E8ED] px-5 py-4 flex items-center justify-between">
          <button onClick={onClose} className="text-[#06C755]">取消</button>
          <h2 className="font-semibold text-[#1D1D1F]">{title}</h2>
          <div className="w-12" />
        </div>
        <div className="overflow-y-auto max-h-[calc(90vh-60px)]">
          {children}
        </div>
      </div>
    </div>
  );
};

// 確認對話框
export const ConfirmDialog = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-2xl p-6 w-full max-w-sm">
        <h3 className="text-lg font-semibold text-[#1D1D1F] mb-2">{title}</h3>
        <p className="text-[#86868B] mb-6">{message}</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-[#E8E8ED] text-[#1D1D1F] font-medium"
          >
            取消
          </button>
          <button
            onClick={() => { onConfirm(); onClose(); }}
            className="flex-1 py-3 rounded-xl bg-[#FF3B30] text-white font-medium"
          >
            確認
          </button>
        </div>
      </div>
    </div>
  );
};

export default {
  TabBar,
  Header,
  SearchBar,
  Card,
  ListItem,
  Badge,
  EmptyState,
  FloatingButton,
  Modal,
  ConfirmDialog,
};

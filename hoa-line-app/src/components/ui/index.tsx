import React, { ReactNode } from 'react';
import {
  HomeIcon,
  UsersIcon,
  BuildingIcon,
  SettingsIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  PlusIcon,
  SearchIcon,
} from '../Icons';

// ==================== TabBar ====================
interface TabBarProps {
  currentScreen: string;
  setCurrentScreen: (screen: string) => void;
}

export const TabBar: React.FC<TabBarProps> = ({ currentScreen, setCurrentScreen }) => {
  const tabs = [
    { id: 'home', label: '首頁', Icon: HomeIcon },
    { id: 'residents', label: '住戶', Icon: UsersIcon },
    { id: 'vendors', label: '廠商', Icon: BuildingIcon },
    { id: 'settings', label: '設定', Icon: SettingsIcon },
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

// ==================== Header ====================
interface HeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: ReactNode;
  transparent?: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  showBack = false,
  onBack,
  rightAction = null,
  transparent = false,
}) => (
  <div className={`sticky top-0 z-30 ${transparent ? '' : 'bg-white/90 backdrop-blur-xl border-b border-[#E8E8ED]'}`}>
    <div className="h-12" /> {/* Status bar spacing */}
    <div className="px-5 py-4 flex items-center justify-between">
      <div className="w-20">
        {showBack && (
          <button onClick={onBack} className="flex items-center text-[#06C755]">
            <ChevronLeftIcon className="w-5 h-5" color="#06C755" />
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

// ==================== SearchBar ====================
interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChange,
  placeholder = "搜尋...",
}) => (
  <div className="relative">
    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5" color="#86868B" />
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-[#E8E8ED] rounded-xl pl-10 pr-4 py-3 text-[#1D1D1F] placeholder-[#86868B] focus:outline-none focus:ring-2 focus:ring-[#06C755]"
    />
  </div>
);

// ==================== Card ====================
interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export const Card: React.FC<CardProps> = ({ children, className = "", onClick }) => (
  <div
    className={`bg-white rounded-2xl p-4 ${onClick ? 'cursor-pointer active:bg-gray-50' : ''} ${className}`}
    onClick={onClick}
  >
    {children}
  </div>
);

// ==================== ListItem ====================
interface ListItemProps {
  icon?: ReactNode;
  title: string;
  subtitle?: string;
  rightContent?: ReactNode;
  onClick?: () => void;
  showArrow?: boolean;
}

export const ListItem: React.FC<ListItemProps> = ({
  icon,
  title,
  subtitle,
  rightContent,
  onClick,
  showArrow = true,
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
    {showArrow && <ChevronRightIcon className="w-5 h-5 flex-shrink-0" color="#C7C7CC" />}
  </button>
);

// ==================== Badge ====================
type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'primary';

interface BadgeProps {
  children: ReactNode;
  variant?: BadgeVariant;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'default' }) => {
  const variants: Record<BadgeVariant, string> = {
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

// ==================== EmptyState ====================
interface EmptyStateProps {
  icon: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
    <div className="w-16 h-16 rounded-full bg-[#F5F5F7] flex items-center justify-center mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-[#1D1D1F] mb-2">{title}</h3>
    {description && <p className="text-[#86868B] mb-4">{description}</p>}
    {action}
  </div>
);

// ==================== FloatingButton ====================
interface FloatingButtonProps {
  onClick: () => void;
  icon?: ReactNode;
}

export const FloatingButton: React.FC<FloatingButtonProps> = ({ onClick, icon }) => (
  <button
    onClick={onClick}
    className="fixed right-5 bottom-28 w-14 h-14 bg-[#06C755] rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform z-30"
  >
    {icon || <PlusIcon className="w-6 h-6" color="white" />}
  </button>
);

// ==================== Modal ====================
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
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

// ==================== ConfirmDialog ====================
interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}) => {
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
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="flex-1 py-3 rounded-xl bg-[#FF3B30] text-white font-medium"
          >
            確認
          </button>
        </div>
      </div>
    </div>
  );
};

// ==================== InputField ====================
interface InputFieldProps {
  label: string;
  type?: string;
  placeholder?: string;
  value?: string;
  onChange?: (value: string) => void;
}

export const InputField: React.FC<InputFieldProps> = ({
  label,
  type = 'text',
  placeholder,
  value,
  onChange,
}) => (
  <div>
    <label className="block text-sm text-[#86868B] mb-1">{label}</label>
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3 text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#06C755]"
    />
  </div>
);

// ==================== SelectField ====================
interface SelectFieldProps {
  label: string;
  options: string[];
  value?: string;
  onChange?: (value: string) => void;
}

export const SelectField: React.FC<SelectFieldProps> = ({
  label,
  options,
  value,
  onChange,
}) => (
  <div>
    <label className="block text-sm text-[#86868B] mb-1">{label}</label>
    <select
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      className="w-full bg-[#F5F5F7] rounded-xl px-4 py-3 text-[#1D1D1F] focus:outline-none focus:ring-2 focus:ring-[#06C755]"
    >
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  </div>
);

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
  InputField,
  SelectField,
};

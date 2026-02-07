import React from 'react';

interface IconProps {
  className?: string;
  color?: string;
  filled?: boolean;
}

// 導航用圖示
export const HomeIcon: React.FC<IconProps> = ({
  className = "w-6 h-6",
  color = "currentColor",
  filled = false
}) => (
  <svg className={className} viewBox="0 0 24 24" fill={filled ? color : "none"}>
    <path
      d="M3 10.5L12 3l9 7.5V20a1 1 0 01-1 1h-5v-6a1 1 0 00-1-1h-4a1 1 0 00-1 1v6H4a1 1 0 01-1-1v-9.5z"
      stroke={filled ? "none" : color}
      strokeWidth="1.5"
    />
  </svg>
);

export const UsersIcon: React.FC<IconProps> = ({
  className = "w-6 h-6",
  color = "currentColor",
  filled = false
}) => (
  <svg className={className} viewBox="0 0 24 24" fill={filled ? color : "none"}>
    <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" stroke={color} strokeWidth="1.5"/>
    <circle cx="9" cy="7" r="4" stroke={color} strokeWidth="1.5" fill={filled ? color : "none"}/>
    <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" stroke={color} strokeWidth="1.5"/>
  </svg>
);

export const BuildingIcon: React.FC<IconProps> = ({
  className = "w-6 h-6",
  color = "currentColor"
}) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path
      d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4M9 9v.01M9 12v.01M9 15v.01M9 18v.01"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const SettingsIcon: React.FC<IconProps> = ({
  className = "w-6 h-6",
  color = "currentColor"
}) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="3" stroke={color} strokeWidth="1.5"/>
    <path
      d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"
      stroke={color}
      strokeWidth="1.5"
    />
  </svg>
);

// 通用操作圖示
export const ChevronLeftIcon: React.FC<IconProps> = ({
  className = "w-6 h-6",
  color = "currentColor"
}) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M15 19l-7-7 7-7" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const ChevronRightIcon: React.FC<IconProps> = ({
  className = "w-6 h-6",
  color = "currentColor"
}) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M9 5l7 7-7 7" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const PlusIcon: React.FC<IconProps> = ({
  className = "w-6 h-6",
  color = "currentColor"
}) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M12 5v14m7-7H5" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const CheckIcon: React.FC<IconProps> = ({
  className = "w-6 h-6",
  color = "currentColor"
}) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M5 12l5 5L20 7" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const XIcon: React.FC<IconProps> = ({
  className = "w-6 h-6",
  color = "currentColor"
}) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M18 6L6 18M6 6l12 12" stroke={color} strokeWidth="2" strokeLinecap="round"/>
  </svg>
);

export const SearchIcon: React.FC<IconProps> = ({
  className = "w-6 h-6",
  color = "currentColor"
}) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <circle cx="11" cy="11" r="8" stroke={color} strokeWidth="1.5"/>
    <path d="M21 21l-4.35-4.35" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export const EditIcon: React.FC<IconProps> = ({
  className = "w-6 h-6",
  color = "currentColor"
}) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const TrashIcon: React.FC<IconProps> = ({
  className = "w-6 h-6",
  color = "currentColor"
}) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

// 功能圖示
export const PhoneIcon: React.FC<IconProps> = ({
  className = "w-6 h-6",
  color = "currentColor"
}) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path
      d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.96.36 1.9.7 2.81a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0122 16.92z"
      stroke={color}
      strokeWidth="1.5"
    />
  </svg>
);

export const WrenchIcon: React.FC<IconProps> = ({
  className = "w-6 h-6",
  color = "currentColor"
}) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path
      d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const FolderIcon: React.FC<IconProps> = ({
  className = "w-6 h-6",
  color = "currentColor"
}) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2v11z" stroke={color} strokeWidth="1.5"/>
  </svg>
);

export const MicIcon: React.FC<IconProps> = ({
  className = "w-6 h-6",
  color = "currentColor"
}) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z" stroke={color} strokeWidth="1.5"/>
    <path d="M19 10v2a7 7 0 01-14 0v-2" stroke={color} strokeWidth="1.5"/>
    <path d="M12 19v4m-4 0h8" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export const DollarSignIcon: React.FC<IconProps> = ({
  className = "w-6 h-6",
  color = "currentColor"
}) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path
      d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const ClipboardIcon: React.FC<IconProps> = ({
  className = "w-6 h-6",
  color = "currentColor"
}) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M16 4h2a2 2 0 012 2v14a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h2" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <rect x="8" y="2" width="8" height="4" rx="1" stroke={color} strokeWidth="1.5"/>
  </svg>
);

export const CalendarIcon: React.FC<IconProps> = ({
  className = "w-6 h-6",
  color = "currentColor"
}) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="4" width="18" height="18" rx="2" stroke={color} strokeWidth="1.5"/>
    <path d="M16 2v4M8 2v4M3 10h18" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export const ClockIcon: React.FC<IconProps> = ({
  className = "w-6 h-6",
  color = "currentColor"
}) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5"/>
    <path d="M12 6v6l4 2" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export const AlertCircleIcon: React.FC<IconProps> = ({
  className = "w-6 h-6",
  color = "currentColor"
}) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5"/>
    <path d="M12 8v4M12 16h.01" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export const StarIcon: React.FC<IconProps> = ({
  className = "w-6 h-6",
  color = "currentColor",
  filled = false
}) => (
  <svg className={className} viewBox="0 0 24 24" fill={filled ? color : "none"}>
    <path
      d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

export const CameraIcon: React.FC<IconProps> = ({
  className = "w-6 h-6",
  color = "currentColor"
}) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2v11z" stroke={color} strokeWidth="1.5"/>
    <circle cx="12" cy="13" r="4" stroke={color} strokeWidth="1.5"/>
  </svg>
);

export const UploadIcon: React.FC<IconProps> = ({
  className = "w-6 h-6",
  color = "currentColor"
}) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M17 8l-5-5-5 5M12 3v12" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const DownloadIcon: React.FC<IconProps> = ({
  className = "w-6 h-6",
  color = "currentColor"
}) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M7 10l5 5 5-5M12 15V3" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

export const FileIcon: React.FC<IconProps> = ({
  className = "w-6 h-6",
  color = "currentColor"
}) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8l-6-6z" stroke={color} strokeWidth="1.5"/>
    <path d="M14 2v6h6" stroke={color} strokeWidth="1.5"/>
  </svg>
);

export const ImageIcon: React.FC<IconProps> = ({
  className = "w-6 h-6",
  color = "currentColor"
}) => (
  <svg className={className} viewBox="0 0 24 24" fill="none">
    <rect x="3" y="3" width="18" height="18" rx="2" stroke={color} strokeWidth="1.5"/>
    <circle cx="8.5" cy="8.5" r="1.5" fill={color}/>
    <path d="M21 15l-5-5L5 21" stroke={color} strokeWidth="1.5"/>
  </svg>
);

// 通訊錄圖示
export const BookIcon: React.FC<IconProps> = ({
  className = "w-6 h-6",
  color = "currentColor",
  filled = false
}) => (
  <svg className={className} viewBox="0 0 24 24" fill={filled ? color : "none"}>
    <path
      d="M4 19.5A2.5 2.5 0 016.5 17H20"
      stroke={color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <path
      d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"
      stroke={filled ? "none" : color}
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

// LINE 圖示
export const LineIcon: React.FC<IconProps> = ({
  className = "w-6 h-6",
  color = "currentColor"
}) => (
  <svg className={className} viewBox="0 0 24 24" fill={color}>
    <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
  </svg>
);

// 匯出所有圖示的物件（方便動態使用）
export const Icons = {
  home: HomeIcon,
  users: UsersIcon,
  building: BuildingIcon,
  settings: SettingsIcon,
  chevronLeft: ChevronLeftIcon,
  chevronRight: ChevronRightIcon,
  plus: PlusIcon,
  check: CheckIcon,
  x: XIcon,
  search: SearchIcon,
  edit: EditIcon,
  trash: TrashIcon,
  phone: PhoneIcon,
  wrench: WrenchIcon,
  folder: FolderIcon,
  mic: MicIcon,
  dollarSign: DollarSignIcon,
  clipboard: ClipboardIcon,
  calendar: CalendarIcon,
  clock: ClockIcon,
  alertCircle: AlertCircleIcon,
  star: StarIcon,
  camera: CameraIcon,
  upload: UploadIcon,
  download: DownloadIcon,
  file: FileIcon,
  image: ImageIcon,
  book: BookIcon,
  line: LineIcon,
};

export default Icons;

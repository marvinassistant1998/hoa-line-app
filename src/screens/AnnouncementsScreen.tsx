import React from 'react';
import {
  CalendarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  AlertCircleIcon,
  WrenchIcon,
} from '@/components/Icons';
import { Card, Badge } from '@/components/ui';
import { useDataStore } from '@/stores/dataStore';

interface AnnouncementsScreenProps {
  onBack: () => void;
}

export const AnnouncementsScreen: React.FC<AnnouncementsScreenProps> = ({ onBack }) => {
  const { meetings, repairs } = useDataStore();

  // 最近完成的維修
  const recentCompletedRepairs = repairs.filter((r) => r.status === 'completed');

  return (
    <div className="pb-24">
      {/* Header */}
      <div className="bg-gradient-to-b from-[#06C755] to-[#05A847] text-white">
        <div className="h-12" />
        <div className="px-5 py-6">
          <button onClick={onBack} aria-label="返回" className="text-white/80 text-sm mb-2 flex items-center gap-1 min-h-[44px]">
            <ChevronLeftIcon className="w-4 h-4" color="rgba(255,255,255,0.8)" />
            返回
          </button>
          <h1 className="text-2xl font-bold">社區公告</h1>
          <p className="text-white/70 text-sm mt-1">幸福社區最新消息</p>
        </div>
      </div>

      <div className="px-5 -mt-4 space-y-4">
        {/* 重要公告 */}
        <Card className="shadow-lg">
          <h2 className="font-semibold text-[#1D1D1F] mb-3 flex items-center gap-2">
            <AlertCircleIcon className="w-5 h-5" color="#FF9500" />
            重要公告
          </h2>
          <div className="space-y-3">
            <AnnouncementItem
              title="管理費調整通知"
              content="自2025年7月起，每月管理費將調整為 $3,800/戶，請住戶留意。"
              date="2025-05-01"
              pinned
            />
            <AnnouncementItem
              title="電梯保養時間"
              content="5/20（二）上午 9:00-12:00 進行電梯年度保養，屆時暫停使用。"
              date="2025-05-10"
            />
          </div>
        </Card>

        {/* 近期會議 */}
        {meetings.length > 0 && (
          <Card>
            <h2 className="font-semibold text-[#1D1D1F] mb-3 flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" color="#AF52DE" />
              會議通知
            </h2>
            <div className="space-y-3">
              {meetings.map((meeting) => (
                <div key={meeting.id} className="p-3 bg-[#F5F5F7] rounded-xl">
                  <div className="flex items-center justify-between mb-1">
                    <p className="font-medium text-[#1D1D1F]">{meeting.title}</p>
                    <Badge variant="primary">{meeting.date}</Badge>
                  </div>
                  <p className="text-sm text-[#86868B]">
                    {meeting.time} · {meeting.location}
                  </p>
                  {meeting.resolutions && meeting.resolutions.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-[#E8E8ED]">
                      <p className="text-xs text-[#86868B] mb-1">決議事項：</p>
                      {meeting.resolutions.map((res, i) => (
                        <p key={i} className="text-sm text-[#1D1D1F]">• {res}</p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* 維修完成通知 */}
        {recentCompletedRepairs.length > 0 && (
          <Card>
            <h2 className="font-semibold text-[#1D1D1F] mb-3 flex items-center gap-2">
              <WrenchIcon className="w-5 h-5" color="#34C759" />
              維修完成通知
            </h2>
            <div className="space-y-2">
              {recentCompletedRepairs.map((repair) => (
                <div key={repair.id} className="flex items-center gap-3 p-3 bg-[#F5F5F7] rounded-xl">
                  <div className="flex-1">
                    <p className="font-medium text-[#1D1D1F]">{repair.title}</p>
                    <p className="text-xs text-[#86868B]">完成日期：{repair.completedDate || '—'}</p>
                  </div>
                  <Badge variant="success">已完成</Badge>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* 社區提醒 */}
        <Card>
          <h2 className="font-semibold text-[#1D1D1F] mb-3">社區提醒</h2>
          <div className="space-y-2">
            <ReminderItem text="垃圾車時間：週一至週六 18:30" />
            <ReminderItem text="訪客車位請先至管理室登記" />
            <ReminderItem text="頂樓花園開放時間：06:00-22:00" />
          </div>
        </Card>
      </div>
    </div>
  );
};

// 公告項目
interface AnnouncementItemProps {
  title: string;
  content: string;
  date: string;
  pinned?: boolean;
}

const AnnouncementItem: React.FC<AnnouncementItemProps> = ({ title, content, date, pinned }) => (
  <div className="p-3 bg-[#F5F5F7] rounded-xl">
    <div className="flex items-center justify-between mb-1">
      <div className="flex items-center gap-2">
        {pinned && <span className="text-xs bg-[#FF3B30] text-white px-1.5 py-0.5 rounded">置頂</span>}
        <p className="font-medium text-[#1D1D1F]">{title}</p>
      </div>
      <span className="text-xs text-[#86868B]">{date}</span>
    </div>
    <p className="text-sm text-[#86868B] mt-1">{content}</p>
  </div>
);

// 提醒項目
const ReminderItem: React.FC<{ text: string }> = ({ text }) => (
  <div className="flex items-center gap-2 p-3 min-h-[44px]">
    <ChevronRightIcon className="w-3 h-3 flex-shrink-0" color="#06C755" />
    <span className="text-sm text-[#1D1D1F]">{text}</span>
  </div>
);

export default AnnouncementsScreen;

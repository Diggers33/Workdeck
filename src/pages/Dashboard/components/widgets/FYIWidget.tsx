import React from 'react';
import { Bell, Inbox } from 'lucide-react';
import { NewsItem } from '../../api/dashboardApi';

interface FYIWidgetProps {
  items?: NewsItem[];
}

// Generate avatar from message (extract initials from first name)
function getAvatarFromMessage(message: string): { initials: string; color: string } {
  const colors = ['#64748B', '#8B5CF6', '#3B82F6', '#10B981', '#EC4899', '#F59E0B'];
  const words = message.split(' ');
  const initials = words.length >= 2 ? `${words[0][0]}${words[1][0]}`.toUpperCase() : words[0].slice(0, 2).toUpperCase();
  const colorIndex = message.length % colors.length;
  return { initials, color: colors[colorIndex] };
}

// Format timestamp for display
function formatTime(timestamp: string): string {
  // If already formatted (like "2h ago"), return as-is
  if (timestamp.includes('ago') || timestamp.includes('Yesterday') || timestamp.includes('days')) {
    return timestamp;
  }

  // Try to parse as ISO date
  try {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffHours < 1) return 'Just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return date.toLocaleDateString();
  } catch {
    return timestamp;
  }
}

export function FYIWidget({ items }: FYIWidgetProps) {
  // Determine data state:
  // - undefined = API not called yet or failed
  // - [] = API returned empty (valid - no notifications)
  // - array with items = show the items
  const isLoading = items === undefined;
  const isEmpty = Array.isArray(items) && items.length === 0;
  const hasItems = Array.isArray(items) && items.length > 0;

  const unreadCount = hasItems ? items.filter(item => !item.read).length : 0;

  return (
    <div
      className="bg-white rounded-lg relative overflow-hidden"
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)', height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      {/* Colored top accent */}
      <div className="absolute left-0 right-0 top-0 h-1" style={{ background: 'linear-gradient(90deg, #A78BFA 0%, #C4B5FD 100%)' }}></div>

      {/* Header */}
      <div className="px-3 py-2 border-b border-[#E5E7EB] flex items-center justify-between" style={{ minHeight: '36px' }}>
        <div className="flex items-center gap-1.5">
          <Bell className="w-4 h-4 text-[#A78BFA]" />
          <h3 className="text-[14px] font-medium text-[#1F2937]">FYI</h3>
          {hasItems && (
            <span className="text-[10px] text-[#10B981] font-medium">(Live)</span>
          )}
        </div>
        {hasItems && (
          <button className="text-[11px] text-[#9CA3AF] hover:text-[#F87171] transition-colors">
            Clear all
          </button>
        )}
      </div>

      {/* Content area */}
      <div className="px-3 py-1.5 custom-scrollbar" style={{ flex: 1, overflowY: 'auto' }}>
        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full py-8 text-center">
            <div className="w-6 h-6 border-2 border-[#A78BFA] border-t-transparent rounded-full animate-spin mb-2"></div>
            <p className="text-[12px] text-[#9CA3AF]">Loading notifications...</p>
          </div>
        )}

        {/* Empty state - no notifications (good!) */}
        {isEmpty && (
          <div className="flex flex-col items-center justify-center h-full py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-[#F3E8FF] flex items-center justify-center mb-3">
              <Inbox className="w-6 h-6 text-[#A78BFA]" />
            </div>
            <p className="text-[13px] font-medium text-[#374151] mb-1">No new notifications</p>
            <p className="text-[11px] text-[#9CA3AF]">You're all caught up!</p>
          </div>
        )}

        {/* Items list */}
        {hasItems && (
          <div className="space-y-0.5">
            {items.map((item, idx) => {
              const { initials, color } = getAvatarFromMessage(item.message);
              const timeDisplay = formatTime(item.createdAt);

              return (
                <div
                  key={item.id || idx}
                  className={`flex items-center gap-2 p-1.5 rounded cursor-pointer transition-all hover:bg-[#F9FAFB] ${
                    item.read ? 'opacity-50' : ''
                  }`}
                >
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-medium flex-shrink-0"
                    style={{ backgroundColor: color }}
                  >
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`text-[12px] leading-tight truncate ${item.read ? 'text-[#9CA3AF]' : 'text-[#374151]'}`}>
                      <span className={item.read ? '' : 'font-medium'}>{item.message}</span>
                    </p>
                    <p className="text-[10px] text-[#9CA3AF] leading-tight">{timeDisplay}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-1.5 border-t border-[#E5E7EB] flex items-center justify-between" style={{ minHeight: '30px' }}>
        <button className="text-[11px] text-[#3B82F6] hover:text-[#2563EB]">
          View all →
        </button>
        {hasItems && (
          <span className="text-[10px] text-white bg-[#A78BFA] px-1.5 py-0.5 rounded-full font-medium">
            {unreadCount > 0 ? unreadCount : items.length}
          </span>
        )}
      </div>
    </div>
  );
}

import React from 'react';
import { Bell } from 'lucide-react';

export function FYIWidget() {
  const fyiItems = [
    { name: 'James Wilson', text: 'completed Budget Review', time: '2h ago', avatar: 'JW', color: '#64748B', read: false },
    { name: 'Lisa Anderson', text: 'mentioned you in Design Sprint', time: '3h ago', avatar: 'LA', color: '#8B5CF6', read: false },
    { name: 'David Kim', text: 'updated Timeline for Q4 Launch', time: 'Yesterday', avatar: 'DK', color: '#3B82F6', read: true },
    { name: 'Emily Rodriguez', text: 'shared a file in Projects', time: '2 days ago', avatar: 'ER', color: '#10B981', read: true },
    { name: 'Alex Chen', text: 'commented on Design System', time: '3 days ago', avatar: 'AC', color: '#64748B', read: true },
    { name: 'Sarah Parker', text: 'requested approval', time: '3 days ago', avatar: 'SP', color: '#EC4899', read: true }
  ];

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
        </div>
        <button className="text-[11px] text-[#9CA3AF] hover:text-[#F87171] transition-colors">
          Clear all
        </button>
      </div>

      {/* Items */}
      <div className="px-3 py-1.5 custom-scrollbar" style={{ flex: 1, overflowY: 'auto' }}>
        <div className="space-y-0.5">
          {fyiItems.map((item, idx) => (
            <div 
              key={idx} 
              className={`flex items-center gap-2 p-1.5 rounded cursor-pointer transition-all hover:bg-[#F9FAFB] ${
                item.read ? 'opacity-50' : ''
              }`}
            >
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-medium flex-shrink-0" style={{ backgroundColor: item.color }}>
                {item.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-[12px] leading-tight truncate ${item.read ? 'text-[#9CA3AF]' : 'text-[#374151]'}`}>
                  <span className={item.read ? '' : 'font-medium'}>{item.name}</span> {item.text}
                </p>
                <p className="text-[10px] text-[#9CA3AF] leading-tight">{item.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-3 py-1.5 border-t border-[#E5E7EB] flex items-center justify-between" style={{ minHeight: '30px' }}>
        <button className="text-[11px] text-[#3B82F6] hover:text-[#2563EB]">
          View all →
        </button>
        <span className="text-[10px] text-white bg-[#9CA3AF] px-1.5 py-0.5 rounded-full font-medium">12</span>
      </div>
    </div>
  );
}
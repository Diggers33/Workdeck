import React from 'react';
import { MapPin, Building2, Laptop, Home, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { WhosWhereData, WhosWhereItem } from '../../api/dashboardApi';

interface WhosWhereWidgetProps {
  data?: WhosWhereData | null;
}

// Helper to get full name from user object (API may return camelCase or snake_case)
function getUserFullName(user?: any): string {
  if (!user) return 'Unknown User';
  // Handle both camelCase and snake_case from API
  const firstName = user.firstName || user.first_name || user.firstname || '';
  const lastName = user.lastName || user.last_name || user.lastname || '';
  const fullName = `${firstName} ${lastName}`.trim();
  // Also check for fullName or full_name property
  return fullName || user.fullName || user.full_name || user.name || 'Unknown User';
}

// Helper to check if avatar is a valid image URL
function isValidAvatarUrl(avatar?: string): boolean {
  if (!avatar) return false;
  // Check if it's a URL (http/https) or data URL
  return avatar.startsWith('http://') ||
         avatar.startsWith('https://') ||
         avatar.startsWith('data:image/') ||
         avatar.startsWith('/');
}

// Helper to get initials from name
function getInitials(name: string): string {
  if (!name || name === 'Unknown User') return '?';
  const parts = name.split(' ').filter(p => p.length > 0);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

// Helper to get status color based on type
function getStatusColor(type?: string): string {
  switch (type?.toLowerCase()) {
    case 'office':
      return '#10B981';
    case 'remote':
      return '#3B82F6';
    case 'wfh':
    case 'leave':
      return '#8B5CF6';
    default:
      return '#6B7280';
  }
}

// Helper to get status label
function getStatusLabel(type?: string, leaveTypeName?: string): string {
  if (leaveTypeName) return leaveTypeName;
  switch (type?.toLowerCase()) {
    case 'office':
      return 'Office';
    case 'remote':
      return 'Remote';
    case 'wfh':
      return 'WFH';
    case 'leave':
      return 'Leave';
    default:
      return 'Away';
  }
}

// Helper to format date range - handles various date formats from API
function formatDateRange(startAt: string, endAt: string): string {
  try {
    if (!startAt || !endAt) return '';

    // Parse dates - API may return ISO format or other formats
    const start = new Date(startAt);
    const end = new Date(endAt);

    // Check if dates are valid
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return '';
    }

    const now = new Date();
    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

    // If same day
    if (start.toDateString() === end.toDateString()) {
      if (start.toDateString() === now.toDateString()) {
        return 'Today';
      }
      return startStr;
    }

    const endStr = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `${startStr} - ${endStr}`;
  } catch {
    return '';
  }
}

export function WhosWhereWidget({ data }: WhosWhereWidgetProps) {
  const navigate = useNavigate();

  // Determine data state
  const isLoading = data === undefined || data === null;

  // Combine leave events and leave requests into a single list
  const allItems = data ? [
    ...(data.leaveEvents || []),
    ...(data.leaveRequests || [])
  ] : [];

  const isEmpty = !isLoading && allItems.length === 0;
  const hasItems = !isLoading && allItems.length > 0;

  return (
    <div
      className="bg-white rounded-lg relative overflow-hidden"
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)', height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      {/* Colored top accent */}
      <div className="absolute left-0 right-0 top-0 h-1" style={{ background: 'linear-gradient(90deg, #5EEAD4 0%, #99F6E4 100%)' }}></div>

      {/* Header */}
      <div className="px-3 py-2 border-b border-[#E5E7EB] flex items-center justify-between" style={{ minHeight: '36px' }}>
        <div className="flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-[#5EEAD4]" />
          <h3 className="text-[14px] font-medium text-[#1F2937]">Who's where</h3>
          {hasItems && (
            <span className="text-[10px] text-[#10B981] font-medium">(Live)</span>
          )}
        </div>
        <button className="bg-[#60A5FA] hover:bg-[#3B82F6] text-white px-2 py-1 rounded text-[11px] font-medium transition-all">
          Add +
        </button>
      </div>

      {/* Content area */}
      <div className="px-3 py-1.5 custom-scrollbar" style={{ flex: 1, overflowY: 'auto' }}>
        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full py-8 text-center">
            <div className="w-6 h-6 border-2 border-[#5EEAD4] border-t-transparent rounded-full animate-spin mb-2"></div>
            <p className="text-[12px] text-[#9CA3AF]">Loading team status...</p>
          </div>
        )}

        {/* Empty state */}
        {isEmpty && (
          <div className="flex flex-col items-center justify-center h-full py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-[#D1FAE5] flex items-center justify-center mb-3">
              <Users className="w-6 h-6 text-[#10B981]" />
            </div>
            <p className="text-[13px] font-medium text-[#374151] mb-1">Everyone's here!</p>
            <p className="text-[11px] text-[#9CA3AF]">No one is out today</p>
          </div>
        )}

        {/* Team list */}
        {hasItems && (
          <div className="space-y-0.5">
            {allItems.map((item, idx) => {
              const statusColor = item.leaveType?.color || getStatusColor(item.type);
              const statusLabel = getStatusLabel(item.type, item.leaveType?.name);
              const dateRange = formatDateRange(item.startAt, item.endAt);
              const fullName = getUserFullName(item.user);

              return (
                <div
                  key={item.id || idx}
                  onClick={() => item.user?.id && navigate(`/people/${item.user.id}`)}
                  className="flex items-center gap-2 p-1.5 rounded cursor-pointer hover:bg-[#F9FAFB] transition-all"
                >
                  {/* Avatar - show image if valid URL, otherwise show initials */}
                  {isValidAvatarUrl(item.user?.avatar) ? (
                    <img
                      src={item.user?.avatar}
                      alt={fullName}
                      className="w-7 h-7 rounded-full object-cover flex-shrink-0"
                    />
                  ) : (
                    <div
                      className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-medium flex-shrink-0"
                      style={{ backgroundColor: statusColor }}
                    >
                      {getInitials(fullName)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-medium text-[#1F2937] truncate leading-tight">
                      {fullName}
                    </p>
                    <p className="text-[10px] text-[#9CA3AF] truncate leading-tight">{dateRange}</p>
                  </div>
                  <div
                    className="flex-shrink-0 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full"
                    style={{ backgroundColor: statusColor }}
                  >
                    {statusLabel}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-1.5 border-t border-[#E5E7EB] flex items-center justify-between" style={{ minHeight: '30px' }}>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1">
            <Building2 className="w-3 h-3 text-[#10B981]" />
            <span className="text-[10px] text-[#6B7280]">Office</span>
          </div>
          <div className="flex items-center gap-1">
            <Laptop className="w-3 h-3 text-[#3B82F6]" />
            <span className="text-[10px] text-[#6B7280]">Remote</span>
          </div>
          <div className="flex items-center gap-1">
            <Home className="w-3 h-3 text-[#8B5CF6]" />
            <span className="text-[10px] text-[#6B7280]">Leave</span>
          </div>
        </div>
        <button
          onClick={() => navigate('/leave')}
          className="text-[11px] text-[#3B82F6] hover:text-[#2563EB]"
        >
          View all →
        </button>
      </div>
    </div>
  );
}

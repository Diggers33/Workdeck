import React from 'react';
import { Leave } from '../types';
import { getLeaveConfig } from '../utils/leaveConfig';
import { format, differenceInDays } from 'date-fns';

interface LeaveTooltipProps {
  leave: Leave;
  date: Date;
  position: { x: number; y: number };
  approverName?: string;
}

export function LeaveTooltip({ leave, date, position, approverName = 'Manager' }: LeaveTooltipProps) {
  const config = getLeaveConfig(leave.type);
  const totalDays = differenceInDays(leave.endDate, leave.startDate) + 1;
  
  const getStatusIcon = () => {
    switch (leave.status) {
      case 'approved':
        return '✓';
      case 'pending':
        return '⏳';
      case 'denied':
        return '❌';
    }
  };
  
  const getStatusText = () => {
    switch (leave.status) {
      case 'approved':
        return 'Approved';
      case 'pending':
        return 'Pending approval';
      case 'denied':
        return 'Denied';
    }
  };
  
  const getStatusColor = () => {
    switch (leave.status) {
      case 'approved':
        return '#10B981';
      case 'pending':
        return '#F59E0B';
      case 'denied':
        return '#EF4444';
    }
  };
  
  return (
    <div
      className="fixed bg-white rounded-lg shadow-2xl border border-gray-200 z-[10000] pointer-events-none"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: '280px',
        padding: '16px',
      }}
    >
      {/* Date Header */}
      <div className="font-medium mb-3" style={{ fontSize: '13px', color: '#1F2937' }}>
        {format(date, 'EEEE, MMM d')}
      </div>
      
      {/* Leave Type */}
      <div className="flex items-center gap-2 mb-2">
        <span style={{ fontSize: '20px' }}>{config.icon}</span>
        <span className="font-medium" style={{ fontSize: '14px', color: config.textColor }}>
          {config.label.charAt(0) + config.label.slice(1).toLowerCase()}
        </span>
      </div>
      
      {/* Description */}
      {leave.description && (
        <div className="mb-3" style={{ fontSize: '13px', color: '#6B7280' }}>
          {leave.description}
        </div>
      )}
      
      {/* Date Range */}
      <div className="mb-2" style={{ fontSize: '12px', color: '#6B7280' }}>
        {format(leave.startDate, 'MMM d')} - {format(leave.endDate, 'MMM d')} ({totalDays} {totalDays === 1 ? 'day' : 'days'})
        {leave.isHalfDay && ' • Half Day'}
      </div>
      
      {/* Status */}
      <div className="flex items-center gap-1.5 mb-3 pb-3 border-b border-gray-200">
        <span style={{ fontSize: '12px', color: '#6B7280' }}>Status:</span>
        <span
          className="font-medium flex items-center gap-1"
          style={{ fontSize: '12px', color: getStatusColor() }}
        >
          {getStatusIcon()} {getStatusText()}
        </span>
      </div>
      
      {/* Additional Info */}
      {leave.status === 'approved' && (
        <>
          <div className="mb-1" style={{ fontSize: '12px', color: '#6B7280' }}>
            Approved by: <span style={{ color: '#1F2937' }}>{approverName}</span>
          </div>
          <div className="mb-3" style={{ fontSize: '12px', color: '#6B7280' }}>
            Requested on: <span style={{ color: '#1F2937' }}>{format(leave.requestedOn, 'MMM d, yyyy')}</span>
          </div>
        </>
      )}
      
      {/* Action Link */}
      <div
        className="text-blue-600 hover:text-blue-700 cursor-pointer flex items-center gap-1"
        style={{ fontSize: '12px' }}
      >
        → View leave request
      </div>
    </div>
  );
}

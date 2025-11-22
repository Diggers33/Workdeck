import React from 'react';
import { Leave, LeaveStatus } from '../types';
import { getLeaveConfig } from '../utils/leaveConfig';
import { format } from 'date-fns';

interface LeaveCellProps {
  leave: Leave;
  isFirstDay?: boolean;
  isLastDay?: boolean;
  spanDays?: number;
  cellWidth: number;
  onHover?: (leave: Leave | null) => void;
}

export function LeaveCell({ leave, isFirstDay, isLastDay, spanDays = 1, cellWidth, onHover }: LeaveCellProps) {
  const config = getLeaveConfig(leave.type);
  const isMultiDay = spanDays > 1;
  
  // Determine border radius based on position in span
  const getBorderRadius = () => {
    if (!isMultiDay) return '4px';
    if (isFirstDay) return '4px 0 0 4px';
    if (isLastDay) return '0 4px 4px 0';
    return '0';
  };
  
  // Status badge
  const getStatusBadge = () => {
    if (leave.status === 'pending') {
      return (
        <div
          className="absolute top-1 right-1 px-1.5 py-0.5 rounded text-xs font-medium animate-pulse"
          style={{
            background: '#FEF3C7',
            color: '#92400E',
            fontSize: '9px',
          }}
        >
          ⏳ Pending
        </div>
      );
    }
    if (leave.status === 'denied') {
      return (
        <div
          className="absolute top-1 right-1 px-1.5 py-0.5 rounded text-xs font-medium"
          style={{
            background: '#FEE2E2',
            color: '#991B1B',
            fontSize: '9px',
          }}
        >
          ❌ Denied
        </div>
      );
    }
    return null;
  };
  
  // Half day styling
  if (leave.isHalfDay) {
    return (
      <div
        className="relative h-full flex flex-col items-center justify-center cursor-pointer transition-all hover:shadow-md"
        style={{
          background: `linear-gradient(to bottom, #FEF3C7 0%, ${config.background} 50%, ${config.background} 100%)`,
          border: `2px dashed ${config.color}`,
          borderRadius: '4px',
        }}
        onMouseEnter={() => onHover?.(leave)}
        onMouseLeave={() => onHover?.(null)}
      >
        <div
          className="text-center font-medium"
          style={{
            fontSize: '10px',
            color: config.textColor,
            lineHeight: '1.2',
          }}
        >
          <span>{config.icon}</span>
          <div>Half Day</div>
        </div>
        {getStatusBadge()}
      </div>
    );
  }
  
  return (
    <div
      className="relative h-full flex flex-col items-center justify-center cursor-pointer transition-all hover:shadow-md"
      style={{
        background: config.background,
        border: `2px dashed ${config.color}`,
        borderRadius: getBorderRadius(),
        width: isMultiDay && isFirstDay ? `${cellWidth * spanDays}px` : '100%',
      }}
      onMouseEnter={() => onHover?.(leave)}
      onMouseLeave={() => onHover?.(null)}
    >
      {/* Only show content on first day for multi-day spans */}
      {(!isMultiDay || isFirstDay) && (
        <>
          <div
            className="uppercase font-medium tracking-wide mb-1"
            style={{
              fontSize: '11px',
              color: config.textColor,
              textDecoration: leave.status === 'denied' ? 'line-through' : 'none',
            }}
          >
            {config.label}
          </div>
          <div style={{ fontSize: '24px', lineHeight: '1' }}>
            {config.icon}
          </div>
          {isMultiDay && (
            <div
              className="mt-1 text-xs font-medium"
              style={{ color: config.textColor }}
            >
              ({spanDays} days)
            </div>
          )}
        </>
      )}
      {getStatusBadge()}
    </div>
  );
}

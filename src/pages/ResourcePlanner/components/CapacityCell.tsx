import { DayAllocation } from '../types';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { format } from 'date-fns';
import { colors, typography } from '../constants/designTokens';

interface CapacityCellProps {
  allocation: DayAllocation;
  date?: Date;
  isWeekend?: boolean;
  onClick?: () => void;
}

export function CapacityCell({ allocation, date, isWeekend = false, onClick }: CapacityCellProps) {
  const utilizationPercent = allocation.totalCapacity > 0
    ? (allocation.plannedHours / allocation.totalCapacity) * 100
    : 0;
  const isOverCapacity = utilizationPercent > 100;

  // Subtle background tints based on utilization
  const getBackgroundColor = () => {
    if (utilizationPercent > 100) return 'rgba(220, 38, 38, 0.08)'; // subtle red
    if (utilizationPercent > 85) return 'rgba(217, 119, 6, 0.05)'; // barely visible amber
    return 'transparent';
  };

  // Progress bar color based on utilization
  const getProgressBarColor = () => {
    if (utilizationPercent > 100) return colors.statusRed;
    if (utilizationPercent > 85) return colors.statusAmber;
    if (utilizationPercent > 50) return colors.statusGreen;
    return colors.statusGray;
  };

  // Progress bar width (capped at 100%)
  const progressWidth = Math.min(utilizationPercent, 100);

  return (
    <TooltipProvider delayDuration={300}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            className="min-w-[120px] h-14 flex items-center justify-center cursor-pointer transition-all relative"
            onClick={onClick}
            style={{
              backgroundColor: getBackgroundColor(),
              borderLeft: `1px solid ${colors.borderDefault}`,
            }}
          >
            {allocation.plannedHours > 0 ? (
              <span
                style={{
                  fontSize: typography.base,
                  fontWeight: typography.medium,
                  color: isOverCapacity ? colors.statusRed : colors.textPrimary,
                }}
              >
                {allocation.plannedHours}h
              </span>
            ) : (
              <span style={{ color: colors.textMuted, fontSize: typography.sm }}>
                {isWeekend ? '' : '—'}
              </span>
            )}

            {/* Progress bar at bottom */}
            {allocation.plannedHours > 0 && (
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '2px',
                  backgroundColor: colors.borderLight,
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${progressWidth}%`,
                    backgroundColor: getProgressBarColor(),
                    transition: 'width 200ms ease',
                  }}
                />
              </div>
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent
          side="top"
          style={{
            backgroundColor: '#1F2937',
            border: 'none',
            padding: '12px 16px',
            borderRadius: '8px',
            maxWidth: '280px',
          }}
        >
          <div className="space-y-2">
            {date && (
              <div
                style={{
                  fontWeight: typography.semibold,
                  fontSize: typography.md,
                  color: 'white',
                  borderBottom: '1px solid #374151',
                  paddingBottom: '8px',
                  marginBottom: '8px',
                }}
              >
                {format(date, 'EEEE, MMM d')}
              </div>
            )}

            {/* Tasks list */}
            {allocation.tasks.length > 0 ? (
              <div className="space-y-1.5">
                {allocation.tasks.map(task => (
                  <div
                    key={task.id}
                    style={{
                      fontSize: typography.sm,
                      color: '#E5E7EB',
                    }}
                  >
                    • {task.name} ({task.plannedHours}h)
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ fontSize: typography.sm, color: '#9CA3AF' }}>
                No tasks planned
              </div>
            )}

            {/* Summary */}
            <div
              style={{
                borderTop: '1px solid #374151',
                paddingTop: '8px',
                marginTop: '8px',
              }}
            >
              <div
                style={{
                  fontSize: typography.sm,
                  fontWeight: typography.medium,
                  color: 'white',
                }}
              >
                {allocation.plannedHours}h / {allocation.totalCapacity}h capacity
              </div>
              <div
                style={{
                  fontSize: typography.sm,
                  marginTop: '4px',
                  color: utilizationPercent > 100
                    ? '#F87171'
                    : utilizationPercent > 85
                    ? '#FBBF24'
                    : '#34D399',
                }}
              >
                {utilizationPercent > 100
                  ? `Overallocated (${Math.round(utilizationPercent)}%)`
                  : utilizationPercent > 85
                  ? `Near capacity (${Math.round(utilizationPercent)}%)`
                  : `Available (${Math.round(utilizationPercent)}%)`}
              </div>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

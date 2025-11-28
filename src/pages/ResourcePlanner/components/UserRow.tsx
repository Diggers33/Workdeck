import { AlertCircle } from 'lucide-react';
import { User, Task, Project, TimeResolution, Leave } from '../types';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { format } from 'date-fns';
import React from 'react';
import { colors, typography } from '../constants/designTokens';

interface UserRowProps {
  user: User;
  tasks: Task[];
  projects: Project[];
  dates: Date[];
  allocations: Map<string, { date: string; plannedHours: number; totalCapacity: number }>;
  totalPlanned: number;
  totalCapacity: number;
  resolution: TimeResolution;
  leaves: Leave[];
  onUserClick: (userId: string) => void;
  onBarClick: (task: Task) => void;
  hoveredActivity?: string | null;
  onActivityHover?: (activityKey: string | null) => void;
  isSelected?: boolean;
}

interface ActivityBar {
  projectId: string;
  projectName: string;
  projectColor: string;
  activityName: string;
  hours: number;
  task: Task;
  startDate: Date;
  endDate: Date;
}

interface TooltipState {
  visible: boolean;
  date: Date | null;
  activities: ActivityBar[];
  position: { top: number; left: number } | null;
  allocation: { plannedHours: number; totalCapacity: number } | null;
  percentUsed: number;
  isWeekend: boolean;
}

interface LeaveTooltipState {
  visible: boolean;
  leave: Leave | null;
  date: Date | null;
  position: { top: number; left: number } | null;
}

export function UserRow({
  user,
  tasks,
  projects,
  dates,
  allocations,
  totalPlanned,
  totalCapacity,
  resolution,
  leaves,
  onUserClick,
  onBarClick,
  hoveredActivity,
  onActivityHover,
  isSelected,
}: UserRowProps) {
  const userTasks = tasks.filter(t => t.assigneeId === user.id);
  const utilizationPercent = totalCapacity > 0 ? (totalPlanned / totalCapacity) * 100 : 0;
  
  // Single tooltip state
  const [tooltip, setTooltip] = React.useState<TooltipState>({
    visible: false,
    date: null,
    activities: [],
    position: null,
    allocation: null,
    percentUsed: 0,
    isWeekend: false,
  });
  
  const hoverTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const cellRefs = React.useRef<Map<string, HTMLDivElement>>(new Map());
  
  // Calculate activity bars for each date
  const getActivityBarsForDate = (date: Date): ActivityBar[] => {
    const bars: ActivityBar[] = [];
    
    userTasks.forEach(task => {
      const taskStart = new Date(task.startDate);
      const taskEnd = new Date(task.endDate);
      taskStart.setHours(0, 0, 0, 0);
      taskEnd.setHours(0, 0, 0, 0);
      const currentDate = new Date(date);
      currentDate.setHours(0, 0, 0, 0);
      
      if (currentDate >= taskStart && currentDate <= taskEnd) {
        const project = projects.find(p => p.id === task.projectId);
        if (project) {
          bars.push({
            projectId: project.id,
            projectName: project.name,
            projectColor: project.color || '#3B82F6',
            activityName: task.activity || 'Unassigned',
            hours: task.plannedHours,
            task: task,
            startDate: taskStart,
            endDate: taskEnd,
          });
        }
      }
    });
    
    return bars;
  };
  
  // Check if date is start or end of a bar
  const isBarStart = (date: Date, bar: ActivityBar): boolean => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === bar.startDate.getTime();
  };
  
  const isBarEnd = (date: Date, bar: ActivityBar): boolean => {
    const d = new Date(date);
    d.setHours(0, 0, 0, 0);
    return d.getTime() === bar.endDate.getTime();
  };
  
  // Handle cell hover with delay
  const handleCellMouseEnter = (
    date: Date,
    activities: ActivityBar[],
    allocation: { plannedHours: number; totalCapacity: number } | null,
    percentUsed: number,
    isWeekend: boolean,
    cellElement: HTMLDivElement
  ) => {
    // Clear any existing timeout
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    // Show tooltip after 300ms delay
    hoverTimeoutRef.current = setTimeout(() => {
      const rect = cellElement.getBoundingClientRect();
      const tooltipWidth = 320;
      
      // Calculate horizontal position (centered over cell)
      let left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
      
      // Keep tooltip in viewport horizontally
      const padding = 16;
      if (left < padding) {
        left = padding;
      } else if (left + tooltipWidth > window.innerWidth - padding) {
        left = window.innerWidth - tooltipWidth - padding;
      }
      
      // Calculate vertical position (default: above cell)
      const tooltipHeight = 200; // Approximate height
      const gap = 8;
      let top = rect.top - tooltipHeight - gap;
      
      // If tooltip would go off-screen top, position below cell
      if (top < padding) {
        top = rect.bottom + gap;
      }
      
      setTooltip({
        visible: true,
        date,
        activities,
        position: { top, left },
        allocation,
        percentUsed,
        isWeekend,
      });
    }, 300);
  };
  
  // Handle cell mouse leave - hide immediately
  const handleCellMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    
    setTooltip({
      visible: false,
      date: null,
      activities: [],
      position: null,
      allocation: null,
      percentUsed: 0,
      isWeekend: false,
    });
  };
  
  // Cleanup on unmount
  React.useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);
  
  return (
    <>
      <div
        className="flex transition-colors"
        style={{
          minHeight: '64px',
          background: isSelected ? colors.bgSelected : colors.bgWhite,
          borderBottom: `1px solid ${colors.borderDefault}`,
          borderLeft: isSelected ? `3px solid ${colors.barBlue}` : 'none',
          transition: 'background-color 150ms ease',
        }}
      >
        {/* User Info Column - 240px */}
        <div
          className="sticky left-0 z-10 flex items-center gap-3 cursor-pointer"
          style={{
            width: '240px',
            padding: '12px',
            minHeight: '64px',
            background: isSelected ? colors.bgSelected : colors.bgWhite,
            borderRight: `1px solid ${colors.borderDefault}`,
            transition: 'background-color 150ms ease',
          }}
          onClick={() => onUserClick(user.id)}
          onMouseEnter={(e) => {
            if (!isSelected) {
              e.currentTarget.style.background = colors.bgHover;
            }
          }}
          onMouseLeave={(e) => {
            if (!isSelected) {
              e.currentTarget.style.background = colors.bgWhite;
            }
          }}
        >
          {/* Avatar - 32px with border */}
          <Avatar
            className="flex-shrink-0"
            style={{
              width: '32px',
              height: '32px',
              border: `1px solid ${colors.borderDefault}`,
              borderRadius: '50%',
            }}
          >
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback
              style={{
                fontSize: typography.xs,
                color: colors.textSecondary,
              }}
            >
              {user.name.split(' ').map(n => n[0]).join('')}
            </AvatarFallback>
          </Avatar>

          {/* User Details */}
          <div className="flex-1 min-w-0">
            <div
              className="truncate"
              style={{
                fontSize: typography.md,
                fontWeight: typography.medium,
                color: colors.textPrimary,
              }}
            >
              {user.name}
            </div>
            <div
              className="truncate"
              style={{
                fontSize: typography.sm,
                fontWeight: typography.normal,
                color: colors.textSecondary,
              }}
            >
              {user.role}
            </div>
          </div>

          {/* Utilization Badge - Subtle text with dot */}
          <span
            className="flex items-center gap-1.5 flex-shrink-0"
            style={{
              fontSize: typography.sm,
              color: colors.textSecondary,
            }}
          >
            <span
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: utilizationPercent > 100
                  ? colors.statusRed
                  : utilizationPercent > 85
                  ? colors.statusAmber
                  : utilizationPercent > 50
                  ? colors.statusGreen
                  : colors.statusGray,
              }}
            />
            {Math.round(utilizationPercent)}%
          </span>
        </div>
        
        {/* Capacity Cells with Overlaid Activity Bars */}
        <div className="flex">
          {dates.map((date) => {
            const allocation = allocations.get(date.toISOString().split('T')[0]);
            const percentUsed = allocation
              ? (allocation.plannedHours / allocation.totalCapacity) * 100
              : 0;

            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            const capacityColor = percentUsed === 0
              ? isWeekend ? colors.bgSubtle : colors.bgWhite
              : percentUsed < 50
              ? isWeekend ? '#E0F7ED' : '#D1FAE5'
              : percentUsed < 100
              ? '#FEF3C7'
              : '#FEE2E2';
            
            const activityBars = getActivityBarsForDate(date);
            const barCount = activityBars.length;
            const isOverallocated = percentUsed > 100;
            
            return (
              <div
                key={date.toISOString()}
                ref={(el) => {
                  if (el) cellRefs.current.set(date.toISOString(), el);
                }}
                className="min-w-[120px] relative flex flex-col items-center justify-center transition-all duration-150 hover:brightness-95 cursor-pointer"
                style={{
                  minHeight: '64px',
                  background: capacityColor,
                  borderLeft: `1px solid ${colors.borderDefault}`,
                }}
                onClick={() => onUserClick(user.id)}
                onMouseEnter={(e) => {
                  const cellElement = cellRefs.current.get(date.toISOString());
                  if (cellElement) {
                    handleCellMouseEnter(date, activityBars, allocation || null, percentUsed, isWeekend, cellElement);
                  }
                }}
                onMouseLeave={handleCellMouseLeave}
              >
                {/* Overallocation Warning Icon */}
                {isOverallocated && (
                  <div className="absolute top-1 right-1 z-20">
                    <AlertCircle
                      style={{
                        width: '14px',
                        height: '14px',
                        color: colors.statusRed,
                      }}
                    />
                  </div>
                )}

                {/* Empty cell indicator */}
                {activityBars.length === 0 && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    {isWeekend ? (
                      <span
                        className="select-none"
                        style={{
                          fontSize: '10px',
                          fontWeight: typography.semibold,
                          color: colors.textMuted,
                          letterSpacing: '0.05em',
                          opacity: 0.3,
                        }}
                      >
                        WEEKEND
                      </span>
                    ) : (
                      <span style={{ fontSize: typography.sm, color: colors.borderDefault }}>—</span>
                    )}
                  </div>
                )}
                
                {/* Activity Bars - Stacked vertically with 2px gap */}
                {activityBars.length > 0 && (
                  <div
                    className="absolute inset-0 flex flex-col justify-center pointer-events-none"
                    style={{ padding: '4px 8px' }}
                  >
                    <div className="flex flex-col" style={{ gap: '2px' }}>
                      {activityBars.slice(0, 2).map((bar, idx) => {
                        const isStart = isBarStart(date, bar);
                        const isEnd = isBarEnd(date, bar);
                        const isTentative = bar.task.status === 'tentative';

                        // Generate activity key for hover coordination
                        const activityKey = `${bar.projectId}-${bar.activityName}`;
                        const isHovered = hoveredActivity === activityKey;

                        return (
                          <div
                            key={`${bar.task.id}-${idx}`}
                            className="relative cursor-pointer pointer-events-auto flex items-center overflow-hidden"
                            style={{
                              height: '24px',
                              width: '100%',
                              backgroundColor: bar.projectColor,
                              opacity: isTentative ? 0.5 : isHovered ? 1.0 : 0.85,
                              borderRadius: isStart && isEnd ? '4px' : isStart ? '4px 0 0 4px' : isEnd ? '0 4px 4px 0' : '0',
                              border: isTentative ? `1px dashed ${bar.projectColor}` : 'none',
                              transform: isHovered ? 'scale(1.01)' : 'scale(1)',
                              transition: 'opacity 150ms ease, transform 150ms ease',
                              padding: '0 8px',
                            }}
                            onMouseEnter={() => onActivityHover?.(activityKey)}
                            onMouseLeave={() => onActivityHover?.(null)}
                            onClick={(e) => {
                              e.stopPropagation();
                              onBarClick(bar.task);
                            }}
                          >
                            {/* Bar text - only show on start cell or if single-day */}
                            {(isStart || (isStart && isEnd)) && (
                              <span
                                className="truncate"
                                style={{
                                  fontSize: typography.xs,
                                  fontWeight: typography.medium,
                                  color: 'white',
                                  whiteSpace: 'nowrap',
                                }}
                              >
                                {bar.activityName}
                              </span>
                            )}
                          </div>
                        );
                      })}
                      {activityBars.length > 2 && (
                        <div
                          className="pointer-events-none"
                          style={{
                            fontSize: typography.xs,
                            fontWeight: typography.medium,
                            color: colors.textSecondary,
                            textAlign: 'center',
                          }}
                        >
                          +{activityBars.length - 2} more
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Single Global Tooltip - Only ONE at a time */}
      {tooltip.visible && tooltip.position && tooltip.date && (
        <div
          className="fixed pointer-events-none"
          style={{
            top: `${tooltip.position.top}px`,
            left: `${tooltip.position.left}px`,
            width: '320px',
            zIndex: 1000,
            animation: 'tooltipFadeIn 150ms ease-out',
          }}
        >
          <div
            className="rounded-lg shadow-2xl"
            style={{
              background: '#1F2937',
              padding: '16px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.20)',
            }}
          >
            {/* Date Header */}
            <div 
              className="font-semibold mb-3"
              style={{
                color: 'white',
                fontSize: '14px',
              }}
            >
              {format(tooltip.date, 'EEEE, MMM d')}
            </div>
            
            {/* Activities List */}
            {tooltip.activities.length > 0 ? (
              <div className="space-y-3 mb-4">
                {tooltip.activities.map((bar, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <div
                      className="rounded-full flex-shrink-0"
                      style={{
                        width: '12px',
                        height: '12px',
                        backgroundColor: bar.projectColor,
                        marginTop: '2px',
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div 
                        className="font-medium"
                        style={{
                          color: 'white',
                          fontSize: '14px',
                          lineHeight: '1.4',
                        }}
                      >
                        {bar.activityName} ({bar.hours}h)
                      </div>
                      <div 
                        style={{
                          color: '#D1D5DB',
                          fontSize: '12px',
                          marginTop: '2px',
                          paddingLeft: '20px',
                        }}
                      >
                        {bar.projectName}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div 
                className="mb-4"
                style={{
                  color: '#9CA3AF',
                  fontSize: '13px',
                }}
              >
                {tooltip.isWeekend ? 'Weekend - No work scheduled' : 'No tasks scheduled'}
              </div>
            )}
            
            {/* Separator */}
            {tooltip.activities.length > 0 && (
              <div 
                style={{
                  borderTop: '1px solid #374151',
                  marginBottom: '12px',
                }}
              />
            )}
            
            {/* Total and Status */}
            {tooltip.allocation && (
              <div className="space-y-1">
                <div 
                  className="font-medium"
                  style={{
                    color: 'white',
                    fontSize: '13px',
                  }}
                >
                  Total: {tooltip.allocation.plannedHours}h / {tooltip.allocation.totalCapacity}h capacity
                </div>
                <div 
                  className="flex items-center gap-1"
                  style={{
                    fontSize: '13px',
                    color: tooltip.percentUsed < 50 
                      ? '#34D399' 
                      : tooltip.percentUsed < 100 
                      ? '#FBBF24' 
                      : '#F87171',
                  }}
                >
                  Status: {
                    tooltip.percentUsed < 50 ? '✓ Available' :
                    tooltip.percentUsed < 100 ? '✓ Optimal' :
                    '⚠️ Overallocated'
                  }
                </div>
              </div>
            )}
            
            {/* CTA */}
            {tooltip.activities.length > 0 && (
              <div 
                className="mt-3 pt-3"
                style={{
                  borderTop: '1px solid #374151',
                  color: '#93C5FD',
                  fontSize: '13px',
                }}
              >
                → Click for details
              </div>
            )}
          </div>
          
          {/* Arrow pointing to cell */}
          <div
            style={{
              position: 'absolute',
              left: '50%',
              transform: 'translateX(-50%)',
              color: '#1F2937',
              fontSize: '16px',
              lineHeight: '8px',
              ...(tooltip.position.top < 300 
                ? { top: '-8px' } 
                : { bottom: '-8px', transform: 'translateX(-50%) rotate(180deg)' }
              ),
            }}
          >
            ▼
          </div>
        </div>
      )}
      
      <style>{`
        @keyframes tooltipFadeIn {
          from {
            opacity: 0;
            transform: translateY(4px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </>
  );
}
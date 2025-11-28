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
  
  // Check if date is start or end of a bar (for rounded corners)
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

  return (
    <>
      <div
        className="flex transition-colors"
        style={{
          height: '72px',
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
            height: '72px',
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

        {/* Capacity Cells with Project Bars */}
        <div className="flex">
          {dates.map((date) => {
            const allocation = allocations.get(date.toISOString().split('T')[0]);
            const plannedHours = allocation?.plannedHours || 0;
            const cellCapacity = allocation?.totalCapacity || 8;
            const percentUsed = cellCapacity > 0 ? (plannedHours / cellCapacity) * 100 : 0;

            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            const isOverallocated = percentUsed > 100;

            // Get activity bars and sort by hours (largest first)
            const activityBars = getActivityBarsForDate(date).sort((a, b) => b.hours - a.hours);
            const hasActivities = activityBars.length > 0;
            const overflowCount = Math.max(0, activityBars.length - 2);
            const overflowHours = activityBars.slice(2).reduce((sum, bar) => sum + bar.hours, 0);

            // Subtle background tints
            const getBackgroundColor = () => {
              if (isWeekend && !hasActivities) return colors.bgSubtle;
              if (isOverallocated) return 'rgba(220, 38, 38, 0.06)';
              return colors.bgWhite;
            };

            return (
              <div
                key={date.toISOString()}
                ref={(el) => {
                  if (el) cellRefs.current.set(date.toISOString(), el);
                }}
                className="min-w-[120px] relative cursor-pointer transition-colors"
                style={{
                  height: '72px',
                  backgroundColor: getBackgroundColor(),
                  borderLeft: `1px solid ${colors.borderLight}`,
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
                {hasActivities ? (
                  <>
                    {/* Capacity indicator - top right corner */}
                    <div
                      className="absolute flex items-center gap-1"
                      style={{
                        top: '4px',
                        right: '6px',
                        fontSize: typography.xs,
                        color: isOverallocated ? colors.statusRed : colors.textMuted,
                      }}
                    >
                      {isOverallocated ? (
                        <>
                          <span style={{ fontWeight: typography.medium }}>{plannedHours}h</span>
                          <AlertCircle style={{ width: '10px', height: '10px' }} />
                        </>
                      ) : (
                        <span>{plannedHours}h</span>
                      )}
                    </div>

                    {/* Project bars - stacked vertically */}
                    <div
                      style={{
                        position: 'absolute',
                        top: '20px',
                        left: '4px',
                        right: '4px',
                        bottom: '4px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '2px',
                      }}
                    >
                      {/* Show top 2 bars (by hours) */}
                      {activityBars.slice(0, 2).map((bar, idx) => {
                        const barIsStart = isBarStart(date, bar);
                        const barIsEnd = isBarEnd(date, bar);
                        const activityKey = `${bar.projectId}-${bar.activityName}`;
                        const isHovered = hoveredActivity === activityKey;

                        return (
                          <div
                            key={`${bar.task.id}-${idx}`}
                            className="flex items-center overflow-hidden cursor-pointer"
                            style={{
                              height: '20px',
                              backgroundColor: bar.projectColor,
                              opacity: isHovered ? 1.0 : 0.85,
                              borderRadius: barIsStart && barIsEnd ? '3px' : barIsStart ? '3px 0 0 3px' : barIsEnd ? '0 3px 3px 0' : '0',
                              padding: '0 6px',
                              transform: isHovered ? 'scale(1.02)' : 'scale(1)',
                              transition: 'opacity 150ms ease, transform 150ms ease',
                            }}
                            onMouseEnter={() => onActivityHover?.(activityKey)}
                            onMouseLeave={() => onActivityHover?.(null)}
                            onClick={(e) => {
                              e.stopPropagation();
                              onBarClick(bar.task);
                            }}
                          >
                            {/* Show name only on start cell */}
                            {barIsStart && (
                              <span
                                className="truncate"
                                style={{
                                  fontSize: '10px',
                                  fontWeight: typography.medium,
                                  color: 'white',
                                }}
                              >
                                {bar.activityName}
                              </span>
                            )}
                          </div>
                        );
                      })}

                      {/* Overflow indicator with hours context */}
                      {overflowCount > 0 && (
                        <div
                          style={{
                            height: '16px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '10px',
                            fontWeight: typography.medium,
                            color: colors.textMuted,
                          }}
                        >
                          +{overflowCount} more ({overflowHours}h)
                        </div>
                      )}
                    </div>
                  </>
                ) : (
                  // Empty cell
                  <div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{
                      fontSize: typography.sm,
                      color: isWeekend ? colors.textMuted : colors.borderDefault,
                      opacity: isWeekend ? 0.4 : 0.6,
                    }}
                  >
                    —
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Hover Tooltip - Task breakdown */}
      {tooltip.visible && tooltip.position && tooltip.date && (
        <div
          className="fixed pointer-events-none"
          style={{
            top: `${tooltip.position.top}px`,
            left: `${tooltip.position.left}px`,
            width: '280px',
            zIndex: 1000,
            animation: 'tooltipFadeIn 150ms ease-out',
          }}
        >
          <div
            className="rounded-lg"
            style={{
              background: '#1F2937',
              padding: '12px 16px',
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.25)',
            }}
          >
            {/* Header: Date · Hours */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: tooltip.activities.length > 0 ? '10px' : '0',
                paddingBottom: tooltip.activities.length > 0 ? '10px' : '0',
                borderBottom: tooltip.activities.length > 0 ? '1px solid #374151' : 'none',
              }}
            >
              <span
                style={{
                  fontSize: typography.sm,
                  fontWeight: typography.medium,
                  color: 'white',
                }}
              >
                {format(tooltip.date, 'EEE MMM d')}
              </span>
              {tooltip.allocation && (
                <span
                  style={{
                    fontSize: typography.sm,
                    color: tooltip.percentUsed > 100 ? '#F87171' : '#9CA3AF',
                  }}
                >
                  {tooltip.allocation.plannedHours}h / {tooltip.allocation.totalCapacity}h
                </span>
              )}
            </div>

            {/* Task breakdown list */}
            {tooltip.activities.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {tooltip.activities.map((bar, idx) => (
                  <div
                    key={idx}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    {/* Project color dot */}
                    <span
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: bar.projectColor,
                        flexShrink: 0,
                      }}
                    />
                    {/* Project name */}
                    <span
                      style={{
                        flex: 1,
                        fontSize: typography.sm,
                        color: '#E5E7EB',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {bar.projectName}
                    </span>
                    {/* Hours */}
                    <span
                      style={{
                        fontSize: typography.sm,
                        color: '#9CA3AF',
                        flexShrink: 0,
                      }}
                    >
                      {bar.hours}h
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div
                style={{
                  fontSize: typography.sm,
                  color: '#6B7280',
                }}
              >
                {tooltip.isWeekend ? 'Weekend' : 'No tasks scheduled'}
              </div>
            )}
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
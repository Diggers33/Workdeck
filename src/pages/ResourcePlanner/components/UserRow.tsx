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
  
  return (
    <>
      <div
        className="flex transition-colors"
        style={{
          height: '56px',
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
            height: '56px',
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
        
        {/* Capacity Cells - Capacity-first view */}
        <div className="flex">
          {dates.map((date) => {
            const allocation = allocations.get(date.toISOString().split('T')[0]);
            const plannedHours = allocation?.plannedHours || 0;
            const totalCapacity = allocation?.totalCapacity || 8;
            const percentUsed = totalCapacity > 0 ? (plannedHours / totalCapacity) * 100 : 0;

            const isWeekend = date.getDay() === 0 || date.getDay() === 6;
            const isOverallocated = percentUsed > 100;

            // Subtle background tints based on capacity
            const getBackgroundColor = () => {
              if (isWeekend && plannedHours === 0) return colors.bgSubtle;
              if (percentUsed > 100) return 'rgba(220, 38, 38, 0.08)'; // subtle red
              if (percentUsed > 85) return 'rgba(217, 119, 6, 0.05)'; // barely visible amber
              return colors.bgWhite;
            };

            // Progress bar color
            const getProgressBarColor = () => {
              if (percentUsed > 100) return colors.statusRed;
              if (percentUsed > 85) return colors.statusAmber;
              if (percentUsed > 50) return colors.statusGreen;
              return colors.statusGray;
            };

            const activityBars = getActivityBarsForDate(date);

            return (
              <div
                key={date.toISOString()}
                ref={(el) => {
                  if (el) cellRefs.current.set(date.toISOString(), el);
                }}
                className="min-w-[120px] relative flex items-center justify-center cursor-pointer transition-colors"
                style={{
                  height: '56px',
                  backgroundColor: getBackgroundColor(),
                  borderLeft: `1px solid ${colors.borderLight}`,
                }}
                onClick={() => onUserClick(user.id)}
                onMouseEnter={(e) => {
                  const cellElement = cellRefs.current.get(date.toISOString());
                  if (cellElement) {
                    handleCellMouseEnter(date, activityBars, allocation || null, percentUsed, isWeekend, cellElement);
                  }
                  // Hover background
                  if (!isOverallocated) {
                    e.currentTarget.style.backgroundColor = colors.bgHover;
                  }
                }}
                onMouseLeave={(e) => {
                  handleCellMouseLeave();
                  e.currentTarget.style.backgroundColor = getBackgroundColor();
                }}
              >
                {/* Cell content */}
                {plannedHours > 0 ? (
                  <>
                    {/* Hours display - centered */}
                    <span
                      style={{
                        fontSize: typography.md,
                        fontWeight: typography.medium,
                        color: isOverallocated ? colors.statusRed : colors.textPrimary,
                      }}
                    >
                      {plannedHours}h
                    </span>

                    {/* Overallocation indicator */}
                    {isOverallocated && (
                      <AlertCircle
                        style={{
                          width: '12px',
                          height: '12px',
                          color: colors.statusRed,
                          marginLeft: '4px',
                        }}
                      />
                    )}

                    {/* Capacity progress bar at bottom */}
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
                          width: `${Math.min(percentUsed, 100)}%`,
                          backgroundColor: getProgressBarColor(),
                          transition: 'width 200ms ease',
                        }}
                      />
                    </div>
                  </>
                ) : (
                  // Empty cell
                  <span
                    style={{
                      fontSize: typography.sm,
                      color: isWeekend ? colors.textMuted : colors.borderDefault,
                      opacity: isWeekend ? 0.5 : 1,
                    }}
                  >
                    {isWeekend ? '—' : '—'}
                  </span>
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
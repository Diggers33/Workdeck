import { useState, useMemo } from 'react';
import { User, Task, Project } from '../types';
import { format, startOfMonth, endOfMonth, startOfWeek, addWeeks, getWeek } from 'date-fns';
import { TrendingUp, TrendingDown, ChevronRight, ChevronDown } from 'lucide-react';
import { colors, typography, getUtilizationColor } from '../constants/designTokens';

interface MonthViewProps {
  users: User[];
  tasks: Task[];
  projects: Project[];
  departments: string[];
  currentMonth: Date;
  collapsedDepartments: Set<string>;
  onToggleDepartment: (dept: string) => void;
  onUserClick: (userId: string) => void;
  selectedUserId: string | null;
}

interface WeekData {
  weekNumber: number;
  startDate: Date;
  endDate: Date;
  label: string;
}

interface UserWeekSummary {
  plannedHours: number;
  capacity: number;
  utilization: number;
  projectCount: number;
  projectBreakdown: { projectId: string; projectName: string; hours: number; color: string }[];
}

export function MonthView({
  users,
  tasks,
  projects,
  departments: _departments,
  currentMonth,
  collapsedDepartments,
  onToggleDepartment,
  onUserClick,
  selectedUserId,
}: MonthViewProps) {
  // _departments available for future department-based filtering
  void _departments;
  const [hoveredCell, setHoveredCell] = useState<{ userId: string; weekNumber: number } | null>(null);

  // Calculate weeks in the current month
  const weeksInMonth = useMemo(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const weeks: WeekData[] = [];

    let weekStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Start on Monday

    while (weekStart <= monthEnd) {
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);
      const weekNum = getWeek(weekStart, { weekStartsOn: 1 });

      // Format: "Week 46 (Nov 11-17)"
      const label = `Week ${weekNum} (${format(weekStart, 'MMM d')}-${format(weekEnd, 'd')})`;

      weeks.push({
        weekNumber: weekNum,
        startDate: new Date(weekStart),
        endDate: weekEnd,
        label,
      });

      weekStart = addWeeks(weekStart, 1);
    }

    return weeks;
  }, [currentMonth]);

  // Calculate user summaries for each week
  const userWeekSummaries = useMemo(() => {
    const summaries = new Map<string, Map<number, UserWeekSummary>>();

    users.forEach(user => {
      const userSummaries = new Map<number, UserWeekSummary>();

      weeksInMonth.forEach(week => {
        const userTasks = tasks.filter(task => {
          if (task.assignedUserId !== user.id) return false;
          const taskStart = new Date(task.startDate);
          const taskEnd = new Date(task.endDate);
          return !(taskEnd < week.startDate || taskStart > week.endDate);
        });

        // Calculate hours per project
        const projectHours = new Map<string, number>();
        userTasks.forEach(task => {
          const current = projectHours.get(task.projectId) || 0;
          projectHours.set(task.projectId, current + task.plannedHours);
        });

        // Build project breakdown
        const projectBreakdown = Array.from(projectHours.entries()).map(([projectId, hours]) => {
          const project = projects.find(p => p.id === projectId);
          return {
            projectId,
            projectName: project?.name || 'Unknown',
            hours,
            color: project?.color || '#94A3B8',
          };
        });

        const plannedHours = userTasks.reduce((sum, t) => sum + t.plannedHours, 0);
        const capacity = 40; // 40 hours per week
        const utilization = (plannedHours / capacity) * 100;

        userSummaries.set(week.weekNumber, {
          plannedHours,
          capacity,
          utilization,
          projectCount: projectBreakdown.length,
          projectBreakdown,
        });
      });

      summaries.set(user.id, userSummaries);
    });

    return summaries;
  }, [users, tasks, projects, weeksInMonth]);

  // Calculate monthly stats for sidebar
  const monthlyStats = useMemo(() => {
    let totalPlanned = 0;
    let totalCapacity = 0;

    users.forEach(user => {
      const userSummaries = userWeekSummaries.get(user.id);
      if (userSummaries) {
        weeksInMonth.forEach(week => {
          const summary = userSummaries.get(week.weekNumber);
          if (summary) {
            totalPlanned += summary.plannedHours;
            totalCapacity += summary.capacity;
          }
        });
      }
    });

    const avgUtilization = totalCapacity > 0 ? (totalPlanned / totalCapacity) * 100 : 0;

    // Count users by utilization category
    let overCapacity = 0;
    let optimalCapacity = 0;
    let underCapacity = 0;

    users.forEach(user => {
      const userSummaries = userWeekSummaries.get(user.id);
      let userTotalPlanned = 0;
      let userTotalCapacity = 0;

      if (userSummaries) {
        weeksInMonth.forEach(week => {
          const summary = userSummaries.get(week.weekNumber);
          if (summary) {
            userTotalPlanned += summary.plannedHours;
            userTotalCapacity += summary.capacity;
          }
        });
      }

      const userUtilization = userTotalCapacity > 0 ? (userTotalPlanned / userTotalCapacity) * 100 : 0;
      if (userUtilization > 100) overCapacity++;
      else if (userUtilization >= 70) optimalCapacity++;
      else underCapacity++;
    });

    // Mock trend - in real app would compare to previous month
    const trendUp = avgUtilization >= 75;

    return {
      avgUtilization: Math.round(avgUtilization),
      totalPlanned: Math.round(totalPlanned),
      totalCapacity: Math.round(totalCapacity),
      overCapacity,
      optimalCapacity,
      underCapacity,
      trendUp,
    };
  }, [users, userWeekSummaries, weeksInMonth]);

  // Group users by department
  const groupedUsers = useMemo(() => {
    const groups = new Map<string, User[]>();
    users.forEach(user => {
      const dept = user.department;
      if (!groups.has(dept)) {
        groups.set(dept, []);
      }
      groups.get(dept)!.push(user);
    });
    return new Map([...groups.entries()].sort((a, b) => a[0].localeCompare(b[0])));
  }, [users]);

  // Get utilization background color
  const getUtilizationBgColor = (utilization: number): string => {
    if (utilization <= 50) return '#FFFFFF'; // White
    if (utilization <= 85) return '#D1FAE5'; // Green
    if (utilization <= 100) return '#FEF3C7'; // Amber
    return '#FEE2E2'; // Red
  };

  // Get utilization bar color
  const getUtilizationBarColor = (utilization: number): string => {
    if (utilization <= 50) return '#94A3B8'; // Gray
    if (utilization <= 85) return '#10B981'; // Green
    if (utilization <= 100) return '#F59E0B'; // Amber
    return '#EF4444'; // Red
  };

  return (
    <div className="flex h-full">
      {/* Main Grid */}
      <div className="flex-1 overflow-auto">
        <div className="min-w-max">
          {/* Header Row */}
          <div className="sticky top-0 z-20 bg-white border-b-2 border-gray-300 flex">
            {/* User Column Header */}
            <div
              className="sticky left-0 z-30 bg-white border-r border-gray-300 p-3 flex items-center"
              style={{ width: '240px' }}
            >
              <span className="font-medium text-sm text-gray-700">Team Member</span>
            </div>

            {/* Week Headers */}
            {weeksInMonth.map(week => (
              <div
                key={week.weekNumber}
                className="border-l border-gray-200 p-3 text-center"
                style={{ minWidth: '160px' }}
              >
                <div className="text-sm font-semibold text-gray-900">Week {week.weekNumber}</div>
                <div className="text-xs text-gray-500 mt-0.5">
                  {format(week.startDate, 'MMM d')}-{format(week.endDate, 'd')}
                </div>
              </div>
            ))}
          </div>

          {/* Department & User Rows */}
          {Array.from(groupedUsers.entries()).map(([dept, deptUsers]) => {
            const isCollapsed = collapsedDepartments.has(dept);

            return (
              <div key={dept}>
                {/* Department Header */}
                <div
                  className="flex bg-gray-100 border-b border-gray-200 hover:bg-gray-150 transition-colors cursor-pointer"
                  onClick={() => onToggleDepartment(dept)}
                >
                  <div
                    className="sticky left-0 z-10 bg-gray-100 border-r border-gray-300 p-3 flex items-center gap-2"
                    style={{ width: '240px' }}
                  >
                    {isCollapsed ? (
                      <ChevronRight className="h-3.5 w-3.5 text-gray-500" />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5 text-gray-500" />
                    )}
                    <span className="font-medium text-sm">{dept} ({deptUsers.length})</span>
                  </div>
                  {weeksInMonth.map(week => (
                    <div
                      key={week.weekNumber}
                      className="border-l border-gray-200"
                      style={{ minWidth: '160px' }}
                    />
                  ))}
                </div>

                {/* User Rows */}
                {!isCollapsed && deptUsers.map(user => {
                  const userSummaries = userWeekSummaries.get(user.id);

                  return (
                    <div
                      key={user.id}
                      className={`flex border-b border-gray-100 hover:bg-gray-50 transition-colors cursor-pointer ${
                        selectedUserId === user.id ? 'bg-blue-50' : ''
                      }`}
                      onClick={() => onUserClick(user.id)}
                    >
                      {/* User Info */}
                      <div
                        className="sticky left-0 z-10 bg-white border-r border-gray-200 p-3 flex items-center gap-3"
                        style={{ width: '240px' }}
                      >
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="w-8 h-8 rounded-full"
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-xs text-gray-500">{user.role}</div>
                        </div>
                      </div>

                      {/* Week Cells */}
                      {weeksInMonth.map(week => {
                        const summary = userSummaries?.get(week.weekNumber);
                        const utilization = summary?.utilization || 0;
                        const isHovered = hoveredCell?.userId === user.id && hoveredCell?.weekNumber === week.weekNumber;

                        return (
                          <div
                            key={week.weekNumber}
                            className="border-l border-gray-100 p-2 relative"
                            style={{
                              minWidth: '160px',
                              backgroundColor: getUtilizationBgColor(utilization),
                            }}
                            onMouseEnter={() => setHoveredCell({ userId: user.id, weekNumber: week.weekNumber })}
                            onMouseLeave={() => setHoveredCell(null)}
                          >
                            {/* Summary Content */}
                            <div className="flex flex-col gap-1.5">
                              {/* Hours */}
                              <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-gray-900">
                                  {summary?.plannedHours || 0}h
                                </span>
                                <span className="text-xs text-gray-500">
                                  / {summary?.capacity || 40}h
                                </span>
                              </div>

                              {/* Mini Utilization Bar */}
                              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full transition-all"
                                  style={{
                                    width: `${Math.min(utilization, 100)}%`,
                                    backgroundColor: getUtilizationBarColor(utilization),
                                  }}
                                />
                              </div>

                              {/* Project Count */}
                              <div className="text-xs text-gray-500">
                                {summary?.projectCount || 0} project{summary?.projectCount !== 1 ? 's' : ''}
                              </div>
                            </div>

                            {/* Hover Tooltip */}
                            {isHovered && summary && summary.projectBreakdown.length > 0 && (
                              <div
                                className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-lg p-3"
                                style={{
                                  top: 'calc(100% + 4px)',
                                  left: '50%',
                                  transform: 'translateX(-50%)',
                                  minWidth: '200px',
                                }}
                              >
                                <div className="text-sm font-medium text-gray-900 mb-2">
                                  Week {week.weekNumber} · {user.name}
                                </div>
                                <div className="border-t border-gray-100 pt-2">
                                  {summary.projectBreakdown.map((project) => (
                                    <div
                                      key={project.projectId}
                                      className="flex items-center justify-between py-1"
                                    >
                                      <div className="flex items-center gap-2">
                                        <div
                                          className="w-2.5 h-2.5 rounded-sm"
                                          style={{ backgroundColor: project.color }}
                                        />
                                        <span className="text-sm text-gray-700">{project.projectName}</span>
                                      </div>
                                      <span className="text-sm font-medium text-gray-900">
                                        {project.hours}h
                                      </span>
                                    </div>
                                  ))}
                                </div>
                                <div className="border-t border-gray-100 mt-2 pt-2 flex justify-between">
                                  <span className="text-sm text-gray-500">Total</span>
                                  <span className="text-sm font-semibold text-gray-900">
                                    {summary.plannedHours}h / {summary.capacity}h
                                  </span>
                                </div>
                                <div className="flex justify-between mt-1">
                                  <span className="text-sm text-gray-500">Utilization</span>
                                  <span
                                    className="text-sm font-semibold"
                                    style={{ color: getUtilizationBarColor(utilization) }}
                                  >
                                    {Math.round(utilization)}%
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Monthly Stats Sidebar */}
      <div
        className="border-l border-gray-200 bg-white p-4 flex flex-col gap-4"
        style={{ width: '200px' }}
      >
        <div className="text-sm font-semibold text-gray-900">
          {format(currentMonth, 'MMMM yyyy')}
        </div>

        {/* Average Utilization */}
        <div className="bg-gray-50 rounded-lg p-3">
          <div className="text-xs text-gray-500 mb-1">Avg Utilization</div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold text-gray-900">
              {monthlyStats.avgUtilization}%
            </span>
            {monthlyStats.trendUp ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
          </div>
          {/* Progress Bar */}
          <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: `${Math.min(monthlyStats.avgUtilization, 100)}%`,
                backgroundColor: getUtilizationBarColor(monthlyStats.avgUtilization),
              }}
            />
          </div>
        </div>

        {/* Capacity Breakdown */}
        <div>
          <div className="text-xs text-gray-500 mb-2">Capacity Status</div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-sm bg-red-500" />
                <span className="text-sm text-gray-700">Over</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{monthlyStats.overCapacity}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-sm bg-green-500" />
                <span className="text-sm text-gray-700">Optimal</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{monthlyStats.optimalCapacity}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-sm bg-amber-500" />
                <span className="text-sm text-gray-700">Under</span>
              </div>
              <span className="text-sm font-medium text-gray-900">{monthlyStats.underCapacity}</span>
            </div>
          </div>
        </div>

        {/* Total Hours */}
        <div>
          <div className="text-xs text-gray-500 mb-2">Total Hours</div>
          <div className="text-lg font-semibold text-gray-900">
            {monthlyStats.totalPlanned.toLocaleString()}h
          </div>
          <div className="text-xs text-gray-500">
            of {monthlyStats.totalCapacity.toLocaleString()}h capacity
          </div>
        </div>

        {/* Utilization Legend */}
        <div className="mt-auto pt-4 border-t border-gray-100">
          <div className="text-xs text-gray-500 mb-2">Utilization Legend</div>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="w-4 h-3 rounded border border-gray-200" style={{ backgroundColor: '#FFFFFF' }} />
              <span className="text-xs text-gray-600">0-50%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-3 rounded" style={{ backgroundColor: '#D1FAE5' }} />
              <span className="text-xs text-gray-600">51-85%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-3 rounded" style={{ backgroundColor: '#FEF3C7' }} />
              <span className="text-xs text-gray-600">86-100%</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-3 rounded" style={{ backgroundColor: '#FEE2E2' }} />
              <span className="text-xs text-gray-600">101%+</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

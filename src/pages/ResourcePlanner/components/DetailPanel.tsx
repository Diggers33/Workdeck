import React, { useState } from 'react';
import { X, Calendar, Mail, Download, Settings, ChevronDown } from 'lucide-react';
import { User, Task, Project } from '../types';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { format, differenceInDays, addWeeks, startOfWeek, endOfWeek, eachDayOfInterval, addMonths, startOfMonth, endOfMonth } from 'date-fns';

interface DetailPanelProps {
  user?: User;
  activity?: Task;
  selectedTask?: Task | null;
  tasks: Task[];
  projects: Project[];
  onClose: () => void;
  onTaskClick: (task: Task) => void;
  onPlanTime: (userId: string) => void;
  hoveredActivity?: string | null;
  onActivityHover?: (activityKey: string | null) => void;
}

type TabType = 'this-week' | 'schedule';

interface WeekData {
  weekStart: Date;
  weekEnd: Date;
  plannedHours: number;
  capacity: number;
  utilization: number;
  projects: Array<{ project: Project; hours: number }>;
}

export function DetailPanel({ user, activity, selectedTask, tasks, projects, onClose, onTaskClick, onPlanTime, hoveredActivity, onActivityHover }: DetailPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('this-week');
  const [showAllWeeks, setShowAllWeeks] = useState(false);
  const [hoveredCardKey, setHoveredCardKey] = useState<string | null>(null);

  if (!user && !activity) return null;

  const displayUser = user || (activity ? { id: activity.assigneeId } as User : null);
  const userTasks = displayUser ? tasks.filter(t => t.assigneeId === displayUser.id) : [];
  
  // Calculate weekly summary
  const totalPlanned = userTasks.reduce((sum, t) => sum + t.plannedHours, 0);
  const totalLogged = userTasks.reduce((sum, t) => sum + (t.loggedHours || 0), 0);
  const totalCapacity = user?.totalCapacity || 40;
  const utilizationPercent = (totalPlanned / totalCapacity) * 100;

  // Calculate week date range
  const getWeekRange = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = day === 0 ? -6 : 1 - day;
    const weekStart = new Date(today);
    weekStart.setDate(today.getDate() + diff);
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);
    return { weekStart, weekEnd };
  };

  const { weekStart, weekEnd } = getWeekRange();

  // Group tasks by project and activity
  const tasksByActivity = new Map<string, { project: Project; task: Task }[]>();
  userTasks.forEach(task => {
    const project = projects.find(p => p.id === task.projectId);
    if (project) {
      const key = `${project.id}-${task.activity}`;
      if (!tasksByActivity.has(key)) {
        tasksByActivity.set(key, []);
      }
      tasksByActivity.get(key)!.push({ project, task });
    }
  });

  // Schedule calculations
  const calculatePeriodCapacity = (startDate: Date, endDate: Date) => {
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const workingDays = days.filter(day => day.getDay() !== 0 && day.getDay() !== 6).length;
    const totalCap = workingDays * 8;
    
    let plannedHours = 0;
    userTasks.forEach(task => {
      const taskStart = new Date(task.startDate);
      const taskEnd = new Date(task.endDate);
      taskStart.setHours(0, 0, 0, 0);
      taskEnd.setHours(0, 0, 0, 0);
      
      if (taskStart <= endDate && taskEnd >= startDate) {
        const taskDays = differenceInDays(taskEnd, taskStart) + 1;
        const overlapStart = taskStart < startDate ? startDate : taskStart;
        const overlapEnd = taskEnd > endDate ? endDate : taskEnd;
        const overlapDays = differenceInDays(overlapEnd, overlapStart) + 1;
        const hoursForPeriod = (task.plannedHours / taskDays) * overlapDays;
        plannedHours += hoursForPeriod;
      }
    });
    
    return { plannedHours, totalCapacity: totalCap, utilization: totalCap > 0 ? (plannedHours / totalCap) * 100 : 0 };
  };

  const getWeeklyData = (): WeekData[] => {
    const weeks: WeekData[] = [];
    const today = new Date();
    
    for (let i = 0; i < 8; i++) {
      const wStart = startOfWeek(addWeeks(today, i), { weekStartsOn: 1 });
      const wEnd = endOfWeek(addWeeks(today, i), { weekStartsOn: 1 });
      
      const { plannedHours, totalCapacity: cap, utilization } = calculatePeriodCapacity(wStart, wEnd);
      
      const projectHours = new Map<string, number>();
      userTasks.forEach(task => {
        const taskStart = new Date(task.startDate);
        const taskEnd = new Date(task.endDate);
        taskStart.setHours(0, 0, 0, 0);
        taskEnd.setHours(0, 0, 0, 0);
        
        if (taskStart <= wEnd && taskEnd >= wStart) {
          const current = projectHours.get(task.projectId) || 0;
          const taskDays = differenceInDays(taskEnd, taskStart) + 1;
          const overlapStart = taskStart < wStart ? wStart : taskStart;
          const overlapEnd = taskEnd > wEnd ? wEnd : taskEnd;
          const overlapDays = differenceInDays(overlapEnd, overlapStart) + 1;
          const hoursForWeek = (task.plannedHours / taskDays) * overlapDays;
          projectHours.set(task.projectId, current + hoursForWeek);
        }
      });
      
      const weekProjects = Array.from(projectHours.entries())
        .map(([projectId, hours]) => ({
          project: projects.find(p => p.id === projectId)!,
          hours
        }))
        .filter(p => p.project)
        .sort((a, b) => b.hours - a.hours);
      
      weeks.push({
        weekStart: wStart,
        weekEnd: wEnd,
        plannedHours,
        capacity: cap,
        utilization,
        projects: weekProjects
      });
    }
    
    return weeks;
  };

  const weeklyData = getWeeklyData();
  const displayedWeeks = showAllWeeks ? weeklyData : weeklyData.slice(0, 4);

  const today = new Date();
  const thisMonth = calculatePeriodCapacity(startOfMonth(today), endOfMonth(today));
  const nextMonth = calculatePeriodCapacity(startOfMonth(addMonths(today, 1)), endOfMonth(addMonths(today, 1)));

  // Project distribution
  const projectDistribution = new Map<string, number>();
  userTasks.forEach(task => {
    const current = projectDistribution.get(task.projectId) || 0;
    projectDistribution.set(task.projectId, current + task.plannedHours);
  });
  
  const totalPlannedHours = Array.from(projectDistribution.values()).reduce((sum, h) => sum + h, 0);
  const distributionData = Array.from(projectDistribution.entries())
    .map(([projectId, hours]) => ({
      project: projects.find(p => p.id === projectId)!,
      hours,
      percentage: totalPlannedHours > 0 ? (hours / totalPlannedHours) * 100 : 0
    }))
    .filter(d => d.project)
    .sort((a, b) => b.hours - a.hours);

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case 'Completed': return '✓';
      case 'In Progress': return '⏳';
      default: return '○';
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'Completed': return '#10B981';
      case 'In Progress': return '#3B82F6';
      default: return '#9CA3AF';
    }
  };

  const getStatusText = (status?: string) => {
    switch (status) {
      case 'Completed': return 'Done';
      case 'In Progress': return 'In Progress';
      default: return 'To Do';
    }
  };

  return (
    <div
      className="fixed top-0 right-0 h-screen bg-white flex flex-col"
      style={{
        width: '480px',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
        zIndex: 100,
        animation: 'slideInFromRight 300ms ease-out'
      }}
    >
      {/* HEADER - Fixed 140px */}
      <div
        className="flex-shrink-0 border-b border-gray-200"
        style={{ height: '140px', padding: '20px' }}
      >
        {/* User Info */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            {user && (
              <Avatar style={{ width: '48px', height: '48px', border: '2px solid #E5E7EB' }}>
                <AvatarImage src={user.avatar} />
                <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
            )}
            <div>
              <h2 className="font-semibold" style={{ fontSize: '18px', color: '#1F2937', lineHeight: '1.3' }}>
                {user?.name || 'Activity Details'}
              </h2>
              {user && (
                <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.3', marginTop: '2px' }}>
                  {user.role} • {Math.round(utilizationPercent)}% utilized
                </p>
              )}
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            style={{ width: '32px', height: '32px', padding: 0 }}
          >
            <X className="h-5 w-5" style={{ color: '#6B7280' }} />
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 mb-4">
          <Button variant="ghost" size="sm" style={{ height: '32px', padding: '6px 12px', fontSize: '14px' }}>
            <Mail className="h-4 w-4 mr-1.5" />
            Message
          </Button>
          <Button variant="ghost" size="sm" style={{ height: '32px', padding: '6px 12px', fontSize: '14px' }}>
            <Calendar className="h-4 w-4 mr-1.5" />
            Calendar
          </Button>
          <Button variant="ghost" size="sm" style={{ height: '32px', padding: '6px 12px', fontSize: '14px' }}>
            <Download className="h-4 w-4 mr-1.5" />
            Export
          </Button>
          <Button variant="ghost" size="sm" style={{ height: '32px', padding: '6px 12px', fontSize: '14px' }}>
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* Tab Bar */}
        <div className="flex border-b border-gray-200" style={{ marginLeft: '-20px', marginRight: '-20px', paddingLeft: '20px', paddingRight: '20px' }}>
          <button
            onClick={() => setActiveTab('this-week')}
            className="flex items-center gap-1.5 transition-colors"
            style={{
              height: '40px',
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 500,
              color: activeTab === 'this-week' ? '#3B82F6' : '#6B7280',
              borderBottom: activeTab === 'this-week' ? '2px solid #3B82F6' : '2px solid transparent',
              marginBottom: '-1px'
            }}
          >
            <Calendar className="h-4 w-4" />
            This Week
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className="flex items-center gap-1.5 transition-colors"
            style={{
              height: '40px',
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 500,
              color: activeTab === 'schedule' ? '#3B82F6' : '#6B7280',
              borderBottom: activeTab === 'schedule' ? '2px solid #3B82F6' : '2px solid transparent',
              marginBottom: '-1px'
            }}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            Schedule
          </button>
        </div>
      </div>

      {/* CONTENT - Scrollable */}
      <div className="flex-1 overflow-y-auto" style={{ padding: '20px' }}>
        {activeTab === 'this-week' ? (
          // THIS WEEK TAB
          <>
            {/* Week Summary */}
            <div
              className="rounded-lg border border-gray-200 mb-5"
              style={{ background: '#FAFBFC', padding: '16px' }}
            >
              <div className="space-y-2">
                <div className="flex justify-between" style={{ lineHeight: '28px' }}>
                  <span style={{ fontSize: '14px', color: '#6B7280' }}>Planned</span>
                  <span style={{ fontSize: '14px', fontWeight: 500, color: '#1F2937' }}>{Math.round(totalPlanned)}h</span>
                </div>
                <div className="flex justify-between" style={{ lineHeight: '28px' }}>
                  <span style={{ fontSize: '14px', color: '#6B7280' }}>Logged</span>
                  <span style={{ fontSize: '14px', fontWeight: 500, color: '#1F2937' }}>{Math.round(totalLogged)}h</span>
                </div>
                <div className="flex justify-between" style={{ lineHeight: '28px' }}>
                  <span style={{ fontSize: '14px', color: '#6B7280' }}>Capacity</span>
                  <span style={{ fontSize: '14px', fontWeight: 500, color: '#1F2937' }}>
                    {Math.round(totalPlanned)}h / {totalCapacity}h ({Math.round(utilizationPercent)}%)
                  </span>
                </div>
                <div
                  className="w-full rounded overflow-hidden mt-2"
                  style={{ height: '8px', background: '#E5E7EB' }}
                >
                  <div
                    className="h-full transition-all"
                    style={{
                      width: `${Math.min(utilizationPercent, 100)}%`,
                      background: '#10B981'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Capacity by Project */}
            <div className="mb-5">
              <h3 className="font-semibold mb-3" style={{ fontSize: '16px', color: '#1F2937' }}>
                Capacity by Project
              </h3>
              {distributionData.slice(0, 3).map((item, index) => (
                <div key={index} style={{ marginBottom: '8px' }}>
                  <div className="flex justify-between items-center mb-1.5">
                    <div className="flex items-center gap-2">
                      <div
                        className="rounded-full"
                        style={{ width: '12px', height: '12px', background: item.project.color }}
                      />
                      <span style={{ fontSize: '14px', fontWeight: 500, color: '#1F2937' }}>
                        {item.project.name}
                      </span>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 500, color: '#6B7280' }}>
                      {Math.round(item.hours)}h
                    </span>
                  </div>
                  <div className="relative">
                    <div
                      className="rounded overflow-hidden"
                      style={{ height: '6px', background: '#E5E7EB' }}
                    >
                      <div
                        className="h-full"
                        style={{
                          width: `${item.percentage}%`,
                          background: item.project.color
                        }}
                      />
                    </div>
                    <div className="text-right mt-1" style={{ fontSize: '12px', color: '#6B7280' }}>
                      {Math.round(item.percentage)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Activities */}
            <div>
              <h3 className="font-semibold mb-3" style={{ fontSize: '16px', color: '#1F2937' }}>
                Activities
              </h3>
              {Array.from(tasksByActivity.entries()).map(([key, items]) => {
                const { project, task: firstTask } = items[0];
                const activityHours = items.reduce((sum, { task }) => sum + task.plannedHours, 0);
                const activityLogged = items.reduce((sum, { task }) => sum + (task.loggedHours || 0), 0);
                const activityProgress = activityHours > 0 ? (activityLogged / activityHours) * 100 : 0;
                
                const isHovered = hoveredCardKey === key || hoveredActivity === key;
                
                return (
                  <div
                    key={key}
                    className="rounded-lg border transition-all mb-3"
                    style={{
                      padding: '16px',
                      background: 'white',
                      borderColor: isHovered ? '#3B82F6' : '#E5E7EB',
                      boxShadow: isHovered ? '0 2px 8px rgba(59,130,246,0.1)' : 'none'
                    }}
                    onMouseEnter={() => {
                      setHoveredCardKey(key);
                      onActivityHover?.(key);
                    }}
                    onMouseLeave={() => {
                      setHoveredCardKey(null);
                      onActivityHover?.(null);
                    }}
                  >
                    {/* Header */}
                    <div className="mb-3">
                      <div className="flex items-center gap-2 mb-1">
                        <div
                          className="rounded-full"
                          style={{ width: '12px', height: '12px', background: project.color }}
                        />
                        <span style={{ fontSize: '15px', fontWeight: 600, color: '#1F2937' }}>
                          {project.name}
                        </span>
                      </div>
                      <div style={{ fontSize: '14px', color: '#6B7280' }}>
                        {firstTask.activity} ({Math.round(activityHours)}h)
                      </div>
                    </div>

                    {/* Date Range */}
                    <div className="flex items-center gap-1.5 mb-3" style={{ fontSize: '13px', color: '#6B7280' }}>
                      <Calendar className="h-3.5 w-3.5" />
                      <span>
                        {format(new Date(firstTask.startDate), 'EEE MMM d')} - {format(new Date(firstTask.endDate), 'EEE MMM d')}
                      </span>
                    </div>

                    {/* Progress */}
                    <div className="mb-3">
                      <div className="flex justify-between items-center mb-1.5" style={{ fontSize: '13px' }}>
                        <span style={{ color: '#6B7280' }}>Progress</span>
                        <span style={{ color: '#1F2937', fontWeight: 500 }}>
                          {Math.round(activityProgress)}%
                        </span>
                      </div>
                      <div
                        className="rounded overflow-hidden"
                        style={{ height: '6px', background: '#E5E7EB' }}
                      >
                        <div
                          className="h-full transition-all"
                          style={{
                            width: `${Math.min(activityProgress, 100)}%`,
                            background: project.color
                          }}
                        />
                      </div>
                    </div>

                    {/* Status Badges */}
                    <div className="flex gap-2 mb-3">
                      <span
                        className="inline-flex items-center rounded"
                        style={{
                          height: '24px',
                          padding: '4px 10px',
                          fontSize: '12px',
                          fontWeight: 500,
                          background: firstTask.isBillable ? '#D1FAE5' : '#F3F4F6',
                          color: firstTask.isBillable ? '#059669' : '#6B7280'
                        }}
                      >
                        {firstTask.isBillable ? 'Billable' : 'Non-billable'}
                      </span>
                      <span
                        className="inline-flex items-center rounded"
                        style={{
                          height: '24px',
                          padding: '4px 10px',
                          fontSize: '12px',
                          fontWeight: 500,
                          background: firstTask.status === 'In Progress' ? '#DBEAFE' : '#F3F4F6',
                          color: firstTask.status === 'In Progress' ? '#2563EB' : '#6B7280'
                        }}
                      >
                        {getStatusText(firstTask.status)}
                      </span>
                    </div>

                    {/* Tasks */}
                    {items.length > 0 && (
                      <div>
                        <div style={{ fontSize: '13px', fontWeight: 500, color: '#6B7280', marginBottom: '8px' }}>
                          Tasks:
                        </div>
                        {items.map(({ task }, idx) => (
                          <div
                            key={idx}
                            className="mb-2 cursor-pointer hover:bg-gray-50 rounded p-2"
                            onClick={() => onTaskClick(task)}
                            style={{ marginLeft: '-8px', marginRight: '-8px' }}
                          >
                            <div className="flex items-start gap-2">
                              <span style={{ fontSize: '16px', color: getStatusColor(task.status) }}>
                                {getStatusIcon(task.status)}
                              </span>
                              <div className="flex-1">
                                <div style={{ fontSize: '13px', fontWeight: 500, color: '#1F2937' }}>
                                  {task.taskName} ({task.plannedHours}h)
                                  <span style={{ marginLeft: '6px', color: '#6B7280', fontWeight: 400 }}>
                                    - {getStatusText(task.status)}
                                  </span>
                                </div>
                                {task.loggedHours !== undefined && task.loggedHours > 0 && (
                                  <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>
                                    Logged: {task.loggedHours}h of {task.plannedHours}h • {Math.round((task.loggedHours / task.plannedHours) * 100)}% complete
                                  </div>
                                )}
                                {task.status === 'To Do' && (
                                  <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>
                                    Due: {format(new Date(task.endDate), 'MMM d')}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        ) : (
          // SCHEDULE TAB
          <>
            {/* Capacity Overview Cards */}
            <div className="flex gap-5 mb-5">
              <div
                className="flex-1 rounded-md border border-gray-200"
                style={{ background: '#FAFBFC', padding: '12px', height: '100px' }}
              >
                <div className="font-medium mb-2" style={{ fontSize: '12px', color: '#6B7280' }}>
                  This Month
                </div>
                <div className="font-bold mb-1" style={{ fontSize: '20px', color: '#1F2937' }}>
                  {Math.round(thisMonth.plannedHours)}h / {thisMonth.totalCapacity}h
                </div>
                <div className="mb-2" style={{ fontSize: '13px', color: '#6B7280' }}>
                  {Math.round(thisMonth.utilization)}%
                </div>
                <div
                  className="w-full rounded overflow-hidden"
                  style={{ height: '6px', background: '#E5E7EB' }}
                >
                  <div
                    className="h-full"
                    style={{
                      width: `${Math.min(thisMonth.utilization, 100)}%`,
                      background: '#10B981'
                    }}
                  />
                </div>
              </div>

              <div
                className="flex-1 rounded-md border border-gray-200"
                style={{ background: '#FAFBFC', padding: '12px', height: '100px' }}
              >
                <div className="font-medium mb-2" style={{ fontSize: '12px', color: '#6B7280' }}>
                  Next Month
                </div>
                <div className="font-bold mb-1" style={{ fontSize: '20px', color: '#1F2937' }}>
                  {Math.round(nextMonth.plannedHours)}h / {nextMonth.totalCapacity}h
                </div>
                <div className="mb-2" style={{ fontSize: '13px', color: '#6B7280' }}>
                  {Math.round(nextMonth.utilization)}%
                </div>
                <div
                  className="w-full rounded overflow-hidden"
                  style={{ height: '6px', background: '#E5E7EB' }}
                >
                  <div
                    className="h-full"
                    style={{
                      width: `${Math.min(nextMonth.utilization, 100)}%`,
                      background: '#10B981'
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Capacity Forecast */}
            <div className="mb-5">
              <h3 className="font-semibold mb-3" style={{ fontSize: '16px', color: '#1F2937' }}>
                Capacity Forecast
              </h3>
              <div>
                {displayedWeeks.map((week, index) => {
                  const showFirstN = week.projects.length >= 3 ? 2 : week.projects.length;
                  const firstProjects = week.projects.slice(0, showFirstN);
                  const remainingCount = week.projects.length - showFirstN;

                  return (
                    <div
                      key={index}
                      className="flex items-center border-b border-gray-100"
                      style={{ padding: '8px 0', minHeight: '36px', fontSize: '13px' }}
                    >
                      <span className="font-medium" style={{ color: '#1F2937', width: '150px' }}>
                        Week of {format(week.weekStart, 'MMM d')}-{format(week.weekEnd, 'd')}
                      </span>
                      <span className="font-medium" style={{ color: '#6B7280', width: '80px' }}>
                        {Math.round(week.plannedHours)}h ({Math.round(week.utilization)}%)
                      </span>
                      <div
                        className="rounded overflow-hidden"
                        style={{ width: '50px', height: '6px', background: '#E5E7EB', margin: '0 8px' }}
                      >
                        <div
                          className="h-full"
                          style={{
                            width: `${Math.min(week.utilization, 100)}%`,
                            background: '#10B981'
                          }}
                        />
                      </div>
                      <div className="flex-1 flex items-center flex-wrap" style={{ gap: '6px', fontSize: '12px', color: '#6B7280' }}>
                        {firstProjects.map((p, i) => (
                          <div key={i} className="flex items-center" style={{ gap: '4px' }}>
                            <div
                              className="rounded-full"
                              style={{ width: '8px', height: '8px', background: p.project.color }}
                            />
                            <span>{p.project.name.length > 15 ? p.project.name.substring(0, 15) + '...' : p.project.name} ({Math.round(p.hours)}h)</span>
                            {i < firstProjects.length - 1 && <span>•</span>}
                          </div>
                        ))}
                        {remainingCount > 0 && (
                          <>
                            <span>•</span>
                            <span style={{ color: '#9CA3AF' }}>+{remainingCount} more</span>
                          </>
                        )}
                        {week.projects.length === 0 && (
                          <span style={{ color: '#9CA3AF' }}>No work scheduled</span>
                        )}
                      </div>
                    </div>
                  );
                })}
                {!showAllWeeks && weeklyData.length > 4 && (
                  <button
                    onClick={() => setShowAllWeeks(true)}
                    className="text-left hover:underline mt-2"
                    style={{ fontSize: '13px', color: '#3B82F6', fontWeight: 500 }}
                  >
                    <ChevronDown className="inline h-3.5 w-3.5 mr-1" />
                    Show {weeklyData.length - 4} more weeks
                  </button>
                )}
              </div>
            </div>

            {/* Time Off & Available */}
            <div className="flex gap-5 mb-5">
              {/* Time Off */}
              <div className="flex-1">
                <h3 className="font-semibold flex items-center gap-1 mb-2" style={{ fontSize: '15px', color: '#1F2937' }}>
                  <span>🏖️</span>
                  Time Off
                </h3>
                <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '12px' }}>
                  No time off scheduled
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  style={{ height: '32px', width: '100%', fontSize: '13px' }}
                >
                  Request Time Off
                </Button>
              </div>

              {/* Available */}
              <div className="flex-1">
                <h3 className="font-semibold flex items-center gap-1 mb-2" style={{ fontSize: '15px', color: '#1F2937' }}>
                  <span>💼</span>
                  Available
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
                  <div className="flex items-center" style={{ height: '28px', fontSize: '13px' }}>
                    <span className="font-medium" style={{ color: '#6B7280', width: '80px' }}>This Week:</span>
                    <span className="font-medium" style={{ color: '#1F2937' }}>
                      {totalCapacity - totalPlanned}h ({Math.round(((totalCapacity - totalPlanned) / totalCapacity) * 100)}%)
                    </span>
                  </div>
                  <div className="flex items-center" style={{ height: '28px', fontSize: '13px' }}>
                    <span className="font-medium" style={{ color: '#6B7280', width: '80px' }}>This Month:</span>
                    <span className="font-medium" style={{ color: '#1F2937' }}>
                      {Math.round(thisMonth.totalCapacity - thisMonth.plannedHours)}h ({Math.round(100 - thisMonth.utilization)}%)
                    </span>
                  </div>
                </div>
                <Button
                  variant="default"
                  size="sm"
                  style={{ height: '36px', width: '100%', fontSize: '13px', background: '#3B82F6', color: 'white' }}
                >
                  Assign New Work
                </Button>
              </div>
            </div>

            {/* Project Distribution */}
            <div>
              <div className="flex justify-between items-baseline mb-3">
                <h3 className="font-semibold" style={{ fontSize: '16px', color: '#1F2937' }}>
                  Project Distribution (8 Weeks)
                </h3>
                <span style={{ fontSize: '13px', color: '#6B7280' }}>
                  Total: {Math.round(totalPlannedHours)}h planned
                </span>
              </div>
              {distributionData.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {distributionData.slice(0, 5).map((item, index) => (
                    <div key={index} className="relative rounded overflow-hidden" style={{ height: '24px' }}>
                      <div
                        className="absolute inset-0"
                        style={{
                          width: `${item.percentage}%`,
                          background: item.project.color
                        }}
                      />
                      <div
                        className="absolute inset-0 flex items-center font-medium"
                        style={{ fontSize: '13px', color: 'white', paddingLeft: '12px' }}
                      >
                        {item.project.name} ({Math.round(item.hours)}h, {Math.round(item.percentage)}%)
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '12px', color: '#9CA3AF', padding: '8px 0' }}>
                  No projects assigned
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {/* FOOTER - Fixed 80px */}
      <div
        className="flex-shrink-0 border-t border-gray-200"
        style={{
          height: '80px',
          padding: '20px',
          background: 'white',
          boxShadow: '0 -2px 8px rgba(0,0,0,0.04)'
        }}
      >
        {activeTab === 'this-week' ? (
          <div className="flex justify-end">
            <Button
              variant="default"
              onClick={() => user && onPlanTime(user.id)}
              style={{ height: '40px', width: '160px', fontSize: '14px', background: '#3B82F6', color: 'white' }}
            >
              Edit Allocation
            </Button>
          </div>
        ) : (
          <div className="flex justify-between">
            <Button
              variant="outline"
              style={{ height: '40px', width: '140px', fontSize: '14px' }}
            >
              Export to PDF
            </Button>
            <Button
              variant="default"
              onClick={() => user && onPlanTime(user.id)}
              style={{ height: '40px', width: '160px', fontSize: '14px', background: '#3B82F6', color: 'white' }}
            >
              Edit Allocation
            </Button>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideInFromRight {
          from {
            transform: translateX(100%);
          }
          to {
            transform: translateX(0);
          }
        }
      `}</style>
    </div>
  );
}

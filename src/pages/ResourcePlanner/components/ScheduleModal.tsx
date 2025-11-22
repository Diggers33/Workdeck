import React, { useState } from 'react';
import { X, Download, Share2, Settings, ChevronDown } from 'lucide-react';
import { User, Task, Project } from '../types';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { format, addWeeks, startOfWeek, endOfWeek, eachDayOfInterval, addMonths, startOfMonth, endOfMonth, differenceInDays } from 'date-fns';

interface ScheduleModalProps {
  user: User;
  tasks: Task[];
  projects: Project[];
  onClose: () => void;
}

interface WeekData {
  weekStart: Date;
  weekEnd: Date;
  plannedHours: number;
  capacity: number;
  leaveHours: number;
  utilization: number;
  projects: Array<{ project: Project; hours: number }>;
}

interface LeaveEntry {
  startDate: Date;
  endDate: Date;
  description: string;
  days: number;
}

interface TooltipProps {
  visible: boolean;
  x: number;
  y: number;
  children: React.ReactNode;
}

function Tooltip({ visible, x, y, children }: TooltipProps) {
  if (!visible) return null;
  
  return (
    <div
      style={{
        position: 'fixed',
        left: `${x}px`,
        top: `${y}px`,
        transform: 'translate(-50%, -100%)',
        marginTop: '-8px',
        background: '#1F2937',
        color: 'white',
        padding: '12px',
        borderRadius: '6px',
        fontSize: '12px',
        zIndex: 10000,
        pointerEvents: 'none',
        minWidth: '220px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
      }}
    >
      {children}
    </div>
  );
}

export function ScheduleModal({ user, tasks, projects, onClose }: ScheduleModalProps) {
  const [showAllWeeks, setShowAllWeeks] = useState(false);
  const [tooltip, setTooltip] = useState<{ visible: boolean; x: number; y: number; content: React.ReactNode }>({
    visible: false,
    x: 0,
    y: 0,
    content: null
  });
  
  const userTasks = tasks.filter(t => t.assigneeId === user.id);
  
  // Mock leave data for demo
  const mockLeaves: LeaveEntry[] = [
    {
      startDate: new Date(2024, 10, 28),
      endDate: new Date(2024, 10, 29),
      description: 'Thanksgiving',
      days: 2
    },
    {
      startDate: new Date(2024, 11, 23),
      endDate: new Date(2024, 11, 27),
      description: 'Holiday Break',
      days: 5
    }
  ];
  
  // Calculate leave hours for a period
  const calculateLeaveHours = (startDate: Date, endDate: Date): number => {
    let leaveHours = 0;
    mockLeaves.forEach(leave => {
      if (leave.startDate <= endDate && leave.endDate >= startDate) {
        const overlapStart = leave.startDate < startDate ? startDate : leave.startDate;
        const overlapEnd = leave.endDate > endDate ? endDate : leave.endDate;
        const days = eachDayOfInterval({ start: overlapStart, end: overlapEnd });
        const workingDays = days.filter(day => day.getDay() !== 0 && day.getDay() !== 6).length;
        leaveHours += workingDays * 8;
      }
    });
    return leaveHours;
  };
  
  // Calculate capacity for different periods
  const calculatePeriodCapacity = (startDate: Date, endDate: Date) => {
    const days = eachDayOfInterval({ start: startDate, end: endDate });
    const workingDays = days.filter(day => day.getDay() !== 0 && day.getDay() !== 6).length;
    const totalCapacity = workingDays * 8;
    const leaveHours = calculateLeaveHours(startDate, endDate);
    
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
    
    const availableHours = totalCapacity - plannedHours - leaveHours;
    const utilization = totalCapacity > 0 ? (plannedHours / totalCapacity) * 100 : 0;
    
    return { plannedHours, totalCapacity, leaveHours, availableHours, utilization };
  };
  
  // Calculate weekly data for next 8 weeks
  const getWeeklyData = (): WeekData[] => {
    const weeks: WeekData[] = [];
    const today = new Date();
    
    for (let i = 0; i < 8; i++) {
      const weekStart = startOfWeek(addWeeks(today, i), { weekStartsOn: 1 });
      const weekEnd = endOfWeek(addWeeks(today, i), { weekStartsOn: 1 });
      
      const { plannedHours, totalCapacity, leaveHours, utilization } = calculatePeriodCapacity(weekStart, weekEnd);
      
      // Get projects for this week
      const projectHours = new Map<string, number>();
      userTasks.forEach(task => {
        const taskStart = new Date(task.startDate);
        const taskEnd = new Date(task.endDate);
        taskStart.setHours(0, 0, 0, 0);
        taskEnd.setHours(0, 0, 0, 0);
        
        if (taskStart <= weekEnd && taskEnd >= weekStart) {
          const current = projectHours.get(task.projectId) || 0;
          const taskDays = differenceInDays(taskEnd, taskStart) + 1;
          const overlapStart = taskStart < weekStart ? weekStart : taskStart;
          const overlapEnd = taskEnd > weekEnd ? weekEnd : taskEnd;
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
        .sort((a, b) => b.hours - a.hours); // Sort by hours descending
      
      weeks.push({
        weekStart,
        weekEnd,
        plannedHours,
        capacity: totalCapacity,
        leaveHours,
        utilization,
        projects: weekProjects
      });
    }
    
    return weeks;
  };
  
  const weeklyData = getWeeklyData();
  const displayedWeeks = showAllWeeks ? weeklyData : weeklyData.slice(0, 4);
  
  // Current period calculations
  const today = new Date();
  const thisWeek = calculatePeriodCapacity(
    startOfWeek(today, { weekStartsOn: 1 }),
    endOfWeek(today, { weekStartsOn: 1 })
  );
  const thisMonth = calculatePeriodCapacity(
    startOfMonth(today),
    endOfMonth(today)
  );
  const nextMonth = calculatePeriodCapacity(
    startOfMonth(addMonths(today, 1)),
    endOfMonth(addMonths(today, 1))
  );
  
  // Project distribution (8 weeks) with grouping
  const projectDistribution = new Map<string, number>();
  userTasks.forEach(task => {
    const current = projectDistribution.get(task.projectId) || 0;
    projectDistribution.set(task.projectId, current + task.plannedHours);
  });
  
  const totalPlannedHours = Array.from(projectDistribution.values()).reduce((sum, h) => sum + h, 0);
  
  // Group small projects into "Others"
  const allProjects = Array.from(projectDistribution.entries())
    .map(([projectId, hours]) => ({
      project: projects.find(p => p.id === projectId)!,
      hours,
      percentage: totalPlannedHours > 0 ? (hours / totalPlannedHours) * 100 : 0
    }))
    .filter(d => d.project)
    .sort((a, b) => b.hours - a.hours);
  
  const distributionData: Array<{ 
    project: Project | null; 
    hours: number; 
    percentage: number;
    isOthers?: boolean;
    otherProjects?: Array<{ project: Project; hours: number }>;
  }> = [];
  
  if (allProjects.length <= 6) {
    // Show all projects if 6 or fewer
    distributionData.push(...allProjects);
  } else {
    // Show top 5, group rest into "Others"
    const topProjects = allProjects.slice(0, 5);
    const otherProjects = allProjects.slice(5);
    const othersHours = otherProjects.reduce((sum, p) => sum + p.hours, 0);
    const othersPercentage = totalPlannedHours > 0 ? (othersHours / totalPlannedHours) * 100 : 0;
    
    distributionData.push(...topProjects);
    distributionData.push({
      project: null,
      hours: othersHours,
      percentage: othersPercentage,
      isOthers: true,
      otherProjects
    });
  }
  
  const avgUtilization = thisWeek.totalCapacity > 0 
    ? Math.round(thisWeek.utilization) 
    : 0;
  
  const handleMouseEnter = (e: React.MouseEvent, content: React.ReactNode) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setTooltip({
      visible: true,
      x: rect.left + rect.width / 2,
      y: rect.top,
      content
    });
  };
  
  const handleMouseLeave = () => {
    setTooltip({ visible: false, x: 0, y: 0, content: null });
  };
  
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 9999 }}>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/50"
        style={{ animation: 'fadeIn 200ms ease-out' }}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div
        className="fixed left-1/2 top-1/2 bg-white rounded-xl shadow-2xl flex flex-col"
        style={{
          width: '1200px',
          maxWidth: '95vw',
          height: '600px',
          transform: 'translate(-50%, -50%)',
          animation: 'slideUp 300ms ease-out',
          boxShadow: '0 24px 48px rgba(0,0,0,0.20)'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER - 64px */}
        <div 
          className="flex items-center justify-between border-b border-gray-200 flex-shrink-0"
          style={{ padding: '16px 24px', height: '64px' }}
        >
          <div className="flex items-center gap-3">
            <Avatar style={{ width: '40px', height: '40px' }}>
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <h2 className="font-semibold" style={{ fontSize: '16px', color: '#1F2937', lineHeight: '1.2' }}>
                {user.name}
              </h2>
              <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: '1.2', marginTop: '2px' }}>
                {user.role} • {avgUtilization}% avg
              </p>
            </div>
          </div>
          
          <div className="flex items-center" style={{ gap: '8px' }}>
            <Button variant="ghost" size="sm" style={{ height: '32px', padding: '0 12px', fontSize: '13px' }}>
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Export
            </Button>
            <Button variant="ghost" size="sm" style={{ height: '32px', padding: '0 12px', fontSize: '13px' }}>
              <Share2 className="h-3.5 w-3.5 mr-1.5" />
              Share
            </Button>
            <Button variant="ghost" size="sm" style={{ height: '32px', width: '32px', padding: 0 }}>
              <Settings className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="sm" onClick={onClose} style={{ height: '32px', width: '32px', padding: 0 }}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* CONTENT - Scrollable */}
        <div className="flex-1 overflow-y-auto" style={{ padding: '24px' }}>
          {/* SECTION 1: Capacity Overview - 3 Cards */}
          <div className="flex" style={{ gap: '24px', marginBottom: '16px' }}>
            {/* This Week */}
            <div 
              className="flex-1 rounded-md border border-gray-200"
              style={{ padding: '12px', height: '90px', background: '#FAFBFC' }}
            >
              <div className="font-medium" style={{ fontSize: '12px', color: '#6B7280', marginBottom: '6px' }}>
                This Week
              </div>
              <div className="font-bold" style={{ fontSize: '24px', color: '#1F2937', marginBottom: '2px' }}>
                {Math.round(thisWeek.plannedHours)}h / {thisWeek.totalCapacity}h
              </div>
              <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '6px' }}>
                {Math.round(thisWeek.utilization)}%
              </div>
              <div 
                className="w-full rounded overflow-hidden"
                style={{ height: '8px', background: '#E5E7EB' }}
              >
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${Math.min(thisWeek.utilization, 100)}%`,
                    background: '#10B981'
                  }}
                />
              </div>
            </div>
            
            {/* This Month */}
            <div 
              className="flex-1 rounded-md border border-gray-200"
              style={{ padding: '12px', height: '90px', background: '#FAFBFC' }}
            >
              <div className="font-medium" style={{ fontSize: '12px', color: '#6B7280', marginBottom: '6px' }}>
                This Month
              </div>
              <div className="font-bold" style={{ fontSize: '24px', color: '#1F2937', marginBottom: '2px' }}>
                {Math.round(thisMonth.plannedHours)}h / {thisMonth.totalCapacity}h
              </div>
              <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '6px' }}>
                {Math.round(thisMonth.utilization)}%
              </div>
              <div 
                className="w-full rounded overflow-hidden"
                style={{ height: '8px', background: '#E5E7EB' }}
              >
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${Math.min(thisMonth.utilization, 100)}%`,
                    background: '#10B981'
                  }}
                />
              </div>
            </div>
            
            {/* Next Month */}
            <div 
              className="flex-1 rounded-md border border-gray-200"
              style={{ padding: '12px', height: '90px', background: '#FAFBFC' }}
            >
              <div className="font-medium" style={{ fontSize: '12px', color: '#6B7280', marginBottom: '6px' }}>
                Next Month
              </div>
              <div className="font-bold" style={{ fontSize: '24px', color: '#1F2937', marginBottom: '2px' }}>
                {Math.round(nextMonth.plannedHours)}h / {nextMonth.totalCapacity}h
              </div>
              <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '6px' }}>
                {Math.round(nextMonth.utilization)}%
              </div>
              <div 
                className="w-full rounded overflow-hidden"
                style={{ height: '8px', background: '#E5E7EB' }}
              >
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${Math.min(nextMonth.utilization, 100)}%`,
                    background: '#10B981'
                  }}
                />
              </div>
            </div>
          </div>
          
          {/* Separator */}
          <div className="border-t border-gray-200" style={{ margin: '16px 0' }} />
          
          {/* SECTION 2 & 3: Two Column Layout */}
          <div className="flex" style={{ gap: '24px', marginBottom: '16px' }}>
            {/* LEFT: Capacity Forecast - 55% */}
            <div style={{ width: '55%' }}>
              <h3 className="font-semibold" style={{ fontSize: '14px', color: '#1F2937', marginBottom: '12px' }}>
                Capacity Forecast
              </h3>
              
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {displayedWeeks.map((week, index) => {
                  const hasLeave = week.leaveHours > 0;
                  const leaveEntry = mockLeaves.find(leave => 
                    (leave.startDate >= week.weekStart && leave.startDate <= week.weekEnd) ||
                    (leave.endDate >= week.weekStart && leave.endDate <= week.weekEnd)
                  );
                  
                  // Determine how to show projects
                  const showFirstN = week.projects.length >= 4 ? 2 : week.projects.length;
                  const firstProjects = week.projects.slice(0, showFirstN);
                  const remainingCount = week.projects.length - showFirstN;
                  
                  return (
                    <div 
                      key={index}
                      className="flex items-center hover:bg-gray-50 rounded transition-colors cursor-pointer"
                      style={{ padding: '6px', minHeight: '32px' }}
                    >
                      <span className="font-medium" style={{ fontSize: '13px', color: '#1F2937', minWidth: '140px' }}>
                        Week of {format(week.weekStart, 'MMM d')}-{format(week.weekEnd, 'd')}
                      </span>
                      <span className="font-medium" style={{ fontSize: '13px', color: '#6B7280', minWidth: '80px', marginLeft: '8px' }}>
                        {Math.round(week.plannedHours)}h ({Math.round(week.utilization)}%)
                      </span>
                      <div 
                        className="rounded overflow-hidden"
                        style={{ width: '60px', height: '6px', background: '#E5E7EB', margin: '0 8px' }}
                      >
                        <div
                          className="h-full transition-all"
                          style={{
                            width: `${Math.min(week.utilization, 100)}%`,
                            background: '#10B981'
                          }}
                        />
                      </div>
                      {week.projects.length > 0 ? (
                        <div className="flex items-center flex-wrap" style={{ gap: '8px', fontSize: '12px', color: '#6B7280' }}>
                          {firstProjects.map((p, i) => (
                            <div key={i} className="flex items-center" style={{ gap: '4px' }}>
                              <div 
                                className="rounded-full"
                                style={{ width: '8px', height: '8px', background: p.project.color }}
                              />
                              <span>{p.project.name} ({Math.round(p.hours)}h)</span>
                              {i < firstProjects.length - 1 && <span>•</span>}
                            </div>
                          ))}
                          {remainingCount > 0 && (
                            <>
                              <span>•</span>
                              <span 
                                style={{ color: '#9CA3AF', cursor: 'help' }}
                                onMouseEnter={(e) => handleMouseEnter(e, (
                                  <div>
                                    <div style={{ marginBottom: '8px', fontWeight: 500 }}>
                                      All {week.projects.length} projects this week:
                                    </div>
                                    {week.projects.map((p, i) => (
                                      <div key={i} className="flex items-center" style={{ gap: '6px', height: '20px' }}>
                                        <div 
                                          className="rounded-full"
                                          style={{ width: '8px', height: '8px', background: p.project.color }}
                                        />
                                        <span>{p.project.name} ({Math.round(p.hours)}h)</span>
                                      </div>
                                    ))}
                                  </div>
                                ))}
                                onMouseLeave={handleMouseLeave}
                              >
                                +{remainingCount} more
                              </span>
                            </>
                          )}
                        </div>
                      ) : hasLeave && leaveEntry ? (
                        <div className="flex items-center" style={{ gap: '6px', fontSize: '12px', color: '#6B7280' }}>
                          <span>🏖️</span>
                          <span>{leaveEntry.description} ({leaveEntry.days} days)</span>
                        </div>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#9CA3AF' }}>No work scheduled</span>
                      )}
                    </div>
                  );
                })}
                
                {!showAllWeeks && weeklyData.length > 4 && (
                  <button
                    onClick={() => setShowAllWeeks(true)}
                    className="text-left hover:underline transition-all"
                    style={{ padding: '6px', fontSize: '13px', color: '#3B82F6', marginTop: '4px' }}
                  >
                    <ChevronDown className="inline h-3.5 w-3.5 mr-1" />
                    Show {weeklyData.length - 4} more weeks
                  </button>
                )}
              </div>
            </div>
            
            {/* RIGHT: Time Off & Availability - 45% */}
            <div style={{ width: '45%' }}>
              {/* Time Off Section */}
              <div style={{ marginBottom: '16px' }}>
                <h3 className="font-semibold flex items-center" style={{ fontSize: '14px', color: '#1F2937', marginBottom: '8px', gap: '4px' }}>
                  <span>🏖️</span>
                  Time Off
                </h3>
                
                {mockLeaves.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
                    {mockLeaves.map((leave, index) => (
                      <div key={index} style={{ fontSize: '12px', color: '#6B7280', lineHeight: '1.4', height: '24px', display: 'flex', alignItems: 'center' }}>
                        {format(leave.startDate, 'MMM d')}-{format(leave.endDate, 'd')} • {leave.description} • {leave.days} days
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '12px', lineHeight: '1.4' }}>
                    No time off scheduled
                  </div>
                )}
                
                <Button 
                  variant="outline" 
                  size="sm"
                  style={{ height: '32px', padding: '0 12px', fontSize: '13px', width: '100%' }}
                >
                  Request Time Off
                </Button>
              </div>
              
              {/* Divider */}
              <div className="border-t border-gray-200" style={{ margin: '16px 0' }} />
              
              {/* Available Capacity */}
              <div>
                <h3 className="font-semibold flex items-center" style={{ fontSize: '14px', color: '#1F2937', marginBottom: '8px', gap: '4px' }}>
                  <span>💼</span>
                  Available
                </h3>
                
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {/* This Week */}
                  <div className="flex items-center" style={{ height: '28px' }}>
                    <span className="font-medium" style={{ fontSize: '13px', color: '#6B7280', minWidth: '80px' }}>
                      This Week:
                    </span>
                    <span className="font-medium" style={{ fontSize: '13px', color: '#1F2937', minWidth: '90px', marginLeft: '4px' }}>
                      {Math.round(thisWeek.availableHours)}h ({Math.round((thisWeek.availableHours / thisWeek.totalCapacity) * 100)}%)
                    </span>
                    <div 
                      className="rounded overflow-hidden"
                      style={{ width: '100px', height: '5px', background: '#E5E7EB', marginLeft: '8px' }}
                    >
                      <div
                        className="h-full"
                        style={{
                          width: `${Math.max(0, (thisWeek.availableHours / thisWeek.totalCapacity) * 100)}%`,
                          background: '#10B981'
                        }}
                      />
                    </div>
                  </div>
                  
                  {/* Next Week */}
                  <div className="flex items-center" style={{ height: '28px' }}>
                    <span className="font-medium" style={{ fontSize: '13px', color: '#6B7280', minWidth: '80px' }}>
                      Next Week:
                    </span>
                    {weeklyData[1] && (
                      <>
                        <span className="font-medium" style={{ fontSize: '13px', color: '#1F2937', minWidth: '90px', marginLeft: '4px' }}>
                          {Math.round(weeklyData[1].capacity - weeklyData[1].plannedHours - weeklyData[1].leaveHours)}h ({Math.round(((weeklyData[1].capacity - weeklyData[1].plannedHours - weeklyData[1].leaveHours) / weeklyData[1].capacity) * 100)}%)
                        </span>
                        <div 
                          className="rounded overflow-hidden"
                          style={{ width: '100px', height: '5px', background: '#E5E7EB', marginLeft: '8px' }}
                        >
                          <div
                            className="h-full"
                            style={{
                              width: `${Math.max(0, ((weeklyData[1].capacity - weeklyData[1].plannedHours - weeklyData[1].leaveHours) / weeklyData[1].capacity) * 100)}%`,
                              background: '#10B981'
                            }}
                          />
                        </div>
                        {weeklyData[1].leaveHours > 0 && <span style={{ marginLeft: '6px' }}>🏖️</span>}
                      </>
                    )}
                  </div>
                  
                  {/* This Month */}
                  <div className="flex items-center" style={{ height: '28px' }}>
                    <span className="font-medium" style={{ fontSize: '13px', color: '#6B7280', minWidth: '80px' }}>
                      This Month:
                    </span>
                    <span className="font-medium" style={{ fontSize: '13px', color: '#1F2937', minWidth: '90px', marginLeft: '4px' }}>
                      {Math.round(thisMonth.availableHours)}h ({Math.round((thisMonth.availableHours / thisMonth.totalCapacity) * 100)}%)
                    </span>
                    <div 
                      className="rounded overflow-hidden"
                      style={{ width: '100px', height: '5px', background: '#E5E7EB', marginLeft: '8px' }}
                    >
                      <div
                        className="h-full"
                        style={{
                          width: `${Math.max(0, (thisMonth.availableHours / thisMonth.totalCapacity) * 100)}%`,
                          background: '#10B981'
                        }}
                      />
                    </div>
                  </div>
                </div>
                
                <Button 
                  variant="default"
                  size="sm"
                  style={{ 
                    height: '36px', 
                    padding: '0 12px', 
                    fontSize: '13px', 
                    width: '100%', 
                    marginTop: '12px', 
                    background: '#3B82F6',
                    color: 'white'
                  }}
                >
                  Assign New Work
                </Button>
              </div>
            </div>
          </div>
          
          {/* Separator */}
          <div className="border-t border-gray-200" style={{ margin: '16px 0' }} />
          
          {/* SECTION 4: Project Distribution */}
          <div>
            <div className="flex items-baseline justify-between" style={{ marginBottom: '8px' }}>
              <h3 className="font-semibold" style={{ fontSize: '14px', color: '#1F2937' }}>
                Project Distribution (8 Weeks)
              </h3>
              <span style={{ fontSize: '12px', color: '#6B7280' }}>
                Total: {Math.round(totalPlannedHours)}h planned
              </span>
            </div>
            
            {distributionData.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                {distributionData.map((item, index) => (
                  <div 
                    key={index} 
                    className="relative rounded overflow-hidden" 
                    style={{ height: '22px' }}
                    onMouseEnter={item.isOthers ? (e) => handleMouseEnter(e, (
                      <div>
                        <div style={{ marginBottom: '8px', fontWeight: 500 }}>
                          {item.otherProjects!.length} smaller projects:
                        </div>
                        {item.otherProjects!.map((p, i) => (
                          <div key={i} style={{ height: '20px', display: 'flex', alignItems: 'center' }}>
                            • {p.project.name} ({Math.round(p.hours)}h)
                          </div>
                        ))}
                      </div>
                    )) : undefined}
                    onMouseLeave={item.isOthers ? handleMouseLeave : undefined}
                  >
                    <div
                      className="absolute inset-0 transition-all"
                      style={{ 
                        width: `${item.percentage}%`,
                        background: item.isOthers ? '#9CA3AF' : item.project!.color
                      }}
                    />
                    <div 
                      className="absolute inset-0 flex items-center font-medium"
                      style={{ fontSize: '12px', color: 'white', paddingLeft: '12px' }}
                    >
                      {item.isOthers ? 'Others' : item.project!.name} ({Math.round(item.hours)}h, {Math.round(item.percentage)}%)
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
        </div>
        
        {/* FOOTER - 60px */}
        <div 
          className="border-t border-gray-200 flex items-center justify-end flex-shrink-0"
          style={{ padding: '12px 24px', height: '60px', gap: '8px' }}
        >
          <Button 
            variant="outline" 
            size="sm"
            style={{ height: '36px', padding: '0 16px', fontSize: '13px' }}
          >
            Export to PDF
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            style={{ height: '36px', padding: '0 16px', fontSize: '13px' }}
          >
            Share Schedule
          </Button>
          <Button 
            variant="default"
            size="sm"
            style={{ 
              height: '36px', 
              padding: '0 16px', 
              fontSize: '13px', 
              background: '#3B82F6',
              color: 'white'
            }}
          >
            Edit Allocation
          </Button>
        </div>
      </div>
      
      {/* Global Tooltip */}
      <Tooltip visible={tooltip.visible} x={tooltip.x} y={tooltip.y}>
        {tooltip.content}
      </Tooltip>
      
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { 
            transform: translate(-50%, -50%) scale(0.95); 
            opacity: 0; 
          }
          to { 
            transform: translate(-50%, -50%) scale(1.0); 
            opacity: 1; 
          }
        }
      `}</style>
    </div>
  );
}

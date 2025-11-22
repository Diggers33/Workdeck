import React, { useState } from 'react';
import { X, Calendar, Mail, Download, Settings, BarChart3, Check } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { format, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { User, Task, Project } from '../types';

interface SubTask {
  id: string;
  name: string;
  hours: number;
  status: 'completed' | 'in-progress' | 'todo';
  loggedHours?: number;
  dueDate?: string;
}

interface ActivityData {
  id: string;
  projectId: string;
  projectName: string;
  projectColor: string;
  activityName: string;
  totalHours: number;
  loggedHours: number;
  progress: number;
  startDate: string;
  endDate: string;
  isBillable: boolean;
  status: 'in-progress' | 'todo' | 'completed';
  subTasks: SubTask[];
}

interface SimplifiedDetailPanelProps {
  user: User | null;
  tasks: Task[];
  projects: Project[];
  onClose: () => void;
  onEditAllocation?: (user: User) => void;
}

type TabType = 'this-week' | 'schedule';

// Realistic data for Sarah Mitchell
const sarahMitchellData: ActivityData[] = [
  {
    id: 'a1',
    projectId: 'p1',
    projectName: 'E-Commerce Platform',
    projectColor: '#3B82F6',
    activityName: 'Backend API Development',
    totalHours: 8,
    loggedHours: 5.2,
    progress: 65,
    startDate: 'Wed Nov 19',
    endDate: 'Fri Nov 21',
    isBillable: true,
    status: 'in-progress',
    subTasks: [
      {
        id: 'st1',
        name: 'API Integration',
        hours: 3,
        status: 'completed',
        loggedHours: 3
      },
      {
        id: 'st2',
        name: 'Authentication Module',
        hours: 3,
        status: 'in-progress',
        loggedHours: 2
      },
      {
        id: 'st3',
        name: 'Testing & Documentation',
        hours: 2,
        status: 'todo',
        dueDate: 'Nov 21'
      }
    ]
  },
  {
    id: 'a2',
    projectId: 'p1',
    projectName: 'E-Commerce Platform',
    projectColor: '#3B82F6',
    activityName: 'Database Migration',
    totalHours: 4,
    loggedHours: 1,
    progress: 25,
    startDate: 'Thu Nov 20',
    endDate: 'Fri Nov 21',
    isBillable: true,
    status: 'in-progress',
    subTasks: [
      {
        id: 'st4',
        name: 'Schema Updates',
        hours: 2,
        status: 'in-progress',
        loggedHours: 1
      },
      {
        id: 'st5',
        name: 'Data Migration Scripts',
        hours: 2,
        status: 'todo',
        dueDate: 'Nov 21'
      }
    ]
  },
  {
    id: 'a3',
    projectId: 'p2',
    projectName: 'Mobile App Redesign',
    projectColor: '#8B5CF6',
    activityName: 'Frontend Development',
    totalHours: 6,
    loggedHours: 5,
    progress: 83,
    startDate: 'Mon Nov 17',
    endDate: 'Wed Nov 19',
    isBillable: true,
    status: 'in-progress',
    subTasks: [
      {
        id: 'st6',
        name: 'UI Components',
        hours: 4,
        status: 'completed',
        loggedHours: 4
      },
      {
        id: 'st7',
        name: 'State Management',
        hours: 2,
        status: 'in-progress',
        loggedHours: 1
      }
    ]
  },
  {
    id: 'a4',
    projectId: 'p4',
    projectName: 'Internal Tools',
    projectColor: '#F97316',
    activityName: 'Code Review',
    totalHours: 2,
    loggedHours: 0,
    progress: 0,
    startDate: 'Fri Nov 21',
    endDate: 'Fri Nov 21',
    isBillable: false,
    status: 'todo',
    subTasks: [
      {
        id: 'st8',
        name: 'Review Pull Requests',
        hours: 2,
        status: 'todo',
        dueDate: 'Nov 21'
      }
    ]
  }
];

export function SimplifiedDetailPanel({
  user,
  tasks,
  projects,
  onClose,
  onEditAllocation
}: SimplifiedDetailPanelProps) {
  const [activeTab, setActiveTab] = useState<TabType>('this-week');
  
  if (!user) return null;

  // Use realistic data for Sarah Mitchell, otherwise use actual task data
  const isSarahMitchell = user.id === 'u1' || user.name === 'Sarah Mitchell';
  
  let activities: ActivityData[] = [];
  let totalPlanned = 0;
  let totalLogged = 0;
  let projectBreakdown: Record<string, { hours: number; color: string; percentage: number }> = {};
  
  if (isSarahMitchell) {
    // Use realistic hardcoded data for Sarah
    activities = sarahMitchellData;
    totalPlanned = 20;
    totalLogged = 12;
    
    projectBreakdown = {
      'E-Commerce Platform': { hours: 12, color: '#3B82F6', percentage: 60 },
      'Mobile App Redesign': { hours: 6, color: '#8B5CF6', percentage: 30 },
      'Internal Tools': { hours: 2, color: '#F97316', percentage: 10 }
    };
  } else {
    // Use actual task data for other users
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(today, { weekStartsOn: 1 });

    const thisWeekTasks = tasks.filter(
      (task) =>
        task.userId === user.id &&
        isWithinInterval(task.startDate, { start: weekStart, end: weekEnd })
    );

    totalPlanned = thisWeekTasks.reduce((sum, task) => sum + task.hours, 0);
    totalLogged = thisWeekTasks.reduce((sum, task) => sum + (task.loggedHours || 0), 0);
    
    // Convert tasks to activities format
    activities = thisWeekTasks.map((task) => {
      const project = projects.find((p) => p.id === task.projectId);
      return {
        id: task.id,
        projectId: task.projectId,
        projectName: project?.name || 'Unknown Project',
        projectColor: project?.color || '#6B7280',
        activityName: task.name,
        totalHours: task.hours,
        loggedHours: task.loggedHours || 0,
        progress: task.loggedHours ? Math.round((task.loggedHours / task.hours) * 100) : 0,
        startDate: format(task.startDate, 'EEE MMM d'),
        endDate: format(task.endDate, 'EEE MMM d'),
        isBillable: task.isBillable || false,
        status: (task.loggedHours || 0) >= task.hours ? 'completed' : 
                (task.loggedHours || 0) > 0 ? 'in-progress' : 'todo',
        subTasks: task.subtasks || []
      };
    });

    // Calculate project breakdown
    const projectHours: Record<string, { hours: number; color: string }> = {};
    thisWeekTasks.forEach(task => {
      const project = projects.find(p => p.id === task.projectId);
      const projectName = project?.name || 'Unknown Project';
      if (!projectHours[projectName]) {
        projectHours[projectName] = { hours: 0, color: project?.color || '#6B7280' };
      }
      projectHours[projectName].hours += task.hours;
    });
    
    Object.entries(projectHours).forEach(([name, data]) => {
      projectBreakdown[name] = {
        ...data,
        percentage: totalPlanned > 0 ? Math.round((data.hours / totalPlanned) * 100) : 0
      };
    });
  }

  const totalCapacity = user.totalCapacity || 40;
  const utilizationPercent = totalCapacity > 0 ? Math.round((totalPlanned / totalCapacity) * 100) : 0;

  return (
    <div
      className="fixed top-0 right-0 bg-white flex flex-col"
      style={{
        width: '480px',
        height: '100vh',
        boxShadow: '-4px 0 24px rgba(0,0,0,0.12)',
        zIndex: 50
      }}
    >
      {/* HEADER */}
      <div className="flex-shrink-0 border-b border-gray-200" style={{ padding: '20px 20px 0 20px' }}>
        {/* User Info Row */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <Avatar style={{ width: '48px', height: '48px' }}>
              <AvatarImage src={user.avatar} />
              <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
            </Avatar>
            <div>
              <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#1F2937', lineHeight: '1.5' }}>
                {user.name}
              </h2>
              <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.5' }}>
                {user.role} • {Math.round(utilizationPercent)}% utilized
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            style={{ width: '32px', height: '32px', padding: 0, color: '#6B7280' }}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 mb-4">
          <Button 
            variant="ghost" 
            size="sm" 
            style={{ 
              height: '32px', 
              padding: '0 12px', 
              fontSize: '14px',
              fontWeight: 500,
              color: '#374151'
            }}
          >
            <Mail className="h-4 w-4 mr-1.5" />
            Message
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            style={{ 
              height: '32px', 
              padding: '0 12px', 
              fontSize: '14px',
              fontWeight: 500,
              color: '#374151'
            }}
          >
            <Calendar className="h-4 w-4 mr-1.5" />
            Calendar
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            style={{ 
              height: '32px', 
              padding: '0 12px', 
              fontSize: '14px',
              fontWeight: 500,
              color: '#374151'
            }}
          >
            <Download className="h-4 w-4 mr-1.5" />
            Export
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            style={{ 
              width: '32px',
              height: '32px', 
              padding: 0,
              color: '#374151'
            }}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>

        {/* TABS */}
        <div className="flex gap-0">
          <button
            onClick={() => setActiveTab('this-week')}
            className="relative flex items-center gap-2"
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 500,
              color: activeTab === 'this-week' ? '#3B82F6' : '#6B7280',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              borderBottom: activeTab === 'this-week' ? '2px solid #3B82F6' : '2px solid transparent',
              height: '40px'
            }}
          >
            <Calendar className="h-4 w-4" />
            This Week
          </button>
          <button
            onClick={() => setActiveTab('schedule')}
            className="relative flex items-center gap-2"
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 500,
              color: activeTab === 'schedule' ? '#3B82F6' : '#6B7280',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              borderBottom: activeTab === 'schedule' ? '2px solid #3B82F6' : '2px solid transparent',
              height: '40px'
            }}
          >
            <BarChart3 className="h-4 w-4" />
            Schedule
          </button>
        </div>
      </div>

      {/* CONTENT AREA - Scrollable */}
      <div className="flex-1 overflow-y-auto" style={{ padding: '20px' }}>
        {activeTab === 'this-week' && (
          <>
            {/* This Week Summary - Plain Layout (NO CARD) */}
            <div style={{ marginBottom: '20px' }}>
              <div className="flex justify-between items-center" style={{ lineHeight: '32px' }}>
                <span style={{ fontSize: '14px', color: '#6B7280' }}>Planned</span>
                <span style={{ fontSize: '14px', fontWeight: 500, color: '#1F2937' }}>
                  {Math.round(totalPlanned)}h
                </span>
              </div>
              <div className="flex justify-between items-center" style={{ lineHeight: '32px' }}>
                <span style={{ fontSize: '14px', color: '#6B7280' }}>Logged</span>
                <span style={{ fontSize: '14px', fontWeight: 500, color: '#1F2937' }}>
                  {Math.round(totalLogged)}h
                </span>
              </div>
              <div className="flex justify-between items-center" style={{ lineHeight: '32px' }}>
                <span style={{ fontSize: '14px', color: '#6B7280' }}>Capacity</span>
                <span style={{ fontSize: '14px', fontWeight: 500, color: '#1F2937' }}>
                  {Math.round(totalPlanned)}h / {totalCapacity}h ({Math.round(utilizationPercent)}%)
                </span>
              </div>
              <div
                className="w-full rounded overflow-hidden"
                style={{ height: '8px', background: '#E5E7EB', marginTop: '8px' }}
              >
                <div
                  className="h-full transition-all"
                  style={{
                    width: `${Math.min(utilizationPercent, 100)}%`,
                    background: utilizationPercent > 80 ? '#EF4444' : utilizationPercent > 60 ? '#F59E0B' : '#10B981'
                  }}
                />
              </div>
            </div>

            {/* Capacity by Project */}
            <div className="mb-6">
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1F2937', marginBottom: '16px' }}>
                Capacity by Project
              </h3>
              <div className="space-y-4">
                {Object.entries(projectBreakdown).map(([projectName, data]) => {
                  const percentage = data.percentage;

                  return (
                    <div key={projectName}>
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center gap-2">
                          <div
                            className="rounded-full"
                            style={{ width: '8px', height: '8px', background: data.color }}
                          />
                          <span style={{ fontSize: '14px', fontWeight: 500, color: '#1F2937' }}>
                            {projectName}
                          </span>
                        </div>
                        <span style={{ fontSize: '14px', fontWeight: 600, color: '#1F2937' }}>
                          {Math.round(data.hours)}h
                        </span>
                      </div>
                      <div className="relative mb-1">
                        <div className="rounded-full overflow-hidden" style={{ height: '6px', background: '#E5E7EB' }}>
                          <div
                            className="h-full transition-all"
                            style={{ width: `${percentage}%`, background: data.color }}
                          />
                        </div>
                      </div>
                      <div className="text-right">
                        <span style={{ fontSize: '12px', color: '#9CA3AF' }}>
                          {Math.round(percentage)}%
                        </span>
                      </div>
                    </div>
                  );
                })}

                {Object.keys(projectBreakdown).length === 0 && (
                  <div style={{ fontSize: '14px', color: '#9CA3AF', textAlign: 'center', padding: '20px' }}>
                    No projects assigned this week
                  </div>
                )}
              </div>
            </div>

            {/* Activities */}
            <div>
              <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#1F2937', marginBottom: '16px' }}>
                Activities
              </h3>
              <div className="space-y-4">
                {activities.map((activity) => {
                  return (
                    <div
                      key={activity.id}
                      className="rounded-lg border border-gray-200"
                      style={{ padding: '16px', background: 'white' }}
                    >
                      {/* Project & Activity Name */}
                      <div className="mb-3">
                        <div className="flex items-center gap-2 mb-1">
                          <div
                            className="rounded-full"
                            style={{ width: '8px', height: '8px', background: activity.projectColor }}
                          />
                          <span style={{ fontSize: '14px', fontWeight: 600, color: '#1F2937' }}>
                            {activity.projectName}
                          </span>
                        </div>
                        <div style={{ fontSize: '14px', color: '#6B7280' }}>
                          {activity.activityName} ({activity.totalHours}h)
                        </div>
                      </div>

                      {/* Date Range */}
                      <div className="flex items-center gap-2 mb-3" style={{ fontSize: '13px', color: '#6B7280' }}>
                        <Calendar className="h-4 w-4" />
                        <span>
                          {activity.startDate} - {activity.endDate}
                        </span>
                      </div>

                      {/* Progress */}
                      <div className="mb-3">
                        <div className="flex justify-between items-center mb-2">
                          <span style={{ fontSize: '13px', color: '#6B7280' }}>Progress</span>
                          <span style={{ fontSize: '13px', fontWeight: 600, color: '#1F2937' }}>
                            {Math.round(activity.progress)}%
                          </span>
                        </div>
                        <div className="rounded-full overflow-hidden" style={{ height: '6px', background: '#E5E7EB' }}>
                          <div
                            className="h-full transition-all"
                            style={{ width: `${activity.progress}%`, background: activity.projectColor }}
                          />
                        </div>
                      </div>

                      {/* Status Badges */}
                      <div className="flex gap-2 mb-3">
                        <span
                          className="inline-flex items-center rounded"
                          style={{
                            height: '24px',
                            padding: '0 10px',
                            fontSize: '12px',
                            fontWeight: 500,
                            background: activity.isBillable ? '#D1FAE5' : '#F3F4F6',
                            color: activity.isBillable ? '#059669' : '#6B7280'
                          }}
                        >
                          {activity.isBillable ? 'Billable' : 'Non-billable'}
                        </span>
                        <span
                          className="inline-flex items-center rounded"
                          style={{
                            height: '24px',
                            padding: '0 10px',
                            fontSize: '12px',
                            fontWeight: 500,
                            background: 
                              activity.status === 'in-progress' ? '#DBEAFE' : 
                              activity.status === 'completed' ? '#D1FAE5' : '#F3F4F6',
                            color: 
                              activity.status === 'in-progress' ? '#2563EB' : 
                              activity.status === 'completed' ? '#059669' : '#6B7280'
                          }}
                        >
                          {activity.status === 'in-progress' ? 'In Progress' : 
                           activity.status === 'completed' ? 'Completed' : 'To Do'}
                        </span>
                      </div>

                      {/* Subtasks */}
                      {activity.subTasks && activity.subTasks.length > 0 && (
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: 500, color: '#6B7280', marginBottom: '8px' }}>
                            Tasks:
                          </div>
                          <div className="space-y-2">
                            {activity.subTasks.map((subTask) => (
                              <div key={subTask.id} className="flex items-start gap-2">
                                <span style={{ fontSize: '16px', marginTop: '2px' }}>
                                  {subTask.status === 'completed' ? '✓' : 
                                   subTask.status === 'in-progress' ? '🏆' : '○'}
                                </span>
                                <div className="flex-1">
                                  <div style={{ fontSize: '13px', fontWeight: 500, color: '#1F2937' }}>
                                    {subTask.name} ({subTask.hours}h) - {
                                      subTask.status === 'completed' ? 'Completed' : 
                                      subTask.status === 'in-progress' ? 'In Progress' : 'To Do'
                                    }
                                  </div>
                                  {subTask.status === 'completed' && subTask.loggedHours && (
                                    <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>
                                      Logged: {subTask.loggedHours}h • 100% complete
                                    </div>
                                  )}
                                  {subTask.status === 'in-progress' && subTask.loggedHours && (
                                    <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>
                                      Logged: {subTask.loggedHours}h of {subTask.hours}h • {Math.round(((subTask.loggedHours || 0) / subTask.hours) * 100)}% complete
                                    </div>
                                  )}
                                  {subTask.status === 'todo' && subTask.dueDate && (
                                    <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>
                                      Due: {subTask.dueDate}
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {activities.length === 0 && (
                  <div
                    className="rounded-lg border border-gray-200"
                    style={{ padding: '32px', background: '#F9FAFB', textAlign: 'center' }}
                  >
                    <div style={{ fontSize: '14px', color: '#9CA3AF', marginBottom: '12px' }}>
                      No activities scheduled for this week
                    </div>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => onEditAllocation?.(user)}
                      style={{ background: '#3B82F6', color: 'white' }}
                    >
                      Add Work
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </>
        )}

        {activeTab === 'schedule' && (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#6B7280' }}>
            <BarChart3 className="h-12 w-12 mx-auto mb-4" style={{ color: '#D1D5DB' }} />
            <div style={{ fontSize: '16px', fontWeight: 500, marginBottom: '8px', color: '#374151' }}>
              Schedule View
            </div>
            <div style={{ fontSize: '14px', color: '#9CA3AF' }}>
              View upcoming schedule and capacity planning
            </div>
          </div>
        )}
      </div>

      {/* FOOTER */}
      <div
        className="flex-shrink-0 border-t border-gray-200"
        style={{ padding: '16px 24px', background: 'white' }}
      >
        <Button
          onClick={() => onEditAllocation?.(user)}
          style={{
            width: '100%',
            height: '44px',
            fontSize: '14px',
            fontWeight: 600,
            background: '#3B82F6',
            color: 'white'
          }}
        >
          Edit Allocation
        </Button>
      </div>
    </div>
  );
}
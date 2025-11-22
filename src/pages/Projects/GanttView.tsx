import React, { useState, useRef } from 'react';
import { GanttTopBar } from './gantt/GanttTopBar';
import { GanttFilterBar } from './gantt/GanttFilterBar';
import { GanttToolbar } from './gantt/GanttToolbar';
import { GanttTaskList } from './gantt/GanttTaskList';
import { GanttTimeline } from './gantt/GanttTimeline';
import { GanttTimelineHeader } from './gantt/GanttTimelineHeader';
import { GanttLegend } from './gantt/GanttLegend';
import { TaskDetailModal } from './gantt/TaskDetailModal';
import { ProjectInfoPanel } from './gantt/ProjectInfoPanel';
import { WEEKS, INITIAL_TASKS } from './gantt/data';
import { GanttActivity } from './gantt/types';
import { Plus } from 'lucide-react';

export function GanttView({ onBack }: { onBack: () => void }) {
  const [expandedActivities, setExpandedActivities] = useState<Set<string>>(new Set(['WP1']));
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set(['myTasks']));
  const [timeResolution, setTimeResolution] = useState('Week');
  const [showLegend, setShowLegend] = useState(false);
  const [hoveredTask, setHoveredTask] = useState<string | null>(null);
  const [weekOffset, setWeekOffset] = useState(0); // Track timeline position
  const [selectedTask, setSelectedTask] = useState<any>(null); // For modal
  const [projectPanelOpen, setProjectPanelOpen] = useState(false);
  const [projectPanelTab, setProjectPanelTab] = useState<'comments' | 'activity' | 'notes' | 'files'>('comments');
  const [zoomLevel, setZoomLevel] = useState(100); // Zoom percentage: 50, 75, 100, 125, 150
  const [tasks, setTasks] = useState<GanttActivity[]>(
    INITIAL_TASKS.map(task => ({
      ...task,
      expanded: expandedActivities.has(task.id)
    }))
  );

  const timelineScrollRef = useRef<HTMLDivElement>(null);
  const taskListScrollRef = useRef<HTMLDivElement>(null);
  const timelineHeaderScrollRef = useRef<HTMLDivElement>(null);

  // Update task (for drag/resize/edit)
  const handleUpdateTask = (taskId: string, updates: any) => {
    setTasks(prevTasks =>
      prevTasks.map(activity => {
        if (activity.id === taskId) {
          return { ...activity, ...updates };
        }
        if (activity.children) {
          return {
            ...activity,
            children: activity.children.map(child =>
              child.id === taskId ? { ...child, ...updates } : child
            )
          };
        }
        return activity;
      })
    );
  };

  // Update milestone position
  const handleUpdateMilestone = (activityId: string, milestoneId: string, newWeek: number) => {
    setTasks(prevTasks =>
      prevTasks.map(activity => {
        // Check if milestone is on the activity itself
        if (activity.id === activityId && activity.milestones) {
          return {
            ...activity,
            milestones: activity.milestones.map(milestone =>
              milestone.id === milestoneId 
                ? { ...milestone, week: newWeek }
                : milestone
            )
          };
        }
        
        // Check if milestone is on a child task
        if (activity.children) {
          const updatedChildren = activity.children.map(child => {
            if (child.id === activityId && child.milestones) {
              return {
                ...child,
                milestones: child.milestones.map(milestone =>
                  milestone.id === milestoneId
                    ? { ...milestone, week: newWeek }
                    : milestone
                )
              };
            }
            return child;
          });
          
          if (updatedChildren !== activity.children) {
            return { ...activity, children: updatedChildren };
          }
        }
        
        return activity;
      })
    );
  };

  // Update flag position
  const handleUpdateFlag = (taskId: string, newWeek: number) => {
    setTasks(prevTasks =>
      prevTasks.map(activity => {
        if (activity.children) {
          return {
            ...activity,
            children: activity.children.map(child =>
              child.id === taskId ? { ...child, flagWeek: newWeek } : child
            )
          };
        }
        return activity;
      })
    );
  };

  // Handle task click to open modal
  const handleTaskClick = (task: any) => {
    setSelectedTask(task);
  };

  // Generate time periods based on offset and resolution
  const generateTimePeriods = (offset: number, resolution: string) => {
    const baseDate = new Date('2024-01-15'); // Start date
    const today = new Date('2024-01-22'); // Current "today" for the demo
    
    if (resolution === 'Day') {
      // Day view: Show individual days grouped by week
      const periodCount = 42; // Show 6 weeks worth of days
      const days = [];
      
      for (let i = 0; i < periodCount; i++) {
        const dayDate = new Date(baseDate);
        dayDate.setDate(baseDate.getDate() + offset + i);
        
        const weekday = dayDate.toLocaleDateString('en-US', { weekday: 'short' }).substring(0, 2);
        const day = dayDate.getDate();
        const month = dayDate.toLocaleDateString('en-US', { month: 'short' });
        const year = dayDate.getFullYear();
        
        // Calculate week number
        const firstDayOfYear = new Date(year, 0, 1);
        const pastDaysOfYear = (dayDate.getTime() - firstDayOfYear.getTime()) / 86400000;
        const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
        
        const isToday = dayDate.toDateString() === today.toDateString();
        
        days.push({
          label: `${weekday} ${day}`,
          isToday,
          date: dayDate,
          weekNumber,
          month,
          year,
          isMonday: dayDate.getDay() === 1
        });
      }
      
      return days;
    } else if (resolution === 'Week') {
      // Week view: Show weeks grouped by month
      const periodCount = 24; // Show 24 weeks
      const weeks = [];
      
      for (let i = 0; i < periodCount; i++) {
        const weekDate = new Date(baseDate);
        weekDate.setDate(baseDate.getDate() + (offset * 7) + (i * 7));
        
        const month = weekDate.toLocaleDateString('en-US', { month: 'long' });
        const year = weekDate.getFullYear();
        
        // Calculate week number
        const firstDayOfYear = new Date(year, 0, 1);
        const pastDaysOfYear = (weekDate.getTime() - firstDayOfYear.getTime()) / 86400000;
        const weekNumber = Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
        
        const weekStart = new Date(weekDate);
        const weekEnd = new Date(weekDate);
        weekEnd.setDate(weekEnd.getDate() + 6);
        const isToday = today >= weekStart && today <= weekEnd;
        
        weeks.push({
          label: `W ${weekNumber}`,
          isToday,
          date: weekDate,
          weekNumber,
          month,
          year,
          isFirstOfMonth: weekDate.getDate() <= 7
        });
      }
      
      return weeks;
    } else { // Month
      // Month view: Show months grouped by year
      const periodCount = 12; // Show 12 months
      const months = [];
      
      for (let i = 0; i < periodCount; i++) {
        const monthDate = new Date(baseDate);
        const monthOffset = Math.floor(offset / 30);
        monthDate.setMonth(baseDate.getMonth() + monthOffset + i);
        monthDate.setDate(1);
        
        const month = monthDate.toLocaleDateString('en-US', { month: 'short' });
        const year = monthDate.getFullYear();
        
        const monthStart = new Date(monthDate);
        const monthEnd = new Date(monthDate);
        monthEnd.setMonth(monthEnd.getMonth() + 1);
        monthEnd.setDate(0);
        const isToday = today >= monthStart && today <= monthEnd;
        
        months.push({
          label: month,
          isToday,
          date: monthDate,
          month,
          year,
          isFirstOfYear: monthDate.getMonth() === 0
        });
      }
      
      return months;
    }
  };

  const [weeks, setWeeks] = useState(generateTimePeriods(0, timeResolution));

  const handleNavigateBackward = () => {
    let step = 4;
    if (timeResolution === 'Day') step = 7; // Move by week in day view
    if (timeResolution === 'Month') step = 60; // Move by 2 months
    
    const newOffset = weekOffset - step;
    setWeekOffset(newOffset);
    setWeeks(generateTimePeriods(newOffset, timeResolution));
  };

  const handleNavigateForward = () => {
    let step = 4;
    if (timeResolution === 'Day') step = 7; // Move by week in day view
    if (timeResolution === 'Month') step = 60; // Move by 2 months
    
    const newOffset = weekOffset + step;
    setWeekOffset(newOffset);
    setWeeks(generateTimePeriods(newOffset, timeResolution));
  };

  const handleGoToToday = () => {
    setWeekOffset(0);
    setWeeks(generateTimePeriods(0, timeResolution));
  };

  // Update weeks when resolution changes
  React.useEffect(() => {
    setWeekOffset(0); // Reset offset when changing resolution
    setWeeks(generateTimePeriods(0, timeResolution));
  }, [timeResolution]);

  const toggleActivity = (id: string) => {
    const newExpanded = new Set(expandedActivities);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedActivities(newExpanded);
    
    // Update tasks with new expanded state
    setTasks(prevTasks =>
      prevTasks.map(task => ({
        ...task,
        expanded: newExpanded.has(task.id)
      }))
    );
  };

  const handleRemoveFilter = (filterId: string) => {
    const newFilters = new Set(activeFilters);
    newFilters.delete(filterId);
    setActiveFilters(newFilters);
  };

  const handleAddFilter = (filterId: string) => {
    const newFilters = new Set(activeFilters);
    newFilters.add(filterId);
    setActiveFilters(newFilters);
  };

  // Zoom handlers
  const handleZoomIn = () => {
    setZoomLevel(prev => {
      if (prev >= 150) return 150; // Max zoom
      if (prev >= 125) return 150;
      if (prev >= 100) return 125;
      if (prev >= 75) return 100;
      return 75;
    });
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => {
      if (prev <= 50) return 50; // Min zoom
      if (prev <= 75) return 50;
      if (prev <= 100) return 75;
      if (prev <= 125) return 100;
      return 125;
    });
  };

  // Calculate task list column width based on zoom
  const TASK_LIST_WIDTH = Math.round(400 + (zoomLevel - 50) * 3); // 50%→400px, 100%→550px, 150%→700px

  // Synchronized scrolling
  const handleTimelineScroll = () => {
    if (timelineScrollRef.current && taskListScrollRef.current && timelineHeaderScrollRef.current) {
      // Sync vertical scroll with task list
      taskListScrollRef.current.scrollTop = timelineScrollRef.current.scrollTop;
      // Sync horizontal scroll with header
      timelineHeaderScrollRef.current.scrollLeft = timelineScrollRef.current.scrollLeft;
    }
  };

  const handleTaskListScroll = () => {
    if (timelineScrollRef.current && taskListScrollRef.current) {
      // Only sync vertical scroll
      timelineScrollRef.current.scrollTop = taskListScrollRef.current.scrollTop;
    }
  };

  const handleTimelineHeaderScroll = () => {
    if (timelineHeaderScrollRef.current && timelineScrollRef.current) {
      // Sync horizontal scroll
      timelineScrollRef.current.scrollLeft = timelineHeaderScrollRef.current.scrollLeft;
    }
  };

  return (
    <div style={{ width: '100%', height: '100vh', background: '#FFFFFF', position: 'relative', overflow: 'visible' }}>
      {/* TOP BAR - 60px */}
      <GanttTopBar 
        onBack={onBack}
        onOpenComments={() => {
          setProjectPanelTab('comments');
          setProjectPanelOpen(true);
        }}
        onOpenFiles={() => {
          setProjectPanelTab('files');
          setProjectPanelOpen(true);
        }}
        onEditProject={() => {
          setWizardMode('edit');
          setShowWizard(true);
        }}
      />

      {/* TOOLBAR - 52px */}
      <GanttToolbar 
        timeResolution={timeResolution}
        onTimeResolutionChange={setTimeResolution}
        onToggleLegend={() => setShowLegend(!showLegend)}
        onNavigateBackward={handleNavigateBackward}
        onNavigateForward={handleNavigateForward}
        onGoToToday={handleGoToToday}
        zoomLevel={zoomLevel}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onCreateProject={() => {
          setWizardMode('create');
          setShowWizard(true);
        }}
      />

      {/* FILTER CHIP BAR - 44px */}
      <GanttFilterBar
        activeFilters={activeFilters}
        onRemoveFilter={handleRemoveFilter}
        onAddFilter={handleAddFilter}
      />

      {/* MAIN GANTT AREA - Full Width */}
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        height: 'calc(100% - 156px)', // 60px top bar + 52px toolbar + 44px filter bar = 156px
        padding: '0 20px'
      }}>
        {/* COLUMN HEADERS - Sticky */}
        <div style={{
          display: 'flex',
          position: 'sticky',
          top: '156px',
          zIndex: 10,
          background: 'white'
        }}>
          {/* Task List Header */}
          <div style={{
            width: `${TASK_LIST_WIDTH}px`,
            height: '68px',
            background: '#F9FAFB',
            borderBottom: '1px solid #E5E7EB',
            borderRight: '2px solid #E5E7EB',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 20px'
          }}>
            <span style={{ 
              fontSize: '13px', 
              fontWeight: 600, 
              color: '#6B7280',
              textTransform: 'uppercase',
              letterSpacing: '0.3px'
            }}>
              Tasks & Activities
            </span>
            
            {/* New Activity Button */}
            <button
              style={{
                height: '36px',
                padding: '0 14px',
                background: 'white',
                color: '#60A5FA',
                fontSize: '13px',
                fontWeight: 600,
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                transition: 'all 150ms ease',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#60A5FA';
                e.currentTarget.style.borderColor = '#60A5FA';
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.borderColor = '#E5E7EB';
                e.currentTarget.style.color = '#60A5FA';
              }}
            >
              <Plus size={16} />
              New Activity
            </button>
          </div>

          {/* Timeline Header - Two-tier with horizontal scroll */}
          <div 
            ref={timelineHeaderScrollRef}
            onScroll={handleTimelineHeaderScroll}
            style={{ 
              flex: 1, 
              background: '#F9FAFB',
              overflowX: 'auto',
              overflowY: 'hidden',
              borderBottom: '1px solid #E5E7EB',
              position: 'relative'
            }}
          >
            <GanttTimelineHeader 
              weeks={weeks}
              timeResolution={timeResolution}
              zoomLevel={zoomLevel}
            />
          </div>
        </div>

        {/* GANTT SPLIT PANE */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* TASK LIST COLUMN - 600px */}
          <GanttTaskList
            ref={taskListScrollRef}
            tasks={tasks}
            onToggleActivity={toggleActivity}
            onScroll={handleTaskListScroll}
            hoveredTask={hoveredTask}
            onSetHoveredTask={setHoveredTask}
            onTaskClick={handleTaskClick}
            zoomLevel={zoomLevel}
          />

          {/* TIMELINE COLUMN - Remaining width (1280px+) */}
          <GanttTimeline
            ref={timelineScrollRef}
            weeks={weeks}
            tasks={tasks}
            onScroll={handleTimelineScroll}
            hoveredTask={hoveredTask}
            onUpdateTask={handleUpdateTask}
            onTaskClick={handleTaskClick}
            weekOffset={weekOffset}
            timeResolution={timeResolution}
            onUpdateMilestone={handleUpdateMilestone}
            onUpdateFlag={handleUpdateFlag}
            zoomLevel={zoomLevel}
          />
        </div>
      </div>

      {/* LEGEND TOOLTIP */}
      {showLegend && <GanttLegend onClose={() => setShowLegend(false)} />}

      {/* TASK DETAIL MODAL */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdateTask={handleUpdateTask}
        />
      )}

      {/* PROJECT INFO PANEL */}
      <ProjectInfoPanel
        isOpen={projectPanelOpen}
        onClose={() => setProjectPanelOpen(false)}
        projectName="BIOGEMSE"
        initialTab={projectPanelTab}
      />

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
            transform: scale(1.0);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.1);
          }
        }
      `}</style>
    </div>
  );
}
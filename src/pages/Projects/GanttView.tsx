import React, { useState, useRef, useEffect } from 'react';
import { GanttTopBar } from './gantt/GanttTopBar';
import { GanttFilterBar } from './gantt/GanttFilterBar';
import { GanttToolbar } from './gantt/GanttToolbar';
import { GanttTaskList } from './gantt/GanttTaskList';
import { GanttTimeline } from './gantt/GanttTimeline';
import { GanttTimelineHeader } from './gantt/GanttTimelineHeader';
import { GanttLegend } from './gantt/GanttLegend';
import { TaskDetailModal } from './gantt/TaskDetailModal';
import { ProjectInfoPanel } from './gantt/ProjectInfoPanel';
import { WEEKS } from './gantt/data';
import { GanttActivity, GanttWeek } from './gantt/types';
import { Plus, Loader2 } from 'lucide-react';
export function GanttView({ onEditProject, onBackToTriage, onBoardClick }: { onEditProject?: (id: string) => void; onBackToTriage: () => void; onBoardClick?: () => void }) {
  const [expandedActivities, setExpandedActivities] = useState<Set<string>>(new Set());
  const [activeFilters, setActiveFilters] = useState<Set<string>>(new Set(['myTasks']));
  const [timeResolution, setTimeResolution] = useState('Week');
  const [showLegend, setShowLegend] = useState(false);
  const [hoveredTask, setHoveredTask] = useState<string | null>(null);
  const [weekOffset, setWeekOffset] = useState(0); // Track timeline position
  const [selectedTask, setSelectedTask] = useState<any>(null); // For modal
  const [projectPanelOpen, setProjectPanelOpen] = useState(false);
  const [projectPanelTab, setProjectPanelTab] = useState<'comments' | 'activity' | 'notes' | 'files'>('comments');
  const [zoomLevel, setZoomLevel] = useState(100); // Zoom percentage: 50, 75, 100, 125, 150
  const [currentProjectId, setCurrentProjectId] = useState<string | undefined>();
  const [currentProjectName, setCurrentProjectName] = useState<string>('BIOGEMSE');
  const [tasks, setTasks] = useState<GanttActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectStartDate, setProjectStartDate] = useState<Date>(new Date());

  // Helper function to parse DD/MM/YYYY date
  function parseDate(dateString: string): Date {
    const [day, month, year] = dateString.split('/').map(Number);
    return new Date(year, month - 1, day);
  }

  // Helper function to calculate weeks between dates
  function getWeekNumber(date: Date, startDate: Date): number {
    const diffTime = date.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 7);
  }

  // Helper function to format date for week label
  function formatWeekLabel(date: Date): string {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[date.getMonth()]} ${date.getDate()}`;
  }

  // Load current project and tasks
  useEffect(() => {
    async function loadGanttData() {
      try {
        setLoading(true);
        const { getProjects, getProjectActivities } = await import('../../services/projectsApi');
        const { getTasks } = await import('../../services/tasksApi');
        const { getMilestones } = await import('../../services/milestonesApi');
        const { getCurrentUser } = await import('../../services/usersApi');

        console.log('Loading Gantt data...');
        
        // Get current user and projects
        const [user, projects] = await Promise.all([
          getCurrentUser().catch(err => {
            console.error('Error loading user:', err);
            return null;
          }),
          getProjects().catch(err => {
            console.error('Error loading projects:', err);
            return [];
          }),
        ]);

        console.log('Projects loaded:', projects.length);

        // Get first project or find by name
        const project = projects.find(p => p.name === 'BIOGEMSE') || projects[0];
        if (!project) {
          console.warn('No project found');
          setTasks([]);
          setLoading(false);
          return;
        }

        console.log('Selected project:', project.name, project.id);

        setCurrentProjectId(project.id);
        setCurrentProjectName(project.name);

        // Load activities if not included in project summary
        let activities = project.activities || [];
        if (!activities || activities.length === 0) {
          console.log('Fetching activities separately...');
          try {
            activities = await getProjectActivities(project.id);
            console.log('Activities loaded:', activities.length);
          } catch (err) {
            console.error('Error loading activities:', err);
            activities = [];
          }
        }

        // Extract tasks from activities (activities have tasks nested in them)
        let apiTasks: any[] = [];
        const tasksFromActivities: any[] = [];
        
        // First, check if activities have tasks nested in them
        activities.forEach(activity => {
          if (activity.tasks && activity.tasks.length > 0) {
            console.log(`Found ${activity.tasks.length} tasks in activity "${activity.name}"`);
            // Add activity reference to each task for easier access
            activity.tasks.forEach(task => {
              tasksFromActivities.push({
                ...task,
                activity: {
                  id: activity.id,
                  name: activity.name,
                  project: {
                    id: project.id,
                    name: project.name
                  }
                }
              });
            });
          }
        });
        
        if (tasksFromActivities.length > 0) {
          console.log(`Using ${tasksFromActivities.length} tasks from activities`);
          apiTasks = tasksFromActivities;
        } else {
          // Fallback: Load tasks from API and filter by activity IDs
          console.log('No tasks in activities, fetching from tasks API and filtering by activity IDs...');
          const activityIds = new Set(activities.map(a => a.id));
          console.log('Activity IDs to match:', Array.from(activityIds));
          
          const allTasks = await getTasks().catch(err => {
            console.error('Error loading tasks:', err);
            return [];
          });

          console.log('All tasks loaded:', allTasks.length);
          
          // Filter tasks that belong to any of the project's activities
          apiTasks = allTasks.filter(t => {
            if (!t.activity) return false;
            const taskActivityId = t.activity.id;
            const matches = activityIds.has(taskActivityId);
            
            if (matches) {
              console.log(`Matched task "${t.name}" to activity "${t.activity.name}"`);
            }
            
            return matches;
          });
          
          console.log('Filtered tasks for project activities:', apiTasks.length);
          
          // If still no tasks, try filtering by project ID as fallback
          if (apiTasks.length === 0) {
            console.log('No tasks matched by activity ID, trying project ID filter...');
            apiTasks = allTasks.filter(t => {
              if (!t.activity) return false;
              const taskProjectId = t.activity.project?.id;
              return taskProjectId === project.id || String(taskProjectId) === String(project.id);
            });
            console.log('Filtered tasks for project ID:', apiTasks.length);
          }
        }

        // Load milestones
        const milestones = await getMilestones({ projectId: project.id }).catch(err => {
          console.error('Error loading milestones:', err);
          return [];
        });

        console.log('Final apiTasks count:', apiTasks.length);
        
        // Calculate timeline bounds
        const allDates: Date[] = [];
        if (project.startDate) allDates.push(parseDate(project.startDate));
        if (project.endDate) allDates.push(parseDate(project.endDate));
        apiTasks.forEach(task => {
          if (task.startDate) allDates.push(parseDate(task.startDate));
          if (task.endDate) allDates.push(parseDate(task.endDate));
        });
        activities.forEach(activity => {
          if (activity.startDate) allDates.push(parseDate(activity.startDate));
          if (activity.endDate) allDates.push(parseDate(activity.endDate));
        });
        milestones.forEach(m => {
          if (m.deliveryDate) allDates.push(parseDate(m.deliveryDate));
        });

        if (allDates.length === 0) {
          setTasks([]);
          setLoading(false);
          return;
        }

        const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
        const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
        
        // Set project start date for week calculation
        setProjectStartDate(minDate);

        // Group tasks by activity
        const activitiesMap = new Map<string, any>();
        
        // Initialize activities from project (use fetched activities if available)
        const projectActivities = activities.length > 0 ? activities : (project.activities || []);
        if (projectActivities.length > 0) {
          projectActivities.forEach(activity => {
            activitiesMap.set(activity.id, {
              id: activity.id,
              type: 'activity' as const,
              name: activity.name,
              borderColor: project.colorAllTasks || '#60A5FA',
              expanded: false,
              startWeek: activity.startDate ? getWeekNumber(parseDate(activity.startDate), minDate) : 0,
              durationWeeks: activity.startDate && activity.endDate
                ? Math.ceil((parseDate(activity.endDate).getTime() - parseDate(activity.startDate).getTime()) / (1000 * 60 * 60 * 24 * 7))
                : 1,
              barColor: project.colorAllTasks || '#60A5FA',
              children: [],
              milestones: [],
            });
          });
        }

        // Add tasks to activities
        apiTasks.forEach(task => {
          if (!task.activity) return;
          
          const activityId = task.activity.id;
          if (!activitiesMap.has(activityId)) {
            // Create activity if it doesn't exist
            activitiesMap.set(activityId, {
              id: activityId,
              type: 'activity' as const,
              name: task.activity.name,
              borderColor: task.color || '#60A5FA',
              expanded: false,
              startWeek: task.startDate ? getWeekNumber(parseDate(task.startDate), minDate) : 0,
              durationWeeks: 1,
              barColor: task.color || '#60A5FA',
              children: [],
              milestones: [],
            });
          }

          const activity = activitiesMap.get(activityId);
          const plannedHours = parseFloat(task.plannedHours || '0');
          const spentHours = parseFloat(task.spentHours || '0');
          const progress = plannedHours > 0 ? Math.round((spentHours / plannedHours) * 100) : 0;
          const hoursColor = progress > 100 ? '#F87171' : progress > 0 ? '#34D399' : '#9CA3AF';
          
          // Get participant avatars
          const avatars = task.participants?.slice(0, 3).map(p => {
            const names = p.user.fullName.split(' ');
            return (names[0][0] + (names[1]?.[0] || '')).toUpperCase();
          }) || [];

          const startWeek = task.startDate ? getWeekNumber(parseDate(task.startDate), minDate) : 0;
          const endWeek = task.endDate ? getWeekNumber(parseDate(task.endDate), minDate) : startWeek + 1;
          const durationWeeks = Math.max(1, endWeek - startWeek);

          const ganttTask: any = {
            id: task.id,
            name: task.name,
            avatars,
            hours: `${Math.round(spentHours)}h / ${Math.round(plannedHours)}h`,
            hoursColor,
            startWeek,
            durationWeeks,
            progress,
            barColor: task.color || activity.barColor,
            completed: task.column?.name === 'Done',
            flag: (task.numFlags || 0) > 0,
            flagWeek: endWeek,
            type: 'task' as const,
            warning: progress > 100,
            timeExceeded: spentHours > plannedHours && plannedHours > 0,
          };

          // Task milestones will be added from milestones API below

          activity.children.push(ganttTask);
        });

        // Add project milestones to activities and tasks
        milestones.forEach(milestone => {
          if (milestone.task?.id) {
            // Task milestone - find the task and add milestone
            for (const activity of activitiesMap.values()) {
              const task = activity.children.find((t: any) => t.id === milestone.task.id);
              if (task) {
                if (!task.milestones) task.milestones = [];
                const taskEndWeek = task.startWeek + task.durationWeeks;
                task.milestones.push({
                  id: milestone.id,
                  name: milestone.name,
                  week: milestone.deliveryDate ? getWeekNumber(parseDate(milestone.deliveryDate), minDate) : taskEndWeek,
                  status: 'upcoming' as const,
                  dueDate: milestone.deliveryDate,
                });
                break;
              }
            }
          } else if (milestone.activity?.id) {
            // Activity milestone
            const activity = activitiesMap.get(milestone.activity.id);
            if (activity) {
              if (!activity.milestones) activity.milestones = [];
              activity.milestones.push({
                id: milestone.id,
                name: milestone.name,
                week: milestone.deliveryDate ? getWeekNumber(parseDate(milestone.deliveryDate), minDate) : 0,
                status: 'upcoming' as const,
                dueDate: milestone.deliveryDate,
              });
            }
          }
        });

        // Convert map to array and sort by position
        const transformedTasks = Array.from(activitiesMap.values())
          .map(activity => ({
            ...activity,
            taskCount: activity.children.length,
            duration: `${activity.durationWeeks} week${activity.durationWeeks !== 1 ? 's' : ''}`,
            expanded: expandedActivities.has(activity.id),
          }))
          .sort((a, b) => (a.startWeek || 0) - (b.startWeek || 0));

        console.log('Transformed tasks:', transformedTasks.length, 'activities');
        console.log('Total tasks in activities:', transformedTasks.reduce((sum, a) => sum + a.children.length, 0));

        setTasks(transformedTasks);
        
        // Expand first activity by default
        if (transformedTasks.length > 0 && expandedActivities.size === 0) {
          setExpandedActivities(new Set([transformedTasks[0].id]));
        }
      } catch (error) {
        console.error('Error loading Gantt data:', error);
        console.error('Error details:', error instanceof Error ? error.message : String(error));
        setTasks([]);
      } finally {
        setLoading(false);
      }
    }

    loadGanttData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProjectId]);

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
    const baseDate = projectStartDate || new Date(); // Use project start date
    const today = new Date(); // Current date
    
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

  const [weeks, setWeeks] = useState<GanttWeek[]>(WEEKS);

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

  // Update weeks when resolution changes or project start date changes
  React.useEffect(() => {
    if (projectStartDate) {
      setWeekOffset(0); // Reset offset when changing resolution
      setWeeks(generateTimePeriods(0, timeResolution));
    }
  }, [timeResolution, projectStartDate]);

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
    setExpandedActivities(newExpanded);
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
        onBoardClick={onBoardClick} 
        onBack={onBackToTriage}
        onOpenComments={() => {
          setProjectPanelTab('comments');
          setProjectPanelOpen(true);
        }}
        onOpenFiles={() => {
          setProjectPanelTab('files');
          setProjectPanelOpen(true);
        }}
        onEditProject={onEditProject}
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
        onCreateProject={undefined}
      />

      {/* FILTER CHIP BAR - 44px */}
      <GanttFilterBar
        activeFilters={activeFilters}
        onRemoveFilter={handleRemoveFilter}
        onAddFilter={handleAddFilter}
      />

      {/* MAIN GANTT AREA - Full Width */}
      {loading ? (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: 'calc(100vh - 156px)',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <Loader2 className="animate-spin" size={32} color="#3B82F6" />
          <div style={{ fontSize: '14px', color: '#6B7280' }}>Loading Gantt data...</div>
        </div>
      ) : (
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
      )}

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
        projectName={currentProjectName}
        projectId={currentProjectId}
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
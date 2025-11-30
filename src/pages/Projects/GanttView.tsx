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
import { getProjects, getProjectActivities, getGanttData } from '../../services/projectsApi';
import { getTasks } from '../../services/tasksApi';
import { getMilestones } from '../../services/milestonesApi';
import { getEvents } from '../../services/eventsApi';
export function GanttView({ onEditProject, onBackToTriage, onBoardClick, projectId, projectName }: { onEditProject?: (id: string) => void; onBackToTriage: () => void; onBoardClick?: () => void; projectId?: string; projectName?: string }) {
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
  const [currentProjectName, setCurrentProjectName] = useState<string>(projectName || '');
  const [currentProjectClient, setCurrentProjectClient] = useState<string>('');
  const [tasks, setTasks] = useState<GanttActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [projectStartDate, setProjectStartDate] = useState<Date>(new Date());

  // Helper function to parse DD/MM/YYYY date
  function parseDate(dateString: string | null | undefined): Date {
    if (!dateString || dateString.trim() === '') {
      return new Date(); // Return current date as fallback
    }
    try {
      // Try DD/MM/YYYY format first
      if (dateString.includes('/')) {
        const parts = dateString.split('/');
        if (parts.length === 3) {
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10);
          const year = parseInt(parts[2], 10);
          if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
            const date = new Date(year, month - 1, day);
            if (!isNaN(date.getTime())) {
              return date;
            }
          }
        }
      }
      // Try ISO format as fallback
      const isoDate = new Date(dateString);
      if (!isNaN(isoDate.getTime())) {
        return isoDate;
      }
      console.warn('Failed to parse date:', dateString, 'using current date');
      return new Date();
    } catch (error) {
      console.error('Error parsing date:', dateString, error);
      return new Date();
    }
  }

  // Helper function to calculate weeks between dates
  function getWeekNumber(date: Date, startDate: Date): number {
    const diffTime = date.getTime() - startDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return Math.floor(diffDays / 7);
  }

  // Load current project and tasks
  useEffect(() => {
    async function loadGanttData() {
      try {
        setLoading(true);
        console.log('Loading Gantt data...');
        
        // Get projects
        const projects = await getProjects().catch(err => {
          console.error('Error loading projects:', err);
          return [];
        });

        console.log('Projects loaded:', projects.length);

        // Get project by ID or name, or use first project
        let project = projects[0];
        if (projectId) {
          project = projects.find(p => p.id === projectId) || project;
        } else if (projectName) {
          project = projects.find(p => p.name === projectName) || project;
        }
        if (!project) {
          console.warn('No project found');
          setTasks([]);
          setLoading(false);
          return;
        }

        console.log('Selected project:', project.name, project.id);

        setCurrentProjectId(project.id);
        setCurrentProjectName(project.name);
        setCurrentProjectClient(project.client?.name || '');

        // Use the Gantt API endpoint which returns activities with tasks nested
        // This is the proper way to get Gantt data for a project
        console.log('Fetching Gantt data for project...');
        let activities: any[] = [];
        let apiTasks: any[] = [];
        
        try {
          const ganttData = await getGanttData(project.id, {
            resolution: (timeResolution || 'week').toLowerCase() as 'day' | 'week' | 'month'
          });
          
          console.log('Gantt data loaded:', {
            activitiesCount: ganttData.activities?.length || 0,
            startDate: ganttData.start,
            endDate: ganttData.end
          });
          
          activities = ganttData.activities || [];
          
          // Extract tasks from activities (Gantt API returns activities with tasks nested)
          activities.forEach(activity => {
            if (activity.tasks && activity.tasks.length > 0) {
              console.log(`Found ${activity.tasks.length} tasks in activity "${activity.name}"`);
              // Add activity reference to each task for easier access
              activity.tasks.forEach((task: any) => {
                // Log task data structure for debugging - show full object
                if (activity.tasks.indexOf(task) === 0) {
                  console.log('Sample task from Gantt API (full object):', task);
                  console.log('Sample task fields:', Object.keys(task));
                  console.log('Sample task hours fields:', {
                    plannedHours: task.plannedHours,
                    spentHours: task.spentHours,
                    allocatedHours: task.allocatedHours,
                    estimatedHours: task.estimatedHours,
                    actualHours: task.actualHours,
                    loggedHours: task.loggedHours,
                    timeSpent: task.timeSpent,
                    hours: task.hours
                  });
                }
                apiTasks.push({
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
          
          console.log(`Total tasks extracted from Gantt data: ${apiTasks.length}`);
        } catch (err) {
          console.error('Error loading Gantt data, falling back to activities API:', err);
          
          // Fallback: Load activities separately
          try {
            activities = await getProjectActivities(project.id);
            console.log('Activities loaded:', activities.length);
          } catch (activityErr) {
            console.error('Error loading activities:', activityErr);
            activities = project.activities || [];
          }
          
          // If activities don't have tasks, try fetching all tasks (limited to 50)
          if (activities.length > 0 && !activities.some(a => a.tasks && a.tasks.length > 0)) {
            console.log('Activities have no tasks, trying tasks API (limited to 50 tasks)...');
            const allTasks = await getTasks().catch(() => []);
            console.log('All tasks loaded:', allTasks.length);
            
            // Filter tasks by project ID
            apiTasks = allTasks.filter(t => {
              const taskProjectId = t.activity?.project?.id;
              return taskProjectId && (
                taskProjectId === project.id || 
                String(taskProjectId).trim() === String(project.id).trim()
              );
            });
            
            console.log('Filtered tasks for project:', apiTasks.length);
          }
        }

        // Load milestones
        const milestones = await getMilestones({ projectId: project.id }).catch(err => {
          console.error('Error loading milestones:', err);
          return [];
        });

        // Load calendar events to calculate spent hours for tasks (Workdeck records time via calendar)
        let calendarEvents: any[] = [];
        try {
          // Get project date range for timesheet query
          const projectStart = project.startDate ? parseDate(project.startDate) : new Date();
          const projectEnd = project.endDate ? parseDate(project.endDate) : new Date();
          
          // Extend range to include all task dates
          const allTaskDates = apiTasks.flatMap(t => [
            t.startDate ? parseDate(t.startDate) : null,
            t.endDate ? parseDate(t.endDate) : null
          ]).filter(d => d !== null) as Date[];
          
          const minTaskDate = allTaskDates.length > 0 
            ? new Date(Math.min(...allTaskDates.map(d => d.getTime())))
            : projectStart;
          const maxTaskDate = allTaskDates.length > 0
            ? new Date(Math.max(...allTaskDates.map(d => d.getTime())))
            : projectEnd;
          
          const timesheetStart = minTaskDate < projectStart ? minTaskDate : projectStart;
          const timesheetEnd = maxTaskDate > projectEnd ? maxTaskDate : projectEnd;
          
          // Format dates as DD/MM/YYYY for timesheet API
          const formatDateForAPI = (date: Date): string => {
            const day = String(date.getDate()).padStart(2, '0');
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const year = date.getFullYear();
            return `${day}/${month}/${year}`;
          };
          
          calendarEvents = await getEvents(
            formatDateForAPI(timesheetStart),
            formatDateForAPI(timesheetEnd)
          );
          console.log(`Loaded ${calendarEvents.length} calendar events`);
        } catch (err) {
          console.error('Error loading calendar events:', err);
        }

        // Aggregate spent hours by task ID
        const spentHoursByTask = new Map<string, number>();
        calendarEvents.forEach(event => {
          if (!event.timesheet) return; // Only count events flagged as timesheet entries
          const taskId = event.task?.id;
          if (taskId) {
            const start = event.startAt ? new Date(event.startAt) : null;
            const end = event.endAt ? new Date(event.endAt) : null;
            if (!start || !end || isNaN(start.getTime()) || isNaN(end.getTime())) return;
            const durationHours = Math.max(0, (end.getTime() - start.getTime()) / (1000 * 60 * 60));
            const current = spentHoursByTask.get(taskId) || 0;
            spentHoursByTask.set(taskId, current + durationHours);
          }
        });
        console.log(`Calculated spent hours from calendar for ${spentHoursByTask.size} tasks`);

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

        // If no dates found, use current date as fallback
        if (allDates.length === 0) {
          const today = new Date();
          allDates.push(today);
          allDates.push(new Date(today.getTime() + 90 * 24 * 60 * 60 * 1000)); // 90 days from now
        }

        const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
        
        // Validate minDate is a valid date
        if (isNaN(minDate.getTime())) {
          console.error('Invalid minDate calculated, using current date as fallback');
          const today = new Date();
          setProjectStartDate(today);
        } else {
          // Set project start date for week calculation
          console.log('Setting project start date:', minDate.toISOString());
          setProjectStartDate(minDate);
        }

        // Group tasks by activity and build hierarchical structure
        const activitiesMap = new Map<string, any>();
        
        // Initialize activities from project (use fetched activities if available)
        const projectActivities = activities.length > 0 ? activities : (project.activities || []);
        if (projectActivities.length > 0) {
          // Sort activities by position to maintain correct order
          const sortedActivities = [...projectActivities].sort((a, b) => (a.position || 0) - (b.position || 0));
          
          // First pass: Create all activities in the map
          sortedActivities.forEach(activity => {
            const startDate = activity.startDate ? parseDate(activity.startDate) : minDate;
            const endDate = activity.endDate ? parseDate(activity.endDate) : new Date(minDate.getTime() + 7 * 24 * 60 * 60 * 1000);
            
            activitiesMap.set(activity.id, {
              id: activity.id,
              type: 'activity' as const,
              name: activity.name,
              borderColor: project.colorAllTasks || '#60A5FA',
              expanded: false,
              startWeek: getWeekNumber(startDate, minDate),
              durationWeeks: Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7))),
              barColor: project.colorAllTasks || '#60A5FA',
              children: [],
              milestones: [],
              parentId: activity.parentId, // Store parentId for hierarchical building
              position: activity.position || 0, // Store position for sorting
            });
          });
          
          // Second pass: Build hierarchical structure by linking child activities to parents
          // Process in reverse order to handle deeply nested structures correctly
          for (let i = sortedActivities.length - 1; i >= 0; i--) {
            const activity = sortedActivities[i];
            if (activity.parentId) {
              const childActivity = activitiesMap.get(activity.id);
              const parentActivity = activitiesMap.get(activity.parentId);
              if (childActivity && parentActivity) {
                // Add to parent's children (will be sorted later)
                parentActivity.children.push(childActivity);
              }
            }
          }
          
          // Helper function to sort children recursively by position
          const sortChildrenRecursive = (item: any) => {
            if (item.children && item.children.length > 0) {
              item.children.sort((a: any, b: any) => {
                // Sort by position if available, otherwise by name
                if (a.position !== undefined && b.position !== undefined) {
                  return a.position - b.position;
                }
                return (a.name || '').localeCompare(b.name || '');
              });
              // Recursively sort nested children
              item.children.forEach((child: any) => sortChildrenRecursive(child));
            }
          };
          
          // Sort all activities' children by position
          activitiesMap.forEach(activity => sortChildrenRecursive(activity));
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
          
          // Extract planned hours - handle different possible field names and formats
          const plannedHoursStr = task.plannedHours 
            || task.allocatedHours 
            || task.estimatedHours 
            || task.hours?.planned
            || task.hours?.allocated
            || task.time?.planned
            || task.time?.allocated
            || '0';
          
          // Extract spent hours - first try direct fields, then use timesheet aggregation
          let spentHoursStr = task.spentHours 
            || task.actualHours 
            || task.loggedHours 
            || task.timeSpent
            || task.hours?.spent
            || task.hours?.actual
            || task.hours?.logged
            || task.time?.spent
            || task.time?.actual
            || task.time?.logged;
          
          // If no spent hours in task, use aggregated timesheet data
          if (!spentHoursStr && spentHoursByTask.has(task.id)) {
            spentHoursStr = String(spentHoursByTask.get(task.id));
          } else if (!spentHoursStr) {
            spentHoursStr = '0';
          }
          
          // Parse hours - handle string or number formats
          const plannedHours = typeof plannedHoursStr === 'string' 
            ? parseFloat(plannedHoursStr.replace(',', '.')) || 0
            : (typeof plannedHoursStr === 'number' ? plannedHoursStr : 0);
          const spentHours = typeof spentHoursStr === 'string'
            ? parseFloat(spentHoursStr.replace(',', '.')) || 0
            : (typeof spentHoursStr === 'number' ? spentHoursStr : 0);
          
          // Log if hours are missing for debugging - show all possible hour fields
          if (spentHours === 0 && plannedHours === 0) {
            console.log(`Task "${task.name}" has no hours data. Available fields:`, {
              plannedHours: task.plannedHours,
              spentHours: task.spentHours,
              allocatedHours: task.allocatedHours,
              estimatedHours: task.estimatedHours,
              actualHours: task.actualHours,
              loggedHours: task.loggedHours,
              timeSpent: task.timeSpent,
              hours: task.hours,
              allTaskFields: Object.keys(task).filter(k => k.toLowerCase().includes('hour') || k.toLowerCase().includes('time') || k.toLowerCase().includes('spent'))
            });
          }
          
          const progress = plannedHours > 0 ? Math.round((spentHours / plannedHours) * 100) : 0;
          const hoursColor = progress > 100 ? '#F87171' : progress > 0 ? '#34D399' : '#9CA3AF';
          
          // Get participant avatars
          const avatars = task.participants?.filter((p: any) => p.user?.fullName)
            .slice(0, 3)
            .map((p: any) => {
              const names = p.user.fullName.split(' ');
              return (names[0][0] + (names[1]?.[0] || '')).toUpperCase();
            }) || [];

          const startWeek = task.startDate ? getWeekNumber(parseDate(task.startDate), minDate) : 0;
          const endWeek = task.endDate ? getWeekNumber(parseDate(task.endDate), minDate) : startWeek + 1;
          const durationWeeks = Math.max(1, endWeek - startWeek);

          // Format hours string - always show both values
          const hoursString = `${Math.round(spentHours)}h / ${Math.round(plannedHours)}h`;
          
          const ganttTask: any = {
            id: task.id,
            name: task.name,
            avatars,
            hours: hoursString,
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
        
        // Re-sort children after adding tasks to maintain order
        const sortChildrenAfterTasks = (item: any) => {
          if (item.children && item.children.length > 0) {
            item.children.sort((a: any, b: any) => {
              // Sort tasks and activities together by position if available, otherwise by name
              if (a.position !== undefined && b.position !== undefined) {
                return a.position - b.position;
              }
              // If one is a task and one is an activity, activities come first
              if (a.type === 'activity' && b.type === 'task') return -1;
              if (a.type === 'task' && b.type === 'activity') return 1;
              return (a.name || '').localeCompare(b.name || '');
            });
            // Recursively sort nested children
            item.children.forEach((child: any) => {
              if (child.type === 'activity') {
                sortChildrenAfterTasks(child);
              }
            });
          }
        };
        
        // Re-sort all activities' children after adding tasks
        activitiesMap.forEach(activity => sortChildrenAfterTasks(activity));

        // Helper function to recursively find a task in activities (including nested)
        const findTaskRecursive = (items: any[], taskId: string): any => {
          for (const item of items) {
            if (item.type === 'task' && item.id === taskId) {
              return item;
            }
            if (item.children) {
              const found = findTaskRecursive(item.children, taskId);
              if (found) return found;
            }
          }
          return null;
        };
        
        // Helper function to recursively find an activity (including nested)
        const findActivityRecursive = (items: any[], activityId: string): any => {
          for (const item of items) {
            if (item.type === 'activity' && item.id === activityId) {
              return item;
            }
            if (item.children) {
              const found = findActivityRecursive(item.children, activityId);
              if (found) return found;
            }
          }
          return null;
        };
        
        // Add project milestones to activities and tasks
        milestones.forEach(milestone => {
          if (milestone.task?.id) {
            // Task milestone - find the task recursively (including in nested activities)
            const taskId = milestone.task.id;
            const allActivities = Array.from(activitiesMap.values());
            const task = findTaskRecursive(allActivities, taskId);
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
            }
          } else if (milestone.activity?.id) {
            // Activity milestone - find recursively (including nested)
            const allActivities = Array.from(activitiesMap.values());
            const activity = findActivityRecursive(allActivities, milestone.activity.id);
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

        // Helper function to count tasks recursively (including nested activities)
        const countTasksRecursive = (item: any): number => {
          if (item.type === 'task') return 1;
          return item.children?.reduce((sum: number, child: any) => sum + countTasksRecursive(child), 0) || 0;
        };
        
        // Convert map to array, filter out nested activities (keep only top-level), and sort
        const transformedTasks = Array.from(activitiesMap.values())
          .filter(activity => !activity.parentId) // Only top-level activities
          .map(activity => {
            // Calculate task count recursively
            const taskCount = countTasksRecursive(activity);
            return {
              ...activity,
              taskCount,
              duration: activity.durationWeeks > 0 
                ? `${activity.durationWeeks} week${activity.durationWeeks !== 1 ? 's' : ''}`
                : '0 weeks',
              expanded: expandedActivities.has(activity.id) || activity.children.length > 0,
            };
          })
          .sort((a, b) => {
            // Sort by position if available, otherwise by startWeek, then by name
            if (a.position !== undefined && b.position !== undefined) {
              return a.position - b.position;
            }
            if (a.startWeek !== undefined && b.startWeek !== undefined) {
              return a.startWeek - b.startWeek;
            }
            return (a.name || '').localeCompare(b.name || '');
          });

        console.log('Transformed tasks:', transformedTasks.length, 'activities');
        console.log('Total tasks in activities:', transformedTasks.reduce((sum, a) => sum + a.children.length, 0));
        console.log('Activities with dates:', transformedTasks.filter(a => a.startWeek !== undefined).length);
        
        // Debug: Log each activity and its task count
        transformedTasks.forEach(activity => {
          console.log(`Activity "${activity.name}" (ID: ${activity.id}): ${activity.children.length} tasks`);
          if (activity.children.length > 0) {
            console.log(`  Tasks:`, activity.children.map((t: any) => t.name));
          }
        });

        setTasks(transformedTasks);
        
        // Expand all activities that have tasks by default, or at least the first one
        if (transformedTasks.length > 0 && expandedActivities.size === 0) {
          const activitiesWithTasks = transformedTasks.filter(a => a.children.length > 0);
          if (activitiesWithTasks.length > 0) {
            // Expand all activities that have tasks
            setExpandedActivities(new Set(activitiesWithTasks.map(a => a.id)));
          } else {
            // If no tasks, expand first activity anyway
            setExpandedActivities(new Set([transformedTasks[0].id]));
          }
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
    // Ensure we have a valid date
    let baseDate = projectStartDate;
    if (!baseDate || isNaN(baseDate.getTime())) {
      console.warn('projectStartDate is invalid, using current date');
      baseDate = new Date();
    }
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
        const weekNumber = isNaN(pastDaysOfYear) ? 1 : Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
        
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
    if (projectStartDate && !isNaN(projectStartDate.getTime())) {
      setWeekOffset(0); // Reset offset when changing resolution or project
      const generatedWeeks = generateTimePeriods(0, timeResolution);
      console.log('Regenerating weeks with projectStartDate:', projectStartDate.toISOString(), 'generated', generatedWeeks.length, 'weeks');
      if (generatedWeeks.length > 0 && generatedWeeks[0].label) {
        console.log('First week label:', generatedWeeks[0].label);
      }
      setWeeks(generatedWeeks);
    } else {
      console.warn('projectStartDate is invalid, using default weeks');
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
        onEditProject={onEditProject ? () => onEditProject(currentProjectId || '') : undefined}
        projectName={currentProjectName}
        projectClient={currentProjectClient}
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
              onScroll={handleTimelineHeaderScroll}
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

      <style>{`
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
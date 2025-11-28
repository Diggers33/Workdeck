import { useState, useMemo, useEffect, useRef } from 'react';
import { Calendar, ChevronDown, ChevronRight, ChevronLeft, Search, SlidersHorizontal, Download, Settings } from 'lucide-react';
import { User, Task, Project, TimeResolution, Leave } from '../types';
import { UserRow } from './UserRow';
import { SimplifiedDetailPanel } from './SimplifiedDetailPanel';
import { MonthView } from './MonthView';
import { Button } from './ui/button';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar as CalendarComponent } from './ui/calendar';
import { Badge } from './ui/badge';
import { FilterPanel, FilterState } from './FilterPanel';
import { LeaveLegend } from './LeaveLegend';
import { colors, typography } from '../constants/designTokens';
import {
  getDatesInRange,
  getWeeksInRange,
  getMonthsInRange,
  formatDateHeader,
  calculateUserCapacity,
  calculateWeeklyCapacity,
  calculateMonthlyCapacity,
} from '../utils/capacityUtils';
import { format, addDays, addWeeks, addMonths, subDays, subWeeks, subMonths } from 'date-fns';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './ui/select';
import { Filter } from 'lucide-react';
import { X } from 'lucide-react';

interface HeatMapProps {
  users: User[];
  tasks: Task[];
  projects: Project[];
  departments: string[];
  leaves: Leave[];
  onTaskClick: (task: Task) => void;
  onPlanTime: (userId: string) => void;
}

// Hour slot interface for Day view
interface HourSlot {
  hour: number;
  label: string;
  date: Date;
}

// Get hours for a single day (8am - 6pm = 11 hours)
const getHoursInDay = (date: Date): HourSlot[] => {
  const hours: HourSlot[] = [];
  for (let hour = 8; hour <= 18; hour++) {
    const hourDate = new Date(date);
    hourDate.setHours(hour, 0, 0, 0);

    // Format: 8am, 9am, 10am, 11am, 12pm, 1pm, etc.
    let label: string;
    if (hour === 12) {
      label = '12pm';
    } else if (hour > 12) {
      label = `${hour - 12}pm`;
    } else {
      label = `${hour}am`;
    }

    hours.push({ hour, label, date: hourDate });
  }
  return hours;
};

export function HeatMap({
  users,
  tasks,
  projects,
  departments,
  leaves,
  onTaskClick,
  onPlanTime,
}: HeatMapProps) {
  const [resolution, setResolution] = useState<TimeResolution>('week');
  // For Day view - single selected day
  const [selectedDay, setSelectedDay] = useState<Date>(() => new Date());
  const [startDate, setStartDate] = useState<Date>(() => {
    const date = new Date();
    // For week view, start from Monday of current week
    const day = date.getDay();
    const diff = day === 0 ? -6 : 1 - day; // If Sunday, go back 6 days, else go to Monday
    date.setDate(date.getDate() + diff);
    return date;
  });
  const [endDate, setEndDate] = useState<Date>(() => {
    const date = new Date();
    // For week view, end on Sunday of current week
    const day = date.getDay();
    const diff = day === 0 ? -6 : 1 - day; // If Sunday, go back 6 days, else go to Monday
    date.setDate(date.getDate() + diff + 6); // Add 6 days to get to Sunday
    return date;
  });

  // Handle resolution change
  const handleResolutionChange = (newResolution: TimeResolution) => {
    setResolution(newResolution);
    if (newResolution === 'day') {
      // Set selected day to today or current start date
      setSelectedDay(new Date());
    }
  };
  const [expandAll, setExpandAll] = useState(false);
  const [collapsedDepartments, setCollapsedDepartments] = useState<Set<string>>(new Set());
  const [visibleCount, setVisibleCount] = useState(15);
  const [showScrollHint, setShowScrollHint] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [activeFilters, setActiveFilters] = useState<FilterState>({
    departments: [],
    utilizationRange: [0, 150],
    skills: [],
    costRange: [0, 200],
    roles: [],
  });
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  
  // Detail panel state - no user selected by default
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const selectedUser = selectedUserId ? users.find(u => u.id === selectedUserId) : null;
  
  // Hover state for visual connections
  const [hoveredActivity, setHoveredActivity] = useState<string | null>(null);
  
  const handleUserClick = (userId: string) => {
    setSelectedUserId(userId);
    setSelectedTask(null);
  };
  
  const handleBarClick = (task: Task) => {
    setSelectedTask(task);
    setSelectedUserId(task.assigneeId);
  };
  
  const handleClosePanel = () => {
    setSelectedUserId(null);
    setSelectedTask(null);
  };
  
  const filteredUsers = useMemo(() => {
    let filtered = users;
    
    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(u => 
        u.name.toLowerCase().includes(query) ||
        u.role.toLowerCase().includes(query) ||
        u.department.toLowerCase().includes(query)
      );
    }
    
    // Apply department filters
    if (activeFilters.departments.length > 0) {
      filtered = filtered.filter(u => activeFilters.departments.includes(u.department));
    }
    
    // Apply role filters
    if (activeFilters.roles.length > 0) {
      filtered = filtered.filter(u => activeFilters.roles.includes(u.role));
    }
    
    return filtered;
  }, [users, searchQuery, activeFilters]);
  
  // Group users by department
  const groupedUsers = useMemo(() => {
    const groups = new Map<string, User[]>();
    filteredUsers.forEach(user => {
      const dept = user.department;
      if (!groups.has(dept)) {
        groups.set(dept, []);
      }
      groups.get(dept)!.push(user);
    });
    // Sort departments alphabetically
    return new Map([...groups.entries()].sort((a, b) => a[0].localeCompare(b[0])));
  }, [filteredUsers]);
  
  const toggleDepartment = (dept: string) => {
    setCollapsedDepartments(prev => {
      const next = new Set(prev);
      if (next.has(dept)) {
        next.delete(dept);
      } else {
        next.add(dept);
      }
      return next;
    });
  };
  
  const collapseAllDepartments = () => {
    if (collapsedDepartments.size === groupedUsers.size) {
      setCollapsedDepartments(new Set());
    } else {
      setCollapsedDepartments(new Set(groupedUsers.keys()));
    }
  };
  
  // Flatten visible users with department info
  const visibleUsersFlat = useMemo(() => {
    const flat: Array<{ type: 'dept', dept: string, count: number } | { type: 'user', user: User, userIndex: number }> = [];
    let userIndex = 0;
    
    Array.from(groupedUsers.entries()).forEach(([dept, deptUsers]) => {
      flat.push({ type: 'dept', dept, count: deptUsers.length });
      
      if (!collapsedDepartments.has(dept)) {
        deptUsers.forEach(user => {
          flat.push({ type: 'user', user, userIndex });
          userIndex++;
        });
      } else {
        userIndex += deptUsers.length;
      }
    });
    
    return flat;
  }, [groupedUsers, collapsedDepartments]);
  
  const totalUserCount = filteredUsers.length;
  const currentlyVisibleUsers = visibleUsersFlat
    .filter(item => item.type === 'user')
    .slice(0, visibleCount);
  const actualVisibleCount = currentlyVisibleUsers.length;
  
  // Handle scroll to hide hint
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const handleScroll = () => {
      if (showScrollHint && container.scrollTop > 100) {
        setShowScrollHint(false);
      }
    };
    
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [showScrollHint]);
  
  const dates = useMemo(() => {
    if (resolution === 'day') {
      return getDatesInRange(startDate, endDate);
    } else if (resolution === 'week') {
      // For week view, show 7 consecutive days starting from startDate
      return getDatesInRange(startDate, endDate);
    } else {
      return getMonthsInRange(startDate, endDate);
    }
  }, [startDate, endDate, resolution]);
  
  const userCapacities = useMemo(() => {
    return filteredUsers.map(user => {
      if (resolution === 'day' || resolution === 'week') {
        // For both day and week view, use daily capacity since we show individual days
        return calculateUserCapacity(user, tasks, startDate, endDate);
      } else {
        const allocations = new Map();
        dates.forEach(monthStart => {
          const allocation = calculateMonthlyCapacity(user, tasks, monthStart);
          allocations.set(allocation.date, allocation);
        });
        const totalPlanned = Array.from(allocations.values()).reduce(
          (sum, alloc) => sum + alloc.plannedHours,
          0
        );
        return {
          userId: user.id,
          allocations,
          totalPlanned,
          totalCapacity: Array.from(allocations.values()).reduce(
            (sum, alloc) => sum + alloc.totalCapacity,
            0
          )
        };
      }
    });
  }, [filteredUsers, tasks, dates, resolution, startDate, endDate]);
  
  const loadMore = () => {
    setVisibleCount(prev => Math.min(prev + 15, totalUserCount));
  };
  
  const handlePreviousPeriod = () => {
    if (resolution === 'day') {
      // Move back by 1 day
      setSelectedDay(subDays(selectedDay, 1));
    } else if (resolution === 'week') {
      // Move back by 7 days (one week)
      setStartDate(subDays(startDate, 7));
      setEndDate(subDays(endDate, 7));
    } else {
      setStartDate(subMonths(startDate, 1));
      setEndDate(subMonths(endDate, 1));
    }
  };

  const handleNextPeriod = () => {
    if (resolution === 'day') {
      // Move forward by 1 day
      setSelectedDay(addDays(selectedDay, 1));
    } else if (resolution === 'week') {
      // Move forward by 7 days (one week)
      setStartDate(addDays(startDate, 7));
      setEndDate(addDays(endDate, 7));
    } else {
      setStartDate(addMonths(startDate, 1));
      setEndDate(addMonths(endDate, 1));
    }
  };
  
  const handleApplyFilters = (filters: FilterState) => {
    setActiveFilters(filters);
  };
  
  const removeFilter = (filterType: string, value?: string) => {
    setActiveFilters(prev => {
      if (filterType === 'department' && value) {
        return { ...prev, departments: prev.departments.filter(d => d !== value) };
      } else if (filterType === 'role' && value) {
        return { ...prev, roles: prev.roles.filter(r => r !== value) };
      } else if (filterType === 'utilization') {
        return { ...prev, utilizationRange: [0, 150], utilizationPreset: undefined };
      }
      return prev;
    });
  };
  
  const clearAllFilters = () => {
    setActiveFilters({
      departments: [],
      utilizationRange: [0, 150],
      skills: [],
      costRange: [0, 200],
      roles: [],
    });
    setSearchQuery('');
  };
  
  const activeFilterCount = [
    activeFilters.departments.length > 0,
    activeFilters.utilizationRange[0] > 0 || activeFilters.utilizationRange[1] < 150,
    activeFilters.skills.length > 0,
    activeFilters.costRange[0] > 0 || activeFilters.costRange[1] < 200,
    activeFilters.roles.length > 0,
  ].filter(Boolean).length;
  
  const hasActiveFilters = activeFilterCount > 0 || searchQuery.length > 0;
  
  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: colors.bgSubtle }}>
      {/* Top Bar */}
      <div
        className="px-6 py-4"
        style={{
          backgroundColor: colors.bgWhite,
          borderBottom: `1px solid ${colors.borderDefault}`,
        }}
      >
        <div className="flex items-center justify-between gap-6">
          {/* LEFT SECTION */}
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <Tabs value={resolution} onValueChange={(v) => handleResolutionChange(v as TimeResolution)}>
              <TabsList className="bg-gray-100">
                <TabsTrigger value="day">Day</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
              </TabsList>
            </Tabs>

            {/* Date Picker - Different for Day view vs Week/Month */}
            {resolution === 'day' ? (
              // Single date picker for Day view
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Calendar className="h-4 w-4" />
                    {format(selectedDay, 'EEE, MMM d, yyyy')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={selectedDay}
                    onSelect={(date) => date && setSelectedDay(date)}
                  />
                </PopoverContent>
              </Popover>
            ) : (
              // Date range picker for Week/Month view
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-2">
                    <Calendar className="h-4 w-4" />
                    {format(startDate, 'MMM d')} - {format(endDate, 'MMM d, yyyy')}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-4" align="start">
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium mb-2 block">Start Date</label>
                      <CalendarComponent
                        mode="single"
                        selected={startDate}
                        onSelect={(date) => date && setStartDate(date)}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium mb-2 block">End Date</label>
                      <CalendarComponent
                        mode="single"
                        selected={endDate}
                        onSelect={(date) => date && setEndDate(date)}
                      />
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
            )}
            
            {/* Navigation Arrows */}
            <div className="flex items-center gap-1">
              <Button
                variant="outline"
                size="sm"
                className="h-9 w-9 p-0"
                onClick={handlePreviousPeriod}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-9 w-9 p-0"
                onClick={handleNextPeriod}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* CENTER SECTION - Filters + Search */}
          <div className="flex items-center gap-2 flex-1">
            {/* Inline Filter Dropdowns */}
            <Select
              value={activeFilters.departments.length === 1 ? activeFilters.departments[0] : 'all'}
              onValueChange={(value) => {
                if (value === 'all') {
                  setActiveFilters(prev => ({ ...prev, departments: [] }));
                } else {
                  setActiveFilters(prev => ({ ...prev, departments: [value] }));
                }
              }}
            >
              <SelectTrigger
                className="bg-white border-gray-200 text-gray-700"
                style={{ width: '140px', height: '36px', fontSize: '13px' }}
              >
                <SelectValue placeholder="All Departments" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {departments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select
              value="all"
              onValueChange={(value) => {
                // Project filter - would need to add projectFilter state if needed
              }}
            >
              <SelectTrigger
                className="bg-white border-gray-200 text-gray-700"
                style={{ width: '140px', height: '36px', fontSize: '13px' }}
              >
                <SelectValue placeholder="All Projects" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Projects</SelectItem>
                {projects.map(project => (
                  <SelectItem key={project.id} value={project.id}>{project.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Search Input */}
            <div className="flex-1 max-w-sm relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search people, projects, or tasks..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 pr-16"
                style={{ height: '36px' }}
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 text-xs text-gray-400 bg-gray-100 border border-gray-200 rounded">
                ⌘K
              </kbd>
            </div>
          </div>
          
          {/* RIGHT SECTION */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowFilterPanel(true)}
              className="gap-2"
            >
              <SlidersHorizontal className="h-4 w-4" />
              Filters
              {activeFilterCount > 0 && (
                <Badge className="ml-1 h-5 min-w-5 px-1.5">{activeFilterCount}</Badge>
              )}
            </Button>
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
              <Download className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
              <Settings className="h-4 w-4" />
            </Button>
            <LeaveLegend />
          </div>
        </div>
      </div>
      
      {/* Active Filters Chips */}
      {hasActiveFilters && (
        <div
          className="px-6 py-3"
          style={{
            backgroundColor: colors.bgWhite,
            borderBottom: `1px solid ${colors.borderDefault}`,
          }}
        >
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600">Active filters:</span>
            
            {/* Department filters */}
            {activeFilters.departments.map(dept => (
              <Badge
                key={dept}
                variant="secondary"
                className="gap-1.5 pr-1 cursor-pointer hover:bg-gray-200"
                onClick={() => removeFilter('department', dept)}
              >
                {dept}
                <X className="h-3 w-3" />
              </Badge>
            ))}
            
            {/* Utilization filter */}
            {(activeFilters.utilizationRange[0] > 0 || activeFilters.utilizationRange[1] < 150) && (
              <Badge
                variant="secondary"
                className="gap-1.5 pr-1 cursor-pointer hover:bg-gray-200"
                onClick={() => removeFilter('utilization')}
              >
                Utilization {activeFilters.utilizationRange[0]}%-{activeFilters.utilizationRange[1]}%
                <X className="h-3 w-3" />
              </Badge>
            )}
            
            {/* Role filters */}
            {activeFilters.roles.map(role => (
              <Badge
                key={role}
                variant="secondary"
                className="gap-1.5 pr-1 cursor-pointer hover:bg-gray-200"
                onClick={() => removeFilter('role', role)}
              >
                {role}
                <X className="h-3 w-3" />
              </Badge>
            ))}
            
            {/* Search query */}
            {searchQuery && (
              <Badge
                variant="secondary"
                className="gap-1.5 pr-1 cursor-pointer hover:bg-gray-200"
                onClick={() => setSearchQuery('')}
              >
                Search: "{searchQuery}"
                <X className="h-3 w-3" />
              </Badge>
            )}
            
            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllFilters}
              className="ml-auto text-sm"
            >
              Clear all filters
            </Button>
          </div>
        </div>
      )}
      
      {/* Heat Map Grid - Day View (Hourly Columns) */}
      {resolution === 'day' && (
        <div className="flex-1 overflow-auto relative" ref={scrollContainerRef}>
          <div className="min-w-max">
            {/* Header Row - Hour columns */}
            <div
              className="sticky top-0 z-20 flex"
              style={{
                backgroundColor: colors.bgWhite,
                borderBottom: `1px solid ${colors.borderDefault}`,
              }}
            >
              <div
                className="sticky left-0 z-30"
                style={{
                  width: '240px',
                  padding: '12px',
                  backgroundColor: colors.bgWhite,
                  borderRight: `1px solid ${colors.borderDefault}`,
                }}
              >
                <div
                  style={{
                    fontSize: typography.sm,
                    fontWeight: typography.medium,
                    color: colors.textSecondary,
                  }}
                >
                  Team Member
                </div>
              </div>
              <div className="flex">
                {getHoursInDay(selectedDay).map(hourSlot => {
                  const now = new Date();
                  const isCurrentHour =
                    selectedDay.toDateString() === now.toDateString() &&
                    hourSlot.hour === now.getHours();

                  return (
                    <div
                      key={hourSlot.hour}
                      className="min-w-[80px] relative"
                      style={{
                        padding: '12px 8px',
                        backgroundColor: colors.bgWhite,
                        borderLeft: `1px solid ${colors.borderLight}`,
                      }}
                    >
                      <div
                        className="text-center"
                        style={{
                          fontSize: typography.sm,
                          fontWeight: typography.medium,
                          color: isCurrentHour ? '#3B82F6' : colors.textSecondary,
                        }}
                      >
                        {hourSlot.label}
                      </div>
                      {/* Current hour indicator */}
                      {isCurrentHour && (
                        <div
                          style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: '2px',
                            backgroundColor: '#3B82F6',
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Day View Rows */}
            {visibleUsersFlat.slice(0, visibleCount + visibleUsersFlat.filter(v => v.type === 'dept').length).map((item) => {
              if (item.type === 'dept') {
                const isCollapsed = collapsedDepartments.has(item.dept);
                return (
                  <div
                    key={`dept-${item.dept}`}
                    className="flex cursor-pointer transition-colors"
                    style={{
                      backgroundColor: colors.bgSubtle,
                      borderBottom: `1px solid ${colors.borderDefault}`,
                      borderLeft: `2px solid ${colors.borderDefault}`,
                    }}
                    onClick={() => toggleDepartment(item.dept)}
                  >
                    <div
                      className="sticky left-0 z-10 flex items-center gap-2"
                      style={{
                        width: '240px',
                        padding: '8px 12px',
                        backgroundColor: colors.bgSubtle,
                        borderRight: `1px solid ${colors.borderDefault}`,
                      }}
                    >
                      {isCollapsed ? (
                        <ChevronRight style={{ width: '12px', height: '12px', color: colors.textMuted }} />
                      ) : (
                        <ChevronDown style={{ width: '12px', height: '12px', color: colors.textMuted }} />
                      )}
                      <span style={{ fontSize: typography.base, fontWeight: typography.medium, color: colors.textSecondary }}>
                        {item.dept}
                      </span>
                      <span style={{ fontSize: typography.base, color: colors.textMuted }}>
                        ({item.count})
                      </span>
                    </div>
                    <div className="flex">
                      {getHoursInDay(selectedDay).map(hourSlot => (
                        <div
                          key={hourSlot.hour}
                          className="min-w-[80px]"
                          style={{ borderLeft: `1px solid ${colors.borderLight}` }}
                        />
                      ))}
                    </div>
                  </div>
                );
              } else {
                // User row for Day view
                const user = item.user;
                const userTasks = tasks.filter(t => t.assigneeId === user.id);

                // Get tasks for this specific day
                const dayTasks = userTasks.filter(task => {
                  const taskStart = new Date(task.startDate);
                  const taskEnd = new Date(task.endDate);
                  taskStart.setHours(0, 0, 0, 0);
                  taskEnd.setHours(23, 59, 59, 999);
                  const day = new Date(selectedDay);
                  day.setHours(12, 0, 0, 0);
                  return day >= taskStart && day <= taskEnd;
                });

                // Calculate time slots for each task
                // Distribute daily hours across the working day (8am-6pm)
                interface TimeSlot {
                  task: Task;
                  project: Project | undefined;
                  startHour: number;
                  endHour: number;
                  dailyHours: number;
                }

                const timeSlots: TimeSlot[] = [];
                let currentHour = 8; // Start at 8am

                // Calculate daily hours for each task
                // If task spans multiple days, divide hours evenly
                const tasksWithDailyHours = dayTasks.map(task => {
                  const taskStart = new Date(task.startDate);
                  const taskEnd = new Date(task.endDate);
                  taskStart.setHours(0, 0, 0, 0);
                  taskEnd.setHours(0, 0, 0, 0);

                  // Count working days (exclude weekends)
                  let workingDays = 0;
                  const current = new Date(taskStart);
                  while (current <= taskEnd) {
                    const dayOfWeek = current.getDay();
                    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                      workingDays++;
                    }
                    current.setDate(current.getDate() + 1);
                  }

                  // Calculate daily hours (minimum 1 day to avoid division by zero)
                  const dailyHours = Math.round((task.plannedHours / Math.max(workingDays, 1)) * 10) / 10;

                  return { task, dailyHours: Math.min(dailyHours, 8) }; // Cap at 8h per day
                });

                // Sort by daily hours (largest first) for better visual hierarchy
                tasksWithDailyHours.sort((a, b) => b.dailyHours - a.dailyHours);

                tasksWithDailyHours.forEach(({ task, dailyHours }) => {
                  if (dailyHours < 0.5) return; // Skip tasks with minimal daily allocation

                  const project = projects.find(p => p.id === task.projectId);

                  // Calculate start hour - stack tasks sequentially
                  const startHour = currentHour;
                  const endHour = Math.min(startHour + dailyHours, 18); // Don't go past 6pm

                  // Only add if there's room in the day
                  if (startHour < 18) {
                    timeSlots.push({
                      task,
                      project,
                      startHour,
                      endHour,
                      dailyHours,
                    });

                    currentHour = endHour;
                  }
                });

                // Calculate total DAILY hours for capacity display
                const totalDailyHours = timeSlots.reduce((sum, slot) => sum + slot.dailyHours, 0);
                const isOverallocated = totalDailyHours > 8;

                const hours = getHoursInDay(selectedDay);

                return (
                  <div
                    key={`user-${user.id}`}
                    className="flex transition-colors"
                    style={{
                      height: '72px',
                      backgroundColor: selectedUserId === user.id ? colors.bgSelected : colors.bgWhite,
                      borderBottom: `1px solid ${colors.borderDefault}`,
                      borderLeft: selectedUserId === user.id ? `3px solid ${colors.barBlue}` : 'none',
                    }}
                  >
                    {/* User info column */}
                    <div
                      className="sticky left-0 z-10 flex items-center gap-3 cursor-pointer"
                      style={{
                        width: '240px',
                        padding: '12px',
                        backgroundColor: selectedUserId === user.id ? colors.bgSelected : colors.bgWhite,
                        borderRight: `1px solid ${colors.borderDefault}`,
                      }}
                      onClick={() => handleUserClick(user.id)}
                    >
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: colors.bgSubtle,
                          border: `1px solid ${colors.borderDefault}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: typography.xs,
                          color: colors.textSecondary,
                          flexShrink: 0,
                        }}
                      >
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="truncate" style={{ fontSize: typography.md, fontWeight: typography.medium, color: colors.textPrimary }}>
                          {user.name}
                        </div>
                        <div className="truncate" style={{ fontSize: typography.sm, color: colors.textSecondary }}>
                          {user.role}
                        </div>
                      </div>
                      {/* Hours indicator */}
                      {totalDailyHours > 0 && (
                        <span
                          style={{
                            fontSize: typography.xs,
                            fontWeight: typography.medium,
                            color: isOverallocated ? colors.statusRed : colors.textMuted,
                          }}
                        >
                          {Math.round(totalDailyHours * 10) / 10}h
                        </span>
                      )}
                    </div>

                    {/* Hour cells with spanning bars */}
                    <div className="flex relative" style={{ position: 'relative' }}>
                      {/* Grid cells (for borders) */}
                      {hours.map(hourSlot => (
                        <div
                          key={hourSlot.hour}
                          className="min-w-[80px]"
                          style={{
                            height: '72px',
                            borderLeft: `1px solid ${colors.borderLight}`,
                          }}
                        />
                      ))}

                      {/* Overlay: Task bars spanning multiple columns */}
                      <div
                        style={{
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          pointerEvents: 'none',
                        }}
                      >
                        {timeSlots.map((slot, idx) => {
                          // Calculate position based on start/end hours
                          // Each column is 80px wide, hours start at 8
                          const columnWidth = 80;
                          const leftOffset = (slot.startHour - 8) * columnWidth;
                          const barWidth = (slot.endHour - slot.startHour) * columnWidth;

                          return (
                            <div
                              key={`${slot.task.id}-${idx}`}
                              className="absolute cursor-pointer"
                              style={{
                                left: `${leftOffset + 4}px`,
                                width: `${barWidth - 8}px`,
                                top: `${12 + idx * 24}px`,
                                height: '22px',
                                backgroundColor: slot.project?.color || colors.barBlue,
                                borderRadius: '4px',
                                opacity: 0.9,
                                display: 'flex',
                                alignItems: 'center',
                                padding: '0 8px',
                                overflow: 'hidden',
                                pointerEvents: 'auto',
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                onTaskClick(slot.task);
                              }}
                            >
                              <span
                                className="truncate"
                                style={{
                                  fontSize: typography.xs,
                                  fontWeight: typography.medium,
                                  color: 'white',
                                }}
                              >
                                {slot.task.activity || slot.project?.name || 'Task'}
                              </span>
                              <span
                                style={{
                                  marginLeft: 'auto',
                                  fontSize: '10px',
                                  color: 'rgba(255,255,255,0.8)',
                                  flexShrink: 0,
                                  paddingLeft: '8px',
                                }}
                              >
                                {Math.round(slot.dailyHours * 10) / 10}h
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              }
            })}
          </div>
        </div>
      )}

      {/* Heat Map Grid - Week View */}
      {resolution === 'week' && (
        <div className="flex-1 overflow-auto relative" ref={scrollContainerRef}>
          <div className="min-w-max">
            {/* Header Row */}
            <div
              className="sticky top-0 z-20 flex"
              style={{
                backgroundColor: colors.bgWhite,
                borderBottom: `1px solid ${colors.borderDefault}`,
              }}
            >
              <div
                className="sticky left-0 z-30"
                style={{
                  width: '240px',
                  padding: '12px',
                  backgroundColor: colors.bgWhite,
                  borderRight: `1px solid ${colors.borderDefault}`,
                }}
              >
                <div
                  style={{
                    fontSize: typography.sm,
                    fontWeight: typography.medium,
                    color: colors.textSecondary,
                  }}
                >
                  Team Member
                </div>
              </div>
              <div className="flex">
                {dates.map(date => {
                  const isToday = new Date().toDateString() === date.toDateString();
                  const isWeekend = date.getDay() === 0 || date.getDay() === 6;

                  return (
                    <div
                      key={date.toISOString()}
                      className="min-w-[120px] relative"
                      style={{
                        padding: '8px 12px',
                        backgroundColor: isWeekend ? colors.bgSubtle : colors.bgWhite,
                        borderLeft: `1px solid ${colors.borderLight}`,
                      }}
                    >
                      <div className="text-center">
                        {/* Day name - uppercase */}
                        <div
                          style={{
                            fontSize: typography.sm,
                            fontWeight: typography.medium,
                            color: isWeekend ? colors.textMuted : colors.textSecondary,
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                          }}
                        >
                          {format(date, 'EEE')}
                        </div>
                        {/* Date */}
                        <div
                          style={{
                            fontSize: typography.base,
                            color: isWeekend ? colors.textMuted : colors.textPrimary,
                            marginTop: '2px',
                          }}
                        >
                          {format(date, 'MMM d')}
                        </div>
                      </div>
                      {/* Today indicator - blue bottom border */}
                      {isToday && (
                        <div
                          style={{
                            position: 'absolute',
                            bottom: 0,
                            left: 0,
                            right: 0,
                            height: '2px',
                            backgroundColor: '#3B82F6',
                          }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Rows (Department Headers + User Rows) */}
            {visibleUsersFlat.slice(0, visibleCount + visibleUsersFlat.filter(v => v.type === 'dept').length).map((item, idx) => {
              if (item.type === 'dept') {
                const isCollapsed = collapsedDepartments.has(item.dept);
                return (
                  <div
                    key={`dept-${item.dept}`}
                    className="flex cursor-pointer transition-colors"
                    style={{
                      backgroundColor: colors.bgSubtle,
                      borderBottom: `1px solid ${colors.borderDefault}`,
                      borderLeft: `2px solid ${colors.borderDefault}`,
                    }}
                    onClick={() => toggleDepartment(item.dept)}
                  >
                    <div
                      className="sticky left-0 z-10 flex items-center gap-2"
                      style={{
                        width: '240px',
                        padding: '8px 12px',
                        backgroundColor: colors.bgSubtle,
                        borderRight: `1px solid ${colors.borderDefault}`,
                      }}
                    >
                      {isCollapsed ? (
                        <ChevronRight
                          style={{
                            width: '12px',
                            height: '12px',
                            color: colors.textMuted,
                          }}
                        />
                      ) : (
                        <ChevronDown
                          style={{
                            width: '12px',
                            height: '12px',
                            color: colors.textMuted,
                          }}
                        />
                      )}
                      <span
                        style={{
                          fontSize: typography.base,
                          fontWeight: typography.medium,
                          color: colors.textSecondary,
                        }}
                      >
                        {item.dept}
                      </span>
                      <span
                        style={{
                          fontSize: typography.base,
                          color: colors.textMuted,
                        }}
                      >
                        ({item.count})
                      </span>
                    </div>
                    <div className="flex">
                      {dates.map(date => {
                        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                        return (
                          <div
                            key={date.toISOString()}
                            className="min-w-[120px]"
                            style={{
                              borderLeft: `1px solid ${colors.borderLight}`,
                              backgroundColor: isWeekend ? 'rgba(250, 251, 252, 0.5)' : 'transparent',
                            }}
                          />
                        );
                      })}
                    </div>
                  </div>
                );
              } else {
                const capacity = userCapacities[item.userIndex];
                return (
                  <UserRow
                    key={`user-${item.user.id}`}
                    user={item.user}
                    tasks={tasks}
                    projects={projects}
                    dates={dates}
                    allocations={capacity.allocations}
                    totalPlanned={capacity.totalPlanned}
                    totalCapacity={capacity.totalCapacity}
                    resolution={resolution}
                    leaves={leaves}
                    onUserClick={handleUserClick}
                    onBarClick={handleBarClick}
                    hoveredActivity={hoveredActivity}
                    onActivityHover={setHoveredActivity}
                    isSelected={selectedUserId === item.user.id}
                  />
                );
              }
            })}
          </div>

          {/* Virtual Scrolling Indicator */}
          <div
            className="sticky left-0 p-3"
            style={{
              backgroundColor: colors.bgWhite,
              borderTop: `1px solid ${colors.borderDefault}`,
            }}
          >
            <div
              className="flex items-center justify-between"
              style={{
                fontSize: typography.sm,
                color: colors.textSecondary,
              }}
            >
              <span>
                Showing {actualVisibleCount > 0 ? 1 : 0}-{actualVisibleCount} of {totalUserCount} team members
              </span>
              {showScrollHint && actualVisibleCount < totalUserCount && (
                <span className="text-blue-600 animate-pulse">
                  Scroll for more ↓
                </span>
              )}
              {!showScrollHint && actualVisibleCount < totalUserCount && (
                <Button variant="outline" size="sm" onClick={loadMore}>
                  Load More
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Month View */}
      {resolution === 'month' && (
        <MonthView
          users={filteredUsers}
          tasks={tasks}
          projects={projects}
          departments={departments}
          currentMonth={startDate}
          collapsedDepartments={collapsedDepartments}
          onToggleDepartment={toggleDepartment}
          onUserClick={handleUserClick}
          selectedUserId={selectedUserId}
        />
      )}
      
      {/* Filter Panel */}
      <FilterPanel
        isOpen={showFilterPanel}
        onClose={() => setShowFilterPanel(false)}
        departments={departments}
        onApplyFilters={handleApplyFilters}
      />
      
      {/* Detail Panel */}
      {selectedUser && (
        <SimplifiedDetailPanel
          user={selectedUser}
          tasks={tasks}
          projects={projects}
          onClose={handleClosePanel}
          onEditAllocation={(user) => onPlanTime?.(user.id)}
        />
      )}
    </div>
  );
}
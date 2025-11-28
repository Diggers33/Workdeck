import { useState, useMemo, useEffect, useRef } from 'react';
import { Calendar, ChevronDown, ChevronRight, ChevronLeft, Maximize2, ChevronsDownUp, Search, SlidersHorizontal, Download, Settings } from 'lucide-react';
import { User, Task, Project, TimeResolution, Leave } from '../types';
import { UserRow } from './UserRow';
import { SimplifiedDetailPanel } from './SimplifiedDetailPanel';
import { Button } from './ui/button';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import { Input } from './ui/input';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar as CalendarComponent } from './ui/calendar';
import { Badge } from './ui/badge';
import { FilterPanel, FilterState } from './FilterPanel';
import { LeaveLegend } from './LeaveLegend';
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
  
  // Detail panel state - Sarah Mitchell (u1) selected by default to show populated state
  const [selectedUserId, setSelectedUserId] = useState<string | null>('u1');
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
      setStartDate(subDays(startDate, 7));
      setEndDate(subDays(endDate, 7));
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
      setStartDate(addDays(startDate, 7));
      setEndDate(addDays(endDate, 7));
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
    <div className="flex flex-col h-full bg-gray-50">
      {/* Top Bar */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between gap-6">
          {/* LEFT SECTION */}
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <Tabs value={resolution} onValueChange={(v) => setResolution(v as TimeResolution)}>
              <TabsList className="bg-gray-100">
                <TabsTrigger value="day">Day</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="month">Month</TabsTrigger>
              </TabsList>
            </Tabs>
            
            {/* Date Range Picker */}
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
        <div className="bg-white border-b border-gray-200 px-6 py-3">
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
      
      {/* Heat Map Grid */}
      <div className="flex-1 overflow-auto relative" ref={scrollContainerRef}>
        <div className="min-w-max">
          {/* Header Row */}
          <div className="sticky top-0 z-20 bg-white border-b-2 border-gray-300 flex">
            <div className="sticky left-0 z-30 bg-white border-r border-gray-300 p-3" style={{ width: '240px' }}>
              <div className="font-medium text-sm">Team Member</div>
            </div>
            <div className="flex">
              {dates.map(date => {
                const isToday = new Date().toDateString() === date.toDateString();
                const isWeekend = date.getDay() === 0 || date.getDay() === 6;
                
                return (
                  <div
                    key={date.toISOString()}
                    className={`min-w-[120px] p-2 transition-colors ${
                      isToday ? 'bg-blue-50' : ''
                    }`}
                    style={{
                      background: isToday ? '#EFF6FF' : isWeekend ? '#FAFAFC' : 'white',
                      borderLeft: isWeekend ? '1px dashed #E3E6EB' : '1px solid #E5E7EB',
                    }}
                  >
                    <div className="text-center">
                      <div className="text-[13px] font-semibold" style={{ 
                        letterSpacing: '-0.01em',
                        color: isWeekend ? '#9CA3AF' : '#111827'
                      }}>
                        {format(date, 'EEE')}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        {format(date, 'MMM d')}
                      </div>
                      {isWeekend && (
                        <div 
                          className="text-[10px] mt-0.5"
                          style={{ 
                            color: '#D1D5DB',
                            letterSpacing: '0.05em',
                            fontWeight: 600
                          }}
                        >
                          WEEKEND
                        </div>
                      )}
                    </div>
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
                  className="flex bg-gray-100 border-b border-gray-200 hover:bg-gray-150 transition-colors cursor-pointer"
                  onClick={() => toggleDepartment(item.dept)}
                >
                  <div className="sticky left-0 z-10 bg-gray-100 border-r border-gray-300 p-3 flex items-center gap-2" style={{ width: '240px' }}>
                    {isCollapsed ? (
                      <ChevronRight className="h-3.5 w-3.5" style={{ color: '#6B7280' }} />
                    ) : (
                      <ChevronDown className="h-3.5 w-3.5" style={{ color: '#6B7280' }} />
                    )}
                    <span className="font-medium text-sm">{item.dept} ({item.count})</span>
                  </div>
                  <div className="flex">
                    {dates.map(date => (
                      <div
                        key={date.toISOString()}
                        className="min-w-24 border-l border-gray-200"
                      />
                    ))}
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
        <div className="sticky left-0 bg-white border-t border-gray-200 p-3">
          <div className="flex items-center justify-between text-sm text-gray-600">
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
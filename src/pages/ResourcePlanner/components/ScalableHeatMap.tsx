import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Search, SlidersHorizontal, Download, Settings, Calendar, Users as UsersIcon, TrendingUp, AlertCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Grid3x3, BarChart3, CalendarIcon } from 'lucide-react';

// Mock data generation for 200 users
const departments = [
  { name: 'Design', count: 28, avgUtil: 58, color: '#8B5CF6' },
  { name: 'Engineering', count: 82, avgUtil: 72, color: '#3B82F6' },
  { name: 'Product', count: 24, avgUtil: 45, color: '#10B981' },
  { name: 'Marketing', count: 38, avgUtil: 68, color: '#F59E0B' },
  { name: 'Operations', count: 28, avgUtil: 52, color: '#EF4444' }
];

const projects = [
  { name: 'E-Commerce Platform', color: '#3B82F6' },
  { name: 'Mobile App Redesign', color: '#8B5CF6' },
  { name: 'Internal Tools', color: '#F97316' },
  { name: 'Client Projects', color: '#10B981' },
  { name: 'Marketing Campaign', color: '#F59E0B' },
  { name: 'Data Migration', color: '#06B6D4' },
  { name: 'Analytics Dashboard', color: '#EC4899' },
  { name: 'API Development', color: '#14B8A6' }
];

const roles = {
  Design: ['Senior Designer', 'Lead Designer', 'UX Designer', 'UI Designer', 'Product Designer'],
  Engineering: ['Senior Developer', 'Lead Developer', 'Developer', 'Tech Lead', 'Staff Engineer'],
  Product: ['Product Manager', 'Senior PM', 'Lead PM', 'Product Owner', 'Associate PM'],
  Marketing: ['Marketing Manager', 'Content Manager', 'SEO Specialist', 'Social Media Manager', 'Brand Manager'],
  Operations: ['Operations Manager', 'Program Manager', 'Project Manager', 'Scrum Master', 'Delivery Manager']
};

const firstNames = ['Sarah', 'Marcus', 'Emma', 'James', 'Lisa', 'David', 'Jennifer', 'Michael', 'Jessica', 'Robert', 'Emily', 'Christopher', 'Michelle', 'Daniel', 'Amanda', 'Kevin', 'Laura', 'Ryan', 'Nicole', 'Brandon', 'Sophia', 'Eric', 'Olivia', 'Steven', 'Isabella', 'Timothy', 'Mia', 'Matthew', 'Charlotte', 'Andrew', 'Rachel', 'William', 'Ashley', 'Joseph', 'Samantha', 'Thomas', 'Elizabeth', 'Charles', 'Victoria', 'Benjamin'];
const lastNames = ['Mitchell', 'Chen', 'Rodriguez', 'Wilson', 'Anderson', 'Kim', 'Lee', 'Garcia', 'Davis', 'Martin', 'Taylor', 'White', 'Harris', 'Clark', 'Lewis', 'Walker', 'Hall', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Green', 'Baker', 'Adams', 'Nelson', 'Carter', 'Roberts', 'Turner', 'Phillips', 'Campbell', 'Parker', 'Evans', 'Edwards', 'Collins', 'Stewart', 'Morris', 'Rogers', 'Reed', 'Cook'];

function generateUsers() {
  const users: any[] = [];
  let id = 1;
  
  departments.forEach(dept => {
    const deptRoles = roles[dept.name as keyof typeof roles];
    
    for (let i = 0; i < dept.count; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const role = deptRoles[Math.floor(Math.random() * deptRoles.length)];
      
      // Generate utilization based on department average with variance
      const utilization = Math.max(0, Math.min(120, dept.avgUtil + (Math.random() - 0.5) * 40));
      
      users.push({
        id: `u${id}`,
        name: `${firstName} ${lastName}`,
        role,
        department: dept.name,
        utilization: Math.round(utilization),
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${firstName}${lastName}${id}`
      });
      
      id++;
    }
  });
  
  return users;
}

const allUsers = generateUsers();

// Generate 2 weeks of data
const generateWeekDays = () => {
  const days = [];
  const startDate = new Date(2024, 10, 18); // Nov 18, 2024
  
  for (let i = 0; i < 14; i++) {
    const date = new Date(startDate);
    date.setDate(startDate.getDate() + i);
    days.push({
      day: date.toLocaleDateString('en-US', { weekday: 'short' }),
      date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      fullDate: date
    });
  }
  
  return days;
};

const weekDays = generateWeekDays();

// Generate capacity data for each user with project allocations
function generateUserCapacityData(user: any) {
  // Assign 2-3 projects to each user
  const numProjects = Math.floor(Math.random() * 2) + 2; // 2-3 projects
  const userProjects = [];
  const availableProjects = [...projects];
  
  for (let i = 0; i < numProjects && availableProjects.length > 0; i++) {
    const randomIndex = Math.floor(Math.random() * availableProjects.length);
    userProjects.push(availableProjects.splice(randomIndex, 1)[0]);
  }
  
  return weekDays.map((day, idx) => {
    const isWeekend = day.fullDate.getDay() === 0 || day.fullDate.getDay() === 6;
    
    if (isWeekend) {
      return { hours: 0, capacity: 8, percent: 0, projectBars: [] };
    }
    
    const variance = (Math.random() - 0.5) * 0.3;
    const dailyUtil = user.utilization + (variance * user.utilization);
    const capacity = 8;
    const totalHours = Math.round((dailyUtil / 100) * capacity * 10) / 10;
    
    // Distribute hours across projects
    const projectBars: any[] = [];
    let remainingHours = totalHours;
    
    userProjects.forEach((project, pidx) => {
      let projectHours;
      
      if (pidx === userProjects.length - 1) {
        // Last project gets remaining hours
        projectHours = remainingHours;
      } else {
        // Random allocation
        const maxForThisProject = remainingHours / (userProjects.length - pidx);
        projectHours = Math.random() * maxForThisProject * 1.5;
        projectHours = Math.min(projectHours, remainingHours);
      }
      
      projectHours = Math.max(0, Math.round(projectHours * 10) / 10);
      
      if (projectHours > 0) {
        projectBars.push({
          project: project.name,
          color: project.color,
          hours: projectHours,
          widthPercent: 0 // Will calculate after
        });
        remainingHours -= projectHours;
      }
    });
    
    // Calculate width percentages
    const maxHours = Math.max(capacity, totalHours);
    projectBars.forEach(bar => {
      bar.widthPercent = (bar.hours / maxHours) * 100;
    });
    
    return {
      hours: Math.max(0, totalHours),
      capacity,
      percent: Math.round((totalHours / capacity) * 100),
      projectBars
    };
  });
}

export function ScalableHeatMap() {
  const [expandedDepts, setExpandedDepts] = useState<Set<string>>(new Set(['Engineering']));
  const [selectedView, setSelectedView] = useState<'all' | 'collapsed' | 'custom'>('collapsed');
  const [pageSize] = useState(15);
  const [deptPages, setDeptPages] = useState<Record<string, number>>({});

  const toggleDepartment = (deptName: string) => {
    setExpandedDepts(prev => {
      const next = new Set(prev);
      if (next.has(deptName)) {
        next.delete(deptName);
      } else {
        next.add(deptName);
      }
      return next;
    });
  };

  const expandAll = () => {
    setExpandedDepts(new Set(departments.map(d => d.name)));
    setSelectedView('all');
  };

  const collapseAll = () => {
    setExpandedDepts(new Set());
    setSelectedView('collapsed');
  };

  // Calculate stats
  const totalCapacity = allUsers.length * 8 * 10; // 10 working days
  const totalAllocated = allUsers.reduce((sum, user) => {
    const userData = generateUserCapacityData(user);
    return sum + userData.reduce((s, day) => s + day.hours, 0);
  }, 0);
  const avgUtilization = Math.round((totalAllocated / totalCapacity) * 100);
  
  const overallocatedCount = allUsers.filter(u => u.utilization > 100).length;
  const optimalCount = allUsers.filter(u => u.utilization >= 50 && u.utilization <= 100).length;
  const underutilizedCount = allUsers.filter(u => u.utilization < 50).length;

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        {/* Logo/Header */}
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Resource Planner</h2>
          <p className="text-sm text-gray-500 mt-1">Workforce Management</p>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          <div className="space-y-1">
            <a
              href="#"
              className="flex items-center gap-3 px-3 py-2 rounded-lg bg-blue-50 text-blue-700 font-medium"
            >
              <Grid3x3 className="h-5 w-5" />
              <span>Heat Map</span>
            </a>
            <a
              href="#"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <BarChart3 className="h-5 w-5" />
              <span>Resource Allocation</span>
            </a>
            <a
              href="#"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <CalendarIcon className="h-5 w-5" />
              <span>Calendar View</span>
            </a>
            <a
              href="#"
              className="flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <UsersIcon className="h-5 w-5" />
              <span>Team Directory</span>
            </a>
          </div>

          <div className="mt-8">
            <h3 className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              Quick Filters
            </h3>
            <div className="space-y-1">
              {departments.map(dept => (
                <button
                  key={dept.name}
                  className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors text-left"
                >
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ background: dept.color }}
                  />
                  <span className="text-sm">{dept.name}</span>
                  <span className="ml-auto text-xs text-gray-500">{dept.count}</span>
                </button>
              ))}
            </div>
          </div>
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors">
            <Settings className="h-5 w-5" />
            <span>Settings</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-8 overflow-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold mb-2">Heat Map - Enterprise Scale</h1>
          <p className="text-gray-600">200 team members • 5 departments • 2 week view</p>
        </div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Team Members</p>
                <p className="text-2xl font-semibold mt-1">{allUsers.length}</p>
              </div>
              <UsersIcon className="h-8 w-8 text-blue-500 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Utilization</p>
                <p className="text-2xl font-semibold mt-1">{avgUtilization}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-500 opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-amber-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Optimal Utilization</p>
                <p className="text-2xl font-semibold mt-1">{optimalCount}</p>
                <p className="text-xs text-gray-500">50-100% capacity</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Overallocated</p>
                <p className="text-2xl font-semibold mt-1">{overallocatedCount}</p>
                <p className="text-xs text-gray-500">&gt;100% capacity</p>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow mb-6 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex gap-2">
                <Button
                  variant={selectedView === 'collapsed' ? 'default' : 'outline'}
                  size="sm"
                  onClick={collapseAll}
                >
                  Collapsed View
                </Button>
                <Button
                  variant={selectedView === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={expandAll}
                >
                  Expand All
                </Button>
              </div>
              
              <div className="h-6 w-px bg-gray-300" />
              
              <div className="flex items-center gap-2 text-sm">
                <span className="text-gray-600">Legend:</span>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 rounded" style={{ background: '#D1FAE5' }} />
                  <span className="text-xs text-gray-600">Available</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 rounded" style={{ background: '#FEF3C7' }} />
                  <span className="text-xs text-gray-600">Optimal</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-4 h-4 rounded" style={{ background: '#FEE2E2' }} />
                  <span className="text-xs text-gray-600">Over</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </Button>
              <Button variant="outline" size="sm" className="gap-2">
                <Download className="h-4 w-4" />
                Export
              </Button>
            </div>
          </div>
        </div>

        {/* Heat Map Grid */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="overflow-auto" style={{ maxHeight: '800px' }}>
            <div className="min-w-max">
              {/* Header Row */}
              <div className="sticky top-0 z-20 bg-gray-50 border-b-2 border-gray-300 flex">
                <div className="sticky left-0 z-30 bg-gray-50 border-r border-gray-300 p-3" style={{ width: '280px' }}>
                  <div className="font-semibold">Team Member</div>
                </div>
                <div className="flex">
                  {weekDays.map(({ day, date }, idx) => {
                    const isWeekend = weekDays[idx].fullDate.getDay() === 0 || weekDays[idx].fullDate.getDay() === 6;
                    return (
                      <div
                        key={idx}
                        className={`min-w-[80px] p-2 text-center border-l border-gray-200 ${isWeekend ? 'bg-gray-100' : ''}`}
                      >
                        <div className="text-xs font-semibold">{day}</div>
                        <div className="text-xs text-gray-500">{date}</div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Department Rows */}
              {departments.map((dept) => {
                const deptUsers = allUsers.filter(u => u.department === dept.name);
                const isExpanded = expandedDepts.has(dept.name);
                const currentPage = deptPages[dept.name] || 0;
                const displayedUsers = isExpanded 
                  ? deptUsers.slice(currentPage * pageSize, (currentPage + 1) * pageSize)
                  : [];
                const hasMorePages = deptUsers.length > (currentPage + 1) * pageSize;
                const hasPrevPages = currentPage > 0;

                return (
                  <div key={dept.name} className="border-b-2 border-gray-200">
                    {/* Department Header */}
                    <div
                      className="flex border-b border-gray-300 cursor-pointer hover:bg-gray-50 transition-colors"
                      onClick={() => toggleDepartment(dept.name)}
                    >
                      <div
                        className="sticky left-0 z-10 border-r border-gray-300 p-3 flex items-center gap-3"
                        style={{ width: '280px', background: 'white' }}
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4 text-gray-700" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-500" />
                        )}
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ background: dept.color }}
                        />
                        <div className="flex-1">
                          <div className="font-semibold text-sm">{dept.name}</div>
                          <div className="text-xs text-gray-600">
                            {dept.count} members • {dept.avgUtil}% avg
                          </div>
                        </div>
                        {!isExpanded && (
                          <Badge variant="secondary" className="text-xs">
                            {dept.count}
                          </Badge>
                        )}
                      </div>

                      {/* Department Aggregated Heat Map */}
                      {!isExpanded && (
                        <div className="flex">
                          {weekDays.map((day, idx) => {
                            const isWeekend = day.fullDate.getDay() === 0 || day.fullDate.getDay() === 6;
                            
                            if (isWeekend) {
                              return (
                                <div
                                  key={idx}
                                  className="min-w-[80px] border-l border-gray-200 bg-gray-100"
                                  style={{ height: '52px' }}
                                />
                              );
                            }

                            // Aggregate department capacity
                            const totalDeptCapacity = dept.count * 8;
                            const variance = (Math.random() - 0.5) * 0.2;
                            const utilPercent = dept.avgUtil + (variance * dept.avgUtil);
                            const totalDeptHours = Math.round((utilPercent / 100) * totalDeptCapacity);
                            const percent = Math.round((totalDeptHours / totalDeptCapacity) * 100);

                            return (
                              <div
                                key={idx}
                                className="min-w-[80px] border-l border-gray-200 p-1.5 flex flex-col items-center justify-center"
                                style={{
                                  height: '52px',
                                  background:
                                    percent > 100
                                      ? '#FEE2E2'
                                      : percent > 75
                                      ? '#FEF3C7'
                                      : percent > 50
                                      ? '#D1FAE5'
                                      : '#F3F4F6'
                                }}
                              >
                                <div className="text-xs font-semibold">{totalDeptHours}h</div>
                                <div className="text-xs text-gray-600">{percent}%</div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Expanded User Rows */}
                    {isExpanded && (
                      <>
                        {displayedUsers.map((user) => {
                          const capacityData = generateUserCapacityData(user);
                          
                          return (
                            <div key={user.id} className="flex border-b border-gray-200 hover:bg-gray-50">
                              <div
                                className="sticky left-0 z-10 bg-white border-r border-gray-200 p-3 flex items-center gap-3"
                                style={{ width: '280px' }}
                              >
                                <div className="w-6" /> {/* Indent */}
                                <Avatar className="h-8 w-8">
                                  <AvatarImage src={user.avatar} />
                                  <AvatarFallback>
                                    {user.name.split(' ').map((n: string) => n[0]).join('')}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium truncate">{user.name}</div>
                                  <div className="text-xs text-gray-600 truncate">{user.role}</div>
                                </div>
                                <span
                                  className="text-xs font-medium px-2 py-1 rounded shrink-0"
                                  style={{
                                    background:
                                      user.utilization > 100
                                        ? '#FEE2E2'
                                        : user.utilization > 80
                                        ? '#FEF3C7'
                                        : user.utilization > 50
                                        ? '#D1FAE5'
                                        : '#F3F4F6',
                                    color:
                                      user.utilization > 100
                                        ? '#DC2626'
                                        : user.utilization > 80
                                        ? '#D97706'
                                        : user.utilization > 50
                                        ? '#059669'
                                        : '#6B7280'
                                  }}
                                >
                                  {user.utilization}%
                                </span>
                              </div>

                              {/* Capacity Cells */}
                              <div className="flex">
                                {capacityData.map((day, idx) => {
                                  const isWeekend = weekDays[idx].fullDate.getDay() === 0 || weekDays[idx].fullDate.getDay() === 6;
                                  
                                  if (isWeekend) {
                                    return (
                                      <div
                                        key={idx}
                                        className="min-w-[80px] border-l border-gray-200 bg-gray-100 flex items-center justify-center"
                                        style={{ height: '56px' }}
                                      >
                                        <span className="text-xs text-gray-400">-</span>
                                      </div>
                                    );
                                  }

                                  return (
                                    <div
                                      key={idx}
                                      className="min-w-[80px] border-l border-gray-200 p-1.5 relative transition-all hover:ring-2 hover:ring-blue-400 hover:z-10 cursor-pointer"
                                      style={{
                                        height: '72px',
                                        background:
                                          day.percent > 100
                                            ? '#FEE2E2'
                                            : day.percent > 75
                                            ? '#FEF3C7'
                                            : day.percent > 50
                                            ? '#D1FAE5'
                                            : day.percent > 0
                                            ? '#F3F4F6'
                                            : 'white'
                                      }}
                                      title={`${user.name} - ${weekDays[idx].date}: ${day.hours}h / ${day.capacity}h (${day.percent}%)\n${day.projectBars.map(b => `${b.project}: ${b.hours}h`).join('\n')}`}
                                    >
                                      {/* Alert Icon for overallocated */}
                                      {day.percent > 100 && (
                                        <div className="absolute top-1 right-1">
                                          <AlertCircle className="h-3 w-3 text-red-600" />
                                        </div>
                                      )}
                                      
                                      {/* Hours / Capacity */}
                                      <div className="text-xs font-semibold text-center mb-0.5">
                                        {day.hours}h / {day.capacity}h
                                      </div>
                                      
                                      {/* Stacked Project Bars */}
                                      <div className="space-y-0.5 px-1">
                                        {day.projectBars.slice(0, 3).map((bar, bidx) => (
                                          <div
                                            key={bidx}
                                            className="rounded-sm"
                                            style={{
                                              height: '6px',
                                              width: `${Math.min(bar.widthPercent, 100)}%`,
                                              background: bar.color
                                            }}
                                            title={`${bar.project}: ${bar.hours}h`}
                                          />
                                        ))}
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            </div>
                          );
                        })}

                        {/* Pagination Controls */}
                        {(hasMorePages || hasPrevPages) && (
                          <div className="flex items-center justify-between px-6 py-2 bg-blue-50 border-b border-blue-200">
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={!hasPrevPages}
                              onClick={() => {
                                setDeptPages(prev => ({
                                  ...prev,
                                  [dept.name]: currentPage - 1
                                }));
                              }}
                            >
                              Previous {pageSize}
                            </Button>
                            
                            <span className="text-xs text-gray-600">
                              Showing {currentPage * pageSize + 1}-{Math.min((currentPage + 1) * pageSize, deptUsers.length)} of {deptUsers.length}
                            </span>
                            
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={!hasMorePages}
                              onClick={() => {
                                setDeptPages(prev => ({
                                  ...prev,
                                  [dept.name]: currentPage + 1
                                }));
                              }}
                            >
                              Next {pageSize}
                            </Button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-50 border-t-2 border-gray-300 px-6 py-3 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              {expandedDepts.size === 0 && `5 departments collapsed • ${allUsers.length} team members`}
              {expandedDepts.size > 0 && expandedDepts.size < departments.length && (
                `${expandedDepts.size} department${expandedDepts.size > 1 ? 's' : ''} expanded • ${Array.from(expandedDepts).map(d => allUsers.filter(u => u.department === d).length).reduce((a, b) => a + b, 0)} members visible`
              )}
              {expandedDepts.size === departments.length && `All departments expanded • ${allUsers.length} team members`}
            </div>
            <div className="flex gap-4 text-xs text-gray-500">
              <span>Performance: Virtualized rendering</span>
              <span>•</span>
              <span>Load time: ~150ms</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
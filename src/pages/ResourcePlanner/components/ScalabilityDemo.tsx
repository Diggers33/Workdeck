import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Search, SlidersHorizontal, Download, Settings, Calendar, ChevronLeft, ChevronsRight, X, Star, HelpCircle } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './ui/tabs';

// Mock data generation for 200 users
const departments = [
  { name: 'Design', count: 28, avgUtil: 58 },
  { name: 'Engineering', count: 82, avgUtil: 72 },
  { name: 'Product', count: 24, avgUtil: 45 },
  { name: 'Marketing', count: 38, avgUtil: 68 },
  { name: 'Operations', count: 28, avgUtil: 52 }
];

const roles = {
  Design: ['Senior Designer', 'Lead Designer', 'UX Designer', 'UI Designer', 'Product Designer'],
  Engineering: ['Senior Developer', 'Lead Developer', 'Developer', 'Tech Lead', 'Staff Engineer'],
  Product: ['Product Manager', 'Senior PM', 'Lead PM', 'Product Owner', 'Associate PM'],
  Marketing: ['Marketing Manager', 'Content Manager', 'SEO Specialist', 'Social Media Manager', 'Brand Manager'],
  Operations: ['Operations Manager', 'Program Manager', 'Project Manager', 'Scrum Master', 'Delivery Manager']
};

const firstNames = ['Sarah', 'Marcus', 'Emma', 'James', 'Lisa', 'David', 'Jennifer', 'Michael', 'Jessica', 'Robert', 'Emily', 'Christopher', 'Michelle', 'Daniel', 'Amanda', 'Kevin', 'Laura', 'Ryan', 'Nicole', 'Brandon', 'Sophia', 'Eric', 'Olivia', 'Steven', 'Isabella', 'Timothy', 'Mia', 'Matthew', 'Charlotte', 'Andrew'];
const lastNames = ['Mitchell', 'Chen', 'Rodriguez', 'Wilson', 'Anderson', 'Kim', 'Lee', 'Garcia', 'Davis', 'Martin', 'Taylor', 'White', 'Harris', 'Clark', 'Lewis', 'Walker', 'Hall', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Green', 'Baker', 'Adams', 'Nelson', 'Carter', 'Roberts', 'Turner', 'Phillips'];

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

// Week schedule for department summary
const weekDays = [
  { day: 'Mon', date: 'Nov 17' },
  { day: 'Tue', date: 'Nov 18' },
  { day: 'Wed', date: 'Nov 19' },
  { day: 'Thu', date: 'Nov 20' },
  { day: 'Fri', date: 'Nov 21' },
  { day: 'Sat', date: 'Nov 22' },
  { day: 'Sun', date: 'Nov 23' }
];

export function ScalabilityDemo() {
  const [activeState, setActiveState] = useState<'collapsed' | 'expanded' | 'filtered'>('collapsed');

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-2">Resource Planner - Scalability Demo</h1>
        <p className="text-gray-600">200 team members across 5 departments</p>
      </div>

      {/* Debug Info */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold mb-2">Debug Information:</h3>
        <div className="grid grid-cols-5 gap-4 text-sm">
          <div>
            <div className="text-gray-600">Total Users:</div>
            <div className="text-lg font-semibold">{allUsers.length}</div>
          </div>
          {departments.map(dept => {
            const count = allUsers.filter(u => u.department === dept.name).length;
            return (
              <div key={dept.name}>
                <div className="text-gray-600">{dept.name}:</div>
                <div className="text-lg font-semibold">{count} / {dept.count}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* State Selector */}
      <Tabs value={activeState} onValueChange={(v) => setActiveState(v as any)} className="mb-6">
        <TabsList className="bg-white border border-gray-200">
          <TabsTrigger value="collapsed">State 1: All Collapsed</TabsTrigger>
          <TabsTrigger value="expanded">State 2: One Expanded</TabsTrigger>
          <TabsTrigger value="filtered">State 3: Filtered</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Render appropriate state */}
      {activeState === 'collapsed' && <CollapsedView />}
      {activeState === 'expanded' && <ExpandedView />}
      {activeState === 'filtered' && <FilteredView />}
    </div>
  );
}

// STATE 1: All Collapsed
function CollapsedView() {
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: '900px' }}>
      <div className="flex flex-col h-full">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Resource Planner</h2>
            <p className="text-sm text-gray-600">Workforce capacity management and billable optimization</p>
          </div>
          
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search people, projects, or tasks..."
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span>Showing 5 departments</span>
              <span>•</span>
              <span>200 team members</span>
              <span>•</span>
              <span className="font-medium text-blue-600">65% avg utilization</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </Button>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-auto">
          <div className="min-w-max">
            {/* Header Row */}
            <div className="sticky top-0 z-20 bg-gray-50 border-b-2 border-gray-300 flex">
              <div className="sticky left-0 z-30 bg-gray-50 border-r border-gray-300 p-3" style={{ width: '300px' }}>
                <div className="font-medium text-sm">Department</div>
              </div>
              <div className="flex">
                {weekDays.map(({ day, date }) => (
                  <div key={day} className="min-w-[140px] p-2 text-center border-l border-gray-200">
                    <div className="text-sm font-semibold">{day}</div>
                    <div className="text-xs text-gray-500">{date}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Department Rows */}
            {departments.map((dept) => (
              <DepartmentRow key={dept.name} department={dept} />
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-gray-200 px-6 py-3 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            5 departments • 200 team members
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">Expand All</Button>
            <Button variant="outline" size="sm">Collapse All</Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function DepartmentRow({ department }: { department: any }) {
  const { name, count, avgUtil } = department;
  
  // Generate realistic department aggregated data
  const dailyData = weekDays.map((_, idx) => {
    const variance = (Math.random() - 0.5) * 0.2;
    const utilPercent = avgUtil + (variance * avgUtil);
    const capacity = count * 8; // 8 hours per person
    const hours = Math.round((utilPercent / 100) * capacity);
    
    return {
      hours,
      capacity,
      percent: Math.round(utilPercent),
      projects: [
        { color: '#3B82F6', width: 40 + Math.random() * 30 },
        { color: '#8B5CF6', width: 30 + Math.random() * 25 },
        { color: '#F97316', width: 15 + Math.random() * 20 }
      ]
    };
  });
  
  return (
    <div className="flex border-b border-gray-200 hover:bg-gray-50 transition-colors cursor-pointer">
      {/* Department Info */}
      <div className="sticky left-0 z-10 bg-white hover:bg-gray-50 border-r border-gray-200 p-4" style={{ width: '300px', height: '64px' }}>
        <div className="flex items-center gap-3">
          <ChevronRight className="h-4 w-4 text-gray-500 shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2">
              <span className="font-semibold text-sm">{name}</span>
              <span className="text-sm text-gray-500">({count} people)</span>
            </div>
            <div className="flex items-center gap-3 mt-1">
              <div className="flex-1 max-w-[120px]">
                <div className="rounded-full overflow-hidden" style={{ height: '6px', background: '#E5E7EB' }}>
                  <div
                    className="h-full"
                    style={{
                      width: `${Math.min(avgUtil, 100)}%`,
                      background: avgUtil > 80 ? '#F59E0B' : avgUtil > 50 ? '#10B981' : '#3B82F6'
                    }}
                  />
                </div>
              </div>
              <span className="text-sm font-medium" style={{
                color: avgUtil > 80 ? '#D97706' : avgUtil > 50 ? '#059669' : '#3B82F6'
              }}>
                {avgUtil}% avg
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Daily Cells */}
      <div className="flex">
        {dailyData.map((day, idx) => (
          <div
            key={idx}
            className="border-l border-gray-200 p-2"
            style={{
              width: '140px',
              height: '64px',
              background: day.percent > 100 ? '#FEE2E2' : day.percent > 75 ? '#FEF3C7' : day.percent > 50 ? '#D1FAE5' : 'white'
            }}
          >
            <div className="text-xs font-medium mb-1">
              {day.hours}h / {day.capacity}h
            </div>
            <div className="text-xs text-gray-600 mb-1.5">{day.percent}%</div>
            <div className="space-y-0.5">
              {day.projects.map((project, pidx) => (
                <div
                  key={pidx}
                  className="rounded"
                  style={{
                    height: '4px',
                    width: `${project.width}%`,
                    background: project.color
                  }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// STATE 2: One Department Expanded
function ExpandedView() {
  const [currentPage, setCurrentPage] = useState(0);
  const engineeringUsers = allUsers.filter(u => u.department === 'Engineering');
  const pageSize = 20;
  const displayedUsers = engineeringUsers.slice(currentPage * pageSize, (currentPage + 1) * pageSize);
  
  console.log('Total users:', allUsers.length);
  console.log('Engineering users:', engineeringUsers.length);
  console.log('Displayed users:', displayedUsers.length);
  
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: '900px' }}>
      <div className="flex flex-col h-full">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Resource Planner</h2>
            <p className="text-sm text-gray-600">Workforce capacity management and billable optimization</p>
          </div>
          
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search people, projects, or tasks..."
                className="pl-10"
              />
            </div>
            
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <span>Showing 1 department expanded</span>
              <span>•</span>
              <span>{engineeringUsers.length} Engineering members</span>
              <span>•</span>
              <span>{allUsers.length} total</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2">
                <SlidersHorizontal className="h-4 w-4" />
                Filters
              </Button>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="flex-1 overflow-auto">
          <div className="min-w-max">
            {/* Header Row */}
            <div className="sticky top-0 z-20 bg-gray-50 border-b-2 border-gray-300 flex">
              <div className="sticky left-0 z-30 bg-gray-50 border-r border-gray-300 p-3" style={{ width: '260px' }}>
                <div className="font-medium text-sm">Team Member</div>
              </div>
              <div className="flex">
                {weekDays.map(({ day, date }) => (
                  <div key={day} className="min-w-[120px] p-2 text-center border-l border-gray-200">
                    <div className="text-sm font-semibold">{day}</div>
                    <div className="text-xs text-gray-500">{date}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Collapsed Departments */}
            {departments.filter(d => d.name !== 'Engineering').map((dept) => (
              <div key={dept.name} className="flex border-b border-gray-200 hover:bg-gray-50">
                <div className="sticky left-0 z-10 bg-white hover:bg-gray-50 border-r border-gray-200 p-3" style={{ width: '260px' }}>
                  <div className="flex items-center gap-2">
                    <ChevronRight className="h-4 w-4 text-gray-500" />
                    <span className="font-medium text-sm">{dept.name} ({dept.count} people)</span>
                    <span className="ml-auto text-sm font-medium text-gray-600">{dept.avgUtil}% avg</span>
                  </div>
                </div>
                <div className="flex">
                  {weekDays.map((_, idx) => (
                    <div key={idx} className="min-w-[120px] border-l border-gray-200" style={{ height: '48px' }} />
                  ))}
                </div>
              </div>
            ))}

            {/* Expanded Engineering Department */}
            <div className="border-b-2 border-blue-200 bg-blue-50">
              <div className="flex border-b border-gray-300">
                <div className="sticky left-0 z-10 bg-blue-50 border-r border-gray-300 p-3" style={{ width: '260px' }}>
                  <div className="flex items-center gap-2">
                    <ChevronDown className="h-4 w-4 text-gray-700" />
                    <span className="font-semibold text-sm">Engineering ({engineeringUsers.length} people)</span>
                    <span className="ml-auto text-sm font-medium text-blue-600">72% avg</span>
                  </div>
                </div>
                <div className="flex">
                  {weekDays.map((_, idx) => (
                    <div key={idx} className="min-w-[120px] border-l border-gray-200" />
                  ))}
                </div>
              </div>

              {/* Pagination Info */}
              <div className="px-6 py-2 bg-blue-100 border-b border-blue-200">
                <div className="text-xs text-gray-600">
                  Showing {currentPage * pageSize + 1}-{Math.min((currentPage + 1) * pageSize, engineeringUsers.length)} of {engineeringUsers.length} members
                </div>
              </div>

              {/* User Rows */}
              {displayedUsers.map((user) => (
                <UserRowExpanded key={user.id} user={user} />
              ))}

              {/* Pagination Controls */}
              <div className="flex items-center justify-between px-6 py-3 bg-white border-t border-gray-200">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                >
                  Previous 20
                </Button>
                
                <div className="text-sm text-gray-600">
                  Page {currentPage + 1} of {Math.ceil(engineeringUsers.length / pageSize)}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(Math.ceil(engineeringUsers.length / pageSize) - 1, p + 1))}
                  disabled={(currentPage + 1) * pageSize >= engineeringUsers.length}
                >
                  Next 20
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Performance Indicators */}
        <div className="bg-white border-t border-gray-200 px-6 py-3 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {displayedUsers.length} of {engineeringUsers.length} Engineering members • Total: {allUsers.length} team members
          </div>
          <div className="flex gap-4 text-xs text-gray-500">
            <span>Loaded: {displayedUsers.length}/{allUsers.length} members</span>
            <span>•</span>
            <span>Response: 124ms</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function UserRowExpanded({ user }: { user: any }) {
  const weekData = weekDays.map(() => {
    const variance = (Math.random() - 0.5) * 0.3;
    const dailyUtil = user.utilization + (variance * user.utilization);
    const hours = Math.round((dailyUtil / 100) * 8);
    
    return {
      hours,
      capacity: 8,
      percent: Math.round(dailyUtil),
      projects: [
        { color: '#3B82F6', width: 60 + Math.random() * 20 },
        { color: '#8B5CF6', width: 40 + Math.random() * 20 }
      ]
    };
  });

  return (
    <div className="flex border-b border-gray-200 bg-white hover:bg-gray-50">
      <div className="sticky left-0 z-10 bg-white hover:bg-gray-50 border-r border-gray-200 p-3 flex items-center gap-3" style={{ width: '260px' }}>
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.avatar} />
          <AvatarFallback>{user.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{user.name}</div>
          <div className="text-xs text-gray-600 truncate">{user.role}</div>
        </div>
        <span
          className="inline-flex items-center justify-center rounded text-xs font-medium shrink-0"
          style={{
            width: '42px',
            height: '24px',
            background: user.utilization > 80 ? '#FEE2E2' : user.utilization > 50 ? '#FEF3C7' : '#D1FAE5',
            color: user.utilization > 80 ? '#DC2626' : user.utilization > 50 ? '#D97706' : '#059669'
          }}
        >
          {user.utilization}%
        </span>
      </div>

      <div className="flex">
        {weekData.map((day, idx) => (
          <div
            key={idx}
            className="border-l border-gray-200 p-2"
            style={{
              width: '120px',
              height: '60px',
              background: day.percent > 100 ? '#FEE2E2' : day.percent > 75 ? '#FEF3C7' : day.percent > 50 ? '#D1FAE5' : 'white'
            }}
          >
            {day.hours > 0 ? (
              <>
                <div className="text-xs font-medium mb-1">
                  {day.hours}h / {day.capacity}h
                </div>
                <div className="space-y-0.5">
                  {day.projects.map((project, pidx) => (
                    <div
                      key={pidx}
                      className="rounded"
                      style={{
                        height: '8px',
                        width: `${project.width}%`,
                        background: project.color
                      }}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <span className="text-gray-400">-</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// STATE 3: Filtered View
function FilteredView() {
  const [showFilterPanel, setShowFilterPanel] = useState(true);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  
  // Filter users - seniors with >50% utilization from Engineering and Design
  const filteredUsers = allUsers.filter(u => 
    (u.department === 'Engineering' || u.department === 'Design') &&
    u.utilization > 50 &&
    (u.role.includes('Senior') || u.role.includes('Lead') || u.role.includes('Tech Lead'))
  );
  
  const engineeringFiltered = filteredUsers.filter(u => u.department === 'Engineering');
  const designFiltered = filteredUsers.filter(u => u.department === 'Design');
  
  const toggleUser = (userId: string) => {
    setSelectedUsers(prev => {
      const next = new Set(prev);
      if (next.has(userId)) {
        next.delete(userId);
      } else {
        next.add(userId);
      }
      return next;
    });
  };
  
  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: '900px' }}>
      <div className="flex flex-col h-full">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="mb-4">
            <h2 className="text-xl font-semibold">Resource Planner</h2>
            <p className="text-sm text-gray-600">Workforce capacity management and billable optimization</p>
          </div>
          
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                value="senior"
                readOnly
                className="pl-10 pr-8"
              />
              <button className="absolute right-3 top-1/2 -translate-y-1/2">
                <X className="h-4 w-4 text-gray-400 hover:text-gray-600" />
              </button>
            </div>
            
            <div className="flex items-center gap-3 text-sm">
              <span className="font-medium text-blue-600">Showing {filteredUsers.length} results</span>
              <span className="text-gray-400">(filtered from 200)</span>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="gap-2" onClick={() => setShowFilterPanel(!showFilterPanel)}>
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                <Badge className="ml-1">3</Badge>
              </Button>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                <Download className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" className="h-9 w-9 p-0">
                <HelpCircle className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Active Filters */}
        <div className="bg-blue-50 border-b border-blue-200 px-6 py-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-700 font-medium">Active filters:</span>
            
            <Badge variant="secondary" className="gap-1.5 pr-1 bg-blue-100 hover:bg-blue-200">
              Search: "senior"
              <X className="h-3 w-3" />
            </Badge>
            
            <Badge variant="secondary" className="gap-1.5 pr-1 bg-blue-100 hover:bg-blue-200">
              Utilization: &gt;50%
              <X className="h-3 w-3" />
            </Badge>
            
            <Badge variant="secondary" className="gap-1.5 pr-1 bg-blue-100 hover:bg-blue-200">
              Departments: Engineering, Design
              <X className="h-3 w-3" />
            </Badge>
            
            <Button variant="link" size="sm" className="ml-auto text-sm h-auto p-0">
              Clear all filters
            </Button>
          </div>
        </div>

        {/* Bulk Actions (when users selected) */}
        {selectedUsers.size > 0 && (
          <div className="bg-blue-600 text-white px-6 py-3 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <span className="font-medium">{selectedUsers.size} members selected</span>
              <Button variant="secondary" size="sm">Assign Project</Button>
              <Button variant="secondary" size="sm">Edit Allocation</Button>
              <Button variant="secondary" size="sm">Export</Button>
            </div>
            <Button variant="ghost" size="sm" className="text-white hover:bg-blue-700" onClick={() => setSelectedUsers(new Set())}>
              Clear Selection
            </Button>
          </div>
        )}

        <div className="flex flex-1 overflow-hidden">
          {/* Main Grid */}
          <div className="flex-1 overflow-auto">
            <div className="min-w-max">
              {/* Header Row */}
              <div className="sticky top-0 z-20 bg-gray-50 border-b-2 border-gray-300 flex">
                <div className="sticky left-0 z-30 bg-gray-50 border-r border-gray-300 p-3 flex items-center gap-3" style={{ width: '280px' }}>
                  <Checkbox
                    checked={selectedUsers.size === filteredUsers.length}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedUsers(new Set(filteredUsers.map(u => u.id)));
                      } else {
                        setSelectedUsers(new Set());
                      }
                    }}
                  />
                  <div className="font-medium text-sm">Team Member</div>
                </div>
                <div className="flex">
                  {weekDays.map(({ day, date }) => (
                    <div key={day} className="min-w-[120px] p-2 text-center border-l border-gray-200">
                      <div className="text-sm font-semibold">{day}</div>
                      <div className="text-xs text-gray-500">{date}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Search Results Header */}
              <div className="bg-gray-100 border-b border-gray-300 px-6 py-2">
                <div className="text-sm font-semibold text-gray-700">
                  Search Results ({filteredUsers.length} members)
                </div>
              </div>

              {/* Engineering Section */}
              <div className="border-b border-gray-300">
                <div className="flex bg-blue-50 border-b border-blue-200">
                  <div className="sticky left-0 z-10 bg-blue-50 border-r border-gray-200 p-3" style={{ width: '280px' }}>
                    <div className="flex items-center gap-2 pl-8">
                      <ChevronDown className="h-4 w-4 text-gray-700" />
                      <span className="font-semibold text-sm">Engineering ({engineeringFiltered.length})</span>
                    </div>
                  </div>
                  <div className="flex">
                    {weekDays.map((_, idx) => (
                      <div key={idx} className="min-w-[120px] border-l border-gray-200" />
                    ))}
                  </div>
                </div>
                
                {engineeringFiltered.map((user) => (
                  <UserRowFiltered
                    key={user.id}
                    user={user}
                    isSelected={selectedUsers.has(user.id)}
                    onToggle={() => toggleUser(user.id)}
                    highlightText="senior"
                  />
                ))}
              </div>

              {/* Design Section */}
              <div className="border-b border-gray-300">
                <div className="flex bg-purple-50 border-b border-purple-200">
                  <div className="sticky left-0 z-10 bg-purple-50 border-r border-gray-200 p-3" style={{ width: '280px' }}>
                    <div className="flex items-center gap-2 pl-8">
                      <ChevronDown className="h-4 w-4 text-gray-700" />
                      <span className="font-semibold text-sm">Design ({designFiltered.length})</span>
                    </div>
                  </div>
                  <div className="flex">
                    {weekDays.map((_, idx) => (
                      <div key={idx} className="min-w-[120px] border-l border-gray-200" />
                    ))}
                  </div>
                </div>
                
                {designFiltered.map((user) => (
                  <UserRowFiltered
                    key={user.id}
                    user={user}
                    isSelected={selectedUsers.has(user.id)}
                    onToggle={() => toggleUser(user.id)}
                    highlightText="senior"
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Filter Panel Sidebar */}
          {showFilterPanel && (
            <div className="w-80 bg-white border-l border-gray-200 overflow-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold">Filters</h3>
                  <button onClick={() => setShowFilterPanel(false)}>
                    <X className="h-4 w-4 text-gray-500" />
                  </button>
                </div>

                {/* Department Filter */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium mb-3">Department</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <Checkbox checked />
                      <span className="text-sm">Engineering (82)</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <Checkbox checked />
                      <span className="text-sm">Design (28)</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <Checkbox />
                      <span className="text-sm text-gray-400">Product (24)</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <Checkbox />
                      <span className="text-sm text-gray-400">Marketing (38)</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <Checkbox />
                      <span className="text-sm text-gray-400">Operations (28)</span>
                    </label>
                  </div>
                </div>

                {/* Utilization Filter */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium mb-3">Utilization</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input type="radio" name="util" />
                      <span className="text-sm text-gray-400">0-25% (underutilized)</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="util" />
                      <span className="text-sm text-gray-400">26-50% (low)</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="util" defaultChecked />
                      <span className="text-sm font-medium">51-75% (optimal)</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="util" />
                      <span className="text-sm text-gray-400">76-100% (high)</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="radio" name="util" />
                      <span className="text-sm text-gray-400">&gt;100% (overallocated)</span>
                    </label>
                  </div>
                </div>

                {/* Projects Filter */}
                <div className="mb-6">
                  <h4 className="text-sm font-medium mb-3">Project</h4>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <Checkbox />
                      <span className="text-sm">E-Commerce Platform (45)</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <Checkbox />
                      <span className="text-sm">Mobile App Redesign (32)</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <Checkbox />
                      <span className="text-sm">Internal Tools (28)</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <Checkbox />
                      <span className="text-sm">Client Projects (68)</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <Checkbox />
                      <span className="text-sm">R&D (12)</span>
                    </label>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <Button className="flex-1">Apply Filters</Button>
                  <Button variant="outline" className="flex-1">Reset</Button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-white border-t border-gray-200 px-6 py-3 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Showing {filteredUsers.length} of 200 team members
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <Download className="h-4 w-4" />
              Export Results
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function UserRowFiltered({ user, isSelected, onToggle, highlightText }: any) {
  const isSenior = user.role.toLowerCase().includes(highlightText.toLowerCase());
  
  const weekData = weekDays.map(() => {
    const variance = (Math.random() - 0.5) * 0.3;
    const dailyUtil = user.utilization + (variance * user.utilization);
    const hours = Math.round((dailyUtil / 100) * 8);
    
    return {
      hours,
      capacity: 8,
      percent: Math.round(dailyUtil),
      projects: [
        { color: '#3B82F6', width: 60 + Math.random() * 20 },
        { color: '#8B5CF6', width: 40 + Math.random() * 20 }
      ]
    };
  });

  return (
    <div className={`flex border-b border-gray-200 ${isSelected ? 'bg-blue-50' : 'bg-white hover:bg-gray-50'}`}>
      <div className={`sticky left-0 z-10 border-r border-gray-200 p-3 flex items-center gap-3 ${isSelected ? 'bg-blue-50' : 'bg-white hover:bg-gray-50'}`} style={{ width: '280px' }}>
        <Checkbox
          checked={isSelected}
          onCheckedChange={onToggle}
        />
        <Avatar className="h-8 w-8">
          <AvatarImage src={user.avatar} />
          <AvatarFallback>{user.name.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1">
            <div className="text-sm font-medium truncate">{user.name}</div>
            {isSenior && <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 shrink-0" />}
          </div>
          <div className="text-xs text-gray-600 truncate">
            {isSenior ? (
              <>
                <span className="bg-yellow-100 px-1 rounded">{highlightText}</span>
                {user.role.replace(new RegExp(highlightText, 'gi'), '')}
              </>
            ) : (
              user.role
            )}
          </div>
        </div>
        <span
          className="inline-flex items-center justify-center rounded text-xs font-medium shrink-0"
          style={{
            width: '42px',
            height: '24px',
            background: user.utilization > 80 ? '#FEE2E2' : user.utilization > 50 ? '#FEF3C7' : '#D1FAE5',
            color: user.utilization > 80 ? '#DC2626' : user.utilization > 50 ? '#D97706' : '#059669'
          }}
        >
          {user.utilization}%
        </span>
      </div>

      <div className="flex">
        {weekData.map((day, idx) => (
          <div
            key={idx}
            className="border-l border-gray-200 p-2"
            style={{
              width: '120px',
              height: '60px',
              background: day.percent > 100 ? '#FEE2E2' : day.percent > 75 ? '#FEF3C7' : day.percent > 50 ? '#D1FAE5' : 'white'
            }}
          >
            {day.hours > 0 ? (
              <>
                <div className="text-xs font-medium mb-1">
                  {day.hours}h / {day.capacity}h
                </div>
                <div className="space-y-0.5">
                  {day.projects.map((project, pidx) => (
                    <div
                      key={pidx}
                      className="rounded"
                      style={{
                        height: '8px',
                        width: `${project.width}%`,
                        background: project.color
                      }}
                    />
                  ))}
                </div>
              </>
            ) : (
              <div className="flex items-center justify-center h-full">
                <span className="text-gray-400">-</span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
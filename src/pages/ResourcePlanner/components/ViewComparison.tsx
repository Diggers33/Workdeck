import React from 'react';
import { Calendar, ChevronLeft, ChevronRight, Search, SlidersHorizontal, Download, Settings } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { Input } from './ui/input';

export function ViewComparison() {
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold mb-2">Resource Planner View Comparison</h1>
        <p className="text-gray-600">Three different time granularities for workforce planning</p>
      </div>

      {/* Three Frames Container */}
      <div className="space-y-8">
        {/* FRAME 1: DAY VIEW */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: '900px' }}>
          <DayView />
        </div>

        {/* FRAME 2: WEEK VIEW */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: '900px' }}>
          <WeekView />
        </div>

        {/* FRAME 3: MONTH VIEW */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: '900px' }}>
          <MonthView />
        </div>
      </div>
    </div>
  );
}

// DAY VIEW - Hourly breakdown
function DayView() {
  const hours = ['8-9am', '9-10am', '10-11am', '11-12pm', '12-1pm', '1-2pm', '2-3pm', '3-4pm', '4-5pm', '5-6pm'];
  
  const users = [
    { id: 1, name: 'Emma Rodriguez', role: 'UX Designer', dept: 'Design', utilization: 25, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma' },
    { id: 2, name: 'Lisa Anderson', role: 'Senior Designer', dept: 'Design', utilization: 46, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa' },
    { id: 3, name: 'Sarah Mitchell', role: 'Senior Developer', dept: 'Engineering', utilization: 50, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
    { id: 4, name: 'Marcus Chen', role: 'Lead Developer', dept: 'Engineering', utilization: 30, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus' },
    { id: 5, name: 'James Wilson', role: 'Developer', dept: 'Engineering', utilization: 21, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James' },
    { id: 6, name: 'Alex Thompson', role: 'Developer', dept: 'Engineering', utilization: 11, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' },
    { id: 7, name: 'David Kim', role: 'Tech Lead', dept: 'Engineering', utilization: 29, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David' },
    { id: 8, name: 'Michael Brown', role: 'Developer', dept: 'Engineering', utilization: 38, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael' },
  ];

  const sarahSchedule = [
    { type: 'empty' },
    { type: 'activity', project: 'E-Commerce', activity: 'API Dev', color: '#3B82F6' },
    { type: 'activity', project: 'E-Commerce', activity: 'API Dev', color: '#3B82F6' },
    { type: 'meeting', title: 'Team Meeting' },
    { type: 'lunch' },
    { type: 'activity', project: 'Mobile', activity: 'Frontend', color: '#8B5CF6' },
    { type: 'activity', project: 'Mobile', activity: 'Frontend', color: '#8B5CF6' },
    { type: 'activity', project: 'E-Commerce', activity: 'Database', color: '#3B82F6' },
    { type: 'multiple', activities: [
      { project: 'E-Commerce', color: '#3B82F6' },
      { project: 'Review', color: '#F97316' }
    ]},
    { type: 'empty' }
  ];

  const marcusSchedule = [
    { type: 'activity', project: 'E-Commerce', activity: 'Backend', color: '#3B82F6' },
    { type: 'activity', project: 'E-Commerce', activity: 'Backend', color: '#3B82F6' },
    { type: 'meeting', title: 'Standup' },
    { type: 'activity', project: 'E-Commerce', activity: 'Testing', color: '#3B82F6' },
    { type: 'lunch' },
    { type: 'empty' },
    { type: 'activity', project: 'E-Commerce', activity: 'Code Rev', color: '#3B82F6' },
    { type: 'empty' },
    { type: 'empty' },
    { type: 'empty' }
  ];

  const getSchedule = (userId: number) => {
    if (userId === 3) return sarahSchedule;
    if (userId === 4) return marcusSchedule;
    return Array(10).fill({ type: 'empty' });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Resource Planner - Day View</h2>
          <p className="text-sm text-gray-600">Hourly breakdown for detailed planning</p>
        </div>
        
        {/* Top Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="inline-flex rounded-lg border border-gray-200" style={{ height: '36px' }}>
              <button className="px-4 rounded-l-md text-sm font-medium text-white" style={{ background: '#3B82F6' }}>
                Day
              </button>
              <button className="px-4 text-sm font-medium text-gray-600 hover:bg-gray-50">
                Week
              </button>
              <button className="px-4 rounded-r-md text-sm font-medium text-gray-600 hover:bg-gray-50">
                Month
              </button>
            </div>
            
            {/* Date Control */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-9 w-9 p-0">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2 px-3">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Monday, Nov 17, 2025</span>
              </div>
              <Button variant="outline" size="sm" className="h-9 w-9 p-0">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search..."
                className="pl-10 w-64 h-9"
              />
            </div>
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
            <div className="sticky left-0 z-30 bg-gray-50 border-r border-gray-300 p-3" style={{ width: '240px' }}>
              <div className="font-medium text-sm">Team Member</div>
            </div>
            <div className="flex">
              {hours.map(hour => (
                <div key={hour} className="border-l border-gray-200 text-center p-2" style={{ width: '100px' }}>
                  <div className="text-xs font-semibold">{hour}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Team Rows */}
          {users.map(user => {
            const schedule = getSchedule(user.id);
            return (
              <div key={user.id} className="flex border-b border-gray-200">
                {/* User Info */}
                <div className="sticky left-0 z-10 bg-white border-r border-gray-200 p-3 flex items-center gap-3" style={{ width: '240px' }}>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{user.name}</div>
                    <div className="text-xs text-gray-600 truncate">{user.role}</div>
                  </div>
                  <span
                    className="inline-flex items-center justify-center rounded text-xs font-medium shrink-0"
                    style={{
                      width: '40px',
                      height: '24px',
                      background: user.utilization > 80 ? '#FEE2E2' : user.utilization > 50 ? '#FEF3C7' : '#D1FAE5',
                      color: user.utilization > 80 ? '#DC2626' : user.utilization > 50 ? '#D97706' : '#059669'
                    }}
                  >
                    {user.utilization}%
                  </span>
                </div>

                {/* Hour Cells */}
                <div className="flex">
                  {schedule.map((cell, idx) => (
                    <HourCell key={idx} cell={cell} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 px-6 py-3">
        <div className="text-sm text-gray-600">
          Showing 1-8 of 10 team members
        </div>
      </div>
    </div>
  );
}

function HourCell({ cell }: { cell: any }) {
  if (cell.type === 'empty') {
    return (
      <div className="border-l border-gray-200 flex items-center justify-center" style={{ width: '100px', height: '60px' }}>
        <span className="text-gray-400">-</span>
      </div>
    );
  }

  if (cell.type === 'lunch') {
    return (
      <div className="border-l border-gray-200 flex items-center justify-center bg-gray-50" style={{ width: '100px', height: '60px' }}>
        <span className="text-xs text-gray-500">Lunch</span>
      </div>
    );
  }

  if (cell.type === 'meeting') {
    return (
      <div 
        className="border-l border-gray-200 flex flex-col items-center justify-center"
        style={{ 
          width: '100px', 
          height: '60px',
          background: '#FEF3C7',
          borderTop: '2px dashed #F59E0B',
          borderBottom: '2px dashed #F59E0B'
        }}
      >
        <span className="text-base">📅</span>
        <span className="text-xs font-medium mt-1">{cell.title}</span>
      </div>
    );
  }

  if (cell.type === 'multiple') {
    return (
      <div className="border-l border-gray-200 flex flex-col" style={{ width: '100px', height: '60px' }}>
        <div 
          className="flex-1 flex flex-col items-center justify-center border-b"
          style={{ background: `${cell.activities[0].color}15` }}
        >
          <div className="rounded-full" style={{ width: '10px', height: '10px', background: cell.activities[0].color }} />
          <span className="text-xs font-medium mt-1">{cell.activities[0].project}</span>
        </div>
        <div 
          className="flex-1 flex flex-col items-center justify-center"
          style={{ background: `${cell.activities[1].color}15` }}
        >
          <div className="rounded-full" style={{ width: '10px', height: '10px', background: cell.activities[1].color }} />
          <span className="text-xs font-medium mt-1">{cell.activities[1].project}</span>
        </div>
      </div>
    );
  }

  if (cell.type === 'activity') {
    return (
      <div 
        className="border-l border-gray-200 flex flex-col items-center justify-center p-1"
        style={{ 
          width: '100px', 
          height: '60px',
          background: `${cell.color}15`
        }}
      >
        <div className="rounded-full mb-1" style={{ width: '10px', height: '10px', background: cell.color }} />
        <div className="text-xs font-medium text-center leading-tight">{cell.project}</div>
        <div className="text-xs text-gray-600 text-center leading-tight">{cell.activity}</div>
      </div>
    );
  }

  return null;
}

// WEEK VIEW - Daily overview
function WeekView() {
  const days = [
    { name: 'Mon', date: 'Nov 17', isWeekend: false },
    { name: 'Tue', date: 'Nov 18', isWeekend: false },
    { name: 'Wed', date: 'Nov 19', isWeekend: false },
    { name: 'Thu', date: 'Nov 20', isWeekend: false },
    { name: 'Fri', date: 'Nov 21', isWeekend: false },
    { name: 'Sat', date: 'Nov 22', isWeekend: true },
    { name: 'Sun', date: 'Nov 23', isWeekend: true }
  ];

  const users = [
    { id: 1, name: 'Emma Rodriguez', role: 'UX Designer', dept: 'Design', utilization: 25, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma' },
    { id: 2, name: 'Lisa Anderson', role: 'Senior Designer', dept: 'Design', utilization: 46, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa' },
    { id: 3, name: 'Sarah Mitchell', role: 'Senior Developer', dept: 'Engineering', utilization: 50, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
    { id: 4, name: 'Marcus Chen', role: 'Lead Developer', dept: 'Engineering', utilization: 30, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus' },
    { id: 5, name: 'James Wilson', role: 'Developer', dept: 'Engineering', utilization: 21, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James' },
    { id: 6, name: 'Alex Thompson', role: 'Developer', dept: 'Engineering', utilization: 11, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' },
    { id: 7, name: 'David Kim', role: 'Tech Lead', dept: 'Engineering', utilization: 29, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David' },
    { id: 8, name: 'Michael Brown', role: 'Developer', dept: 'Engineering', utilization: 38, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael' },
  ];

  const sarahWeek = [
    { hours: 9, capacity: 8, projects: [{ color: '#3B82F6', width: 75 }, { color: '#8B5CF6', width: 60 }, { color: '#F97316', width: 20 }] },
    { hours: 12, capacity: 8, projects: [{ color: '#3B82F6', width: 80 }, { color: '#8B5CF6', width: 50 }, { color: '#F97316', width: 30 }] },
    { hours: 7, capacity: 8, projects: [{ color: '#3B82F6', width: 70 }, { color: '#8B5CF6', width: 40 }] },
    { hours: 5, capacity: 8, projects: [{ color: '#3B82F6', width: 60 }, { color: '#8B5CF6', width: 30 }] },
    { hours: 8, capacity: 8, projects: [{ color: '#3B82F6', width: 75 }, { color: '#8B5CF6', width: 45 }] },
    { hours: 0, capacity: 0, projects: [], isWeekend: true },
    { hours: 0, capacity: 0, projects: [], isWeekend: true }
  ];

  const marcusWeek = [
    { hours: 5, capacity: 8, projects: [{ color: '#3B82F6', width: 60 }, { color: '#10B981', width: 30 }] },
    { hours: 7, capacity: 8, projects: [{ color: '#3B82F6', width: 70 }, { color: '#10B981', width: 40 }] },
    { hours: 5, capacity: 8, projects: [{ color: '#3B82F6', width: 60 }, { color: '#10B981', width: 30 }] },
    { hours: 5, capacity: 8, projects: [{ color: '#3B82F6', width: 60 }] },
    { hours: 0, capacity: 8, projects: [] },
    { hours: 0, capacity: 0, projects: [], isWeekend: true },
    { hours: 0, capacity: 0, projects: [], isWeekend: true }
  ];

  const getWeekData = (userId: number) => {
    if (userId === 3) return sarahWeek;
    if (userId === 4) return marcusWeek;
    return days.map(d => d.isWeekend 
      ? { hours: 0, capacity: 0, projects: [], isWeekend: true }
      : { hours: 4, capacity: 8, projects: [{ color: '#3B82F6', width: 50 }] }
    );
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Resource Planner - Week View</h2>
          <p className="text-sm text-gray-600">Daily overview for team coordination</p>
        </div>
        
        {/* Top Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="inline-flex rounded-lg border border-gray-200" style={{ height: '36px' }}>
              <button className="px-4 rounded-l-md text-sm font-medium text-gray-600 hover:bg-gray-50">
                Day
              </button>
              <button className="px-4 text-sm font-medium text-white" style={{ background: '#3B82F6' }}>
                Week
              </button>
              <button className="px-4 rounded-r-md text-sm font-medium text-gray-600 hover:bg-gray-50">
                Month
              </button>
            </div>
            
            {/* Date Control */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-9 w-9 p-0">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2 px-3">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Nov 17 - Nov 23, 2025</span>
              </div>
              <Button variant="outline" size="sm" className="h-9 w-9 p-0">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search..."
                className="pl-10 w-64 h-9"
              />
            </div>
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
            <div className="sticky left-0 z-30 bg-gray-50 border-r border-gray-300 p-3" style={{ width: '240px' }}>
              <div className="font-medium text-sm">Team Member</div>
            </div>
            <div className="flex">
              {days.map(day => (
                <div 
                  key={day.date} 
                  className="border-l border-gray-200 text-center p-2"
                  style={{ 
                    width: '120px',
                    background: day.isWeekend ? '#FAFAFC' : 'transparent'
                  }}
                >
                  <div className="text-sm font-semibold" style={{ color: day.isWeekend ? '#9CA3AF' : '#111827' }}>
                    {day.name}
                  </div>
                  <div className="text-xs text-gray-500">{day.date}</div>
                  {day.isWeekend && (
                    <div className="text-xs text-gray-400 mt-0.5" style={{ letterSpacing: '0.05em', fontWeight: 600 }}>
                      WEEKEND
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Team Rows */}
          {users.map(user => {
            const weekData = getWeekData(user.id);
            return (
              <div key={user.id} className="flex border-b border-gray-200">
                {/* User Info */}
                <div className="sticky left-0 z-10 bg-white border-r border-gray-200 p-3 flex items-center gap-3" style={{ width: '240px' }}>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{user.name}</div>
                    <div className="text-xs text-gray-600 truncate">{user.role}</div>
                  </div>
                  <span
                    className="inline-flex items-center justify-center rounded text-xs font-medium shrink-0"
                    style={{
                      width: '40px',
                      height: '24px',
                      background: user.utilization > 80 ? '#FEE2E2' : user.utilization > 50 ? '#FEF3C7' : '#D1FAE5',
                      color: user.utilization > 80 ? '#DC2626' : user.utilization > 50 ? '#D97706' : '#059669'
                    }}
                  >
                    {user.utilization}%
                  </span>
                </div>

                {/* Day Cells */}
                <div className="flex">
                  {weekData.map((day, idx) => (
                    <DayCell key={idx} day={day} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 px-6 py-3">
        <div className="text-sm text-gray-600">
          Showing 1-8 of 10 team members
        </div>
      </div>
    </div>
  );
}

function DayCell({ day }: { day: any }) {
  if (day.isWeekend) {
    return (
      <div className="border-l border-gray-200 flex items-center justify-center bg-gray-50" style={{ width: '120px', height: '60px' }}>
        <span className="text-xs text-gray-400">WEEKEND</span>
      </div>
    );
  }

  const percent = day.capacity > 0 ? (day.hours / day.capacity) * 100 : 0;
  const bgColor = percent > 100 ? '#FEE2E2' : percent > 62.5 ? '#FEF3C7' : percent > 0 ? '#D1FAE5' : 'white';
  const showWarning = percent > 100;

  return (
    <div 
      className="border-l border-gray-200 p-2"
      style={{ 
        width: '120px', 
        height: '60px',
        background: bgColor
      }}
    >
      {day.hours > 0 ? (
        <>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-medium">
              {day.hours}h / {day.capacity}h
            </span>
            {showWarning && <span className="text-sm">⚠️</span>}
          </div>
          <div className="space-y-0.5">
            {day.projects.map((project: any, idx: number) => (
              <div 
                key={idx}
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
  );
}

// MONTH VIEW - Weekly summary
function MonthView() {
  const weeks = [
    { week: 'Week 1', range: 'Nov 1-7' },
    { week: 'Week 2', range: 'Nov 8-14' },
    { week: 'Week 3', range: 'Nov 15-21' },
    { week: 'Week 4', range: 'Nov 22-28' },
    { week: 'Week 5', range: 'Nov 29-30' }
  ];

  const users = [
    { id: 1, name: 'Emma Rodriguez', role: 'UX Designer', dept: 'Design', utilization: 25, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma' },
    { id: 2, name: 'Lisa Anderson', role: 'Senior Designer', dept: 'Design', utilization: 46, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa' },
    { id: 3, name: 'Sarah Mitchell', role: 'Senior Developer', dept: 'Engineering', utilization: 50, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah' },
    { id: 4, name: 'Marcus Chen', role: 'Lead Developer', dept: 'Engineering', utilization: 30, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus' },
    { id: 5, name: 'James Wilson', role: 'Developer', dept: 'Engineering', utilization: 21, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James' },
    { id: 6, name: 'Alex Thompson', role: 'Developer', dept: 'Engineering', utilization: 11, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex' },
    { id: 7, name: 'David Kim', role: 'Tech Lead', dept: 'Engineering', utilization: 29, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David' },
    { id: 8, name: 'Michael Brown', role: 'Developer', dept: 'Engineering', utilization: 38, avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael' },
  ];

  const sarahMonth = [
    { hours: 24, capacity: 40 },
    { hours: 32, capacity: 40 },
    { hours: 20, capacity: 40 },
    { hours: 16, capacity: 40 },
    { hours: 8, capacity: 8 }
  ];

  const marcusMonth = [
    { hours: 16, capacity: 40 },
    { hours: 20, capacity: 40 },
    { hours: 12, capacity: 40 },
    { hours: 8, capacity: 40 },
    { hours: 4, capacity: 8 }
  ];

  const getMonthData = (userId: number) => {
    if (userId === 3) return sarahMonth;
    if (userId === 4) return marcusMonth;
    return [
      { hours: 16, capacity: 40 },
      { hours: 16, capacity: 40 },
      { hours: 16, capacity: 40 },
      { hours: 16, capacity: 40 },
      { hours: 4, capacity: 8 }
    ];
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="mb-4">
          <h2 className="text-xl font-semibold">Resource Planner - Month View</h2>
          <p className="text-sm text-gray-600">Weekly summary for strategic planning</p>
        </div>
        
        {/* Top Bar */}
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="inline-flex rounded-lg border border-gray-200" style={{ height: '36px' }}>
              <button className="px-4 rounded-l-md text-sm font-medium text-gray-600 hover:bg-gray-50">
                Day
              </button>
              <button className="px-4 text-sm font-medium text-gray-600 hover:bg-gray-50">
                Week
              </button>
              <button className="px-4 rounded-r-md text-sm font-medium text-white" style={{ background: '#3B82F6' }}>
                Month
              </button>
            </div>
            
            {/* Date Control */}
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="h-9 w-9 p-0">
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="flex items-center gap-2 px-3">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">November 2025</span>
              </div>
              <Button variant="outline" size="sm" className="h-9 w-9 p-0">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search..."
                className="pl-10 w-64 h-9"
              />
            </div>
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
            <div className="sticky left-0 z-30 bg-gray-50 border-r border-gray-300 p-3" style={{ width: '240px' }}>
              <div className="font-medium text-sm">Team Member</div>
            </div>
            <div className="flex">
              {weeks.map(week => (
                <div key={week.week} className="border-l border-gray-200 text-center p-2" style={{ width: '140px' }}>
                  <div className="text-sm font-semibold">{week.week}</div>
                  <div className="text-xs text-gray-500">{week.range}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Team Rows */}
          {users.map(user => {
            const monthData = getMonthData(user.id);
            return (
              <div key={user.id} className="flex border-b border-gray-200">
                {/* User Info */}
                <div className="sticky left-0 z-10 bg-white border-r border-gray-200 p-3 flex items-center gap-3" style={{ width: '240px', height: '80px' }}>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback>{user.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{user.name}</div>
                    <div className="text-xs text-gray-600 truncate">{user.role}</div>
                  </div>
                  <span
                    className="inline-flex items-center justify-center rounded text-xs font-medium shrink-0"
                    style={{
                      width: '40px',
                      height: '24px',
                      background: user.utilization > 80 ? '#FEE2E2' : user.utilization > 50 ? '#FEF3C7' : '#D1FAE5',
                      color: user.utilization > 80 ? '#DC2626' : user.utilization > 50 ? '#D97706' : '#059669'
                    }}
                  >
                    {user.utilization}%
                  </span>
                </div>

                {/* Week Cells */}
                <div className="flex">
                  {monthData.map((week, idx) => (
                    <WeekCell key={idx} week={week} />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t border-gray-200 px-6 py-3">
        <div className="text-sm text-gray-600">
          Showing 1-8 of 10 team members
        </div>
      </div>
    </div>
  );
}

function WeekCell({ week }: { week: any }) {
  const percent = week.capacity > 0 ? (week.hours / week.capacity) * 100 : 0;
  const bgColor = percent > 100 ? '#FEE2E2' : percent > 80 ? '#FEE2E2' : percent > 50 ? '#FEF3C7' : percent > 0 ? '#D1FAE5' : 'white';
  const barColor = percent > 100 ? '#DC2626' : percent > 80 ? '#EF4444' : percent > 50 ? '#F59E0B' : '#10B981';
  const showWarning = percent > 100;

  return (
    <div 
      className="border-l border-gray-200 p-3 flex flex-col justify-center"
      style={{ 
        width: '140px', 
        height: '80px',
        background: bgColor
      }}
    >
      <div className="text-center">
        <div className="font-bold mb-1" style={{ fontSize: '15px' }}>
          {week.hours}h / {week.capacity}h
        </div>
        <div className="flex items-center justify-center gap-1 mb-2" style={{ fontSize: '13px', color: '#6B7280', fontWeight: 500 }}>
          {Math.round(percent)}%
          {showWarning && <span className="text-sm">⚠️</span>}
        </div>
        <div className="rounded-full overflow-hidden" style={{ height: '10px', background: '#E5E7EB' }}>
          <div
            className="h-full transition-all"
            style={{ 
              width: `${Math.min(percent, 100)}%`,
              background: barColor
            }}
          />
        </div>
      </div>
    </div>
  );
}

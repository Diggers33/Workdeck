import React from 'react';
import { X, Calendar, Mail, Download, Settings, ChevronDown } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { Button } from './ui/button';
import { format, addWeeks, startOfWeek, endOfWeek, addMonths, startOfMonth, endOfMonth } from 'date-fns';

// Mock data for showcase
const mockUser = {
  id: '1',
  name: 'Marcus Chen',
  role: 'Lead Developer',
  avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
  totalCapacity: 40
};

const mockProjects = [
  { id: '1', name: 'Mobile App Redesign', color: '#8B5CF6' },
  { id: '2', name: 'Internal Tools', color: '#F97316' }
];

const mockActivities = [
  {
    project: mockProjects[0],
    activity: 'Frontend Development',
    hours: 10,
    logged: 3,
    startDate: new Date(2024, 10, 19),
    endDate: new Date(2024, 10, 22),
    status: 'In Progress',
    isBillable: true,
    tasks: [
      { name: 'Frontend Framework', hours: 6, logged: 3, status: 'In Progress' },
      { name: 'UI Components', hours: 4, logged: 0, status: 'To Do' }
    ]
  },
  {
    project: mockProjects[1],
    activity: 'API Development',
    hours: 2,
    logged: 0,
    startDate: new Date(2024, 10, 18),
    endDate: new Date(2024, 10, 20),
    status: 'To Do',
    isBillable: false,
    tasks: [
      { name: 'Setup API Routes', hours: 2, logged: 0, status: 'To Do' }
    ]
  }
];

const mockWeeks = [
  { label: 'Nov 17-23', hours: 12, percent: 30, projects: [{ name: 'Mobile', hours: 10, color: '#8B5CF6' }, { name: 'Internal', hours: 2, color: '#F97316' }] },
  { label: 'Nov 24-30', hours: 0, percent: 0, projects: [] },
  { label: 'Dec 1-7', hours: 0, percent: 0, projects: [] },
  { label: 'Dec 8-14', hours: 0, percent: 0, projects: [] }
];

function PanelHeader({ activeTab, onTabChange }: { activeTab: 'this-week' | 'schedule', onTabChange: (tab: 'this-week' | 'schedule') => void }) {
  return (
    <div className="flex-shrink-0 border-b border-gray-200" style={{ height: '140px', padding: '20px' }}>
      {/* User Info */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar style={{ width: '48px', height: '48px', border: '2px solid #E5E7EB' }}>
            <AvatarImage src={mockUser.avatar} />
            <AvatarFallback>MC</AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold" style={{ fontSize: '18px', color: '#1F2937', lineHeight: '1.3' }}>
              {mockUser.name}
            </h2>
            <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: '1.3', marginTop: '2px' }}>
              {mockUser.role} • 30% utilized
            </p>
          </div>
        </div>
        <Button variant="ghost" size="sm" style={{ width: '32px', height: '32px', padding: 0 }}>
          <X className="h-5 w-5" style={{ color: '#6B7280' }} />
        </Button>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="sm" style={{ height: '32px', padding: '6px 12px', fontSize: '14px' }}>
          <Mail className="h-4 w-4 mr-1.5" />
          Message
        </Button>
        <Button variant="ghost" size="sm" style={{ height: '32px', padding: '6px 12px', fontSize: '14px' }}>
          <Calendar className="h-4 w-4 mr-1.5" />
          Calendar
        </Button>
        <Button variant="ghost" size="sm" style={{ height: '32px', padding: '6px 12px', fontSize: '14px' }}>
          <Download className="h-4 w-4 mr-1.5" />
          Export
        </Button>
        <Button variant="ghost" size="sm" style={{ height: '32px', padding: '6px 12px', fontSize: '14px' }}>
          <Settings className="h-4 w-4" />
        </Button>
      </div>

      {/* Tab Bar */}
      <div className="flex border-b border-gray-200" style={{ marginLeft: '-20px', marginRight: '-20px', paddingLeft: '20px', paddingRight: '20px' }}>
        <button
          onClick={() => onTabChange('this-week')}
          className="flex items-center gap-1.5 transition-colors"
          style={{
            height: '40px',
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: 500,
            color: activeTab === 'this-week' ? '#3B82F6' : '#6B7280',
            borderBottom: activeTab === 'this-week' ? '2px solid #3B82F6' : '2px solid transparent',
            marginBottom: '-1px'
          }}
        >
          <Calendar className="h-4 w-4" />
          This Week
        </button>
        <button
          onClick={() => onTabChange('schedule')}
          className="flex items-center gap-1.5 transition-colors"
          style={{
            height: '40px',
            padding: '8px 16px',
            fontSize: '14px',
            fontWeight: 500,
            color: activeTab === 'schedule' ? '#3B82F6' : '#6B7280',
            borderBottom: activeTab === 'schedule' ? '2px solid #3B82F6' : '2px solid transparent',
            marginBottom: '-1px'
          }}
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Schedule
        </button>
      </div>
    </div>
  );
}

function ThisWeekContent() {
  return (
    <div className="flex-1 overflow-y-auto" style={{ padding: '20px' }}>
      {/* Week Summary */}
      <div className="rounded-lg border border-gray-200 mb-5" style={{ background: '#FAFBFC', padding: '16px' }}>
        <div className="space-y-2">
          <div className="flex justify-between" style={{ lineHeight: '28px' }}>
            <span style={{ fontSize: '14px', color: '#6B7280' }}>Planned</span>
            <span style={{ fontSize: '14px', fontWeight: 500, color: '#1F2937' }}>12h</span>
          </div>
          <div className="flex justify-between" style={{ lineHeight: '28px' }}>
            <span style={{ fontSize: '14px', color: '#6B7280' }}>Logged</span>
            <span style={{ fontSize: '14px', fontWeight: 500, color: '#1F2937' }}>3h</span>
          </div>
          <div className="flex justify-between" style={{ lineHeight: '28px' }}>
            <span style={{ fontSize: '14px', color: '#6B7280' }}>Capacity</span>
            <span style={{ fontSize: '14px', fontWeight: 500, color: '#1F2937' }}>12h / 40h (30%)</span>
          </div>
          <div className="w-full rounded overflow-hidden mt-2" style={{ height: '8px', background: '#E5E7EB' }}>
            <div className="h-full" style={{ width: '30%', background: '#10B981' }} />
          </div>
        </div>
      </div>

      {/* Capacity by Project */}
      <div className="mb-5">
        <h3 className="font-semibold mb-3" style={{ fontSize: '16px', color: '#1F2937' }}>
          Capacity by Project
        </h3>
        {mockProjects.map((project, index) => (
          <div key={index} style={{ marginBottom: '8px' }}>
            <div className="flex justify-between items-center mb-1.5">
              <div className="flex items-center gap-2">
                <div className="rounded-full" style={{ width: '12px', height: '12px', background: project.color }} />
                <span style={{ fontSize: '14px', fontWeight: 500, color: '#1F2937' }}>{project.name}</span>
              </div>
              <span style={{ fontSize: '14px', fontWeight: 500, color: '#6B7280' }}>
                {index === 0 ? '10h' : '2h'}
              </span>
            </div>
            <div className="relative">
              <div className="rounded overflow-hidden" style={{ height: '6px', background: '#E5E7EB' }}>
                <div className="h-full" style={{ width: index === 0 ? '83%' : '17%', background: project.color }} />
              </div>
              <div className="text-right mt-1" style={{ fontSize: '12px', color: '#6B7280' }}>
                {index === 0 ? '83%' : '17%'}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Activities */}
      <div>
        <h3 className="font-semibold mb-3" style={{ fontSize: '16px', color: '#1F2937' }}>
          Activities
        </h3>
        {mockActivities.map((activity, index) => (
          <div
            key={index}
            className="rounded-lg border border-gray-200 mb-3"
            style={{ padding: '16px', background: 'white' }}
          >
            {/* Header */}
            <div className="mb-3">
              <div className="flex items-center gap-2 mb-1">
                <div className="rounded-full" style={{ width: '12px', height: '12px', background: activity.project.color }} />
                <span style={{ fontSize: '15px', fontWeight: 600, color: '#1F2937' }}>
                  {activity.project.name}
                </span>
              </div>
              <div style={{ fontSize: '14px', color: '#6B7280' }}>
                {activity.activity} ({activity.hours}h)
              </div>
            </div>

            {/* Date */}
            <div className="flex items-center gap-1.5 mb-3" style={{ fontSize: '13px', color: '#6B7280' }}>
              <Calendar className="h-3.5 w-3.5" />
              <span>
                {format(activity.startDate, 'EEE MMM d')} - {format(activity.endDate, 'EEE MMM d')}
              </span>
            </div>

            {/* Progress */}
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1.5" style={{ fontSize: '13px' }}>
                <span style={{ color: '#6B7280' }}>Progress</span>
                <span style={{ color: '#1F2937', fontWeight: 500 }}>
                  {Math.round((activity.logged / activity.hours) * 100)}%
                </span>
              </div>
              <div className="rounded overflow-hidden" style={{ height: '6px', background: '#E5E7EB' }}>
                <div
                  className="h-full"
                  style={{ width: `${(activity.logged / activity.hours) * 100}%`, background: activity.project.color }}
                />
              </div>
            </div>

            {/* Badges */}
            <div className="flex gap-2 mb-3">
              <span
                className="inline-flex items-center rounded"
                style={{
                  height: '24px',
                  padding: '4px 10px',
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
                  padding: '4px 10px',
                  fontSize: '12px',
                  fontWeight: 500,
                  background: activity.status === 'In Progress' ? '#DBEAFE' : '#F3F4F6',
                  color: activity.status === 'In Progress' ? '#2563EB' : '#6B7280'
                }}
              >
                {activity.status}
              </span>
            </div>

            {/* Tasks */}
            <div>
              <div style={{ fontSize: '13px', fontWeight: 500, color: '#6B7280', marginBottom: '8px' }}>
                Tasks:
              </div>
              {activity.tasks.map((task, idx) => (
                <div key={idx} className="mb-2 p-2" style={{ marginLeft: '-8px', marginRight: '-8px' }}>
                  <div className="flex items-start gap-2">
                    <span style={{ fontSize: '16px', color: task.status === 'In Progress' ? '#3B82F6' : '#9CA3AF' }}>
                      {task.status === 'In Progress' ? '⏳' : '○'}
                    </span>
                    <div className="flex-1">
                      <div style={{ fontSize: '13px', fontWeight: 500, color: '#1F2937' }}>
                        {task.name} ({task.hours}h)
                        <span style={{ marginLeft: '6px', color: '#6B7280', fontWeight: 400 }}>
                          - {task.status}
                        </span>
                      </div>
                      {task.logged > 0 && (
                        <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>
                          Logged: {task.logged}h of {task.hours}h • {Math.round((task.logged / task.hours) * 100)}% complete
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ScheduleContent() {
  return (
    <div className="flex-1 overflow-y-auto" style={{ padding: '20px' }}>
      {/* Capacity Overview Cards */}
      <div className="flex gap-5 mb-5">
        <div className="flex-1 rounded-md border border-gray-200" style={{ background: '#FAFBFC', padding: '12px', height: '100px' }}>
          <div className="font-medium mb-2" style={{ fontSize: '12px', color: '#6B7280' }}>This Month</div>
          <div className="font-bold mb-1" style={{ fontSize: '20px', color: '#1F2937' }}>12h / 160h</div>
          <div className="mb-2" style={{ fontSize: '13px', color: '#6B7280' }}>8%</div>
          <div className="w-full rounded overflow-hidden" style={{ height: '6px', background: '#E5E7EB' }}>
            <div className="h-full" style={{ width: '8%', background: '#10B981' }} />
          </div>
        </div>
        <div className="flex-1 rounded-md border border-gray-200" style={{ background: '#FAFBFC', padding: '12px', height: '100px' }}>
          <div className="font-medium mb-2" style={{ fontSize: '12px', color: '#6B7280' }}>Next Month</div>
          <div className="font-bold mb-1" style={{ fontSize: '20px', color: '#1F2937' }}>0h / 184h</div>
          <div className="mb-2" style={{ fontSize: '13px', color: '#6B7280' }}>0%</div>
          <div className="w-full rounded overflow-hidden" style={{ height: '6px', background: '#E5E7EB' }}>
            <div className="h-full" style={{ width: '0%', background: '#10B981' }} />
          </div>
        </div>
      </div>

      {/* Capacity Forecast */}
      <div className="mb-5">
        <h3 className="font-semibold mb-3" style={{ fontSize: '16px', color: '#1F2937' }}>
          Capacity Forecast
        </h3>
        <div>
          {mockWeeks.map((week, index) => (
            <div
              key={index}
              className="flex items-center border-b border-gray-100"
              style={{ padding: '8px 0', minHeight: '36px', fontSize: '13px' }}
            >
              <span className="font-medium" style={{ color: '#1F2937', width: '150px' }}>
                Week of {week.label}
              </span>
              <span className="font-medium" style={{ color: '#6B7280', width: '80px' }}>
                {week.hours}h ({week.percent}%)
              </span>
              <div
                className="rounded overflow-hidden"
                style={{ width: '50px', height: '6px', background: '#E5E7EB', margin: '0 8px' }}
              >
                <div className="h-full" style={{ width: `${week.percent}%`, background: '#10B981' }} />
              </div>
              <div className="flex-1 flex items-center flex-wrap" style={{ gap: '6px', fontSize: '12px', color: '#6B7280' }}>
                {week.projects.length > 0 ? (
                  week.projects.map((p, i) => (
                    <React.Fragment key={i}>
                      <div className="flex items-center" style={{ gap: '4px' }}>
                        <div className="rounded-full" style={{ width: '8px', height: '8px', background: p.color }} />
                        <span>{p.name} ({p.hours}h)</span>
                      </div>
                      {i < week.projects.length - 1 && <span>•</span>}
                    </React.Fragment>
                  ))
                ) : (
                  <span style={{ color: '#9CA3AF' }}>No work scheduled</span>
                )}
              </div>
            </div>
          ))}
          <button className="text-left hover:underline mt-2" style={{ fontSize: '13px', color: '#3B82F6', fontWeight: 500 }}>
            <ChevronDown className="inline h-3.5 w-3.5 mr-1" />
            Show 4 more weeks
          </button>
        </div>
      </div>

      {/* Time Off & Available */}
      <div className="flex gap-5 mb-5">
        <div className="flex-1">
          <h3 className="font-semibold flex items-center gap-1 mb-2" style={{ fontSize: '15px', color: '#1F2937' }}>
            <span>🏖️</span> Time Off
          </h3>
          <div style={{ fontSize: '12px', color: '#9CA3AF', marginBottom: '12px' }}>
            No time off scheduled
          </div>
          <Button variant="outline" size="sm" style={{ height: '32px', width: '100%', fontSize: '13px' }}>
            Request Time Off
          </Button>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold flex items-center gap-1 mb-2" style={{ fontSize: '15px', color: '#1F2937' }}>
            <span>💼</span> Available
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '12px' }}>
            <div className="flex items-center" style={{ height: '28px', fontSize: '13px' }}>
              <span className="font-medium" style={{ color: '#6B7280', width: '80px' }}>This Week:</span>
              <span className="font-medium" style={{ color: '#1F2937' }}>28h (70%)</span>
            </div>
            <div className="flex items-center" style={{ height: '28px', fontSize: '13px' }}>
              <span className="font-medium" style={{ color: '#6B7280', width: '80px' }}>This Month:</span>
              <span className="font-medium" style={{ color: '#1F2937' }}>148h (93%)</span>
            </div>
          </div>
          <Button variant="default" size="sm" style={{ height: '36px', width: '100%', fontSize: '13px', background: '#3B82F6', color: 'white' }}>
            Assign New Work
          </Button>
        </div>
      </div>

      {/* Project Distribution */}
      <div>
        <div className="flex justify-between items-baseline mb-3">
          <h3 className="font-semibold" style={{ fontSize: '16px', color: '#1F2937' }}>
            Project Distribution (8 Weeks)
          </h3>
          <span style={{ fontSize: '13px', color: '#6B7280' }}>Total: 12h planned</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <div className="relative rounded overflow-hidden" style={{ height: '24px' }}>
            <div className="absolute inset-0" style={{ width: '83%', background: '#8B5CF6' }} />
            <div className="absolute inset-0 flex items-center font-medium" style={{ fontSize: '13px', color: 'white', paddingLeft: '12px' }}>
              Mobile App Redesign (10h, 83%)
            </div>
          </div>
          <div className="relative rounded overflow-hidden" style={{ height: '24px' }}>
            <div className="absolute inset-0" style={{ width: '17%', background: '#F97316' }} />
            <div className="absolute inset-0 flex items-center font-medium" style={{ fontSize: '13px', color: 'white', paddingLeft: '12px' }}>
              Internal Tools (2h, 17%)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PanelStatesShowcase() {
  const [leftTab, setLeftTab] = React.useState<'this-week' | 'schedule'>('this-week');
  const [rightTab, setRightTab] = React.useState<'this-week' | 'schedule'>('schedule');

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Resource Planner - Side Panel States</h1>
        <p className="text-gray-600">Two states for prototyping: This Week tab (left) and Schedule tab (right)</p>
      </div>

      <div className="flex gap-8">
        {/* LEFT FRAME - This Week Tab */}
        <div>
          <div className="mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Side Panel - This Week Tab Active</h2>
            <p className="text-sm text-gray-600">480px × 100vh</p>
          </div>
          <div className="bg-white flex flex-col" style={{ width: '480px', height: '900px', boxShadow: '-4px 0 24px rgba(0,0,0,0.12)', borderRadius: '8px', overflow: 'hidden' }}>
            <PanelHeader activeTab={leftTab} onTabChange={setLeftTab} />
            <ThisWeekContent />
            {/* Footer */}
            <div className="flex-shrink-0 border-t border-gray-200" style={{ height: '80px', padding: '20px', background: 'white', boxShadow: '0 -2px 8px rgba(0,0,0,0.04)' }}>
              <div className="flex justify-end">
                <Button variant="default" style={{ height: '40px', width: '160px', fontSize: '14px', background: '#3B82F6', color: 'white' }}>
                  Edit Allocation
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT FRAME - Schedule Tab */}
        <div>
          <div className="mb-3">
            <h2 className="text-lg font-semibold text-gray-900">Side Panel - Schedule Tab Active</h2>
            <p className="text-sm text-gray-600">480px × 100vh</p>
          </div>
          <div className="bg-white flex flex-col" style={{ width: '480px', height: '900px', boxShadow: '-4px 0 24px rgba(0,0,0,0.12)', borderRadius: '8px', overflow: 'hidden' }}>
            <PanelHeader activeTab={rightTab} onTabChange={setRightTab} />
            <ScheduleContent />
            {/* Footer */}
            <div className="flex-shrink-0 border-t border-gray-200" style={{ height: '80px', padding: '20px', background: 'white', boxShadow: '0 -2px 8px rgba(0,0,0,0.04)' }}>
              <div className="flex justify-between">
                <Button variant="outline" style={{ height: '40px', width: '140px', fontSize: '14px' }}>
                  Export to PDF
                </Button>
                <Button variant="default" style={{ height: '40px', width: '160px', fontSize: '14px', background: '#3B82F6', color: 'white' }}>
                  Edit Allocation
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

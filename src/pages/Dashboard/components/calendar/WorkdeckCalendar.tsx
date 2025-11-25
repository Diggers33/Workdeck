import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, ChevronDown, RefreshCw, Check, AlertTriangle, X as XIcon, Calendar as CalendarIcon, PanelRightOpen } from 'lucide-react';
import { CalendarLeftSidebar } from './CalendarLeftSidebar';
import { CalendarRightSidebar } from './CalendarRightSidebar';
import { CalendarDayView } from './CalendarDayView';
import { CalendarWeekView } from './CalendarWeekView';
import { CalendarMonthView } from './CalendarMonthView';
import { SyncStatusDropdown } from './SyncStatusDropdown';
import { QuickCreateModal } from './QuickCreateModal';
import { MultiUserLegend } from './MultiUserLegend';
import { EventModal } from './EventModal';

export interface CalendarEvent {
  id: string;
  title: string;
  project?: string;
  projectColor?: string;
  task?: string;
  startTime: Date;
  endTime: Date;
  isTimesheet: boolean;
  isBillable: boolean;
  isPrivate: boolean;
  isExternal: boolean;
  guests?: string[];
  isRecurring?: boolean;
  hasSyncIssue?: boolean;
  createdBy: string;
}

export interface CalendarTask {
  id: string;
  title: string;
  project: string;
  projectColor: string;
  column: string;
  estimatedHours: number;
  loggedHours: number;
  assignedTo: string[];
  myPartComplete: boolean;
}

export function WorkdeckCalendar() {
  const [viewType, setViewType] = useState<'day' | 'week' | 'month'>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showSyncDropdown, setShowSyncDropdown] = useState(false);
  const [selectedCalendars, setSelectedCalendars] = useState<string[]>([
    'Colm Digby (You)',
    'Geraldine Mc Nerney',
    'Colm Test'
  ]);
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [quickCreateDate, setQuickCreateDate] = useState<Date | null>(null);
  const [showRightSidebar, setShowRightSidebar] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showViewDropdown, setShowViewDropdown] = useState(false);
  
  const userColors: { [key: string]: string } = {
    'Colm Digby (You)': '#0066FF',
    'Geraldine Mc Nerney': '#F59E0B',
    'Colm Test': '#10B981',
    'Guest User': '#6B7280'
  };

  // Generate extensive dummy data across multiple months
  const generateDummyEvents = (): CalendarEvent[] => {
    const events: CalendarEvent[] = [];
    const projects = [
      { name: 'CRH', color: '#F97316', isClient: true },
      { name: 'PROTEUS', color: '#3B82F6', isClient: true },
      { name: 'ETERNAL', color: '#9333EA', isClient: true },
      { name: 'Horizon Europe 2024', color: '#10B981', isClient: true },
      { name: 'Customer Support', color: '#F59E0B', isClient: false },
      { name: 'Open Science', color: '#14B8A6', isClient: true },
      { name: 'TASK FORCE Innovation', color: '#8B5CF6', isClient: true },
      { name: 'Slate House', color: '#EC4899', isClient: true },
      { name: 'No project', color: '#6B7280', isClient: false }
    ];

    const eventTypes = [
      'Team Meeting',
      'Client Call',
      'Code Review',
      'Design Review',
      'Sprint Planning',
      'Standup',
      'Workshop',
      '1-on-1',
      'Presentation',
      'Training',
      'Documentation',
      'Research',
      'Testing',
      'Deployment',
      'Bug Fixing',
      'Feature Development'
    ];

    const teamMembers = [
      'Colm Digby (You)',
      'Geraldine Mc Nerney',
      'Colm Test',
      'Guest User'
    ];

    let eventId = 1;

    // Generate events for current month and surrounding months
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth();

    // Generate for 3 months: previous, current, and next month
    for (let monthOffset = -1; monthOffset <= 1; monthOffset++) {
      const targetDate = new Date(currentYear, currentMonth + monthOffset, 1);
      const year = targetDate.getFullYear();
      const month = targetDate.getMonth();
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      
      for (let day = 1; day <= daysInMonth; day++) {
        // Generate events for each team member
        teamMembers.forEach((member, memberIndex) => {
          // Skip some days randomly to make it more realistic
          if (Math.random() > 0.65) return;

          // Generate 1-5 events per day per person
          const eventsPerDay = Math.floor(Math.random() * 5) + 1;
          
          for (let i = 0; i < eventsPerDay; i++) {
            const project = projects[Math.floor(Math.random() * projects.length)];
            const eventType = eventTypes[Math.floor(Math.random() * eventTypes.length)];
            
            // Random start hour between 8 AM and 5 PM
            const startHour = Math.floor(Math.random() * 9) + 8;
            const startMinute = Math.random() > 0.5 ? 0 : 30;
            
            // Duration between 30 min and 3 hours
            const durationOptions = [0.5, 1, 1.5, 2, 2.5, 3];
            const duration = durationOptions[Math.floor(Math.random() * durationOptions.length)];
            
            const startTime = new Date(year, month, day, startHour, startMinute);
            const endTime = new Date(startTime);
            endTime.setMinutes(endTime.getMinutes() + duration * 60);

            const isExternal = Math.random() > 0.6;
            const hasGuests = Math.random() > 0.5;
            const guestCount = hasGuests ? Math.floor(Math.random() * 5) + 1 : 0;

            events.push({
              id: `event-${eventId++}`,
              title: `${project.name} - ${eventType}`,
              project: project.name,
              projectColor: project.color,
              task: Math.random() > 0.5 ? eventType : undefined,
              startTime,
              endTime,
              isTimesheet: project.name !== 'No project',
              isBillable: project.isClient,
              isPrivate: Math.random() > 0.9,
              isExternal,
              guests: hasGuests ? Array.from({ length: guestCount }, (_, i) => `Person ${i + 1}`) : undefined,
              isRecurring: Math.random() > 0.85,
              hasSyncIssue: Math.random() > 0.95,
              createdBy: member
            });
          }
        });
      }
    }

    return events.sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  };

  const [events, setEvents] = useState<CalendarEvent[]>(generateDummyEvents());

  // Mock data - tasks
  const [tasks, setTasks] = useState<CalendarTask[]>([
    {
      id: 't1',
      title: 'ETERNAL D2.1 Roadmap - Review deliverable',
      project: 'ETERNAL',
      projectColor: '#9333EA',
      column: 'On-Going',
      estimatedHours: 4,
      loggedHours: 0,
      assignedTo: ['You', 'Geraldine'],
      myPartComplete: false
    },
    {
      id: 't2',
      title: 'API Documentation',
      project: 'PROTEUS',
      projectColor: '#F97316',
      column: 'On-Going',
      estimatedHours: 4,
      loggedHours: 2.5,
      assignedTo: ['You'],
      myPartComplete: false
    },
    {
      id: 't3',
      title: 'Open Science Whitepaper - Draft introduction',
      project: 'Open Science',
      projectColor: '#10B981',
      column: 'On-Going',
      estimatedHours: 2,
      loggedHours: 2,
      assignedTo: ['You', 'Colm', 'John'],
      myPartComplete: false
    },
    {
      id: 't4',
      title: 'Weekly review',
      project: 'Customer Support',
      projectColor: '#3B82F6',
      column: 'To Do',
      estimatedHours: 1,
      loggedHours: 2.5,
      assignedTo: ['You'],
      myPartComplete: false
    }
  ]);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];

  const handlePrevious = () => {
    const newDate = new Date(currentDate);
    if (viewType === 'day') {
      newDate.setDate(newDate.getDate() - 1);
    } else if (viewType === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setMonth(newDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewType === 'day') {
      newDate.setDate(newDate.getDate() + 1);
    } else if (viewType === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setMonth(newDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  const handleTaskDrop = (date: Date, task: CalendarTask) => {
    console.log('Task dropped:', task, 'at', date);
    console.log('Creating event at time:', date.toISOString());
    
    // Automatically create a new calendar event from the dropped task
    // Default duration: 1 hour
    const startTime = new Date(date);
    const endTime = new Date(date.getTime() + 60 * 60 * 1000); // 1 hour duration
    
    const newEvent: CalendarEvent = {
      id: `event-${Date.now()}-${Math.random()}`,
      title: task.title,
      project: task.project,
      projectColor: task.projectColor,
      task: task.title,
      startTime,
      endTime,
      isTimesheet: true,
      isBillable: true,
      isPrivate: false,
      isExternal: false,
      createdBy: 'Colm Digby (You)',
      hasSyncIssue: false
    };
    
    console.log('New event created:', newEvent);
    console.log('Current view date:', currentDate.toISOString());
    console.log('Event date:', startTime.toISOString());
    
    // Add the new event to the events array
    setEvents(prevEvents => {
      const updatedEvents = [...prevEvents, newEvent];
      console.log('Updated events count:', updatedEvents.length);
      return updatedEvents;
    });
    
    // Navigate to the date where the event was created
    setCurrentDate(new Date(startTime));
    
    // Update the task's logged hours (1 hour default)
    setTasks(prevTasks => prevTasks.map(t => 
      t.id === task.id 
        ? { ...t, loggedHours: t.loggedHours + 1 }
        : t
    ));
    
    // Show success notification
    setNotificationMessage(`"${task.title}" added to calendar`);
    setShowSuccessNotification(true);
    setTimeout(() => setShowSuccessNotification(false), 3000);
  };

  const handleEventMove = (eventId: string, newStartTime: Date, newEndTime?: Date) => {
    console.log('Moving event:', eventId, 'to', newStartTime);
    
    setEvents(prevEvents => prevEvents.map(event => {
      if (event.id === eventId) {
        // Calculate duration
        const originalDuration = new Date(event.endTime).getTime() - new Date(event.startTime).getTime();
        
        // If newEndTime is provided, use it; otherwise maintain duration
        const updatedEndTime = newEndTime || new Date(newStartTime.getTime() + originalDuration);
        
        console.log('Updated event:', {
          ...event,
          startTime: newStartTime,
          endTime: updatedEndTime
        });
        
        return {
          ...event,
          startTime: newStartTime,
          endTime: updatedEndTime
        };
      }
      return event;
    }));
  };

  const syncStatus = {
    status: 'synced' as 'synced' | 'syncing' | 'warning' | 'error',
    lastSync: '2 minutes ago',
    calendars: [
      { name: 'Google Calendar', status: 'synced' as const, lastSync: '2 minutes ago' },
      { name: 'Microsoft Calendar', status: 'synced' as const, lastSync: '5 minutes ago' }
    ]
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 180px)', gap: '0', background: '#FAFBFC' }}>
      {/* Left Sidebar - Task Panel */}
      <CalendarLeftSidebar
        tasks={tasks}
        onTaskDrag={(task) => console.log('Dragging task:', task)}
        selectedCalendars={selectedCalendars}
        onCalendarsChange={setSelectedCalendars}
      />

      {/* Main Calendar Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'white', overflow: 'hidden' }}>
        {/* Calendar Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid #E5E7EB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          {/* Left: Month/Year and Navigation */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#0A0A0A', margin: 0 }}>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                onClick={handlePrevious}
                style={{
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px',
                  background: 'white',
                  cursor: 'pointer',
                  color: '#6B7280',
                  transition: 'all 150ms'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#F9FAFB';
                  e.currentTarget.style.borderColor = '#D1D5DB';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.borderColor = '#E5E7EB';
                }}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={handleNext}
                style={{
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px',
                  background: 'white',
                  cursor: 'pointer',
                  color: '#6B7280',
                  transition: 'all 150ms'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#F9FAFB';
                  e.currentTarget.style.borderColor = '#D1D5DB';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.borderColor = '#E5E7EB';
                }}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Right: View Selector, Today, Sync Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            {/* View Selector */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setShowViewDropdown(!showViewDropdown)}
                style={{
                  height: '36px',
                  padding: '0 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px',
                  background: 'white',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#0A0A0A',
                  transition: 'all 150ms'
                }}
                onMouseEnter={(e) => e.currentTarget.style.borderColor = '#D1D5DB'}
                onMouseLeave={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
              >
                {viewType === 'day' ? 'Day' : viewType === 'week' ? 'Week' : 'Month'}
                <ChevronDown size={14} />
              </button>

              {showViewDropdown && (
                <>
                  <div
                    style={{
                      position: 'fixed',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      zIndex: 998
                    }}
                    onClick={() => setShowViewDropdown(false)}
                  />
                  <div style={{
                    position: 'absolute',
                    top: '40px',
                    right: 0,
                    width: '140px',
                    background: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '6px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                    zIndex: 999,
                    overflow: 'hidden'
                  }}>
                    {['Day', 'Week', 'Month'].map(view => (
                      <button
                        key={view}
                        onClick={() => {
                          setViewType(view.toLowerCase() as 'day' | 'week' | 'month');
                          setShowViewDropdown(false);
                        }}
                        style={{
                          width: '100%',
                          padding: '10px 12px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          background: viewType === view.toLowerCase() ? '#F9FAFB' : 'transparent',
                          border: 'none',
                          fontSize: '13px',
                          color: '#0A0A0A',
                          cursor: 'pointer',
                          textAlign: 'left'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                        onMouseLeave={(e) => e.currentTarget.style.background = viewType === view.toLowerCase() ? '#F9FAFB' : 'transparent'}
                      >
                        {view}
                        {viewType === view.toLowerCase() && <Check size={14} color="#0066FF" />}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Today Button */}
            <button
              onClick={handleToday}
              style={{
                height: '36px',
                padding: '0 16px',
                border: '1px solid #E5E7EB',
                borderRadius: '6px',
                background: 'white',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 500,
                color: '#0A0A0A',
                transition: 'all 150ms'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#F9FAFB';
                e.currentTarget.style.borderColor = '#D1D5DB';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.borderColor = '#E5E7EB';
              }}
            >
              TODAY
            </button>

            {/* Sync Status */}
            <SyncStatusDropdown 
              status={syncStatus}
              isOpen={showSyncDropdown}
              onToggle={() => setShowSyncDropdown(!showSyncDropdown)}
            />

            {/* Reopen Calendar Details Button */}
            {!showRightSidebar && (
              <button
                onClick={() => setShowRightSidebar(true)}
                style={{
                  height: '36px',
                  padding: '0 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px',
                  background: 'white',
                  cursor: 'pointer',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#0A0A0A',
                  transition: 'all 150ms'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#F9FAFB';
                  e.currentTarget.style.borderColor = '#D1D5DB';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.borderColor = '#E5E7EB';
                }}
              >
                <PanelRightOpen size={16} />
                Calendar Details
              </button>
            )}
          </div>
        </div>

        {/* Multi-User Legend */}
        <MultiUserLegend
          selectedUsers={selectedCalendars}
          userColors={userColors}
        />

        {/* Calendar Grid */}
        <div style={{ flex: 1, overflow: 'auto' }}>
          {viewType === 'day' ? (
            <CalendarDayView
              key={events.length}
              currentDate={currentDate}
              events={events.filter(e => selectedCalendars.includes(e.createdBy))}
              onEventClick={setSelectedEvent}
              onTimeSlotClick={(date) => {
                setQuickCreateDate(date);
                setShowQuickCreate(true);
              }}
              onTaskDrop={handleTaskDrop}
              userColors={userColors}
              selectedCalendars={selectedCalendars}
            />
          ) : viewType === 'week' ? (
            <CalendarWeekView
              key={events.length}
              currentDate={currentDate}
              events={events.filter(e => {
                const isIncluded = selectedCalendars.includes(e.createdBy);
                if (!isIncluded) {
                  console.log('Event filtered out:', e.title, 'createdBy:', e.createdBy, 'selectedCalendars:', selectedCalendars);
                }
                return isIncluded;
              })}
              onEventClick={setSelectedEvent}
              onTimeSlotClick={(date) => {
                setQuickCreateDate(date);
                setShowQuickCreate(true);
              }}
              onTaskDrop={handleTaskDrop}
              onEventMove={handleEventMove}
              userColors={userColors}
              selectedCalendars={selectedCalendars}
            />
          ) : (
            <CalendarMonthView
              key={events.length}
              currentDate={currentDate}
              events={events.filter(e => selectedCalendars.includes(e.createdBy))}
              onEventClick={setSelectedEvent}
              onDayClick={(date) => {
                setQuickCreateDate(date);
                setShowQuickCreate(true);
              }}
              onTaskDrop={handleTaskDrop}
              userColors={userColors}
              selectedCalendars={selectedCalendars}
            />
          )}
        </div>
      </div>

      {/* Right Sidebar - Calendar Details & Timesheet */}
      {showRightSidebar && (
        <CalendarRightSidebar
          currentDate={currentDate}
          events={events}
          onClose={() => setShowRightSidebar(false)}
        />
      )}

      {/* Quick Create Modal */}
      {showQuickCreate && (
        <QuickCreateModal
          initialDate={quickCreateDate || currentDate}
          onClose={() => setShowQuickCreate(false)}
          onSave={(event) => {
            console.log('Creating event:', event);
            setShowQuickCreate(false);
          }}
        />
      )}

      {/* Success Notification */}
      {showSuccessNotification && (
        <div
          style={{
            position: 'fixed',
            bottom: '20px',
            left: '50%',
            transform: 'translateX(-50%)',
            padding: '10px 20px',
            background: '#34D399',
            color: 'white',
            borderRadius: '6px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
            zIndex: 1000,
            fontSize: '14px',
            fontWeight: 500
          }}
        >
          {notificationMessage}
        </div>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <EventModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
          onSave={(updatedEvent) => {
            setEvents(prevEvents => prevEvents.map(e => 
              e.id === updatedEvent.id ? { ...e, ...updatedEvent } : e
            ));
            setNotificationMessage('Event updated');
            setShowSuccessNotification(true);
            setTimeout(() => setShowSuccessNotification(false), 3000);
            setSelectedEvent(null);
          }}
          onDelete={(eventId) => {
            setEvents(prevEvents => prevEvents.filter(e => e.id !== eventId));
            setNotificationMessage('Event deleted');
            setShowSuccessNotification(true);
            setTimeout(() => setShowSuccessNotification(false), 3000);
            setSelectedEvent(null);
          }}
          userColors={userColors}
        />
      )}
    </div>
  );
}
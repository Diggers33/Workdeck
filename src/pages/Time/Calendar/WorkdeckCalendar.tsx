import React, { useState, useEffect } from 'react';
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

  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  // Load events from API
  useEffect(() => {
    async function loadEvents() {
      try {
        setLoadingEvents(true);
        const { getEvents } = await import('../../../services/eventsApi');
        const { formatDate } = await import('../../../services/apiClient');
        
        // Get events for current month and surrounding months
        const today = new Date();
        const startDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
        const endDate = new Date(today.getFullYear(), today.getMonth() + 2, 0);
        
        const apiEvents = await getEvents(
          formatDate(startDate),
          formatDate(endDate)
        );

        // Transform API events to CalendarEvent format
        const transformed: CalendarEvent[] = apiEvents.map(event => ({
          id: event.id,
          title: event.title,
          project: event.project?.name || 'No project',
          projectColor: event.color || '#6B7280',
          task: event.task?.name,
          startTime: new Date(event.startAt),
          endTime: new Date(event.endAt),
          isTimesheet: event.timesheet,
          isBillable: event.billable,
          isPrivate: event.private,
          isExternal: event.externalMeeting,
          guests: event.guests?.map(g => g.user.fullName) || [],
          isRecurring: event.isRecurrent,
          hasSyncIssue: false, // API doesn't provide this
          createdBy: event.creator.fullName
        }));

        setEvents(transformed);
      } catch (error) {
        console.error('Error loading events:', error);
        setEvents([]);
      } finally {
        setLoadingEvents(false);
      }
    }

    loadEvents();
  }, [currentDate]);

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
    
    // Add the new event to the events array
    setEvents(prevEvents => [...prevEvents, newEvent]);

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
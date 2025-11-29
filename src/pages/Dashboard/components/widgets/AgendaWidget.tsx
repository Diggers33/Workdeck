import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight, CalendarDays, Coffee } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { EventModal } from '../calendar/EventModal';
import { CalendarEvent as ApiCalendarEvent, createEventFromTask, createEvent, updateEvent, deleteEvent } from '../../api/dashboardApi';


interface AgendaWidgetProps {
  draggedTask?: any;
  events?: ApiCalendarEvent[];
}

interface Event {
  id: string;
  start: number;
  duration: number;
  title: string;
  color: string;
  overlap?: number; // Which column in overlapping layout
  totalOverlaps?: number; // Total overlapping events
}

// Helper to parse date in DD/MM/YYYY HH:mm:ss+00:00 format
function parseWorkdeckDate(dateStr: string): Date {
  if (!dateStr) return new Date(NaN);

  // Try ISO format first
  let date = new Date(dateStr);
  if (!isNaN(date.getTime())) return date;

  // Parse DD/MM/YYYY HH:mm:ss+00:00 format
  const match = dateStr.match(/^(\d{2})\/(\d{2})\/(\d{4})\s+(\d{2}):(\d{2}):(\d{2})([+-]\d{2}:\d{2})?$/);
  if (match) {
    const [, day, month, year, hours, minutes, seconds, tz] = match;
    // Create ISO string: YYYY-MM-DDTHH:mm:ss+00:00
    const isoStr = `${year}-${month}-${day}T${hours}:${minutes}:${seconds}${tz || '+00:00'}`;
    date = new Date(isoStr);
  }

  return date;
}

// Helper to convert API events to internal format
function convertApiEventsToEvents(apiEvents: ApiCalendarEvent[]): Event[] {
  return apiEvents.map(event => {
    const startDate = parseWorkdeckDate(event.startAt);
    const endDate = parseWorkdeckDate(event.endAt);
    const startHour = startDate.getHours() + startDate.getMinutes() / 60;
    const endHour = endDate.getHours() + endDate.getMinutes() / 60;
    const duration = Math.max(0.25, endHour - startHour); // Minimum 15 minutes

    // Debug: log each event's parsed times
    console.log('[AgendaWidget] Parsing event:', {
      title: event.title,
      rawStartAt: event.startAt,
      rawEndAt: event.endAt,
      parsedStartDate: startDate.toString(),
      parsedEndDate: endDate.toString(),
      startHour,
      endHour,
      duration,
      isValidDate: !isNaN(startDate.getTime())
    });

    return {
      id: event.id,
      start: startHour,
      duration: duration,
      title: event.title,
      color: event.color || '#60A5FA'
    };
  });
}

export function AgendaWidget({ draggedTask, events: apiEvents }: AgendaWidgetProps) {
  const navigate = useNavigate();

  // Debug logging
  console.log('[AgendaWidget] apiEvents prop:', apiEvents);

  // Determine data state
  const eventsLoading = apiEvents === undefined;
  const eventsEmpty = Array.isArray(apiEvents) && apiEvents.length === 0;
  const hasApiEvents = Array.isArray(apiEvents) && apiEvents.length > 0;

  console.log('[AgendaWidget] eventsLoading:', eventsLoading, 'eventsEmpty:', eventsEmpty, 'hasApiEvents:', hasApiEvents);

  const [isDragOver, setIsDragOver] = useState(false);
  const [dragOverTime, setDragOverTime] = useState<number | null>(null);
  const [resizingEvent, setResizingEvent] = useState<{ id: string; edge: 'top' | 'bottom' } | null>(null);
  const [draggingEvent, setDraggingEvent] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<number>(0);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [createEventTime, setCreateEventTime] = useState<{ start: number; end: number } | null>(null); // For creating new event
  const [wasInteracting, setWasInteracting] = useState(false);
  const timelineRef = useRef<HTMLDivElement>(null);

  // Drawing new event state (click-drag to create)
  const [isDrawingEvent, setIsDrawingEvent] = useState(false);
  const [drawStartTime, setDrawStartTime] = useState<number | null>(null);
  const [drawEndTime, setDrawEndTime] = useState<number | null>(null);

  // Initialize events from API or empty
  const [events, setEvents] = useState<Event[]>(
    hasApiEvents ? convertApiEventsToEvents(apiEvents) : []
  );

  // Update events when API data changes
  useEffect(() => {
    if (Array.isArray(apiEvents)) {
      const converted = apiEvents.length > 0 ? convertApiEventsToEvents(apiEvents) : [];
      console.log('[AgendaWidget] Converting API events:', apiEvents, '-> converted:', converted);
      setEvents(converted);
    }
  }, [apiEvents]);

  // Log current events state
  console.log('[AgendaWidget] events state:', events);

  const currentHour = 14; // 2pm
  const startHour = 0;
  const endHour = 23;
  const pixelsPerHour = 60;

  const hours = Array.from({ length: endHour - startHour + 1 }, (_, i) => startHour + i);

  // Scroll to center current time on mount
  useEffect(() => {
    if (timelineRef.current) {
      const currentTimePosition = currentHour * pixelsPerHour;
      const containerHeight = timelineRef.current.clientHeight;
      const scrollPosition = currentTimePosition - (containerHeight / 2);
      
      timelineRef.current.scrollTop = scrollPosition;
    }
  }, []);

  // Calculate overlapping events and assign columns
  const getEventsWithOverlaps = (): Event[] => {
    const sorted = [...events].sort((a, b) => a.start - b.start);
    const withOverlaps: Event[] = [];
    
    sorted.forEach(event => {
      // Find overlapping events
      const overlapping = withOverlaps.filter(e => {
        const eventEnd = event.start + event.duration;
        const eEnd = e.start + e.duration;
        return (event.start < eEnd && eventEnd > e.start);
      });
      
      // Find first available column
      let column = 0;
      const usedColumns = overlapping.map(e => e.overlap || 0);
      while (usedColumns.includes(column)) {
        column++;
      }
      
      withOverlaps.push({
        ...event,
        overlap: column,
        totalOverlaps: Math.max(column + 1, ...overlapping.map(e => e.totalOverlaps || 1))
      });
    });
    
    // Update total overlaps for all events in each group
    const result = withOverlaps.map(event => {
      const group = withOverlaps.filter(e => {
        const eventEnd = event.start + event.duration;
        const eEnd = e.start + e.duration;
        return (event.start < eEnd && eventEnd > e.start);
      });
      const maxOverlaps = Math.max(...group.map(e => (e.overlap || 0) + 1));
      return { ...event, totalOverlaps: maxOverlaps };
    });
    
    return result;
  };

  const getTimeFromMousePosition = (e: React.MouseEvent | React.DragEvent): number | null => {
    if (!timelineRef.current) return null;

    const rect = timelineRef.current.getBoundingClientRect();
    const scrollTop = timelineRef.current.scrollTop;

    // Calculate Y position within the scrollable content
    // clientY is viewport-relative, rect.top is container's viewport position
    // scrollTop is how far the container is scrolled
    const relativeY = e.clientY - rect.top + scrollTop;

    // Debug logging
    console.log('[Agenda] getTimeFromMousePosition:', {
      clientY: e.clientY,
      rectTop: rect.top,
      scrollTop,
      relativeY,
      pixelsPerHour,
      startHour
    });

    // Calculate hour from Y position
    // relativeY / pixelsPerHour gives hours from top of timeline
    // Add startHour to get actual hour of day
    const rawHour = startHour + (relativeY / pixelsPerHour);

    // Round to nearest 15-minute increment
    const roundedHour = Math.round(rawHour * 4) / 4;

    // Clamp to valid range
    const clampedHour = Math.max(startHour, Math.min(endHour + 1, roundedHour));

    console.log('[Agenda] Calculated hour:', { rawHour, roundedHour, clampedHour });

    return clampedHour;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);

    const time = getTimeFromMousePosition(e);
    if (time !== null && time >= 0 && time <= 24) {
      setDragOverTime(time);
    }
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
    setDragOverTime(null);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);

    // Try to get task from dataTransfer first (HTML5 drag-and-drop), then fallback to prop
    let taskToAdd = draggedTask;
    const transferData = e.dataTransfer.getData('text/plain');
    if (transferData) {
      try {
        const parsedTask = JSON.parse(transferData);
        console.log('[Agenda] Drop - parsed from dataTransfer:', parsedTask.title);
        taskToAdd = parsedTask;
      } catch (err) {
        console.log('[Agenda] Drop - could not parse dataTransfer, using prop');
      }
    }

    console.log('[Agenda] Drop - task:', taskToAdd?.title, 'at hour:', dragOverTime);

    if (taskToAdd && dragOverTime !== null) {
      // Calculate start time based on drop position
      const today = new Date();
      const startHour = Math.floor(dragOverTime);
      const startMinute = Math.round((dragOverTime % 1) * 60);
      today.setHours(startHour, startMinute, 0, 0);
      const startAt = today.toISOString();

      console.log('[Agenda] Creating event from drop:', {
        taskId: taskToAdd.id,
        taskTitle: taskToAdd.title,
        startAt,
        startHour,
        startMinute,
        dragOverTime
      });

      // Create optimistic event
      const tempId = `temp-${Date.now()}`;
      const newEvent: Event = {
        id: tempId,
        start: dragOverTime,
        duration: 0.5, // 30 minutes default
        title: taskToAdd.title,
        color: taskToAdd.projectColor || '#60A5FA'
      };

      // Optimistic update
      setEvents(prev => [...prev, newEvent]);
      console.log('[Agenda] Added optimistic event:', newEvent);

      // Call API to create event
      try {
        console.log('[Agenda] Calling createEventFromTask API...');
        const createdEvent = await createEventFromTask(
          taskToAdd.id,
          taskToAdd.title,
          startAt,
          30 // 30 minutes duration
        );
        console.log('[Agenda] API response - created event:', createdEvent);
        // Update with real event data
        setEvents(prev => prev.map(ev =>
          ev.id === tempId ? { ...ev, id: createdEvent.id } : ev
        ));
        console.log('[Agenda] Updated event with real ID:', createdEvent.id);
      } catch (error: any) {
        console.error('[Agenda] Failed to create event from task:', error);
        console.error('[Agenda] Error details:', {
          message: error?.message,
          status: error?.status,
          response: error?.response
        });
        // Remove optimistic event on error
        setEvents(prev => prev.filter(ev => ev.id !== tempId));
        console.log('[Agenda] Removed optimistic event due to error');
      }
    }

    setDragOverTime(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragOver) {
      const time = getTimeFromMousePosition(e);
      if (time !== null && time >= 0 && time <= 24) {
        setDragOverTime(time);
      }
    }
  };

  const handleResizeStart = (eventId: string, edge: 'top' | 'bottom', e: React.MouseEvent) => {
    e.stopPropagation();
    setResizingEvent({ id: eventId, edge });
    setWasInteracting(true);
  };

  const handleResizeMove = (e: React.MouseEvent) => {
    if (!resizingEvent || !timelineRef.current) return;
    
    const event = events.find(ev => ev.id === resizingEvent.id);
    if (!event) return;
    
    const time = getTimeFromMousePosition(e);
    if (time === null) return;
    
    if (resizingEvent.edge === 'top') {
      // Resizing from top - change start time
      const newStart = Math.max(0, Math.min(time, event.start + event.duration - 0.25));
      const newDuration = (event.start + event.duration) - newStart;
      
      setEvents(prev => prev.map(ev => 
        ev.id === resizingEvent.id ? { ...ev, start: newStart, duration: newDuration } : ev
      ));
    } else {
      // Resizing from bottom - change duration (minimum 15 minutes = 0.25 hours)
      const newDuration = Math.max(0.25, time - event.start);
      
      setEvents(prev => prev.map(ev => 
        ev.id === resizingEvent.id ? { ...ev, duration: newDuration } : ev
      ));
    }
  };

  const handleResizeEnd = () => {
    if (resizingEvent) {
      const event = events.find(ev => ev.id === resizingEvent.id);
      if (event) {
        // Calculate new times
        const today = new Date();
        const startTime = new Date(today);
        startTime.setHours(Math.floor(event.start), Math.round((event.start % 1) * 60), 0, 0);
        const endTime = new Date(today);
        const endHour = event.start + event.duration;
        endTime.setHours(Math.floor(endHour), Math.round((endHour % 1) * 60), 0, 0);

        // Fire-and-forget API call - don't await, UI already updated optimistically
        updateEvent(event.id, {
          title: event.title,
          startAt: startTime.toISOString(),
          endAt: endTime.toISOString(),
          color: event.color,
        }).catch(error => {
          console.error('Failed to update event after resize:', error);
        });
      }
    }
    setResizingEvent(null);
    // Keep wasInteracting true briefly to prevent click from opening modal
    setTimeout(() => setWasInteracting(false), 50);
  };

  const handleDragStart = (eventId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setDraggingEvent(eventId);
    setWasInteracting(true);
  };

  const handleDragMove = (e: React.MouseEvent) => {
    if (!draggingEvent || !timelineRef.current) return;
    
    const event = events.find(ev => ev.id === draggingEvent);
    if (!event) return;
    
    const time = getTimeFromMousePosition(e);
    if (time === null) return;
    
    // Calculate new start time (snap to 15 minute increments)
    const newStart = Math.max(0, Math.min(23.75, time));
    
    setEvents(prev => prev.map(ev => 
      ev.id === draggingEvent ? { ...ev, start: newStart } : ev
    ));
  };

  const handleDragEnd = () => {
    if (draggingEvent) {
      const event = events.find(ev => ev.id === draggingEvent);
      if (event) {
        // Calculate new times
        const today = new Date();
        const startTime = new Date(today);
        startTime.setHours(Math.floor(event.start), Math.round((event.start % 1) * 60), 0, 0);
        const endTime = new Date(today);
        const endHour = event.start + event.duration;
        endTime.setHours(Math.floor(endHour), Math.round((endHour % 1) * 60), 0, 0);

        // Fire-and-forget API call - don't await, UI already updated optimistically
        updateEvent(event.id, {
          title: event.title,
          startAt: startTime.toISOString(),
          endAt: endTime.toISOString(),
          color: event.color,
        }).catch(error => {
          console.error('Failed to update event after drag:', error);
        });
      }
    }
    setDraggingEvent(null);
    // Keep wasInteracting true briefly to prevent click from opening modal
    setTimeout(() => setWasInteracting(false), 50);
  };

  const handleEventClick = (eventId: string, e: React.MouseEvent) => {
    // Only open modal if we're not in the middle of dragging or resizing
    if (!draggingEvent && !resizingEvent && !wasInteracting) {
      setSelectedEventId(eventId);
    }
  };

  // Handle mouse down on timeline to START drawing a new event
  const handleTimelineMouseDown = (e: React.MouseEvent) => {
    // Don't trigger if clicking on an event or during interactions
    if (draggingEvent || resizingEvent || wasInteracting) return;

    // Check if we clicked on an event
    const target = e.target as HTMLElement;
    if (target.closest('[data-event-id]')) return;

    const time = getTimeFromMousePosition(e);
    if (time !== null && time >= 0 && time <= 24) {
      const roundedTime = Math.round(time * 4) / 4;
      console.log('[Agenda] Start drawing event at:', roundedTime);
      setIsDrawingEvent(true);
      setDrawStartTime(roundedTime);
      setDrawEndTime(roundedTime + 0.5); // Default 30 min
      e.preventDefault(); // Prevent text selection
    }
  };

  // Handle mouse move while drawing
  const handleTimelineDrawMove = (e: React.MouseEvent) => {
    if (!isDrawingEvent || drawStartTime === null) return;

    const time = getTimeFromMousePosition(e);
    if (time !== null && time >= 0 && time <= 24) {
      const roundedTime = Math.round(time * 4) / 4;
      // Ensure minimum 15-minute duration and correct direction
      const newEnd = Math.max(drawStartTime + 0.25, roundedTime);
      setDrawEndTime(newEnd);
    }
  };

  // Handle mouse up to finish drawing and open modal
  const handleTimelineMouseUp = (e: React.MouseEvent) => {
    if (!isDrawingEvent || drawStartTime === null || drawEndTime === null) return;

    console.log('[Agenda] Finish drawing event:', drawStartTime, '-', drawEndTime);

    // Calculate final times (ensure at least 15 min duration)
    const start = drawStartTime;
    const end = Math.max(drawStartTime + 0.25, drawEndTime);

    // Open modal with calculated times - keep drawing state for placeholder!
    setCreateEventTime({ start, end });
    setIsDrawingEvent(false); // Stop active drawing but keep start/end for placeholder
  };

  const formatTime = (time: number): string => {
    const hours = Math.floor(time);
    const minutes = Math.round((time % 1) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const eventsWithOverlaps = getEventsWithOverlaps();

  // Debug: log eventsWithOverlaps before render
  console.log('[AgendaWidget] eventsWithOverlaps for render:', eventsWithOverlaps, 'count:', eventsWithOverlaps.length);

  // Convert event to calendar event format
  const selectedEvent = selectedEventId ? events.find(e => e.id === selectedEventId) : null;
  const calendarEvent = selectedEvent ? {
    id: selectedEvent.id,
    title: selectedEvent.title,
    startTime: (() => {
      const today = new Date();
      today.setHours(Math.floor(selectedEvent.start));
      today.setMinutes((selectedEvent.start % 1) * 60);
      today.setSeconds(0);
      return today;
    })(),
    endTime: (() => {
      const today = new Date();
      const endTime = selectedEvent.start + selectedEvent.duration;
      today.setHours(Math.floor(endTime));
      today.setMinutes((endTime % 1) * 60);
      today.setSeconds(0);
      return today;
    })(),
    color: selectedEvent.color,
    isTimesheet: true,
    isBillable: false
  } : null;

  return (
    <>
      {selectedEventId && calendarEvent && (
        <EventModal
          event={calendarEvent}
          onClose={() => setSelectedEventId(null)}
          onSave={async (updatedEvent) => {
            // Update the event in the list (optimistic)
            const startTime = new Date(updatedEvent.startTime);
            const endTime = new Date(updatedEvent.endTime);
            const start = startTime.getHours() + startTime.getMinutes() / 60;
            const end = endTime.getHours() + endTime.getMinutes() / 60;
            const duration = end - start;

            setEvents(prev => prev.map(ev =>
              ev.id === updatedEvent.id
                ? { ...ev, title: updatedEvent.title, start, duration }
                : ev
            ));
            setSelectedEventId(null);

            // Call API to update event
            try {
              await updateEvent(updatedEvent.id, {
                title: updatedEvent.title,
                startAt: startTime.toISOString(),
                endAt: endTime.toISOString(),
                color: updatedEvent.color,
              });
            } catch (error) {
              console.error('Failed to update event:', error);
            }
          }}
          onDelete={async (id) => {
            // Optimistic delete
            const deletedEvent = events.find(ev => ev.id === id);
            setEvents(prev => prev.filter(ev => ev.id !== id));
            setSelectedEventId(null);

            // Call API to delete event
            try {
              await deleteEvent(id);
            } catch (error) {
              console.error('Failed to delete event:', error);
              if (deletedEvent) {
                setEvents(prev => [...prev, deletedEvent]);
              }
            }
          }}
        />
      )}

      {/* Create Event Modal - shown after drawing event on timeline */}
      {createEventTime !== null && (
        <EventModal
          initialDate={(() => {
            const today = new Date();
            today.setHours(Math.floor(createEventTime.start), Math.round((createEventTime.start % 1) * 60), 0, 0);
            return today;
          })()}
          initialEndDate={(() => {
            const today = new Date();
            today.setHours(Math.floor(createEventTime.end), Math.round((createEventTime.end % 1) * 60), 0, 0);
            return today;
          })()}
          onClose={() => {
            setCreateEventTime(null);
            setDrawStartTime(null);
            setDrawEndTime(null);
          }}
          onSave={async (newEvent) => {
            console.log('[Agenda] Create modal onSave called with:', newEvent);

            const startTime = new Date(newEvent.startTime);
            const endTime = new Date(newEvent.endTime);
            const start = startTime.getHours() + startTime.getMinutes() / 60;
            const end = endTime.getHours() + endTime.getMinutes() / 60;
            const duration = end - start;

            console.log('[Agenda] Calculated times:', { startTime: startTime.toISOString(), endTime: endTime.toISOString(), start, end, duration });

            // Create optimistic event
            const tempId = `temp-${Date.now()}`;
            const optimisticEvent: Event = {
              id: tempId,
              start,
              duration,
              title: newEvent.title || 'New Event',
              color: newEvent.color || '#60A5FA'
            };

            setEvents(prev => [...prev, optimisticEvent]);
            setCreateEventTime(null);
            setDrawStartTime(null);
            setDrawEndTime(null);
            console.log('[Agenda] Added optimistic event:', optimisticEvent);

            // Call API to create event
            try {
              console.log('[Agenda] Calling createEvent API...');
              const createdEvent = await createEvent({
                title: newEvent.title || 'New Event',
                startAt: startTime.toISOString(),
                endAt: endTime.toISOString(),
                color: newEvent.color,
                private: false,
                billable: false,
              });
              console.log('[Agenda] API response - created event:', createdEvent);
              // Update with real event ID
              setEvents(prev => prev.map(ev =>
                ev.id === tempId ? { ...ev, id: createdEvent.id } : ev
              ));
              console.log('[Agenda] Updated event with real ID:', createdEvent.id);
            } catch (error: any) {
              console.error('[Agenda] Failed to create event:', error);
              console.error('[Agenda] Error details:', {
                message: error?.message,
                status: error?.status,
                response: error?.response
              });
              // Remove optimistic event on error
              setEvents(prev => prev.filter(ev => ev.id !== tempId));
              console.log('[Agenda] Removed optimistic event due to error');
            }
          }}
        />
      )}
      <div 
        className="bg-white rounded-lg relative overflow-hidden" 
        style={{ 
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
          height: '100%', 
          display: 'flex', 
          flexDirection: 'column'
        }}
        onMouseMove={resizingEvent ? handleResizeMove : (draggingEvent ? handleDragMove : undefined)}
        onMouseUp={resizingEvent ? handleResizeEnd : (draggingEvent ? handleDragEnd : undefined)}
        onMouseLeave={resizingEvent ? handleResizeEnd : (draggingEvent ? handleDragEnd : undefined)}
      >
        {/* Colored top accent */}
        <div className="absolute left-0 right-0 top-0 h-1" style={{ background: 'linear-gradient(90deg, #FBBF24 0%, #FDE68A 100%)' }}></div>
        
        {/* Header */}
        <div className="px-3 py-2 border-b border-[#E5E7EB]" style={{ minHeight: '36px' }}>
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#FBBF24]" />
              <h3 className="text-[14px] font-medium text-[#1F2937]">Today</h3>
              {hasApiEvents && (
                <span className="text-[10px] text-[#10B981] font-medium">(Live)</span>
              )}
            </div>
            <div className="flex items-center gap-1">
              <button className="p-0.5 hover:bg-[#F9FAFB] rounded transition-colors">
                <ChevronLeft className="w-4 h-4 text-[#6B7280]" />
              </button>
              <button className="p-0.5 hover:bg-[#F9FAFB] rounded transition-colors">
                <ChevronRight className="w-4 h-4 text-[#6B7280]" />
              </button>
            </div>
          </div>
          <p className="text-[10px] text-[#9CA3AF]">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>

        {/* Timeline */}
        <div
          ref={timelineRef}
          className="px-2 py-1.5 custom-scrollbar"
          style={{ flex: 1, overflowY: 'auto', position: 'relative' }}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onMouseMove={handleMouseMove}
        >
          {/* Loading overlay - shows spinner over timeline while loading */}
          {eventsLoading && (
            <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center z-20">
              <div className="w-6 h-6 border-2 border-[#FBBF24] border-t-transparent rounded-full animate-spin mb-2"></div>
              <p className="text-[12px] text-[#9CA3AF]">Loading calendar...</p>
            </div>
          )}

          {/* Timeline content - ALWAYS visible so users can click/drag to create events */}
          <div
            style={{ position: 'relative', height: `${(endHour - startHour + 1) * pixelsPerHour}px`, userSelect: 'none' }}
            onMouseDown={handleTimelineMouseDown}
            onMouseMove={handleTimelineDrawMove}
            onMouseUp={handleTimelineMouseUp}
            onMouseLeave={() => {
              // Cancel drawing if mouse leaves timeline
              if (isDrawingEvent) {
                setIsDrawingEvent(false);
                setDrawStartTime(null);
                setDrawEndTime(null);
              }
            }}
          >
            {/* Hour grid */}
            {hours.map((hour) => (
              <div 
                key={hour}
                className="border-b border-[#F3F4F6]"
                style={{ 
                  height: `${pixelsPerHour}px`, 
                  position: 'absolute',
                  top: `${(hour - startHour) * pixelsPerHour}px`,
                  left: 0,
                  right: 0
                }}
              >
                <div className="absolute left-0 top-0.5 text-[10px] font-medium text-[#9CA3AF] w-10">
                  {hour}:00
                </div>
              </div>
            ))}

            {/* Current time indicator - positioned in events column (after 40px hour labels) */}
            <div
              className="pointer-events-none"
              style={{
                position: 'absolute',
                left: '36px',
                right: '4px',
                top: `${((currentHour - startHour) * pixelsPerHour)}px`,
                display: 'flex',
                alignItems: 'center',
                zIndex: 10
              }}
            >
              <div className="w-2 h-2 rounded-full bg-[#EF4444]" style={{ marginLeft: '-4px' }}></div>
              <div className="flex-1 h-0.5 bg-[#EF4444]"></div>
            </div>

            {/* Drop indicator line */}
            {isDragOver && dragOverTime !== null && (
              <div
                className="pointer-events-none"
                style={{
                  position: 'absolute',
                  left: '40px',
                  right: '6px',
                  top: `${dragOverTime * pixelsPerHour}px`,
                  height: '2px',
                  background: '#3B82F6',
                  zIndex: 15
                }}
              >
                <div 
                  className="text-[9px] text-[#3B82F6] font-medium bg-white px-1 rounded"
                  style={{ position: 'absolute', left: 0, top: '-10px' }}
                >
                  {formatTime(dragOverTime)}
                </div>
              </div>
            )}

            {/* Events */}
            {eventsWithOverlaps.map((event) => {
              const totalOverlaps = event.totalOverlaps || 1;
              const overlap = event.overlap || 0;
              const widthPercent = 100 / totalOverlaps;
              const leftPercent = (overlap * widthPercent);
              
              // Calculate if event is short (less than 45 minutes)
              const isShortEvent = event.duration < 0.75;
              const calculatedHeight = event.duration * pixelsPerHour;
              const minEventHeight = 42; // Minimum height to show title properly
              const actualHeight = Math.max(calculatedHeight, minEventHeight);

              return (
                <div
                  key={event.id}
                  data-event-id={event.id}
                  className="cursor-move hover:opacity-90 transition-opacity group select-none"
                  style={{
                    position: 'absolute',
                    left: `calc(40px + ${leftPercent}%)`,
                    width: `calc(${widthPercent}% - ${totalOverlaps > 1 ? 2 : 6}px)`,
                    top: `${event.start * pixelsPerHour}px`,
                    height: `${actualHeight}px`,
                    backgroundColor: event.color,
                    borderRadius: '4px',
                    padding: '0',
                    zIndex: draggingEvent === event.id ? 15 : 5,
                    opacity: draggingEvent === event.id ? 0.7 : 1,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                  }}
                  onClick={(e) => handleEventClick(event.id, e)}
                >
                  {/* Top resize handle */}
                  <div
                    className="resize-handle"
                    style={{ 
                      height: '6px',
                      width: '100%',
                      cursor: 'ns-resize',
                      background: 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderTopLeftRadius: '4px',
                      borderTopRightRadius: '4px',
                      transition: 'background 150ms'
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      handleResizeStart(event.id, 'top', e);
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div style={{
                      width: '20px',
                      height: '2px',
                      borderRadius: '2px',
                      background: 'rgba(255, 255, 255, 0.5)',
                      opacity: 0,
                      transition: 'opacity 150ms'
                    }} className="group-hover:opacity-100" />
                  </div>
                  
                  {/* Event content */}
                  <div
                    style={{
                      flex: 1,
                      padding: isShortEvent ? '4px 6px' : '6px 8px',
                      display: 'flex',
                      flexDirection: isShortEvent ? 'row' : 'column',
                      alignItems: isShortEvent ? 'center' : 'flex-start',
                      gap: isShortEvent ? '6px' : '0',
                      overflow: 'hidden',
                      cursor: 'move'
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      handleDragStart(event.id, e);
                    }}
                  >
                    <div className={`${isShortEvent ? 'text-[10px]' : 'text-[11px]'} font-medium text-white leading-tight overflow-hidden whitespace-nowrap text-ellipsis`} style={{ flex: isShortEvent ? 1 : undefined }}>
                      {event.title}
                    </div>
                    <div className={`${isShortEvent ? 'text-[9px]' : 'text-[9px]'} text-white opacity-80 ${isShortEvent ? '' : 'mt-0.5'} whitespace-nowrap flex-shrink-0`}>
                      {formatTime(event.start)}{isShortEvent ? '' : ` - ${formatTime(event.start + event.duration)}`}
                    </div>
                  </div>
                  
                  {/* Bottom resize handle */}
                  <div
                    className="resize-handle"
                    style={{ 
                      height: '6px',
                      width: '100%',
                      cursor: 'ns-resize',
                      background: 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderBottomLeftRadius: '4px',
                      borderBottomRightRadius: '4px',
                      transition: 'background 150ms'
                    }}
                    onMouseDown={(e) => {
                      e.stopPropagation();
                      handleResizeStart(event.id, 'bottom', e);
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'rgba(255, 255, 255, 0.25)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                    }}
                  >
                    <div style={{
                      width: '20px',
                      height: '2px',
                      borderRadius: '2px',
                      background: 'rgba(255, 255, 255, 0.5)',
                      opacity: 0,
                      transition: 'opacity 150ms'
                    }} className="group-hover:opacity-100" />
                  </div>
                </div>
              );
            })}

            {/* Drawing preview - shows while drawing OR while modal is open */}
            {((isDrawingEvent && drawStartTime !== null && drawEndTime !== null) || createEventTime !== null) && (
              <div
                style={{
                  position: 'absolute',
                  left: '40px',
                  right: '6px',
                  top: `${(createEventTime?.start ?? drawStartTime ?? 0) * pixelsPerHour}px`,
                  height: `${Math.max(0.25, (createEventTime?.end ?? drawEndTime ?? 0) - (createEventTime?.start ?? drawStartTime ?? 0)) * pixelsPerHour}px`,
                  backgroundColor: 'rgba(96, 165, 250, 0.3)',
                  border: '2px dashed #60A5FA',
                  borderRadius: '4px',
                  pointerEvents: 'none',
                  zIndex: 15,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <span className="text-[11px] font-medium text-[#3B82F6] bg-white/80 px-2 py-0.5 rounded">
                  {formatTime(createEventTime?.start ?? drawStartTime ?? 0)} - {formatTime(createEventTime?.end ?? drawEndTime ?? 0)}
                </span>
              </div>
            )}

            {/* Subtle empty state indicator - only shown when NO events exist (local state) */}
            {events.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center opacity-50">
                  <Coffee className="w-8 h-8 text-[#D1D5DB] mx-auto mb-1" />
                  <p className="text-[11px] text-[#9CA3AF]">Click or drag to add events</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Drop hint */}
        {isDragOver && (
          <div 
            className="absolute top-14 left-1/2 transform -translate-x-1/2 pointer-events-none z-20"
          >
            <div className="bg-[#3B82F6] text-white px-3 py-1.5 rounded text-[12px] font-medium shadow-lg">
              Drop to schedule {dragOverTime !== null && `at ${formatTime(dragOverTime)}`}
            </div>
          </div>
        )}

        {/* Footer */}
        <div className="px-3 py-1.5 border-t border-[#E5E7EB]" style={{ minHeight: '30px' }}>
          <button
            onClick={() => navigate('/calendar')}
            className="text-[11px] text-[#3B82F6] hover:text-[#2563EB]"
          >
            Full calendar →
          </button>
        </div>
      </div>
    </>
  );
}
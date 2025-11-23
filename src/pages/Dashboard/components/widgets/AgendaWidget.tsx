import React, { useState, useRef, useEffect } from 'react';
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react';

interface AgendaWidgetProps {
  draggedTask?: any;
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

export function AgendaWidget({ draggedTask }: AgendaWidgetProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [dragOverTime, setDragOverTime] = useState<number | null>(null);
  const [resizingEvent, setResizingEvent] = useState<string | null>(null);
  const [draggingEvent, setDraggingEvent] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState<number>(0);
  const timelineRef = useRef<HTMLDivElement>(null);
  
  const [events, setEvents] = useState<Event[]>([
    { id: '1', start: 9, duration: 1, title: 'Team standup', color: '#8B5CF6' },
    { id: '2', start: 10.5, duration: 0.5, title: 'Client call - BIOGEMSE', color: '#10B981' },
    { id: '3', start: 14, duration: 1.5, title: 'Project review', color: '#F59E0B' },
    { id: '4', start: 15, duration: 1, title: 'Finalize Q4 goals', color: '#60A5FA' },
    { id: '5', start: 16, duration: 1, title: 'Design sync', color: '#3B82F6' }
  ]);

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

  const getTimeFromMousePosition = (e: React.PointerEvent): number | null => {
    if (!timelineRef.current) return null;
    
    const rect = timelineRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top + timelineRef.current.scrollTop;
    
    // Calculate time based on position (in 15-minute increments)
    const totalMinutes = (y / pixelsPerHour) * 60;
    const roundedMinutes = Math.round(totalMinutes / 15) * 15;
    const hours = Math.floor(roundedMinutes / 60);
    const minutes = roundedMinutes % 60;
    
    return hours + minutes / 60;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
    
    const time = getTimeFromPointerPosition(e as any);
    if (time !== null && time >= 0 && time <= 24) {
      setDragOverTime(time);
    }
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
    setDragOverTime(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (draggedTask && dragOverTime !== null) {
      const newEvent: Event = {
        id: `task-${Date.now()}`,
        start: dragOverTime,
        duration: 0.5, // 30 minutes default
        title: draggedTask.title,
        color: '#60A5FA'
      };
      
      setEvents(prev => [...prev, newEvent]);
    }
    
    setDragOverTime(null);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (isDragOver) {
      const time = getTimeFromPointerPosition(e);
      if (time !== null && time >= 0 && time <= 24) {
        setDragOverTime(time);
      }
    }
  };

  const handleResizeStart = (eventId: string, e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);
    setResizingEvent(eventId);
  };

  const handleResizeMove = (e: React.PointerEvent) => {
    if (!resizingEvent || !timelineRef.current) return;
    
    const event = events.find(ev => ev.id === resizingEvent);
    if (!event) return;
    
    const time = getTimeFromPointerPosition(e);
    if (time === null) return;
    
    // Calculate new duration (minimum 15 minutes = 0.25 hours)
    const newDuration = Math.max(0.25, time - event.start);
    
    setEvents(prev => prev.map(ev => 
      ev.id === resizingEvent ? { ...ev, duration: newDuration } : ev
    ));
  };

  const handleResizeEnd = (e?: PointerEvent) => {
    if (e && e.target && 'releasePointerCapture' in e.target) {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    }
    setResizingEvent(null);
  };

  const handleDragStart = (eventId: string, e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);
    setDraggingEvent(eventId);
  };

  const handleDragMove = (e: React.PointerEvent) => {
    if (!draggingEvent || !timelineRef.current) return;
    
    const event = events.find(ev => ev.id === draggingEvent);
    if (!event) return;
    
    const time = getTimeFromPointerPosition(e);
    if (time === null) return;
    
    // Calculate new start time (snap to 15 minute increments)
    const newStart = Math.max(0, Math.min(23.75, time));
    
    setEvents(prev => prev.map(ev => 
      ev.id === draggingEvent ? { ...ev, start: newStart } : ev
    ));
  };

  const handleDragEnd = (e?: PointerEvent) => {
    if (e && e.target && 'releasePointerCapture' in e.target) {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    }
    setDraggingEvent(null);
  };

  const formatTime = (time: number): string => {
    const hours = Math.floor(time);
    const minutes = Math.round((time % 1) * 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const eventsWithOverlaps = getEventsWithOverlaps();

  return (
    <div 
      className="bg-white rounded-lg relative overflow-hidden" 
      style={{ 
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)', 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column'
      }}
      onPointerMove={resizingEvent ? handleResizeMove : (draggingEvent ? handleDragMove : undefined)}
      onPointerUp={resizingEvent ? handleResizeEnd : (draggingEvent ? handleDragEnd : undefined)}
      onPointerLeave={resizingEvent ? handleResizeEnd : (draggingEvent ? handleDragEnd : undefined)}
    >
      {/* Colored top accent */}
      <div className="absolute left-0 right-0 top-0 h-1" style={{ background: 'linear-gradient(90deg, #FBBF24 0%, #FDE68A 100%)' }}></div>
      
      {/* Header */}
      <div className="px-3 py-2 border-b border-[#E5E7EB]" style={{ minHeight: '36px' }}>
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-[#FBBF24]" />
            <h3 className="text-[14px] font-medium text-[#1F2937]">Today</h3>
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
        <p className="text-[10px] text-[#9CA3AF]">Saturday, November 22</p>
      </div>

      {/* Timeline */}
      <div 
        ref={timelineRef}
        className="px-2 py-1.5 custom-scrollbar" 
        style={{ flex: 1, overflowY: 'auto', position: 'relative' }}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onMouseMove={handlePointerMove}
      >
        <div style={{ position: 'relative', height: `${(endHour - startHour + 1) * pixelsPerHour}px` }}>
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

          {/* Current time indicator */}
          <div 
            className="pointer-events-none"
            style={{ 
              position: 'absolute',
              left: 0,
              right: 0,
              top: `${((currentHour - startHour) * pixelsPerHour)}px`,
              display: 'flex',
              alignItems: 'center',
              zIndex: 10
            }}
          >
            <div className="w-1.5 h-1.5 rounded-full bg-[#EF4444] ml-0.5"></div>
            <div className="flex-1 h-0.5 bg-[#EF4444] opacity-70"></div>
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
            
            return (
              <div
                key={event.id}
                className="cursor-move hover:opacity-90 transition-opacity group select-none"
                style={{
                  position: 'absolute',
                  left: `calc(40px + ${leftPercent}%)`,
                  width: `calc(${widthPercent}% - ${totalOverlaps > 1 ? 2 : 6}px)`,
                  top: `${event.start * pixelsPerHour}px`,
                  height: `${event.duration * pixelsPerHour}px`,
                  backgroundColor: event.color,
                  borderRadius: '4px',
                  padding: '6px 8px',
                  zIndex: draggingEvent === event.id ? 15 : 5,
                  minHeight: '30px',
                  opacity: draggingEvent === event.id ? 0.7 : 1,
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  touchAction: 'none'
                }}
                onPointerDown={(e) => handleDragStart(event.id, e)}
                onTouchStart={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                }}
              >
                <div className="text-[11px] font-medium text-white leading-tight overflow-hidden">
                  {event.title}
                </div>
                <div className="text-[9px] text-white opacity-80 mt-0.5">
                  {formatTime(event.start)} - {formatTime(event.start + event.duration)}
                </div>
                
                {/* Resize handle */}
                <div
                  className="absolute bottom-0 left-0 right-0 h-2 cursor-ns-resize opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'rgba(0,0,0,0.2)' }}
                  onPointerDown={(e) => handleResizeStart(event.id, e)}
                  onTouchStart={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                  }}
                />
              </div>
            );
          })}
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
        <button className="text-[11px] text-[#3B82F6] hover:text-[#2563EB]">
          Full calendar →
        </button>
      </div>
    </div>
  );
}
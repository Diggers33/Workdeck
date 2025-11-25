import React, { useState } from 'react';
import { ChevronDown, ChevronRight, AlertTriangle, X, Edit2, Search, GripVertical, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CalendarTask } from './WorkdeckCalendar';
import { TaskCompletionModal } from './TaskCompletionModal';

interface CalendarLeftSidebarProps {
  tasks: CalendarTask[];
  selectedColumn?: string;
  onColumnChange?: (column: string) => void;
  onTaskDrag: (task: CalendarTask) => void;
  selectedCalendars: string[];
  onCalendarsChange: (calendars: string[]) => void;
}

export function CalendarLeftSidebar({
  tasks,
  selectedColumn: selectedColumnProp,
  onColumnChange: onColumnChangeProp,
  onTaskDrag,
  selectedCalendars,
  onCalendarsChange
}: CalendarLeftSidebarProps) {
  const navigate = useNavigate();
  // Internal state for column selection if not controlled externally
  const [internalSelectedColumn, setInternalSelectedColumn] = useState('All tasks');
  const selectedColumn = selectedColumnProp ?? internalSelectedColumn;
  const onColumnChange = onColumnChangeProp ?? setInternalSelectedColumn;
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set());
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [taskToComplete, setTaskToComplete] = useState<CalendarTask | null>(null);
  const [searchCalendar, setSearchCalendar] = useState('');
  const [weekSummaryCollapsed, setWeekSummaryCollapsed] = useState(true);
  const [teamCalendarsCollapsed, setTeamCalendarsCollapsed] = useState(false); // Start expanded so users see search
  const [compactMode, setCompactMode] = useState(false);
  const [hoveredTask, setHoveredTask] = useState<string | null>(null);

  const columns = [
    { id: 'All tasks', count: 15 },
    { id: 'On-Going', count: 3 },
    { id: 'To Do', count: 5 },
    { id: 'Workdeck', count: 2 },
  ];

  const allCalendars = [
    { id: 'Colm Digby (You)', name: 'Colm Digby (You)', color: '#0066FF' },
    { id: 'Geraldine Mc Nerney', name: 'Geraldine Mc Nerney', color: '#F59E0B' },
    { id: 'Colm Test', name: 'Colm Test', color: '#10B981' },
    { id: 'Guest User', name: 'Guest User', color: '#6B7280' },
  ];

  const toggleTaskExpand = (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const newExpanded = new Set(expandedTasks);
    if (newExpanded.has(taskId)) {
      newExpanded.delete(taskId);
    } else {
      newExpanded.add(taskId);
    }
    setExpandedTasks(newExpanded);
  };

  const getProgressPercentage = (task: CalendarTask) => {
    if (task.estimatedHours === 0) return 0;
    return Math.min(100, (task.loggedHours / task.estimatedHours) * 100);
  };

  const getProgressColor = (task: CalendarTask) => {
    const percentage = getProgressPercentage(task);
    if (task.loggedHours > task.estimatedHours) return '#F97316';
    if (percentage === 100) return '#10B981';
    if (percentage > 0) return '#0066FF';
    return '#E5E7EB';
  };

  const getStatusIcon = (task: CalendarTask) => {
    const percentage = getProgressPercentage(task);
    if (percentage === 100) return '✓';
    if (task.loggedHours === 0) return '⚠️';
    return '';
  };

  // Calculate weekly summary
  const totalScheduled = tasks.reduce((sum, task) => sum + task.loggedHours, 0);
  const totalEstimated = tasks.reduce((sum, task) => sum + task.estimatedHours, 0);
  const totalUnscheduled = tasks.reduce((sum, task) => {
    const remaining = task.estimatedHours - task.loggedHours;
    return sum + (remaining > 0 ? remaining : 0);
  }, 0);
  const unscheduledCount = tasks.filter(t => t.loggedHours === 0).length;

  return (
    <div style={{
      width: '320px',
      flexShrink: 0,
      background: 'white',
      borderRight: '1px solid #E5E7EB',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #E5E7EB', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#0A0A0A', margin: 0 }}>
            My Tasks {tasks.length > 0 && <span style={{ color: '#6B7280', fontWeight: 400 }}>({tasks.length})</span>}
          </h3>
          <button
            onClick={() => setCompactMode(!compactMode)}
            style={{
              padding: '4px 8px',
              border: '1px solid #E5E7EB',
              borderRadius: '4px',
              background: compactMode ? '#F9FAFB' : 'white',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 500,
              color: '#6B7280',
              transition: 'all 150ms'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
            onMouseLeave={(e) => e.currentTarget.style.background = compactMode ? '#F9FAFB' : 'white'}
          >
            {compactMode ? 'Normal' : 'Compact'}
          </button>
        </div>
      </div>

      {/* Column Filter */}
      <div style={{ padding: '12px 20px', borderBottom: '1px solid #E5E7EB', flexShrink: 0 }}>
        <div style={{ position: 'relative', display: 'flex', gap: '8px' }}>
          <button
            onClick={() => setShowColumnPicker(!showColumnPicker)}
            style={{
              flex: 1,
              height: '32px',
              padding: '0 10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              border: '1px solid #E5E7EB',
              borderRadius: '6px',
              background: 'white',
              cursor: 'pointer',
              fontSize: '13px',
              color: '#0A0A0A',
              fontWeight: 500
            }}
          >
            {selectedColumn}
            <ChevronDown size={14} />
          </button>

          <button
            onClick={() => navigate('/work/my-tasks')}
            style={{
              height: '32px',
              padding: '0 10px',
              border: '1px solid #E5E7EB',
              borderRadius: '6px',
              background: 'white',
              cursor: 'pointer',
              fontSize: '11px',
              fontWeight: 500,
              color: '#0066FF',
              transition: 'all 150ms',
              whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
          >
            Open board →
          </button>

          {showColumnPicker && (
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
                onClick={() => setShowColumnPicker(false)}
              />
              <div style={{
                position: 'absolute',
                top: '36px',
                left: 0,
                right: 0,
                background: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '6px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                zIndex: 999,
                overflow: 'hidden'
              }}>
                <div style={{ padding: '6px 12px', borderBottom: '1px solid #E5E7EB' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', letterSpacing: '0.05em' }}>
                    MY COLUMNS
                  </div>
                </div>
                {columns.map(col => (
                  <button
                    key={col.id}
                    onClick={() => {
                      onColumnChange(col.id);
                      setShowColumnPicker(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: selectedColumn === col.id ? '#EFF6FF' : 'transparent',
                      border: 'none',
                      fontSize: '13px',
                      color: selectedColumn === col.id ? '#0066FF' : '#0A0A0A',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontWeight: selectedColumn === col.id ? 500 : 400
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = selectedColumn === col.id ? '#EFF6FF' : '#F9FAFB'}
                    onMouseLeave={(e) => e.currentTarget.style.background = selectedColumn === col.id ? '#EFF6FF' : 'transparent'}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {selectedColumn === col.id && <Check size={14} color="#0066FF" />}
                      <span>{col.id}</span>
                    </div>
                    <span style={{ color: '#6B7280' }}>({col.count})</span>
                  </button>
                ))}

                <div style={{ padding: '6px 12px', borderTop: '1px solid #E5E7EB', borderBottom: '1px solid #E5E7EB' }}>
                  <div style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', letterSpacing: '0.05em' }}>
                    OTHER VIEWS
                  </div>
                </div>
                <button
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    background: 'transparent',
                    border: 'none',
                    fontSize: '13px',
                    color: '#0A0A0A',
                    cursor: 'pointer',
                    textAlign: 'left'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  Unscheduled only
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Weekly Summary - Collapsible */}
      <div style={{
        borderBottom: '1px solid #E5E7EB',
        flexShrink: 0
      }}>
        <button
          onClick={() => setWeekSummaryCollapsed(!weekSummaryCollapsed)}
          style={{
            width: '100%',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: 'none',
            background: weekSummaryCollapsed ? 'transparent' : '#F9FAFB',
            cursor: 'pointer',
            fontSize: '13px',
            textAlign: 'left',
            transition: 'background 150ms'
          }}
          onMouseEnter={(e) => !weekSummaryCollapsed && (e.currentTarget.style.background = '#F3F4F6')}
          onMouseLeave={(e) => !weekSummaryCollapsed && (e.currentTarget.style.background = '#F9FAFB')}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
            {weekSummaryCollapsed ? <ChevronRight size={16} color="#6B7280" /> : <ChevronDown size={16} color="#6B7280" />}
            <span style={{ fontWeight: 600, color: '#0A0A0A' }}>This Week</span>
            {weekSummaryCollapsed && (
              <span style={{ fontSize: '12px', color: '#6B7280' }}>
                {totalScheduled.toFixed(1)}h / {totalEstimated.toFixed(1)}h
                {unscheduledCount > 0 && ` · ${unscheduledCount} unscheduled`}
              </span>
            )}
          </div>
          {weekSummaryCollapsed && unscheduledCount > 0 && <AlertTriangle size={14} color="#F97316" />}
        </button>

        {!weekSummaryCollapsed && (
          <div style={{ padding: '0 20px 16px 20px' }}>
            <div style={{ fontSize: '13px', color: '#374151', marginBottom: '4px' }}>
              <span style={{ fontWeight: 500 }}>Scheduled:</span> {totalScheduled.toFixed(1)}h
            </div>
            <div style={{ fontSize: '13px', color: '#374151', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
              <span><span style={{ fontWeight: 500 }}>Unscheduled:</span> {totalUnscheduled.toFixed(1)}h ({unscheduledCount} tasks)</span>
              {unscheduledCount > 0 && <AlertTriangle size={14} color="#F97316" />}
            </div>
            <div style={{ fontSize: '12px', color: '#6B7280', fontStyle: 'italic' }}>
              Drag tasks to calendar to schedule time
            </div>
          </div>
        )}
      </div>

      {/* Task List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 20px' }}>
        {tasks.map(task => {
          const isExpanded = expandedTasks.has(task.id);
          const progress = getProgressPercentage(task);
          const progressColor = getProgressColor(task);
          const isOverBudget = task.loggedHours > task.estimatedHours;
          const isComplete = progress === 100;
          const statusIcon = getStatusIcon(task);
          const isHovered = hoveredTask === task.id;

          if (compactMode) {
            // ULTRA-COMPACT MODE - Single line
            return (
              <div
                key={task.id}
                draggable
                onDragStart={(e) => {
                  onTaskDrag(task);
                  e.dataTransfer.effectAllowed = 'copy';
                  e.dataTransfer.setData('task', JSON.stringify(task));
                }}
                onClick={(e) => toggleTaskExpand(task.id, e)}
                style={{
                  marginBottom: '4px',
                  padding: '8px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px',
                  background: 'white',
                  cursor: 'grab',
                  transition: 'all 150ms',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = '#D1D5DB';
                  e.currentTarget.style.boxShadow = '0 1px 4px rgba(0,0,0,0.06)';
                  setHoveredTask(task.id);
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.boxShadow = 'none';
                  setHoveredTask(null);
                }}
              >
                {isHovered && <GripVertical size={12} color="#9CA3AF" style={{ flexShrink: 0 }} />}
                <div
                  style={{
                    width: '3px',
                    height: '12px',
                    borderRadius: '2px',
                    background: task.projectColor,
                    flexShrink: 0
                  }}
                />
                <div style={{ flex: 1, minWidth: 0, fontSize: '12px', color: '#0A0A0A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  <span style={{ fontWeight: 500 }}>{task.project}</span> — {task.title}
                </div>
                <div style={{ fontSize: '12px', color: '#6B7280', flexShrink: 0 }}>
                  {task.loggedHours}/{task.estimatedHours}h
                </div>
                {progress > 0 && progress < 100 && (
                  <div style={{ fontSize: '11px', color: '#6B7280', flexShrink: 0 }}>
                    {Math.round(progress)}%
                  </div>
                )}
                {statusIcon && <span style={{ flexShrink: 0 }}>{statusIcon}</span>}
              </div>
            );
          }

          // NORMAL MODE - 2 lines with progress bar
          return (
            <div
              key={task.id}
              draggable
              onDragStart={(e) => {
                onTaskDrag(task);
                e.dataTransfer.effectAllowed = 'copy';
                e.dataTransfer.setData('task', JSON.stringify(task));
                // Prevent click event after drag
                const target = e.currentTarget;
                target.style.opacity = '0.5';
              }}
              onDragEnd={(e) => {
                e.currentTarget.style.opacity = '1';
              }}
              onClick={(e) => {
                if (e.target === e.currentTarget || (e.target as HTMLElement).closest('.task-main')) {
                  toggleTaskExpand(task.id, e);
                }
              }}
              style={{
                marginBottom: '8px',
                border: '1px solid #E5E7EB',
                borderRadius: '6px',
                background: 'white',
                cursor: 'grab',
                transition: 'all 150ms',
                overflow: 'hidden'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#D1D5DB';
                e.currentTarget.style.boxShadow = '0 2px 6px rgba(0,0,0,0.06)';
                setHoveredTask(task.id);
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E5E7EB';
                e.currentTarget.style.boxShadow = 'none';
                setHoveredTask(null);
              }}
            >
              {/* Line 1: Project + Task + Stats */}
              <div className="task-main" style={{ padding: '10px 10px 8px 10px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isHovered && <GripVertical size={14} color="#9CA3AF" style={{ flexShrink: 0 }} />}
                <div
                  style={{
                    width: '3px',
                    height: '14px',
                    borderRadius: '2px',
                    background: task.projectColor,
                    flexShrink: 0
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', color: '#0A0A0A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <span style={{ fontWeight: 500 }}>{task.project}</span>
                    <span style={{ color: '#6B7280' }}> — {task.title}</span>
                  </div>
                </div>
                <div style={{ fontSize: '12px', color: '#6B7280', flexShrink: 0, fontWeight: 500 }}>
                  {task.loggedHours}/{task.estimatedHours}h
                </div>
                {statusIcon && <span style={{ flexShrink: 0, fontSize: '14px' }}>{statusIcon}</span>}
                <button
                  onClick={(e) => toggleTaskExpand(task.id, e)}
                  style={{
                    width: '20px',
                    height: '20px',
                    padding: 0,
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    color: '#9CA3AF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                </button>
              </div>

              {/* Line 2: Progress Bar */}
              <div style={{ padding: '0 10px 10px 10px' }}>
                <div style={{
                  height: '4px',
                  background: '#F3F4F6',
                  borderRadius: '2px',
                  overflow: 'hidden',
                  position: 'relative'
                }}>
                  <div style={{
                    width: `${Math.min(100, progress)}%`,
                    height: '100%',
                    background: progressColor,
                    transition: 'width 300ms ease'
                  }} />
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div style={{
                  padding: '12px 10px',
                  borderTop: '1px solid #E5E7EB',
                  background: '#FAFBFC',
                  fontSize: '12px'
                }}>
                  <div style={{ marginBottom: '8px', color: '#374151' }}>
                    <div style={{ marginBottom: '4px' }}><span style={{ fontWeight: 500 }}>Estimated:</span> {task.estimatedHours}h</div>
                    <div style={{ marginBottom: '4px' }}><span style={{ fontWeight: 500 }}>Logged:</span> {task.loggedHours}h</div>
                    <div style={{ marginBottom: '8px' }}>
                      <span style={{ fontWeight: 500 }}>Remaining:</span> {Math.max(0, task.estimatedHours - task.loggedHours).toFixed(1)}h
                      {isOverBudget && <span style={{ color: '#F97316' }}> (+{(task.loggedHours - task.estimatedHours).toFixed(1)}h over)</span>}
                    </div>
                    <div style={{ color: '#6B7280' }}>
                      👥 {task.assignedTo.join(' + ')}
                    </div>
                  </div>
                  <button
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: '1px solid #E5E7EB',
                      borderRadius: '4px',
                      background: 'white',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: '#0A0A0A',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      transition: 'all 150ms',
                      marginBottom: '6px'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#F9FAFB';
                      e.currentTarget.style.borderColor = '#0066FF';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'white';
                      e.currentTarget.style.borderColor = '#E5E7EB';
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setTaskToComplete(task);
                      setShowCompletionModal(true);
                    }}
                  >
                    ☐ Mark my part complete
                  </button>
                  <button
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      border: 'none',
                      borderRadius: '4px',
                      background: 'transparent',
                      cursor: 'pointer',
                      fontSize: '12px',
                      fontWeight: 500,
                      color: '#0066FF',
                      transition: 'all 150ms'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    onClick={(e) => {
                      e.stopPropagation();
                      console.log('View task:', task);
                    }}
                  >
                    View task →
                  </button>
                </div>
              )}

              {/* Drag Tooltip on Hover */}
              {isHovered && !isExpanded && (
                <div style={{
                  position: 'absolute',
                  bottom: '100%',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  marginBottom: '4px',
                  padding: '4px 8px',
                  background: '#1F2937',
                  color: 'white',
                  fontSize: '11px',
                  borderRadius: '4px',
                  whiteSpace: 'nowrap',
                  pointerEvents: 'none',
                  zIndex: 100
                }}>
                  Drag to calendar to log time
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Team Calendars - Collapsible */}
      <div style={{
        borderTop: '1px solid #E5E7EB',
        flexShrink: 0
      }}>
        <button
          onClick={() => setTeamCalendarsCollapsed(!teamCalendarsCollapsed)}
          style={{
            width: '100%',
            padding: '12px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            fontSize: '13px',
            textAlign: 'left',
            transition: 'background 150ms'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {teamCalendarsCollapsed ? <ChevronRight size={16} color="#6B7280" /> : <ChevronDown size={16} color="#6B7280" />}
            <span style={{ fontWeight: 600, color: '#0A0A0A' }}>Team Calendars</span>
            {teamCalendarsCollapsed && (
              <span style={{ fontSize: '12px', color: '#6B7280' }}>
                ({selectedCalendars.length})
              </span>
            )}
          </div>
        </button>

        {!teamCalendarsCollapsed && (
          <div style={{ padding: '0 20px 16px 20px' }}>
            {/* Team Members List */}
            <div style={{ marginBottom: '12px' }}>
              {allCalendars.map(member => {
                const isSelected = selectedCalendars.includes(member.name);
                return (
                  <label
                    key={member.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      padding: '8px 6px',
                      cursor: 'pointer',
                      borderRadius: '4px',
                      transition: 'background 150ms'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => {
                        const newSelected = new Set(selectedCalendars);
                        if (e.target.checked) {
                          newSelected.add(member.name);
                        } else {
                          newSelected.delete(member.name);
                        }
                        onCalendarsChange(Array.from(newSelected));
                      }}
                      style={{
                        width: '16px',
                        height: '16px',
                        cursor: 'pointer',
                        accentColor: member.color
                      }}
                    />
                    <span style={{ flex: 1, fontSize: '13px', color: '#0A0A0A' }}>
                      {member.name}
                    </span>
                    {member.id === 'Colm Digby (You)' && (
                      <button
                        style={{
                          width: '20px',
                          height: '20px',
                          padding: 0,
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                          color: '#9CA3AF',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          borderRadius: '4px'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#E5E7EB'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <Edit2 size={12} />
                      </button>
                    )}
                  </label>
                );
              })}
            </div>

            {/* Search Other Calendars */}
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Search other calendars..."
                value={searchCalendar}
                onChange={(e) => setSearchCalendar(e.target.value)}
                style={{
                  width: '100%',
                  height: '32px',
                  padding: '0 10px 0 32px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: '#0A0A0A',
                  outline: 'none'
                }}
                onFocus={(e) => e.currentTarget.style.borderColor = '#0066FF'}
                onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
              />
              <Search
                size={14}
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#9CA3AF',
                  pointerEvents: 'none'
                }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Task Completion Modal */}
      {showCompletionModal && taskToComplete && (
        <TaskCompletionModal
          task={taskToComplete}
          onClose={() => setShowCompletionModal(false)}
          onConfirm={() => {
            console.log('Task completed:', taskToComplete);
            setShowCompletionModal(false);
          }}
        />
      )}
    </div>
  );
}
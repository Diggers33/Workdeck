import React, { useState, useEffect, useMemo } from 'react';
import { ArrowLeft, Filter, Search, Settings, ChevronDown, Clock, Eye } from 'lucide-react';
import { DndContext, DragOverlay, closestCorners, PointerSensor, useSensor, useSensors, DragStartEvent, DragEndEvent } from '@dnd-kit/core';
import { Column } from './Column';
import { TaskCard } from './TaskCard';
import { ActiveTimerBar } from './modals/ActiveTimerBar';
import { TimerWarningModal } from './modals/TimerWarningModal';
import { SaveTimeEntryModal } from './modals/SaveTimeEntryModal';
import { EditColumnsModal } from './modals/EditColumnsModal';
import { KeyboardShortcutsModal } from './modals/KeyboardShortcutsModal';
import { SetTimerDurationModal } from './modals/SetTimerDurationModal';
import { TimerExtensionModal } from './modals/TimerExtensionModal';
import { TaskDetailModal } from '../../Projects/gantt/TaskDetailModal';
import { toast } from 'sonner';
import { useTasks, Task } from '../../../contexts/TasksContext';

interface ColumnData {
  id: string;
  name: string;
  color: string;
  taskIds: string[];
}

interface TimerState {
  taskId: string | null;
  startTime: number | null;
  pausedTime: number;
  isPaused: boolean;
  targetDuration?: number;
}

interface MyTasksBoardProps {
  onStartTimer?: (taskId: string, taskTitle: string, projectName: string, projectColor: string) => void;
}

export function MyTasksBoard({ onStartTimer: onStartTimerProp }: MyTasksBoardProps) {
  const [cardSize, setCardSize] = useState<'S' | 'M' | 'L'>('M');
  const [hideDone, setHideDone] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProjects, setSelectedProjects] = useState<string[]>(['all']);
  const [dueFilter, setDueFilter] = useState('Any');
  const [priorityFilter, setPriorityFilter] = useState('Any');
  const [showEditColumns, setShowEditColumns] = useState(false);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [showDueDropdown, setShowDueDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Timer state
  const [timerState, setTimerState] = useState<TimerState>({
    taskId: null,
    startTime: null,
    pausedTime: 0,
    isPaused: false,
  });
  const [showTimerWarning, setShowTimerWarning] = useState(false);
  const [showSaveTimeEntry, setShowSaveTimeEntry] = useState(false);
  const [showSetDuration, setShowSetDuration] = useState(false);
  const [showExtensionModal, setShowExtensionModal] = useState(false);
  const [pendingTimerTaskId, setPendingTimerTaskId] = useState<string | null>(null);

  // Drag and drop
  const [activeId, setActiveId] = useState<string | null>(null);
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Sample data with time tracking
  const { tasks: allTasks, updateTask } = useTasks();

  // Filter to show only current user's tasks (Alex Morgan)
  const currentUser = 'Alex Morgan';
  const myTasks = useMemo(() => {
    return Object.fromEntries(
      Object.entries(allTasks).filter(([_, task]) => task.assignedTo === currentUser)
    );
  }, [allTasks]);

  // My Tasks has its own columns separate from Project Board
  const [columns, setColumns] = useState<ColumnData[]>([
    {
      id: 'today', name: 'Today', color: '#EF4444', taskIds: Object.keys(myTasks).filter(id => {
        const task = myTasks[id];
        if (!task.dueDate) return false;
        const today = new Date();
        const dueDate = new Date(task.dueDate);
        return dueDate.toDateString() === today.toDateString();
      })
    },
    {
      id: 'this-week', name: 'This Week', color: '#F59E0B', taskIds: Object.keys(myTasks).filter(id => {
        const task = myTasks[id];
        if (!task.dueDate) return false;
        const today = new Date();
        const dueDate = new Date(task.dueDate);
        const weekFromNow = new Date(today);
        weekFromNow.setDate(weekFromNow.getDate() + 7);
        return dueDate > today && dueDate <= weekFromNow;
      })
    },
    {
      id: 'next-week', name: 'Next Week', color: '#3B82F6', taskIds: Object.keys(myTasks).filter(id => {
        const task = myTasks[id];
        if (!task.dueDate) return false;
        const today = new Date();
        const dueDate = new Date(task.dueDate);
        const weekFromNow = new Date(today);
        weekFromNow.setDate(weekFromNow.getDate() + 7);
        const twoWeeksFromNow = new Date(today);
        twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);
        return dueDate > weekFromNow && dueDate <= twoWeeksFromNow;
      })
    },
    {
      id: 'backlog', name: 'Backlog', color: '#6B7280', taskIds: Object.keys(myTasks).filter(id => {
        const task = myTasks[id];
        if (!task.dueDate) return true; // No due date = backlog
        const today = new Date();
        const dueDate = new Date(task.dueDate);
        const twoWeeksFromNow = new Date(today);
        twoWeeksFromNow.setDate(twoWeeksFromNow.getDate() + 14);
        return dueDate > twoWeeksFromNow;
      })
    },
  ]);

  // Calculate time tracked today
  const getTimeTrackedToday = () => {
    const totalMinutes = Object.values(myTasks).reduce((sum, task) => {
      return sum + (task.timeLogged || 0);
    }, 0);

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Help modal
      if (e.key === '?') {
        e.preventDefault();
        setShowKeyboardShortcuts(true);
      }

      // Focus mode
      if (e.key === 'f' && !e.metaKey && !e.ctrlKey) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          setFocusMode(!focusMode);
        }
      }

      // Hide done
      if (e.key === 'h' && !e.metaKey && !e.ctrlKey) {
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          setHideDone(!hideDone);
        }
      }

      // Escape
      if (e.key === 'Escape') {
        if (focusMode) setFocusMode(false);
        if (showKeyboardShortcuts) setShowKeyboardShortcuts(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [focusMode, hideDone, showKeyboardShortcuts]);

  // Timer functions
  const startTimer = (taskId: string) => {
    const task = myTasks[taskId];
    if (!task) return;

    // If timer prop is provided from App, use it (global timer)
    if (onStartTimerProp) {
      onStartTimerProp(taskId, task.title, task.projectName, task.projectColor);
      return;
    }

    // Otherwise use local timer
    setPendingTimerTaskId(taskId);
    setShowSetDuration(true);
  };

  const handleStartTimerWithDuration = (durationMinutes: number) => {
    if (!pendingTimerTaskId) return;

    setTimerState({
      taskId: pendingTimerTaskId,
      startTime: Date.now(),
      pausedTime: 0,
      isPaused: false,
      targetDuration: durationMinutes,
    });

    setPendingTimerTaskId(null);
    toast.success(`Timer started - ${durationMinutes} min`);
  };

  const pauseTimer = () => {
    if (timerState.taskId && timerState.startTime && !timerState.isPaused) {
      const elapsed = Date.now() - timerState.startTime;
      setTimerState({
        ...timerState,
        pausedTime: timerState.pausedTime + elapsed,
        isPaused: true,
        startTime: null,
      });
    }
  };

  const resumeTimer = () => {
    if (timerState.taskId && timerState.isPaused) {
      setTimerState({
        ...timerState,
        startTime: Date.now(),
        isPaused: false,
      });
    }
  };

  const stopTimer = () => {
    setShowSaveTimeEntry(true);
  };

  const handleSaveTimeEntry = () => {
    setTimerState({
      taskId: null,
      startTime: null,
      pausedTime: 0,
      isPaused: false,
    });
    setShowSaveTimeEntry(false);
    toast.success('Time entry saved - Added to calendar');
  };

  const handleDiscardTime = () => {
    setTimerState({
      taskId: null,
      startTime: null,
      pausedTime: 0,
      isPaused: false,
    });
    setShowSaveTimeEntry(false);
    toast('Time entry discarded');
  };

  // Check for timer warnings (2 minutes before end)
  useEffect(() => {
    if (!timerState.taskId || !timerState.targetDuration || timerState.isPaused) return;

    const checkInterval = setInterval(() => {
      const elapsed = getElapsedTime();
      const target = timerState.targetDuration! * 60 * 1000;
      const remaining = target - elapsed;
      const remainingSeconds = Math.floor(remaining / 1000);

      // Show warning at 2 minutes (120 seconds) remaining
      if (remainingSeconds <= 120 && remainingSeconds > 118 && !showExtensionModal) {
        setShowExtensionModal(true);
      }

      // Auto-stop at 0
      if (remainingSeconds <= 0) {
        clearInterval(checkInterval);
        stopTimer();
      }
    }, 1000);

    return () => clearInterval(checkInterval);
  }, [timerState, showExtensionModal]);

  const handleExtendTimer = (additionalMinutes: number) => {
    setTimerState({
      ...timerState,
      targetDuration: (timerState.targetDuration || 0) + additionalMinutes,
    });
    setShowExtensionModal(false);
    toast.success(`Timer extended - +${additionalMinutes} min`);
  };

  const handleFinishTimer = () => {
    setShowExtensionModal(false);
    stopTimer();
  };

  // Drag and drop handlers
  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over) {
      setActiveId(null);
      return;
    }

    const activeTaskId = active.id as string;
    const overColumnId = over.id as string;

    const sourceColumn = columns.find(col => col.taskIds.includes(activeTaskId));
    const targetColumn = columns.find(col => col.id === overColumnId);

    if (!sourceColumn || !targetColumn || sourceColumn.id === targetColumn.id) {
      setActiveId(null);
      return;
    }

    setColumns(columns.map(col => {
      if (col.id === sourceColumn.id) {
        return {
          ...col,
          taskIds: col.taskIds.filter(id => id !== activeTaskId),
        };
      }
      if (col.id === targetColumn.id) {
        return {
          ...col,
          taskIds: [...col.taskIds, activeTaskId],
        };
      }
      return col;
    }));

    toast(`Moved to ${targetColumn.name}`);
    setActiveId(null);
  };

  // Filter tasks
  const getFilteredTasks = () => {
    let filtered = { ...myTasks };

    if (hideDone) {
      filtered = Object.fromEntries(
        Object.entries(filtered).filter(([_, task]) => task.status !== 'Done')
      );
    }

    if (searchQuery) {
      filtered = Object.fromEntries(
        Object.entries(filtered).filter(([_, task]) =>
          task.title.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    }

    if (!selectedProjects.includes('all')) {
      filtered = Object.fromEntries(
        Object.entries(filtered).filter(([_, task]) =>
          selectedProjects.includes(task.projectId)
        )
      );
    }

    if (dueFilter !== 'Any') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      filtered = Object.fromEntries(
        Object.entries(filtered).filter(([_, task]) => {
          if (!task.dueDate) return false;
          const dueDate = new Date(task.dueDate);
          dueDate.setHours(0, 0, 0, 0);

          if (dueFilter === 'Overdue') return dueDate < today;
          if (dueFilter === 'Today') return dueDate.getTime() === today.getTime();
          if (dueFilter === 'This Week') {
            const weekFromNow = new Date(today);
            weekFromNow.setDate(weekFromNow.getDate() + 7);
            return dueDate >= today && dueDate <= weekFromNow;
          }
          if (dueFilter === 'This Month') {
            const monthFromNow = new Date(today);
            monthFromNow.setMonth(monthFromNow.getMonth() + 1);
            return dueDate >= today && dueDate <= monthFromNow;
          }
          return true;
        })
      );
    }

    if (priorityFilter !== 'Any') {
      filtered = Object.fromEntries(
        Object.entries(filtered).filter(([_, task]) => task.priority === priorityFilter)
      );
    }

    return filtered;
  };

  const filteredTasks = getFilteredTasks();
  const activeTask = activeId ? myTasks[activeId] : null;
  const timerTask = timerState.taskId ? myTasks[timerState.taskId] : null;

  const getElapsedTime = () => {
    if (!timerState.taskId) return 0;

    let elapsed = timerState.pausedTime;
    if (!timerState.isPaused && timerState.startTime) {
      elapsed += Date.now() - timerState.startTime;
    }
    return elapsed;
  };

  // Get columns to display (focus mode shows only Today)
  const displayColumns = focusMode ? columns.filter(c => c.name === 'Today') : columns;

  return (
    <div className={`relative h-[calc(100vh-180px)] ${focusMode ? 'bg-[#111827]' : 'bg-[#F9FAFB]'}`}>
      {/* Top Bar */}
      <div className="bg-white border-b" style={{ height: '64px', borderColor: '#E5E7EB' }}>
        <div className="h-full px-6 flex items-center justify-between">
          {/* Left section */}
          <div className="flex items-center gap-4">
            {!focusMode && (
              <>
                <button
                  className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#F9FAFB] text-[#6B7280] hover:text-[#111827] transition-colors"
                  title="Back to Projects"
                  onClick={() => window.history.back()}
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div style={{ width: '1px', height: '32px', background: '#E5E7EB' }} />
                <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#111827', lineHeight: '1', whiteSpace: 'nowrap' }}>My Tasks</h1>

                {/* Project filter */}
                <div className="relative" style={{ marginLeft: '8px' }}>
                  <button
                    onClick={() => setShowProjectDropdown(!showProjectDropdown)}
                    className="h-8 px-3 flex items-center gap-2 border rounded-md hover:bg-[#F9FAFB] transition-colors"
                    style={{ borderColor: '#E5E7EB', fontSize: '13px', color: '#6B7280', whiteSpace: 'nowrap' }}
                  >
                    {selectedProjects.includes('all') ? 'All Projects' : `${selectedProjects.length} projects`}
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {showProjectDropdown && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowProjectDropdown(false)} />
                      <div className="absolute top-full left-0 mt-1 w-64 bg-white rounded-lg shadow-lg border z-20" style={{ borderColor: '#E5E7EB' }}>
                        <div className="p-2">
                          <label className="flex items-center gap-2 px-3 py-2 hover:bg-[#F9FAFB] rounded cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedProjects.includes('all')}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedProjects(['all']);
                                }
                              }}
                              className="w-4 h-4"
                            />
                            <span style={{ fontSize: '14px', color: '#111827' }}>All Projects</span>
                          </label>
                          <div className="h-px bg-[#E5E7EB] my-1" />
                          {['biogemse', 'halotex', 'retain'].map(project => (
                            <label key={project} className="flex items-center gap-2 px-3 py-2 hover:bg-[#F9FAFB] rounded cursor-pointer">
                              <input
                                type="checkbox"
                                checked={selectedProjects.includes(project)}
                                onChange={(e) => {
                                  if (e.target.checked) {
                                    setSelectedProjects([...selectedProjects.filter(p => p !== 'all'), project]);
                                  } else {
                                    const newSelected = selectedProjects.filter(p => p !== project);
                                    setSelectedProjects(newSelected.length === 0 ? ['all'] : newSelected);
                                  }
                                }}
                                className="w-4 h-4"
                              />
                              <span style={{ fontSize: '14px', color: '#111827', textTransform: 'uppercase' }}>
                                {project === 'biogemse' ? 'BIOGEMSE' : project === 'halotex' ? 'HALO-TEX' : 'RETAIN'}
                              </span>
                            </label>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Filters button */}
                <button
                  className="h-8 px-3 flex items-center gap-2 border rounded-md hover:bg-[#F9FAFB] transition-colors"
                  style={{ borderColor: '#E5E7EB', fontSize: '13px', color: '#6B7280' }}
                >
                  <Filter className="w-4 h-4" />
                  Filters
                </button>

                {/* Due filter */}
                <div className="relative">
                  <button
                    onClick={() => setShowDueDropdown(!showDueDropdown)}
                    className="h-8 px-3 flex items-center gap-2 border rounded-md hover:bg-[#F9FAFB] transition-colors"
                    style={{ borderColor: '#E5E7EB', fontSize: '13px', color: '#6B7280', whiteSpace: 'nowrap' }}
                  >
                    Due: {dueFilter}
                    <ChevronDown className="w-3 h-3" />
                  </button>

                  {showDueDropdown && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowDueDropdown(false)} />
                      <div className="absolute top-full left-0 mt-1 w-40 bg-white rounded-lg shadow-lg border z-20" style={{ borderColor: '#E5E7EB' }}>
                        <div className="p-1">
                          {['Any', 'Overdue', 'Today', 'This Week', 'This Month'].map(filter => (
                            <button
                              key={filter}
                              onClick={() => {
                                setDueFilter(filter);
                                setShowDueDropdown(false);
                              }}
                              className="w-full px-3 py-2 text-left hover:bg-[#F9FAFB] rounded"
                              style={{ fontSize: '13px', color: '#111827' }}
                            >
                              {filter}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Priority filter */}
                <div className="relative">
                  <button
                    onClick={() => setShowPriorityDropdown(!showPriorityDropdown)}
                    className="h-8 px-3 flex items-center gap-2 border rounded-md hover:bg-[#F9FAFB] transition-colors"
                    style={{ borderColor: '#E5E7EB', fontSize: '13px', color: '#6B7280', whiteSpace: 'nowrap' }}
                  >
                    Priority: {priorityFilter}
                    <ChevronDown className="w-3 h-3" />
                  </button>

                  {showPriorityDropdown && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowPriorityDropdown(false)} />
                      <div className="absolute top-full left-0 mt-1 w-32 bg-white rounded-lg shadow-lg border z-20" style={{ borderColor: '#E5E7EB' }}>
                        <div className="p-1">
                          {['Any', 'High', 'Medium', 'Low'].map(filter => (
                            <button
                              key={filter}
                              onClick={() => {
                                setPriorityFilter(filter);
                                setShowPriorityDropdown(false);
                              }}
                              className="w-full px-3 py-2 text-left hover:bg-[#F9FAFB] rounded"
                              style={{ fontSize: '13px', color: '#111827' }}
                            >
                              {filter}
                            </button>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                </div>

                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-[180px] focus:w-[280px] h-8 pl-9 pr-3 border rounded-md transition-all"
                    style={{ borderColor: '#E5E7EB', fontSize: '13px' }}
                  />
                </div>
              </>
            )}

            {focusMode && (
              <div className="flex items-center gap-4">
                <Eye className="w-5 h-5 text-[#2563EB]" />
                <h1 style={{ fontSize: '20px', fontWeight: 600, color: '#111827', lineHeight: '1', whiteSpace: 'nowrap' }}>Focus Mode</h1>
                <span style={{ fontSize: '13px', color: '#6B7280' }}>Today - {displayColumns[0]?.taskIds.length || 0} tasks</span>
              </div>
            )}
          </div>

          {/* Right section */}
          <div className="flex items-center gap-3">
            {!focusMode && (
              <>
                {/* Time tracked today */}
                <div className="flex items-center gap-2 pr-3 border-r" style={{ borderColor: '#E5E7EB' }}>
                  <Clock className="w-4 h-4 text-[#2563EB]" />
                  <button className="hover:underline" title="This week: 18h 30m" style={{ whiteSpace: 'nowrap' }}>
                    <span style={{ fontSize: '15px', fontWeight: 600, color: '#111827' }}>{getTimeTrackedToday()}</span>
                    <span style={{ fontSize: '13px', color: '#6B7280', marginLeft: '4px' }}>today</span>
                  </button>
                </div>

                {/* Hide done */}
                <label className="flex items-center gap-2 cursor-pointer" style={{ whiteSpace: 'nowrap' }}>
                  <input
                    type="checkbox"
                    checked={hideDone}
                    onChange={(e) => setHideDone(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <span style={{ fontSize: '13px', color: '#6B7280' }}>Hide Done</span>
                </label>

                {/* Card size */}
                <div className="flex items-center gap-0 border rounded-md overflow-hidden" style={{ borderColor: '#E5E7EB' }}>
                  {(['S', 'M', 'L'] as const).map(size => (
                    <button
                      key={size}
                      onClick={() => setCardSize(size)}
                      className={`w-8 h-8 flex items-center justify-center transition-colors ${cardSize === size ? 'bg-[#EFF6FF] text-[#2563EB]' : 'text-[#6B7280] hover:bg-[#F9FAFB]'
                        }`}
                      style={{ fontSize: '12px', fontWeight: 600 }}
                    >
                      {size}
                    </button>
                  ))}
                </div>

                {/* Settings */}
                <button
                  onClick={() => setShowEditColumns(true)}
                  className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#F9FAFB] transition-colors"
                  title="Edit Columns"
                >
                  <Settings className="w-5 h-5 text-[#6B7280]" />
                </button>
              </>
            )}

            {/* Focus mode toggle */}
            <button
              onClick={() => setFocusMode(!focusMode)}
              className={`h-8 px-3 flex items-center gap-2 border rounded-md transition-colors ${focusMode
                ? 'bg-[#2563EB] border-[#2563EB] text-white'
                : 'border-[#E5E7EB] text-[#6B7280] hover:bg-[#F9FAFB]'
                }`}
              style={{ fontSize: '13px', fontWeight: 500, whiteSpace: 'nowrap' }}
            >
              <Eye className="w-4 h-4" />
              {focusMode ? 'Exit Focus' : 'Focus'}
            </button>

            {/* Keyboard shortcuts */}
            <button
              onClick={() => setShowKeyboardShortcuts(true)}
              className="w-8 h-8 flex items-center justify-center rounded-full border text-[#6B7280] hover:bg-[#F9FAFB] transition-colors"
              style={{ borderColor: '#E5E7EB', fontSize: '13px', fontWeight: 600 }}
              title="Keyboard shortcuts"
            >
              ?
            </button>
          </div>
        </div>
      </div>

      {/* Board Area */}
      <div className={`overflow-x-auto h-full ${timerState.taskId ? 'pb-16' : 'pb-6'}`}>
        <div className={`p-6 flex gap-4 ${focusMode ? 'justify-center' : 'min-w-max'}`}>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            {displayColumns.map(column => (
              <Column
                key={column.id}
                column={column}
                tasks={column.taskIds
                  .map(id => filteredTasks[id])
                  .filter(Boolean)
                }
                cardSize={focusMode ? 'L' : cardSize}
                onStartTimer={startTimer}
                onPauseTimer={pauseTimer}
                onResumeTimer={resumeTimer}
                onStopTimer={stopTimer}
                onTaskClick={(task) => setSelectedTask(task)}
                timerTaskId={timerState.taskId}
                timerIsPaused={timerState.isPaused}
                getElapsedTime={getElapsedTime}
                focusMode={focusMode}
              />
            ))}

            <DragOverlay>
              {activeTask && (
                <div style={{ width: focusMode ? '400px' : '320px', opacity: 0.9 }}>
                  <TaskCard
                    task={activeTask}
                    cardSize={focusMode ? 'L' : cardSize}
                    onStartTimer={() => { }}
                    isTimerActive={false}
                  />
                </div>
              )}
            </DragOverlay>
          </DndContext>

          {/* Add Column */}
          {!focusMode && (
            <button
              onClick={() => setShowEditColumns(true)}
              className="flex-shrink-0 flex items-center justify-center rounded-xl border-2 border-dashed hover:bg-[#F9FAFB] transition-colors"
              style={{
                width: '280px',
                height: '120px',
                borderColor: '#D1D5DB',
                fontSize: '16px',
                color: '#6B7280',
              }}
            >
              <span className="text-[24px] mr-2">+</span>
              Add Column
            </button>
          )}
        </div>
      </div>

      {/* Active Timer Bar */}
      {timerState.taskId && timerTask && (
        <ActiveTimerBar
          task={timerTask}
          elapsedTime={getElapsedTime()}
          isPaused={timerState.isPaused}
          onPause={pauseTimer}
          onResume={resumeTimer}
          onStop={stopTimer}
          onTaskClick={(task) => setSelectedTask(task as Task)}
        />
      )}

      {/* Modals */}
      {showTimerWarning && timerTask && (
        <TimerWarningModal
          task={timerTask}
          elapsedTime={getElapsedTime()}
          onExtend={(_minutes) => {
            setShowTimerWarning(false);
          }}
          onStopAndSave={() => {
            setShowTimerWarning(false);
            stopTimer();
          }}
          onContinue={() => {
            setShowTimerWarning(false);
          }}
        />
      )}

      {showSaveTimeEntry && timerTask && (
        <SaveTimeEntryModal
          task={timerTask}
          elapsedTime={getElapsedTime()}
          onSave={handleSaveTimeEntry}
          onDiscard={handleDiscardTime}
        />
      )}

      {showEditColumns && (
        <EditColumnsModal
          columns={columns}
          onSave={(newColumns) => {
            setColumns(newColumns);
            setShowEditColumns(false);
            toast.success('Columns updated');
          }}
          onClose={() => setShowEditColumns(false)}
        />
      )}

      {showKeyboardShortcuts && (
        <KeyboardShortcutsModal onClose={() => setShowKeyboardShortcuts(false)} />
      )}

      {showSetDuration && pendingTimerTaskId && (
        <SetTimerDurationModal
          taskTitle={myTasks[pendingTimerTaskId]?.title || ''}
          onClose={() => {
            setShowSetDuration(false);
            setPendingTimerTaskId(null);
          }}
          onStart={handleStartTimerWithDuration}
        />
      )}

      {showExtensionModal && timerTask && timerState.targetDuration && (
        <TimerExtensionModal
          taskTitle={timerTask.title}
          remainingSeconds={Math.floor((timerState.targetDuration * 60 * 1000 - getElapsedTime()) / 1000)}
          onExtend={handleExtendTimer}
          onFinish={handleFinishTimer}
        />
      )}

      {selectedTask && (
        <TaskDetailModal
          task={{
            id: selectedTask.id,
            name: selectedTask.title,
            description: selectedTask.description || '',
            status: selectedTask.status,
            priority: selectedTask.priority,
            dueDate: selectedTask.dueDate || '',
            assignees: [],
            tags: [],
            progress: selectedTask.status === 'Done' ? 100 : selectedTask.status === 'In Review' ? 75 : selectedTask.status === 'In Progress' ? 50 : 0,
          }}
          onClose={() => setSelectedTask(null)}
          onUpdateTask={(taskId: string, updates: any) => {
            updateTask(taskId, {
              title: updates.name,
              description: updates.description,
              status: updates.status as Task['status'],
              priority: updates.priority as Task['priority'],
              dueDate: updates.dueDate,
            });
          }}
        />
      )}
    </div>
  );
}

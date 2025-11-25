import React, { useState } from 'react';
import { Plus, MoreVertical, GripVertical, ClipboardList } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { TaskCard } from './TaskCard';

interface Task {
  id: string;
  title: string;
  projectId: string;
  projectName: string;
  projectColor: string;
  status: 'Open' | 'In Progress' | 'In Review' | 'Done';
  dueDate?: string;
  priority: 'High' | 'Medium' | 'Low';
  commentsCount: number;
  description?: string;
  subtasksCompleted?: number;
  subtasksTotal?: number;
  parentActivity?: string;
  timeEstimate?: number;
  timeLogged?: number;
  waitingOn?: string;
  watchers?: number;
  tags?: Array<{ id: string; name: string; color: string }>;
}

interface ColumnData {
  id: string;
  name: string;
  color: string;
  taskIds: string[];
}

interface ColumnProps {
  column: ColumnData;
  tasks: Task[];
  cardSize: 'S' | 'M' | 'L';
  onStartTimer: (taskId: string) => void;
  onPauseTimer?: () => void;
  onResumeTimer?: () => void;
  onStopTimer?: () => void;
  onTaskClick: (task: Task) => void;
  timerTaskId: string | null;
  timerIsPaused?: boolean;
  getElapsedTime: () => number;
  focusMode?: boolean;
}

export function Column({
  column,
  tasks,
  cardSize,
  onStartTimer,
  onPauseTimer,
  onResumeTimer,
  onStopTimer,
  onTaskClick,
  timerTaskId,
  timerIsPaused = false,
  getElapsedTime,
  focusMode = false
}: ColumnProps) {
  const [showMenu, setShowMenu] = useState(false);

  // Make column itself sortable (draggable)
  const {
    attributes: columnAttributes,
    listeners: columnListeners,
    setNodeRef: setColumnNodeRef,
    transform: columnTransform,
    transition: columnTransition,
    isDragging: isColumnDragging,
  } = useSortable({
    id: `column-${column.id}`,
    data: { type: 'column', column }
  });

  // Also make it droppable for tasks
  const { setNodeRef: setDroppableNodeRef, isOver } = useDroppable({
    id: column.id,
    data: { type: 'column', columnId: column.id }
  });

  // Calculate total time estimate for column
  const getTotalEstimate = () => {
    const totalMinutes = tasks.reduce((sum, task) => sum + (task.timeEstimate || 0), 0);
    if (totalMinutes === 0) return null;

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  };

  const totalEstimate = getTotalEstimate();
  const isWaitingColumn = column.name === 'Waiting On';

  const columnStyle = {
    transform: CSS.Transform.toString(columnTransform),
    transition: columnTransition,
    opacity: isColumnDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={(node) => {
        setColumnNodeRef(node);
        setDroppableNodeRef(node);
      }}
      className={`flex-shrink-0 rounded-xl p-3 transition-all ${isOver ? 'ring-2 ring-[#2563EB] ring-opacity-50' : ''}`}
      style={{
        ...columnStyle,
        width: focusMode ? '400px' : '320px',
        backgroundColor: isOver ? '#EFF6FF' : '#F3F4F6',
        minHeight: 'calc(100vh - 240px)',
      }}
    >
      {/* Column Header */}
      <div className="mb-3">
        <div className="flex items-center justify-between mb-2">
          <div
            {...columnAttributes}
            {...columnListeners}
            className="flex items-center gap-2 flex-1"
            style={{ cursor: isColumnDragging ? 'grabbing' : 'grab' }}
          >
            {!focusMode && (
              <GripVertical className="w-4 h-4 text-[#9CA3AF] flex-shrink-0" />
            )}
            <h3 className="text-[16px] font-semibold text-[#111827]">{column.name}</h3>
            <span className="text-[13px] text-[#6B7280]">{tasks.length} {tasks.length === 1 ? 'task' : 'tasks'}</span>
          </div>

          {/* Menu button */}
          {!focusMode && (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="w-6 h-6 flex items-center justify-center rounded hover:bg-white transition-colors"
              >
                <MoreVertical className="w-4 h-4 text-[#6B7280]" />
              </button>

              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border z-20" style={{ borderColor: '#E5E7EB' }}>
                    <div className="p-1">
                      <button
                        onClick={() => {
                          setShowMenu(false);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-[#F9FAFB] rounded text-[14px] text-[#111827]"
                      >
                        Rename
                      </button>
                      <button
                        onClick={() => {
                          setShowMenu(false);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-[#F9FAFB] rounded text-[14px] text-[#111827]"
                      >
                        Change Color
                      </button>
                      <button
                        onClick={() => {
                          setShowMenu(false);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-[#F9FAFB] rounded text-[14px] text-[#111827]"
                      >
                        Clear Done
                      </button>
                      <div className="h-px bg-[#E5E7EB] my-1" />
                      <button
                        onClick={() => {
                          setShowMenu(false);
                        }}
                        className="w-full px-3 py-2 text-left hover:bg-[#FEE2E2] rounded text-[14px] text-[#DC2626]"
                      >
                        Delete Column
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        {/* Time estimate or status */}
        <div className="mb-2 text-[12px]">
          {isWaitingColumn ? (
            <div className="flex items-center gap-1 text-[#B45309]">
              <span>⏸️</span>
              <span>Blocked</span>
            </div>
          ) : totalEstimate ? (
            <div className="text-[#9CA3AF]">{totalEstimate} est</div>
          ) : (
            <div className="text-[#9CA3AF]">—</div>
          )}
        </div>

        {/* Color bar */}
        <div
          className="h-1 rounded-full"
          style={{ backgroundColor: column.color }}
        />
      </div>

      {/* Tasks */}
      <div className="space-y-2 mb-3">
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            cardSize={cardSize}
            onStartTimer={onStartTimer}
            onPauseTimer={timerTaskId === task.id ? (timerIsPaused ? onResumeTimer : onPauseTimer) : undefined}
            onStopTimer={onStopTimer}
            onTaskClick={onTaskClick}
            isTimerActive={timerTaskId === task.id}
            isPaused={timerIsPaused}
            elapsedTime={timerTaskId === task.id ? getElapsedTime() : 0}
          />
        ))}

        {/* Empty state */}
        {tasks.length === 0 && (
          <div className="bg-white border-2 border-dashed rounded-lg p-6 text-center" style={{ borderColor: '#E5E7EB' }}>
            <div className="flex justify-center mb-2">
              <ClipboardList className="w-8 h-8 text-[#D1D5DB]" />
            </div>
            <div className="text-[14px] text-[#6B7280] mb-1">No tasks here</div>
            <div className="text-[12px] text-[#9CA3AF]">
              Drag tasks from other columns
              <br />
              or add a new task
            </div>
          </div>
        )}
      </div>

      {/* Add Task button */}
      {!focusMode && (
        <button
          className="w-full px-3 py-2 flex items-center justify-center gap-2 rounded-md hover:bg-white transition-colors"
          style={{ fontSize: '14px', color: '#6B7280' }}
        >
          <Plus className="w-4 h-4" />
          Add Task
        </button>
      )}
    </div>
  );
}

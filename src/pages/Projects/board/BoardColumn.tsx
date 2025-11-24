import React, { useState } from 'react';
import { Plus, MoreVertical, Edit2, Trash2, AlertTriangle, AlertCircle } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ImprovedTaskCard } from './ImprovedTaskCard';
import { Column, Task } from './ProjectBoard';

interface BoardColumnProps {
  column: Column;
  cardSize: 'small' | 'medium' | 'large';
  showDescription: boolean;
  showParticipants: boolean;
  onDeleteColumn: (columnId: string) => void;
  onEditColumn: () => void;
  onDeleteTask: (columnId: string, taskId: string) => void;
  onMarkAsDone: (columnId: string, taskId: string) => void;
  onUpdateTask?: (columnId: string, taskId: string, updates: any) => void;
  onTaskClick: (task: Task) => void;
}

export function BoardColumn({
  column,
  cardSize,
  showDescription,
  showParticipants,
  onDeleteColumn,
  onEditColumn,
  onDeleteTask,
  onMarkAsDone,
  onUpdateTask,
  onTaskClick
}: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: column.id,
  });

  const taskIds = column.tasks.map(task => task.id);
  const [showMenu, setShowMenu] = useState(false);
  const canDelete = column.id !== 'open' && column.id !== 'completed';

  const getColumnWidth = () => {
    switch (cardSize) {
      case 'small': return '280px';
      case 'medium': return '300px';
      case 'large': return '320px';
      default: return '300px';
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        width: getColumnWidth(),
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        background: isOver ? '#F0F9FF' : '#FAFAFA',
        borderRadius: '8px',
        border: isOver ? '2px solid #0066FF' : '1px solid #E5E7EB',
        transition: 'all 150ms ease',
        maxHeight: '100%',
        position: 'relative'
      }}
    >
      {/* Column Header */}
      <div style={{
        padding: '16px',
        borderBottom: '1px solid #E5E7EB',
        flexShrink: 0
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{
              width: '4px',
              height: '20px',
              background: column.color,
              borderRadius: '2px'
            }} />
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#1F2937' }}>
              {column.name}
            </span>
          </div>

          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowMenu(!showMenu)}
              style={{
                width: '24px',
                height: '24px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'transparent',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                color: '#6B7280'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#E5E7EB'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <MoreVertical size={16} />
            </button>

            {showMenu && (
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
                  onClick={() => setShowMenu(false)}
                />
                <div style={{
                  position: 'absolute',
                  top: '28px',
                  right: 0,
                  width: '180px',
                  background: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  zIndex: 999,
                  overflow: 'hidden'
                }}>
                  <button
                    onClick={() => {
                      onEditColumn();
                      setShowMenu(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      background: 'transparent',
                      border: 'none',
                      fontSize: '13px',
                      color: '#1F2937',
                      cursor: 'pointer',
                      textAlign: 'left'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F3F4F6'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <Edit2 size={14} />
                    Edit Column
                  </button>
                  {canDelete && (
                    <button
                      onClick={() => {
                        onDeleteColumn(column.id);
                        setShowMenu(false);
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'transparent',
                        border: 'none',
                        fontSize: '13px',
                        color: '#F87171',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#FEF2F2'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <Trash2 size={14} />
                      Delete Column
                    </button>
                  )}
                </div>
              </>
            )}
          </div>
        </div>

        <div style={{ fontSize: '12px', color: '#6B7280', display: 'flex', alignItems: 'center', gap: '6px' }}>
          {column.wipLimit ? (
            <>
              <span style={{ fontWeight: 500 }}>
                {column.tasks.length} / {column.wipLimit}
              </span>
              {column.tasks.length > column.wipLimit * 2 ? (
                <AlertCircle size={14} color="#F87171" title="Way over WIP limit" />
              ) : column.tasks.length > column.wipLimit ? (
                <AlertTriangle size={14} color="#ff8d00" title="Over WIP limit" />
              ) : null}
            </>
          ) : (
            <span>{column.tasks.length} task{column.tasks.length !== 1 ? 's' : ''}</span>
          )}
        </div>
      </div>

      {/* Tasks Scrollable Area */}
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div
  
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column'
          }}
        >


        {/* Task cards with drop zones */}
        {column.tasks.map((task, index) => (
          <div key={task.id} style={{ marginBottom: '4px' }}>
            <ImprovedTaskCard
              task={task}
              columnId={column.id}
              size={cardSize}
              showDescription={showDescription}
              showParticipants={showParticipants}
              onDelete={onDeleteTask}
              onMarkAsDone={onMarkAsDone}
              onUpdateTask={onUpdateTask}
              onTaskClick={onTaskClick}
            />
            
            {/* Drop zone after each task */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setDropIndicator({ type: 'between', index });
              }}
              onDrop={(e) => {
                e.preventDefault();
                e.stopPropagation();
                const nextTask = column.tasks[index + 1];
                handleTaskDrop(nextTask?.id);
              }}
              style={{
                height: dropIndicator?.type === 'between' && dropIndicator.index === index ? '48px' : '12px',
                transition: 'height 100ms ease',
                position: 'relative',
                marginTop: '4px',
                marginBottom: '4px',
                flexShrink: 0
              }}
            >
              {dropIndicator?.type === 'between' && dropIndicator.index === index && (
                <>
                  {/* Blue line indicator */}
                  <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: 0,
                    right: 0,
                    height: '3px',
                    background: '#0066FF',
                    transform: 'translateY(-50%)',
                    borderRadius: '2px',
                    boxShadow: '0 0 12px rgba(0, 102, 255, 0.5)'
                  }}>
                    {/* Left circle */}
                    <div style={{
                      position: 'absolute',
                      left: '-6px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: '#0066FF',
                      boxShadow: '0 0 8px rgba(0, 102, 255, 0.6)'
                    }} />
                    {/* Right circle */}
                    <div style={{
                      position: 'absolute',
                      right: '-6px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      width: '12px',
                      height: '12px',
                      borderRadius: '50%',
                      background: '#0066FF',
                      boxShadow: '0 0 8px rgba(0, 102, 255, 0.6)'
                    }} />
                  </div>
                </>
              )}
            </div>
          </div>
        ))}

        {/* Bottom drop zone */}
        {column.tasks.length > 0 && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDropIndicator({ type: 'bottom' });
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleTaskDrop(); // No insertBeforeTaskId = append to end
            }}
            style={{
              height: dropIndicator?.type === 'bottom' ? '48px' : '16px',
              background: dropIndicator?.type === 'bottom' ? '#EFF6FF' : 'transparent',
              border: dropIndicator?.type === 'bottom' ? '2px dashed #0066FF' : 'none',
              borderRadius: '6px',
              transition: 'all 100ms ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '12px',
              color: '#0066FF',
              fontWeight: 600,
              marginTop: '4px',
              flexShrink: 0
            }}
          >
            {dropIndicator?.type === 'bottom' && '↓ Drop here to insert at bottom'}
          </div>
        )}

        {/* Empty state */}
        {column.tasks.length === 0 && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDropIndicator({ type: 'bottom' });
            }}
            onDrop={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleTaskDrop();
            }}
            style={{
              flex: 1,
              minHeight: '100px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
              color: '#9CA3AF',
              fontSize: '13px',
              background: dropIndicator?.type === 'bottom' ? '#EFF6FF' : 'transparent',
              border: dropIndicator?.type === 'bottom' ? '2px dashed #0066FF' : 'none',
              borderRadius: '6px',
              transition: 'all 100ms ease'
            }}
          >
            {dropIndicator?.type === 'bottom' ? '↓ Drop here' : 'No tasks yet'}
          </div>
        )}
        </div>
      </SortableContext>

      {/* Add Task Button */}
      <div style={{ padding: '12px', borderTop: '1px solid #E5E7EB', flexShrink: 0 }}>
        <button
          style={{
            width: '100%',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            background: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '6px',
            cursor: 'pointer',
            color: '#6B7280',
            fontSize: '13px',
            fontWeight: 500,
            transition: 'all 150ms ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#F9FAFB';
            e.currentTarget.style.color = '#1F2937';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'white';
            e.currentTarget.style.color = '#6B7280';
          }}
        >
          <Plus size={16} />
          Add Task
        </button>
      </div>
    </div>
  );
}

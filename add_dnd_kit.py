import time

time.sleep(0.5)

# Read the file
with open('src/pages/Projects/board/ProjectBoard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add @dnd-kit imports at the top
old_imports = """import React, { useState } from 'react';
import { Search, Plus, Settings, X, ChevronLeft, MoreVertical, Tag, Filter, Users } from 'lucide-react';"""

new_imports = """import React, { useState } from 'react';
import { Search, Plus, Settings, X, ChevronLeft, MoreVertical, Tag, Filter, Users } from 'lucide-react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCorners
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';"""

content = content.replace(old_imports, new_imports)

# Update the state management - remove native drag state, keep @dnd-kit state
old_state_section = """  const [searchQuery, setSearchQuery] = useState('');
  const [draggedTask, setDraggedTask] = useState<{ task: Task; fromColumnId: string } | null>(null);
  const [dragOverTask, setDragOverTask] = useState<{ taskId: string; position: 'before' | 'after' } | null>(null);
  const [showColumnSettings, setShowColumnSettings] = useState<string | null>(null);"""

new_state_section = """  const [searchQuery, setSearchQuery] = useState('');
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [showColumnSettings, setShowColumnSettings] = useState<string | null>(null);"""

content = content.replace(old_state_section, new_state_section)

# Remove the old drag state for columns (we'll keep column drag for now but use @dnd-kit)
content = content.replace(
    """  // Drag state for columns
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);""",
    """  // Active drag item
  const [activeColumn, setActiveColumn] = useState<string | null>(null);"""
)

# Add sensors configuration after the state declarations
sensor_config = """
  // Configure @dnd-kit sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required to start drag
      },
    })
  );
"""

# Insert sensors after savedViews state
content = content.replace(
    "  const [currentView, setCurrentView] = useState(savedViews[0]);",
    "  const [currentView, setCurrentView] = useState(savedViews[0]);" + sensor_config
)

# Replace the old drag handlers with @dnd-kit handlers
old_handlers = """  const handleDragStart = (task: Task, columnId: string) => {
    setDraggedTask({ task, fromColumnId: columnId });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (toColumnId: string, insertBeforeTaskId?: string) => {
    if (!draggedTask) return;

    setColumns(prevColumns => {
      const newColumns = [...prevColumns];
      const fromColumn = newColumns.find(col => col.id === draggedTask.fromColumnId);
      const toColumn = newColumns.find(col => col.id === toColumnId);

      if (fromColumn && toColumn) {
        // Remove task from source column
        fromColumn.tasks = fromColumn.tasks.filter(t => t.id !== draggedTask.task.id);

        // Add task to target column with updated color
        const updatedTask = { ...draggedTask.task, color: toColumn.color };

        // If insertBeforeTaskId is provided, insert at that position
        if (insertBeforeTaskId) {
          const insertIndex = toColumn.tasks.findIndex(t => t.id === insertBeforeTaskId);
          if (insertIndex !== -1) {
            toColumn.tasks.splice(insertIndex, 0, updatedTask);
          } else {
            toColumn.tasks.push(updatedTask);
          }
        } else {
          toColumn.tasks.push(updatedTask);
        }
      }

      return newColumns;
    });

    setDraggedTask(null);
    setDragOverTask(null);
    setDraggedColumn(null);
    setDragOverColumn(null);
  };"""

new_handlers = """  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveTaskId(active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find which column contains the active task
    const activeColumn = columns.find(col =>
      col.tasks.some(task => task.id === activeId)
    );

    // Determine the target column (could be column id or task id)
    let overColumn = columns.find(col => col.id === overId);
    if (!overColumn) {
      // overId might be a task id, find its column
      overColumn = columns.find(col =>
        col.tasks.some(task => task.id === overId)
      );
    }

    if (!activeColumn || !overColumn) return;
    if (activeColumn.id === overColumn.id) return; // Same column, no need to move

    // Move task between columns
    setColumns(prevColumns => {
      const newColumns = [...prevColumns];
      const sourceCol = newColumns.find(col => col.id === activeColumn.id);
      const destCol = newColumns.find(col => col.id === overColumn.id);

      if (!sourceCol || !destCol) return prevColumns;

      const taskToMove = sourceCol.tasks.find(t => t.id === activeId);
      if (!taskToMove) return prevColumns;

      // Remove from source
      sourceCol.tasks = sourceCol.tasks.filter(t => t.id !== activeId);

      // Add to destination with updated color
      const updatedTask = { ...taskToMove, color: destCol.color };

      // If overId is a task, insert before it, otherwise append
      if (destCol.tasks.some(t => t.id === overId)) {
        const insertIndex = destCol.tasks.findIndex(t => t.id === overId);
        destCol.tasks.splice(insertIndex, 0, updatedTask);
      } else {
        destCol.tasks.push(updatedTask);
      }

      return newColumns;
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    setActiveTaskId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Find columns
    const activeColumn = columns.find(col =>
      col.tasks.some(task => task.id === activeId)
    );
    const overColumn = columns.find(col => col.id === overId) ||
                       columns.find(col => col.tasks.some(task => task.id === overId));

    if (!activeColumn || !overColumn) return;

    // If same column, reorder within column
    if (activeColumn.id === overColumn.id) {
      setColumns(prevColumns => {
        const newColumns = [...prevColumns];
        const column = newColumns.find(col => col.id === activeColumn.id);

        if (!column) return prevColumns;

        const oldIndex = column.tasks.findIndex(t => t.id === activeId);
        const newIndex = column.tasks.findIndex(t => t.id === overId);

        if (oldIndex !== -1 && newIndex !== -1) {
          column.tasks = arrayMove(column.tasks, oldIndex, newIndex);
        }

        return newColumns;
      });
    }

    // TODO: Save to localStorage here
  };"""

content = content.replace(old_handlers, new_handlers)

# Remove old column drag handlers (we'll implement column reordering later)
old_column_handlers = """  // Column drag handlers
  const handleColumnDragStart = (columnId: string) => {
    const column = columns.find(c => c.id === columnId);
    if (column?.isCompleted || columnId === 'open') return; // Prevent dragging Open and Completed columns
    setDraggedColumn(columnId);
  };

  const handleColumnDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    const column = columns.find(c => c.id === columnId);
    if (column?.isCompleted || columnId === 'open') return; // Prevent dropping on Open and Completed
    setDragOverColumn(columnId);
  };

  const handleColumnDrop = (targetColumnId: string) => {
    if (!draggedColumn || draggedColumn === targetColumnId) {
      setDraggedColumn(null);
      setDragOverColumn(null);
      return;
    }

    const targetColumn = columns.find(c => c.id === targetColumnId);
    if (targetColumn?.isCompleted || targetColumnId === 'open') {
      setDraggedColumn(null);
      setDragOverColumn(null);
      return;
    }

    setColumns(prev => {
      const newColumns = [...prev];
      const draggedIndex = newColumns.findIndex(c => c.id === draggedColumn);
      const targetIndex = newColumns.findIndex(c => c.id === targetColumnId);

      if (draggedIndex === -1 || targetIndex === -1) return prev;

      // Remove dragged column
      const [removed] = newColumns.splice(draggedIndex, 1);

      // Insert at new position
      newColumns.splice(targetIndex, 0, removed);

      return newColumns;
    });

    setDraggedColumn(null);
    setDragOverColumn(null);
  };"""

content = content.replace(old_column_handlers, "")

# Now wrap the board columns section with DndContext
# Find the board columns render section
old_board_render = """      {/* Board Columns */}
      <div style={{
        flex: 1,
        overflowX: 'auto',
        overflowY: 'hidden',
        padding: '20px'
      }}>
        <div style={{
          display: 'flex',
          gap: '16px',
          height: '100%',
          minWidth: 'fit-content'
        }}>
          {filteredColumns.map((column) => (
            <BoardColumn
              key={column.id}
              column={column}
              cardSize={cardSize}
              showDescription={showDescription}
              showParticipants={showParticipants}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDeleteColumn={handleDeleteColumn}
              onEditColumn={() => setShowColumnSettings(column.id)}
              onDeleteTask={handleDeleteTask}
              onMarkAsDone={handleMarkAsDone}
              onUpdateTask={handleCardUpdateTask}
              onTaskClick={handleTaskClick}
              onColumnDragStart={handleColumnDragStart}
              onColumnDragOver={handleColumnDragOver}
              onColumnDrop={handleColumnDrop}
              draggedColumn={draggedColumn}
              dragOverColumn={dragOverColumn}
            />
          ))}

          {/* Add Column Button */}
          <button
            onClick={handleAddColumn}
            style={{
              width: '280px',
              height: '48px',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: '#F9FAFB',
              border: '2px dashed #D1D5DB',
              borderRadius: '6px',
              cursor: 'pointer',
              color: '#6B7280',
              fontSize: '14px',
              fontWeight: 500
            }}
          >
            <Plus size={18} />
            Add Column
          </button>
        </div>
      </div>"""

new_board_render = """      {/* Board Columns */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div style={{
          flex: 1,
          overflowX: 'auto',
          overflowY: 'hidden',
          padding: '20px'
        }}>
          <div style={{
            display: 'flex',
            gap: '16px',
            height: '100%',
            minWidth: 'fit-content'
          }}>
            {filteredColumns.map((column) => (
              <BoardColumn
                key={column.id}
                column={column}
                cardSize={cardSize}
                showDescription={showDescription}
                showParticipants={showParticipants}
                onDeleteColumn={handleDeleteColumn}
                onEditColumn={() => setShowColumnSettings(column.id)}
                onDeleteTask={handleDeleteTask}
                onMarkAsDone={handleMarkAsDone}
                onUpdateTask={handleCardUpdateTask}
                onTaskClick={handleTaskClick}
              />
            ))}

            {/* Add Column Button */}
            <button
              onClick={handleAddColumn}
              style={{
                width: '280px',
                height: '48px',
                flexShrink: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                background: '#F9FAFB',
                border: '2px dashed #D1D5DB',
                borderRadius: '6px',
                cursor: 'pointer',
                color: '#6B7280',
                fontSize: '14px',
                fontWeight: 500
              }}
            >
              <Plus size={18} />
              Add Column
            </button>
          </div>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeTaskId ? (
            <div style={{
              opacity: 0.9,
              transform: 'rotate(3deg)',
              cursor: 'grabbing'
            }}>
              {(() => {
                // Find the active task
                const task = columns
                  .flatMap(col => col.tasks)
                  .find(t => t.id === activeTaskId);

                if (!task) return null;

                return (
                  <ImprovedTaskCard
                    task={task}
                    columnId=""
                    size={cardSize}
                    showDescription={showDescription}
                    showParticipants={showParticipants}
                    onDelete={() => {}}
                    onMarkAsDone={() => {}}
                    onUpdateTask={() => {}}
                    onClick={() => {}}
                  />
                );
              })()}
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>"""

content = content.replace(old_board_render, new_board_render)

# Write back
with open('src/pages/Projects/board/ProjectBoard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated ProjectBoard.tsx with @dnd-kit integration!")

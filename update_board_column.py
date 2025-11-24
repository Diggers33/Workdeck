import time

time.sleep(0.5)

# Read the file
with open('src/pages/Projects/board/BoardColumn.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add @dnd-kit imports
old_imports = """import React, { useState, useRef, useEffect } from 'react';
import { Plus, MoreVertical, Edit2, Trash2, GripVertical, AlertTriangle, AlertCircle } from 'lucide-react';
import { ImprovedTaskCard } from './ImprovedTaskCard';
import { Column, Task } from './ProjectBoard';"""

new_imports = """import React, { useState, useRef, useEffect } from 'react';
import { Plus, MoreVertical, Edit2, Trash2, GripVertical, AlertTriangle, AlertCircle } from 'lucide-react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { ImprovedTaskCard } from './ImprovedTaskCard';
import { Column, Task } from './ProjectBoard';"""

content = content.replace(old_imports, new_imports)

# Update the interface to remove old drag handlers
old_interface = """interface BoardColumnProps {
  column: Column;
  cardSize: 'small' | 'medium' | 'large';
  showDescription: boolean;
  showParticipants: boolean;
  onDragStart: (task: Task, columnId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDrop: (columnId: string, insertBeforeTaskId?: string) => void;
  onDeleteColumn: (columnId: string) => void;
  onEditColumn: () => void;
  onDeleteTask: (columnId: string, taskId: string) => void;
  onMarkAsDone: (columnId: string, taskId: string) => void;
  onUpdateTask?: (columnId: string, taskId: string, updates: any) => void;
  onTaskClick: (task: Task) => void;
  onColumnDragStart: (columnId: string) => void;
  onColumnDragOver: (e: React.DragEvent, columnId: string) => void;
  onColumnDrop: (columnId: string) => void;
  draggedColumn: string | null;
  dragOverColumn: string | null;
}"""

new_interface = """interface BoardColumnProps {
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
}"""

content = content.replace(old_interface, new_interface)

# Update the function signature
old_signature = """export function BoardColumn({
  column,
  cardSize,
  showDescription,
  showParticipants,
  onDragStart,
  onDragOver,
  onDrop,
  onDeleteColumn,
  onEditColumn,
  onDeleteTask,
  onMarkAsDone,
  onUpdateTask,
  onTaskClick,
  onColumnDragStart,
  onColumnDragOver,
  onColumnDrop,
  draggedColumn,
  dragOverColumn
}: BoardColumnProps) {"""

new_signature = """export function BoardColumn({
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

  const taskIds = column.tasks.map(task => task.id);"""

content = content.replace(old_signature, new_signature)

# Remove the old drag state variables
content = content.replace(
    """  const canDelete = column.id !== 'open' && column.id !== 'completed';
  const canDrag = column.id !== 'open' && !column.isCompleted;
  const isBeingDragged = draggedColumn === column.id;
  const isDropTarget = dragOverColumn === column.id;""",
    """  const canDelete = column.id !== 'open' && column.id !== 'completed';"""
)

# Write back
with open('src/pages/Projects/board/BoardColumn.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated BoardColumn.tsx with @dnd-kit droppable!")

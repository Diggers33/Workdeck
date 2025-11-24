import time

time.sleep(0.5)

# Read the file
with open('src/pages/Projects/board/ImprovedTaskCard.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add @dnd-kit imports
old_imports = """import React, { useState } from 'react';
import { Paperclip, MessageSquare, CheckSquare, AlertCircle, Clock, User, MoreVertical, Calendar, X, MessageCircle } from 'lucide-react';
import { Task } from './ProjectBoard';
import { BlockedModal } from './BlockedModal';"""

new_imports = """import React, { useState } from 'react';
import { Paperclip, MessageSquare, CheckSquare, AlertCircle, Clock, User, MoreVertical, Calendar, X, MessageCircle } from 'lucide-react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Task } from './ProjectBoard';
import { BlockedModal } from './BlockedModal';"""

content = content.replace(old_imports, new_imports)

# Update interface - remove onDragStart
old_interface = """interface ImprovedTaskCardProps {
  task: Task;
  columnId: string;
  size: 'small' | 'medium' | 'large';
  showDescription: boolean;
  showParticipants: boolean;
  showProjectReference?: boolean; // For My Work board
  onDragStart: (task: Task, columnId: string) => void;
  onTaskClick: (task: Task) => void;
  onDelete: (columnId: string, taskId: string) => void;
  onMarkAsDone: (columnId: string, taskId: string) => void;
  onUpdateTask?: (columnId: string, taskId: string, updates: any) => void;
  isSelected?: boolean;
  onToggleSelect?: (taskId: string) => void;
  onDragOverTask?: (taskId: string) => void;
}"""

new_interface = """interface ImprovedTaskCardProps {
  task: Task;
  columnId: string;
  size: 'small' | 'medium' | 'large';
  showDescription: boolean;
  showParticipants: boolean;
  showProjectReference?: boolean; // For My Work board
  onTaskClick: (task: Task) => void;
  onDelete: (columnId: string, taskId: string) => void;
  onMarkAsDone: (columnId: string, taskId: string) => void;
  onUpdateTask?: (columnId: string, taskId: string, updates: any) => void;
  isSelected?: boolean;
  onToggleSelect?: (taskId: string) => void;
}"""

content = content.replace(old_interface, new_interface)

# Update function signature
old_signature = """export function ImprovedTaskCard({
  task,
  columnId,
  size,
  showDescription,
  showParticipants,
  showProjectReference = false,
  onDragStart,
  onTaskClick,
  onDelete,
  onMarkAsDone,
  onUpdateTask,
  isSelected = false,
  onToggleSelect,
  onDragOverTask
}: ImprovedTaskCardProps) {"""

new_signature = """export function ImprovedTaskCard({
  task,
  columnId,
  size,
  showDescription,
  showParticipants,
  showProjectReference = false,
  onTaskClick,
  onDelete,
  onMarkAsDone,
  onUpdateTask,
  isSelected = false,
  onToggleSelect
}: ImprovedTaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };"""

content = content.replace(old_signature, new_signature)

# Find the main card div (the one with cursor: 'pointer') and update it
# We need to add ref, style, attributes, and listeners

# This is a bit tricky - we need to find where return ( starts and the main card div
# The pattern will be the div with background, borderRadius, border, etc.

# Find the pattern: return ( followed by <div with lots of styles
# Add ref={setNodeRef} style={style} {...attributes} {...listeners}

# Replace the draggable attribute and onDragStart handler
content = content.replace(
    "      draggable",
    "      ref={setNodeRef}\n      {...attributes}\n      {...listeners}\n      draggable={false}"
)

# Remove the onDragStart handler from the card
import re
content = re.sub(
    r"      onDragStart=\{\(e\) => \{[^}]+onDragStart\(task, columnId\);[^}]+\}\}",
    "",
    content,
    flags=re.DOTALL
)

# Update the style object to include the transform style
# Find where style={{ is defined and merge our styles
# Actually, better to add it inline - find the style prop and add ...style at the end

# Find the style={{ ... }} pattern in the main card div
# This is complex, so let's replace the whole style block

# Better approach: find "style={{" that comes after "cursor: 'pointer'" and add ", ...style" before the closing "}}"
# Or we can inject it into the background style

# Let's just find the main div's style and add ...style at the end
# The card div has "cursor: 'pointer'" so we can find that and modify

content = re.sub(
    r"(cursor: 'pointer',\s+position: 'relative',\s+flexShrink: 0)",
    r"\1,\n        ...style",
    content
)

# Write back
with open('src/pages/Projects/board/ImprovedTaskCard.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated ImprovedTaskCard.tsx to be draggable with @dnd-kit!")

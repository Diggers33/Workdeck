import time
import re

time.sleep(0.5)

# Read the file
with open('src/pages/Projects/board/BoardColumn.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Remove all the drop indicator state and logic since @dnd-kit handles this
content = content.replace(
    "  const [showMenu, setShowMenu] = useState(false);\n  const [dropIndicator, setDropIndicator] = useState<{ type: 'top' | 'between' | 'bottom'; index?: number } | null>(null);",
    "  const [showMenu, setShowMenu] = useState(false);"
)

# Remove all the auto-scroll logic and refs since they're not needed with @dnd-kit
content = re.sub(
    r"  const scrollContainerRef = useRef<HTMLDivElement>\(null\);[\s\S]*?// Auto-scroll logic[\s\S]*?  \};",
    "",
    content
)

# Remove the isDraggingOverRef
content = content.replace("  const isDraggingOverRef = useRef(false);", "")

# Remove the cleanup useEffect
content = re.sub(
    r"  // Cleanup on unmount\n  useEffect\(\(\) => \{[\s\S]*?\}, \[\]\);",
    "",
    content
)

# Now remove all the native drop zones - we'll replace the tasks section entirely

# Remove the top drop zone section
content = re.sub(
    r"        \{/\* Top drop zone \*/\}[\s\S]*?\{dropIndicator\?\.type === 'top' && '↓ Drop here to insert at top'\}\n          </div>\n        \)\}",
    "",
    content
)

# Now simplify the tasks rendering - remove drop zones between tasks
# Replace the entire task rendering section

old_tasks_render = r"        \{/\* Task cards with drop zones \*/\}[\s\S]*?        \{/\* Drop at end if empty \*/\}"

new_tasks_render = '''        {/* Task cards */}
        {column.tasks.map((task) => (
          <div key={task.id} style={{ marginBottom: '8px' }}>
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
          </div>
        ))}

        {/* Empty state */}
        {column.tasks.length === 0 && (
          <div style={{
            flex: 1,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '48px 24px',
            color: '#9CA3AF',
            fontSize: '13px',
            textAlign: 'center'
          }}>
            <div style={{ marginBottom: '8px', fontSize: '32px', opacity: 0.3 }}>📋</div>
            <div style={{ fontWeight: 500 }}>No tasks yet</div>
            <div style={{ fontSize: '11px', marginTop: '4px', opacity: 0.7 }}>Drag tasks here to get started</div>
          </div>
        )}'''

content = re.sub(old_tasks_render, new_tasks_render, content, flags=re.DOTALL)

# Update the scrollable div to not use ref
content = content.replace(
    "        ref={scrollContainerRef}",
    ""
)

# Write back
with open('src/pages/Projects/board/BoardColumn.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Cleaned up BoardColumn.tsx - removed old drag handlers!")

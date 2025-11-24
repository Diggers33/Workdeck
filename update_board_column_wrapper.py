import time
import re

time.sleep(0.5)

# Read the file
with open('src/pages/Projects/board/BoardColumn.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Find and update the main div's onDragOver and other native drag events - need to replace them
# First, let's find the return statement and update the main column div

# Update the column wrapper div to use setNodeRef and remove native drag handlers
# Find the section starting with "return (<div" and update it

# Pattern to find the opening div with draggable, onDragStart, etc.
old_div_pattern = r'''return \(
    <div
      draggable={canDrag}
      onDragStart={\(e\) => \{
        if \(!canDrag\) return;
        onColumnDragStart\(column\.id\);
      \}}
      onDragOver={\(e\) => \{
        e\.preventDefault\(\);
        onDragOver\(e\);
        onColumnDragOver\(e, column\.id\);
        handleAutoScroll\(e\);

        // Prevent setting drop indicator if we're column-dragging
        if \(!draggedColumn\) \{
          setDropIndicator\(null\);
        \}
      \}}
      onDragLeave={\(e\) => \{
        // Only clear on actual leave \(not child elements\)
        if \(e\.currentTarget === e\.target\) \{
          if \(scrollIntervalRef\.current\) \{
            clearInterval\(scrollIntervalRef\.current\);
            scrollIntervalRef\.current = null;
          \}
        \}
      \}}
      onDragEnter={\(\) => \{
        isDraggingOverRef\.current = true;
      \}}
      onDrop={\(e\) => \{
        e\.preventDefault\(\);
        e\.stopPropagation\(\);

        if \(draggedColumn\) \{
          onColumnDrop\(column\.id\);
        \} else \{
          // Drop at end if no specific position
          handleTaskDrop\(\);
        \}
      \}}
      style=\{\{
        width: getColumnWidth\(\),
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        background: '#FAFAFA',
        borderRadius: '8px',
        border: isDropTarget \? '2px solid #0066FF' : '1px solid #E5E7EB',
        transition: 'border 150ms ease, opacity 150ms ease',
        maxHeight: '100%',
        opacity: isBeingDragged \? 0\.5 : 1,
        cursor: canDrag \? 'grab' : 'default',
        position: 'relative'
      \}}
    >'''

new_div_pattern = '''return (
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
    >'''

content = re.sub(old_div_pattern, new_div_pattern, content, flags=re.DOTALL)

# Now wrap the tasks section with SortableContext
# Find the tasks scrollable area and wrap its content

old_tasks_section = '''      {/* Tasks Scrollable Area */}
      <div
        ref={scrollContainerRef}
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column'
        }}
      >'''

new_tasks_section = '''      {/* Tasks Scrollable Area */}
      <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
        <div
          ref={scrollContainerRef}
          style={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            padding: '12px',
            display: 'flex',
            flexDirection: 'column'
          }}
        >'''

content = content.replace(old_tasks_section, new_tasks_section)

# Now find where the scrollable div closes (before the </div> that closes the column)
# and add the closing </SortableContext>

# Find where empty state ends and column closes
# The pattern is the Empty State followed by closing </div> twice

old_closing = '''        {/* Empty state */}
        {column.tasks.length === 0 && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            color: '#9CA3AF',
            fontSize: '13px',
            textAlign: 'center',
            flex: 1
          }}>
            <div style={{ marginBottom: '8px', fontSize: '24px', opacity: 0.5 }}>📋</div>
            <div>No tasks yet</div>
            <div style={{ fontSize: '11px', marginTop: '4px' }}>Drag tasks here</div>
          </div>
        )}
      </div>'''

new_closing = '''        {/* Empty state */}
        {column.tasks.length === 0 && (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            color: '#9CA3AF',
            fontSize: '13px',
            textAlign: 'center',
            flex: 1
          }}>
            <div style={{ marginBottom: '8px', fontSize: '24px', opacity: 0.5 }}>📋</div>
            <div>No tasks yet</div>
            <div style={{ fontSize: '11px', marginTop: '4px' }}>Drag tasks here</div>
          </div>
        )}
        </div>
      </SortableContext>'''

content = content.replace(old_closing, new_closing)

# Remove the handleTaskDrop function and drop zones since @dnd-kit handles this
# Remove drop zone logic
content = re.sub(
    r"  const handleTaskDrop = \(insertBeforeTaskId\?: string\) => \{[^}]+\};",
    "",
    content,
    flags=re.DOTALL
)

# Write back
with open('src/pages/Projects/board/BoardColumn.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated BoardColumn.tsx with SortableContext wrapper!")

import time

time.sleep(0.5)

# Read the file
with open('src/pages/Projects/GanttView.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Update the component signature to include onBoardClick
content = content.replace(
    'export function GanttView({ onEditProject, onBackToTriage }: { onEditProject?: (id: string) => void; onBackToTriage: () => void }) {',
    'export function GanttView({ onEditProject, onBackToTriage, onBoardClick }: { onEditProject?: (id: string) => void; onBackToTriage: () => void; onBoardClick?: () => void }) {'
)

# Find the GanttTopBar usage and add onBoardClick prop
# This will be in the JSX somewhere
content = content.replace(
    '<GanttTopBar',
    '<GanttTopBar\n        onBoardClick={onBoardClick}'
)

# Write back
with open('src/pages/Projects/GanttView.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated GanttView.tsx!")

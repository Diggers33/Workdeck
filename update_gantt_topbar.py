import time

time.sleep(0.5)

# Read the file
with open('src/pages/Projects/gantt/GanttTopBar.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Update the interface to include onBoardClick
content = content.replace(
    '''interface GanttTopBarProps {
  onBack: () => void;
  onOpenComments?: () => void;
  onOpenFiles?: () => void;
  onEditProject?: () => void;
}''',
    '''interface GanttTopBarProps {
  onBack: () => void;
  onOpenComments?: () => void;
  onOpenFiles?: () => void;
  onEditProject?: () => void;
  onBoardClick?: () => void;
}'''
)

# Update the function signature
content = content.replace(
    'export function GanttTopBar({ onBack, onOpenComments, onOpenFiles, onEditProject }: GanttTopBarProps) {',
    'export function GanttTopBar({ onBack, onOpenComments, onOpenFiles, onEditProject, onBoardClick }: GanttTopBarProps) {'
)

# Update the view switcher to track current view and handle clicks
# First add state at the beginning of component
content = content.replace(
    'export function GanttTopBar({ onBack, onOpenComments, onOpenFiles, onEditProject, onBoardClick }: GanttTopBarProps) {\n  return (',
    '''export function GanttTopBar({ onBack, onOpenComments, onOpenFiles, onEditProject, onBoardClick }: GanttTopBarProps) {
  const [currentView, setCurrentView] = React.useState<'Gantt' | 'Board' | 'Financial'>('Gantt');

  const handleViewClick = (view: 'Gantt' | 'Board' | 'Financial') => {
    setCurrentView(view);
    if (view === 'Board' && onBoardClick) {
      onBoardClick();
    }
  };

  return ('''
)

# Update the button to use the handler
old_button = '''        {['Gantt', 'Board', 'Financial'].map((view) => (
          <button
            key={view}
            style={{
              flex: 1,
              height: '36px',
              background: view === 'Gantt' ? 'white' : 'transparent',
              border: 'none',
              borderRadius: '6px',
              fontSize: '15px',
              fontWeight: view === 'Gantt' ? 600 : 400,
              color: view === 'Gantt' ? '#0A0A0A' : '#6B7280',
              cursor: 'pointer',
              boxShadow: view === 'Gantt' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 150ms ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center'
            }}
            onMouseEnter={(e) => {
              if (view !== 'Gantt') e.currentTarget.style.background = 'rgba(255,255,255,0.6)';
            }}
            onMouseLeave={(e) => {
              if (view !== 'Gantt') e.currentTarget.style.background = 'transparent';
            }}
          >
            {view}
          </button>
        ))}'''

new_button = '''        {(['Gantt', 'Board', 'Financial'] as const).map((view) => (
          <button
            key={view}
            onClick={() => handleViewClick(view)}
            style={{
              flex: 1,
              height: '36px',
              background: view === currentView ? 'white' : 'transparent',
              border: 'none',
              borderRadius: '6px',
              fontSize: '15px',
              fontWeight: view === currentView ? 600 : 400,
              color: view === currentView ? '#0A0A0A' : '#6B7280',
              cursor: 'pointer',
              boxShadow: view === currentView ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 150ms ease',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center'
            }}
            onMouseEnter={(e) => {
              if (view !== currentView) e.currentTarget.style.background = 'rgba(255,255,255,0.6)';
            }}
            onMouseLeave={(e) => {
              if (view !== currentView) e.currentTarget.style.background = 'transparent';
            }}
          >
            {view}
          </button>
        ))}'''

content = content.replace(old_button, new_button)

# Write back
with open('src/pages/Projects/gantt/GanttTopBar.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated GanttTopBar.tsx!")

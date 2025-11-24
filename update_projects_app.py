import time

time.sleep(0.5)

# Read the file
with open('src/pages/Projects/ProjectsApp.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# Add ProjectBoard import
content = content.replace(
    "import { GanttView } from './GanttView';",
    "import { GanttView } from './GanttView';\nimport { ProjectBoard } from './board/ProjectBoard';"
)

# Update view state type
content = content.replace(
    "const [activeView, setActiveView] = useState<'triage' | 'gantt'>('triage');",
    "const [activeView, setActiveView] = useState<'triage' | 'gantt' | 'board'>('triage');\n  const [currentProjectName, setCurrentProjectName] = useState<string>('BIOGEMSE');"
)

# Add onBoardClick handler to GanttView
content = content.replace(
    '''        {activeView === 'gantt' && (
          <GanttView
            onEditProject={handleEditProject}
            onBackToTriage={handleBackToTriage}
          />
        )}''',
    '''        {activeView === 'gantt' && (
          <GanttView
            onEditProject={handleEditProject}
            onBackToTriage={handleBackToTriage}
            onBoardClick={() => setActiveView('board')}
          />
        )}
        {activeView === 'board' && (
          <ProjectBoard
            onClose={() => setActiveView('gantt')}
            projectName={currentProjectName}
          />
        )}'''
)

# Write back
with open('src/pages/Projects/ProjectsApp.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print("Updated ProjectsApp.tsx!")

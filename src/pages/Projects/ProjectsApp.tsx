import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '../../components/layout/AppLayout';
import { ProjectTriageBoard } from './ProjectTriageBoard';
import { GanttView } from './GanttView';
import { ProjectBoard } from './board/ProjectBoard';

export default function ProjectsApp() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<'triage' | 'gantt' | 'board'>('triage');
  const [currentProjectName, setCurrentProjectName] = useState<string>('BIOGEMSE');

  const handleCreateProject = () => {
    navigate('/projects/new');
  };

  const handleEditProject = (projectId: string) => {
    navigate(`/projects/edit/${projectId}`);
  };

  const handleBackToTriage = () => {
    setActiveView('triage');
  };

  return (
    <AppLayout>
      {/* Main Content */}
      <div className="p-6 bg-[#F8F9FC] min-h-[calc(100vh-60px)]">
        {activeView === 'triage' && (
          <ProjectTriageBoard
            onEditProject={handleEditProject}
            onGanttClick={() => setActiveView('gantt')}
            onCreateProject={handleCreateProject}
          />
        )}
        {activeView === 'gantt' && (
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
        )}
      </div>
    </AppLayout>
  );
}

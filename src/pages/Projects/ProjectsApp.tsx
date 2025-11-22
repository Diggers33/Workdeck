import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LayoutGrid, BarChart3, Plus } from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import { ProjectTriageBoard } from './ProjectTriageBoard';
import { GanttView } from './GanttView';

export default function ProjectsApp() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<'triage' | 'gantt'>('triage');

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
      {/* PROJECTS TOOLBAR */}
      <div className="bg-white border-b px-6 py-3" style={{ borderBottomColor: '#E5E7EB' }}>
        <div className="max-w-[1440px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* View Toggle */}
            <div className="flex items-center bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveView('triage')}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors flex items-center gap-2 ${
                  activeView === 'triage'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                Triage
              </button>
              <button
                onClick={() => setActiveView('gantt')}
                className={`px-3 py-1.5 rounded-md text-sm transition-colors flex items-center gap-2 ${
                  activeView === 'gantt'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                <BarChart3 className="w-4 h-4" />
                Gantt
              </button>
            </div>
          </div>

          {/* Create New Project Button */}
          <button
            onClick={handleCreateProject}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            New Project
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6 bg-[#F8F9FC] min-h-[calc(100vh-60px)]">
        {activeView === 'triage' && (
          <ProjectTriageBoard
            onEditProject={handleEditProject}
            onGanttClick={() => setActiveView('gantt')}
          />
        )}
        {activeView === 'gantt' && (
          <GanttView
            onEditProject={handleEditProject}
            onBackToTriage={handleBackToTriage}
          />
        )}
      </div>
    </AppLayout>
  );
}

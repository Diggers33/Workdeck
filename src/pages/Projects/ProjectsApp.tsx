import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Clock, Receipt, Bell, Settings as SettingsIcon, LayoutGrid, BarChart3 } from 'lucide-react';
import { ProjectTriageBoard } from './ProjectTriageBoard';
import { GanttView } from './GanttView';
import workdeckLogo from '../Dashboard/assets/6f22f481b9cda400eddbba38bd4678cd9b214998.png';

export default function ProjectsApp() {
  const navigate = useNavigate();
  const [activeView, setActiveView] = useState<'triage' | 'gantt'>('triage');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('Work');
  const [activeWorkSubTab, setActiveWorkSubTab] = useState('Projects');

  const tabs = ['Dashboard', 'Work', 'Time', 'Finance', 'People', 'Analytics'];

  const subMenus = {
    Work: ['Projects', 'My Tasks', 'Resource Planner', 'Manager View', 'Client Board']
  };

  const handleTabClick = (tab: string) => {
    if (tab === 'Dashboard') {
      navigate('/');
    } else {
      setActiveTab(tab);
    }
  };

  const handleSubMenuClick = (subTab: string) => {
    setActiveWorkSubTab(subTab);
    if (subTab === 'Projects') {
      navigate('/projects');
    } else if (subTab === 'Resource Planner') {
      navigate('/planner');
    }
  };

  const handleCreateProject = () => {
    navigate('/projects/new');
  };

  const handleEditProject = (projectId: string) => {
    navigate(`/projects/edit/${projectId}`);
  };

  const handleOpenGantt = (projectId?: string) => {
    if (projectId) {
      setSelectedProjectId(projectId);
    }
    setActiveView('gantt');
  };

  const handleBackToTriage = () => {
    setActiveView('triage');
    setSelectedProjectId(null);
  };

  return (
    <div className="min-h-screen bg-[#F8F9FC]">
      {/* MAIN HEADER BAR */}
      <header className="bg-white border-b" style={{ height: '60px', borderBottomColor: '#E5E7EB' }}>
        <div className="h-full mx-auto flex items-center justify-between px-6" style={{ maxWidth: '1440px' }}>
          {/* Left section */}
          <div className="flex items-center gap-6">
            <img src={workdeckLogo} alt="Workdeck" style={{ width: '140px', cursor: 'pointer' }} onClick={() => navigate('/')} />

            <nav className="flex items-center gap-2">
              {tabs.map((tab) => (
                <button
                  key={tab}
                  onClick={() => handleTabClick(tab)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                    activeTab === tab
                      ? 'bg-[#3B82F6] text-white'
                      : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB]'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </nav>
          </div>

          {/* Center section - Global search */}
          <div className="relative" style={{ width: '400px' }}>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input
              type="text"
              placeholder="Search or press ⌘K"
              className="w-full h-9 pl-10 pr-4 bg-[#F9FAFB] border border-transparent rounded-md text-sm text-[#111827] placeholder-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#3B82F6] transition-all"
            />
          </div>

          {/* Right section */}
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#F9FAFB] text-[#6B7280] transition-all hover:scale-105" title="Add task (T)">
              <Plus className="w-6 h-6" />
            </button>

            <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#F9FAFB] text-[#6B7280] transition-all hover:scale-105" title="Log time (⌘T)">
              <Clock className="w-6 h-6" />
            </button>

            <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#F9FAFB] text-[#6B7280] transition-all hover:scale-105" title="Submit expense">
              <Receipt className="w-6 h-6" />
            </button>

            <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#F9FAFB] text-[#6B7280] relative ml-2">
              <Bell className="w-6 h-6" />
              <span className="absolute top-0 right-0 w-4 h-4 bg-[#EF4444] text-white text-[9px] rounded-full flex items-center justify-center animate-pulse">3</span>
            </button>

            <div className="relative ml-2">
              <div className="w-10 h-10 rounded-full bg-[#3B82F6] flex items-center justify-center text-white text-sm">
                SM
              </div>
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#10B981] border-2 border-white rounded-full"></div>
            </div>

            <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#F9FAFB] text-[#6B7280]">
              <SettingsIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* WORK SUBMENU */}
      <div className="bg-white border-b" style={{ borderBottomColor: '#E5E7EB' }}>
        <div className="mx-auto px-6 py-3" style={{ maxWidth: '1440px' }}>
          <div className="flex items-center justify-between">
            <nav className="flex items-center gap-2">
              {subMenus.Work.map((subTab) => (
                <button
                  key={subTab}
                  onClick={() => handleSubMenuClick(subTab)}
                  className={`px-3 py-1.5 rounded-md text-sm transition-all ${
                    activeWorkSubTab === subTab
                      ? 'bg-[#EFF6FF] text-[#3B82F6] font-medium'
                      : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB]'
                  }`}
                >
                  {subTab}
                </button>
              ))}
            </nav>

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
        </div>
      </div>

      {/* Main Content */}
      <div className="p-6">
        {activeView === 'triage' && (
          <ProjectTriageBoard
            onEditProject={handleEditProject}
            onGanttClick={handleOpenGantt}
          />
        )}
        {activeView === 'gantt' && (
          <GanttView
            onEditProject={handleEditProject}
            onBackToTriage={handleBackToTriage}
          />
        )}
      </div>
    </div>
  );
}

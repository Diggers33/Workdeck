import { useNavigate, useParams } from 'react-router-dom';
import { Search, Plus, Clock, Receipt, Bell, Settings as SettingsIcon, X } from 'lucide-react';
import { ProjectWorkspace } from './wizard/ProjectWorkspace';
import workdeckLogo from '../Dashboard/assets/6f22f481b9cda400eddbba38bd4678cd9b214998.png';

export default function ProjectWizardPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const tabs = ['Dashboard', 'Work', 'Time', 'Finance', 'People', 'Analytics'];

  const handleTabClick = (tab: string) => {
    if (tab === 'Dashboard') {
      navigate('/');
    } else if (tab === 'Work') {
      navigate('/projects');
    }
  };

  const handleClose = () => {
    navigate('/projects');
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
                    tab === 'Work'
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

      {/* BREADCRUMB / TITLE BAR */}
      <div className="bg-white border-b" style={{ borderBottomColor: '#E5E7EB' }}>
        <div className="mx-auto px-6 py-4" style={{ maxWidth: '1440px' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-semibold">
                  {id ? 'Edit Project' : 'Create New Project'}
                </h1>
                <p className="text-sm text-gray-600">
                  {id ? 'Update project details and settings' : 'Set up your new project'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Project Wizard */}
      <div className="p-6">
        <ProjectWorkspace
          projectId={id || null}
          onClose={handleClose}
        />
      </div>
    </div>
  );
}

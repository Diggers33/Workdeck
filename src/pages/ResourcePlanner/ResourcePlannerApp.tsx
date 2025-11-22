import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Clock, Receipt, Bell, Settings as SettingsIcon, BarChart3, Calendar as CalendarIcon } from 'lucide-react';
import workdeckLogo from '../Dashboard/assets/6f22f481b9cda400eddbba38bd4678cd9b214998.png';
import { HeatMap } from './components/HeatMap';
import { ResourceAllocation } from './components/ResourceAllocation';
import { TaskDetailModal } from './components/TaskDetailModal';
import { PlanTimeDialog } from './components/PlanTimeDialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs';
import { Toaster } from './components/ui/sonner';
import { mockUsers, mockTasks, mockProjects, departments, mockLeaves } from './data/mockData';
import { Task } from './types';
import { toast } from 'sonner';

export default function App() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'heatmap' | 'allocation'>('heatmap');
  const [tasks, setTasks] = useState(mockTasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [planTimeUserId, setPlanTimeUserId] = useState<string | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showPlanTimeDialog, setShowPlanTimeDialog] = useState(false);
  const [navActiveTab, setNavActiveTab] = useState('Work');
  const [activeWorkSubTab, setActiveWorkSubTab] = useState('Resource Planner');

  const tabs = ['Dashboard', 'Work', 'Time', 'Finance', 'People', 'Analytics'];

  const subMenus = {
    Work: ['Projects', 'My Tasks', 'Resource Planner', 'Manager View', 'Client Board']
  };

  const handleNavTabClick = (tab: string) => {
    setNavActiveTab(tab);
    if (tab === 'Dashboard') {
      navigate('/');
    } else if (tab === 'Work') {
      // Stay on current Work page
    } else if (tab === 'Time') {
      navigate('/time/my-calendar');
    } else if (tab === 'Finance') {
      navigate('/finance/expenses');
    } else if (tab === 'People') {
      navigate('/people/directory');
    } else if (tab === 'Analytics') {
      navigate('/analytics/reports');
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

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const handleTaskSave = (updatedTask: Task) => {
    setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
    toast.success('Task updated successfully');
  };

  const handlePlanTime = (userId: string) => {
    setPlanTimeUserId(userId);
    setShowPlanTimeDialog(true);
  };

  const handlePlanTimeSave = (allocation: any) => {
    toast.success('Time allocation planned successfully');
    // In a real app, this would update the tasks
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
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
                  onClick={() => handleNavTabClick(tab)}
                  className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                    navActiveTab === tab
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

            <div className="text-sm text-gray-600">
              {mockUsers.length} Team Members • {mockProjects.length} Active Projects
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="h-full flex flex-col">
          {/* Tab Navigation */}
          <div className="bg-white border-b border-gray-200 px-6">
            <TabsList className="bg-transparent">
              <TabsTrigger 
                value="heatmap" 
                className="data-[state=active]:bg-gray-100"
              >
                <CalendarIcon className="h-4 w-4 mr-2" />
                Heat Map
              </TabsTrigger>
              <TabsTrigger 
                value="allocation"
                className="data-[state=active]:bg-gray-100"
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Resource Allocation
              </TabsTrigger>
            </TabsList>
          </div>
          
          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">
            <TabsContent value="heatmap" className="h-full m-0">
              <HeatMap
                users={mockUsers}
                tasks={tasks}
                projects={mockProjects}
                departments={departments}
                leaves={mockLeaves}
                onTaskClick={handleTaskClick}
                onPlanTime={handlePlanTime}
              />
            </TabsContent>
            
            <TabsContent value="allocation" className="h-full m-0">
              <ResourceAllocation
                users={mockUsers}
                tasks={tasks}
                projects={mockProjects}
                departments={departments}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
      
      {/* Modals */}
      <TaskDetailModal
        task={selectedTask}
        users={mockUsers}
        projects={mockProjects}
        open={showTaskModal}
        onClose={() => setShowTaskModal(false)}
        onSave={handleTaskSave}
      />
      
      <PlanTimeDialog
        userId={planTimeUserId}
        users={mockUsers}
        tasks={tasks}
        projects={mockProjects}
        open={showPlanTimeDialog}
        onClose={() => setShowPlanTimeDialog(false)}
        onSave={handlePlanTimeSave}
      />
      
      {/* Toast Notifications */}
      <Toaster />
    </div>
  );
}
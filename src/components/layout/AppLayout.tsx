import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, Plus, Clock, Receipt, Bell, Settings as SettingsIcon } from 'lucide-react';
import workdeckLogo from '../../pages/Dashboard/assets/6f22f481b9cda400eddbba38bd4678cd9b214998.png';

interface AppLayoutProps {
  children: React.ReactNode;
  onSettingsClick?: () => void;
}

export function AppLayout({ children, onSettingsClick }: AppLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [activeWorkSubTab, setActiveWorkSubTab] = useState('Projects');
  const [activeTimeSubTab, setActiveTimeSubTab] = useState('My Calendar');
  const [activeFinanceSubTab, setActiveFinanceSubTab] = useState('Expenses');
  const [activePeopleSubTab, setActivePeopleSubTab] = useState('Directory');
  const [activeAnalyticsSubTab, setActiveAnalyticsSubTab] = useState('Reports');

  const tabs = ['Dashboard', 'Work', 'Time', 'Finance', 'People', 'Analytics'];

  const subMenus = {
    Work: ['Projects', 'My Tasks', 'Resource Planner', 'Manager View', 'Client Board'],
    Time: ['My Calendar', 'Timesheets', 'Leave', 'Team Leave', 'Approvals'],
    Finance: ['Expenses', 'Purchases', 'Invoices', 'Billing'],
    People: ['Directory', 'Org Chart', 'Team Profiles', 'Skills Matrix'],
    Analytics: ['Reports', 'AI Insights', 'Utilization', 'Forecasting']
  };

  // Sync active tab with current route
  useEffect(() => {
    const path = location.pathname;
    if (path === '/') {
      setActiveTab('Dashboard');
    } else if (path.startsWith('/projects') || path.startsWith('/work') || path === '/planner') {
      setActiveTab('Work');
      if (path === '/projects' || path.startsWith('/projects/')) {
        setActiveWorkSubTab('Projects');
      } else if (path === '/planner') {
        setActiveWorkSubTab('Resource Planner');
      } else if (path.startsWith('/work/my-tasks')) {
        setActiveWorkSubTab('My Tasks');
      } else if (path.startsWith('/work/manager-view')) {
        setActiveWorkSubTab('Manager View');
      } else if (path.startsWith('/work/client-board')) {
        setActiveWorkSubTab('Client Board');
      }
    } else if (path.startsWith('/time')) {
      setActiveTab('Time');
      if (path.startsWith('/time/my-calendar')) setActiveTimeSubTab('My Calendar');
      else if (path.startsWith('/time/timesheets')) setActiveTimeSubTab('Timesheets');
      else if (path.startsWith('/time/leave') && !path.includes('team')) setActiveTimeSubTab('Leave');
      else if (path.startsWith('/time/team-leave')) setActiveTimeSubTab('Team Leave');
      else if (path.startsWith('/time/approvals')) setActiveTimeSubTab('Approvals');
    } else if (path.startsWith('/finance')) {
      setActiveTab('Finance');
      if (path.startsWith('/finance/expenses')) setActiveFinanceSubTab('Expenses');
      else if (path.startsWith('/finance/purchases')) setActiveFinanceSubTab('Purchases');
      else if (path.startsWith('/finance/invoices')) setActiveFinanceSubTab('Invoices');
      else if (path.startsWith('/finance/billing')) setActiveFinanceSubTab('Billing');
    } else if (path.startsWith('/people')) {
      setActiveTab('People');
      if (path.startsWith('/people/directory')) setActivePeopleSubTab('Directory');
      else if (path.startsWith('/people/org-chart')) setActivePeopleSubTab('Org Chart');
      else if (path.startsWith('/people/profiles')) setActivePeopleSubTab('Team Profiles');
      else if (path.startsWith('/people/skills')) setActivePeopleSubTab('Skills Matrix');
    } else if (path.startsWith('/analytics')) {
      setActiveTab('Analytics');
      if (path.startsWith('/analytics/reports')) setActiveAnalyticsSubTab('Reports');
      else if (path.startsWith('/analytics/insights')) setActiveAnalyticsSubTab('AI Insights');
      else if (path.startsWith('/analytics/utilization')) setActiveAnalyticsSubTab('Utilization');
      else if (path.startsWith('/analytics/forecasting')) setActiveAnalyticsSubTab('Forecasting');
    }
  }, [location.pathname]);

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);

    // Navigate to default view for each tab
    if (tab === 'Work') {
      navigate('/projects');
    } else if (tab === 'Dashboard') {
      navigate('/');
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

  const handleSubMenuClick = (menu: string, subTab: string) => {
    if (menu === 'Work') {
      setActiveWorkSubTab(subTab);
      if (subTab === 'Projects') {
        navigate('/projects');
      } else if (subTab === 'Resource Planner') {
        navigate('/planner');
      } else if (subTab === 'My Tasks') {
        navigate('/work/my-tasks');
      } else if (subTab === 'Manager View') {
        navigate('/work/manager-view');
      } else if (subTab === 'Client Board') {
        navigate('/work/client-board');
      }
    } else if (menu === 'Time') {
      setActiveTimeSubTab(subTab);
      if (subTab === 'My Calendar') {
        navigate('/time/my-calendar');
      } else if (subTab === 'Timesheets') {
        navigate('/time/timesheets');
      } else if (subTab === 'Leave') {
        navigate('/time/leave');
      } else if (subTab === 'Team Leave') {
        navigate('/time/team-leave');
      } else if (subTab === 'Approvals') {
        navigate('/time/approvals');
      }
    } else if (menu === 'Finance') {
      setActiveFinanceSubTab(subTab);
      if (subTab === 'Expenses') {
        navigate('/finance/expenses');
      } else if (subTab === 'Purchases') {
        navigate('/finance/purchases');
      } else if (subTab === 'Invoices') {
        navigate('/finance/invoices');
      } else if (subTab === 'Billing') {
        navigate('/finance/billing');
      }
    } else if (menu === 'People') {
      setActivePeopleSubTab(subTab);
      if (subTab === 'Directory') {
        navigate('/people/directory');
      } else if (subTab === 'Org Chart') {
        navigate('/people/org-chart');
      } else if (subTab === 'Team Profiles') {
        navigate('/people/profiles');
      } else if (subTab === 'Skills Matrix') {
        navigate('/people/skills');
      }
    } else if (menu === 'Analytics') {
      setActiveAnalyticsSubTab(subTab);
      if (subTab === 'Reports') {
        navigate('/analytics/reports');
      } else if (subTab === 'AI Insights') {
        navigate('/analytics/insights');
      } else if (subTab === 'Utilization') {
        navigate('/analytics/utilization');
      } else if (subTab === 'Forecasting') {
        navigate('/analytics/forecasting');
      }
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFBFC' }}>
      {/* HEADER BAR */}
      <header className="bg-white border-b" style={{ height: '60px', borderBottomColor: '#E5E7EB' }}>
        <div className="h-full mx-auto flex items-center justify-between px-6" style={{ maxWidth: '1440px' }}>
          {/* Left section */}
          <div className="flex items-center gap-6">
            <img
              src={workdeckLogo}
              alt="Workdeck"
              style={{ width: '140px', cursor: 'pointer' }}
              onClick={() => navigate('/')}
            />

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
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <div className="w-1.5 h-1.5 bg-[#3B82F6] rounded-full animate-pulse"></div>
              <span className="text-xs text-[#9CA3AF]">⌘K</span>
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-2">
            <button
              className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#F9FAFB] text-[#6B7280] transition-all hover:scale-105"
              title="Add task (T)"
            >
              <Plus className="w-6 h-6" />
            </button>

            <button
              className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#F9FAFB] text-[#6B7280] transition-all hover:scale-105"
              title="Log time (⌘T)"
            >
              <Clock className="w-6 h-6" />
            </button>

            <button
              className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#F9FAFB] text-[#6B7280] transition-all hover:scale-105"
              title="Submit expense"
            >
              <Receipt className="w-6 h-6" />
            </button>

            <button
              className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#F9FAFB] text-[#6B7280] transition-all hover:scale-105"
              title="Search (⌘K)"
            >
              <Search className="w-6 h-6" />
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

            <button
              className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#F9FAFB] text-[#6B7280]"
              onClick={onSettingsClick}
            >
              <SettingsIcon className="w-6 h-6" />
            </button>
          </div>
        </div>
      </header>

      {/* WORK SUBMENU */}
      {activeTab === 'Work' && (
        <div className="bg-white border-b" style={{ borderBottomColor: '#E5E7EB' }}>
          <div className="mx-auto px-6 py-3" style={{ maxWidth: '1440px' }}>
            <nav className="flex items-center gap-2">
              {subMenus.Work.map((subTab) => (
                <button
                  key={subTab}
                  onClick={() => handleSubMenuClick('Work', subTab)}
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
          </div>
        </div>
      )}

      {/* TIME SUBMENU */}
      {activeTab === 'Time' && (
        <div className="bg-white border-b" style={{ borderBottomColor: '#E5E7EB' }}>
          <div className="mx-auto px-6 py-3" style={{ maxWidth: '1440px' }}>
            <nav className="flex items-center gap-2">
              {subMenus.Time.map((subTab) => (
                <button
                  key={subTab}
                  onClick={() => handleSubMenuClick('Time', subTab)}
                  className={`px-3 py-1.5 rounded-md text-sm transition-all ${
                    activeTimeSubTab === subTab
                      ? 'bg-[#EFF6FF] text-[#3B82F6] font-medium'
                      : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB]'
                  }`}
                >
                  {subTab}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* FINANCE SUBMENU */}
      {activeTab === 'Finance' && (
        <div className="bg-white border-b" style={{ borderBottomColor: '#E5E7EB' }}>
          <div className="mx-auto px-6 py-3" style={{ maxWidth: '1440px' }}>
            <nav className="flex items-center gap-2">
              {subMenus.Finance.map((subTab) => (
                <button
                  key={subTab}
                  onClick={() => handleSubMenuClick('Finance', subTab)}
                  className={`px-3 py-1.5 rounded-md text-sm transition-all ${
                    activeFinanceSubTab === subTab
                      ? 'bg-[#EFF6FF] text-[#3B82F6] font-medium'
                      : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB]'
                  }`}
                >
                  {subTab}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* PEOPLE SUBMENU */}
      {activeTab === 'People' && (
        <div className="bg-white border-b" style={{ borderBottomColor: '#E5E7EB' }}>
          <div className="mx-auto px-6 py-3" style={{ maxWidth: '1440px' }}>
            <nav className="flex items-center gap-2">
              {subMenus.People.map((subTab) => (
                <button
                  key={subTab}
                  onClick={() => handleSubMenuClick('People', subTab)}
                  className={`px-3 py-1.5 rounded-md text-sm transition-all ${
                    activePeopleSubTab === subTab
                      ? 'bg-[#EFF6FF] text-[#3B82F6] font-medium'
                      : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB]'
                  }`}
                >
                  {subTab}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* ANALYTICS SUBMENU */}
      {activeTab === 'Analytics' && (
        <div className="bg-white border-b" style={{ borderBottomColor: '#E5E7EB' }}>
          <div className="mx-auto px-6 py-3" style={{ maxWidth: '1440px' }}>
            <nav className="flex items-center gap-2">
              {subMenus.Analytics.map((subTab) => (
                <button
                  key={subTab}
                  onClick={() => handleSubMenuClick('Analytics', subTab)}
                  className={`px-3 py-1.5 rounded-md text-sm transition-all ${
                    activeAnalyticsSubTab === subTab
                      ? 'bg-[#EFF6FF] text-[#3B82F6] font-medium'
                      : 'text-[#6B7280] hover:text-[#111827] hover:bg-[#F9FAFB]'
                  }`}
                >
                  {subTab}
                </button>
              ))}
            </nav>
          </div>
        </div>
      )}

      {/* MAIN CONTENT */}
      {children}
    </div>
  );
}

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Plus,
  Clock,
  Receipt,
  Bell,
  Settings as SettingsIcon,
  CheckCircle,
  Shield,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  X,
  Play,
  Pin,
  MoreHorizontal,
  MessageSquare,
  Calendar,
  Sparkles,
  TrendingDown,
  Moon
} from 'lucide-react';
import workdeckLogo from 'figma:asset/6f22f481b9cda400eddbba38bd4678cd9b214998.png';

function App() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Dashboard');
  const [activeToDoTab, setActiveToDoTab] = useState('Personal');
  const [hoveredProject, setHoveredProject] = useState<number | null>(null);
  const [hoveredTask, setHoveredTask] = useState<number | null>(null);
  const [hoveredFYI, setHoveredFYI] = useState<number | null>(null);
  const [activeWorkSubTab, setActiveWorkSubTab] = useState('Projects');
  const [activeTimeSubTab, setActiveTimeSubTab] = useState('My Calendar');
  const [activeFinanceSubTab, setActiveFinanceSubTab] = useState('Expenses');
  const [activeAnalyticsSubTab, setActiveAnalyticsSubTab] = useState('Reports');

  const tabs = ['Dashboard', 'Work', 'Time', 'Finance', 'People', 'Analytics'];

  const subMenus = {
    Work: ['Projects', 'My Tasks', 'Resource Planner', 'Manager View', 'Client Board'],
    Time: ['My Calendar', 'Timesheets', 'Leave', 'Team Leave', 'Approvals'],
    Finance: ['Expenses', 'Purchases', 'Invoices', 'Billing'],
    Analytics: ['Reports', 'AI Insights', 'Utilization', 'Forecasting']
  };

  const handleTabClick = (tab: string) => {
    setActiveTab(tab);
  };

  const handleSubMenuClick = (menu: string, subTab: string) => {
    if (menu === 'Work') {
      setActiveWorkSubTab(subTab);
      if (subTab === 'Projects') {
        navigate('/projects');
      } else if (subTab === 'Resource Planner') {
        navigate('/planner');
      }
    } else if (menu === 'Time') {
      setActiveTimeSubTab(subTab);
    } else if (menu === 'Finance') {
      setActiveFinanceSubTab(subTab);
    } else if (menu === 'Analytics') {
      setActiveAnalyticsSubTab(subTab);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFBFC' }}>
      <style>{`
        /* Scrollbars - hidden by default, visible on hover */
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: transparent;
          border-radius: 4px;
        }
        .custom-scrollbar:hover::-webkit-scrollbar-thumb {
          background: rgba(156, 163, 175, 0.4);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(156, 163, 175, 0.7);
        }
        
        /* Firefox scrollbar */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: transparent transparent;
        }
        .custom-scrollbar:hover {
          scrollbar-color: rgba(156, 163, 175, 0.4) transparent;
        }
        
        /* Fade indicator at bottom of scrollable content */
        .fade-indicator::after {
          content: '';
          position: absolute;
          bottom: 36px;
          left: 0;
          right: 0;
          height: 40px;
          background: linear-gradient(to bottom, transparent, white);
          pointer-events: none;
        }
        
        /* Pulse animation for critical alerts */
        @keyframes alertPulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.05); }
        }
        .alert-pulse {
          animation: alertPulse 2s ease-in-out infinite;
        }
      `}</style>

      {/* HEADER BAR */}
      <header className="bg-white border-b" style={{ height: '60px', borderBottomColor: '#E5E7EB' }}>
        <div className="h-full mx-auto flex items-center justify-between px-6" style={{ maxWidth: '1440px' }}>
          {/* Left section */}
          <div className="flex items-center gap-6">
            <img src={workdeckLogo} alt="Workdeck" style={{ width: '140px' }} />
            
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

            <button className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#F9FAFB] text-[#6B7280]">
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

      {/* MAIN DASHBOARD LAYOUT */}
      <main className="mx-auto px-5 py-5" style={{ maxWidth: '1400px' }}>
        
        {/* 4-COLUMN LAYOUT: Col1(FYI+Pending) | Col2(Team+RedZone) | Col3(Todo-full) | Col4(Agenda-full) */}
        <div className="grid gap-4" style={{ gridTemplateColumns: '338px 338px 338px 338px', gridTemplateRows: '392px 392px' }}>
          
          {/* COLUMN 1: FYI (top) + PENDING (bottom) */}
          
          {/* PANEL 1: FYI - Column 1, Row 1 */}
          <div 
            className="bg-white rounded-lg relative overflow-hidden transition-all hover:shadow-md" 
            style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.06)', gridColumn: '1', gridRow: '1' }}
          >
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#8B5CF6]" style={{ opacity: 0.8 }}></div>
            
            <div className="px-4 py-2.5 border-b border-[#E5E7EB] flex items-center justify-between" style={{ height: '44px' }}>
              <h3 className="text-base text-[#1F2937]">FYI (4)</h3>
              <div className="flex items-center gap-2">
                <button className="text-[11px] text-[#6B7280] hover:text-[#EF4444] transition-colors">
                  Clear all
                </button>
                <button className="w-[18px] h-[18px] text-[#9CA3AF] hover:text-[#111827] transition-colors">
                  <SettingsIcon className="w-full h-full" />
                </button>
              </div>
            </div>

            <div className="px-4 py-2 custom-scrollbar fade-indicator" style={{ height: '312px', overflowY: 'auto' }}>
              <div className="space-y-0.5">
                {[
                  { name: 'James Wilson', text: 'completed Budget Review', time: '2 hours ago', avatar: 'JW', color: '#10B981', dot: '#10B981', read: false },
                  { name: 'Lisa Anderson', text: 'mentioned you in Design Sprint', time: 'Earlier today', avatar: 'LA', color: '#F59E0B', dot: '#F59E0B', read: false },
                  { name: 'David Kim', text: 'updated Timeline for Q4 Launch', time: 'Yesterday', avatar: 'DK', color: '#3B82F6', dot: '#3B82F6', read: true },
                  { name: 'Emily Rodriguez', text: 'shared a file in Projects', time: '2 days ago', avatar: 'ER', color: '#8B5CF6', dot: '#8B5CF6', read: true },
                  { name: 'Alex Chen', text: 'commented on Design System', time: '3 days ago', avatar: 'AC', color: '#10B981', dot: '#10B981', read: true }
                ].map((item, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-center gap-2.5 p-2 rounded cursor-pointer transition-all hover:bg-[#EFF6FF] relative ${
                      item.read ? 'bg-[#F9FAFB]' : 'bg-white'
                    }`}
                    style={{ minHeight: '68px' }}
                    onMouseEnter={() => setHoveredFYI(idx)}
                    onMouseLeave={() => setHoveredFYI(null)}
                  >
                    <div 
                      className="w-1.5 h-1.5 rounded-full flex-shrink-0" 
                      style={{ backgroundColor: item.dot }}
                    ></div>
                    <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[11px] flex-shrink-0" style={{ backgroundColor: item.color }}>
                      {item.avatar}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-[13px] leading-tight truncate ${item.read ? 'text-[#6B7280]' : 'text-[#1F2937]'}`}>
                        <span className={item.read ? '' : 'font-semibold'}>{item.name}</span> {item.text}
                      </p>
                      <p className="text-[11px] text-[#9CA3AF] mt-0.5">{item.time}</p>
                    </div>
                    
                    {/* Custom Tooltip - Smart positioning */}
                    {hoveredFYI === idx && (
                      <div 
                        className={`absolute left-0 right-0 z-50 px-3 py-2 bg-[#1F2937] text-white text-sm rounded shadow-lg ${
                          idx >= 3 ? 'bottom-full mb-1' : 'top-full mt-1'
                        }`}
                        style={{ 
                          animation: 'fadeIn 0.15s ease-in',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
                        }}
                      >
                        <p className="leading-tight">
                          <span className="font-semibold">{item.name}</span> {item.text}
                        </p>
                        <p className="text-xs text-white/70 mt-1">{item.time}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="px-4 py-2 border-t border-[#E5E7EB] flex items-center" style={{ height: '36px' }}>
              <div className="flex items-center gap-1.5">
                <button className="text-[11px] text-[#3B82F6] hover:text-[#2563EB]">
                  View all →
                </button>
                <span className="text-[10px] text-white bg-[#6B7280] px-1.5 py-0.5 rounded-full">12 unread</span>
              </div>
            </div>
          </div>

          {/* PANEL 2: PENDING - Column 1, Row 2 */}
          <div 
            className="bg-white rounded-lg relative overflow-hidden transition-all hover:shadow-lg" 
            style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.08)', gridColumn: '1', gridRow: '2' }}
          >
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#EC4899]"></div>
            
            <div className="px-4 py-3 border-b border-[#E5E7EB] flex items-center" style={{ height: '48px' }}>
              <h3 className="text-base text-[#1F2937]">Pending Approvals</h3>
            </div>

            <div className="px-4 py-3 flex flex-col items-center justify-center" style={{ height: '308px' }}>
              <h4 className="text-xl text-[#1F2937] mb-1">All caught up!</h4>
              <p className="text-sm text-[#6B7280] mb-4 text-center">No approvals waiting for your review</p>
              
              <div className="w-full max-w-[280px] mb-3">
                <p className="text-xs text-[#9CA3AF] uppercase tracking-wide mb-2 text-center font-medium">YOUR PERFORMANCE</p>
                <div className="text-center mb-2">
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-3xl text-[#3B82F6]">2.3</span>
                    <span className="text-sm text-[#6B7280]">hours</span>
                  </div>
                  <p className="text-xs text-[#6B7280]">avg response time</p>
                </div>
                <div className="flex items-center justify-center gap-1 text-sm text-[#10B981] mb-3">
                  <TrendingDown className="w-4 h-4" />
                  <span>15% faster than last week</span>
                </div>
                
                {/* Mini sparkline */}
                <div className="flex items-end justify-center gap-1 h-8 mb-3">
                  {[60, 70, 55, 80, 65, 75, 50].map((height, idx) => (
                    <div 
                      key={idx} 
                      className="w-2 bg-[#3B82F6] rounded-t"
                      style={{ height: `${height}%` }}
                    ></div>
                  ))}
                </div>
              </div>
              
              <p className="text-sm text-[#9CA3AF] mb-3">This week: 8 approved • €45,230 processed</p>
              
              <button className="text-sm text-[#3B82F6] hover:text-[#2563EB]">
                View approval history →
              </button>
            </div>
            
            <div className="px-4 py-2 border-t border-[#E5E7EB] flex items-center" style={{ height: '36px' }}>
              <button className="text-xs text-[#6B7280] hover:text-[#111827]">
                Settings
              </button>
            </div>
          </div>

          {/* COLUMN 2: TEAM (top) + RED ZONE (bottom) */}
          
          {/* PANEL 3: TEAM - Column 2, Row 1 */}
          <div 
            className="bg-white rounded-lg relative overflow-hidden transition-all hover:shadow-md" 
            style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.06)', gridColumn: '2', gridRow: '1' }}
          >
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#14B8A6]" style={{ opacity: 0.8 }}></div>
            
            <div className="px-4 py-2.5 border-b border-[#E5E7EB] flex items-center justify-between" style={{ height: '44px' }}>
              <h3 className="text-base text-[#1F2937]\">Who's where (6)</h3>
              <button className="h-7 px-2 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-[11px] rounded transition-all">
                New request +
              </button>
            </div>

            <div className="px-4 py-2 custom-scrollbar" style={{ height: '312px', overflowY: 'auto' }}>
              <select className="w-full h-7 px-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded text-[11px] text-[#6B7280] mb-2">
                <option>Select department...</option>
              </select>

              <div className="space-y-1">
                {[
                  { name: 'Marina Pellegrino', context: 'In office • SALES • 18/11/25', status: 'WOR', statusColor: '#3B82F6', avatar: 'MP', statusDot: '#10B981' },
                  { name: 'Tom Brady', context: 'Remote • Client presentation • 18/11/25', status: 'WOR', statusColor: '#3B82F6', avatar: 'TB', statusDot: '#10B981' },
                  { name: 'Anna Smith', context: 'In office • Engineering • 19/11/25', status: 'DOC', statusColor: '#EF4444', avatar: 'AS', statusDot: '#F59E0B' },
                  { name: 'David Chen', context: 'Remote • Design review • 19/11/25', status: 'WOR', statusColor: '#3B82F6', avatar: 'DC', statusDot: '#10B981' },
                  { name: 'Sarah Lee', context: 'In office • Marketing • 20/11/25', status: 'PAT', statusColor: '#10B981', avatar: 'SL', statusDot: '#9CA3AF' },
                  { name: 'Mike Johnson', context: 'Remote • Sales call • 20/11/25', status: 'WOR', statusColor: '#3B82F6', avatar: 'MJ', statusDot: '#10B981' }
                ].map((person, idx) => (
                  <div key={idx} className="flex items-center gap-2 py-1 hover:bg-[#F9FAFB] rounded px-1.5 -mx-1.5 cursor-pointer" style={{ minHeight: '44px' }}>
                    <div className="relative">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-[10px]">
                        {person.avatar}
                      </div>
                      <div 
                        className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border-2 border-white"
                        style={{ backgroundColor: person.statusDot }}
                      ></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] text-[#1F2937] leading-tight font-semibold">{person.name}</p>
                      <p className="text-[11px] text-[#6B7280] truncate leading-tight">{person.context}</p>
                    </div>
                    <div 
                      className="px-2 py-0.5 rounded text-white text-[11px] font-medium flex-shrink-0"
                      style={{ backgroundColor: person.statusColor, minWidth: '42px', textAlign: 'center', height: '18px', lineHeight: '18px' }}
                    >
                      {person.status}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-4 py-1.5 border-t border-[#E5E7EB] flex items-center" style={{ height: '36px' }}>
              <p className="text-[10px] text-[#6B7280]">
                💻 Working | 🏢 On-site | ⏱ Part-time
              </p>
            </div>
          </div>

          {/* PANEL 4: RED ZONE - Column 2, Row 2 */}
          <div 
            className="bg-white rounded-lg relative overflow-hidden transition-all hover:shadow-lg" 
            style={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)', gridColumn: '2', gridRow: '2' }}
          >
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#EF4444]"></div>
            
            <div className="px-5 py-3 border-b border-[#E5E7EB] flex items-center justify-between" style={{ height: '52px' }}>
              <div className="flex items-center gap-2">
                <h3 className="text-lg text-[#EF4444]">Red Zone</h3>
                <span className="w-7 h-7 rounded-full bg-[#EF4444] text-white text-sm flex items-center justify-center">6</span>
              </div>
              <button className="w-5 h-5 text-[#9CA3AF] hover:text-[#111827] transition-colors">
                <SettingsIcon className="w-full h-full" />
              </button>
            </div>

            <div className="px-5 py-3 custom-scrollbar" style={{ height: '328px', overflowY: 'auto' }}>
              <div className="space-y-2">
                {[
                  { name: 'SUSALGAEFUEL', count: 12, details: 'Budget exceeded: €12,039 • 8 overdue milestones • 4 late tasks', bg: '#FEF2F2' },
                  { name: 'MOBILE APP REDESIGN', count: 8, details: 'Timeline delayed: 6 weeks • 5 tasks blocked • 3 resources needed', bg: '#FEF2F2' },
                  { name: 'Q4 MARKETING CAMPAIGN', count: 6, details: 'Budget warning: €8,420 over • 3 pending approvals', bg: '#FEF2F2' },
                  { name: 'WEBSITE REFRESH', count: 5, details: '4 overdue tasks • 1 critical blocker • Design review pending', bg: '#FFF7ED' },
                  { name: 'CLIENT PORTAL V2', count: 3, details: '2 overdue milestones • 1 quality issue', bg: '#FFF7ED' },
                  { name: 'DATA MIGRATION', count: 2, details: '1 overdue task • 1 resource constraint', bg: '#FFF7ED' }
                ].map((project, idx) => (
                  <div 
                    key={idx}
                    className="relative p-3 rounded cursor-pointer transition-all hover:shadow-md group border-l-2 border-transparent hover:border-[#3B82F6]"
                    style={{ backgroundColor: project.bg, minHeight: '56px' }}
                    onMouseEnter={() => setHoveredProject(idx)}
                    onMouseLeave={() => setHoveredProject(null)}
                  >
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1" style={{ maxWidth: 'calc(100% - 90px)' }}>
                        <p className="text-[15px] text-[#1F2937] leading-tight mb-1.5 font-semibold tracking-tight">{project.name}</p>
                        <p className="text-xs text-[#6B7280] leading-tight line-clamp-2">{project.details}</p>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <div 
                          className={`w-[72px] h-[72px] rounded-full flex items-center justify-center ${
                            project.count >= 11 ? 'alert-pulse' : ''
                          }`}
                          style={{ 
                            backgroundColor: project.count >= 6 ? '#EF4444' : '#F59E0B',
                            boxShadow: project.count >= 6 
                              ? '0 4px 12px rgba(239, 68, 68, 0.25)' 
                              : '0 4px 12px rgba(245, 158, 11, 0.25)'
                          }}
                        >
                          <span className="text-[40px] text-white leading-none" style={{ fontWeight: 700 }}>{project.count}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="px-5 py-2 border-t border-[#E5E7EB]" style={{ height: '12px' }}>
              <button className="text-xs text-[#6B7280] hover:text-[#111827]">
                View 3 more projects →
              </button>
            </div>
          </div>

          {/* COLUMN 3: TO-DO (full) */}
          
          {/* PANEL 5: TO-DO - Column 3, Row 1-2 (DOUBLE-HEIGHT) */}
          <div 
            className="bg-white rounded-lg relative overflow-hidden transition-all hover:shadow-md" 
            style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.06)', gridColumn: '3', gridRow: '1 / span 2' }}
          >
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#06B6D4]" style={{ opacity: 0.8 }}></div>
            
            <div className="px-4 py-2.5 border-b border-[#E5E7EB] flex items-center justify-between" style={{ height: '44px' }}>
              <div className="flex items-center gap-2">
                <h3 className="text-base text-[#1F2937]\">To do (12)</h3>
                <div className="flex items-center">
                  <button
                    onClick={() => setActiveToDoTab('Personal')}
                    className={`px-2 py-0.5 text-[10px] transition-colors ${
                      activeToDoTab === 'Personal' ? 'text-[#3B82F6] font-semibold' : 'text-[#9CA3AF]'
                    }`}
                  >
                    Personal
                  </button>
                  <span className="text-[#E5E7EB]">|</span>
                  <button
                    onClick={() => setActiveToDoTab('Checklists')}
                    className={`px-2 py-0.5 text-[10px] transition-colors ${
                      activeToDoTab === 'Checklists' ? 'text-[#3B82F6] font-semibold' : 'text-[#9CA3AF]'
                    }`}
                  >
                    Checklists
                  </button>
                </div>
              </div>
              <button className="w-[18px] h-[18px] text-[#9CA3AF] hover:text-[#111827] transition-colors">
                <SettingsIcon className="w-full h-full" />
              </button>
            </div>

            <div className="px-4 py-1.5 border-b border-[#E5E7EB] flex items-center gap-2" style={{ height: '32px' }}>
              <select className="h-7 px-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded text-[10px] text-[#6B7280]" style={{ width: '120px' }}>
                <option>All Tasks</option>
                <option>Overdue</option>
                <option>Today</option>
              </select>
              <select className="h-7 px-2 bg-[#F9FAFB] border border-[#E5E7EB] rounded text-[10px] text-[#6B7280] ml-auto" style={{ width: '100px' }}>
                <option>Due Date</option>
                <option>Priority</option>
              </select>
            </div>

            <div className="px-4 py-2 custom-scrollbar" style={{ height: '676px', overflowY: 'auto' }}>
              <div className="space-y-2">
                {[
                  { task: 'URL from backend team', date: '30/09/2024', project: 'WORKDECK SALES', status: 'overdue', overdueCount: 50, time: '2h' },
                  { task: 'Review Q4 budget proposal', date: '01/10/2024', project: 'FINANCE', status: 'overdue', overdueCount: 49, time: '3h' },
                  { task: 'Update client presentation deck', date: '05/10/2024', project: 'SALES', status: 'overdue', overdueCount: 45, time: '1h' },
                  { task: 'Fix login authentication bug', date: '10/10/2024', project: 'ENGINEERING', status: 'overdue', overdueCount: 40, time: '4h' },
                  { task: 'Review marketing campaign assets', date: '15/11/2024', project: 'MARKETING', status: 'today', time: '2h' },
                  { task: 'Prepare sprint planning notes', date: '16/11/2024', project: 'PRODUCT', status: 'today', time: '1h' },
                  { task: 'Interview candidate for designer role', date: '17/11/2024', project: 'HR', status: 'today', time: '1h' },
                  { task: 'Analyze Q3 sales metrics', date: '20/11/2024', project: 'ANALYTICS', status: 'thisWeek', time: '3h' },
                  { task: 'Draft partnership proposal', date: '22/11/2024', project: 'BUSINESS DEV', status: 'thisWeek', time: '2h' },
                  { task: 'Code review for mobile app', date: '25/11/2024', project: 'ENGINEERING', status: 'later', time: '2h' },
                  { task: 'Update documentation', date: '28/11/2024', project: 'ENGINEERING', status: 'later', time: '1h' },
                  { task: 'Plan team offsite', date: '30/11/2024', project: 'OPERATIONS', status: 'later', time: '2h' }
                ].map((item, idx) => {
                  const getBorderColor = () => {
                    if (item.status === 'overdue') return '#EF4444';
                    if (item.status === 'today') return '#F59E0B';
                    if (item.status === 'thisWeek') return '#3B82F6';
                    return '#D1D5DB';
                  };
                  
                  return (
                    <div 
                      key={idx}
                      className="flex items-start gap-2 p-2 rounded hover:bg-[#EFF6FF] cursor-pointer transition-colors"
                      style={{ minHeight: '68px' }}
                    >
                      <input 
                        type="checkbox" 
                        className="w-5 h-5 mt-0.5 rounded border-2 text-[#3B82F6] cursor-pointer flex-shrink-0"
                        style={{ borderColor: getBorderColor() }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start gap-2 mb-1">
                          <p className="text-sm text-[#1F2937] font-semibold leading-tight line-clamp-2 flex-1">{item.task}</p>
                          {item.status === 'overdue' && (
                            <span className="text-[10px] text-white bg-[#EF4444] px-2 py-1 rounded-full flex-shrink-0 whitespace-nowrap" style={{ height: '20px', lineHeight: '10px' }}>
                              ⚠️ OVERDUE
                            </span>
                          )}
                          {item.status === 'today' && (
                            <span className="text-[10px] text-white bg-[#F59E0B] px-2 py-1 rounded-full flex-shrink-0 whitespace-nowrap" style={{ height: '20px', lineHeight: '10px' }}>
                              🔥 TODAY
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#6B7280] leading-tight">{item.project} • {item.date}</p>
                      </div>
                      <span className="text-[10px] text-[#6B7280] bg-[#F3F4F6] px-1.5 py-0.5 rounded flex-shrink-0" style={{ height: '20px' }}>
                        {item.time}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="px-4 py-2 border-t border-[#E5E7EB] flex items-center justify-end" style={{ height: '36px' }}>
              <button className="text-[11px] text-[#3B82F6] hover:text-[#2563EB]">Add new task +</button>
            </div>
          </div>

          {/* COLUMN 4: AGENDA (full) */}
          
          {/* PANEL 6: AGENDA - Column 4, Row 1-2 (DOUBLE-HEIGHT) */}
          <div 
            className="bg-white rounded-lg relative overflow-hidden transition-all hover:shadow-md" 
            style={{ boxShadow: '0 1px 2px rgba(0,0,0,0.06)', gridColumn: '4', gridRow: '1 / span 2' }}
          >
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#3B82F6]" style={{ opacity: 0.8 }}></div>
            
            <div className="px-4 py-2.5 border-b border-[#E5E7EB] flex items-center justify-between" style={{ height: '44px' }}>
              <h3 className="text-base text-[#1F2937]">Agenda</h3>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1">
                  <button className="w-5 h-5 flex items-center justify-center rounded hover:bg-[#F9FAFB]">
                    <ChevronLeft className="w-4 h-4 text-[#6B7280]" />
                  </button>
                  <h4 className="text-sm text-[#1F2937]">Tue November 18</h4>
                  <button className="w-5 h-5 flex items-center justify-center rounded hover:bg-[#F9FAFB]">
                    <ChevronRight className="w-4 h-4 text-[#6B7280]" />
                  </button>
                </div>
                <span className="text-[10px] px-2 py-1 bg-[#DBEAFE] text-[#3B82F6] rounded font-medium">Today</span>
              </div>
            </div>

            <div className="px-4 py-3 custom-scrollbar" style={{ height: '712px', overflowY: 'auto' }}>
              <div className="space-y-3">
                {/* Event 1 - Now */}
                <div className="flex items-start gap-3">
                  <div className="w-20 flex-shrink-0 pt-1">
                    <p className="text-xs text-[#6B7280]">Now</p>
                  </div>
                  <div 
                    className="flex-1 px-4 py-3 rounded"
                    style={{ backgroundColor: '#8B5CF6' }}
                  >
                    <p className="text-sm text-white leading-tight mb-1">Team Standup</p>
                    <p className="text-xs text-white/80 leading-tight">Engineering • Video call</p>
                  </div>
                </div>

                {/* Event 2 */}
                <div className="flex items-start gap-3">
                  <div className="w-20 flex-shrink-0 pt-1">
                    <p className="text-xs text-[#6B7280]">14:00-15:00</p>
                  </div>
                  <div 
                    className="flex-1 px-4 py-3 rounded"
                    style={{ backgroundColor: '#10B981' }}
                  >
                    <p className="text-sm text-white leading-tight mb-1">Client Meeting</p>
                    <p className="text-xs text-white/80 leading-tight">Acme Corp • In person</p>
                  </div>
                </div>

                {/* Free time */}
                <div className="flex items-start gap-3">
                  <div className="w-20 flex-shrink-0 pt-1">
                    <p className="text-xs text-[#6B7280]">15:00-17:00</p>
                  </div>
                  <div className="flex-1 py-1">
                    <p className="text-sm text-[#3B82F6] leading-tight mb-1">2h free</p>
                    <button className="text-xs text-[#3B82F6] hover:text-[#2563EB]">Schedule focus time +</button>
                  </div>
                </div>

                {/* Event 3 */}
                <div className="flex items-start gap-3">
                  <div className="w-20 flex-shrink-0 pt-1">
                    <p className="text-xs text-[#6B7280]">17:00-18:00</p>
                  </div>
                  <div 
                    className="flex-1 px-4 py-3 rounded"
                    style={{ backgroundColor: '#F59E0B' }}
                  >
                    <p className="text-sm text-white leading-tight mb-1">Product Review</p>
                    <p className="text-xs text-white/80 leading-tight">Product Team • Conference room</p>
                  </div>
                </div>

                {/* Free time */}
                <div className="flex items-start gap-3">
                  <div className="w-20 flex-shrink-0 pt-1">
                    <p className="text-xs text-[#6B7280]">18:00-19:00</p>
                  </div>
                  <div className="flex-1 py-1">
                    <p className="text-sm text-[#3B82F6] leading-tight mb-1">1h free</p>
                    <button className="text-xs text-[#3B82F6] hover:text-[#2563EB]">Schedule focus time +</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-4 py-2 border-t border-[#E5E7EB] flex items-center justify-end" style={{ height: '36px' }}>
              <button className="text-xs text-[#3B82F6] hover:text-[#2563EB]">
                View full calendar →
              </button>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

export default App;
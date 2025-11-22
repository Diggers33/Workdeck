import { useState } from 'react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import {
  LayoutDashboard,
  Layers,
  Users,
  Flag,
  Euro,
  FileText,
  StickyNote,
  Settings,
  Edit2,
  MoreVertical,
} from 'lucide-react';
import { OverviewSection } from './workspace/OverviewSection';
import { ActivitiesSection } from './workspace/ActivitiesSection';
import { TeamSection } from './workspace/TeamSection';
import { MilestonesSection } from './workspace/MilestonesSection';
import { BudgetSection } from './workspace/BudgetSection';
import { FilesSection } from './workspace/FilesSection';
import { NotesSection } from './workspace/NotesSection';
import { SettingsSection } from './workspace/SettingsSection';
import workdeckLogo from 'figma:asset/6f22f481b9cda400eddbba38bd4678cd9b214998.png';

type Section =
  | 'overview'
  | 'activities'
  | 'team'
  | 'milestones'
  | 'budget'
  | 'files'
  | 'notes'
  | 'settings';

const NAVIGATION_ITEMS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'team', label: 'Team & Roles', icon: Users },
  { id: 'activities', label: 'Activities & Tasks', icon: Layers },
  { id: 'milestones', label: 'Milestones', icon: Flag },
  { id: 'budget', label: 'Budget & Expenditures', icon: Euro },
  { id: 'files', label: 'Files', icon: FileText },
  { id: 'notes', label: 'Notes', icon: StickyNote },
  { id: 'settings', label: 'Settings', icon: Settings },
] as const;

export function ProjectWorkspace() {
  const [activeSection, setActiveSection] = useState<Section>('overview');
  const [projectName, setProjectName] = useState('Digital Transformation Initiative');
  const [isEditingName, setIsEditingName] = useState(false);

  const renderSection = () => {
    switch (activeSection) {
      case 'overview':
        return <OverviewSection onNavigate={setActiveSection} />;
      case 'activities':
        return <ActivitiesSection />;
      case 'team':
        return <TeamSection />;
      case 'milestones':
        return <MilestonesSection />;
      case 'budget':
        return <BudgetSection />;
      case 'files':
        return <FilesSection />;
      case 'notes':
        return <NotesSection />;
      case 'settings':
        return <SettingsSection />;
      default:
        return <OverviewSection onNavigate={setActiveSection} />;
    }
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Left Sidebar - Navigation */}
      <div className="w-[280px] bg-[#FAFAFA] border-r border-[#E5E7EB] flex-shrink-0">
        {/* Logo */}
        <div className="px-4 py-6">
          <img src={workdeckLogo} alt="Workdeck" className="h-8" />
        </div>

        {/* Navigation */}
        <nav className="px-4 py-6 space-y-1">
          {NAVIGATION_ITEMS.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            const showSeparator = index === 5; // After Files

            return (
              <div key={item.id}>
                {showSeparator && <div className="h-px bg-[#E5E7EB] my-2"></div>}
                <button
                  onClick={() => setActiveSection(item.id as Section)}
                  className={`w-full flex items-center gap-3 px-3 h-10 rounded-lg text-sm font-medium transition-all relative ${
                    isActive
                      ? 'bg-[#EEF2FF] text-[#2563EB]'
                      : 'text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#111827]'
                  }`}
                >
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 bg-[#2563EB] rounded-r"></div>
                  )}
                  <Icon className="w-[18px] h-[18px] stroke-[2]" />
                  {item.label}
                </button>
              </div>
            );
          })}
        </nav>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header Bar - 2-Row Layout */}
        <div className="h-[96px] bg-white border-b border-[#E5E7EB] px-10 py-5 flex flex-col justify-center">
          {/* Row 1: Project Name + Actions */}
          <div className="flex items-center justify-between h-10">
            {/* Project Name */}
            <div className="flex items-center gap-3 group">
              {isEditingName ? (
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  onBlur={() => setIsEditingName(false)}
                  onKeyDown={(e) => e.key === 'Enter' && setIsEditingName(false)}
                  autoFocus
                  className="text-[24px] font-semibold text-[#111827] border-b-2 border-[#2563EB] outline-none bg-transparent px-1"
                />
              ) : (
                <h1
                  onClick={() => setIsEditingName(true)}
                  className="text-[24px] font-semibold text-[#111827] cursor-pointer hover:text-[#2563EB] transition-colors"
                >
                  {projectName}
                </h1>
              )}
              <button
                onClick={() => setIsEditingName(true)}
                className="text-[#6B7280] hover:text-[#111827] transition-all opacity-0 group-hover:opacity-100"
              >
                <Edit2 className="w-4 h-4" />
              </button>
            </div>

            {/* Actions Menu */}
            <button className="w-9 h-9 border border-[#E5E7EB] rounded-md flex items-center justify-center hover:bg-[#F9FAFB] transition-colors">
              <MoreVertical className="w-5 h-5 text-[#6B7280]" />
            </button>
          </div>

          {/* Row 2: Metadata + Stats */}
          <div className="flex items-center justify-between h-9 mt-3">
            {/* Left: Metadata */}
            <div className="flex items-center gap-5">
              {/* Client */}
              <div className="flex items-center gap-2">
                <span className="text-[12px]">👤</span>
                <span className="text-[14px] font-medium text-[#111827]">Acme Corporation</span>
              </div>

              <span className="text-[14px] text-[#D1D5DB]">•</span>

              {/* Project Code */}
              <div className="flex items-center gap-2">
                <span className="text-[12px]">🔖</span>
                <span className="text-[14px] font-medium text-[#6B7280]">PROJ-2024-001</span>
              </div>

              <span className="text-[14px] text-[#D1D5DB]">•</span>

              {/* Status Badge */}
              <div className="flex items-center gap-2 bg-[#D1FAE5] rounded-md px-3 py-1.5">
                <div className="w-2 h-2 rounded-full bg-[#065F46]"></div>
                <span className="text-[13px] font-medium text-[#065F46]">Active</span>
              </div>
            </div>

            {/* Right: Stats */}
            <div className="flex items-center gap-4">
              {/* Scheduled */}
              <div 
                className="flex flex-col items-center justify-center" 
                style={{ width: '100px', padding: '8px 12px' }}
              >
                <p className="text-[10px] text-[#6B7280] uppercase tracking-wide mb-1">Scheduled</p>
                <p className="text-[20px] font-semibold text-[#111827]">240h</p>
              </div>

              {/* Allocated */}
              <div 
                className="flex flex-col items-center justify-center" 
                style={{ width: '100px', padding: '8px 12px' }}
              >
                <p className="text-[10px] text-[#6B7280] uppercase tracking-wide mb-1">Allocated</p>
                <p className="text-[20px] font-semibold text-[#111827]">180h</p>
              </div>

              {/* Budget */}
              <div 
                className="flex flex-col items-center justify-center" 
                style={{ width: '100px', padding: '8px 12px' }}
              >
                <p className="text-[10px] text-[#6B7280] uppercase tracking-wide mb-1">Budget</p>
                <p className="text-[20px] font-semibold text-[#111827]">€85,000</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Panel */}
        <div className="flex-1 overflow-y-auto bg-white">
          <div className="max-w-[1400px] mx-auto px-8 py-8">{renderSection()}</div>
        </div>
      </div>
    </div>
  );
}
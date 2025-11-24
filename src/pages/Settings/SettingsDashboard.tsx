import React, { useState } from 'react';
import { 
  Building2, MapPin, Briefcase, Users, Tag, GitBranch, 
  Shield, Workflow, Building, Receipt, CheckCircle2, Circle,
  Search, X
} from 'lucide-react';
import { GeneralSettings } from './GeneralSettings';
import { OfficesSettings } from './OfficesSettings';
import { StaffCategoriesSettings } from './StaffCategoriesSettings';
import { UsersSettings } from './UsersSettings';
import { TypesSettings } from './TypesSettings';
import { CostCentersSettings } from './CostCentersSettings';
import { PoliciesSettings } from './PoliciesSettings';
import { WorkflowsSettings } from './WorkflowsSettings';
import { ClientsSettings } from './ClientsSettings';
import { BillingSettings } from './BillingSettings';

interface SettingsDashboardProps {
  onClose?: () => void;
}

export function SettingsDashboard({ onClose }: SettingsDashboardProps) {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    {
      id: 'general',
      name: 'General Information',
      icon: Building2,
      description: 'Company identity and platform behavior',
      completed: true,
      component: GeneralSettings
    },
    {
      id: 'offices',
      name: 'Offices',
      icon: MapPin,
      description: 'Multi-location management with schedules',
      completed: true,
      component: OfficesSettings
    },
    {
      id: 'staff-categories',
      name: 'Staff Categories',
      icon: Briefcase,
      description: 'Job positions and pay rates',
      completed: false,
      component: StaffCategoriesSettings
    },
    {
      id: 'users',
      name: 'Users',
      icon: Users,
      description: 'Team member management and roles',
      completed: false,
      component: UsersSettings
    },
    {
      id: 'types',
      name: 'Types',
      icon: Tag,
      description: 'Classification systems and categories',
      completed: false,
      component: TypesSettings
    },
    {
      id: 'cost-centers',
      name: 'Cost Centers',
      icon: GitBranch,
      description: 'Hierarchical budget tracking',
      completed: false,
      component: CostCentersSettings
    },
    {
      id: 'policies',
      name: 'Policies',
      icon: Shield,
      description: 'Approval workflow rules',
      completed: false,
      component: PoliciesSettings
    },
    {
      id: 'workflows',
      name: 'Workflows',
      icon: Workflow,
      description: 'Kanban board templates',
      completed: false,
      component: WorkflowsSettings
    },
    {
      id: 'clients',
      name: 'Clients',
      icon: Building,
      description: 'Client database management',
      completed: false,
      component: ClientsSettings
    },
    {
      id: 'billing',
      name: 'Billing',
      icon: Receipt,
      description: 'Invoice configuration',
      completed: false,
      component: BillingSettings
    }
  ];

  const completedCount = categories.filter(c => c.completed).length;
  const completionPercentage = Math.round((completedCount / categories.length) * 100);

  const filteredCategories = categories.filter(cat =>
    cat.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (activeCategory) {
    const category = categories.find(c => c.id === activeCategory);
    if (category) {
      const Component = category.component;
      return <Component onBack={() => setActiveCategory(null)} />;
    }
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <div className="bg-white border-b border-[#E5E7EB]">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-[28px] font-medium text-[#1F2937] mb-1">Settings</h1>
              <p className="text-[14px] text-[#6B7280]">Configure your workspace and preferences</p>
            </div>
            {onClose && (
              <button
                onClick={onClose}
                className="p-2 hover:bg-[#F3F4F6] rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-[#6B7280]" />
              </button>
            )}
          </div>

          {/* Completion status */}
          <div className="bg-gradient-to-r from-[#F0F4FF] to-[#E0E9FF] rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[13px] font-medium text-[#1F2937]">Setup Progress</p>
              <span className="text-[13px] font-medium text-[#0066FF]">{completionPercentage}%</span>
            </div>
            <div className="h-2 bg-white rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#0066FF] rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
            <p className="text-[11px] text-[#6B7280] mt-2">
              {completedCount} of {categories.length} categories configured
            </p>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-7xl mx-auto px-8 py-8 pb-32">
        {/* Search */}
        <div className="mb-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search settings..."
              className="w-full pl-10 pr-4 py-2 border border-[#D1D5DB] rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:border-transparent"
            />
          </div>
        </div>

        {/* Categories grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((category) => {
            const Icon = category.icon;
            return (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className="bg-white rounded-lg p-5 text-left hover:shadow-md transition-all border border-[#E5E7EB] hover:border-[#0066FF] group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-lg bg-[#F0F4FF] flex items-center justify-center group-hover:bg-[#0066FF] transition-colors">
                    <Icon className="w-5 h-5 text-[#0066FF] group-hover:text-white transition-colors" />
                  </div>
                  {category.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-[#34D399]" />
                  ) : (
                    <Circle className="w-4 h-4 text-[#D1D5DB]" />
                  )}
                </div>
                <h3 className="text-[14px] font-medium text-[#1F2937] mb-1">{category.name}</h3>
                <p className="text-[12px] text-[#6B7280] line-clamp-2">{category.description}</p>
                {category.completed && (
                  <div className="mt-2 flex items-center gap-1 text-[11px] font-medium text-[#34D399]">
                    <CheckCircle2 className="w-3 h-3" />
                    Configured
                  </div>
                )}
              </button>
            );
          })}
        </div>

        {filteredCategories.length === 0 && (
          <div className="text-center py-12">
            <Search className="w-12 h-12 text-[#D1D5DB] mx-auto mb-3" />
            <p className="text-[14px] text-[#6B7280]">No settings match your search</p>
          </div>
        )}
      </div>
    </div>
  );
}
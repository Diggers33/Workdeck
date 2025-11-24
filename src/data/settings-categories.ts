import { 
  Building2, MapPin, Briefcase, Users, Tag, GitBranch, 
  Shield, Workflow, Building, Receipt
} from 'lucide-react';
import { GeneralSettings } from '../pages/Settings/GeneralSettings';
import { OfficesSettings } from '../pages/Settings/OfficesSettings';
import { StaffCategoriesSettings } from '../pages/Settings/StaffCategoriesSettings';
import { UsersSettings } from '../pages/Settings/UsersSettings';
import { TypesSettings } from '../pages/Settings/TypesSettings';
import { CostCentersSettings } from '../pages/Settings/CostCentersSettings';
import { PoliciesSettings } from '../pages/Settings/PoliciesSettings';
import { WorkflowsSettings } from '../pages/Settings/WorkflowsSettings';
import { ClientsSettings } from '../pages/Settings/ClientsSettings';
import { BillingSettings } from '../pages/Settings/BillingSettings';

export interface CategoryConfig {
  id: string;
  name: string;
  icon: any;
  description: string;
  completed: boolean;
  component: any;
  timeEstimate: string;
  priority: number;
  summary: string;
  details: string;
  action: string;
  isNextAction?: boolean;
}

export interface AdvancedCategoryConfig {
  id: string;
  name: string;
  icon: any;
  description: string;
  completed: boolean;
  component: any;
  trigger: string;
  defaultState: string;
}

export function getEssentialCategories(configuredData: any): CategoryConfig[] {
  return [
    {
      id: 'general',
      name: 'General Information',
      icon: Building2,
      description: 'Company identity and platform behavior',
      completed: true,
      component: GeneralSettings,
      timeEstimate: '2 mins',
      priority: 1,
      summary: configuredData.general.companyName,
      details: `${configuredData.general.location} · ${configuredData.general.language}`,
      action: 'Edit details'
    },
    {
      id: 'offices',
      name: 'Offices',
      icon: MapPin,
      description: 'Locations, timezones, and schedules',
      completed: true,
      component: OfficesSettings,
      timeEstimate: '3 mins',
      priority: 2,
      summary: `${configuredData.offices.count} office`,
      details: `${configuredData.offices.offices[0]?.name} · ${configuredData.offices.offices[0]?.timezone} timezone · ${configuredData.offices.offices[0]?.currency} currency`,
      action: configuredData.offices.count > 0 ? `Manage ${configuredData.offices.offices[0]?.name}` : 'Add office'
    },
    {
      id: 'users',
      name: 'Users',
      icon: Users,
      description: 'Invite your team',
      completed: false,
      component: UsersSettings,
      timeEstimate: '3 mins',
      priority: 3,
      summary: '0 team members',
      details: 'Add team members to start collaborating',
      action: 'Add your first user',
      isNextAction: true
    },
    {
      id: 'types',
      name: 'Types',
      icon: Tag,
      description: 'Cost, leave, project, and funding categories',
      completed: false,
      component: TypesSettings,
      timeEstimate: '2 mins',
      priority: 4,
      summary: 'Using system defaults',
      details: 'Customize categories for your workflow',
      action: 'Review & customize types'
    }
  ];
}

export const advancedCategories: AdvancedCategoryConfig[] = [
  {
    id: 'staff-categories',
    name: 'Staff Categories',
    icon: Briefcase,
    description: 'Job positions and pay rates',
    completed: false,
    component: StaffCategoriesSettings,
    trigger: 'Configure before adding users',
    defaultState: 'Standard roles applied'
  },
  {
    id: 'cost-centers',
    name: 'Cost Centers',
    icon: GitBranch,
    description: 'Budget tracking codes',
    completed: false,
    component: CostCentersSettings,
    trigger: 'Set up for expense tracking',
    defaultState: 'Optional feature'
  },
  {
    id: 'policies',
    name: 'Policies',
    icon: Shield,
    description: 'Approval workflows',
    completed: false,
    component: PoliciesSettings,
    trigger: 'Configure before first expense',
    defaultState: 'Auto-approval active'
  },
  {
    id: 'workflows',
    name: 'Workflows',
    icon: Workflow,
    description: 'Kanban board templates',
    completed: false,
    component: WorkflowsSettings,
    trigger: 'Customize project workflows',
    defaultState: 'Default workflow active'
  },
  {
    id: 'clients',
    name: 'Clients',
    icon: Building,
    description: 'Client database',
    completed: false,
    component: ClientsSettings,
    trigger: 'Add when creating client projects',
    defaultState: 'Optional'
  },
  {
    id: 'billing',
    name: 'Billing',
    icon: Receipt,
    description: 'Invoice settings',
    completed: false,
    component: BillingSettings,
    trigger: 'Required before first invoice',
    defaultState: 'Configure when needed'
  }
];

export function getConfiguredData() {
  return {
    general: {
      logo: null,
      companyName: 'IRIS Technology Solutions',
      location: 'Barcelona',
      language: 'English'
    },
    offices: {
      count: 1,
      offices: [{ name: 'Barcelona', timezone: 'CET', currency: 'EUR' }]
    },
    users: {
      count: 0,
      users: []
    }
  };
}

/**
 * Projects API Service
 * Based on Workdeck API Complete Reference Guide
 */

import { apiGet, apiPost, formatDate, parseDate } from './apiClient';

// ==================== Types ====================

export interface ProjectEntity {
  id: string;
  name: string;
  code: string;
  startDate: string; // DD/MM/YYYY
  endDate: string;
  billable: boolean;
  timesheet: boolean;
  colorAllTasks?: string;

  client: {
    id: string;
    name: string;
  };

  projectType: {
    id: string;
    name: string;
    color: string;
  };

  financialType: {
    id: string;
    name: string;
  };

  company: {
    id: string;
    name: string;
  };

  creator: {
    id: string;
    fullName: string;
  };

  members: ProjectMember[];
  activities: ActivityEntity[];
  milestones: MilestoneEntity[];
  budgets: BudgetEntity[];
  alerts: ProjectAlertEntity[];

  allocatedHours: string;
}

export interface ActivityEntity {
  id: string;
  name: string;
  position: number;
  parentId?: string;
  startDate: string; // DD/MM/YYYY
  endDate: string;
  availableHours: string;
  plannedHours: number;
  tasks: TaskEntity[];
  participants: ActivityParticipant[];
}

export interface ProjectMember {
  user: {
    id: string;
    fullName: string;
  };
  isProjectManager: boolean;
}

export interface ActivityParticipant {
  user: {
    id: string;
    fullName: string;
  };
  plannedHours?: string;
}

export interface TaskEntity {
  id: string;
  name: string;
  summary: string;
  description: string;
  activity: {
    id: string;
    name: string;
    project: {
      id: string;
      name: string;
    };
  };
  startDate: string;
  endDate: string;
  importance: number;
  color: string;
  billable: boolean;
  timesheet: boolean;
  position: number;
  plannedHours: string;
  spentHours: string;
}

export interface MilestoneEntity {
  id: string;
  name: string;
  description: string;
  deliveryDate: string;
  alertDays: number;
  color: string;
  project: {
    id: string;
    name: string;
  };
}

export interface BudgetEntity {
  budget: string; // ID
  costType: {
    id: string;
    name: string;
  };
  description: string;
  amount: string;
  activity?: { id: string; name: string };
  task?: { id: string; name: string };
}

export interface ProjectAlertEntity {
  id: string;
  type: string;
  message: string;
}

// ==================== API Functions ====================

/**
 * Get all projects summary
 * GET /queries/projects-summary
 */
export async function getProjects(): Promise<ProjectEntity[]> {
  return apiGet<ProjectEntity[]>('/queries/projects-summary');
}

/**
 * Update project
 * POST /commands/mocks/update-project
 */
export async function updateProject(
  id: string,
  updates: {
    name?: string;
    code?: string;
    startDate?: string; // DD/MM/YYYY
    endDate?: string;
    billable?: boolean;
    timesheet?: boolean;
    client?: { id: string };
    projectType?: { id: string };
    financialType?: { id: string };
  }
): Promise<void> {
  return apiPost('/commands/mocks/update-project', { id, ...updates });
}

/**
 * Cancel project
 * POST /commands/mocks/cancel
 */
export async function cancelProject(id: string): Promise<void> {
  return apiPost('/commands/mocks/cancel', { id });
}

/**
 * Add project member
 * POST /commands/mocks/add-project-member
 */
export async function addProjectMember(
  projectId: string,
  userId: string,
  isProjectManager: boolean
): Promise<void> {
  return apiPost('/commands/mocks/add-project-member', {
    projectId,
    user: { id: userId },
    isProjectManager,
  });
}

/**
 * Delete project member
 * POST /commands/mocks/delete-project-member
 */
export async function deleteProjectMember(projectId: string, userId: string): Promise<void> {
  return apiPost('/commands/mocks/delete-project-member', { projectId, userId });
}

/**
 * Create project activity
 * POST /commands/mocks/create-project-activity
 */
export async function createProjectActivity(
  projectId: string,
  activity: {
    name: string;
    parentId?: string;
    position: number;
    startDate: string; // DD/MM/YYYY
    endDate: string;
    availableHours?: string;
  }
): Promise<ActivityEntity> {
  return apiPost<ActivityEntity>('/commands/mocks/create-project-activity', {
    projectId,
    ...activity,
  });
}

/**
 * Update project activity
 * POST /commands/mocks/update-project-activity
 */
export async function updateProjectActivity(
  id: string,
  updates: {
    name?: string;
    startDate?: string;
    endDate?: string;
    availableHours?: string;
  }
): Promise<void> {
  return apiPost('/commands/mocks/update-project-activity', { id, ...updates });
}

/**
 * Delete project activity
 * POST /commands/mocks/delete-project-activity
 */
export async function deleteProjectActivity(id: string): Promise<void> {
  return apiPost('/commands/mocks/delete-project-activity', { id });
}

/**
 * Move project activity
 * POST /commands/mocks/move-activity
 */
export async function moveActivity(
  id: string,
  parentId: string | null,
  position: number
): Promise<void> {
  return apiPost('/commands/mocks/move-activity', {
    id,
    parentId: parentId || undefined,
    position,
  });
}

/**
 * Add activity participant
 * POST /commands/mocks/add-activity-participant
 */
export async function addActivityParticipant(
  activityId: string,
  userId: string,
  plannedHours?: string
): Promise<void> {
  return apiPost('/commands/mocks/add-activity-participant', {
    activityId,
    user: { id: userId },
    plannedHours,
  });
}

/**
 * Delete activity participant
 * POST /commands/mocks/delete-activity-participant
 */
export async function deleteActivityParticipant(activityId: string, userId: string): Promise<void> {
  return apiPost('/commands/mocks/delete-activity-participant', { activityId, userId });
}

/**
 * Get project activities
 * GET /queries/projects/{projectId}/activities
 */
export async function getProjectActivities(projectId: string): Promise<ActivityEntity[]> {
  return apiGet<ActivityEntity[]>(`/queries/projects/${projectId}/activities`);
}

/**
 * Get Gantt data for a project (includes activities with tasks nested)
 * GET /queries/gantt/{projectId}
 */
export async function getGanttData(
  projectId: string,
  options?: {
    start?: string; // ISO 8601 date string
    end?: string; // ISO 8601 date string
    resolution?: 'day' | 'week' | 'month';
  }
): Promise<{
  id: string;
  activities: ActivityEntity[];
  start: string;
  end: string;
  firstDate: string;
  lastDate: string;
}> {
  const params = new URLSearchParams();
  if (options?.start) params.append('start', options.start);
  if (options?.end) params.append('end', options.end);
  if (options?.resolution) params.append('resolution', options.resolution);
  
  const queryString = params.toString();
  return apiGet(`/queries/gantt/${projectId}${queryString ? `?${queryString}` : ''}`);
}


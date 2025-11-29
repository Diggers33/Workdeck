/**
 * Milestones API Service
 * Based on Workdeck API Complete Reference Guide
 */

import { apiGet, apiPost } from './apiClient';

// ==================== Types ====================

export interface MilestoneEntity {
  id: string;

  name: string;
  description: string;

  deliveryDate: string; // DD/MM/YYYY

  alertDays: number;
  alert: {
    value: number;
    text: string;
  };

  color: string;

  project: {
    id: string;
    name: string;
  };

  activity?: {
    id: string;
    name: string;
  };

  task?: {
    id: string;
    name: string;
  };

  notifications: any[];
}

// ==================== API Functions ====================

/**
 * Get milestones summary
 * GET /queries/milestones-summary
 */
export async function getMilestones(filters?: {
  isDraft?: boolean;
  projectId?: string;
}): Promise<MilestoneEntity[]> {
  let params = '';
  if (filters) {
    const queryParams: string[] = [];
    if (filters.isDraft !== undefined) queryParams.push(`isDraft=${filters.isDraft}`);
    if (filters.projectId) queryParams.push(`projectId=${filters.projectId}`);
    if (queryParams.length > 0) {
      params = '?' + queryParams.join('&');
    }
  }
  return apiGet<MilestoneEntity[]>(`/queries/milestones-summary${params}`);
}

/**
 * Get single milestone
 * GET /queries/milestones/{milestoneId}
 */
export async function getMilestone(milestoneId: string): Promise<MilestoneEntity> {
  return apiGet<MilestoneEntity>(`/queries/milestones/${milestoneId}`);
}

/**
 * Create project milestone
 * POST /commands/mocks/create-project-milestone
 */
export async function createProjectMilestone(milestone: {
  projectId: string;
  name: string;
  description?: string;
  deliveryDate: string; // DD/MM/YYYY
  alertDays?: number; // Default: 0
  color?: string; // Default: "#0069df"
  activity?: { id: string };
  task?: { id: string };
}): Promise<MilestoneEntity> {
  return apiPost<MilestoneEntity>('/commands/mocks/create-project-milestone', milestone);
}

/**
 * Update milestone
 * POST /commands/sync/update-milestone
 */
export async function updateMilestone(
  id: string,
  updates: {
    name?: string;
    description?: string;
    deliveryDate?: string;
    alertDays?: number;
    color?: string;
    activity?: { id: string };
    task?: { id: string };
  }
): Promise<void> {
  return apiPost('/commands/sync/update-milestone', { id, ...updates });
}

/**
 * Delete project milestone
 * POST /commands/mocks/delete-project-milestone
 */
export async function deleteProjectMilestone(id: string): Promise<void> {
  return apiPost('/commands/mocks/delete-project-milestone', { id });
}


/**
 * Timesheets API Service
 * Based on Workdeck API Complete Reference Guide
 */

import { apiGet, apiPost, formatDate } from './apiClient';

// ==================== Types ====================

export interface TimesheetEntity {
  id: string;

  user: {
    id: string;
    fullName: string;
  };

  date: string; // DD/MM/YYYY
  hours: string; // Decimal string

  task: {
    id: string;
    name: string;
    activity: {
      id: string;
      name: string;
      project: {
        id: string;
        name: string;
      };
    };
  };

  description: string;

  status: number; // 0=Pending, 1=Approved, 2=Denied

  billable: boolean;

  createdAt: string; // DateTime
  updatedAt: string;
}

// ==================== API Functions ====================

/**
 * Get my timesheets
 * GET /queries/me/timesheets
 */
export async function getMyTimesheets(
  startDate?: string, // DD/MM/YYYY
  endDate?: string
): Promise<TimesheetEntity[]> {
  let params = '';
  if (startDate || endDate) {
    const queryParams = [];
    if (startDate) queryParams.push(`startDate=${startDate}`);
    if (endDate) queryParams.push(`endDate=${endDate}`);
    params = '?' + queryParams.join('&');
  }
  return apiGet<TimesheetEntity[]>(`/queries/me/timesheets${params}`);
}

/**
 * Get all timesheets
 * GET /queries/timesheets
 */
export async function getTimesheets(
  startDate: string, // DD/MM/YYYY
  endDate: string,
  userId?: string,
  projectId?: string
): Promise<TimesheetEntity[]> {
  let params = `?startDate=${startDate}&endDate=${endDate}`;
  if (userId) params += `&userId=${userId}`;
  if (projectId) params += `&projectId=${projectId}`;
  return apiGet<TimesheetEntity[]>(`/queries/timesheets${params}`);
}

/**
 * Get team timesheets
 * GET /queries/me/team/timesheets
 */
export async function getTeamTimesheets(
  startDate: string, // DD/MM/YYYY
  endDate: string
): Promise<TimesheetEntity[]> {
  return apiGet<TimesheetEntity[]>(
    `/queries/me/team/timesheets?startDate=${startDate}&endDate=${endDate}`
  );
}

/**
 * Get timesheet activity stream
 * GET /queries/timesheet-stream
 */
export async function getTimesheetStream(timesheetId: string): Promise<any> {
  return apiGet(`/queries/timesheet-stream?timesheetId=${timesheetId}`);
}

/**
 * Create timesheet
 * POST /commands/sync/timesheets/create-timesheet
 */
export async function createTimesheet(timesheet: {
  date: string; // DD/MM/YYYY
  hours: string; // Decimal
  task: { id: string };
  description?: string;
  billable?: boolean;
}): Promise<TimesheetEntity> {
  return apiPost<TimesheetEntity>('/commands/sync/timesheets/create-timesheet', timesheet);
}

/**
 * Update timesheet
 * POST /commands/sync/timesheets/update-timesheet
 */
export async function updateTimesheet(
  id: string,
  updates: {
    hours?: string;
    description?: string;
    billable?: boolean;
  }
): Promise<void> {
  return apiPost('/commands/sync/timesheets/update-timesheet', { id, ...updates });
}

/**
 * Delete timesheet
 * POST /commands/sync/timesheets/delete-timesheet
 */
export async function deleteTimesheet(id: string): Promise<void> {
  return apiPost('/commands/sync/timesheets/delete-timesheet', { id });
}

/**
 * Get time entries
 * GET /queries/time-entries
 */
export async function getTimeEntries(
  startDate: string, // DD/MM/YYYY
  endDate: string,
  userId?: string,
  projectId?: string
): Promise<TimesheetEntity[]> {
  let params = `?startDate=${startDate}&endDate=${endDate}`;
  if (userId) params += `&userId=${userId}`;
  if (projectId) params += `&projectId=${projectId}`;
  return apiGet<TimesheetEntity[]>(`/queries/time-entries${params}`);
}


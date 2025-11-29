/**
 * Leave & Travel Management API Service
 * Based on Workdeck API Complete Reference Guide
 */

import { apiGet, apiPost } from './apiClient';

// ==================== Types ====================

export interface LeaveRequestEntity {
  id: string;

  user: {
    id: string;
    fullName: string;
  };

  leaveType: {
    id: string;
    name: string;
    daysPerYear: number;
    color: string;
  };

  startDate: string; // DD/MM/YYYY
  endDate: string;

  days: number;

  status: number; // 0=Pending, 1=Approved, 2=Denied

  comment: string;
  managerComment?: string;

  approver?: {
    id: string;
    fullName: string;
  };

  createdAt: string;
  updatedAt: string;
}

export interface LeaveType {
  id: string;
  name: string;
  daysPerYear: number;
  color: string;
}

// ==================== API Functions ====================

/**
 * Get my leave requests
 * GET /queries/me/leave-requests
 */
export async function getMyLeaveRequests(
  startDate?: string, // DD/MM/YYYY
  endDate?: string
): Promise<LeaveRequestEntity[]> {
  let params = '';
  if (startDate || endDate) {
    const queryParams: string[] = [];
    if (startDate) queryParams.push(`startDate=${startDate}`);
    if (endDate) queryParams.push(`endDate=${endDate}`);
    params = '?' + queryParams.join('&');
  }
  return apiGet<LeaveRequestEntity[]>(`/queries/me/leave-requests${params}`);
}

/**
 * Get team leave requests
 * GET /queries/me/team/leave-requests
 */
export async function getTeamLeaveRequests(
  startDate?: string,
  endDate?: string
): Promise<LeaveRequestEntity[]> {
  let params = '';
  if (startDate || endDate) {
    const queryParams: string[] = [];
    if (startDate) queryParams.push(`startDate=${startDate}`);
    if (endDate) queryParams.push(`endDate=${endDate}`);
    params = '?' + queryParams.join('&');
  }
  return apiGet<LeaveRequestEntity[]>(`/queries/me/team/leave-requests${params}`);
}

/**
 * Get all leave requests
 * GET /queries/leave-requests
 */
export async function getLeaveRequests(filters?: {
  startDate?: string;
  endDate?: string;
  userId?: string;
  status?: number;
}): Promise<LeaveRequestEntity[]> {
  let params = '';
  if (filters) {
    const queryParams: string[] = [];
    if (filters.startDate) queryParams.push(`startDate=${filters.startDate}`);
    if (filters.endDate) queryParams.push(`endDate=${filters.endDate}`);
    if (filters.userId) queryParams.push(`userId=${filters.userId}`);
    if (filters.status !== undefined) queryParams.push(`status=${filters.status}`);
    if (queryParams.length > 0) {
      params = '?' + queryParams.join('&');
    }
  }
  return apiGet<LeaveRequestEntity[]>(`/queries/leave-requests${params}`);
}

/**
 * Get pending approval leave requests
 * GET /queries/leave-requests/pending
 */
export async function getPendingLeaveRequests(): Promise<LeaveRequestEntity[]> {
  return apiGet<LeaveRequestEntity[]>('/queries/leave-requests/pending');
}

/**
 * Create leave request
 * POST /commands/sync/create-leave-request
 */
export async function createLeaveRequest(leave: {
  leaveType: { id: string };
  startDate: string; // DD/MM/YYYY
  endDate: string;
  comment?: string;
}): Promise<LeaveRequestEntity> {
  return apiPost<LeaveRequestEntity>('/commands/sync/create-leave-request', leave);
}

/**
 * Update leave request
 * POST /commands/sync/update-leave-request
 */
export async function updateLeaveRequest(
  id: string,
  updates: Partial<{
    leaveType: { id: string };
    startDate: string;
    endDate: string;
    comment: string;
  }>
): Promise<void> {
  return apiPost('/commands/sync/update-leave-request', { id, ...updates });
}

/**
 * Delete leave request
 * POST /commands/sync/delete-leave-request
 */
export async function deleteLeaveRequest(id: string): Promise<void> {
  return apiPost('/commands/sync/delete-leave-request', { id });
}

/**
 * Approve leave request
 * POST /commands/sync/approve-leave-request
 */
export async function approveLeaveRequest(id: string, comment?: string): Promise<void> {
  return apiPost('/commands/sync/approve-leave-request', { id, comment });
}

/**
 * Deny leave request
 * POST /commands/sync/deny-leave-request
 */
export async function denyLeaveRequest(id: string, comment: string): Promise<void> {
  return apiPost('/commands/sync/deny-leave-request', { id, comment });
}

/**
 * Get leave types
 * GET /queries/leave-types
 */
export async function getLeaveTypes(): Promise<LeaveType[]> {
  return apiGet<LeaveType[]>('/queries/leave-types');
}

/**
 * Get leave working days
 * GET /queries/leave-working-days
 */
export async function getLeaveWorkingDays(
  startDate: string, // DD/MM/YYYY
  endDate: string,
  userId?: string
): Promise<number> {
  let params = `?startDate=${startDate}&endDate=${endDate}`;
  if (userId) params += `&userId=${userId}`;
  const result = await apiGet<{ days: number }>(`/queries/leave-working-days${params}`);
  return result.days;
}

/**
 * Get who is where (team calendar)
 * GET /queries/who-is-where
 */
export async function getWhoIsWhere(
  startDate: string, // DD/MM/YYYY
  endDate: string
): Promise<any> {
  return apiGet(`/queries/who-is-where?startDate=${startDate}&endDate=${endDate}`);
}


/**
 * Users & Staff API Service
 * Based on Workdeck API Complete Reference Guide
 */

import { apiGet, apiPost, formatDate } from './apiClient';

// ==================== Types ====================

export interface UserEntity {
  id: string;
  fullName: string;
  email: string;
  phone?: string;

  office: {
    id: string;
    name: string;
  };

  department: {
    id: string;
    name: string;
  };

  manager?: {
    id: string;
    fullName: string;
  };

  staffCategory: {
    id: string;
    name: string;
  };

  alternate?: {
    id: string;
    fullName: string;
  };

  costPerHour: string;

  language: {
    id: string;
    name: string;
    code: string;
  };

  timeTable: WorkingCalendar;

  isManager: boolean;
  isGuest: boolean;

  companyId: string;

  timesheetsType: number; // 1=No timesheet, 2=Weekly, 3=Daily

  timer?: TaskTimer;

  deleted: boolean;

  lastLogin: string;
  lastWorkingWellnessDate: string;

  planTime: boolean;

  costHistory: UserCost[];
  skills: UserSkill[];
  managerOf: UserEntity[];
}

export interface WorkingCalendar {
  // Define based on your needs
  [key: string]: any;
}

export interface TaskTimer {
  taskId: string;
  startTime: string;
}

export interface UserCost {
  date: string;
  costPerHour: string;
}

export interface UserSkill {
  id: string;
  name: string;
  level: number;
}

export interface Department {
  id: string;
  name: string;
  manager?: {
    id: string;
    fullName: string;
  };
  members: UserSummaryEntity[];
}

export interface UserSummaryEntity {
  id: string;
  fullName: string;
  email: string;
}

export interface StaffCategory {
  id: string;
  name: string;
  costPerHour: string;
}

export interface Office {
  id: string;
  name: string;
  address: string;
  city: string;
  country: {
    id: string;
    name: string;
  };
}

export interface Skill {
  id: string;
  name: string;
}

export interface UserWorkingHours {
  userId: string;
  startDate: string; // DD/MM/YYYY
  endDate: string;
  hours: number;
  projectId?: string;
}

// ==================== API Functions ====================

/**
 * Get current user
 * GET /queries/me
 */
export async function getCurrentUser(): Promise<UserEntity> {
  return apiGet<UserEntity>('/queries/me');
}

/**
 * Get users summary
 * GET /queries/users-summary
 */
export async function getUsersSummary(): Promise<UserSummaryEntity[]> {
  return apiGet<UserSummaryEntity[]>('/queries/users-summary');
}

/**
 * Get all users
 * GET /queries/users
 */
export async function getUsers(includeDeleted?: boolean): Promise<UserEntity[]> {
  const params = includeDeleted !== undefined ? `?includeDeleted=${includeDeleted}` : '';
  return apiGet<UserEntity[]>(`/queries/users${params}`);
}

/**
 * Get single user
 * GET /queries/users/{userId}
 */
export async function getUser(userId: string): Promise<UserEntity> {
  return apiGet<UserEntity>(`/queries/users/${userId}`);
}

/**
 * Get users working hours
 * GET /queries/users/working-hours
 */
export async function getUsersWorkingHours(
  startDate: string, // DD/MM/YYYY
  endDate: string,
  userId?: string
): Promise<UserWorkingHours[]> {
  let params = `?startDate=${startDate}&endDate=${endDate}`;
  if (userId) {
    params += `&userId=${userId}`;
  }
  return apiGet<UserWorkingHours[]>(`/queries/users/working-hours${params}`);
}

/**
 * Get users working hours (POST version)
 * POST /queries/users/working-hours
 */
export async function getUsersWorkingHoursPost(
  userIds: string[],
  startDate: string, // DD/MM/YYYY
  endDate: string,
  projectId?: string
): Promise<UserWorkingHours[]> {
  return apiPost<UserWorkingHours[]>('/queries/users/working-hours', {
    users: userIds,
    startDate,
    endDate,
    projectId,
  });
}

/**
 * Get departments
 * GET /queries/departments
 */
export async function getDepartments(): Promise<Department[]> {
  return apiGet<Department[]>('/queries/departments');
}

/**
 * Get staff categories
 * GET /queries/staff-categories
 */
export async function getStaffCategories(): Promise<StaffCategory[]> {
  return apiGet<StaffCategory[]>('/queries/staff-categories');
}

/**
 * Get offices
 * GET /queries/offices
 */
export async function getOffices(): Promise<Office[]> {
  return apiGet<Office[]>('/queries/offices');
}

/**
 * Get skills
 * GET /queries/skills
 */
export async function getSkills(): Promise<Skill[]> {
  return apiGet<Skill[]>('/queries/skills');
}

/**
 * Update user widgets
 * POST /commands/sync/update-user-widgets
 */
export async function updateUserWidgets(
  widgets: { id: string; position: number; visible: boolean }[]
): Promise<void> {
  return apiPost('/commands/sync/update-user-widgets', { widgets });
}


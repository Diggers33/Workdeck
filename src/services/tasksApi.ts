/**
 * Tasks API Service
 * Based on Workdeck API Complete Reference Guide
 */

import { apiGet, apiPost, formatDate } from './apiClient';

// ==================== Types ====================

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

  column: {
    id: string;
    name: string;
    color: string;
    isSystem: boolean;
    systemCode?: number;
  };

  startDate: string; // DD/MM/YYYY
  endDate: string;

  importance: number; // 1=Low, 2=Medium, 3=High
  color: string;

  billable: boolean;
  timesheet: boolean;

  position: number;
  globalPosition: number;

  plannedHours: string;
  spentHours: string;
  availableHours: string;
  dedicatedHours: number;

  participants: TaskParticipant[];
  checklist: ChecklistItem[];
  files: FileEntity[];
  labels: LabelEntity[];

  predecessors: TaskDependency[];
  successors: TaskDependency[];

  numComments: number;
  numFlags: number;
  numAttachments: number;
  numChecklist: number;
  numChecklistDone: number;

  createdByManager: boolean;
}

export interface TaskParticipant {
  user: {
    id: string;
    fullName: string;
  };
  isOwner: boolean;
  plannedHours: string;
  spentHours: string;
  plannedSchedule?: {
    date: string;
    hours: string;
  }[];
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface LabelEntity {
  id: string;
  name: string;
  color: string;
}

export interface TaskDependency {
  id: string;
  type: 'finish-to-start' | 'start-to-start' | 'finish-to-finish';
  task: {
    id: string;
    name: string;
  };
}

export interface TaskStage {
  id: string;
  name: string;
  position: number;
  color: string;
  isSystem: boolean;
  systemCode?: number;
}

export interface FileEntity {
  id: string;
  filename: string;
  token: string;
  size: number;
  mimeType: string;
  url: string;
  creator: {
    id: string;
    fullName: string;
  };
  createdAt: string;
}

// ==================== API Functions ====================

/**
 * Get all tasks
 * GET /queries/tasks
 */
export async function getTasks(archived?: boolean): Promise<TaskEntity[]> {
  const params = archived !== undefined ? `?archived=${archived}` : '';
  return apiGet<TaskEntity[]>(`/queries/tasks${params}`);
}

/**
 * Get user tasks
 * GET /queries/tasks/user/{userId}
 */
export async function getUserTasks(userId: string): Promise<TaskEntity[]> {
  return apiGet<TaskEntity[]>(`/queries/tasks/user/${userId}`);
}

/**
 * Get single task
 * GET /queries/tasks/{taskId}
 */
export async function getTask(taskId: string): Promise<TaskEntity> {
  return apiGet<TaskEntity>(`/queries/tasks/${taskId}`);
}

/**
 * Get task stages (columns)
 * GET /queries/task-stages
 */
export async function getTaskStages(forUserId?: string): Promise<TaskStage[]> {
  const params = forUserId ? `?forUserId=${forUserId}` : '';
  return apiGet<TaskStage[]>(`/queries/task-stages${params}`);
}

/**
 * Create project task
 * POST /commands/mocks/create-project-task
 */
export async function createTask(task: {
  activity: { id: string };
  name: string;
  description?: string;
  startDate: string; // DD/MM/YYYY
  endDate: string;
  plannedHours?: string;
  importance?: number;
  color?: string;
  billable?: boolean;
  position?: number;
  participants?: {
    user: { id: string };
    isOwner: boolean;
    plannedHours: string;
    plannedSchedule?: {
      date: string;
      hours: string;
    }[];
  }[];
}): Promise<TaskEntity> {
  return apiPost<TaskEntity>('/commands/mocks/create-project-task', task);
}

/**
 * Update task
 * POST /commands/sync/update-task
 */
export async function updateTask(
  id: string,
  updates: Partial<{
    name: string;
    description: string;
    startDate: string;
    endDate: string;
    plannedHours: string;
    importance: number;
    color: string;
    billable: boolean;
    column: { id: string };
    position: number;
  }>
): Promise<void> {
  return apiPost('/commands/sync/update-task', { id, ...updates });
}

/**
 * Delete task
 * POST /commands/sync/delete-task
 */
export async function deleteTask(id: string): Promise<void> {
  return apiPost('/commands/sync/delete-task', { id });
}

/**
 * Move task (change stage/column)
 * POST /commands/mocks/move-task
 */
export async function moveTask(
  id: string,
  columnId: string,
  position: number
): Promise<void> {
  return apiPost('/commands/mocks/move-task', {
    id,
    column: { id: columnId },
    position,
  });
}

/**
 * Order user tasks
 * POST /commands/sync/order-user-tasks
 */
export async function orderUserTasks(
  userId: string,
  tasks: { id: string; globalPosition: number }[]
): Promise<void> {
  return apiPost('/commands/sync/order-user-tasks', {
    user: { id: userId },
    tasks,
  });
}

/**
 * Add task participant
 * POST /commands/mocks/add-task-participant
 */
export async function addTaskParticipant(
  taskId: string,
  userId: string,
  plannedHours?: string,
  plannedSchedule?: { date: string; hours: string }[]
): Promise<void> {
  return apiPost('/commands/mocks/add-task-participant', {
    id: taskId,
    user: { id: userId },
    plannedHours,
    plannedSchedule,
  });
}

/**
 * Update task participant
 * POST /commands/sync/update-task-participant
 */
export async function updateTaskParticipant(
  taskId: string,
  participant: {
    user: { id: string };
    plannedHours?: string;
    plannedSchedule?: { date: string; hours: string }[];
  }
): Promise<void> {
  return apiPost('/commands/sync/update-task-participant', {
    id: taskId,
    ...participant,
  });
}

/**
 * Delete task participant
 * POST /commands/sync/remove-task-participant
 */
export async function deleteTaskParticipant(taskId: string, userId: string): Promise<void> {
  return apiPost('/commands/sync/remove-task-participant', { taskId, userId });
}

/**
 * Update task checklist
 * POST /commands/sync/tasks/update-checklist
 */
export async function updateTaskChecklist(
  taskId: string,
  items: { id?: string; text: string; completed: boolean }[]
): Promise<void> {
  return apiPost('/commands/sync/tasks/update-checklist', { taskId, items });
}

/**
 * Create task dependency
 * POST /commands/mocks/create-task-dependency
 */
export async function createTaskDependency(
  predecessorId: string,
  successorId: string,
  type: 'finish-to-start' | 'start-to-start' | 'finish-to-finish'
): Promise<void> {
  return apiPost('/commands/mocks/create-task-dependency', {
    predecessorId,
    successorId,
    type,
  });
}

/**
 * Delete task dependency
 * POST /commands/mocks/delete-task-dependency
 */
export async function deleteTaskDependency(id: string): Promise<void> {
  return apiPost('/commands/mocks/delete-task-dependency', { id });
}


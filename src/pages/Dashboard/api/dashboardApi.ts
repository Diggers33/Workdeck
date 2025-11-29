/**
 * Dashboard API Service
 * Handles all dashboard-related API calls to Workdeck backend
 */

import { getAuthHeaders } from '../../../services/authService';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.workdeck.com';

// Response wrapper type
interface ApiResponse<T> {
  status: string;
  result: T;
}

// Widget configuration from user preferences
export interface Widget {
  id: string;
  type: number;
  size: string;
  position: number;
  enabled: boolean;
}

// Widget type constants (matching Angular DashboardWidgetsConstants)
export const WIDGET_TYPES = {
  FYI: 1,              // Notice Board / What's New
  PENDING: 2,          // Pending Tasks
  DAILY_STATUS: 3,     // Portfolio
  TASK_COUNT: 4,       // Task Counts
  WHOS_WHERE: 5,       // Who's Where (Leave)
  NEXT_TRIP: 6,        // Next Trip
  MILESTONES: 7,       // Milestones
  RED_ZONE: 8,         // Red Zone (Overdue)
  PURCHASES: 9,        // Purchases
  EXPENSES: 10,        // Expenses
  TRAVEL: 11,          // Travel
  TODO_LIST: 12,       // Personal Checklist
} as const;

// News/Notification item
export interface NewsItem {
  id: string;
  notificationId: string;
  type: string;
  message: string;
  createdAt: string;
  read: boolean;
}

// Pending item (approval request)
export interface PendingItem {
  id: string;
  type: 'leave' | 'expense' | 'purchase' | 'timesheet' | 'event';
  title: string;
  requestedBy: string;
  requestedAt: string;
  status: string;
}

// Portfolio/Daily Status
export interface PortfolioData {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  onTrack: number;
  atRisk: number;
  delayed: number;
}

// Task Count data
export interface TaskCountData {
  total: number;
  completed: number;
  inProgress: number;
  todo: number;
  overdue: number;
}

// Expense widget data
export interface ExpenseData {
  total: number;
  pending: number;
  approved: number;
  rejected: number;
  items: Array<{
    id: string;
    description: string;
    amount: number;
    currency: string;
    status: string;
    date: string;
  }>;
}

// Purchase widget data
export interface PurchaseData {
  total: number;
  pending: number;
  approved: number;
  items: Array<{
    id: string;
    description: string;
    amount: number;
    status: string;
    date: string;
  }>;
}

// Milestone data
export interface MilestoneData {
  upcoming: Array<{
    id: string;
    name: string;
    projectName: string;
    dueDate: string;
    status: string;
  }>;
  overdue: Array<{
    id: string;
    name: string;
    projectName: string;
    dueDate: string;
  }>;
}

// Red Zone (overdue tasks)
export interface RedZoneData {
  items: Array<{
    id: string;
    name: string;
    projectName: string;
    dueDate: string;
    daysOverdue: number;
    assignee: string;
  }>;
  count: number;
}

// Checklist/Todo item
export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
  createdAt: string;
}

// Who's Where data
export interface WhosWhereItem {
  id: string;
  user: {
    id: string;
    fullName: string;
    avatar?: string;
  };
  startAt: string;
  endAt: string;
  type?: string; // 'leave', 'event', 'wfh', 'remote'
  leaveType?: {
    id: string;
    name: string;
    color?: string;
  };
}

export interface WhosWhereData {
  leaveEvents: WhosWhereItem[];
  leaveRequests: WhosWhereItem[];
}

// Calendar Event
export interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startAt: string;
  endAt: string;
  color?: string;
  private?: boolean;
  billable?: boolean;
  timesheet?: boolean;
  project?: {
    id: string;
    name: string;
  };
  task?: {
    id: string;
    name: string;
  };
}

// Assigned Task
export interface AssignedTask {
  id: string;
  name: string;
  projectName?: string;
  projectId?: string;
  projectColor?: string;
  dueDate?: string;
  status: string;
  priority?: string;
  estimatedTime?: number;
  checklist?: Array<{
    id: string;
    label: string;
    completed: boolean;
  }>;
}

// Portfolio Project (for widget)
export interface PortfolioProject {
  id: string;
  name: string;
  status: 'on-track' | 'at-risk' | 'critical' | 'upcoming' | 'completed';
  progress: number;
  openTasks?: number;
  overdueTasks?: number;
  budget?: {
    used: number;
    total: number;
  };
}

// User data
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role?: string;
  companyId?: string;
}

/**
 * Generic API fetch wrapper with auth
 */
async function apiFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...options?.headers,
    },
  });

  if (!response.ok) {
    if (response.status === 401) {
      // Token expired or invalid - could trigger logout here
      throw new Error('Unauthorized');
    }
    throw new Error(`API Error: ${response.status}`);
  }

  const data = await response.json();

  // Handle wrapped response format { status: "OK", result: data }
  if (data.status === 'OK' && data.result !== undefined) {
    return data.result as T;
  }

  return data as T;
}

/**
 * Get current user data
 */
export async function getCurrentUser(): Promise<User> {
  return apiFetch<User>('/queries/me');
}

/**
 * Get user's widget configuration
 */
export async function getUserWidgets(): Promise<Widget[]> {
  return apiFetch<Widget[]>('/queries/me/widgets');
}

/**
 * Get "What's New" notifications
 */
export async function getWhatsNew(): Promise<NewsItem[]> {
  return apiFetch<NewsItem[]>('/queries/whats-new');
}

/**
 * Get pending approvals
 */
export async function getWhatsPending(): Promise<PendingItem[]> {
  return apiFetch<PendingItem[]>('/queries/whats-pending');
}

/**
 * Get portfolio/daily status data
 */
export async function getPortfolio(): Promise<PortfolioData> {
  return apiFetch<PortfolioData>('/queries/widget-portfolio');
}

/**
 * Get task count data
 */
export async function getTaskCount(): Promise<TaskCountData> {
  return apiFetch<TaskCountData>('/queries/widget-task-count');
}

/**
 * Get expenses widget data
 */
export async function getExpenses(): Promise<ExpenseData> {
  return apiFetch<ExpenseData>('/queries/widget-expenses');
}

/**
 * Get purchases widget data
 */
export async function getPurchases(): Promise<PurchaseData> {
  return apiFetch<PurchaseData>('/queries/widget-purchases');
}

/**
 * Get milestones widget data
 */
export async function getMilestones(): Promise<MilestoneData> {
  return apiFetch<MilestoneData>('/queries/widget-milestones');
}

/**
 * Get red zone (overdue) data
 */
export async function getRedZone(): Promise<RedZoneData> {
  return apiFetch<RedZoneData>('/queries/widget-red-zone');
}

/**
 * Get personal checklist/todo
 */
export async function getChecklist(): Promise<ChecklistItem[]> {
  return apiFetch<ChecklistItem[]>('/queries/me/checklist');
}

/**
 * Dismiss a single notification
 */
export async function dismissNotification(notificationId: string): Promise<void> {
  await apiFetch<void>('/commands/sync/whats-new/dismiss', {
    method: 'POST',
    body: JSON.stringify({ id: notificationId }),
  });
}

/**
 * Dismiss all notifications
 */
export async function dismissAllNotifications(): Promise<void> {
  await apiFetch<void>('/commands/sync/whats-new/dismiss/all', {
    method: 'POST',
  });
}

/**
 * Update widget configuration
 */
export async function updateWidget(widget: Widget): Promise<void> {
  await apiFetch<void>('/commands/sync/update-user-widget', {
    method: 'POST',
    body: JSON.stringify(widget),
  });
}

/**
 * Update checklist item
 */
export async function updateChecklistItem(item: ChecklistItem): Promise<void> {
  await apiFetch<void>('/commands/sync/user/update-checklist', {
    method: 'POST',
    body: JSON.stringify(item),
  });
}

/**
 * Delete checklist item
 */
export async function deleteChecklistItem(itemId: string): Promise<void> {
  await apiFetch<void>('/commands/sync/user/delete-checklist', {
    method: 'POST',
    body: JSON.stringify({ id: itemId }),
  });
}

/**
 * Clear completed checklist items
 */
export async function clearCompletedChecklist(): Promise<void> {
  await apiFetch<void>('/commands/sync/user/clear-completed-checklist', {
    method: 'POST',
  });
}

/**
 * Get who's where data (team members on leave/remote)
 */
export async function getWhosWhere(): Promise<WhosWhereData> {
  return apiFetch<WhosWhereData>('/queries/who-is-where');
}

/**
 * Get calendar events for today
 * Endpoint: /queries/events/user/{userId}?start=YYYY-MM-DD&end=YYYY-MM-DD&tz=timezone
 */
export async function getTodayEvents(userId?: string): Promise<CalendarEvent[]> {
  // Format date as YYYY-MM-DD (matching Angular app format)
  const today = new Date();
  const dateStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;

  // Get timezone
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // If we have a userId, use it; otherwise use 'me' as fallback
  const userPath = userId || 'me';

  return apiFetch<CalendarEvent[]>(`/queries/events/user/${userPath}?start=${dateStr}&tz=${encodeURIComponent(tz)}`);
}

/**
 * Get assigned tasks for current user
 */
export async function getAssignedTasks(): Promise<AssignedTask[]> {
  return apiFetch<AssignedTask[]>('/queries/tasks');
}

/**
 * Get portfolio projects
 */
export async function getPortfolioProjects(): Promise<PortfolioProject[]> {
  return apiFetch<PortfolioProject[]>('/queries/projects');
}

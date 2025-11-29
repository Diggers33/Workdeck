/**
 * Dashboard API Service
 * Handles all dashboard-related API calls to Workdeck backend
 */

import { getAuthHeaders } from '../../../services/authService';

const API_URL = import.meta.env.VITE_API_URL || 'https://test-api.workdeck.com';

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

// News/Notification item (unified format for display)
export interface NewsItem {
  id: string;
  notificationId?: string;
  type: string;
  message: string;
  createdAt: string;
  read?: boolean;
}

// Raw API response for whats-new (has multiple arrays)
export interface WhatsNewApiResponse {
  deleteEvents?: any[];
  movedTasks?: any[];
  newComments?: any[];
  newEvents?: any[];
  newLeaveRequests?: any[];
  newTasks?: any[];
  [key: string]: any[] | undefined;
}

// Pending item (approval request) - unified format for display
export interface PendingItem {
  id: string;
  type: 'leave' | 'expense' | 'purchase' | 'timesheet' | 'event';
  title: string;
  requestedBy: string;
  requestedAt: string;
  status: string;
}

// Raw API response for whats-pending (has multiple arrays)
export interface WhatsPendingApiResponse {
  pendingEvents?: any[];
  pendingExpenses?: any[];
  pendingLeaveRequests?: any[];
  pendingPurchases?: any[];
  pendingTimesheets?: any[];
  [key: string]: any[] | undefined;
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

// Red Zone project item (from API)
export interface RedZoneProject {
  id: string;
  name: string;
  clientName?: string;
  numLateTasks: number;
  numFlags: number;
  numMilestones: number;
  numOverdueTasks: number;
  numActiveProjectAlerts: number;
  budgetPlanned?: number;
  budgetSpent?: number;
  effortPlannedSeconds?: number;
  effortSpentSeconds?: number;
}

// Red Zone data for widget display
export interface RedZoneData {
  items: Array<{
    id: string;
    name: string;
    projectName: string;
    daysOverdue: number;
    issues: string;
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

// Who's Where data - matches API response from Angular UserInfoEntity
export interface WhosWhereItem {
  id: string;
  user: {
    id: string;
    firstName?: string;
    lastName?: string;
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
  halfDay?: string; // 'AM', 'PM', 'D' (full day)
  state?: string;
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

// Default timeout for API requests (15 seconds)
const API_TIMEOUT = 15000;

/**
 * Generic API fetch wrapper with auth and timeout
 */
async function apiFetch<T>(endpoint: string, options?: RequestInit & { timeout?: number }): Promise<T> {
  const timeout = options?.timeout ?? API_TIMEOUT;

  // Create abort controller for timeout
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      signal: controller.signal,
      headers: {
        ...getAuthHeaders(),
        ...options?.headers,
      },
    });

    clearTimeout(timeoutId);

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
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`);
    }
    throw error;
  }
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
  const response = await apiFetch<WhatsNewApiResponse>('/queries/whats-new');

  // Transform the complex response into a flat array of NewsItem
  const items: NewsItem[] = [];

  // Helper to add items from an array with a specific type
  const addItems = (arr: any[] | undefined, type: string) => {
    if (!Array.isArray(arr)) return;
    arr.forEach((item: any) => {
      items.push({
        id: item.id || item.notificationId || `${type}-${Math.random()}`,
        notificationId: item.notificationId,
        type: type,
        message: item.message || item.title || item.summary || item.name || `New ${type}`,
        createdAt: item.createdAt || item.date || new Date().toISOString(),
        read: item.read ?? false,
      });
    });
  };

  // Add items from each category
  addItems(response.newLeaveRequests, 'leave');
  addItems(response.newEvents, 'event');
  addItems(response.newComments, 'comment');
  addItems(response.newTasks, 'task');
  addItems(response.movedTasks, 'moved-task');
  addItems(response.deleteEvents, 'deleted-event');

  // Sort by date (newest first)
  items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return items;
}

/**
 * Get pending approvals
 */
export async function getWhatsPending(): Promise<PendingItem[]> {
  const response = await apiFetch<WhatsPendingApiResponse>('/queries/whats-pending');

  // Transform the complex response into a flat array of PendingItem
  const items: PendingItem[] = [];

  // Helper to add items from an array with a specific type
  const addItems = (arr: any[] | undefined, type: PendingItem['type']) => {
    if (!Array.isArray(arr)) return;
    arr.forEach((item: any) => {
      // Extract user name from user object if present
      const userName = item.user?.firstName && item.user?.lastName
        ? `${item.user.firstName} ${item.user.lastName}`
        : item.user?.fullName || item.requestedBy || 'Unknown';

      items.push({
        id: item.id || `${type}-${Math.random()}`,
        type: type,
        title: item.title || item.name || item.reason || `${type} request`,
        requestedBy: userName,
        requestedAt: item.createdAt || item.startAt || item.date || new Date().toISOString(),
        status: item.status || item.state || 'pending',
      });
    });
  };

  // Add items from each category
  addItems(response.pendingLeaveRequests, 'leave');
  addItems(response.pendingEvents, 'event');
  addItems(response.pendingExpenses, 'expense');
  addItems(response.pendingPurchases, 'purchase');
  addItems(response.pendingTimesheets, 'timesheet');

  // Sort by date (newest first)
  items.sort((a, b) => new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime());

  return items;
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
  const projects = await apiFetch<RedZoneProject[]>('/queries/widget-red-zone');

  // Transform projects into red zone items
  // A project is in the red zone if it has overdue tasks, late tasks, or flags
  const items = projects
    .filter(p => p.numOverdueTasks > 0 || p.numLateTasks > 0 || p.numFlags > 0 || p.numActiveProjectAlerts > 0)
    .map(project => {
      // Calculate "days overdue" as max of overdue metrics
      const daysOverdue = Math.max(project.numOverdueTasks, project.numLateTasks, 1);

      // Build issues string
      const issues: string[] = [];
      if (project.numOverdueTasks > 0) issues.push(`${project.numOverdueTasks} overdue`);
      if (project.numLateTasks > 0) issues.push(`${project.numLateTasks} late`);
      if (project.numFlags > 0) issues.push(`${project.numFlags} flags`);

      return {
        id: project.id,
        name: project.name,
        projectName: project.name,
        daysOverdue,
        issues: issues.join(', ') || 'Issues detected',
      };
    });

  return {
    items,
    count: items.length,
  };
}

/**
 * Get personal checklist/todo
 */
// Raw API response for checklist
interface ChecklistApiResponse {
  userChecklist?: any[];
  taskChecklist?: any[];
}

export async function getChecklist(): Promise<ChecklistItem[]> {
  const response = await apiFetch<ChecklistApiResponse>('/queries/me/checklist');

  // API returns {userChecklist: [], taskChecklist: []}
  // We need to transform userChecklist into ChecklistItem[]
  const userItems = response.userChecklist || [];

  return userItems.map((item: any) => {
    // Debug: log the raw item to see what fields it has
    console.log('[getChecklist] Raw checklist item:', item);

    return {
      id: item.id || `checklist-${Math.random()}`,
      // Try multiple possible field names for the title/text
      text: item.text || item.label || item.name || item.title || item.description || item.content || 'Untitled',
      completed: item.completed ?? item.done ?? item.checked ?? false,
      createdAt: item.createdAt || item.created || item.date || new Date().toISOString(),
    };
  });
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
 * Endpoint: /queries/events/user/{userId}?start=YYYY-MM-DD&tz=timezone
 * Requires actual user ID (not 'me'), so we fetch it first if not provided
 */
export async function getTodayEvents(userId?: string): Promise<CalendarEvent[]> {
  // Format date as YYYY-MM-DD (matching Angular app format)
  const today = new Date();
  const dateStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;

  // Get timezone
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Get user ID - this endpoint requires actual ID, not 'me'
  let userIdToUse = userId;
  if (!userIdToUse) {
    const user = await getCurrentUser();
    userIdToUse = user.id;
  }

  return apiFetch<CalendarEvent[]>(`/queries/events/user/${userIdToUse}?start=${dateStr}&tz=${encodeURIComponent(tz)}`);
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

// ============================================================================
// MUTATION FUNCTIONS (Create, Update, Delete)
// ============================================================================

/**
 * Add a new checklist item
 */
export async function addChecklistItem(text: string): Promise<ChecklistItem> {
  const newItem = {
    id: crypto.randomUUID(),
    text,
    completed: false,
    createdAt: new Date().toISOString(),
  };

  await apiFetch<void>('/commands/sync/user/update-checklist', {
    method: 'POST',
    body: JSON.stringify(newItem),
  });

  return newItem;
}

/**
 * Toggle checklist item completion status
 */
export async function toggleChecklistItem(itemId: string, completed: boolean): Promise<void> {
  await apiFetch<void>('/commands/sync/user/update-checklist', {
    method: 'POST',
    body: JSON.stringify({ id: itemId, completed }),
  });
}

/**
 * Create a new calendar event
 */
export interface CreateEventData {
  title: string;
  description?: string;
  startAt: string;
  endAt: string;
  color?: string;
  private?: boolean;
  billable?: boolean;
  timesheet?: boolean;
  projectId?: string;
  taskId?: string;
}

export async function createEvent(eventData: CreateEventData): Promise<CalendarEvent> {
  const response = await apiFetch<CalendarEvent>('/commands/sync/create-event', {
    method: 'POST',
    body: JSON.stringify(eventData),
  });
  return response;
}

/**
 * Update an existing calendar event
 */
export async function updateEvent(eventId: string, eventData: Partial<CreateEventData>): Promise<void> {
  await apiFetch<void>('/commands/sync/update-event', {
    method: 'POST',
    body: JSON.stringify({ id: eventId, ...eventData }),
  });
}

/**
 * Delete a calendar event
 */
export async function deleteEvent(eventId: string): Promise<void> {
  await apiFetch<void>('/commands/sync/delete-event', {
    method: 'POST',
    body: JSON.stringify({ id: eventId }),
  });
}

/**
 * Create event from task (schedule a task on calendar)
 */
export async function createEventFromTask(
  taskId: string,
  taskTitle: string,
  startAt: string,
  durationMinutes: number = 60
): Promise<CalendarEvent> {
  const endAt = new Date(new Date(startAt).getTime() + durationMinutes * 60 * 1000).toISOString();

  return createEvent({
    title: taskTitle,
    startAt,
    endAt,
    taskId,
    timesheet: true,
  });
}

// ============================================================================
// APPROVAL FUNCTIONS
// ============================================================================

export type ApprovalType = 'leave' | 'expense' | 'purchase' | 'timesheet' | 'event';

/**
 * Approve a pending item
 * API endpoints per type:
 * - leave: /commands/sync/approve-leave-request
 * - expense: /commands/sync/approve-expense
 * - timesheet: /commands/sync/approve-timesheet
 */
export async function approveItem(type: ApprovalType, itemId: string, comment?: string): Promise<void> {
  // Map type to correct endpoint name
  const endpointMap: Record<ApprovalType, string> = {
    leave: 'approve-leave-request',
    expense: 'approve-expense',
    purchase: 'approve-purchase',
    timesheet: 'approve-timesheet',
    event: 'approve-event',
  };

  const endpoint = `/commands/sync/${endpointMap[type]}`;
  await apiFetch<void>(endpoint, {
    method: 'POST',
    body: JSON.stringify({ id: itemId, comment }),
  });
}

/**
 * Reject/Deny a pending item with reason
 * API endpoints per type:
 * - leave: /commands/sync/deny-leave-request
 * - expense: /commands/sync/deny-expense
 */
export async function rejectItem(type: ApprovalType, itemId: string, reason: string): Promise<void> {
  // Map type to correct endpoint name (API uses "deny" not "reject")
  const endpointMap: Record<ApprovalType, string> = {
    leave: 'deny-leave-request',
    expense: 'deny-expense',
    purchase: 'deny-purchase',
    timesheet: 'deny-timesheet',
    event: 'deny-event',
  };

  const endpoint = `/commands/sync/${endpointMap[type]}`;
  await apiFetch<void>(endpoint, {
    method: 'POST',
    body: JSON.stringify({ id: itemId, comment: reason }),
  });
}

/**
 * Get approval details for a specific item
 */
export async function getApprovalDetails(type: ApprovalType, itemId: string): Promise<any> {
  return apiFetch<any>(`/queries/${type}/${itemId}`);
}

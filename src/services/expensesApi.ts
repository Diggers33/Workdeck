/**
 * Expenses API Service
 * Based on Workdeck API Complete Reference Guide
 */

import { apiGet, apiPost, formatDate } from './apiClient';

// ==================== Types ====================

export interface ExpenseEntity {
  id: string;

  creator: {
    id: string;
    fullName: string;
  };

  project?: {
    id: string;
    name: string;
  };

  date: string; // DD/MM/YYYY

  amount: string; // Decimal string
  currency: {
    id: string;
    symbol: string;
    name: string;
  };

  category: string;
  description: string;

  status: number; // 0=Pending, 1=Approved, 2=Denied

  items: ExpenseItem[];
  files: any[]; // FileEntity[]

  costType?: {
    id: string;
    name: string;
  };
}

export interface ExpenseItem {
  id: string;
  description: string;
  amount: string; // Decimal string
  quantity?: number;
  unitPrice?: string;
}

// ==================== API Functions ====================

/**
 * Get expenses
 * GET /queries/expenses
 */
export async function getExpenses(filters?: {
  startDate?: string; // DD/MM/YYYY
  endDate?: string;
  userId?: string;
  projectId?: string;
  status?: number;
}): Promise<ExpenseEntity[]> {
  let params = '';
  if (filters) {
    const queryParams: string[] = [];
    if (filters.startDate) queryParams.push(`startDate=${filters.startDate}`);
    if (filters.endDate) queryParams.push(`endDate=${filters.endDate}`);
    if (filters.userId) queryParams.push(`userId=${filters.userId}`);
    if (filters.projectId) queryParams.push(`projectId=${filters.projectId}`);
    if (filters.status !== undefined) queryParams.push(`status=${filters.status}`);
    if (queryParams.length > 0) {
      params = '?' + queryParams.join('&');
    }
  }
  return apiGet<ExpenseEntity[]>(`/queries/expenses${params}`);
}

/**
 * Get single expense
 * GET /queries/expenses/{expenseId}
 */
export async function getExpense(expenseId: string): Promise<ExpenseEntity> {
  return apiGet<ExpenseEntity>(`/queries/expenses/${expenseId}`);
}

/**
 * Create expense
 * POST /commands/sync/expenses/create-expense
 */
export async function createExpense(expense: {
  project?: { id: string };
  date: string; // DD/MM/YYYY
  amount: string;
  currency: { id: string };
  category: string;
  description: string;
  items: {
    description: string;
    amount: string;
    quantity?: number;
    unitPrice?: string;
  }[];
}): Promise<ExpenseEntity> {
  return apiPost<ExpenseEntity>('/commands/sync/expenses/create-expense', expense);
}

/**
 * Update expense
 * POST /commands/sync/expenses/update-expense
 */
export async function updateExpense(
  id: string,
  updates: Partial<{
    project: { id: string };
    date: string;
    amount: string;
    currency: { id: string };
    category: string;
    description: string;
    items: ExpenseItem[];
  }>
): Promise<void> {
  return apiPost('/commands/sync/expenses/update-expense', { id, ...updates });
}

/**
 * Delete expense
 * POST /commands/sync/expenses/delete-expense
 */
export async function deleteExpense(id: string): Promise<void> {
  return apiPost('/commands/sync/expenses/delete-expense', { id });
}

/**
 * Approve expense
 * POST /commands/sync/approve-expense
 */
export async function approveExpense(id: string, comment?: string): Promise<void> {
  return apiPost('/commands/sync/approve-expense', { id, comment });
}

/**
 * Deny expense
 * POST /commands/sync/deny-expense
 */
export async function denyExpense(id: string, comment: string): Promise<void> {
  return apiPost('/commands/sync/deny-expense', { id, comment });
}

/**
 * Get expense stream (activity feed)
 * GET /queries/expense-stream
 */
export async function getExpenseStream(expenseId: string): Promise<any> {
  return apiGet(`/queries/expense-stream?expenseId=${expenseId}`);
}


/**
 * Budgets API Service
 * Based on Workdeck API Complete Reference Guide
 */

import { apiGet, apiPost } from './apiClient';

// ==================== Types ====================

export interface BudgetEntity {
  budget: string; // ID (uses 'budget' instead of 'id')

  costType: {
    id: string;
    name: string;
  };

  department?: string;

  office?: {
    id: string;
    name: string;
  };

  description: string;
  name: string; // Alias for description

  amount: string; // Decimal string

  activity?: {
    id: string;
    name: string;
  };

  task?: {
    id: string;
    name: string;
  };
}

export interface Currency {
  id: string;
  name: string;
  symbol: string;
  exchangeRate: string;
}

export interface CostType {
  id: string;
  name: string;
}

// ==================== API Functions ====================

/**
 * Create project budget
 * POST /commands/mocks/create-project-budget
 */
export async function createProjectBudget(budget: {
  projectId: string;
  description: string;
  amount: string;
  costType?: { id: string };
  department?: string;
  office?: { id: string };
  activity?: { id: string };
  task?: { id: string };
}): Promise<BudgetEntity> {
  return apiPost<BudgetEntity>('/commands/mocks/create-project-budget', budget);
}

/**
 * Update project budget
 * POST /commands/mocks/update-project-budget
 */
export async function updateProjectBudget(
  id: string,
  updates: {
    description?: string;
    amount?: string;
    costType?: { id: string };
  }
): Promise<void> {
  return apiPost('/commands/mocks/update-project-budget', { id, ...updates });
}

/**
 * Delete project budget
 * POST /commands/mocks/delete-project-budget
 */
export async function deleteProjectBudget(id: string): Promise<void> {
  return apiPost('/commands/mocks/delete-project-budget', { id });
}

/**
 * Get currencies
 * GET /queries/currencies
 */
export async function getCurrencies(): Promise<Currency[]> {
  return apiGet<Currency[]>('/queries/currencies');
}

/**
 * Get cost types
 * GET /queries/cost-types
 */
export async function getCostTypes(): Promise<CostType[]> {
  return apiGet<CostType[]>('/queries/cost-types');
}


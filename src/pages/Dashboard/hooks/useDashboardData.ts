/**
 * Dashboard Data Hook
 * Fetches and manages dashboard widget data
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Widget,
  WIDGET_TYPES,
  getUserWidgets,
  getWhatsNew,
  getWhatsPending,
  getPortfolio,
  getTaskCount,
  getExpenses,
  getPurchases,
  getMilestones,
  getRedZone,
  getChecklist,
  NewsItem,
  PendingItem,
  PortfolioData,
  TaskCountData,
  ExpenseData,
  PurchaseData,
  MilestoneData,
  RedZoneData,
  ChecklistItem,
} from '../api/dashboardApi';

export interface DashboardData {
  widgets: Widget[];
  whatsNew: NewsItem[];
  whatsPending: PendingItem[];
  portfolio: PortfolioData | null;
  taskCount: TaskCountData | null;
  expenses: ExpenseData | null;
  purchases: PurchaseData | null;
  milestones: MilestoneData | null;
  redZone: RedZoneData | null;
  checklist: ChecklistItem[];
}

export interface UseDashboardDataReturn {
  data: DashboardData;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  refreshWidget: (widgetType: number) => Promise<void>;
}

const initialData: DashboardData = {
  widgets: [],
  whatsNew: [],
  whatsPending: [],
  portfolio: null,
  taskCount: null,
  expenses: null,
  purchases: null,
  milestones: null,
  redZone: null,
  checklist: [],
};

export function useDashboardData(): UseDashboardDataReturn {
  const [data, setData] = useState<DashboardData>(initialData);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch data for a specific widget type
  const fetchWidgetData = useCallback(async (widgetType: number) => {
    try {
      switch (widgetType) {
        case WIDGET_TYPES.FYI:
          const whatsNew = await getWhatsNew();
          setData(prev => ({ ...prev, whatsNew }));
          break;
        case WIDGET_TYPES.PENDING:
          const whatsPending = await getWhatsPending();
          setData(prev => ({ ...prev, whatsPending }));
          break;
        case WIDGET_TYPES.DAILY_STATUS:
          const portfolio = await getPortfolio();
          setData(prev => ({ ...prev, portfolio }));
          break;
        case WIDGET_TYPES.TASK_COUNT:
          const taskCount = await getTaskCount();
          setData(prev => ({ ...prev, taskCount }));
          break;
        case WIDGET_TYPES.EXPENSES:
          const expenses = await getExpenses();
          setData(prev => ({ ...prev, expenses }));
          break;
        case WIDGET_TYPES.PURCHASES:
          const purchases = await getPurchases();
          setData(prev => ({ ...prev, purchases }));
          break;
        case WIDGET_TYPES.MILESTONES:
          const milestones = await getMilestones();
          setData(prev => ({ ...prev, milestones }));
          break;
        case WIDGET_TYPES.RED_ZONE:
          const redZone = await getRedZone();
          setData(prev => ({ ...prev, redZone }));
          break;
        case WIDGET_TYPES.TODO_LIST:
          const checklist = await getChecklist();
          setData(prev => ({ ...prev, checklist }));
          break;
      }
    } catch (err) {
      console.error(`Error fetching widget ${widgetType}:`, err);
    }
  }, []);

  // Refresh a single widget
  const refreshWidget = useCallback(async (widgetType: number) => {
    await fetchWidgetData(widgetType);
  }, [fetchWidgetData]);

  // Load all dashboard data
  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // First, get user's widget configuration
      let widgets: Widget[] = [];
      try {
        widgets = await getUserWidgets();
      } catch (err) {
        console.warn('Could not fetch widgets, using defaults:', err);
        // Use default widget configuration if API fails
        widgets = getDefaultWidgets();
      }

      setData(prev => ({ ...prev, widgets }));

      // Get enabled widget types
      const enabledTypes = widgets
        .filter(w => w.enabled !== false)
        .map(w => w.type);

      // Fetch data for each enabled widget in parallel
      const fetchPromises: Promise<void>[] = [];

      if (enabledTypes.includes(WIDGET_TYPES.FYI)) {
        fetchPromises.push(
          getWhatsNew()
            .then(whatsNew => setData(prev => ({ ...prev, whatsNew })))
            .catch(err => console.error('Error fetching whats new:', err))
        );
      }

      if (enabledTypes.includes(WIDGET_TYPES.PENDING)) {
        fetchPromises.push(
          getWhatsPending()
            .then(whatsPending => setData(prev => ({ ...prev, whatsPending })))
            .catch(err => console.error('Error fetching pending:', err))
        );
      }

      if (enabledTypes.includes(WIDGET_TYPES.DAILY_STATUS)) {
        fetchPromises.push(
          getPortfolio()
            .then(portfolio => setData(prev => ({ ...prev, portfolio })))
            .catch(err => console.error('Error fetching portfolio:', err))
        );
      }

      if (enabledTypes.includes(WIDGET_TYPES.TASK_COUNT)) {
        fetchPromises.push(
          getTaskCount()
            .then(taskCount => setData(prev => ({ ...prev, taskCount })))
            .catch(err => console.error('Error fetching task count:', err))
        );
      }

      if (enabledTypes.includes(WIDGET_TYPES.EXPENSES)) {
        fetchPromises.push(
          getExpenses()
            .then(expenses => setData(prev => ({ ...prev, expenses })))
            .catch(err => console.error('Error fetching expenses:', err))
        );
      }

      if (enabledTypes.includes(WIDGET_TYPES.PURCHASES)) {
        fetchPromises.push(
          getPurchases()
            .then(purchases => setData(prev => ({ ...prev, purchases })))
            .catch(err => console.error('Error fetching purchases:', err))
        );
      }

      if (enabledTypes.includes(WIDGET_TYPES.MILESTONES)) {
        fetchPromises.push(
          getMilestones()
            .then(milestones => setData(prev => ({ ...prev, milestones })))
            .catch(err => console.error('Error fetching milestones:', err))
        );
      }

      if (enabledTypes.includes(WIDGET_TYPES.RED_ZONE)) {
        fetchPromises.push(
          getRedZone()
            .then(redZone => setData(prev => ({ ...prev, redZone })))
            .catch(err => console.error('Error fetching red zone:', err))
        );
      }

      if (enabledTypes.includes(WIDGET_TYPES.TODO_LIST)) {
        fetchPromises.push(
          getChecklist()
            .then(checklist => setData(prev => ({ ...prev, checklist })))
            .catch(err => console.error('Error fetching checklist:', err))
        );
      }

      await Promise.all(fetchPromises);

    } catch (err) {
      console.error('Dashboard load error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  return {
    data,
    loading,
    error,
    refresh: loadDashboardData,
    refreshWidget,
  };
}

// Default widget configuration when API fails
function getDefaultWidgets(): Widget[] {
  return [
    { id: '1', type: WIDGET_TYPES.FYI, size: 'medium', position: 1, enabled: true },
    { id: '2', type: WIDGET_TYPES.PENDING, size: 'medium', position: 2, enabled: true },
    { id: '3', type: WIDGET_TYPES.TASK_COUNT, size: 'small', position: 3, enabled: true },
    { id: '4', type: WIDGET_TYPES.DAILY_STATUS, size: 'medium', position: 4, enabled: true },
    { id: '5', type: WIDGET_TYPES.TODO_LIST, size: 'medium', position: 5, enabled: true },
    { id: '6', type: WIDGET_TYPES.RED_ZONE, size: 'small', position: 6, enabled: true },
  ];
}

export default useDashboardData;

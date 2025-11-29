/**
 * Dashboard Data Hook
 * Fetches and manages dashboard widget data
 */

import { useState, useEffect, useCallback } from 'react';

// Debug logging helper
const DEBUG = true; // Set to false to disable logging
const log = (message: string, data?: any) => {
  if (DEBUG) {
    console.log(`[Dashboard API] ${message}`, data !== undefined ? data : '');
  }
};
const logError = (message: string, error: any) => {
  if (DEBUG) {
    console.error(`[Dashboard API] ${message}`, error);
  }
};
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
  getWhosWhere,
  getTodayEvents,
  getAssignedTasks,
  getPortfolioProjects,
  NewsItem,
  PendingItem,
  PortfolioData,
  TaskCountData,
  ExpenseData,
  PurchaseData,
  MilestoneData,
  RedZoneData,
  ChecklistItem,
  WhosWhereData,
  CalendarEvent,
  AssignedTask,
  PortfolioProject,
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
  whosWhere: WhosWhereData | null;
  todayEvents: CalendarEvent[];
  assignedTasks: AssignedTask[];
  portfolioProjects: PortfolioProject[];
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
  whosWhere: null,
  todayEvents: [],
  assignedTasks: [],
  portfolioProjects: [],
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
    log('Starting dashboard data load...');
    setLoading(true);
    setError(null);

    try {
      // First, get user's widget configuration
      log('Fetching user widgets...');
      let widgets: Widget[] = [];
      try {
        widgets = await getUserWidgets();
        log('User widgets received:', widgets);
      } catch (err) {
        logError('Could not fetch widgets, using defaults:', err);
        // Use default widget configuration if API fails
        widgets = getDefaultWidgets();
        log('Using default widgets:', widgets);
      }

      setData(prev => ({ ...prev, widgets }));

      // Get enabled widget types
      const enabledTypes = widgets
        .filter(w => w.enabled !== false)
        .map(w => w.type);
      log('Enabled widget types:', enabledTypes);

      // Fetch data for each enabled widget in parallel
      const fetchPromises: Promise<void>[] = [];

      if (enabledTypes.includes(WIDGET_TYPES.FYI)) {
        log('Fetching FYI/Whats New...');
        fetchPromises.push(
          getWhatsNew()
            .then(whatsNew => {
              log('FYI data received:', whatsNew);
              setData(prev => ({ ...prev, whatsNew }));
            })
            .catch(err => logError('Error fetching whats new:', err))
        );
      }

      if (enabledTypes.includes(WIDGET_TYPES.PENDING)) {
        log('Fetching Pending Approvals...');
        fetchPromises.push(
          getWhatsPending()
            .then(whatsPending => {
              log('Pending data received:', whatsPending);
              setData(prev => ({ ...prev, whatsPending }));
            })
            .catch(err => logError('Error fetching pending:', err))
        );
      }

      if (enabledTypes.includes(WIDGET_TYPES.DAILY_STATUS)) {
        log('Fetching Portfolio...');
        fetchPromises.push(
          getPortfolio()
            .then(portfolio => {
              log('Portfolio data received:', portfolio);
              setData(prev => ({ ...prev, portfolio }));
            })
            .catch(err => logError('Error fetching portfolio:', err))
        );
      }

      if (enabledTypes.includes(WIDGET_TYPES.TASK_COUNT)) {
        log('Fetching Task Count...');
        fetchPromises.push(
          getTaskCount()
            .then(taskCount => {
              log('Task count data received:', taskCount);
              setData(prev => ({ ...prev, taskCount }));
            })
            .catch(err => logError('Error fetching task count:', err))
        );
      }

      if (enabledTypes.includes(WIDGET_TYPES.EXPENSES)) {
        log('Fetching Expenses...');
        fetchPromises.push(
          getExpenses()
            .then(expenses => {
              log('Expenses data received:', expenses);
              setData(prev => ({ ...prev, expenses }));
            })
            .catch(err => logError('Error fetching expenses:', err))
        );
      }

      if (enabledTypes.includes(WIDGET_TYPES.PURCHASES)) {
        log('Fetching Purchases...');
        fetchPromises.push(
          getPurchases()
            .then(purchases => {
              log('Purchases data received:', purchases);
              setData(prev => ({ ...prev, purchases }));
            })
            .catch(err => logError('Error fetching purchases:', err))
        );
      }

      if (enabledTypes.includes(WIDGET_TYPES.MILESTONES)) {
        log('Fetching Milestones...');
        fetchPromises.push(
          getMilestones()
            .then(milestones => {
              log('Milestones data received:', milestones);
              setData(prev => ({ ...prev, milestones }));
            })
            .catch(err => logError('Error fetching milestones:', err))
        );
      }

      if (enabledTypes.includes(WIDGET_TYPES.RED_ZONE)) {
        log('Fetching Red Zone...');
        fetchPromises.push(
          getRedZone()
            .then(redZone => {
              log('Red Zone data received:', redZone);
              setData(prev => ({ ...prev, redZone }));
            })
            .catch(err => logError('Error fetching red zone:', err))
        );
      }

      if (enabledTypes.includes(WIDGET_TYPES.TODO_LIST)) {
        log('Fetching Checklist/Todo...');
        fetchPromises.push(
          getChecklist()
            .then(checklist => {
              log('Checklist data received:', checklist);
              setData(prev => ({ ...prev, checklist }));
            })
            .catch(err => logError('Error fetching checklist:', err))
        );
      }

      // Always fetch Who's Where (for leave/remote status widget)
      log('Fetching Who\'s Where...');
      fetchPromises.push(
        getWhosWhere()
          .then(whosWhere => {
            log('Who\'s Where data received:', whosWhere);
            setData(prev => ({ ...prev, whosWhere }));
          })
          .catch(err => logError('Error fetching who\'s where:', err))
      );

      // Always fetch Today's Events (for agenda widget)
      log('Fetching Today\'s Events...');
      fetchPromises.push(
        getTodayEvents()
          .then(todayEvents => {
            log('Today\'s Events received:', todayEvents);
            setData(prev => ({ ...prev, todayEvents }));
          })
          .catch(err => logError('Error fetching today\'s events:', err))
      );

      // Always fetch Assigned Tasks (for todo widget assigned section)
      log('Fetching Assigned Tasks...');
      fetchPromises.push(
        getAssignedTasks()
          .then(assignedTasks => {
            log('Assigned Tasks received:', assignedTasks);
            setData(prev => ({ ...prev, assignedTasks }));
          })
          .catch(err => logError('Error fetching assigned tasks:', err))
      );

      // Always fetch Portfolio Projects (for portfolio widget)
      log('Fetching Portfolio Projects...');
      fetchPromises.push(
        getPortfolioProjects()
          .then(portfolioProjects => {
            log('Portfolio Projects received:', portfolioProjects);
            setData(prev => ({ ...prev, portfolioProjects }));
          })
          .catch(err => logError('Error fetching portfolio projects:', err))
      );

      await Promise.all(fetchPromises);
      log('All dashboard data loaded successfully');

    } catch (err) {
      logError('Dashboard load error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
      log('Dashboard loading complete');
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

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type SpendingType = 'Expense' | 'Purchase';

// Project, Activity, Task types
export interface Project {
  id: string;
  code: string;
  name: string;
  color: string;
}

export interface Activity {
  id: string;
  projectId: string;
  code: string;
  name: string;
  order: number;
}

export interface Task {
  id: string;
  activityId: string;
  code: string;
  name: string;
  order: number;
}

export type SpendingStatus = 
  | 'Draft' 
  | 'Pending' 
  | 'Approved' 
  | 'Denied' 
  | 'Processing' 
  | 'Ordered' 
  | 'Finalized' 
  | 'Received';

export type CostType = 
  | 'Meals' 
  | 'Travel' 
  | 'Accommodation' 
  | 'Equipment' 
  | 'Software' 
  | 'Office Supplies' 
  | 'Marketing' 
  | 'Training' 
  | 'Entertainment' 
  | 'Other';

export interface SpendingLineItem {
  id: string;
  description: string;
  costType: CostType;
  amount: number;
  currency: string;
  vat: number;
  vatRate: number;
  date: string;
  paidBy?: 'Employee' | 'Company Card';
  receiptUrl?: string;
  receiptFilename?: string;
  notes?: string;

  // Purchase-specific
  supplier?: string;
  quantity?: number;
  unitPrice?: number;
  sku?: string;

  // Project/Activity/Task linking (for purchase line items when multi-project)
  projectId?: string;
  activityId?: string;
  taskId?: string;
}

export interface SpendingRequest {
  id: string;
  type: SpendingType;
  referenceNumber: string;
  userId: string;
  status: SpendingStatus;
  purpose: string;

  // Project/Activity/Task linking
  projectId?: string;
  activityId?: string;
  taskId?: string;

  // Legacy project field (for backward compatibility)
  project?: string;
  costCenter?: string;
  office?: string;
  department?: string;
  isAsap?: boolean;

  // Purchase-specific: Default allocation settings
  useDefaultAllocation?: boolean; // When true, all line items use header defaults
  
  lineItems: SpendingLineItem[];
  
  // Calculated totals
  subtotal: number;
  totalVat: number;
  total: number;
  currencies: string[]; // ['EUR', 'USD']
  
  submittedDate?: string;
  approvedDate?: string;
  approvedBy?: string;
  deniedDate?: string;
  deniedBy?: string;
  denialReason?: string;
  processedDate?: string;
  completedDate?: string;

  // Processing fields (for admin workflow)
  processingStartedDate?: string;
  processingStartedBy?: string;

  // Purchase ordering fields
  poNumber?: string;
  expectedDeliveryDate?: string;
  orderedDate?: string;
  orderedBy?: string;
  orderNotes?: string;

  // Receiving fields
  receivedDate?: string;
  receivedBy?: string;
  receivedInFull?: boolean;
  receiveNotes?: string;

  // Expense finalization fields
  paymentReference?: string;
  paymentDate?: string;
  finalizedDate?: string;
  finalizedBy?: string;
  finalizationNotes?: string;

  managerComment?: string;

  createdAt: string;
  updatedAt: string;
}

export interface Supplier {
  id: string;
  name: string;
  contact?: string;
  email?: string;
  phone?: string;
  verified: boolean;
  purchaseCount: number;
  totalSpent: number;
}

// User lookup for audit trail display
export interface User {
  id: string;
  name: string;
  avatar?: string;
}

interface SpendingContextType {
  requests: SpendingRequest[];
  suppliers: Supplier[];
  projects: Project[];
  activities: Activity[];
  tasks: Task[];
  users: User[];
  currentUser: {
    id: string;
    name: string;
    isManager: boolean;
    isExpenseAdmin: boolean;
    isPurchaseAdmin: boolean;
    directReports: string[];
  };
  getUserById: (id: string) => User | undefined;

  // Project/Activity/Task helpers
  getActivitiesForProject: (projectId: string) => Activity[];
  getTasksForActivity: (activityId: string) => Task[];
  getProjectById: (projectId: string) => Project | undefined;
  getActivityById: (activityId: string) => Activity | undefined;
  getTaskById: (taskId: string) => Task | undefined;

  createRequest: (type: SpendingType) => SpendingRequest;
  updateRequest: (id: string, updates: Partial<SpendingRequest>) => void;
  deleteRequest: (id: string) => void;
  submitRequest: (id: string) => void;
  approveRequest: (id: string, comment?: string) => void;
  denyRequest: (id: string, reason: string, comment?: string) => void;

  addLineItem: (requestId: string, item: Omit<SpendingLineItem, 'id'>) => void;
  updateLineItem: (requestId: string, itemId: string, updates: Partial<SpendingLineItem>) => void;
  deleteLineItem: (requestId: string, itemId: string) => void;

  addSupplier: (supplier: Omit<Supplier, 'id' | 'purchaseCount' | 'totalSpent'>) => void;

  // Processing actions
  startProcessing: (id: string) => void;
  markAsOrdered: (id: string, poNumber?: string, expectedDeliveryDate?: string, notes?: string) => void;
  markAsReceived: (id: string, receivedDate: string, receivedInFull: boolean, notes?: string) => void;
  markAsFinalized: (id: string, paymentReference?: string, paymentDate?: string, notes?: string) => void;
}

const SpendingContext = createContext<SpendingContextType | undefined>(undefined);

export function useSpending() {
  const context = useContext(SpendingContext);
  if (!context) {
    throw new Error('useSpending must be used within SpendingProvider');
  }
  return context;
}

export const costTypeConfig: Record<CostType, { label: string; color: string }> = {
  'Meals': { label: 'Meals & Entertainment', color: '#F59E0B' },
  'Travel': { label: 'Travel', color: '#3B82F6' },
  'Accommodation': { label: 'Accommodation', color: '#8B5CF6' },
  'Equipment': { label: 'Equipment', color: '#10B981' },
  'Software': { label: 'Software & Subscriptions', color: '#6366F1' },
  'Office Supplies': { label: 'Office Supplies', color: '#EC4899' },
  'Marketing': { label: 'Marketing', color: '#F43F5E' },
  'Training': { label: 'Training & Development', color: '#14B8A6' },
  'Entertainment': { label: 'Client Entertainment', color: '#F59E0B' },
  'Other': { label: 'Other', color: '#6B7280' },
};

export function SpendingProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [currentUser, setCurrentUser] = useState<{
    id: string;
    name: string;
    isManager: boolean;
    isExpenseAdmin: boolean;
    isPurchaseAdmin: boolean;
    directReports: string[];
  } | null>(null);

  // Load data from API
  useEffect(() => {
    async function loadData() {
      try {
        const { getUsers } = await import('../services/usersApi');
        const { getProjects } = await import('../services/projectsApi');
        const { getCurrentUser } = await import('../services/usersApi');
        const { getTasks } = await import('../services/tasksApi');

        const [apiUsers, apiProjects, user, apiTasks] = await Promise.all([
          getUsers().catch(() => []),
          getProjects().catch(() => []),
          getCurrentUser().catch(() => null),
          getTasks().catch(() => []),
        ]);

        // Transform users
        const transformedUsers: User[] = apiUsers.map(u => ({
          id: u.id,
          name: u.fullName,
        }));

        // Transform projects
        const transformedProjects: Project[] = apiProjects.map(p => ({
          id: p.id,
          code: p.code,
          name: p.name,
          color: p.colorAllTasks || '#3B82F6',
        }));

        // Transform activities
        const transformedActivities: Activity[] = apiProjects.flatMap(p =>
          (p.activities || []).map((act, idx) => ({
            id: act.id,
            projectId: p.id,
            code: `WP${idx + 1}`,
            name: act.name,
            order: act.position,
          }))
        );

        // Transform tasks
        const transformedTasks: Task[] = apiTasks.flatMap(t =>
          t.activity ? [{
            id: t.id,
            activityId: t.activity.id,
            code: '', // Not in API
            name: t.name,
            order: t.position,
          }] : []
        );

        // Set current user
        if (user) {
          setCurrentUser({
            id: user.id,
            name: user.fullName,
            isManager: user.isManager || false,
            isExpenseAdmin: user.isManager || false, // Default to manager
            isPurchaseAdmin: user.isManager || false,
            directReports: user.managerOf?.map(m => m.id) || [],
          });
        }

        setUsers(transformedUsers);
        setProjects(transformedProjects);
        setActivities(transformedActivities);
        setTasks(transformedTasks);
      } catch (error) {
        console.error('Error loading spending data:', error);
        // Set default current user on error
        setCurrentUser({
          id: 'user-1',
          name: 'Current User',
          isManager: false,
          isExpenseAdmin: false,
          isPurchaseAdmin: false,
          directReports: [],
        });
      }
    }

    loadData();
  }, []);

  const getUserById = (id: string): User | undefined => {
    return users.find(u => u.id === id);
  };

  // Helper functions
  const getActivitiesForProject = (projectId: string): Activity[] => {
    return activities.filter(a => a.projectId === projectId).sort((a, b) => a.order - b.order);
  };

  const getTasksForActivity = (activityId: string): Task[] => {
    return tasks.filter(t => t.activityId === activityId).sort((a, b) => a.order - b.order);
  };

  const getProjectById = (projectId: string): Project | undefined => {
    return projects.find(p => p.id === projectId);
  };

  const getActivityById = (activityId: string): Activity | undefined => {
    return activities.find(a => a.id === activityId);
  };

  const getTaskById = (taskId: string): Task | undefined => {
    return tasks.find(t => t.id === taskId);
  };

  // Mock suppliers
  const [suppliers, setSuppliers] = useState<Supplier[]>([
    {
      id: 'sup-1',
      name: 'Amazon AWS',
      email: 'aws-billing@amazon.com',
      verified: true,
      purchaseCount: 12,
      totalSpent: 8400,
    },
    {
      id: 'sup-2',
      name: 'TechSupplies Ltd',
      contact: 'John Smith',
      email: 'orders@techsupplies.com',
      phone: '+353 1 234 5678',
      verified: true,
      purchaseCount: 8,
      totalSpent: 3200,
    },
    {
      id: 'sup-3',
      name: 'OfficeDepot',
      email: 'corporate@officedepot.com',
      verified: true,
      purchaseCount: 15,
      totalSpent: 5600,
    },
  ]);

  // Load spending requests from API
  const [requests, setRequests] = useState<SpendingRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  useEffect(() => {
    async function loadRequests() {
      try {
        setLoadingRequests(true);
        const { getExpenses } = await import('../services/expensesApi');
        const { formatDate } = await import('../services/apiClient');

        // Get expenses from last 6 months
        const endDate = new Date();
        const startDate = new Date();
        startDate.setMonth(startDate.getMonth() - 6);

        const apiExpenses = await getExpenses({
          startDate: formatDate(startDate),
          endDate: formatDate(endDate),
        });

        // Transform expenses to SpendingRequest format
        const transformedRequests: SpendingRequest[] = apiExpenses.map(exp => {
          const statusMap: Record<number, SpendingRequestStatus> = {
            0: 'Draft',
            1: 'Approved',
            2: 'Denied',
          };

          return {
            id: exp.id,
            type: 'Expense',
            referenceNumber: `EXP-${exp.id.slice(0, 8).toUpperCase()}`,
            userId: exp.creator.id,
            status: statusMap[exp.status] || 'Draft',
            purpose: exp.description,
            project: exp.project?.name || '',
            costCenter: '', // Not in API
            lineItems: exp.items.map(item => ({
              id: item.id,
              description: item.description,
              costType: exp.category,
              amount: parseFloat(item.amount),
              currency: exp.currency.symbol,
              vat: 0, // Not in API
              vatRate: 0,
              date: exp.date,
              paidBy: 'Employee',
            })),
            subtotal: parseFloat(exp.amount),
            totalVat: 0,
            total: parseFloat(exp.amount),
            currencies: [exp.currency.id],
            createdAt: exp.createdAt || new Date().toISOString(),
            updatedAt: exp.updatedAt || new Date().toISOString(),
          };
        });

        setRequests(transformedRequests);
      } catch (error) {
        console.error('Error loading spending requests:', error);
        setRequests([]);
      } finally {
        setLoadingRequests(false);
      }
    }

    if (currentUser) {
      loadRequests();
    }
  }, [currentUser]);

  const createRequest = (type: SpendingType): SpendingRequest => {
    const now = new Date().toISOString();
    const count = requests.filter(r => r.type === type).length + 1;
    const prefix = type === 'Expense' ? 'EXP' : 'PUR';
    
    const newRequest: SpendingRequest = {
      id: `${prefix.toLowerCase()}-${Date.now()}`,
      type,
      referenceNumber: `${prefix}-2024-${String(count).padStart(4, '0')}`,
      userId: currentUser?.id || 'user-1',
      status: 'Draft',
      purpose: '',
      lineItems: [],
      subtotal: 0,
      totalVat: 0,
      total: 0,
      currencies: [],
      createdAt: now,
      updatedAt: now,
    };
    
    setRequests(prev => [newRequest, ...prev]);
    return newRequest;
  };

  const updateRequest = (id: string, updates: Partial<SpendingRequest>) => {
    setRequests(prev => prev.map(req => {
      if (req.id === id) {
        const updated = { ...req, ...updates, updatedAt: new Date().toISOString() };
        
        // Recalculate totals if line items changed
        if (updates.lineItems) {
          const currencies = [...new Set(updates.lineItems.map(item => item.currency))];
          const subtotal = updates.lineItems.reduce((sum, item) => sum + item.amount, 0);
          const totalVat = updates.lineItems.reduce((sum, item) => sum + item.vat, 0);
          const total = subtotal + totalVat;
          
          updated.currencies = currencies;
          updated.subtotal = subtotal;
          updated.totalVat = totalVat;
          updated.total = total;
        }
        
        return updated;
      }
      return req;
    }));
  };

  const deleteRequest = (id: string) => {
    setRequests(prev => prev.filter(req => req.id !== id));
  };

  const submitRequest = (id: string) => {
    setRequests(prev => prev.map(req => {
      if (req.id === id) {
        return {
          ...req,
          status: 'Pending',
          submittedDate: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
      return req;
    }));
  };

  const approveRequest = (id: string, comment?: string) => {
    setRequests(prev => prev.map(req => {
      if (req.id === id) {
        return {
          ...req,
          status: 'Approved',
          approvedDate: new Date().toISOString(),
          approvedBy: currentUser?.id || 'user-1',
          managerComment: comment,
          updatedAt: new Date().toISOString(),
        };
      }
      return req;
    }));
  };

  const denyRequest = (id: string, reason: string, comment?: string) => {
    setRequests(prev => prev.map(req => {
      if (req.id === id) {
        return {
          ...req,
          status: 'Denied',
          deniedDate: new Date().toISOString(),
          deniedBy: currentUser?.id || 'user-1',
          denialReason: reason,
          managerComment: comment,
          updatedAt: new Date().toISOString(),
        };
      }
      return req;
    }));
  };

  const addLineItem = (requestId: string, item: Omit<SpendingLineItem, 'id'>) => {
    const newItem: SpendingLineItem = {
      ...item,
      id: `item-${Date.now()}`,
    };
    
    setRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        const lineItems = [...req.lineItems, newItem];
        const currencies = [...new Set(lineItems.map(item => item.currency))];
        const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
        const totalVat = lineItems.reduce((sum, item) => sum + item.vat, 0);
        const total = subtotal + totalVat;
        
        return {
          ...req,
          lineItems,
          currencies,
          subtotal,
          totalVat,
          total,
          updatedAt: new Date().toISOString(),
        };
      }
      return req;
    }));
  };

  const updateLineItem = (requestId: string, itemId: string, updates: Partial<SpendingLineItem>) => {
    setRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        const lineItems = req.lineItems.map(item => {
          if (item.id === itemId) {
            return { ...item, ...updates };
          }
          return item;
        });
        
        const currencies = [...new Set(lineItems.map(item => item.currency))];
        const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
        const totalVat = lineItems.reduce((sum, item) => sum + item.vat, 0);
        const total = subtotal + totalVat;
        
        return {
          ...req,
          lineItems,
          currencies,
          subtotal,
          totalVat,
          total,
          updatedAt: new Date().toISOString(),
        };
      }
      return req;
    }));
  };

  const deleteLineItem = (requestId: string, itemId: string) => {
    setRequests(prev => prev.map(req => {
      if (req.id === requestId) {
        const lineItems = req.lineItems.filter(item => item.id !== itemId);
        const currencies = [...new Set(lineItems.map(item => item.currency))];
        const subtotal = lineItems.reduce((sum, item) => sum + item.amount, 0);
        const totalVat = lineItems.reduce((sum, item) => sum + item.vat, 0);
        const total = subtotal + totalVat;
        
        return {
          ...req,
          lineItems,
          currencies,
          subtotal,
          totalVat,
          total,
          updatedAt: new Date().toISOString(),
        };
      }
      return req;
    }));
  };

  const addSupplier = (supplier: Omit<Supplier, 'id' | 'purchaseCount' | 'totalSpent'>) => {
    const newSupplier: Supplier = {
      ...supplier,
      id: `sup-${Date.now()}`,
      purchaseCount: 0,
      totalSpent: 0,
    };
    setSuppliers(prev => [...prev, newSupplier]);
  };

  // Processing actions
  const startProcessing = (id: string) => {
    setRequests(prev => prev.map(req => {
      if (req.id === id) {
        return {
          ...req,
          status: 'Processing' as SpendingStatus,
          processingStartedDate: new Date().toISOString(),
          processingStartedBy: currentUser?.id || 'user-1',
          updatedAt: new Date().toISOString(),
        };
      }
      return req;
    }));
  };

  const markAsOrdered = (id: string, poNumber?: string, expectedDeliveryDate?: string, notes?: string) => {
    setRequests(prev => prev.map(req => {
      if (req.id === id) {
        return {
          ...req,
          status: 'Ordered' as SpendingStatus,
          poNumber,
          expectedDeliveryDate,
          orderNotes: notes,
          orderedDate: new Date().toISOString(),
          orderedBy: currentUser?.id || 'user-1',
          updatedAt: new Date().toISOString(),
        };
      }
      return req;
    }));
  };

  const markAsReceived = (id: string, receivedDate: string, receivedInFull: boolean, notes?: string) => {
    setRequests(prev => prev.map(req => {
      if (req.id === id) {
        return {
          ...req,
          status: 'Received' as SpendingStatus,
          receivedDate,
          receivedInFull,
          receiveNotes: notes,
          receivedBy: currentUser?.id || 'user-1',
          completedDate: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
      return req;
    }));
  };

  const markAsFinalized = (id: string, paymentReference?: string, paymentDate?: string, notes?: string) => {
    setRequests(prev => prev.map(req => {
      if (req.id === id) {
        return {
          ...req,
          status: 'Finalized' as SpendingStatus,
          paymentReference,
          paymentDate: paymentDate || new Date().toISOString().split('T')[0],
          finalizationNotes: notes,
          finalizedDate: new Date().toISOString(),
          finalizedBy: currentUser?.id || 'user-1',
          completedDate: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
      }
      return req;
    }));
  };

  return (
    <SpendingContext.Provider
      value={{
        requests,
        suppliers,
        projects,
        activities,
        tasks,
        users,
        currentUser,
        getUserById,
        getActivitiesForProject,
        getTasksForActivity,
        getProjectById,
        getActivityById,
        getTaskById,
        createRequest,
        updateRequest,
        deleteRequest,
        submitRequest,
        approveRequest,
        denyRequest,
        addLineItem,
        updateLineItem,
        deleteLineItem,
        addSupplier,
        startProcessing,
        markAsOrdered,
        markAsReceived,
        markAsFinalized,
      }}
    >
      {children}
    </SpendingContext.Provider>
  );
}

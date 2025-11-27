import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Receipt, ShoppingCart, Palmtree, User, Coffee, Plane, Car, Home, Laptop, Package } from 'lucide-react';

export type SpendingType = 'Expense' | 'Purchase';

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
}

export interface SpendingRequest {
  id: string;
  type: SpendingType;
  referenceNumber: string;
  userId: string;
  status: SpendingStatus;
  purpose: string;
  project?: string;
  costCenter?: string;
  office?: string;
  department?: string;
  isAsap?: boolean;
  
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

interface SpendingContextType {
  requests: SpendingRequest[];
  suppliers: Supplier[];
  currentUser: {
    id: string;
    name: string;
    isManager: boolean;
    isExpenseAdmin: boolean;
    isPurchaseAdmin: boolean;
    directReports: string[];
  };
  
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
  // Mock current user
  const currentUser = {
    id: 'user-1',
    name: 'Colm Test',
    isManager: true,
    isExpenseAdmin: true,
    isPurchaseAdmin: true,
    directReports: ['user-2', 'user-3', 'user-4'],
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

  // Mock spending requests
  const [requests, setRequests] = useState<SpendingRequest[]>([
    // User's expenses
    {
      id: 'exp-1',
      type: 'Expense',
      referenceNumber: 'EXP-2024-0089',
      userId: 'user-1',
      status: 'Draft',
      purpose: 'Client dinner - BIOGEMSE project kickoff',
      project: 'BIOGEMSE',
      costCenter: 'Marketing',
      lineItems: [
        {
          id: 'item-1',
          description: 'Restaurant bill',
          costType: 'Meals',
          amount: 180,
          currency: 'EUR',
          vat: 20,
          vatRate: 11,
          date: '2025-11-20',
          paidBy: 'Employee',
          receiptUrl: '/receipts/receipt1.pdf',
          receiptFilename: 'restaurant_receipt.pdf',
        },
        {
          id: 'item-2',
          description: 'Taxi to restaurant',
          costType: 'Travel',
          amount: 25,
          currency: 'EUR',
          vat: 5,
          vatRate: 20,
          date: '2025-11-20',
          paidBy: 'Employee',
          receiptUrl: '/receipts/taxi1.jpg',
          receiptFilename: 'taxi_receipt.jpg',
        },
        {
          id: 'item-3',
          description: 'Parking',
          costType: 'Travel',
          amount: 15,
          currency: 'EUR',
          vat: 0,
          vatRate: 0,
          date: '2025-11-20',
          paidBy: 'Employee',
        },
      ],
      subtotal: 220,
      totalVat: 25,
      total: 245,
      currencies: ['EUR'],
      createdAt: '2025-11-25T10:30:00Z',
      updatedAt: '2025-11-25T10:30:00Z',
    },
    {
      id: 'exp-2',
      type: 'Expense',
      referenceNumber: 'EXP-2024-0088',
      userId: 'user-1',
      status: 'Pending',
      purpose: 'Travel - Barcelona conference',
      project: 'CORE',
      costCenter: 'Engineering',
      lineItems: [
        {
          id: 'item-4',
          description: 'Flight Dublin-Barcelona',
          costType: 'Travel',
          amount: 450,
          currency: 'EUR',
          vat: 0,
          vatRate: 0,
          date: '2025-11-15',
          paidBy: 'Employee',
          receiptUrl: '/receipts/flight.pdf',
          receiptFilename: 'flight_ticket.pdf',
        },
        {
          id: 'item-5',
          description: 'Hotel - 3 nights',
          costType: 'Accommodation',
          amount: 720,
          currency: 'EUR',
          vat: 75.6,
          vatRate: 10.5,
          date: '2025-11-15',
          paidBy: 'Employee',
          receiptUrl: '/receipts/hotel.pdf',
          receiptFilename: 'hotel_invoice.pdf',
        },
        {
          id: 'item-6',
          description: 'Conference dinner',
          costType: 'Meals',
          amount: 89,
          currency: 'USD',
          vat: 0,
          vatRate: 0,
          date: '2025-11-16',
          paidBy: 'Employee',
        },
      ],
      subtotal: 1259,
      totalVat: 75.6,
      total: 1334.6,
      currencies: ['EUR', 'USD'],
      submittedDate: '2025-11-22T14:20:00Z',
      createdAt: '2025-11-20T09:15:00Z',
      updatedAt: '2025-11-22T14:20:00Z',
    },
    {
      id: 'exp-3',
      type: 'Expense',
      referenceNumber: 'EXP-2024-0087',
      userId: 'user-1',
      status: 'Pending',
      purpose: 'Training materials',
      costCenter: 'Engineering',
      lineItems: [
        {
          id: 'item-7',
          description: 'Online course - React Advanced',
          costType: 'Training',
          amount: 89,
          currency: 'EUR',
          vat: 0,
          vatRate: 0,
          date: '2025-11-18',
          paidBy: 'Employee',
          receiptUrl: '/receipts/course.pdf',
          receiptFilename: 'course_receipt.pdf',
        },
      ],
      subtotal: 89,
      totalVat: 0,
      total: 89,
      currencies: ['EUR'],
      submittedDate: '2025-11-20T11:00:00Z',
      createdAt: '2025-11-18T16:45:00Z',
      updatedAt: '2025-11-20T11:00:00Z',
    },
    
    // Team expenses (pending approval)
    {
      id: 'exp-4',
      type: 'Expense',
      referenceNumber: 'EXP-2024-0085',
      userId: 'user-2',
      status: 'Pending',
      purpose: 'Client entertainment',
      project: 'BIOGEMSE',
      costCenter: 'Marketing',
      lineItems: [
        {
          id: 'item-8',
          description: 'Restaurant bill',
          costType: 'Entertainment',
          amount: 280,
          currency: 'EUR',
          vat: 0,
          vatRate: 0,
          date: '2025-11-15',
          paidBy: 'Employee',
          receiptUrl: '/receipts/receipt.pdf',
          receiptFilename: 'receipt.pdf',
        },
        {
          id: 'item-9',
          description: 'Taxi',
          costType: 'Travel',
          amount: 45,
          currency: 'EUR',
          vat: 5,
          vatRate: 11,
          date: '2025-11-15',
          paidBy: 'Employee',
          receiptUrl: '/receipts/taxi_receipt.jpg',
          receiptFilename: 'taxi_receipt.jpg',
        },
        {
          id: 'item-10',
          description: 'Tips',
          costType: 'Entertainment',
          amount: 15,
          currency: 'EUR',
          vat: 0,
          vatRate: 0,
          date: '2025-11-15',
          paidBy: 'Employee',
        },
      ],
      subtotal: 340,
      totalVat: 5,
      total: 345,
      currencies: ['EUR'],
      submittedDate: '2025-11-19T10:30:00Z',
      createdAt: '2025-11-18T14:20:00Z',
      updatedAt: '2025-11-19T10:30:00Z',
    },
    
    // User's purchases
    {
      id: 'pur-1',
      type: 'Purchase',
      referenceNumber: 'PUR-2024-0156',
      userId: 'user-1',
      status: 'Draft',
      purpose: 'Office supplies - Q4',
      project: 'General',
      office: 'Barcelona',
      department: 'Operations',
      isAsap: true,
      lineItems: [
        {
          id: 'item-11',
          description: 'Ergonomic keyboard',
          costType: 'Equipment',
          supplier: 'TechSupplies Ltd',
          sku: 'KB-ERGO-001',
          quantity: 5,
          unitPrice: 89,
          amount: 445,
          currency: 'EUR',
          vat: 93.45,
          vatRate: 21,
          date: '2025-11-24',
        },
        {
          id: 'item-12',
          description: 'Monitor stand',
          costType: 'Equipment',
          supplier: 'OfficeDepot',
          sku: 'MS-ADJ-002',
          quantity: 5,
          unitPrice: 45,
          amount: 225,
          currency: 'EUR',
          vat: 47.25,
          vatRate: 21,
          date: '2025-11-24',
        },
        {
          id: 'item-13',
          description: 'USB-C cables',
          costType: 'Office Supplies',
          supplier: 'TechSupplies Ltd',
          sku: 'USBC-2M',
          quantity: 10,
          unitPrice: 12,
          amount: 120,
          currency: 'EUR',
          vat: 25.2,
          vatRate: 21,
          date: '2025-11-24',
        },
      ],
      subtotal: 790,
      totalVat: 165.9,
      total: 955.9,
      currencies: ['EUR'],
      createdAt: '2025-11-24T15:20:00Z',
      updatedAt: '2025-11-24T15:20:00Z',
    },
    
    // Team purchases (pending approval)
    {
      id: 'pur-2',
      type: 'Purchase',
      referenceNumber: 'PUR-2024-0158',
      userId: 'user-3',
      status: 'Pending',
      purpose: 'AWS credits renewal - Annual subscription',
      project: 'Infrastructure',
      office: 'Barcelona',
      department: 'Engineering',
      isAsap: true,
      lineItems: [
        {
          id: 'item-14',
          description: 'AWS Credits - Annual renewal',
          costType: 'Software',
          supplier: 'Amazon AWS',
          sku: 'AWS-CREDITS-2024',
          quantity: 1,
          unitPrice: 1200,
          amount: 1200,
          currency: 'EUR',
          vat: 0,
          vatRate: 0,
          date: '2025-11-24',
        },
      ],
      subtotal: 1200,
      totalVat: 0,
      total: 1200,
      currencies: ['EUR'],
      submittedDate: '2025-11-24T09:15:00Z',
      createdAt: '2025-11-23T16:40:00Z',
      updatedAt: '2025-11-24T09:15:00Z',
    },
    {
      id: 'pur-3',
      type: 'Purchase',
      referenceNumber: 'PUR-2024-0157',
      userId: 'user-4',
      status: 'Pending',
      purpose: 'Design software licenses',
      project: 'Design',
      office: 'Barcelona',
      department: 'Design',
      lineItems: [
        {
          id: 'item-15',
          description: 'Adobe Creative Cloud - 5 licenses',
          costType: 'Software',
          supplier: 'Adobe',
          quantity: 5,
          unitPrice: 60,
          amount: 300,
          currency: 'EUR',
          vat: 63,
          vatRate: 21,
          date: '2025-11-23',
        },
      ],
      subtotal: 300,
      totalVat: 63,
      total: 363,
      currencies: ['EUR'],
      submittedDate: '2025-11-23T14:00:00Z',
      createdAt: '2025-11-22T11:20:00Z',
      updatedAt: '2025-11-23T14:00:00Z',
    },
    
    // Approved/completed items
    {
      id: 'pur-4',
      type: 'Purchase',
      referenceNumber: 'PUR-2024-0155',
      userId: 'user-1',
      status: 'Approved',
      purpose: 'Ergonomic equipment',
      project: 'General',
      office: 'Barcelona',
      department: 'Operations',
      lineItems: [
        {
          id: 'item-16',
          description: 'Standing desks',
          costType: 'Equipment',
          supplier: 'OfficeDepot',
          quantity: 3,
          unitPrice: 450,
          amount: 1350,
          currency: 'EUR',
          vat: 283.5,
          vatRate: 21,
          date: '2025-11-20',
        },
      ],
      subtotal: 1350,
      totalVat: 283.5,
      total: 1633.5,
      currencies: ['EUR'],
      submittedDate: '2025-11-20T10:00:00Z',
      approvedDate: '2025-11-21T09:30:00Z',
      approvedBy: 'manager-1',
      createdAt: '2025-11-19T14:30:00Z',
      updatedAt: '2025-11-21T09:30:00Z',
    },
  ]);

  const createRequest = (type: SpendingType): SpendingRequest => {
    const now = new Date().toISOString();
    const count = requests.filter(r => r.type === type).length + 1;
    const prefix = type === 'Expense' ? 'EXP' : 'PUR';
    
    const newRequest: SpendingRequest = {
      id: `${prefix.toLowerCase()}-${Date.now()}`,
      type,
      referenceNumber: `${prefix}-2024-${String(count).padStart(4, '0')}`,
      userId: currentUser.id,
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
          approvedBy: currentUser.id,
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
          deniedBy: currentUser.id,
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

  return (
    <SpendingContext.Provider
      value={{
        requests,
        suppliers,
        currentUser,
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
      }}
    >
      {children}
    </SpendingContext.Provider>
  );
}

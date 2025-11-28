import React, { createContext, useContext, useState, ReactNode } from 'react';

export type InvoiceStatus = 'draft' | 'pending' | 'paid' | 'cancelled';

export interface TimeEntry {
  id: string;
  date: string;
  personName: string;
  taskName: string;
  hours: number;
  rate: number;
  amount: number;
  taxable: boolean;
  selected?: boolean;
}

export interface Expense {
  id: string;
  date: string;
  description: string;
  amount: number;
  taxable: boolean;
  selected?: boolean;
}

export interface Milestone {
  id: string;
  name: string;
  deliveryDate: string;
  amount: number;
  taxable: boolean;
  selected?: boolean;
}

export interface AdditionalItem {
  id: string;
  description: string;
  amount: number;
  taxable: boolean;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  clientEmail?: string;
  clientAddress?: string;
  projectName: string;
  projectId?: string;
  invoiceDate: string;
  dueDate: string;
  poNumber?: string;
  invoiceTitle?: string;
  status: InvoiceStatus;
  taxRate: number;
  paymentTerms: string;
  timeEntryFormat?: 'grouped-person-task' | 'grouped-task' | 'detailed';
  expenseFormat?: 'detailed' | 'combined';
  timeEntries: TimeEntry[];
  expenses: Expense[];
  milestones: Milestone[];
  additionalItems: AdditionalItem[];
  notes?: string;
  subtotal: number;
  taxAmount: number;
  total: number;
  createdAt: string;
  updatedAt: string;
  paidDate?: string;
  paymentReference?: string;
  paymentNotes?: string;
  billablePeriodStart?: string;
  billablePeriodEnd?: string;
}

export interface BillingSettings {
  companyName: string;
  companyLogo?: string;
  companyAddress: string;
  vatNumber?: string;
  bankName?: string;
  iban?: string;
  paymentInstructions?: string;
  defaultTaxRate: number;
  defaultPaymentTerms: string;
  defaultTimeEntryFormat: 'grouped-person-task' | 'grouped-task' | 'detailed';
  defaultExpenseFormat: 'detailed' | 'combined';
  defaultCurrency: string;
  invoicePrefix: string;
  includeYear: boolean;
  nextNumber: number;
}

interface BillingContextType {
  invoices: Invoice[];
  settings: BillingSettings;
  addInvoice: (invoice: Invoice) => void;
  updateInvoice: (id: string, updates: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  markInvoiceAsPaid: (id: string, paymentDate?: string, reference?: string, notes?: string) => void;
  cancelInvoice: (id: string) => void;
  updateSettings: (settings: Partial<BillingSettings>) => void;
  getNextInvoiceNumber: () => string;
}

const BillingContext = createContext<BillingContextType | undefined>(undefined);

export const useBilling = () => {
  const context = useContext(BillingContext);
  if (!context) {
    throw new Error('useBilling must be used within BillingProvider');
  }
  return context;
};

// Mock data generator
const generateMockInvoices = (): Invoice[] => {
  return [
    {
      id: 'inv-001',
      invoiceNumber: 'INV-2024-001',
      clientName: 'Acme Corporation',
      clientEmail: 'billing@acme.com',
      clientAddress: '123 Business St\nSan Francisco, CA 94105',
      projectName: 'Website Redesign',
      projectId: 'proj-001',
      invoiceDate: '2024-01-15',
      dueDate: '2024-02-14',
      poNumber: 'PO-45678',
      status: 'paid',
      taxRate: 21,
      paymentTerms: 'NET 30',
      timeEntryFormat: 'grouped-person-task',
      expenseFormat: 'detailed',
      timeEntries: [],
      expenses: [],
      milestones: [],
      additionalItems: [],
      notes: 'Thank you for your business!',
      subtotal: 15000,
      taxAmount: 3150,
      total: 18150,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z',
      paidDate: '2024-02-10',
    },
    {
      id: 'inv-002',
      invoiceNumber: 'INV-2024-002',
      clientName: 'TechStart Inc',
      clientEmail: 'accounts@techstart.io',
      clientAddress: '456 Innovation Ave\nAustin, TX 78701',
      projectName: 'Mobile App Development',
      projectId: 'proj-002',
      invoiceDate: '2024-02-01',
      dueDate: '2024-03-02',
      status: 'paid',
      taxRate: 21,
      paymentTerms: 'NET 30',
      timeEntryFormat: 'detailed',
      expenseFormat: 'detailed',
      timeEntries: [],
      expenses: [],
      milestones: [],
      additionalItems: [],
      notes: 'Payment due within 30 days.',
      subtotal: 24000,
      taxAmount: 5040,
      total: 29040,
      createdAt: '2024-02-01T09:00:00Z',
      updatedAt: '2024-02-01T09:00:00Z',
      paidDate: '2024-02-28',
    },
    {
      id: 'inv-003',
      invoiceNumber: 'INV-2024-003',
      clientName: 'Global Solutions Ltd',
      clientEmail: 'finance@globalsolutions.com',
      clientAddress: '789 Enterprise Blvd\nNew York, NY 10001',
      projectName: 'CRM Integration',
      projectId: 'proj-003',
      invoiceDate: '2024-11-01',
      dueDate: '2024-11-15',
      poNumber: 'PO-98765',
      status: 'pending',
      taxRate: 21,
      paymentTerms: 'NET 30',
      timeEntryFormat: 'grouped-task',
      expenseFormat: 'combined',
      timeEntries: [],
      expenses: [],
      milestones: [],
      additionalItems: [],
      notes: 'Wire transfer preferred. Bank details below.',
      subtotal: 18500,
      taxAmount: 3885,
      total: 22385,
      createdAt: '2024-11-01T14:00:00Z',
      updatedAt: '2024-11-01T14:00:00Z',
    },
    {
      id: 'inv-004',
      invoiceNumber: 'INV-2024-004',
      clientName: 'Innovate Labs',
      clientEmail: 'billing@innovatelabs.co',
      projectName: 'Dashboard Analytics',
      projectId: 'proj-004',
      invoiceDate: '2024-11-20',
      dueDate: '2025-01-19',
      status: 'draft',
      taxRate: 21,
      paymentTerms: 'NET 60',
      timeEntryFormat: 'grouped-person-task',
      expenseFormat: 'detailed',
      timeEntries: [],
      expenses: [],
      milestones: [],
      additionalItems: [],
      subtotal: 12000,
      taxAmount: 2520,
      total: 14520,
      createdAt: '2024-11-20T11:00:00Z',
      updatedAt: '2024-11-20T11:00:00Z',
    },
    {
      id: 'inv-005',
      invoiceNumber: 'INV-2024-005',
      clientName: 'Startup Ventures',
      clientEmail: 'accounts@startupventures.io',
      projectName: 'MVP Development',
      projectId: 'proj-005',
      invoiceDate: '2024-10-15',
      dueDate: '2024-11-14',
      status: 'cancelled',
      taxRate: 21,
      paymentTerms: 'NET 30',
      timeEntries: [],
      expenses: [],
      milestones: [],
      additionalItems: [],
      subtotal: 8500,
      taxAmount: 1785,
      total: 10285,
      createdAt: '2024-10-15T09:00:00Z',
      updatedAt: '2024-10-20T15:00:00Z',
    },
  ];
};

const defaultSettings: BillingSettings = {
  companyName: 'Workdeck Inc',
  companyAddress: '100 Market Street\nSan Francisco, CA 94105',
  vatNumber: 'IE-123456789',
  bankName: 'Bank of Ireland',
  iban: 'IE12 BOFI 9000 1234 5678 90',
  paymentInstructions: 'Please include invoice number in payment reference.',
  defaultTaxRate: 21,
  defaultPaymentTerms: 'NET 30',
  defaultTimeEntryFormat: 'grouped-person-task',
  defaultExpenseFormat: 'detailed',
  defaultCurrency: 'EUR',
  invoicePrefix: 'INV-',
  includeYear: true,
  nextNumber: 6,
};

const loadSettingsFromStorage = (): BillingSettings => {
  try {
    const stored = localStorage.getItem('billingSettings');
    if (stored) {
      return { ...defaultSettings, ...JSON.parse(stored) };
    }
  } catch (e) {
    console.error('Failed to load billing settings from localStorage:', e);
  }
  return defaultSettings;
};

export const BillingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [invoices, setInvoices] = useState<Invoice[]>(generateMockInvoices());
  const [settings, setSettings] = useState<BillingSettings>(loadSettingsFromStorage);

  const addInvoice = (invoice: Invoice) => {
    setInvoices(prev => [invoice, ...prev]);
    setSettings(prev => ({ ...prev, nextNumber: prev.nextNumber + 1 }));
  };

  const updateInvoice = (id: string, updates: Partial<Invoice>) => {
    setInvoices(prev =>
      prev.map(inv =>
        inv.id === id
          ? { ...inv, ...updates, updatedAt: new Date().toISOString() }
          : inv
      )
    );
  };

  const deleteInvoice = (id: string) => {
    setInvoices(prev => prev.filter(inv => inv.id !== id));
  };

  const markInvoiceAsPaid = (id: string, paymentDate?: string, reference?: string, notes?: string) => {
    updateInvoice(id, {
      status: 'paid',
      paidDate: paymentDate || new Date().toISOString().split('T')[0],
      paymentReference: reference,
      paymentNotes: notes,
    });
  };

  const cancelInvoice = (id: string) => {
    updateInvoice(id, { status: 'cancelled' });
  };

  const updateSettings = (newSettings: Partial<BillingSettings>) => {
    setSettings(prev => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem('billingSettings', JSON.stringify(updated));
      } catch (e) {
        console.error('Failed to save billing settings to localStorage:', e);
      }
      return updated;
    });
  };

  const getNextInvoiceNumber = (): string => {
    const { invoicePrefix, includeYear, nextNumber } = settings;
    const year = includeYear ? `${new Date().getFullYear()}-` : '';
    const number = String(nextNumber).padStart(3, '0');
    return `${invoicePrefix}${year}${number}`;
  };

  return (
    <BillingContext.Provider
      value={{
        invoices,
        settings,
        addInvoice,
        updateInvoice,
        deleteInvoice,
        markInvoiceAsPaid,
        cancelInvoice,
        updateSettings,
        getNextInvoiceNumber,
      }}
    >
      {children}
    </BillingContext.Provider>
  );
};

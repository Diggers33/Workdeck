import React, { useState, useEffect } from 'react';
import { ArrowLeft, ChevronDown, ChevronRight, Plus, Trash2 } from 'lucide-react';
import { Invoice, TimeEntry, Expense, Milestone, AdditionalItem, useBilling } from '../../../contexts/BillingContext';

interface InvoiceCreationFlowProps {
  invoiceId?: string | null;
  onCancel: () => void;
  onComplete: (invoiceId: string) => void;
}

export type InvoiceFormData = Partial<Invoice>;

// Mock data for demonstration
const mockTimeEntries: TimeEntry[] = [
  { id: 't1', date: '2024-11-01', personName: 'Sarah Chen', taskName: 'UI Design', hours: 8, rate: 125, amount: 1000, taxable: true, selected: true },
  { id: 't2', date: '2024-11-02', personName: 'Sarah Chen', taskName: 'UI Design', hours: 6, rate: 125, amount: 750, taxable: true, selected: true },
  { id: 't3', date: '2024-11-03', personName: 'Mike Torres', taskName: 'Frontend Development', hours: 8, rate: 150, amount: 1200, taxable: true, selected: true },
  { id: 't4', date: '2024-11-04', personName: 'Mike Torres', taskName: 'Frontend Development', hours: 8, rate: 150, amount: 1200, taxable: true, selected: true },
  { id: 't5', date: '2024-11-05', personName: 'Emma Wilson', taskName: 'Backend Development', hours: 7, rate: 160, amount: 1120, taxable: true, selected: true },
];

const mockExpenses: Expense[] = [
  { id: 'e1', date: '2024-11-10', description: 'Stock photography licenses', amount: 250, taxable: false, selected: true },
  { id: 'e2', date: '2024-11-15', description: 'Cloud hosting (3 months)', amount: 450, taxable: true, selected: true },
  { id: 'e3', date: '2024-11-20', description: 'Font licenses', amount: 180, taxable: false, selected: true },
];

const mockMilestones: Milestone[] = [
  { id: 'm1', name: 'Design System Completion', deliveryDate: '2024-11-15', amount: 5000, taxable: true, selected: true },
  { id: 'm2', name: 'MVP Launch', deliveryDate: '2024-11-30', amount: 8000, taxable: true, selected: true },
];

export const InvoiceCreationFlow: React.FC<InvoiceCreationFlowProps> = ({
  invoiceId,
  onCancel,
  onComplete,
}) => {
  const [formData, setFormData] = useState<InvoiceFormData>({});
  const { invoices, addInvoice, updateInvoice, settings, getNextInvoiceNumber } = useBilling();

  const [expandedSections, setExpandedSections] = useState({
    timeEntries: false,
    expenses: false,
    milestones: false,
    additional: false,
  });

  // Load existing invoice for editing or initialize new
  useEffect(() => {
    if (invoiceId) {
      const invoice = invoices.find(inv => inv.id === invoiceId);
      if (invoice) {
        setFormData(invoice);
        // Expand sections if they have data
        setExpandedSections({
          timeEntries: (invoice.timeEntries?.length || 0) > 0,
          expenses: (invoice.expenses?.length || 0) > 0,
          milestones: (invoice.milestones?.length || 0) > 0,
          additional: (invoice.additionalItems?.length || 0) > 0,
        });
      }
    } else {
      setFormData({
        invoiceNumber: getNextInvoiceNumber(),
        invoiceDate: new Date().toISOString().split('T')[0],
        taxRate: settings.defaultTaxRate,
        paymentTerms: settings.defaultPaymentTerms,
        timeEntryFormat: settings.defaultTimeEntryFormat,
        expenseFormat: settings.defaultExpenseFormat,
        timeEntries: [],
        expenses: [],
        milestones: [],
        additionalItems: [],
      });
    }
  }, [invoiceId, invoices]);

  // Calculate due date based on payment terms
  useEffect(() => {
    if (formData.invoiceDate && formData.paymentTerms) {
      const invoiceDate = new Date(formData.invoiceDate);
      const terms = formData.paymentTerms.replace('NET ', '');
      const days = parseInt(terms);
      const dueDate = new Date(invoiceDate);
      dueDate.setDate(dueDate.getDate() + days);
      setFormData(prev => ({ ...prev, dueDate: dueDate.toISOString().split('T')[0] }));
    }
  }, [formData.invoiceDate, formData.paymentTerms]);

  // Load mock data when project is selected
  useEffect(() => {
    if (formData.projectName && (!formData.timeEntries || formData.timeEntries.length === 0)) {
      setFormData(prev => ({
        ...prev,
        timeEntries: mockTimeEntries,
        expenses: mockExpenses,
        milestones: mockMilestones,
      }));
      setExpandedSections({
        timeEntries: true,
        expenses: true,
        milestones: true,
        additional: false,
      });
    }
  }, [formData.projectName]);

  const updateFormData = (data: Partial<InvoiceFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Time entries handlers
  const toggleAllTimeEntries = (selected: boolean) => {
    const updated = (formData.timeEntries || []).map(entry => ({ ...entry, selected }));
    updateFormData({ timeEntries: updated });
  };

  const toggleTimeEntry = (id: string) => {
    const updated = (formData.timeEntries || []).map(entry =>
      entry.id === id ? { ...entry, selected: !entry.selected } : entry
    );
    updateFormData({ timeEntries: updated });
  };

  // Expenses handlers
  const toggleAllExpenses = (selected: boolean) => {
    const updated = (formData.expenses || []).map(exp => ({ ...exp, selected }));
    updateFormData({ expenses: updated });
  };

  const toggleExpense = (id: string) => {
    const updated = (formData.expenses || []).map(exp =>
      exp.id === id ? { ...exp, selected: !exp.selected } : exp
    );
    updateFormData({ expenses: updated });
  };

  const toggleExpenseTaxable = (id: string) => {
    const updated = (formData.expenses || []).map(exp =>
      exp.id === id ? { ...exp, taxable: !exp.taxable } : exp
    );
    updateFormData({ expenses: updated });
  };

  // Milestones handlers
  const toggleAllMilestones = (selected: boolean) => {
    const updated = (formData.milestones || []).map(m => ({ ...m, selected }));
    updateFormData({ milestones: updated });
  };

  const toggleMilestone = (id: string) => {
    const updated = (formData.milestones || []).map(m =>
      m.id === id ? { ...m, selected: !m.selected } : m
    );
    updateFormData({ milestones: updated });
  };

  const updateMilestoneAmount = (id: string, amount: number) => {
    const updated = (formData.milestones || []).map(m =>
      m.id === id ? { ...m, amount } : m
    );
    updateFormData({ milestones: updated });
  };

  const toggleMilestoneTaxable = (id: string) => {
    const updated = (formData.milestones || []).map(m =>
      m.id === id ? { ...m, taxable: !m.taxable } : m
    );
    updateFormData({ milestones: updated });
  };

  // Additional items handlers
  const addAdditionalItem = () => {
    const newItem: AdditionalItem = {
      id: `add-${Date.now()}`,
      description: '',
      amount: 0,
      taxable: true,
    };
    updateFormData({ additionalItems: [...(formData.additionalItems || []), newItem] });
    setExpandedSections(prev => ({ ...prev, additional: true }));
  };

  const updateAdditionalItem = (id: string, updates: Partial<AdditionalItem>) => {
    const updated = (formData.additionalItems || []).map(item =>
      item.id === id ? { ...item, ...updates } : item
    );
    updateFormData({ additionalItems: updated });
  };

  const deleteAdditionalItem = (id: string) => {
    const updated = (formData.additionalItems || []).filter(item => item.id !== id);
    updateFormData({ additionalItems: updated });
  };

  // Calculate totals
  const timeEntriesTotal = (formData.timeEntries || [])
    .filter(entry => entry.selected)
    .reduce((sum, entry) => sum + entry.amount, 0);
  const timeEntriesHours = (formData.timeEntries || [])
    .filter(entry => entry.selected)
    .reduce((sum, entry) => sum + entry.hours, 0);
  const timeEntriesCount = (formData.timeEntries || []).filter(e => e.selected).length;

  const expensesTotal = (formData.expenses || [])
    .filter(exp => exp.selected)
    .reduce((sum, exp) => sum + exp.amount, 0);
  const expensesCount = (formData.expenses || []).filter(e => e.selected).length;

  const milestonesTotal = (formData.milestones || [])
    .filter(m => m.selected)
    .reduce((sum, m) => sum + m.amount, 0);
  const milestonesCount = (formData.milestones || []).filter(m => m.selected).length;

  const additionalTotal = (formData.additionalItems || [])
    .reduce((sum, item) => sum + item.amount, 0);

  const subtotal = timeEntriesTotal + expensesTotal + milestonesTotal + additionalTotal;
  const taxAmount = subtotal * ((formData.taxRate || 0) / 100);
  const total = subtotal + taxAmount;

  const formatCurrency = (amount: number) => {
    return `€${amount.toLocaleString('en-IE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDateDisplay = (dateString: string | undefined) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleSaveDraft = () => {
    const now = new Date().toISOString();
    const invoiceData: Invoice = {
      id: invoiceId || `INV-${Date.now()}`,
      invoiceNumber: formData.invoiceNumber || '',
      clientName: formData.clientName || '',
      projectName: formData.projectName || '',
      invoiceDate: formData.invoiceDate || new Date().toISOString().split('T')[0],
      dueDate: formData.dueDate || '',
      status: 'draft',
      timeEntries: formData.timeEntries || [],
      expenses: formData.expenses || [],
      milestones: formData.milestones || [],
      additionalItems: formData.additionalItems || [],
      subtotal,
      taxRate: formData.taxRate || 0,
      taxAmount,
      total,
      notes: formData.notes || '',
      billablePeriodStart: formData.billablePeriodStart,
      billablePeriodEnd: formData.billablePeriodEnd,
      poNumber: formData.poNumber,
      invoiceTitle: formData.invoiceTitle,
      paymentTerms: formData.paymentTerms || 'NET 30',
      createdAt: formData.createdAt || now,
      updatedAt: now,
    };

    if (invoiceId) {
      updateInvoice(invoiceId, invoiceData);
    } else {
      addInvoice(invoiceData);
    }
    onCancel();
  };

  const handleSaveInvoice = () => {
    const now = new Date().toISOString();
    const newId = invoiceId || `INV-${Date.now()}`;
    const invoiceData: Invoice = {
      id: newId,
      invoiceNumber: formData.invoiceNumber || '',
      clientName: formData.clientName || '',
      projectName: formData.projectName || '',
      invoiceDate: formData.invoiceDate || new Date().toISOString().split('T')[0],
      dueDate: formData.dueDate || '',
      status: 'draft',
      timeEntries: formData.timeEntries || [],
      expenses: formData.expenses || [],
      milestones: formData.milestones || [],
      additionalItems: formData.additionalItems || [],
      subtotal,
      taxRate: formData.taxRate || 0,
      taxAmount,
      total,
      notes: formData.notes || '',
      billablePeriodStart: formData.billablePeriodStart,
      billablePeriodEnd: formData.billablePeriodEnd,
      poNumber: formData.poNumber,
      invoiceTitle: formData.invoiceTitle,
      paymentTerms: formData.paymentTerms || 'NET 30',
      createdAt: formData.createdAt || now,
      updatedAt: now,
    };

    if (invoiceId) {
      updateInvoice(invoiceId, invoiceData);
      onComplete(invoiceId);
    } else {
      addInvoice(invoiceData);
      onComplete(newId);
    }
  };

  const canSave = formData.clientName && formData.projectName && formData.invoiceNumber;
  const hasLineItems = formData.projectName && (
    (formData.timeEntries?.length || 0) > 0 ||
    (formData.expenses?.length || 0) > 0 ||
    (formData.milestones?.length || 0) > 0
  );

  return (
    <div className="h-full flex flex-col" style={{ backgroundColor: '#FFFFFF' }}>
      {/* Header - 48px */}
      <div
        className="flex-none border-b"
        style={{ borderColor: '#E5E7EB', height: '48px' }}
      >
        <div className="flex items-center justify-between h-full" style={{ padding: '0 20px' }}>
          <div className="flex items-center gap-3">
            <button
              onClick={onCancel}
              className="flex items-center justify-center hover:bg-gray-50 transition-colors rounded"
              style={{ width: '32px', height: '32px', color: '#6B7280' }}
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h1 style={{ fontSize: '18px', fontWeight: 600, color: '#111827' }}>
              {invoiceId ? 'Edit Invoice' : 'New Invoice'}
            </h1>
          </div>
        </div>
      </div>

      {/* Main Content - 2 Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column - Scrollable Form */}
        <div className="flex-1 overflow-y-auto" style={{ backgroundColor: '#F9FAFB' }}>
          <div style={{ padding: '20px', maxWidth: '900px' }}>
            {/* Invoice Setup Section */}
            <div className="bg-white border border-gray-200 rounded-lg" style={{ padding: '20px', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '16px' }}>
                Invoice Setup
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Row 1: Client + Project + Invoice # */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div>
                    <label className="block mb-1.5" style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Client <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <select
                      value={formData.clientName || ''}
                      onChange={(e) => updateFormData({ clientName: e.target.value })}
                      className="w-full px-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-600 bg-white text-gray-900"
                      style={{ height: '40px', fontSize: '14px' }}
                    >
                      <option value="">Select client...</option>
                      <option value="Acme Corporation">Acme Corporation</option>
                      <option value="TechStart Inc">TechStart Inc</option>
                      <option value="Global Solutions Ltd">Global Solutions Ltd</option>
                      <option value="Innovate Labs">Innovate Labs</option>
                      <option value="Startup Ventures">Startup Ventures</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1.5" style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Project <span style={{ color: '#DC2626' }}>*</span>
                    </label>
                    <select
                      value={formData.projectName || ''}
                      onChange={(e) => updateFormData({ projectName: e.target.value })}
                      className="w-full px-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-600 bg-white text-gray-900"
                      style={{ height: '40px', fontSize: '14px' }}
                    >
                      <option value="">Select project...</option>
                      <option value="Website Redesign">Website Redesign</option>
                      <option value="Mobile App Development">Mobile App Development</option>
                      <option value="CRM Integration">CRM Integration</option>
                      <option value="Dashboard Analytics">Dashboard Analytics</option>
                      <option value="MVP Development">MVP Development</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1.5" style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Invoice #
                    </label>
                    <input
                      type="text"
                      value={formData.invoiceNumber || ''}
                      onChange={(e) => updateFormData({ invoiceNumber: e.target.value })}
                      className="w-full px-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-600 text-gray-900"
                      style={{ height: '40px', fontSize: '14px' }}
                    />
                  </div>
                </div>

                {/* Row 2: Invoice Date + PO Number + Invoice Title */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 2fr', gap: '16px' }}>
                  <div>
                    <label className="block mb-1.5" style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Invoice Date
                    </label>
                    <input
                      type="date"
                      value={formData.invoiceDate || ''}
                      onChange={(e) => updateFormData({ invoiceDate: e.target.value })}
                      className="w-full px-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-600 text-gray-900"
                      style={{ height: '40px', fontSize: '14px' }}
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5" style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      PO Number
                    </label>
                    <input
                      type="text"
                      value={formData.poNumber || ''}
                      onChange={(e) => updateFormData({ poNumber: e.target.value })}
                      placeholder="Optional"
                      className="w-full px-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-600 text-gray-900 placeholder-gray-400"
                      style={{ height: '40px', fontSize: '14px' }}
                    />
                  </div>

                  <div>
                    <label className="block mb-1.5" style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Invoice Title
                    </label>
                    <input
                      type="text"
                      value={formData.invoiceTitle || ''}
                      onChange={(e) => updateFormData({ invoiceTitle: e.target.value })}
                      placeholder="e.g., November 2024 Services"
                      className="w-full px-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-600 text-gray-900 placeholder-gray-400"
                      style={{ height: '40px', fontSize: '14px' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Billing Period & Terms Section */}
            <div className="bg-white border border-gray-200 rounded-lg" style={{ padding: '20px', marginBottom: '16px' }}>
              <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '16px' }}>
                Billing Period & Terms
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* Row 1: Billing Period */}
                <div>
                  <label className="block mb-1.5" style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Billing Period
                  </label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <input
                      type="date"
                      value={formData.billablePeriodStart || ''}
                      onChange={(e) => updateFormData({ billablePeriodStart: e.target.value })}
                      className="px-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-600 text-gray-900"
                      style={{ height: '40px', fontSize: '14px', flex: '1' }}
                    />
                    <span style={{ color: '#9CA3AF' }}>→</span>
                    <input
                      type="date"
                      value={formData.billablePeriodEnd || ''}
                      onChange={(e) => updateFormData({ billablePeriodEnd: e.target.value })}
                      className="px-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-600 text-gray-900"
                      style={{ height: '40px', fontSize: '14px', flex: '1' }}
                    />
                  </div>
                </div>

                {/* Row 2: Payment Terms + Due Date + Tax Rate */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
                  <div>
                    <label className="block mb-1.5" style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Payment Terms
                    </label>
                    <select
                      value={formData.paymentTerms || ''}
                      onChange={(e) => updateFormData({ paymentTerms: e.target.value })}
                      className="w-full px-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-600 bg-white text-gray-900"
                      style={{ height: '40px', fontSize: '14px' }}
                    >
                      <option value="NET 15">NET 15</option>
                      <option value="NET 30">NET 30</option>
                      <option value="NET 45">NET 45</option>
                      <option value="NET 60">NET 60</option>
                      <option value="NET 90">NET 90</option>
                    </select>
                  </div>

                  <div>
                    <label className="block mb-1.5" style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Due Date
                    </label>
                    <div
                      className="flex items-center px-3 border border-gray-200 rounded-lg bg-gray-50 text-gray-700"
                      style={{ height: '40px', fontSize: '14px' }}
                    >
                      {formatDateDisplay(formData.dueDate)}
                    </div>
                  </div>

                  <div>
                    <label className="block mb-1.5" style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                      Tax Rate
                    </label>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <input
                        type="number"
                        value={formData.taxRate || ''}
                        onChange={(e) => updateFormData({ taxRate: parseFloat(e.target.value) || 0 })}
                        step="0.1"
                        className="flex-1 px-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-600 text-gray-900 tabular-nums text-right"
                        style={{ height: '40px', fontSize: '14px' }}
                      />
                      <span style={{ fontSize: '14px', color: '#6B7280' }}>%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Line Items - Only show after project selected */}
            {hasLineItems && (
              <>
                {/* Time Entries Section */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden" style={{ marginBottom: '12px' }}>
                  <button
                    onClick={() => toggleSection('timeEntries')}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {expandedSections.timeEntries ? (
                        <ChevronDown size={16} className="text-gray-400" />
                      ) : (
                        <ChevronRight size={16} className="text-gray-400" />
                      )}
                      <span className="text-gray-900 text-sm" style={{ fontWeight: 600 }}>Time Entries</span>
                      <span className="text-gray-500 text-xs">
                        ({timeEntriesCount} of {(formData.timeEntries || []).length} selected)
                      </span>
                    </div>
                    <span className="text-gray-900 tabular-nums" style={{ fontSize: '14px', fontWeight: 600 }}>
                      {formatCurrency(timeEntriesTotal)}
                    </span>
                  </button>

                  {expandedSections.timeEntries && (formData.timeEntries || []).length > 0 && (
                    <div className="border-t border-gray-200">
                      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex gap-3 text-xs">
                        <button onClick={() => toggleAllTimeEntries(true)} className="text-blue-600 hover:text-blue-700 font-medium">Select All</button>
                        <button onClick={() => toggleAllTimeEntries(false)} className="text-gray-500 hover:text-gray-700">Deselect All</button>
                      </div>
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr style={{ height: '32px' }}>
                            <th className="px-4 text-left" style={{ width: '40px' }}></th>
                            <th className="px-3 text-left text-gray-600 text-xs uppercase" style={{ fontWeight: 600 }}>Date</th>
                            <th className="px-3 text-left text-gray-600 text-xs uppercase" style={{ fontWeight: 600 }}>Person</th>
                            <th className="px-3 text-left text-gray-600 text-xs uppercase" style={{ fontWeight: 600 }}>Task</th>
                            <th className="px-3 text-right text-gray-600 text-xs uppercase" style={{ fontWeight: 600 }}>Hours</th>
                            <th className="px-3 text-right text-gray-600 text-xs uppercase" style={{ fontWeight: 600 }}>Rate</th>
                            <th className="px-4 text-right text-gray-600 text-xs uppercase" style={{ fontWeight: 600 }}>Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(formData.timeEntries || []).map((entry) => (
                            <tr key={entry.id} className="border-b border-gray-100 hover:bg-gray-50" style={{ height: '36px' }}>
                              <td className="px-4">
                                <input
                                  type="checkbox"
                                  checked={entry.selected || false}
                                  onChange={() => toggleTimeEntry(entry.id)}
                                  className="rounded border-gray-300 text-blue-600"
                                />
                              </td>
                              <td className="px-3 text-gray-600 text-xs">{entry.date}</td>
                              <td className="px-3 text-gray-900 text-xs">{entry.personName}</td>
                              <td className="px-3 text-gray-900 text-xs">{entry.taskName}</td>
                              <td className="px-3 text-right text-gray-900 text-xs tabular-nums">{entry.hours}h</td>
                              <td className="px-3 text-right text-gray-900 text-xs tabular-nums">€{entry.rate}</td>
                              <td className="px-4 text-right text-gray-900 text-xs tabular-nums" style={{ fontWeight: 500 }}>{formatCurrency(entry.amount)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                  {expandedSections.timeEntries && (formData.timeEntries || []).length === 0 && (
                    <div className="border-t border-gray-200 px-4 py-6 text-center text-gray-500 text-sm">
                      No time entries for this period
                    </div>
                  )}
                </div>

                {/* Expenses Section */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden" style={{ marginBottom: '12px' }}>
                  <button
                    onClick={() => toggleSection('expenses')}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {expandedSections.expenses ? (
                        <ChevronDown size={16} className="text-gray-400" />
                      ) : (
                        <ChevronRight size={16} className="text-gray-400" />
                      )}
                      <span className="text-gray-900 text-sm" style={{ fontWeight: 600 }}>Expenses</span>
                      <span className="text-gray-500 text-xs">
                        ({expensesCount} of {(formData.expenses || []).length} selected)
                      </span>
                    </div>
                    <span className="text-gray-900 tabular-nums" style={{ fontSize: '14px', fontWeight: 600 }}>
                      {formatCurrency(expensesTotal)}
                    </span>
                  </button>

                  {expandedSections.expenses && (formData.expenses || []).length > 0 && (
                    <div className="border-t border-gray-200">
                      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex gap-3 text-xs">
                        <button onClick={() => toggleAllExpenses(true)} className="text-blue-600 hover:text-blue-700 font-medium">Select All</button>
                        <button onClick={() => toggleAllExpenses(false)} className="text-gray-500 hover:text-gray-700">Deselect All</button>
                      </div>
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr style={{ height: '32px' }}>
                            <th className="px-4 text-left" style={{ width: '40px' }}></th>
                            <th className="px-3 text-left text-gray-600 text-xs uppercase" style={{ fontWeight: 600 }}>Date</th>
                            <th className="px-3 text-left text-gray-600 text-xs uppercase" style={{ fontWeight: 600 }}>Description</th>
                            <th className="px-3 text-right text-gray-600 text-xs uppercase" style={{ fontWeight: 600 }}>Amount</th>
                            <th className="px-4 text-center text-gray-600 text-xs uppercase" style={{ fontWeight: 600, width: '80px' }}>Tax</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(formData.expenses || []).map((expense) => (
                            <tr key={expense.id} className="border-b border-gray-100 hover:bg-gray-50" style={{ height: '36px' }}>
                              <td className="px-4">
                                <input
                                  type="checkbox"
                                  checked={expense.selected || false}
                                  onChange={() => toggleExpense(expense.id)}
                                  className="rounded border-gray-300 text-blue-600"
                                />
                              </td>
                              <td className="px-3 text-gray-600 text-xs">{expense.date}</td>
                              <td className="px-3 text-gray-900 text-xs">{expense.description}</td>
                              <td className="px-3 text-right text-gray-900 text-xs tabular-nums" style={{ fontWeight: 500 }}>{formatCurrency(expense.amount)}</td>
                              <td className="px-4 text-center">
                                <input
                                  type="checkbox"
                                  checked={expense.taxable}
                                  onChange={() => toggleExpenseTaxable(expense.id)}
                                  className="rounded border-gray-300 text-blue-600"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Milestones Section */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden" style={{ marginBottom: '12px' }}>
                  <button
                    onClick={() => toggleSection('milestones')}
                    className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center gap-2">
                      {expandedSections.milestones ? (
                        <ChevronDown size={16} className="text-gray-400" />
                      ) : (
                        <ChevronRight size={16} className="text-gray-400" />
                      )}
                      <span className="text-gray-900 text-sm" style={{ fontWeight: 600 }}>Milestones</span>
                      <span className="text-gray-500 text-xs">
                        ({milestonesCount} of {(formData.milestones || []).length} selected)
                      </span>
                    </div>
                    <span className="text-gray-900 tabular-nums" style={{ fontSize: '14px', fontWeight: 600 }}>
                      {formatCurrency(milestonesTotal)}
                    </span>
                  </button>

                  {expandedSections.milestones && (formData.milestones || []).length > 0 && (
                    <div className="border-t border-gray-200">
                      <div className="px-4 py-2 bg-gray-50 border-b border-gray-200 flex gap-3 text-xs">
                        <button onClick={() => toggleAllMilestones(true)} className="text-blue-600 hover:text-blue-700 font-medium">Select All</button>
                        <button onClick={() => toggleAllMilestones(false)} className="text-gray-500 hover:text-gray-700">Deselect All</button>
                      </div>
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr style={{ height: '32px' }}>
                            <th className="px-4 text-left" style={{ width: '40px' }}></th>
                            <th className="px-3 text-left text-gray-600 text-xs uppercase" style={{ fontWeight: 600 }}>Milestone</th>
                            <th className="px-3 text-left text-gray-600 text-xs uppercase" style={{ fontWeight: 600 }}>Delivery Date</th>
                            <th className="px-3 text-right text-gray-600 text-xs uppercase" style={{ fontWeight: 600, width: '140px' }}>Amount</th>
                            <th className="px-4 text-center text-gray-600 text-xs uppercase" style={{ fontWeight: 600, width: '80px' }}>Tax</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(formData.milestones || []).map((milestone) => (
                            <tr key={milestone.id} className="border-b border-gray-100 hover:bg-gray-50" style={{ height: '36px' }}>
                              <td className="px-4">
                                <input
                                  type="checkbox"
                                  checked={milestone.selected || false}
                                  onChange={() => toggleMilestone(milestone.id)}
                                  className="rounded border-gray-300 text-blue-600"
                                />
                              </td>
                              <td className="px-3 text-gray-900 text-xs">{milestone.name}</td>
                              <td className="px-3 text-gray-600 text-xs">{milestone.deliveryDate}</td>
                              <td className="px-3 text-right">
                                <input
                                  type="number"
                                  value={milestone.amount}
                                  onChange={(e) => updateMilestoneAmount(milestone.id, parseFloat(e.target.value) || 0)}
                                  className="w-full text-right px-2 py-1 border border-gray-300 rounded text-xs tabular-nums focus:outline-none focus:ring-1 focus:ring-blue-600"
                                />
                              </td>
                              <td className="px-4 text-center">
                                <input
                                  type="checkbox"
                                  checked={milestone.taxable}
                                  onChange={() => toggleMilestoneTaxable(milestone.id)}
                                  className="rounded border-gray-300 text-blue-600"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Additional Items Section */}
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden" style={{ marginBottom: '12px' }}>
                  <div className="flex items-center justify-between px-4 py-3">
                    <button
                      onClick={() => toggleSection('additional')}
                      className="flex items-center gap-2"
                    >
                      {expandedSections.additional ? (
                        <ChevronDown size={16} className="text-gray-400" />
                      ) : (
                        <ChevronRight size={16} className="text-gray-400" />
                      )}
                      <span className="text-gray-900 text-sm" style={{ fontWeight: 600 }}>Additional Items</span>
                      <span className="text-gray-500 text-xs">({(formData.additionalItems || []).length})</span>
                    </button>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-900 tabular-nums" style={{ fontSize: '14px', fontWeight: 600 }}>
                        {formatCurrency(additionalTotal)}
                      </span>
                      <button
                        onClick={addAdditionalItem}
                        className="flex items-center gap-1 px-2 py-1 text-blue-600 hover:bg-blue-50 rounded text-xs font-medium"
                      >
                        <Plus size={14} />
                        Add Item
                      </button>
                    </div>
                  </div>

                  {expandedSections.additional && (formData.additionalItems || []).length > 0 && (
                    <div className="border-t border-gray-200">
                      <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-200">
                          <tr style={{ height: '32px' }}>
                            <th className="px-4 text-left text-gray-600 text-xs uppercase" style={{ fontWeight: 600 }}>Description</th>
                            <th className="px-3 text-right text-gray-600 text-xs uppercase" style={{ fontWeight: 600, width: '140px' }}>Amount</th>
                            <th className="px-3 text-center text-gray-600 text-xs uppercase" style={{ fontWeight: 600, width: '80px' }}>Tax</th>
                            <th className="px-4" style={{ width: '50px' }}></th>
                          </tr>
                        </thead>
                        <tbody>
                          {(formData.additionalItems || []).map((item) => (
                            <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50" style={{ height: '36px' }}>
                              <td className="px-4">
                                <input
                                  type="text"
                                  value={item.description}
                                  onChange={(e) => updateAdditionalItem(item.id, { description: e.target.value })}
                                  placeholder="Enter description..."
                                  className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-1 focus:ring-blue-600"
                                />
                              </td>
                              <td className="px-3">
                                <input
                                  type="number"
                                  value={item.amount}
                                  onChange={(e) => updateAdditionalItem(item.id, { amount: parseFloat(e.target.value) || 0 })}
                                  className="w-full text-right px-2 py-1 border border-gray-300 rounded text-xs tabular-nums focus:outline-none focus:ring-1 focus:ring-blue-600"
                                />
                              </td>
                              <td className="px-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={item.taxable}
                                  onChange={(e) => updateAdditionalItem(item.id, { taxable: e.target.checked })}
                                  className="rounded border-gray-300 text-blue-600"
                                />
                              </td>
                              <td className="px-4 text-right">
                                <button
                                  onClick={() => deleteAdditionalItem(item.id)}
                                  className="p-1 text-red-600 hover:bg-red-50 rounded"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Notes Section */}
                <div className="bg-white border border-gray-200 rounded-lg" style={{ padding: '16px' }}>
                  <label className="block mb-2" style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Notes
                  </label>
                  <textarea
                    value={formData.notes || ''}
                    onChange={(e) => updateFormData({ notes: e.target.value })}
                    placeholder="Payment instructions, thank you message, etc."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-600 text-gray-900 placeholder-gray-400 text-sm resize-none"
                  />
                </div>
              </>
            )}
          </div>
        </div>

        {/* Right Column - Sticky Preview */}
        <div
          className="flex-none border-l border-gray-200 bg-white overflow-y-auto"
          style={{ width: '360px' }}
        >
          <div style={{ position: 'sticky', top: 0, padding: '20px' }}>
            <div style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '16px' }}>
              Preview
            </div>

            {/* Mini Invoice Preview */}
            <div style={{ backgroundColor: '#F9FAFB', borderRadius: '8px', padding: '16px' }}>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <div style={{ fontSize: '10px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>Invoice</div>
                  <div style={{ fontSize: '16px', fontWeight: 600, color: formData.invoiceNumber ? '#111827' : '#D1D5DB' }}>
                    {formData.invoiceNumber || 'INV-0000'}
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  {settings.companyLogo && (
                    <img src={settings.companyLogo} alt="Logo" style={{ maxHeight: '32px', marginLeft: 'auto', marginBottom: '4px' }} />
                  )}
                  <div style={{ fontSize: '12px', fontWeight: 600, color: '#111827' }}>{settings.companyName}</div>
                </div>
              </div>

              {/* Bill To */}
              <div style={{ marginBottom: '16px', paddingBottom: '16px', borderBottom: '1px solid #E5E7EB' }}>
                <div style={{ fontSize: '10px', color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Bill To</div>
                <div style={{ fontSize: '13px', fontWeight: 500, color: formData.clientName ? '#111827' : '#D1D5DB' }}>
                  {formData.clientName || 'Select client...'}
                </div>
                <div style={{ fontSize: '12px', color: formData.projectName ? '#6B7280' : '#D1D5DB', marginTop: '2px' }}>
                  {formData.projectName || 'Select project...'}
                </div>
              </div>

              {/* Details */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px', marginBottom: '16px' }}>
                <div>
                  <div style={{ color: '#9CA3AF', marginBottom: '2px' }}>Invoice Date</div>
                  <div style={{ color: formData.invoiceDate ? '#111827' : '#D1D5DB', fontWeight: 500 }}>
                    {formatDateDisplay(formData.invoiceDate)}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#9CA3AF', marginBottom: '2px' }}>Due Date</div>
                  <div style={{ color: formData.dueDate ? '#111827' : '#D1D5DB', fontWeight: 500 }}>
                    {formatDateDisplay(formData.dueDate)}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#9CA3AF', marginBottom: '2px' }}>Payment Terms</div>
                  <div style={{ color: '#111827', fontWeight: 500 }}>{formData.paymentTerms || 'NET 30'}</div>
                </div>
                <div>
                  <div style={{ color: '#9CA3AF', marginBottom: '2px' }}>Tax Rate</div>
                  <div style={{ color: '#111827', fontWeight: 500 }}>{formData.taxRate ?? settings.defaultTaxRate}%</div>
                </div>
              </div>

              {/* Line Items Summary */}
              {hasLineItems && (
                <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '16px', marginBottom: '16px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                    {timeEntriesCount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6B7280' }}>Time Entries ({timeEntriesCount})</span>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ color: '#9CA3AF', marginRight: '12px' }}>{timeEntriesHours} hrs</span>
                          <span style={{ color: '#111827', fontWeight: 500 }}>{formatCurrency(timeEntriesTotal)}</span>
                        </div>
                      </div>
                    )}
                    {expensesCount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6B7280' }}>Expenses ({expensesCount})</span>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ color: '#9CA3AF', marginRight: '12px' }}>{expensesCount} items</span>
                          <span style={{ color: '#111827', fontWeight: 500 }}>{formatCurrency(expensesTotal)}</span>
                        </div>
                      </div>
                    )}
                    {milestonesCount > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6B7280' }}>Milestones ({milestonesCount})</span>
                        <div style={{ textAlign: 'right' }}>
                          <span style={{ color: '#9CA3AF', marginRight: '12px' }}>{milestonesCount} items</span>
                          <span style={{ color: '#111827', fontWeight: 500 }}>{formatCurrency(milestonesTotal)}</span>
                        </div>
                      </div>
                    )}
                    {(formData.additionalItems || []).length > 0 && (
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span style={{ color: '#6B7280' }}>Additional ({(formData.additionalItems || []).length})</span>
                        <span style={{ color: '#111827', fontWeight: 500 }}>{formatCurrency(additionalTotal)}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Totals */}
              <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '6px' }}>
                  <span style={{ color: '#6B7280' }}>Subtotal</span>
                  <span style={{ color: '#111827' }}>{formatCurrency(subtotal)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '8px' }}>
                  <span style={{ color: '#6B7280' }}>Tax ({formData.taxRate || 0}%)</span>
                  <span style={{ color: '#111827' }}>{formatCurrency(taxAmount)}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '16px', fontWeight: 600, paddingTop: '8px', borderTop: '1px solid #E5E7EB' }}>
                  <span style={{ color: '#111827' }}>Total</span>
                  <span style={{ color: '#111827' }}>{formatCurrency(total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        className="flex-none border-t bg-white flex items-center justify-between"
        style={{ borderColor: '#E5E7EB', height: '56px', padding: '0 20px' }}
      >
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
          style={{ fontSize: '14px' }}
        >
          Cancel
        </button>
        <div className="flex gap-3">
          <button
            onClick={handleSaveDraft}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            style={{ fontSize: '14px' }}
          >
            Save Draft
          </button>
          <button
            onClick={handleSaveInvoice}
            disabled={!canSave}
            className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ fontSize: '14px', fontWeight: 600 }}
          >
            Save Invoice
          </button>
        </div>
      </div>
    </div>
  );
};

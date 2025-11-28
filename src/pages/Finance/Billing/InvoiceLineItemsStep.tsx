import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react';
import { InvoiceFormData } from './InvoiceCreationFlow';
import { TimeEntry, Expense, Milestone, AdditionalItem } from '../../../contexts/BillingContext';

interface InvoiceLineItemsStepProps {
  formData: InvoiceFormData;
  updateFormData: (data: Partial<InvoiceFormData>) => void;
  onNext: () => void;
  onBack: () => void;
  onSaveDraft: () => void;
}

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

export function InvoiceLineItemsStep({
  formData,
  updateFormData,
  onNext,
  onBack,
  onSaveDraft,
}: InvoiceLineItemsStepProps) {
  const [expandedSections, setExpandedSections] = useState({
    timeEntries: true,
    expenses: true,
    milestones: true,
    additional: true,
  });

  // Initialize with mock data if empty
  useEffect(() => {
    if (!formData.timeEntries || formData.timeEntries.length === 0) {
      updateFormData({
        timeEntries: mockTimeEntries,
        expenses: mockExpenses,
        milestones: mockMilestones,
        additionalItems: [],
      });
    }
  }, []);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

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

  const addAdditionalItem = () => {
    const newItem: AdditionalItem = {
      id: `add-${Date.now()}`,
      description: '',
      amount: 0,
      taxable: true,
    };
    updateFormData({ additionalItems: [...(formData.additionalItems || []), newItem] });
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

  const expensesTotal = (formData.expenses || [])
    .filter(exp => exp.selected)
    .reduce((sum, exp) => sum + exp.amount, 0);

  const milestonesTotal = (formData.milestones || [])
    .filter(m => m.selected)
    .reduce((sum, m) => sum + m.amount, 0);

  const additionalTotal = (formData.additionalItems || [])
    .reduce((sum, item) => sum + item.amount, 0);

  const subtotal = timeEntriesTotal + expensesTotal + milestonesTotal + additionalTotal;
  const taxAmount = subtotal * ((formData.taxRate || 0) / 100);
  const total = subtotal + taxAmount;

  const formatCurrency = (amount: number) => {
    return `€${amount.toLocaleString('en-IE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className="flex-1 flex flex-col" style={{ backgroundColor: '#F9FAFB' }}>
      {/* Content area with sidebar */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main content */}
        <div className="flex-1 px-6 py-5 overflow-y-auto">
          <div className="max-w-6xl mx-auto space-y-3">
            {/* Time Entries Section */}
            <div className="bg-white border border-gray-200 rounded overflow-hidden">
              <button
                onClick={() => toggleSection('timeEntries')}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border-b border-gray-200 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  {expandedSections.timeEntries ? (
                    <ChevronUp size={16} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={16} className="text-gray-400" />
                  )}
                  <div className="flex items-baseline gap-2">
                    <span className="text-gray-900 text-sm" style={{ fontWeight: 600 }}>Time Entries</span>
                    <span className="text-gray-500 text-xs">
                      {(formData.timeEntries || []).filter(e => e.selected).length} of {(formData.timeEntries || []).length} selected
                    </span>
                  </div>
                </div>
                <span className="text-gray-900 tabular-nums" style={{ fontSize: '14px', fontWeight: 600 }}>
                  {formatCurrency(timeEntriesTotal)}
                </span>
              </button>

              {expandedSections.timeEntries && (
                <div>
                  <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex gap-3 text-xs">
                      <button
                        onClick={() => toggleAllTimeEntries(true)}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Select All
                      </button>
                      <button
                        onClick={() => toggleAllTimeEntries(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        Deselect All
                      </button>
                    </div>
                  </div>

                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr style={{ height: '32px' }}>
                        <th className="px-4 text-left" style={{ width: '40px' }}></th>
                        <th className="px-3 text-left text-gray-600 text-xs uppercase tracking-wider" style={{ fontWeight: 600, letterSpacing: '0.5px' }}>Date</th>
                        <th className="px-3 text-left text-gray-600 text-xs uppercase tracking-wider" style={{ fontWeight: 600, letterSpacing: '0.5px' }}>Person</th>
                        <th className="px-3 text-left text-gray-600 text-xs uppercase tracking-wider" style={{ fontWeight: 600, letterSpacing: '0.5px' }}>Task</th>
                        <th className="px-3 text-right text-gray-600 text-xs uppercase tracking-wider" style={{ fontWeight: 600, letterSpacing: '0.5px' }}>Hours</th>
                        <th className="px-3 text-right text-gray-600 text-xs uppercase tracking-wider" style={{ fontWeight: 600, letterSpacing: '0.5px' }}>Rate</th>
                        <th className="px-4 text-right text-gray-600 text-xs uppercase tracking-wider" style={{ fontWeight: 600, letterSpacing: '0.5px' }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(formData.timeEntries || []).map((entry) => (
                        <tr
                          key={entry.id}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                          style={{ height: '36px' }}
                        >
                          <td className="px-4">
                            <input
                              type="checkbox"
                              checked={entry.selected || false}
                              onChange={() => toggleTimeEntry(entry.id)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                              style={{ width: '14px', height: '14px' }}
                            />
                          </td>
                          <td className="px-3 text-gray-600 text-xs">{entry.date}</td>
                          <td className="px-3 text-gray-900 text-xs">{entry.personName}</td>
                          <td className="px-3 text-gray-900 text-xs">{entry.taskName}</td>
                          <td className="px-3 text-right text-gray-900 text-xs tabular-nums">{entry.hours}</td>
                          <td className="px-3 text-right text-gray-900 text-xs tabular-nums">€{entry.rate}</td>
                          <td className="px-4 text-right text-gray-900 text-xs tabular-nums" style={{ fontWeight: 500 }}>
                            {formatCurrency(entry.amount)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Expenses Section */}
            <div className="bg-white border border-gray-200 rounded overflow-hidden">
              <button
                onClick={() => toggleSection('expenses')}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border-b border-gray-200 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  {expandedSections.expenses ? (
                    <ChevronUp size={16} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={16} className="text-gray-400" />
                  )}
                  <div className="flex items-baseline gap-2">
                    <span className="text-gray-900 text-sm" style={{ fontWeight: 600 }}>Expenses</span>
                    <span className="text-gray-500 text-xs">
                      {(formData.expenses || []).filter(e => e.selected).length} of {(formData.expenses || []).length} selected
                    </span>
                  </div>
                </div>
                <span className="text-gray-900 tabular-nums" style={{ fontSize: '14px', fontWeight: 600 }}>
                  {formatCurrency(expensesTotal)}
                </span>
              </button>

              {expandedSections.expenses && (
                <div>
                  <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex gap-3 text-xs">
                      <button
                        onClick={() => toggleAllExpenses(true)}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Select All
                      </button>
                      <button
                        onClick={() => toggleAllExpenses(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        Deselect All
                      </button>
                    </div>
                  </div>

                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr style={{ height: '32px' }}>
                        <th className="px-4 text-left" style={{ width: '40px' }}></th>
                        <th className="px-3 text-left text-gray-600 text-xs uppercase tracking-wider" style={{ fontWeight: 600, letterSpacing: '0.5px' }}>Date</th>
                        <th className="px-3 text-left text-gray-600 text-xs uppercase tracking-wider" style={{ fontWeight: 600, letterSpacing: '0.5px' }}>Description</th>
                        <th className="px-3 text-right text-gray-600 text-xs uppercase tracking-wider" style={{ fontWeight: 600, letterSpacing: '0.5px' }}>Amount</th>
                        <th className="px-4 text-center text-gray-600 text-xs uppercase tracking-wider" style={{ fontWeight: 600, letterSpacing: '0.5px', width: '80px' }}>Taxable</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(formData.expenses || []).map((expense) => (
                        <tr
                          key={expense.id}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                          style={{ height: '36px' }}
                        >
                          <td className="px-4">
                            <input
                              type="checkbox"
                              checked={expense.selected || false}
                              onChange={() => toggleExpense(expense.id)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                              style={{ width: '14px', height: '14px' }}
                            />
                          </td>
                          <td className="px-3 text-gray-600 text-xs">{expense.date}</td>
                          <td className="px-3 text-gray-900 text-xs">{expense.description}</td>
                          <td className="px-3 text-right text-gray-900 text-xs tabular-nums" style={{ fontWeight: 500 }}>
                            {formatCurrency(expense.amount)}
                          </td>
                          <td className="px-4 text-center">
                            <input
                              type="checkbox"
                              checked={expense.taxable}
                              onChange={() => toggleExpenseTaxable(expense.id)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                              style={{ width: '14px', height: '14px' }}
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
            <div className="bg-white border border-gray-200 rounded overflow-hidden">
              <button
                onClick={() => toggleSection('milestones')}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border-b border-gray-200 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  {expandedSections.milestones ? (
                    <ChevronUp size={16} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={16} className="text-gray-400" />
                  )}
                  <div className="flex items-baseline gap-2">
                    <span className="text-gray-900 text-sm" style={{ fontWeight: 600 }}>Milestones</span>
                    <span className="text-gray-500 text-xs">
                      {(formData.milestones || []).filter(m => m.selected).length} of {(formData.milestones || []).length} selected
                    </span>
                  </div>
                </div>
                <span className="text-gray-900 tabular-nums" style={{ fontSize: '14px', fontWeight: 600 }}>
                  {formatCurrency(milestonesTotal)}
                </span>
              </button>

              {expandedSections.milestones && (
                <div>
                  <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
                    <div className="flex gap-3 text-xs">
                      <button
                        onClick={() => toggleAllMilestones(true)}
                        className="text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Select All
                      </button>
                      <button
                        onClick={() => toggleAllMilestones(false)}
                        className="text-gray-500 hover:text-gray-700"
                      >
                        Deselect All
                      </button>
                    </div>
                  </div>

                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr style={{ height: '32px' }}>
                        <th className="px-4 text-left" style={{ width: '40px' }}></th>
                        <th className="px-3 text-left text-gray-600 text-xs uppercase tracking-wider" style={{ fontWeight: 600, letterSpacing: '0.5px' }}>Milestone</th>
                        <th className="px-3 text-left text-gray-600 text-xs uppercase tracking-wider" style={{ fontWeight: 600, letterSpacing: '0.5px' }}>Delivery Date</th>
                        <th className="px-3 text-right text-gray-600 text-xs uppercase tracking-wider" style={{ fontWeight: 600, letterSpacing: '0.5px' }}>Amount</th>
                        <th className="px-4 text-center text-gray-600 text-xs uppercase tracking-wider" style={{ fontWeight: 600, letterSpacing: '0.5px', width: '80px' }}>Taxable</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(formData.milestones || []).map((milestone) => (
                        <tr
                          key={milestone.id}
                          className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                          style={{ height: '36px' }}
                        >
                          <td className="px-4">
                            <input
                              type="checkbox"
                              checked={milestone.selected || false}
                              onChange={() => toggleMilestone(milestone.id)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                              style={{ width: '14px', height: '14px' }}
                            />
                          </td>
                          <td className="px-3 text-gray-900 text-xs">{milestone.name}</td>
                          <td className="px-3 text-gray-600 text-xs">{milestone.deliveryDate}</td>
                          <td className="px-3 text-right">
                            <input
                              type="number"
                              value={milestone.amount}
                              onChange={(e) => updateMilestoneAmount(milestone.id, parseFloat(e.target.value) || 0)}
                              className="w-full text-right px-2 py-1 border border-gray-300 rounded text-xs tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-600"
                            />
                          </td>
                          <td className="px-4 text-center">
                            <input
                              type="checkbox"
                              checked={milestone.taxable}
                              disabled
                              className="rounded border-gray-300 text-blue-600"
                              style={{ width: '14px', height: '14px' }}
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
            <div className="bg-white border border-gray-200 rounded overflow-hidden">
              <button
                onClick={() => toggleSection('additional')}
                className="w-full flex items-center justify-between px-4 py-2.5 bg-gray-50 hover:bg-gray-100 border-b border-gray-200 transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  {expandedSections.additional ? (
                    <ChevronUp size={16} className="text-gray-400" />
                  ) : (
                    <ChevronDown size={16} className="text-gray-400" />
                  )}
                  <div className="flex items-baseline gap-2">
                    <span className="text-gray-900 text-sm" style={{ fontWeight: 600 }}>Additional Items</span>
                    <span className="text-gray-500 text-xs">{(formData.additionalItems || []).length} items</span>
                  </div>
                </div>
                <span className="text-gray-900 tabular-nums" style={{ fontSize: '14px', fontWeight: 600 }}>
                  {formatCurrency(additionalTotal)}
                </span>
              </button>

              {expandedSections.additional && (
                <div>
                  <div className="px-4 py-2.5 bg-gray-50 border-b border-gray-200">
                    <button
                      onClick={addAdditionalItem}
                      className="flex items-center gap-1.5 px-2.5 py-1 text-blue-600 hover:bg-blue-50 rounded text-xs transition-colors"
                      style={{ fontWeight: 500 }}
                    >
                      <Plus size={14} />
                      Add Item
                    </button>
                  </div>

                  {(formData.additionalItems || []).length > 0 && (
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr style={{ height: '32px' }}>
                          <th className="px-4 text-left text-gray-600 text-xs uppercase tracking-wider" style={{ fontWeight: 600, letterSpacing: '0.5px' }}>Description</th>
                          <th className="px-3 text-right text-gray-600 text-xs uppercase tracking-wider" style={{ fontWeight: 600, letterSpacing: '0.5px', width: '140px' }}>Amount</th>
                          <th className="px-3 text-center text-gray-600 text-xs uppercase tracking-wider" style={{ fontWeight: 600, letterSpacing: '0.5px', width: '80px' }}>Taxable</th>
                          <th className="px-4 text-right" style={{ width: '60px' }}></th>
                        </tr>
                      </thead>
                      <tbody>
                        {(formData.additionalItems || []).map((item) => (
                          <tr
                            key={item.id}
                            className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                            style={{ height: '36px' }}
                          >
                            <td className="px-4">
                              <input
                                type="text"
                                value={item.description}
                                onChange={(e) => updateAdditionalItem(item.id, { description: e.target.value })}
                                placeholder="Enter description..."
                                className="w-full px-2 py-1 border border-gray-300 rounded text-xs focus:outline-none focus:ring-2 focus:ring-blue-600"
                              />
                            </td>
                            <td className="px-3">
                              <input
                                type="number"
                                value={item.amount}
                                onChange={(e) => updateAdditionalItem(item.id, { amount: parseFloat(e.target.value) || 0 })}
                                className="w-full text-right px-2 py-1 border border-gray-300 rounded text-xs tabular-nums focus:outline-none focus:ring-2 focus:ring-blue-600"
                              />
                            </td>
                            <td className="px-3 text-center">
                              <input
                                type="checkbox"
                                checked={item.taxable}
                                onChange={(e) => updateAdditionalItem(item.id, { taxable: e.target.checked })}
                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                                style={{ width: '14px', height: '14px' }}
                              />
                            </td>
                            <td className="px-4 text-right">
                              <button
                                onClick={() => deleteAdditionalItem(item.id)}
                                className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Summary Sidebar - Sticky */}
        <div className="flex-none border-l border-gray-200 bg-white overflow-y-auto" style={{ width: '280px' }}>
          <div className="sticky top-0 p-5">
            <div className="mb-4">
              <h3 className="text-gray-900 text-sm mb-1" style={{ fontWeight: 600 }}>Invoice Total</h3>
              <div className="text-gray-900 tabular-nums" style={{ fontSize: '24px', fontWeight: 600, letterSpacing: '-0.5px' }}>
                {formatCurrency(total)}
              </div>
            </div>

            <div className="space-y-2.5 pb-4 mb-4 border-b border-gray-200">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Time Entries</span>
                <span className="text-gray-900 tabular-nums">{formatCurrency(timeEntriesTotal)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Expenses</span>
                <span className="text-gray-900 tabular-nums">{formatCurrency(expensesTotal)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Milestones</span>
                <span className="text-gray-900 tabular-nums">{formatCurrency(milestonesTotal)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Additional</span>
                <span className="text-gray-900 tabular-nums">{formatCurrency(additionalTotal)}</span>
              </div>
            </div>

            <div className="space-y-2.5 pb-4 mb-4 border-b border-gray-200">
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Subtotal</span>
                <span className="text-gray-900 tabular-nums">{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Tax ({formData.taxRate}%)</span>
                <span className="text-gray-900 tabular-nums">{formatCurrency(taxAmount)}</span>
              </div>
            </div>

            {formData.dueDate && (
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">Due Date</span>
                <span className="text-gray-900">
                  {new Date(formData.dueDate).toLocaleDateString('en-GB', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer - 48px */}
      <div
        className="flex-none border-t bg-white flex items-center justify-between"
        style={{
          borderColor: '#E5E7EB',
          height: '48px',
          padding: '0 24px',
        }}
      >
        <button
          onClick={onBack}
          className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded text-xs hover:bg-gray-50 transition-colors"
        >
          Back
        </button>
        <div className="flex gap-2">
          <button
            onClick={onSaveDraft}
            className="px-3 py-1.5 border border-gray-300 text-gray-700 rounded text-xs hover:bg-gray-50 transition-colors"
          >
            Save Draft
          </button>
          <button
            onClick={onNext}
            className="px-4 py-1.5 bg-blue-600 text-white rounded text-xs hover:bg-blue-700 transition-colors"
            style={{ fontWeight: 600 }}
          >
            Preview Invoice
          </button>
        </div>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { X, Edit2, Printer, Download, Send, MoreVertical, Check, XCircle, Trash2 } from 'lucide-react';
import { useBilling } from '../../../contexts/BillingContext';
import { SendInvoiceModal } from './SendInvoiceModal';
import { MarkAsPaidModal } from './MarkAsPaidModal';

interface InvoiceDocumentViewProps {
  invoiceId: string;
  onClose: () => void;
  onEdit: () => void;
}

export function InvoiceDocumentView({
  invoiceId,
  onClose,
  onEdit,
}: InvoiceDocumentViewProps) {
  const { invoices, settings, markInvoiceAsPaid, cancelInvoice, deleteInvoice, updateInvoice } = useBilling();
  const invoice = invoices.find(inv => inv.id === invoiceId);
  const [showMoreMenu, setShowMoreMenu] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [showMarkPaidModal, setShowMarkPaidModal] = useState(false);

  if (!invoice) {
    return (
      <div className="h-full flex items-center justify-center bg-white">
        <div className="text-center">
          <h2 className="text-gray-900 mb-2">Invoice not found</h2>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return `€${amount.toLocaleString('en-IE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = () => {
    alert('PDF export functionality would be implemented here');
  };

  const handleMarkPaid = (paymentDate: string, reference: string, notes: string) => {
    markInvoiceAsPaid(invoice.id, paymentDate, reference, notes);
    setShowMoreMenu(false);
    setShowMarkPaidModal(false);
  };

  const handleCancel = () => {
    if (confirm('Are you sure you want to cancel this invoice?')) {
      cancelInvoice(invoice.id);
      setShowMoreMenu(false);
    }
  };

  const handleDelete = () => {
    if (confirm('Are you sure you want to delete this invoice?')) {
      deleteInvoice(invoice.id);
      onClose();
    }
  };

  const handleSend = () => {
    if (invoice.status === 'draft') {
      updateInvoice(invoice.id, { status: 'pending' });
    }
    setShowSendModal(true);
  };

  const statusConfig = {
    draft: { label: 'Draft', bgColor: '#F3F4F6', textColor: '#374151' },
    pending: { label: 'Pending Payment', bgColor: '#FEF3C7', textColor: '#92400E' },
    paid: { label: 'Paid', bgColor: '#D1FAE5', textColor: '#065F46' },
    cancelled: { label: 'Cancelled', bgColor: '#FEE2E2', textColor: '#991B1B' },
  };

  // Group time entries by person if format is grouped-person-task
  const groupedTimeEntries = invoice.timeEntries
    .filter(e => e.selected)
    .reduce((acc, entry) => {
      const key = `${entry.personName}-${entry.taskName}`;
      if (!acc[key]) {
        acc[key] = {
          personName: entry.personName,
          taskName: entry.taskName,
          hours: 0,
          rate: entry.rate,
          amount: 0,
        };
      }
      acc[key].hours += entry.hours;
      acc[key].amount += entry.amount;
      return acc;
    }, {} as Record<string, { personName: string; taskName: string; hours: number; rate: number; amount: number }>);

  return (
    <>
      <div className="h-full flex flex-col" style={{ backgroundColor: '#F3F4F6' }}>
        {/* Toolbar */}
        <div className="flex-none bg-white border-b border-gray-200 px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-100 rounded-md transition-colors"
              >
                <X size={20} className="text-gray-600" />
              </button>
              <span
                className="inline-flex items-center px-3 py-1.5 rounded-md"
                style={{
                  backgroundColor: statusConfig[invoice.status].bgColor,
                  color: statusConfig[invoice.status].textColor,
                  fontSize: '13px',
                  fontWeight: 500,
                }}
              >
                {statusConfig[invoice.status].label}
              </span>
            </div>

            <div className="flex items-center gap-2">
              {invoice.status === 'draft' && (
                <button
                  onClick={onEdit}
                  className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                  style={{ fontSize: '13px' }}
                >
                  <Edit2 size={16} />
                  Edit
                </button>
              )}
              <button
                onClick={handlePrint}
                className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                style={{ fontSize: '13px' }}
              >
                <Printer size={16} />
                Print
              </button>
              <button
                onClick={handleExportPDF}
                className="flex items-center gap-2 px-3 py-1.5 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                style={{ fontSize: '13px' }}
              >
                <Download size={16} />
                Export PDF
              </button>
              {(invoice.status === 'draft' || invoice.status === 'pending') && (
                <button
                  onClick={handleSend}
                  className="flex items-center gap-2 px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  style={{ fontSize: '13px' }}
                >
                  <Send size={16} />
                  {invoice.status === 'draft' ? 'Send Invoice' : 'Send Reminder'}
                </button>
              )}

              <div className="relative">
                <button
                  onClick={() => setShowMoreMenu(!showMoreMenu)}
                  className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <MoreVertical size={20} className="text-gray-600" />
                </button>

                {showMoreMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-10"
                      onClick={() => setShowMoreMenu(false)}
                    />
                    <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-lg shadow-lg z-20">
                      {invoice.status === 'pending' && (
                        <button
                          onClick={() => {
                            setShowMoreMenu(false);
                            setShowMarkPaidModal(true);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50 transition-colors text-left"
                          style={{ fontSize: '13px' }}
                        >
                          <Check size={14} />
                          Mark as Paid
                        </button>
                      )}
                      {(invoice.status === 'draft' || invoice.status === 'pending') && (
                        <button
                          onClick={handleCancel}
                          className="w-full flex items-center gap-2 px-3 py-2 text-gray-700 hover:bg-gray-50 transition-colors text-left"
                          style={{ fontSize: '13px' }}
                        >
                          <XCircle size={14} />
                          Cancel Invoice
                        </button>
                      )}
                      {invoice.status === 'draft' && (
                        <button
                          onClick={handleDelete}
                          className="w-full flex items-center gap-2 px-3 py-2 text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100 text-left"
                          style={{ fontSize: '13px' }}
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Document */}
        <div className="flex-1 overflow-auto py-12">
          <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-12 print:shadow-none print:rounded-none">
            {/* Watermark for paid/cancelled */}
            {(invoice.status === 'paid' || invoice.status === 'cancelled') && (
              <div className="relative mb-6">
                <div className={`text-center py-4 rounded-lg ${
                  invoice.status === 'paid' ? 'bg-green-50 border-2 border-green-300' : 'bg-red-50 border-2 border-red-300'
                }`}>
                  <span className={`text-xl tracking-wider ${
                    invoice.status === 'paid' ? 'text-green-700' : 'text-red-700'
                  }`} style={{ fontWeight: 600 }}>
                    {invoice.status === 'paid' ? '✓ PAID' : '✗ CANCELLED'}
                  </span>
                  {invoice.status === 'paid' && invoice.paidDate && (
                    <div className="text-green-700 mt-1 text-sm">on {formatDate(invoice.paidDate)}</div>
                  )}
                </div>
              </div>
            )}

            {/* Header */}
            <div className="flex items-start justify-between mb-12">
              <div>
                <h1 style={{ fontSize: '32px', fontWeight: 600, color: '#111827', marginBottom: '4px' }}>INVOICE</h1>
                <div style={{ fontSize: '16px', color: '#6B7280' }}>{invoice.invoiceNumber}</div>
              </div>
              <div className="text-right">
                {settings.companyLogo && (
                  <img
                    src={settings.companyLogo}
                    alt="Company logo"
                    className="w-16 h-16 object-contain ml-auto mb-2"
                  />
                )}
                <div style={{ fontSize: '18px', fontWeight: 600, color: '#111827' }}>
                  {settings.companyName}
                </div>
                <div className="text-gray-600 whitespace-pre-line text-sm mt-1">{settings.companyAddress}</div>
                {settings.vatNumber && (
                  <div className="text-gray-500 mt-1 text-sm">VAT: {settings.vatNumber}</div>
                )}
              </div>
            </div>

            {/* Invoice Meta */}
            <div className="grid grid-cols-2 gap-12 mb-12 pb-8 border-b border-gray-300">
              <div>
                <div className="text-gray-700 mb-1 text-sm" style={{ fontWeight: 600 }}>Bill To</div>
                <div className="text-gray-900" style={{ fontSize: '16px', fontWeight: 500 }}>{invoice.clientName}</div>
                {invoice.clientAddress && (
                  <div className="text-gray-600 mt-2 whitespace-pre-line text-sm">{invoice.clientAddress}</div>
                )}
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-700">Invoice Number:</span>
                  <span className="text-gray-900" style={{ fontWeight: 500 }}>{invoice.invoiceNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Invoice Date:</span>
                  <span className="text-gray-900">{formatDate(invoice.invoiceDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-700">Due Date:</span>
                  <span className="text-gray-900">{formatDate(invoice.dueDate)}</span>
                </div>
                {invoice.poNumber && (
                  <div className="flex justify-between">
                    <span className="text-gray-700">PO Number:</span>
                    <span className="text-gray-900">{invoice.poNumber}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-700">Project:</span>
                  <span className="text-gray-900">{invoice.projectName}</span>
                </div>
              </div>
            </div>

            {/* Line Items */}
            <div className="mb-8">
              <table className="w-full">
                <thead className="border-b-2 border-gray-300">
                  <tr>
                    <th className="text-left py-3 text-gray-700 text-sm" style={{ fontWeight: 600 }}>Description</th>
                    <th className="text-right py-3 text-gray-700 text-sm" style={{ fontWeight: 600, width: '100px' }}>Qty/Hours</th>
                    <th className="text-right py-3 text-gray-700 text-sm" style={{ fontWeight: 600, width: '100px' }}>Rate</th>
                    <th className="text-right py-3 text-gray-700 text-sm" style={{ fontWeight: 600, width: '120px' }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Time Entries */}
                  {Object.values(groupedTimeEntries).length > 0 && (
                    <>
                      <tr>
                        <td colSpan={4} className="pt-5 pb-2 text-gray-700" style={{ fontWeight: 600 }}>
                          Professional Services
                        </td>
                      </tr>
                      {Object.values(groupedTimeEntries).map((group, idx) => (
                        <tr key={idx} className="border-b border-gray-100">
                          <td className="py-3 text-gray-900">
                            {group.taskName}
                            <div className="text-gray-600 text-xs">{group.personName}</div>
                          </td>
                          <td className="py-3 text-right text-gray-900 tabular-nums">{group.hours}h</td>
                          <td className="py-3 text-right text-gray-900 tabular-nums">€{group.rate}/hr</td>
                          <td className="py-3 text-right text-gray-900 tabular-nums">{formatCurrency(group.amount)}</td>
                        </tr>
                      ))}
                    </>
                  )}

                  {/* Expenses */}
                  {invoice.expenses.filter(e => e.selected).length > 0 && (
                    <>
                      <tr>
                        <td colSpan={4} className="pt-5 pb-2 text-gray-700" style={{ fontWeight: 600 }}>
                          Expenses
                        </td>
                      </tr>
                      {invoice.expenses
                        .filter(e => e.selected)
                        .map((expense) => (
                          <tr key={expense.id} className="border-b border-gray-100">
                            <td className="py-3 text-gray-900">{expense.description}</td>
                            <td className="py-3 text-right text-gray-900 tabular-nums">1</td>
                            <td className="py-3 text-right text-gray-900 tabular-nums">{formatCurrency(expense.amount)}</td>
                            <td className="py-3 text-right text-gray-900 tabular-nums">{formatCurrency(expense.amount)}</td>
                          </tr>
                        ))}
                    </>
                  )}

                  {/* Milestones */}
                  {invoice.milestones.filter(m => m.selected).length > 0 && (
                    <>
                      <tr>
                        <td colSpan={4} className="pt-5 pb-2 text-gray-700" style={{ fontWeight: 600 }}>
                          Milestones
                        </td>
                      </tr>
                      {invoice.milestones
                        .filter(m => m.selected)
                        .map((milestone) => (
                          <tr key={milestone.id} className="border-b border-gray-100">
                            <td className="py-3 text-gray-900">
                              {milestone.name}
                              <div className="text-gray-600 text-xs">Delivered: {formatDate(milestone.deliveryDate)}</div>
                            </td>
                            <td className="py-3 text-right text-gray-900 tabular-nums">1</td>
                            <td className="py-3 text-right text-gray-900 tabular-nums">{formatCurrency(milestone.amount)}</td>
                            <td className="py-3 text-right text-gray-900 tabular-nums">{formatCurrency(milestone.amount)}</td>
                          </tr>
                        ))}
                    </>
                  )}

                  {/* Additional Items */}
                  {invoice.additionalItems.length > 0 && (
                    <>
                      <tr>
                        <td colSpan={4} className="pt-5 pb-2 text-gray-700" style={{ fontWeight: 600 }}>
                          Additional Items
                        </td>
                      </tr>
                      {invoice.additionalItems.map((item) => (
                        <tr key={item.id} className="border-b border-gray-100">
                          <td className="py-3 text-gray-900">{item.description}</td>
                          <td className="py-3 text-right text-gray-900 tabular-nums">1</td>
                          <td className="py-3 text-right text-gray-900 tabular-nums">{formatCurrency(item.amount)}</td>
                          <td className="py-3 text-right text-gray-900 tabular-nums">{formatCurrency(item.amount)}</td>
                        </tr>
                      ))}
                    </>
                  )}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="flex justify-end mb-12">
              <div className="w-64 space-y-3">
                <div className="flex justify-between pb-3">
                  <span className="text-gray-700">Subtotal:</span>
                  <span className="text-gray-900 tabular-nums">{formatCurrency(invoice.subtotal)}</span>
                </div>
                <div className="flex justify-between pb-3">
                  <span className="text-gray-700">Tax ({invoice.taxRate}%):</span>
                  <span className="text-gray-900 tabular-nums">{formatCurrency(invoice.taxAmount)}</span>
                </div>
                <div className="flex justify-between pt-3 border-t-2 border-gray-300">
                  <span className="text-gray-900" style={{ fontWeight: 600 }}>
                    Total Due:
                  </span>
                  <span className="text-gray-900 tabular-nums" style={{ fontWeight: 600, fontSize: '18px' }}>
                    {formatCurrency(invoice.total)}
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="pt-8 border-t border-gray-300 space-y-6">
              {invoice.notes && (
                <div>
                  <div className="text-gray-700 mb-2" style={{ fontWeight: 600 }}>Notes</div>
                  <div className="text-gray-600 whitespace-pre-line text-sm">{invoice.notes}</div>
                </div>
              )}

              {settings.bankName && settings.iban && (
                <div>
                  <div className="text-gray-700 mb-2" style={{ fontWeight: 600 }}>Payment Details</div>
                  <div className="text-gray-600 text-sm">
                    <div>Bank: {settings.bankName}</div>
                    <div>IBAN: {settings.iban}</div>
                    {settings.paymentInstructions && (
                      <div className="mt-2">{settings.paymentInstructions}</div>
                    )}
                  </div>
                </div>
              )}

              <div className="text-gray-600 text-xs">
                Payment Terms: {invoice.paymentTerms}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showSendModal && (
        <SendInvoiceModal
          invoiceId={invoice.id}
          onClose={() => setShowSendModal(false)}
        />
      )}

      {showMarkPaidModal && (
        <MarkAsPaidModal
          invoiceId={invoice.id}
          onClose={() => setShowMarkPaidModal(false)}
          onConfirm={handleMarkPaid}
        />
      )}
    </>
  );
}

import React, { useEffect } from 'react';
import { InvoiceFormData } from './InvoiceCreationFlow';
import { BillingSettings } from '../../../contexts/BillingContext';

interface InvoiceSetupStepProps {
  formData: InvoiceFormData;
  updateFormData: (data: Partial<InvoiceFormData>) => void;
  onNext: () => void;
  onCancel: () => void;
  settings: BillingSettings;
}

export function InvoiceSetupStep({ formData, updateFormData, onNext, onCancel, settings }: InvoiceSetupStepProps) {
  // Calculate due date based on payment terms
  useEffect(() => {
    if (formData.invoiceDate && formData.paymentTerms) {
      const invoiceDate = new Date(formData.invoiceDate);
      const terms = formData.paymentTerms.replace('NET ', '');
      const days = parseInt(terms);
      const dueDate = new Date(invoiceDate);
      dueDate.setDate(dueDate.getDate() + days);
      updateFormData({ dueDate: dueDate.toISOString().split('T')[0] });
    }
  }, [formData.invoiceDate, formData.paymentTerms]);

  const canProceed = formData.clientName && formData.projectName && formData.invoiceNumber;

  const formatDateDisplay = (dateString: string) => {
    if (!dateString) return null;
    return new Date(dateString).toLocaleDateString('en-GB', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <div className="flex-1 flex flex-col" style={{ backgroundColor: '#F9FAFB' }}>
      {/* Content - 2 column layout */}
      <div
        className="flex-1 flex items-start justify-center"
        style={{ padding: '24px', overflow: 'auto' }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '24px', width: '100%', maxWidth: '1100px' }}>
          {/* Left Column - Form */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Section 1: Invoice Setup */}
            <div className="bg-white border border-gray-200 rounded-xl" style={{ padding: '20px' }}>
              <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>
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
                      className="w-full px-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 bg-white text-gray-900 transition-all"
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
                      className="w-full px-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 bg-white text-gray-900 transition-all"
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
                      className="w-full px-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 text-gray-900 transition-all"
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
                      className="w-full px-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 text-gray-900 transition-all"
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
                      className="w-full px-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 text-gray-900 placeholder-gray-400 transition-all"
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
                      className="w-full px-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 text-gray-900 placeholder-gray-400 transition-all"
                      style={{ height: '40px', fontSize: '14px' }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 2: Billing Period & Terms */}
            <div className="bg-white border border-gray-200 rounded-xl" style={{ padding: '20px' }}>
              <h2 style={{ fontSize: '14px', fontWeight: 600, color: '#111827', marginBottom: '12px' }}>
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
                      className="px-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 text-gray-900 transition-all"
                      style={{ height: '40px', fontSize: '14px', flex: '1 1 45%' }}
                    />
                    <span style={{ color: '#9CA3AF', flexShrink: 0 }}>→</span>
                    <input
                      type="date"
                      value={formData.billablePeriodEnd || ''}
                      onChange={(e) => updateFormData({ billablePeriodEnd: e.target.value })}
                      className="px-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 text-gray-900 transition-all"
                      style={{ height: '40px', fontSize: '14px', flex: '1 1 45%' }}
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
                      className="w-full px-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 bg-white text-gray-900 transition-all"
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
                      style={{ height: '40px', fontSize: '14px', cursor: 'default' }}
                    >
                      {formData.dueDate ? formatDateDisplay(formData.dueDate) : '—'}
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
                        className="flex-1 px-3 border border-gray-200 rounded-lg focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 text-gray-900 tabular-nums text-right transition-all"
                        style={{ height: '40px', fontSize: '14px' }}
                      />
                      <span style={{ fontSize: '14px', color: '#6B7280' }}>%</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Live Preview */}
          <div className="bg-white border border-gray-200 rounded-xl" style={{ padding: '20px', height: 'fit-content' }}>
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
                    <img
                      src={settings.companyLogo}
                      alt="Logo"
                      style={{ maxHeight: '32px', marginLeft: 'auto', marginBottom: '4px' }}
                    />
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

              {/* Details Grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '12px' }}>
                <div>
                  <div style={{ color: '#9CA3AF', marginBottom: '2px' }}>Invoice Date</div>
                  <div style={{ color: formData.invoiceDate ? '#111827' : '#D1D5DB', fontWeight: 500 }}>
                    {formatDateDisplay(formData.invoiceDate) || '—'}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#9CA3AF', marginBottom: '2px' }}>Due Date</div>
                  <div style={{ color: formData.dueDate ? '#111827' : '#D1D5DB', fontWeight: 500 }}>
                    {formatDateDisplay(formData.dueDate) || '—'}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#9CA3AF', marginBottom: '2px' }}>Payment Terms</div>
                  <div style={{ color: '#111827', fontWeight: 500 }}>
                    {formData.paymentTerms || 'NET 30'}
                  </div>
                </div>
                <div>
                  <div style={{ color: '#9CA3AF', marginBottom: '2px' }}>Tax Rate</div>
                  <div style={{ color: '#111827', fontWeight: 500 }}>
                    {formData.taxRate ?? settings.defaultTaxRate}%
                  </div>
                </div>
                {formData.poNumber && (
                  <div style={{ gridColumn: 'span 2' }}>
                    <div style={{ color: '#9CA3AF', marginBottom: '2px' }}>PO Number</div>
                    <div style={{ color: '#111827', fontWeight: 500 }}>{formData.poNumber}</div>
                  </div>
                )}
              </div>

              {/* Placeholder for line items */}
              <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #E5E7EB' }}>
                <div style={{ fontSize: '11px', color: '#9CA3AF', textAlign: 'center', padding: '12px 0' }}>
                  Line items will be added in the next step
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div
        className="flex-none bg-white border-t flex items-center justify-between px-6"
        style={{
          height: '56px',
          borderColor: '#E5E7EB',
        }}
      >
        <button
          onClick={onCancel}
          className="px-4 py-2 text-gray-500 hover:text-gray-700 transition-colors"
          style={{ fontSize: '14px' }}
        >
          Cancel
        </button>

        <button
          onClick={onNext}
          disabled={!canProceed}
          className="px-5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          style={{ height: '40px', fontSize: '14px', fontWeight: 600 }}
        >
          Next: Select Items →
        </button>
      </div>
    </div>
  );
}

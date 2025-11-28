import React, { useState, useRef } from 'react';
import { Upload, Save, X } from 'lucide-react';
import { useBilling } from '../../../contexts/BillingContext';

export function BillingSettings() {
  const { settings, updateSettings } = useBilling();
  const [formData, setFormData] = useState(settings);
  const [hasChanges, setHasChanges] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: string, value: string | number | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      // Validate file size (max 2MB)
      if (file.size > 2 * 1024 * 1024) {
        alert('Image must be less than 2MB');
        return;
      }
      // Convert to base64 for storage
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setFormData(prev => ({ ...prev, companyLogo: base64String }));
        setHasChanges(true);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setFormData(prev => ({ ...prev, companyLogo: undefined }));
    setHasChanges(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = () => {
    updateSettings(formData);
    setHasChanges(false);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleCancel = () => {
    setFormData(settings);
    setHasChanges(false);
  };

  const getPreviewInvoiceNumber = () => {
    const { invoicePrefix, includeYear, nextNumber } = formData;
    const year = includeYear ? `${new Date().getFullYear()}-` : '';
    const number = String(nextNumber).padStart(3, '0');
    return `${invoicePrefix}${year}${number}`;
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="space-y-8">
        {/* Company Information */}
        <div className="space-y-4">
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>Company Information</h2>

          <div className="space-y-4">
            <div>
              <label className="block mb-2" style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>Company Logo</label>
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center bg-gray-50 overflow-hidden">
                  {formData.companyLogo ? (
                    <>
                      <img src={formData.companyLogo} alt="Company logo" className="max-w-full max-h-full object-contain" />
                      <button
                        onClick={handleRemoveLogo}
                        className="absolute top-1 right-1 p-0.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors"
                        title="Remove logo"
                      >
                        <X size={12} />
                      </button>
                    </>
                  ) : (
                    <Upload size={24} className="text-gray-400" />
                  )}
                </div>
                <div className="flex flex-col gap-2">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    id="logo-upload"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors text-sm"
                  >
                    {formData.companyLogo ? 'Change Logo' : 'Upload Logo'}
                  </button>
                  <span className="text-xs text-gray-500">PNG, JPG up to 2MB</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block mb-2" style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>Company Name</label>
              <input
                type="text"
                value={formData.companyName}
                onChange={(e) => handleChange('companyName', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                style={{ fontSize: '14px' }}
              />
            </div>

            <div>
              <label className="block mb-2" style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>Address</label>
              <textarea
                value={formData.companyAddress}
                onChange={(e) => handleChange('companyAddress', e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                style={{ fontSize: '14px' }}
              />
            </div>

            <div>
              <label className="block mb-2" style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>VAT Number</label>
              <input
                type="text"
                value={formData.vatNumber || ''}
                onChange={(e) => handleChange('vatNumber', e.target.value)}
                placeholder="Optional"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                style={{ fontSize: '14px' }}
              />
            </div>
          </div>
        </div>

        {/* Bank Details */}
        <div className="space-y-4 pt-6 border-t border-gray-200">
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>Bank Details</h2>

          <div className="space-y-4">
            <div>
              <label className="block mb-2" style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>Bank Name</label>
              <input
                type="text"
                value={formData.bankName || ''}
                onChange={(e) => handleChange('bankName', e.target.value)}
                placeholder="Optional"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                style={{ fontSize: '14px' }}
              />
            </div>

            <div>
              <label className="block mb-2" style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>IBAN</label>
              <input
                type="text"
                value={formData.iban || ''}
                onChange={(e) => handleChange('iban', e.target.value)}
                placeholder="Optional"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                style={{ fontSize: '14px' }}
              />
            </div>

            <div>
              <label className="block mb-2" style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>Additional Payment Instructions</label>
              <textarea
                value={formData.paymentInstructions || ''}
                onChange={(e) => handleChange('paymentInstructions', e.target.value)}
                rows={3}
                placeholder="Optional"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600 resize-none"
                style={{ fontSize: '14px' }}
              />
            </div>
          </div>
        </div>

        {/* Default Settings */}
        <div className="space-y-4 pt-6 border-t border-gray-200">
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>Default Settings</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2" style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>Default Tax Rate (%)</label>
              <input
                type="number"
                min="0"
                max="100"
                step="0.1"
                value={formData.defaultTaxRate}
                onChange={(e) => handleChange('defaultTaxRate', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                style={{ fontSize: '14px' }}
              />
            </div>

            <div>
              <label className="block mb-2" style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>Default Payment Terms</label>
              <select
                value={formData.defaultPaymentTerms}
                onChange={(e) => handleChange('defaultPaymentTerms', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                style={{ fontSize: '14px' }}
              >
                <option value="NET 15">NET 15</option>
                <option value="NET 30">NET 30</option>
                <option value="NET 45">NET 45</option>
                <option value="NET 60">NET 60</option>
                <option value="NET 90">NET 90</option>
              </select>
            </div>

            <div>
              <label className="block mb-2" style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>Default Currency</label>
              <select
                value={formData.defaultCurrency}
                onChange={(e) => handleChange('defaultCurrency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                style={{ fontSize: '14px' }}
              >
                <option value="EUR">EUR - Euro</option>
                <option value="USD">USD - US Dollar</option>
                <option value="GBP">GBP - British Pound</option>
                <option value="CAD">CAD - Canadian Dollar</option>
                <option value="AUD">AUD - Australian Dollar</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block mb-2" style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>Default Time Entry Format</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="defaultTimeEntryFormat"
                  value="grouped-person-task"
                  checked={formData.defaultTimeEntryFormat === 'grouped-person-task'}
                  onChange={(e) => handleChange('defaultTimeEntryFormat', e.target.value)}
                  className="text-blue-600 focus:ring-blue-600"
                />
                <span style={{ fontSize: '14px', color: '#374151' }}>Grouped by Person & Task</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="defaultTimeEntryFormat"
                  value="grouped-task"
                  checked={formData.defaultTimeEntryFormat === 'grouped-task'}
                  onChange={(e) => handleChange('defaultTimeEntryFormat', e.target.value)}
                  className="text-blue-600 focus:ring-blue-600"
                />
                <span style={{ fontSize: '14px', color: '#374151' }}>Grouped by Task</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="defaultTimeEntryFormat"
                  value="detailed"
                  checked={formData.defaultTimeEntryFormat === 'detailed'}
                  onChange={(e) => handleChange('defaultTimeEntryFormat', e.target.value)}
                  className="text-blue-600 focus:ring-blue-600"
                />
                <span style={{ fontSize: '14px', color: '#374151' }}>Detailed (individual entries)</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block mb-2" style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>Default Expense Format</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="defaultExpenseFormat"
                  value="detailed"
                  checked={formData.defaultExpenseFormat === 'detailed'}
                  onChange={(e) => handleChange('defaultExpenseFormat', e.target.value)}
                  className="text-blue-600 focus:ring-blue-600"
                />
                <span style={{ fontSize: '14px', color: '#374151' }}>Detailed (individual expenses)</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="defaultExpenseFormat"
                  value="combined"
                  checked={formData.defaultExpenseFormat === 'combined'}
                  onChange={(e) => handleChange('defaultExpenseFormat', e.target.value)}
                  className="text-blue-600 focus:ring-blue-600"
                />
                <span style={{ fontSize: '14px', color: '#374151' }}>Combined (single line item)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Invoice Numbering */}
        <div className="space-y-4 pt-6 border-t border-gray-200">
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>Invoice Numbering</h2>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-2" style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>Prefix</label>
              <input
                type="text"
                value={formData.invoicePrefix}
                onChange={(e) => handleChange('invoicePrefix', e.target.value)}
                placeholder="INV-"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                style={{ fontSize: '14px' }}
              />
            </div>

            <div>
              <label className="block mb-2" style={{ fontSize: '13px', fontWeight: 500, color: '#374151' }}>Next Number</label>
              <input
                type="number"
                min="1"
                value={formData.nextNumber}
                onChange={(e) => handleChange('nextNumber', parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-600"
                style={{ fontSize: '14px' }}
              />
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.includeYear}
                onChange={(e) => handleChange('includeYear', e.target.checked)}
                className="rounded text-blue-600 focus:ring-blue-600"
              />
              <span style={{ fontSize: '14px', color: '#374151' }}>Include year in invoice number</span>
            </label>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>Preview</div>
            <div style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>{getPreviewInvoiceNumber()}</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      {hasChanges && (
        <div className="sticky bottom-0 flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-200 bg-white">
          <button
            onClick={handleCancel}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            style={{ fontSize: '14px' }}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            style={{ fontSize: '14px' }}
          >
            <Save size={16} />
            Save Settings
          </button>
        </div>
      )}

      {/* Toast */}
      {showToast && (
        <div
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg z-50"
          style={{ fontSize: '14px' }}
        >
          Settings saved successfully
        </div>
      )}
    </div>
  );
}

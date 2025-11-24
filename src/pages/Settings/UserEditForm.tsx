import React, { useState } from 'react';
import { X, Info, Copy, ChevronDown, ChevronUp } from 'lucide-react';

interface UserEditFormProps {
  user?: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (userData: any) => void;
}

export function UserEditForm({ user, isOpen, onClose, onSave }: UserEditFormProps) {
  const [formData, setFormData] = useState({
    name: user?.name?.split(' ')[0] || '',
    surname: user?.name?.split(' ').slice(1).join(' ') || '',
    email: user?.email || '',
    office: user?.office || '',
    timetable: user?.timetable || '',
    department: user?.department || '',
    staffCategory: user?.position || '',
    role: user?.role || '',
    costPerHour: user?.costPerHour || 0,
    manager: user?.manager || '',
    availableHolidays: 25,
    accessToFinancials: false,
    permissions: user?.roles || []
  });

  const [showPermissions, setShowPermissions] = useState(false);

  const availablePermissions = [
    'Administrator',
    'Expense manager',
    'Purchase manager',
    'Client admin',
    'Timesheet admin',
    'HR manager',
    'Finance viewer',
    'Project admin',
    'Leave manager'
  ];

  const togglePermission = (permission: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permission)
        ? prev.permissions.filter(p => p !== permission)
        : [...prev.permissions, permission]
    }));
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Slide-out panel */}
      <div className="fixed right-0 top-0 bottom-0 w-[600px] bg-white shadow-2xl z-50 overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-[#F9FAFB] border-b border-[#E5E7EB] px-6 py-4 flex items-center justify-between">
          <h2 className="text-[18px] font-medium text-[#1F2937]">
            {user ? 'Edit user' : 'Add user'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#E5E7EB] rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-[#6B7280]" />
          </button>
        </div>

        {/* Form content */}
        <div className="p-6 space-y-4">
          {/* Name & Surname */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-[#0066FF] mb-1.5">
                Name
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Name"
                className="w-full px-3 py-2 border border-[#D1D5DB] rounded text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#0066FF] mb-1.5">
                Surname
              </label>
              <input
                type="text"
                value={formData.surname}
                onChange={(e) => setFormData({ ...formData, surname: e.target.value })}
                placeholder="Surname"
                className="w-full px-3 py-2 border border-[#D1D5DB] rounded text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:border-transparent"
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-[13px] font-medium text-[#0066FF] mb-1.5">
              Email
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Email"
              className="w-full px-3 py-2 border border-[#D1D5DB] rounded text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:border-transparent"
            />
          </div>

          {/* Office & Timetable */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-[#0066FF] mb-1.5">
                Office
              </label>
              <select
                value={formData.office}
                onChange={(e) => setFormData({ ...formData, office: e.target.value })}
                className="w-full px-3 py-2 border border-[#D1D5DB] rounded text-[14px] text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:border-transparent"
              >
                <option value="">Select office</option>
                <option value="London HQ">London HQ</option>
                <option value="New York Office">New York Office</option>
                <option value="Berlin Office">Berlin Office</option>
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#0066FF] mb-1.5">
                Timetable
              </label>
              <select
                value={formData.timetable}
                onChange={(e) => setFormData({ ...formData, timetable: e.target.value })}
                className="w-full px-3 py-2 border border-[#D1D5DB] rounded text-[14px] text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:border-transparent"
              >
                <option value="">Select timetable</option>
                <option value="Standard (9-6)">Standard (9-6)</option>
                <option value="Flexible">Flexible</option>
                <option value="Part-time">Part-time</option>
              </select>
            </div>
          </div>

          {/* Department & Staff Category */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-[#0066FF] mb-1.5">
                Department
              </label>
              <input
                type="text"
                value={formData.department}
                onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                placeholder="Search department..."
                className="w-full px-3 py-2 border border-[#D1D5DB] rounded text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#0066FF] mb-1.5">
                Staff category
              </label>
              <select
                value={formData.staffCategory}
                onChange={(e) => setFormData({ ...formData, staffCategory: e.target.value })}
                className="w-full px-3 py-2 border border-[#D1D5DB] rounded text-[14px] text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:border-transparent"
              >
                <option value="">Select staff category</option>
                <option value="Senior Designer">Senior Designer</option>
                <option value="Designer">Designer</option>
                <option value="Junior Designer">Junior Designer</option>
                <option value="Developer">Developer</option>
                <option value="Project Manager">Project Manager</option>
              </select>
            </div>
          </div>

          {/* Role & Cost per Hour */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-[#0066FF] mb-1.5">
                Role
              </label>
              <input
                type="text"
                value={formData.role}
                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                placeholder="Enter a role name"
                className="w-full px-3 py-2 border border-[#D1D5DB] rounded text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#0066FF] mb-1.5">
                Actual cost per hour
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.costPerHour}
                  onChange={(e) => setFormData({ ...formData, costPerHour: parseFloat(e.target.value) })}
                  placeholder="0"
                  className="w-full px-3 py-2 pr-10 border border-[#D1D5DB] rounded text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:border-transparent"
                />
                <span className="absolute right-9 top-1/2 -translate-y-1/2 text-[14px] text-[#6B7280]">€</span>
                <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:bg-[#F3F4F6] rounded transition-colors">
                  <Copy className="w-4 h-4 text-[#60A5FA]" />
                </button>
              </div>
            </div>
          </div>

          {/* Manager & Available Holidays */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[13px] font-medium text-[#0066FF] mb-1.5">
                Manager
              </label>
              <div className="relative">
                <div className="w-full px-3 py-2 border border-[#D1D5DB] rounded text-[14px] flex items-center justify-between bg-white">
                  {formData.manager ? (
                    <div className="flex items-center gap-2 flex-1">
                      <span className="text-[14px] text-[#1F2937]">{formData.manager}</span>
                      <button
                        onClick={() => setFormData({ ...formData, manager: '' })}
                        className="ml-auto hover:bg-[#F3F4F6] rounded p-0.5 transition-colors"
                      >
                        <X className="w-3.5 h-3.5 text-[#6B7280]" />
                      </button>
                    </div>
                  ) : (
                    <span className="text-[14px] text-[#9CA3AF]">Select manager</span>
                  )}
                </div>
              </div>
            </div>
            <div>
              <label className="block text-[13px] font-medium text-[#0066FF] mb-1.5">
                Available holidays
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={formData.availableHolidays}
                  onChange={(e) => setFormData({ ...formData, availableHolidays: parseInt(e.target.value) })}
                  placeholder="Enter days allowance"
                  className="w-full px-3 py-2 pr-8 border border-[#D1D5DB] rounded text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:border-transparent"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col">
                  <button 
                    onClick={() => setFormData({ ...formData, availableHolidays: formData.availableHolidays + 1 })}
                    className="hover:bg-[#F3F4F6] rounded transition-colors"
                  >
                    <ChevronUp className="w-3.5 h-3.5 text-[#6B7280]" />
                  </button>
                  <button 
                    onClick={() => setFormData({ ...formData, availableHolidays: Math.max(0, formData.availableHolidays - 1) })}
                    className="hover:bg-[#F3F4F6] rounded transition-colors"
                  >
                    <ChevronDown className="w-3.5 h-3.5 text-[#6B7280]" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Access to Financials */}
          <div className="flex items-center justify-between py-2">
            <div className="flex items-center gap-2">
              <label className="text-[13px] font-medium text-[#0066FF]">
                Access to financials
              </label>
              <Info className="w-4 h-4 text-[#60A5FA] cursor-help" />
            </div>
            <button
              onClick={() => setFormData({ ...formData, accessToFinancials: !formData.accessToFinancials })}
              className={`relative w-11 h-6 rounded-full transition-colors ${
                formData.accessToFinancials ? 'bg-[#60A5FA]' : 'bg-[#D1D5DB]'
              }`}
            >
              <div
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                  formData.accessToFinancials ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Permissions */}
          <div>
            <label className="block text-[13px] font-medium text-[#0066FF] mb-1.5">
              Permissions
            </label>
            <div className="relative">
              <button
                onClick={() => setShowPermissions(!showPermissions)}
                className="w-full px-3 py-2 border border-[#D1D5DB] rounded text-[14px] text-left focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:border-transparent flex items-center justify-between"
              >
                <span className="text-[#60A5FA]">
                  {formData.permissions.length > 0 
                    ? `${formData.permissions.length} selected` 
                    : 'Select permissions...'}
                </span>
                <ChevronDown className={`w-4 h-4 text-[#6B7280] transition-transform ${showPermissions ? 'rotate-180' : ''}`} />
              </button>

              {showPermissions && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#D1D5DB] rounded shadow-lg z-10 max-h-64 overflow-y-auto">
                  {availablePermissions.map((permission) => (
                    <button
                      key={permission}
                      onClick={() => togglePermission(permission)}
                      className="w-full px-3 py-2 text-left hover:bg-[#F9FAFB] transition-colors flex items-center gap-2"
                    >
                      <div className={`w-4 h-4 rounded border ${
                        formData.permissions.includes(permission)
                          ? 'bg-[#0066FF] border-[#0066FF]'
                          : 'border-[#D1D5DB]'
                      } flex items-center justify-center`}>
                        {formData.permissions.includes(permission) && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className="text-[13px] text-[#1F2937]">{permission}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Selected permissions display */}
            {formData.permissions.length > 0 && !showPermissions && (
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.permissions.map((permission) => (
                  <span
                    key={permission}
                    className="text-[11px] px-2 py-1 bg-[#F0F4FF] text-[#0066FF] rounded flex items-center gap-1"
                  >
                    {permission}
                    <button
                      onClick={() => togglePermission(permission)}
                      className="hover:bg-[#DBEAFE] rounded p-0.5 transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white border-t border-[#E5E7EB] px-6 py-4 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[#6B7280] hover:bg-[#F9FAFB] rounded-lg text-[14px] font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="px-4 py-2 bg-[#60A5FA] hover:bg-[#3B82F6] text-white rounded-lg text-[14px] font-medium transition-colors"
          >
            Accept
          </button>
        </div>
      </div>
    </>
  );
}

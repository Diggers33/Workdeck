import React, { useState } from 'react';
import { ChevronLeft, Plus, Shield, Edit2, Trash2 } from 'lucide-react';

interface PoliciesSettingsProps {
  onBack: () => void;
}

export function PoliciesSettings({ onBack }: PoliciesSettingsProps) {
  const [policies, setPolicies] = useState([
    {
      id: 1,
      name: 'High-value expense approval',
      type: 'Expense',
      condition: 'Amount > €500',
      approver: 'Direct Manager',
      active: true
    },
    {
      id: 2,
      name: 'Extended leave approval',
      type: 'Leave',
      condition: 'Duration > 5 days',
      approver: 'HR Manager',
      active: true
    },
    {
      id: 3,
      name: 'Purchase order approval',
      type: 'Purchase',
      condition: 'Amount > €1,000',
      approver: 'Finance Manager',
      active: true
    },
    {
      id: 4,
      name: 'Travel pre-approval',
      type: 'Travel',
      condition: 'International travel',
      approver: 'Department Head',
      active: false
    }
  ]);

  const typeColors: any = {
    'Expense': { bg: '#FEF3C7', text: '#92400E' },
    'Leave': { bg: '#DBEAFE', text: '#1E40AF' },
    'Purchase': { bg: '#D1FAE5', text: '#065F46' },
    'Travel': { bg: '#FCE7F3', text: '#9F1239' }
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="bg-white border-b border-[#E5E7EB] sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={onBack} className="p-2 hover:bg-[#F3F4F6] rounded-lg transition-colors">
                <ChevronLeft className="w-5 h-5 text-[#6B7280]" />
              </button>
              <div>
                <h1 className="text-[20px] font-medium text-[#1F2937]">Policies</h1>
                <p className="text-[13px] text-[#6B7280]">Approval workflow rules and thresholds</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-[#0066FF] hover:bg-[#0052CC] text-white rounded-lg text-[14px] font-medium transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create Policy
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8 pb-24">
        <div className="grid gap-4">
          {policies.map((policy) => (
            <div key={policy.id} className="bg-white rounded-lg border border-[#E5E7EB] p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-10 h-10 rounded-lg bg-[#F0F4FF] flex items-center justify-center flex-shrink-0">
                    <Shield className="w-5 h-5 text-[#0066FF]" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-[15px] font-medium text-[#1F2937]">{policy.name}</h3>
                      <span
                        className="text-[11px] px-2 py-0.5 rounded font-medium"
                        style={{
                          backgroundColor: typeColors[policy.type]?.bg,
                          color: typeColors[policy.type]?.text
                        }}
                      >
                        {policy.type}
                      </span>
                      {!policy.active && (
                        <span className="text-[11px] px-2 py-0.5 rounded font-medium bg-[#F3F4F6] text-[#6B7280]">
                          Inactive
                        </span>
                      )}
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      <div>
                        <p className="text-[11px] font-medium text-[#9CA3AF] mb-0.5">Condition</p>
                        <p className="text-[13px] text-[#1F2937]">{policy.condition}</p>
                      </div>
                      <div>
                        <p className="text-[11px] font-medium text-[#9CA3AF] mb-0.5">Approver</p>
                        <p className="text-[13px] text-[#1F2937]">{policy.approver}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <button className="p-2 hover:bg-[#F3F4F6] rounded-lg transition-colors">
                    <Edit2 className="w-4 h-4 text-[#6B7280]" />
                  </button>
                  <button className="p-2 hover:bg-[#FEE2E2] rounded-lg transition-colors">
                    <Trash2 className="w-4 h-4 text-[#F87171]" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
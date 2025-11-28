import React from 'react';
import { Check, X, AlertCircle } from 'lucide-react';
import { PendingItem } from '../../api/dashboardApi';

interface PendingApprovalsWidgetProps {
  items?: PendingItem[];
}

// Default mock data
const defaultApprovals = [
  { id: '1', type: 'purchase' as const, title: 'Budget increase for BIOGEMSE', requestedBy: 'Charlie Day', requestedAt: '2h ago', status: 'pending', amount: '€12,500', urgent: true },
  { id: '2', type: 'leave' as const, title: 'Time off request', requestedBy: 'Alice Chen', requestedAt: '3h ago', status: 'pending', amount: 'Dec 23-27', urgent: false },
  { id: '3', type: 'purchase' as const, title: 'Equipment purchase', requestedBy: 'Bob Ross', requestedAt: 'Yesterday', status: 'pending', amount: '€8,200', urgent: false },
  { id: '4', type: 'expense' as const, title: 'Contractor approval', requestedBy: 'Emma Wilson', requestedAt: '2 days ago', status: 'pending', amount: '€5,400/mo', urgent: true }
];

export function PendingApprovalsWidget({ items }: PendingApprovalsWidgetProps) {
  // Use API data if available, otherwise fall back to mock data
  const approvals = items && items.length > 0 ? items : defaultApprovals;

  return (
    <div
      className="bg-white rounded-lg relative overflow-hidden"
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)', height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      {/* Colored top accent */}
      <div className="absolute left-0 right-0 top-0 h-1" style={{ background: 'linear-gradient(90deg, #F472B6 0%, #FBCFE8 100%)' }}></div>

      {/* Header */}
      <div className="px-3 py-2 border-b border-[#E5E7EB]" style={{ minHeight: '36px' }}>
        <div className="flex items-center gap-1.5">
          <AlertCircle className="w-4 h-4 text-[#F472B6]" />
          <h3 className="text-[14px] font-medium text-[#1F2937]">Pending Approvals</h3>
          {items && items.length > 0 && (
            <span className="text-[10px] text-[#10B981] font-medium">(Live)</span>
          )}
          <span className="w-4 h-4 rounded-full bg-[#F472B6] text-white text-[10px] font-bold flex items-center justify-center">
            {approvals.length}
          </span>
        </div>
      </div>

      {/* Approvals list */}
      <div className="px-3 py-1.5 custom-scrollbar" style={{ flex: 1, overflowY: 'auto' }}>
        <div className="space-y-1.5">
          {approvals.map((approval: any) => (
            <div
              key={approval.id}
              className="bg-[#FAFAFA] rounded-lg p-2 border border-[#F3F4F6] cursor-pointer hover:shadow-sm transition-all"
            >
              <div className="flex items-start justify-between mb-1.5">
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-[#1F2937] leading-tight truncate">
                    {approval.title}
                  </p>
                  <p className="text-[10px] text-[#9CA3AF] mt-0.5">
                    {approval.requestedBy || approval.requestor} • {approval.amount || approval.requestedAt}
                  </p>
                </div>
                {approval.urgent && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 bg-[#FEE2E2] text-[#DC2626] rounded ml-2 flex-shrink-0">
                    URGENT
                  </span>
                )}
              </div>
              <div className="flex gap-2 justify-between">
                <button className="bg-[#34D399] hover:bg-[#10B981] text-white text-[11px] font-medium px-3 py-1 rounded-lg flex items-center justify-center gap-1 transition-colors">
                  <Check className="w-3 h-3" />
                  Approve
                </button>
                <button className="bg-[#F87171] hover:bg-[#EF4444] text-white text-[11px] font-medium px-3 py-1 rounded-lg flex items-center justify-center gap-1 transition-colors">
                  <X className="w-3 h-3" />
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-3 py-1.5 border-t border-[#E5E7EB]" style={{ minHeight: '30px' }}>
        <button className="text-[11px] text-[#9CA3AF] hover:text-[#111827]">
          Settings
        </button>
      </div>
    </div>
  );
}

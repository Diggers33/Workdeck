import React from 'react';
import { Check, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { PendingItem } from '../../api/dashboardApi';

interface PendingApprovalsWidgetProps {
  items?: PendingItem[];
}

export function PendingApprovalsWidget({ items }: PendingApprovalsWidgetProps) {
  // Determine data state:
  // - undefined = API not called yet or failed
  // - [] = API returned empty (valid - nothing pending)
  // - array with items = show the items
  const isLoading = items === undefined;
  const isEmpty = Array.isArray(items) && items.length === 0;
  const hasItems = Array.isArray(items) && items.length > 0;

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
          {hasItems && (
            <>
              <span className="text-[10px] text-[#10B981] font-medium">(Live)</span>
              <span className="w-4 h-4 rounded-full bg-[#F472B6] text-white text-[10px] font-bold flex items-center justify-center">
                {items.length}
              </span>
            </>
          )}
        </div>
      </div>

      {/* Content area */}
      <div className="px-3 py-1.5 custom-scrollbar" style={{ flex: 1, overflowY: 'auto' }}>
        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full py-8 text-center">
            <div className="w-6 h-6 border-2 border-[#F472B6] border-t-transparent rounded-full animate-spin mb-2"></div>
            <p className="text-[12px] text-[#9CA3AF]">Loading approvals...</p>
          </div>
        )}

        {/* Empty state - all caught up! */}
        {isEmpty && (
          <div className="flex flex-col items-center justify-center h-full py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-[#D1FAE5] flex items-center justify-center mb-3">
              <CheckCircle2 className="w-6 h-6 text-[#10B981]" />
            </div>
            <p className="text-[13px] font-medium text-[#374151] mb-1">All caught up!</p>
            <p className="text-[11px] text-[#9CA3AF]">No pending approvals</p>
          </div>
        )}

        {/* Approvals list */}
        {hasItems && (
          <div className="space-y-1.5">
            {items.map((approval: any) => (
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
        )}
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

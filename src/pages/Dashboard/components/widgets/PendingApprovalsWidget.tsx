import React, { useState } from 'react';
import { Check, X, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PendingItem, approveItem, rejectItem, ApprovalType } from '../../api/dashboardApi';

interface PendingApprovalsWidgetProps {
  items?: PendingItem[];
  onRefresh?: () => void;
}

// Reject reason modal component
function RejectModal({
  isOpen,
  onClose,
  onConfirm,
  itemTitle,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  itemTitle: string;
}) {
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
        <div className="px-4 py-3 border-b border-[#E5E7EB]">
          <h3 className="text-[16px] font-semibold text-[#1F2937]">Reject Request</h3>
          <p className="text-[12px] text-[#6B7280] mt-1">Rejecting: {itemTitle}</p>
        </div>
        <div className="p-4">
          <label className="block text-[13px] font-medium text-[#374151] mb-2">
            Reason for rejection
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Please provide a reason..."
            className="w-full h-24 px-3 py-2 border border-[#D1D5DB] rounded-lg text-[13px] resize-none focus:outline-none focus:ring-2 focus:ring-[#F472B6] focus:border-transparent"
            autoFocus
          />
        </div>
        <div className="px-4 py-3 border-t border-[#E5E7EB] flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-[13px] font-medium text-[#6B7280] hover:bg-[#F3F4F6] rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm(reason);
              setReason('');
            }}
            disabled={!reason.trim()}
            className="px-4 py-2 text-[13px] font-medium text-white bg-[#F87171] hover:bg-[#EF4444] rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}

export function PendingApprovalsWidget({ items, onRefresh }: PendingApprovalsWidgetProps) {
  const navigate = useNavigate();
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());
  const [approvedIds, setApprovedIds] = useState<Set<string>>(new Set());
  const [rejectedIds, setRejectedIds] = useState<Set<string>>(new Set());
  const [rejectModalItem, setRejectModalItem] = useState<PendingItem | null>(null);
  // Determine data state:
  // - undefined = API not called yet or failed
  // - [] = API returned empty (valid - nothing pending)
  // - array with items = show the items
  const isLoading = items === undefined;

  // Filter out approved/rejected items
  const visibleItems = items?.filter(
    item => !approvedIds.has(item.id) && !rejectedIds.has(item.id)
  ) || [];
  const isEmpty = Array.isArray(items) && visibleItems.length === 0;
  const hasItems = visibleItems.length > 0;

  // Handle approve
  const handleApprove = async (item: PendingItem) => {
    setProcessingIds(prev => new Set(prev).add(item.id));

    try {
      await approveItem(item.type as ApprovalType, item.id);
      setApprovedIds(prev => new Set(prev).add(item.id));
      onRefresh?.();
    } catch (error) {
      console.error('Failed to approve item:', error);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(item.id);
        return newSet;
      });
    }
  };

  // Handle reject (after modal confirmation)
  const handleReject = async (item: PendingItem, reason: string) => {
    setRejectModalItem(null);
    setProcessingIds(prev => new Set(prev).add(item.id));

    try {
      await rejectItem(item.type as ApprovalType, item.id, reason);
      setRejectedIds(prev => new Set(prev).add(item.id));
      onRefresh?.();
    } catch (error) {
      console.error('Failed to reject item:', error);
    } finally {
      setProcessingIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(item.id);
        return newSet;
      });
    }
  };

  // Navigate to approval details
  const handleItemClick = (item: PendingItem) => {
    switch (item.type) {
      case 'leave':
        navigate(`/leave/requests/${item.id}`);
        break;
      case 'expense':
        navigate(`/expenses/${item.id}`);
        break;
      case 'purchase':
        navigate(`/purchases/${item.id}`);
        break;
      case 'timesheet':
        navigate(`/time/timesheets/${item.id}`);
        break;
      default:
        break;
    }
  };

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
            {visibleItems.map((approval) => {
              const isProcessing = processingIds.has(approval.id);

              return (
                <div
                  key={approval.id}
                  className="bg-[#FAFAFA] rounded-lg p-2 border border-[#F3F4F6] hover:shadow-sm transition-all"
                >
                  <div
                    className="flex items-start justify-between mb-1.5 cursor-pointer"
                    onClick={() => handleItemClick(approval)}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-[12px] font-medium text-[#1F2937] leading-tight truncate">
                        {approval.title}
                      </p>
                      <p className="text-[10px] text-[#9CA3AF] mt-0.5">
                        {approval.requestedBy} • {approval.requestedAt}
                      </p>
                    </div>
                    {/* Type badge */}
                    <span className="text-[9px] font-medium px-1.5 py-0.5 bg-[#F3F4F6] text-[#6B7280] rounded ml-2 flex-shrink-0 capitalize">
                      {approval.type}
                    </span>
                  </div>
                  <div className="flex gap-2 justify-between">
                    <button
                      onClick={() => handleApprove(approval)}
                      disabled={isProcessing}
                      className="flex-1 bg-[#34D399] hover:bg-[#10B981] text-white text-[11px] font-medium px-3 py-1 rounded-lg flex items-center justify-center gap-1 transition-colors disabled:opacity-50"
                    >
                      {isProcessing ? (
                        <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Check className="w-3 h-3" />
                      )}
                      Approve
                    </button>
                    <button
                      onClick={() => setRejectModalItem(approval)}
                      disabled={isProcessing}
                      className="flex-1 bg-[#F87171] hover:bg-[#EF4444] text-white text-[11px] font-medium px-3 py-1 rounded-lg flex items-center justify-center gap-1 transition-colors disabled:opacity-50"
                    >
                      <X className="w-3 h-3" />
                      Reject
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-1.5 border-t border-[#E5E7EB]" style={{ minHeight: '30px' }}>
        <button
          onClick={() => navigate('/approvals')}
          className="text-[11px] text-[#3B82F6] hover:text-[#2563EB]"
        >
          View all →
        </button>
      </div>

      {/* Reject reason modal */}
      <RejectModal
        isOpen={!!rejectModalItem}
        onClose={() => setRejectModalItem(null)}
        onConfirm={(reason) => rejectModalItem && handleReject(rejectModalItem, reason)}
        itemTitle={rejectModalItem?.title || ''}
      />
    </div>
  );
}

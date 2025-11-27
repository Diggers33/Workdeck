import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Receipt, ShoppingCart, Paperclip, Zap, MoreHorizontal, ChevronDown } from 'lucide-react';
import { useSpending, SpendingType, SpendingRequest, SpendingStatus } from '../../../contexts/SpendingContext';
import { NewRequestModal } from './NewRequestModal';
import { ExpenseDetailView } from './ExpenseDetailView';
import { PurchaseDetailView } from './PurchaseDetailView';

type TabType = 'my-requests' | 'pending-approval' | 'team' | 'processing';
type SavedView = 'all' | 'drafts' | 'pending' | 'needs-receipt' | 'this-month' | 'approved';

interface SpendingViewProps {
  scrollContainerRef?: React.RefObject<HTMLDivElement>;
}

export function SpendingView({ scrollContainerRef }: SpendingViewProps) {
  const { requests, currentUser } = useSpending();
  const [activeTab, setActiveTab] = useState<TabType>('my-requests');
  const [savedView, setSavedView] = useState<SavedView>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [detailView, setDetailView] = useState<{ type: SpendingType; requestId: string } | null>(null);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  // Scroll to top when detailView changes
  useEffect(() => {
    if (scrollContainerRef?.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [detailView, scrollContainerRef]);

  // Calculate pending approval count
  const pendingApprovalCount = useMemo(() => {
    if (!currentUser.isManager) return 0;
    return requests.filter(
      req => req.status === 'Pending' && currentUser.directReports.includes(req.userId)
    ).length;
  }, [requests, currentUser]);

  // Get requests based on active tab
  const tabRequests = useMemo(() => {
    switch (activeTab) {
      case 'my-requests':
        return requests.filter(req => req.userId === currentUser.id);
      case 'pending-approval':
        return requests.filter(
          req => req.status === 'Pending' && currentUser.directReports.includes(req.userId)
        );
      case 'team':
        return requests.filter(req =>
          currentUser.directReports.includes(req.userId) || req.userId === currentUser.id
        );
      case 'processing':
        return requests.filter(req => req.status === 'Approved' || req.status === 'Processing');
      default:
        return [];
    }
  }, [requests, currentUser, activeTab]);

  // Apply saved view filter
  const filteredRequests = useMemo(() => {
    let filtered = tabRequests;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    switch (savedView) {
      case 'drafts':
        filtered = filtered.filter(req => req.status === 'Draft');
        break;
      case 'pending':
        filtered = filtered.filter(req => req.status === 'Pending');
        break;
      case 'needs-receipt':
        filtered = filtered.filter(req =>
          req.lineItems.some(item => !item.receiptUrl) && req.status !== 'Denied'
        );
        break;
      case 'this-month':
        filtered = filtered.filter(req => new Date(req.createdAt) >= startOfMonth);
        break;
      case 'approved':
        filtered = filtered.filter(req => req.status === 'Approved');
        break;
    }

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(req =>
        req.purpose.toLowerCase().includes(query) ||
        req.referenceNumber.toLowerCase().includes(query)
      );
    }

    // Sort by date (newest first)
    return filtered.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [tabRequests, savedView, searchQuery]);

  // Saved view counts
  const viewCounts = useMemo(() => {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    return {
      all: tabRequests.length,
      drafts: tabRequests.filter(r => r.status === 'Draft').length,
      pending: tabRequests.filter(r => r.status === 'Pending').length,
      'needs-receipt': tabRequests.filter(r =>
        r.lineItems.some(item => !item.receiptUrl) && r.status !== 'Denied'
      ).length,
      'this-month': tabRequests.filter(r => new Date(r.createdAt) >= startOfMonth).length,
      approved: tabRequests.filter(r => r.status === 'Approved').length,
    };
  }, [tabRequests]);

  const tabs = [
    { id: 'my-requests' as TabType, label: 'My Requests', visible: true },
    {
      id: 'pending-approval' as TabType,
      label: 'Pending',
      badge: pendingApprovalCount,
      visible: currentUser.isManager
    },
    { id: 'team' as TabType, label: 'Team', visible: true },
    {
      id: 'processing' as TabType,
      label: 'Processing',
      visible: currentUser.isExpenseAdmin || currentUser.isPurchaseAdmin
    },
  ].filter(tab => tab.visible);

  const savedViews: { id: SavedView; label: string; count?: number }[] = [
    { id: 'all', label: 'All', count: viewCounts.all },
    { id: 'drafts', label: 'Drafts', count: viewCounts.drafts },
    { id: 'pending', label: 'Pending', count: viewCounts.pending },
    { id: 'needs-receipt', label: 'Needs Receipt', count: viewCounts['needs-receipt'] },
    { id: 'this-month', label: 'This Month', count: viewCounts['this-month'] },
  ];

  const handleRequestCreated = (requestId: string, type: SpendingType) => {
    if (scrollContainerRef?.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
    setDetailView({ type, requestId });
  };

  const handleRowClick = (request: SpendingRequest) => {
    if (scrollContainerRef?.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
    setDetailView({ type: request.type, requestId: request.id });
  };

  const handleBack = () => {
    if (scrollContainerRef?.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
    setDetailView(null);
  };

  // Format helpers
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusDisplay = (request: SpendingRequest) => {
    const status = request.status;
    const submittedDate = request.submittedDate ? new Date(request.submittedDate) : null;
    const daysAgo = submittedDate
      ? Math.floor((Date.now() - submittedDate.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    switch (status) {
      case 'Draft':
        return { icon: '○', label: 'Draft', color: '#6B7280', bg: '#F3F4F6' };
      case 'Pending':
        return {
          icon: '●',
          label: daysAgo > 0 ? `${daysAgo}d` : 'Today',
          color: '#D97706',
          bg: '#FEF3C7'
        };
      case 'Approved':
        return { icon: '✓', label: 'Approved', color: '#059669', bg: '#D1FAE5' };
      case 'Denied':
        return { icon: '✗', label: 'Denied', color: '#DC2626', bg: '#FEE2E2' };
      case 'Processing':
        return { icon: '⟳', label: 'Processing', color: '#2563EB', bg: '#DBEAFE' };
      case 'Finalized':
      case 'Received':
        return { icon: '✓', label: 'Complete', color: '#059669', bg: '#D1FAE5' };
      default:
        return { icon: '○', label: status, color: '#6B7280', bg: '#F3F4F6' };
    }
  };

  const hasReceiptIssue = (request: SpendingRequest) => {
    return request.lineItems.some(item => !item.receiptUrl) &&
           !['Draft', 'Denied'].includes(request.status);
  };

  // If viewing detail, show that instead
  if (detailView) {
    if (detailView.type === 'Expense') {
      return (
        <ExpenseDetailView
          requestId={detailView.requestId}
          onBack={handleBack}
        />
      );
    }
    return (
      <PurchaseDetailView
        requestId={detailView.requestId}
        onBack={handleBack}
      />
    );
  }

  return (
    <div style={{ backgroundColor: '#F9FAFB', minHeight: '100%' }}>
      {/* HEADER - 48px */}
      <div
        style={{
          height: '48px',
          backgroundColor: 'white',
          borderBottom: '1px solid #E5E7EB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
        }}
      >
        <h1 style={{ fontSize: '18px', fontWeight: 600, color: '#111827', margin: 0 }}>
          Spending
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Search trigger */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '6px 12px',
              backgroundColor: '#F3F4F6',
              borderRadius: '6px',
              cursor: 'pointer',
              width: '200px',
            }}
            onClick={() => document.getElementById('spending-search')?.focus()}
          >
            <Search size={14} color="#9CA3AF" />
            <input
              id="spending-search"
              type="text"
              placeholder="Search... ⌘K"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                border: 'none',
                background: 'transparent',
                fontSize: '13px',
                color: '#374151',
                outline: 'none',
                width: '100%',
              }}
            />
          </div>
          <button
            onClick={() => setShowNewRequestModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              height: '32px',
              padding: '0 12px',
              backgroundColor: '#2563EB',
              color: 'white',
              fontSize: '13px',
              fontWeight: 600,
              borderRadius: '6px',
              border: 'none',
              cursor: 'pointer',
            }}
          >
            <Plus size={14} />
            New
          </button>
        </div>
      </div>

      {/* TABS - 48px */}
      <div
        style={{
          height: '48px',
          backgroundColor: 'white',
          borderBottom: '1px solid #E5E7EB',
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          gap: '24px',
        }}
      >
        {tabs.map(tab => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                position: 'relative',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                fontSize: '13px',
                fontWeight: 500,
                color: isActive ? '#111827' : '#6B7280',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              {tab.label}
              {tab.badge !== undefined && tab.badge > 0 && (
                <span
                  style={{
                    padding: '2px 6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    backgroundColor: '#FEE2E2',
                    color: '#DC2626',
                    borderRadius: '4px',
                  }}
                >
                  {tab.badge}
                </span>
              )}
              {isActive && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: '2px',
                    backgroundColor: '#2563EB',
                  }}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* SAVED VIEWS BAR - 44px */}
      <div
        style={{
          height: '44px',
          backgroundColor: 'white',
          borderBottom: '1px solid #E5E7EB',
          display: 'flex',
          alignItems: 'center',
          padding: '0 24px',
          gap: '8px',
        }}
      >
        {savedViews.map(view => {
          const isActive = savedView === view.id;
          const hasItems = (view.count ?? 0) > 0;
          return (
            <button
              key={view.id}
              onClick={() => setSavedView(view.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                height: '28px',
                padding: '0 10px',
                fontSize: '12px',
                fontWeight: 500,
                color: isActive ? '#2563EB' : hasItems ? '#374151' : '#9CA3AF',
                backgroundColor: isActive ? '#EFF6FF' : 'transparent',
                border: isActive ? '1px solid #BFDBFE' : '1px solid transparent',
                borderRadius: '6px',
                cursor: hasItems || view.id === 'all' ? 'pointer' : 'default',
                opacity: hasItems || view.id === 'all' ? 1 : 0.5,
              }}
            >
              {view.label}
              {view.count !== undefined && view.count > 0 && (
                <span style={{
                  color: isActive ? '#2563EB' : '#9CA3AF',
                  fontSize: '11px',
                }}>
                  {view.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* DATA TABLE */}
      <div style={{ padding: '16px 24px' }}>
        {filteredRequests.length === 0 ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '64px 0',
              color: '#6B7280',
            }}
          >
            <Receipt size={32} strokeWidth={1.5} color="#D1D5DB" />
            <div style={{ marginTop: '12px', fontSize: '14px' }}>
              {searchQuery ? 'No matching requests' : 'No requests yet'}
            </div>
          </div>
        ) : (
          <div
            style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              overflow: 'hidden',
            }}
          >
            {/* Table Header */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '32px 100px 1fr 100px 80px 40px',
                gap: '12px',
                padding: '10px 16px',
                backgroundColor: '#F9FAFB',
                borderBottom: '1px solid #E5E7EB',
                fontSize: '11px',
                fontWeight: 600,
                color: '#6B7280',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              <div></div>
              <div>Reference</div>
              <div>Description</div>
              <div style={{ textAlign: 'right' }}>Amount</div>
              <div>Status</div>
              <div></div>
            </div>

            {/* Table Rows */}
            {filteredRequests.map(request => {
              const status = getStatusDisplay(request);
              const isHovered = hoveredRow === request.id;
              const needsReceipt = hasReceiptIssue(request);
              const isUrgent = request.isAsap;

              return (
                <div
                  key={request.id}
                  onClick={() => handleRowClick(request)}
                  onMouseEnter={() => setHoveredRow(request.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '32px 100px 1fr 100px 80px 40px',
                    gap: '12px',
                    padding: '12px 16px',
                    borderBottom: '1px solid #F3F4F6',
                    cursor: 'pointer',
                    backgroundColor: isHovered ? '#F9FAFB' : 'white',
                    transition: 'background-color 100ms',
                  }}
                >
                  {/* Type Icon */}
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    {request.type === 'Expense' ? (
                      <Receipt size={16} color="#6B7280" />
                    ) : (
                      <ShoppingCart size={16} color="#6B7280" />
                    )}
                  </div>

                  {/* Reference */}
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#111827',
                      display: 'flex',
                      alignItems: 'center',
                    }}
                  >
                    {request.referenceNumber.replace('EXP-2024-', 'E').replace('PUR-2024-', 'P')}
                  </div>

                  {/* Description */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', minWidth: 0 }}>
                    <span
                      style={{
                        fontSize: '14px',
                        fontWeight: 400,
                        color: '#111827',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {request.purpose}
                    </span>
                    {isUrgent && (
                      <Zap size={12} color="#F59E0B" fill="#F59E0B" title="Urgent" />
                    )}
                    {needsReceipt && (
                      <Paperclip size={12} color="#DC2626" title="Missing receipt" />
                    )}
                  </div>

                  {/* Amount */}
                  <div
                    style={{
                      fontSize: '14px',
                      fontWeight: 500,
                      color: '#111827',
                      textAlign: 'right',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'flex-end',
                    }}
                  >
                    {formatCurrency(request.total)}
                  </div>

                  {/* Status */}
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '2px 8px',
                        fontSize: '11px',
                        fontWeight: 500,
                        color: status.color,
                        backgroundColor: status.bg,
                        borderRadius: '4px',
                      }}
                    >
                      <span style={{ fontSize: '10px' }}>{status.icon}</span>
                      {status.label}
                    </span>
                  </div>

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    {isHovered && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          // TODO: Show actions menu
                        }}
                        style={{
                          width: '24px',
                          height: '24px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          borderRadius: '4px',
                        }}
                      >
                        <MoreHorizontal size={14} color="#6B7280" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* New Request Modal */}
      {showNewRequestModal && (
        <NewRequestModal
          onClose={() => setShowNewRequestModal(false)}
          onRequestCreated={handleRequestCreated}
        />
      )}
    </div>
  );
}

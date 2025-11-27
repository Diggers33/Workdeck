import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Receipt, ShoppingCart, Paperclip, Zap, MoreHorizontal, ChevronDown, Play, Package, CheckCircle } from 'lucide-react';
import { useSpending, SpendingType, SpendingRequest, SpendingStatus } from '../../../contexts/SpendingContext';
import { NewRequestModal } from './NewRequestModal';
import { ExpenseDetailView } from './ExpenseDetailView';
import { PurchaseDetailView } from './PurchaseDetailView';
import { MarkAsOrderedModal, MarkAsReceivedModal, MarkAsFinalizedModal } from './ProcessingActionModals';

type TabType = 'my-requests' | 'pending-approval' | 'team' | 'processing';
type SavedView = 'all' | 'drafts' | 'pending' | 'needs-receipt' | 'this-month' | 'approved';
type ProcessingTypeFilter = 'expenses' | 'purchases';
type ProcessingSavedView = 'approved' | 'processing' | 'ordered' | 'received' | 'finalized';

interface SpendingViewProps {
  scrollContainerRef?: React.RefObject<HTMLDivElement>;
}

export function SpendingView({ scrollContainerRef }: SpendingViewProps) {
  const {
    requests,
    currentUser,
    getUserById,
    startProcessing,
    markAsOrdered,
    markAsReceived,
    markAsFinalized
  } = useSpending();
  const [activeTab, setActiveTab] = useState<TabType>('my-requests');
  const [savedView, setSavedView] = useState<SavedView>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [detailView, setDetailView] = useState<{ type: SpendingType; requestId: string } | null>(null);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);

  // Processing tab specific state
  const [processingTypeFilter, setProcessingTypeFilter] = useState<ProcessingTypeFilter>(() => {
    // Default to expenses if admin, otherwise purchases
    if (currentUser.isExpenseAdmin) return 'expenses';
    if (currentUser.isPurchaseAdmin) return 'purchases';
    return 'expenses';
  });
  const [processingSavedView, setProcessingSavedView] = useState<ProcessingSavedView>('approved');

  // Processing action modals
  const [orderModalRequest, setOrderModalRequest] = useState<SpendingRequest | null>(null);
  const [receivedModalRequest, setReceivedModalRequest] = useState<SpendingRequest | null>(null);
  const [finalizedModalRequest, setFinalizedModalRequest] = useState<SpendingRequest | null>(null);

  // Toast notification state
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' } | null>(null);

  // Show toast helper
  const showToast = (message: string, type: 'success' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

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
      case 'processing': {
        // Filter by type first (Expenses or Purchases)
        const typeFilter = processingTypeFilter === 'expenses' ? 'Expense' : 'Purchase';
        let filtered = requests.filter(req => req.type === typeFilter);

        // For expenses: Approved, Processing, Finalized
        // For purchases: Approved, Processing, Ordered, Received
        if (processingTypeFilter === 'expenses') {
          filtered = filtered.filter(req =>
            ['Approved', 'Processing', 'Finalized'].includes(req.status)
          );
        } else {
          filtered = filtered.filter(req =>
            ['Approved', 'Processing', 'Ordered', 'Received'].includes(req.status)
          );
        }
        return filtered;
      }
      default:
        return [];
    }
  }, [requests, currentUser, activeTab, processingTypeFilter]);

  // Apply saved view filter
  const filteredRequests = useMemo(() => {
    let filtered = tabRequests;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Processing tab uses its own saved view
    if (activeTab === 'processing') {
      switch (processingSavedView) {
        case 'approved':
          filtered = filtered.filter(req => req.status === 'Approved');
          break;
        case 'processing':
          filtered = filtered.filter(req => req.status === 'Processing');
          break;
        case 'ordered':
          filtered = filtered.filter(req => req.status === 'Ordered');
          break;
        case 'received':
          filtered = filtered.filter(req => req.status === 'Received');
          break;
        case 'finalized':
          filtered = filtered.filter(req => req.status === 'Finalized');
          break;
      }
    } else {
      // Regular tabs use standard saved views
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
  }, [tabRequests, savedView, searchQuery, activeTab, processingSavedView]);

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

  // Processing tab view counts
  const processingViewCounts = useMemo(() => {
    return {
      approved: tabRequests.filter(r => r.status === 'Approved').length,
      processing: tabRequests.filter(r => r.status === 'Processing').length,
      ordered: tabRequests.filter(r => r.status === 'Ordered').length,
      received: tabRequests.filter(r => r.status === 'Received').length,
      finalized: tabRequests.filter(r => r.status === 'Finalized').length,
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

  // Get processor info for display in rows
  const getProcessorInfo = (request: SpendingRequest): { text: string; subText?: string } | null => {
    const formatTimeAgo = (dateStr: string) => {
      const date = new Date(dateStr);
      const now = new Date();
      const diffHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
      if (diffHours < 1) return 'just now';
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) return 'yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
      return date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' });
    };

    if (request.status === 'Processing' && request.processingStartedBy) {
      const user = getUserById(request.processingStartedBy);
      const time = request.processingStartedDate ? formatTimeAgo(request.processingStartedDate) : '';
      return {
        text: `by ${user?.name?.split(' ')[0] || 'Admin'}`,
        subText: time
      };
    }

    if (request.status === 'Ordered' && request.orderedBy) {
      const user = getUserById(request.orderedBy);
      return {
        text: request.poNumber || '',
        subText: `by ${user?.name?.split(' ')[0] || 'Admin'}`
      };
    }

    if (request.status === 'Received' && request.receivedBy) {
      const user = getUserById(request.receivedBy);
      const date = request.receivedDate
        ? new Date(request.receivedDate).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })
        : '';
      return {
        text: `by ${user?.name?.split(' ')[0] || 'Admin'}`,
        subText: date
      };
    }

    if (request.status === 'Finalized' && request.finalizedBy) {
      const user = getUserById(request.finalizedBy);
      const date = request.paymentDate
        ? new Date(request.paymentDate).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })
        : '';
      return {
        text: `by ${user?.name?.split(' ')[0] || 'Admin'}`,
        subText: date
      };
    }

    return null;
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
        {activeTab === 'processing' ? (
          <>
            {/* Type toggle for Processing tab */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                backgroundColor: '#F3F4F6',
                borderRadius: '6px',
                padding: '2px',
                marginRight: '12px',
              }}
            >
              {currentUser.isExpenseAdmin && (
                <button
                  onClick={() => {
                    setProcessingTypeFilter('expenses');
                    setProcessingSavedView('approved');
                  }}
                  style={{
                    padding: '4px 12px',
                    fontSize: '12px',
                    fontWeight: 500,
                    color: processingTypeFilter === 'expenses' ? '#111827' : '#6B7280',
                    backgroundColor: processingTypeFilter === 'expenses' ? 'white' : 'transparent',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    boxShadow: processingTypeFilter === 'expenses' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                  }}
                >
                  Expenses
                </button>
              )}
              {currentUser.isPurchaseAdmin && (
                <button
                  onClick={() => {
                    setProcessingTypeFilter('purchases');
                    setProcessingSavedView('approved');
                  }}
                  style={{
                    padding: '4px 12px',
                    fontSize: '12px',
                    fontWeight: 500,
                    color: processingTypeFilter === 'purchases' ? '#111827' : '#6B7280',
                    backgroundColor: processingTypeFilter === 'purchases' ? 'white' : 'transparent',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    boxShadow: processingTypeFilter === 'purchases' ? '0 1px 2px rgba(0,0,0,0.05)' : 'none',
                  }}
                >
                  Purchases
                </button>
              )}
            </div>

            {/* Divider */}
            <div style={{ width: '1px', height: '20px', backgroundColor: '#E5E7EB' }} />

            {/* Processing saved views based on type */}
            {processingTypeFilter === 'expenses' ? (
              // Expense processing views: Approved, Processing, Finalized
              <>
                {(['approved', 'processing', 'finalized'] as ProcessingSavedView[]).map(view => {
                  const isActive = processingSavedView === view;
                  const count = processingViewCounts[view];
                  const hasItems = count > 0;
                  const labels: Record<ProcessingSavedView, string> = {
                    approved: 'Approved',
                    processing: 'Processing',
                    finalized: 'Finalized',
                    ordered: 'Ordered',
                    received: 'Received',
                  };
                  return (
                    <button
                      key={view}
                      onClick={() => setProcessingSavedView(view)}
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
                        cursor: 'pointer',
                      }}
                    >
                      {labels[view]}
                      {count > 0 && (
                        <span style={{
                          color: isActive ? '#2563EB' : '#9CA3AF',
                          fontSize: '11px',
                        }}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </>
            ) : (
              // Purchase processing views: Approved, Processing, Ordered, Received
              <>
                {(['approved', 'processing', 'ordered', 'received'] as ProcessingSavedView[]).map(view => {
                  const isActive = processingSavedView === view;
                  const count = processingViewCounts[view];
                  const hasItems = count > 0;
                  const labels: Record<ProcessingSavedView, string> = {
                    approved: 'Approved',
                    processing: 'Processing',
                    ordered: 'Ordered',
                    received: 'Received',
                    finalized: 'Finalized',
                  };
                  return (
                    <button
                      key={view}
                      onClick={() => setProcessingSavedView(view)}
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
                        cursor: 'pointer',
                      }}
                    >
                      {labels[view]}
                      {count > 0 && (
                        <span style={{
                          color: isActive ? '#2563EB' : '#9CA3AF',
                          fontSize: '11px',
                        }}>
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </>
            )}
          </>
        ) : (
          // Regular saved views for other tabs
          savedViews.map(view => {
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
          })
        )}
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
                gridTemplateColumns: activeTab === 'processing' && processingTypeFilter === 'purchases'
                  ? '32px 80px 1fr 90px 80px 140px 120px'
                  : '32px 100px 1fr 100px 80px 120px',
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
              {activeTab === 'processing' && processingTypeFilter === 'purchases' && (
                <div>PO / Delivery</div>
              )}
              <div style={{ textAlign: 'right' }}>Actions</div>
            </div>

            {/* Table Rows */}
            {filteredRequests.map(request => {
              const status = getStatusDisplay(request);
              const isHovered = hoveredRow === request.id;
              const needsReceipt = hasReceiptIssue(request);
              const isUrgent = request.isAsap;
              const isProcessingTab = activeTab === 'processing';
              const isPurchaseProcessing = isProcessingTab && processingTypeFilter === 'purchases';

              // Get PO/Delivery info for ordered purchases
              const getDeliveryInfo = () => {
                if (!request.poNumber && !request.expectedDeliveryDate) return null;
                const parts = [];
                if (request.poNumber) parts.push(request.poNumber);
                if (request.expectedDeliveryDate) {
                  const expDate = new Date(request.expectedDeliveryDate);
                  const today = new Date();
                  today.setHours(0, 0, 0, 0);
                  const diffDays = Math.ceil((expDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  if (diffDays < 0) {
                    parts.push(`Overdue ${Math.abs(diffDays)}d`);
                  } else if (diffDays === 0) {
                    parts.push('Due today');
                  } else {
                    parts.push(`Due in ${diffDays}d`);
                  }
                }
                return parts.join(' · ');
              };

              // Get action button for processing tab
              const getProcessingAction = () => {
                if (!isProcessingTab) return null;

                if (request.type === 'Expense') {
                  if (request.status === 'Approved') {
                    return {
                      label: 'Start Processing',
                      icon: Play,
                      color: '#2563EB',
                      bg: '#EFF6FF',
                      onClick: () => {
                        startProcessing(request.id);
                        const shortRef = request.referenceNumber.replace('EXP-2024-', 'E');
                        showToast(`Started processing ${shortRef}`);
                      }
                    };
                  }
                  if (request.status === 'Processing') {
                    return {
                      label: 'Mark Finalized',
                      icon: CheckCircle,
                      color: '#059669',
                      bg: '#ECFDF5',
                      onClick: () => setFinalizedModalRequest(request)
                    };
                  }
                } else {
                  // Purchase
                  if (request.status === 'Approved') {
                    return {
                      label: 'Start Processing',
                      icon: Play,
                      color: '#2563EB',
                      bg: '#EFF6FF',
                      onClick: () => {
                        startProcessing(request.id);
                        const shortRef = request.referenceNumber.replace('PUR-2024-', 'P');
                        showToast(`Started processing ${shortRef}`);
                      }
                    };
                  }
                  if (request.status === 'Processing') {
                    return {
                      label: 'Mark Ordered',
                      icon: Package,
                      color: '#7C3AED',
                      bg: '#F5F3FF',
                      onClick: () => setOrderModalRequest(request)
                    };
                  }
                  if (request.status === 'Ordered') {
                    return {
                      label: 'Mark Received',
                      icon: CheckCircle,
                      color: '#059669',
                      bg: '#ECFDF5',
                      onClick: () => setReceivedModalRequest(request)
                    };
                  }
                }
                return null;
              };

              const processingAction = getProcessingAction();
              const deliveryInfo = getDeliveryInfo();

              return (
                <div
                  key={request.id}
                  onClick={() => handleRowClick(request)}
                  onMouseEnter={() => setHoveredRow(request.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: isPurchaseProcessing
                      ? '32px 80px 1fr 90px 80px 140px 120px'
                      : '32px 100px 1fr 100px 80px 120px',
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
                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
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
                    {/* Processor info for processing/ordered/received/finalized statuses */}
                    {isProcessingTab && (() => {
                      const processorInfo = getProcessorInfo(request);
                      if (!processorInfo) return null;
                      return (
                        <div style={{ fontSize: '11px', color: '#6B7280', marginTop: '2px' }}>
                          {processorInfo.text}
                          {processorInfo.subText && (
                            <span style={{ color: '#9CA3AF' }}> · {processorInfo.subText}</span>
                          )}
                        </div>
                      );
                    })()}
                  </div>

                  {/* PO / Delivery Info - only for purchase processing */}
                  {isPurchaseProcessing && (
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {deliveryInfo ? (
                        <span
                          style={{
                            fontSize: '12px',
                            color: deliveryInfo.includes('Overdue') ? '#DC2626' : '#6B7280',
                            fontWeight: deliveryInfo.includes('Overdue') ? 500 : 400,
                          }}
                        >
                          {deliveryInfo}
                        </span>
                      ) : (
                        <span style={{ fontSize: '12px', color: '#9CA3AF' }}>—</span>
                      )}
                    </div>
                  )}

                  {/* Actions */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                    {isProcessingTab && processingAction ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          processingAction.onClick();
                        }}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '4px 10px',
                          fontSize: '12px',
                          fontWeight: 500,
                          color: processingAction.color,
                          backgroundColor: isHovered ? processingAction.bg : 'transparent',
                          border: `1px solid ${isHovered ? processingAction.color : 'transparent'}`,
                          borderRadius: '6px',
                          cursor: 'pointer',
                          transition: 'all 100ms',
                        }}
                      >
                        <processingAction.icon size={14} />
                        {processingAction.label}
                      </button>
                    ) : (
                      isHovered && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
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
                      )
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

      {/* Processing Action Modals */}
      {orderModalRequest && (
        <MarkAsOrderedModal
          request={orderModalRequest}
          onClose={() => setOrderModalRequest(null)}
          onConfirm={(poNumber, expectedDeliveryDate, notes) => {
            markAsOrdered(orderModalRequest.id, poNumber, expectedDeliveryDate, notes);
            const shortRef = orderModalRequest.referenceNumber.replace('PUR-2024-', 'P');
            showToast(`${shortRef} marked as ordered`);
            setOrderModalRequest(null);
          }}
        />
      )}

      {receivedModalRequest && (
        <MarkAsReceivedModal
          request={receivedModalRequest}
          onClose={() => setReceivedModalRequest(null)}
          onConfirm={(receivedDate, receivedInFull, notes) => {
            markAsReceived(receivedModalRequest.id, receivedDate, receivedInFull, notes);
            const shortRef = receivedModalRequest.referenceNumber.replace('PUR-2024-', 'P');
            showToast(`${shortRef} marked as received`);
            setReceivedModalRequest(null);
          }}
        />
      )}

      {finalizedModalRequest && (
        <MarkAsFinalizedModal
          request={finalizedModalRequest}
          onClose={() => setFinalizedModalRequest(null)}
          onConfirm={(paymentReference, paymentDate, notes) => {
            markAsFinalized(finalizedModalRequest.id, paymentReference, paymentDate, notes);
            const shortRef = finalizedModalRequest.referenceNumber.replace('EXP-2024-', 'E');
            showToast(`${shortRef} finalized`);
            setFinalizedModalRequest(null);
          }}
        />
      )}

      {/* Toast Notification */}
      {toast && (
        <div
          style={{
            position: 'fixed',
            bottom: '24px',
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '12px 20px',
            backgroundColor: toast.type === 'success' ? '#059669' : '#2563EB',
            color: 'white',
            fontSize: '14px',
            fontWeight: 500,
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            zIndex: 1000,
            animation: 'slideUp 0.2s ease-out',
          }}
        >
          <CheckCircle size={16} />
          {toast.message}
        </div>
      )}

      {/* Toast animation styles */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateX(-50%) translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateX(-50%) translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

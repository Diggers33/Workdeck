import React, { useState } from 'react';
import { X, Calendar, Package, CheckCircle, User } from 'lucide-react';
import { SpendingRequest, useSpending } from '../../../contexts/SpendingContext';

interface MarkAsOrderedModalProps {
  request: SpendingRequest;
  onClose: () => void;
  onConfirm: (poNumber?: string, expectedDeliveryDate?: string, notes?: string) => void;
}

export function MarkAsOrderedModal({ request, onClose, onConfirm }: MarkAsOrderedModalProps) {
  const { currentUser } = useSpending();
  const [poNumber, setPoNumber] = useState('');
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState('');
  const [notes, setNotes] = useState('');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const shortRef = request.referenceNumber.replace('PUR-2024-', 'P');

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '480px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid #E5E7EB',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Package size={20} color="#2563EB" />
            <span style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>
              Mark as Ordered
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '6px',
            }}
          >
            <X size={18} color="#6B7280" />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px' }}>
          {/* Request info */}
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: '#F9FAFB',
              borderRadius: '8px',
              marginBottom: '16px',
            }}
          >
            <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>
              {shortRef} · {request.purpose} · {formatCurrency(request.total)}
            </div>
          </div>

          {/* User confirmation */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 12px',
              backgroundColor: '#EFF6FF',
              borderRadius: '8px',
              marginBottom: '20px',
              border: '1px solid #BFDBFE',
            }}
          >
            <User size={16} color="#2563EB" />
            <span style={{ fontSize: '13px', color: '#1E40AF' }}>
              You ({currentUser.name}) are marking this as ordered
            </span>
          </div>

          {/* PO Number */}
          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 500,
                color: '#374151',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '6px',
              }}
            >
              PO NUMBER
            </label>
            <input
              type="text"
              value={poNumber}
              onChange={(e) => setPoNumber(e.target.value)}
              placeholder="PO-2024-0123"
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                outline: 'none',
              }}
            />
            <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>
              Optional
            </div>
          </div>

          {/* Expected Delivery */}
          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 500,
                color: '#374151',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '6px',
              }}
            >
              EXPECTED DELIVERY
            </label>
            <input
              type="date"
              value={expectedDeliveryDate}
              onChange={(e) => setExpectedDeliveryDate(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                outline: 'none',
              }}
            />
            <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>
              Optional
            </div>
          </div>

          {/* Notes */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 500,
                color: '#374151',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '6px',
              }}
            >
              NOTES
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes..."
              rows={3}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                outline: 'none',
                resize: 'none',
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            padding: '16px 20px',
            borderTop: '1px solid #E5E7EB',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 500,
              color: '#374151',
              backgroundColor: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(poNumber || undefined, expectedDeliveryDate || undefined, notes || undefined)}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 500,
              color: 'white',
              backgroundColor: '#2563EB',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Confirm Ordered
          </button>
        </div>
      </div>
    </div>
  );
}

interface MarkAsReceivedModalProps {
  request: SpendingRequest;
  onClose: () => void;
  onConfirm: (receivedDate: string, receivedInFull: boolean, notes?: string) => void;
}

export function MarkAsReceivedModal({ request, onClose, onConfirm }: MarkAsReceivedModalProps) {
  const { currentUser } = useSpending();
  const [receivedDate, setReceivedDate] = useState(new Date().toISOString().split('T')[0]);
  const [receivedInFull, setReceivedInFull] = useState(true);
  const [notes, setNotes] = useState('');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const shortRef = request.referenceNumber.replace('PUR-2024-', 'P');

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '480px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid #E5E7EB',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle size={20} color="#059669" />
            <span style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>
              Mark as Received
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '6px',
            }}
          >
            <X size={18} color="#6B7280" />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px' }}>
          {/* Request info */}
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: '#F9FAFB',
              borderRadius: '8px',
              marginBottom: '16px',
            }}
          >
            <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>
              {shortRef} · {request.purpose} · {formatCurrency(request.total)}
            </div>
            {request.poNumber && (
              <div style={{ fontSize: '13px', color: '#6B7280', marginTop: '4px' }}>
                PO: {request.poNumber}
              </div>
            )}
          </div>

          {/* User confirmation */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 12px',
              backgroundColor: '#F0FDF4',
              borderRadius: '8px',
              marginBottom: '20px',
              border: '1px solid #BBF7D0',
            }}
          >
            <User size={16} color="#059669" />
            <span style={{ fontSize: '13px', color: '#166534' }}>
              You ({currentUser.name}) are marking this as received
            </span>
          </div>

          {/* Received Date */}
          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 500,
                color: '#374151',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '6px',
              }}
            >
              RECEIVED DATE
            </label>
            <input
              type="date"
              value={receivedDate}
              onChange={(e) => setReceivedDate(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                outline: 'none',
              }}
            />
          </div>

          {/* Received in full */}
          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px',
                backgroundColor: receivedInFull ? '#F0FDF4' : 'white',
                border: receivedInFull ? '1px solid #86EFAC' : '1px solid #E5E7EB',
                borderRadius: '8px',
                cursor: 'pointer',
                marginBottom: '8px',
              }}
            >
              <input
                type="radio"
                name="receivedStatus"
                checked={receivedInFull}
                onChange={() => setReceivedInFull(true)}
                style={{ accentColor: '#059669' }}
              />
              <span style={{ fontSize: '14px', color: '#111827' }}>
                All items received in full
              </span>
            </label>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '12px',
                backgroundColor: !receivedInFull ? '#FEF3C7' : 'white',
                border: !receivedInFull ? '1px solid #FDE68A' : '1px solid #E5E7EB',
                borderRadius: '8px',
                cursor: 'pointer',
              }}
            >
              <input
                type="radio"
                name="receivedStatus"
                checked={!receivedInFull}
                onChange={() => setReceivedInFull(false)}
                style={{ accentColor: '#D97706' }}
              />
              <span style={{ fontSize: '14px', color: '#111827' }}>
                Partial delivery
              </span>
            </label>
          </div>

          {/* Notes */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 500,
                color: '#374151',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '6px',
              }}
            >
              NOTES
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes..."
              rows={3}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                outline: 'none',
                resize: 'none',
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            padding: '16px 20px',
            borderTop: '1px solid #E5E7EB',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 500,
              color: '#374151',
              backgroundColor: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(receivedDate, receivedInFull, notes || undefined)}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 500,
              color: 'white',
              backgroundColor: '#059669',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Confirm Received
          </button>
        </div>
      </div>
    </div>
  );
}

interface MarkAsFinalizedModalProps {
  request: SpendingRequest;
  onClose: () => void;
  onConfirm: (paymentReference?: string, paymentDate?: string, notes?: string) => void;
}

export function MarkAsFinalizedModal({ request, onClose, onConfirm }: MarkAsFinalizedModalProps) {
  const { currentUser } = useSpending();
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IE', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const shortRef = request.referenceNumber.replace('EXP-2024-', 'E');

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: 'white',
          borderRadius: '12px',
          width: '100%',
          maxWidth: '480px',
          boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid #E5E7EB',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <CheckCircle size={20} color="#059669" />
            <span style={{ fontSize: '16px', fontWeight: 600, color: '#111827' }}>
              Mark as Finalized
            </span>
          </div>
          <button
            onClick={onClose}
            style={{
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              borderRadius: '6px',
            }}
          >
            <X size={18} color="#6B7280" />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '20px' }}>
          {/* Request info */}
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: '#F9FAFB',
              borderRadius: '8px',
              marginBottom: '16px',
            }}
          >
            <div style={{ fontSize: '14px', fontWeight: 500, color: '#111827' }}>
              {shortRef} · {request.purpose} · {formatCurrency(request.total)}
            </div>
          </div>

          {/* User confirmation */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 12px',
              backgroundColor: '#F0FDF4',
              borderRadius: '8px',
              marginBottom: '20px',
              border: '1px solid #BBF7D0',
            }}
          >
            <User size={16} color="#059669" />
            <span style={{ fontSize: '13px', color: '#166534' }}>
              You ({currentUser.name}) are finalizing this expense
            </span>
          </div>

          {/* Payment Reference */}
          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 500,
                color: '#374151',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '6px',
              }}
            >
              PAYMENT REFERENCE
            </label>
            <input
              type="text"
              value={paymentReference}
              onChange={(e) => setPaymentReference(e.target.value)}
              placeholder="e.g., TRF-2024-1234"
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                outline: 'none',
              }}
            />
            <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '4px' }}>
              Optional
            </div>
          </div>

          {/* Payment Date */}
          <div style={{ marginBottom: '16px' }}>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 500,
                color: '#374151',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '6px',
              }}
            >
              PAYMENT DATE
            </label>
            <input
              type="date"
              value={paymentDate}
              onChange={(e) => setPaymentDate(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                outline: 'none',
              }}
            />
          </div>

          {/* Notes */}
          <div>
            <label
              style={{
                display: 'block',
                fontSize: '12px',
                fontWeight: 500,
                color: '#374151',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '6px',
              }}
            >
              NOTES
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes..."
              rows={3}
              style={{
                width: '100%',
                padding: '10px 12px',
                fontSize: '14px',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                outline: 'none',
                resize: 'none',
              }}
            />
          </div>
        </div>

        {/* Footer */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            padding: '16px 20px',
            borderTop: '1px solid #E5E7EB',
          }}
        >
          <button
            onClick={onClose}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 500,
              color: '#374151',
              backgroundColor: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(paymentReference || undefined, paymentDate, notes || undefined)}
            style={{
              padding: '8px 16px',
              fontSize: '14px',
              fontWeight: 500,
              color: 'white',
              backgroundColor: '#059669',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
            }}
          >
            Confirm Finalized
          </button>
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { X, Grip } from 'lucide-react';

interface WidgetConfig {
  id: string;
  name: string;
  description: string;
  visible: boolean;
  gridPosition: string;
}

interface WidgetConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  widgets: WidgetConfig[];
  onToggleWidget: (id: string) => void;
  onSave: () => void;
  onChangePosition?: (id: string, position: string) => void;
}

export function WidgetConfigModal({
  isOpen,
  onClose,
  widgets,
  onToggleWidget,
  onSave,
  onChangePosition
}: WidgetConfigModalProps) {
  if (!isOpen) return null;

  // Count how many widgets are currently visible
  const visibleCount = widgets.filter(w => w.visible).length;

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          zIndex: 1000,
          animation: 'fadeIn 200ms ease-out'
        }}
        onClick={onClose}
      />

      {/* Modal */}
      <div
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '600px',
          maxHeight: '80vh',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.15)',
          zIndex: 1001,
          animation: 'modalSlideIn 200ms ease-out',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div
          style={{
            padding: '24px 24px 20px',
            borderBottom: '1px solid #E5E7EB'
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#0A0A0A', marginBottom: '4px' }}>
                Customize Dashboard
              </h2>
              <p style={{ fontSize: '14px', color: '#6B7280' }}>
                Select up to 6 widgets to display on your dashboard
              </p>
            </div>
            <button
              onClick={onClose}
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '6px',
                border: 'none',
                background: 'transparent',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#6B7280',
                transition: 'background 150ms ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#F3F4F6'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <X style={{ width: '18px', height: '18px' }} />
            </button>
          </div>
        </div>

        {/* Widget List */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '16px 24px'
          }}
        >
          {widgets.map((widget) => (
            <div
              key={widget.id}
              style={{
                padding: '16px',
                marginBottom: '8px',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                background: widget.visible ? '#F0F9FF' : 'white',
                transition: 'all 150ms ease'
              }}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start" style={{ gap: '12px', flex: 1 }}>
                  {/* Drag Handle */}
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#9CA3AF',
                      cursor: 'grab'
                    }}
                  >
                    <Grip style={{ width: '16px', height: '16px' }} />
                  </div>

                  {/* Widget Info */}
                  <div style={{ flex: 1 }}>
                    <div className="flex items-center" style={{ gap: '8px', marginBottom: '4px' }}>
                      <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#0A0A0A' }}>
                        {widget.name}
                      </h3>
                      <span
                        style={{
                          fontSize: '11px',
                          color: '#6B7280',
                          background: '#F3F4F6',
                          padding: '2px 6px',
                          borderRadius: '4px'
                        }}
                      >
                        {widget.gridPosition}
                      </span>
                    </div>
                    <p style={{ fontSize: '13px', color: '#6B7280' }}>
                      {widget.description}
                    </p>
                  </div>
                </div>

                {/* Toggle Switch */}
                <button
                  onClick={() => onToggleWidget(widget.id)}
                  style={{
                    width: '44px',
                    height: '24px',
                    borderRadius: '12px',
                    background: widget.visible ? '#60A5FA' : '#D1D5DB',
                    border: 'none',
                    cursor: 'pointer',
                    position: 'relative',
                    transition: 'background 200ms ease',
                    flexShrink: 0
                  }}
                >
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '10px',
                      background: 'white',
                      position: 'absolute',
                      top: '2px',
                      left: widget.visible ? '22px' : '2px',
                      transition: 'left 200ms ease',
                      boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '16px 24px',
            borderTop: '1px solid #E5E7EB',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center'
          }}
        >
          <div style={{ fontSize: '13px', color: '#6B7280' }}>
            {visibleCount} of {widgets.length} widgets visible {visibleCount === 6 && '(Maximum)'}
          </div>
          <div className="flex items-center" style={{ gap: '8px' }}>
            <button
              onClick={onClose}
              style={{
                height: '36px',
                padding: '0 16px',
                borderRadius: '6px',
                border: '1px solid #E5E7EB',
                background: 'white',
                color: '#6B7280',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 150ms ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
            >
              Cancel
            </button>
            <button
              onClick={() => {
                onSave();
                onClose();
              }}
              style={{
                height: '36px',
                padding: '0 20px',
                borderRadius: '6px',
                border: 'none',
                background: '#60A5FA',
                color: 'white',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 150ms ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#3B82F6'}
              onMouseLeave={(e) => e.currentTarget.style.background = '#60A5FA'}
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translate(-50%, -48%);
          }
          to {
            opacity: 1;
            transform: translate(-50%, -50%);
          }
        }
      `}</style>
    </>
  );
}
import React from 'react';

interface GanttLegendProps {
  onClose: () => void;
}

export function GanttLegend({ onClose }: GanttLegendProps) {
  return (
    <>
      <div
        className="fixed inset-0"
        style={{ zIndex: 100 }}
        onClick={onClose}
      />
      <div style={{
        position: 'fixed',
        top: '140px',
        right: '100px',
        width: '320px',
        background: 'white',
        border: '1px solid #E5E7EB',
        borderRadius: '8px',
        boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
        padding: '20px',
        zIndex: 101
      }}>
        {/* Header */}
        <div className="flex items-center justify-between" style={{ marginBottom: '20px' }}>
          <span style={{ fontSize: '15px', fontWeight: 600, color: '#0A0A0A' }}>Legend</span>
          <button
            onClick={onClose}
            style={{
              width: '24px',
              height: '24px',
              border: 'none',
              background: 'transparent',
              fontSize: '18px',
              color: '#9CA3AF',
              cursor: 'pointer'
            }}
          >
            ×
          </button>
        </div>

        {/* Task Status */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            TASK STATUS
          </div>
          {[
            { color: '#3B82F6', label: 'On schedule', striped: false },
            { color: 'linear-gradient(to right, #2563EB 60%, #93C5FD 60%)', label: 'In progress (two-tone)', striped: false, gradient: true },
            { color: '#DC2626', label: 'Time exceeded', striped: true },
            { color: '#BFDBFE', label: 'Not started (dashed)', striped: false, dashed: true },
            { color: '#10B981', label: 'Completed', striped: false }
          ].map((item, idx) => (
            <div key={idx} className="flex items-center" style={{ gap: '12px', marginBottom: '10px' }}>
              <div style={{
                width: '32px',
                height: '14px',
                background: item.gradient ? item.color : item.color,
                border: item.dashed ? '2px dashed #93C5FD' : 'none',
                borderRadius: '3px',
                backgroundImage: item.striped ? 'repeating-linear-gradient(45deg, transparent, transparent 3px, rgba(255,255,255,0.4) 3px, rgba(255,255,255,0.4) 6px)' : 'none'
              }} />
              <span style={{ fontSize: '13px', color: '#0A0A0A', flex: 1 }}>{item.label}</span>
            </div>
          ))}
        </div>

        {/* Time Tracking */}
        <div style={{ marginBottom: '20px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            TIME TRACKING
          </div>
          <div className="flex items-center" style={{ gap: '12px', marginBottom: '10px' }}>
            <div style={{
              width: '32px',
              height: '14px',
              background: 'repeating-linear-gradient(45deg, #FEF3C7, #FEF3C7 3px, #FBBF24 3px, #FBBF24 6px)',
              border: '1px solid rgba(245, 158, 11, 0.3)',
              borderRadius: '3px'
            }} />
            <span style={{ fontSize: '13px', color: '#0A0A0A', flex: 1 }}>Out of schedule work</span>
          </div>
        </div>

        {/* Indicators */}
        <div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#9CA3AF', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
            INDICATORS
          </div>
          {[
            { icon: '🚩', label: 'Risk/Issue flag' },
            { icon: '🔷', label: 'Milestone marker' },
            { icon: '⚠️', label: 'Over budget warning' },
            { icon: '→', label: 'Task dependency' },
            { icon: '✓', label: 'Completed task' }
          ].map((item, idx) => (
            <div key={idx} className="flex items-center" style={{ gap: '12px', marginBottom: '10px' }}>
              <span style={{ fontSize: '16px', width: '32px', textAlign: 'center' }}>{item.icon}</span>
              <span style={{ fontSize: '13px', color: '#0A0A0A', flex: 1 }}>{item.label}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
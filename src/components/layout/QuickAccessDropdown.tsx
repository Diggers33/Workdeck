import { useState } from 'react';
import { Zap, Plus, Pin, Star, ArrowRight } from 'lucide-react';

export function QuickAccessDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  const pinnedItems = [
    {
      id: 1,
      name: 'Phoenix Rebrand',
      type: 'Project',
      status: 'On Track',
      statusColor: '#10B981'
    },
    {
      id: 2,
      name: 'Resource Planner',
      type: 'Tool',
      status: null,
      statusColor: null
    }
  ];

  const recentItems = [
    {
      id: 1,
      name: 'Website wireframes',
      type: 'Task',
      subtitle: 'Apex Digital',
      time: '1h ago'
    },
    {
      id: 2,
      name: 'Project Triage Board',
      type: 'View',
      subtitle: null,
      time: '2h ago'
    },
    {
      id: 3,
      name: 'Timesheets',
      type: 'Tool',
      subtitle: null,
      time: '5h ago'
    }
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#F9FAFB] text-[#6B7280] transition-all hover:scale-105"
        title="Quick Access"
      >
        <Zap className="w-5 h-5" />
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0"
            style={{ zIndex: 40 }}
            onClick={() => setIsOpen(false)}
          />

          {/* Dropdown */}
          <div
            style={{
              position: 'absolute',
              top: '48px',
              right: 0,
              width: '320px',
              background: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              zIndex: 50,
              animation: 'menuSlideIn 200ms ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header with Add Button */}
            <div style={{ padding: '16px', borderBottom: '1px solid #F3F4F6' }}>
              <button
                style={{
                  width: '100%',
                  height: '40px',
                  background: '#3B82F6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'background 150ms ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#2563EB'}
                onMouseLeave={(e) => e.currentTarget.style.background = '#3B82F6'}
              >
                <Plus style={{ width: '16px', height: '16px' }} />
                Add
              </button>
            </div>

            {/* PINNED Section */}
            <div style={{ padding: '12px 16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#9CA3AF', letterSpacing: '0.5px', marginBottom: '8px' }}>
                PINNED
              </div>
              {pinnedItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'background 150ms ease',
                    marginBottom: '4px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: '#0A0A0A', marginBottom: '4px' }}>
                      {item.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#6B7280' }}>
                      <span>{item.type}</span>
                      {item.status && (
                        <>
                          <span>•</span>
                          <span style={{ color: item.statusColor }}>{item.status}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Pin style={{ width: '14px', height: '14px', color: '#9CA3AF' }} />
                    <ArrowRight style={{ width: '14px', height: '14px', color: '#9CA3AF' }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Divider */}
            <div style={{ height: '1px', background: '#F3F4F6', margin: '8px 16px' }} />

            {/* RECENT Section */}
            <div style={{ padding: '12px 16px' }}>
              <div style={{ fontSize: '11px', fontWeight: 600, color: '#9CA3AF', letterSpacing: '0.5px', marginBottom: '8px' }}>
                RECENT
              </div>
              {recentItems.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: '12px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    transition: 'background 150ms ease',
                    marginBottom: '4px'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: 500, color: '#0A0A0A', marginBottom: '4px' }}>
                      {item.name}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: '#6B7280' }}>
                      <span>{item.type}</span>
                      {item.subtitle && (
                        <>
                          <span>•</span>
                          <span>{item.subtitle}</span>
                        </>
                      )}
                      <span>•</span>
                      <span>{item.time}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Star style={{ width: '14px', height: '14px', color: '#9CA3AF' }} />
                    <ArrowRight style={{ width: '14px', height: '14px', color: '#9CA3AF' }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div style={{ padding: '12px 16px', borderTop: '1px solid #F3F4F6' }}>
              <button
                style={{
                  width: '100%',
                  padding: '8px',
                  background: 'transparent',
                  border: 'none',
                  color: '#3B82F6',
                  fontSize: '13px',
                  fontWeight: 500,
                  cursor: 'pointer',
                  borderRadius: '6px',
                  transition: 'background 150ms ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                View All
              </button>
            </div>
          </div>

          <style>{`
            @keyframes menuSlideIn {
              from {
                opacity: 0;
                transform: translateY(-10px);
              }
              to {
                opacity: 1;
                transform: translateY(0);
              }
            }
          `}</style>
        </>
      )}
    </div>
  );
}

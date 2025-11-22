import React, { useState } from 'react';

interface FilterChip {
  id: string;
  label: string;
  count: number;
  color: {
    bg: string;
    border: string;
    text: string;
  };
}

interface GanttFilterBarProps {
  activeFilters: Set<string>;
  onRemoveFilter: (filterId: string) => void;
  onAddFilter: (filterId: string) => void;
}

const FILTER_CONFIGS: Record<string, { label: string; color: { bg: string; border: string; text: string }; count: number }> = {
  myTasks: {
    label: 'My tasks',
    count: 12,
    color: { bg: '#EFF6FF', border: '#3B82F6', text: '#3B82F6' }
  },
  overdue: {
    label: 'Overdue',
    count: 3,
    color: { bg: '#FEE2E2', border: '#DC2626', text: '#DC2626' }
  },
  thisWeek: {
    label: 'This week',
    count: 8,
    color: { bg: '#F0FDF4', border: '#10B981', text: '#10B981' }
  },
  flagged: {
    label: 'Flagged',
    count: 2,
    color: { bg: '#FFF7ED', border: '#F97316', text: '#F97316' }
  },
  milestones: {
    label: 'Milestones',
    count: 4,
    color: { bg: '#EFF6FF', border: '#3B82F6', text: '#3B82F6' }
  },
  completed: {
    label: 'Completed',
    count: 14,
    color: { bg: '#F3F4F6', border: '#6B7280', text: '#6B7280' }
  }
};

const AVAILABLE_FILTERS = [
  { id: 'overdue', label: 'Overdue', count: 3, countColor: '#DC2626', countBold: true },
  { id: 'thisWeek', label: 'This week', count: 8, countColor: '#6B7280', countBold: false },
  { id: 'flagged', label: 'Flagged', count: 2, countColor: '#F97316', countBold: true },
  { id: 'milestones', label: 'Milestones', count: 4, countColor: '#3B82F6', countBold: true },
  { id: 'completed', label: 'Completed', count: 14, countColor: '#10B981', countBold: false }
];

export function GanttFilterBar({ activeFilters, onRemoveFilter, onAddFilter }: GanttFilterBarProps) {
  const [showDropdown, setShowDropdown] = useState(false);

  const activeFilterChips: FilterChip[] = Array.from(activeFilters).map(filterId => ({
    id: filterId,
    label: FILTER_CONFIGS[filterId].label,
    count: FILTER_CONFIGS[filterId].count,
    color: FILTER_CONFIGS[filterId].color
  }));

  const totalTasks = 26;
  const filteredCount = activeFilters.size > 0 
    ? Array.from(activeFilters).reduce((sum, id) => sum + FILTER_CONFIGS[id].count, 0)
    : totalTasks;

  return (
    <div style={{
      height: '44px',
      background: '#FFFFFF',
      borderBottom: '1px solid #E5E7EB',
      padding: '0 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: '112px',
      zIndex: 98
    }}>
      {/* LEFT SIDE */}
      <div className="flex items-center" style={{ gap: '12px', flexWrap: 'wrap' }}>
        {/* Label */}
        <span style={{ fontSize: '13px', fontWeight: 500, color: '#6B7280' }}>
          Active filters:
        </span>

        {/* Active Filter Chips */}
        {activeFilterChips.length > 0 ? (
          <>
            {activeFilterChips.map((chip) => (
              <div
                key={chip.id}
                style={{
                  height: '32px',
                  background: chip.color.bg,
                  border: `1px solid ${chip.color.border}`,
                  borderRadius: '16px',
                  padding: '0 4px 0 12px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer',
                  transition: 'all 150ms ease'
                }}
                onMouseEnter={(e) => {
                  const darker = chip.color.bg === '#EFF6FF' ? '#DBEAFE' :
                                chip.color.bg === '#FEE2E2' ? '#FECACA' :
                                chip.color.bg === '#F0FDF4' ? '#DCFCE7' :
                                chip.color.bg === '#FFF7ED' ? '#FFEDD5' : '#E5E7EB';
                  e.currentTarget.style.background = darker;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = chip.color.bg;
                }}
              >
                {/* Checkmark */}
                <span style={{ fontSize: '12px', color: chip.color.text, fontWeight: 600 }}>✓</span>
                
                {/* Label */}
                <span style={{ fontSize: '13px', fontWeight: 500, color: chip.color.text }}>
                  {chip.label}
                </span>
                
                {/* Count */}
                <span style={{ fontSize: '13px', fontWeight: 400, color: chip.color.text }}>
                  ({chip.count})
                </span>
                
                {/* Close Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveFilter(chip.id);
                  }}
                  style={{
                    width: '24px',
                    height: '24px',
                    border: 'none',
                    background: 'transparent',
                    color: chip.color.text,
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: '50%',
                    transition: 'background 150ms ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'transparent';
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </>
        ) : (
          <span style={{ fontSize: '13px', fontStyle: 'italic', color: '#9CA3AF' }}>
            None
          </span>
        )}

        {/* Add Filter Button */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowDropdown(!showDropdown)}
            style={{
              height: '32px',
              background: 'white',
              border: '1px dashed #D1D5DB',
              borderRadius: '16px',
              padding: '0 14px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              transition: 'all 150ms ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#F9FAFB';
              e.currentTarget.style.borderStyle = 'solid';
              e.currentTarget.style.borderColor = '#3B82F6';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.borderStyle = 'dashed';
              e.currentTarget.style.borderColor = '#D1D5DB';
            }}
          >
            <span style={{ fontSize: '14px', color: '#6B7280' }}>+</span>
            <span style={{ fontSize: '13px', fontWeight: 500, color: '#6B7280' }}>Add filter</span>
          </button>

          {/* Dropdown Menu */}
          {showDropdown && (
            <>
              {/* Backdrop */}
              <div
                style={{
                  position: 'fixed',
                  inset: 0,
                  zIndex: 10
                }}
                onClick={() => setShowDropdown(false)}
              />
              
              {/* Dropdown */}
              <div style={{
                position: 'absolute',
                top: '40px',
                left: 0,
                width: '240px',
                background: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                boxShadow: '0 4px 16px rgba(0,0,0,0.12)',
                padding: '8px',
                zIndex: 20
              }}>
                {/* Header */}
                <div style={{
                  padding: '8px 12px',
                  borderBottom: '1px solid #F3F4F6',
                  marginBottom: '4px'
                }}>
                  <span style={{ fontSize: '13px', fontWeight: 600, color: '#0A0A0A' }}>
                    Add filter
                  </span>
                </div>

                {/* Filter Options */}
                {AVAILABLE_FILTERS.filter(f => !activeFilters.has(f.id)).map((filter) => (
                  <div
                    key={filter.id}
                    onClick={() => {
                      onAddFilter(filter.id);
                      setShowDropdown(false);
                    }}
                    style={{
                      height: '40px',
                      padding: '8px 12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      borderRadius: '4px',
                      transition: 'background 150ms ease'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  >
                    <div className="flex items-center" style={{ gap: '10px' }}>
                      <input
                        type="checkbox"
                        checked={false}
                        readOnly
                        style={{ width: '16px', height: '16px', cursor: 'pointer' }}
                      />
                      <span style={{ fontSize: '14px', fontWeight: 400, color: '#0A0A0A' }}>
                        {filter.label}
                      </span>
                    </div>
                    <span style={{
                      fontSize: '13px',
                      fontWeight: filter.countBold ? 600 : 400,
                      color: filter.countColor
                    }}>
                      ({filter.count})
                    </span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* RIGHT SIDE */}
      <span style={{ fontSize: '13px', fontWeight: 400, color: '#9CA3AF' }}>
        {activeFilters.size > 0 
          ? `Showing ${filteredCount} of ${totalTasks} tasks`
          : `Showing all ${totalTasks} tasks`
        }
      </span>
    </div>
  );
}
import React, { useState } from 'react';
import { ChevronDown, ArrowRight, Briefcase } from 'lucide-react';

interface Project {
  id: string;
  name: string;
  status: 'on-track' | 'at-risk' | 'critical' | 'upcoming';
  progress: number;
  metadata: string;
}

interface ProjectPortfolioWidgetProps {
  onProjectClick?: (projectId: string) => void;
  onHeaderClick?: () => void;
}

export function ProjectPortfolioWidget({ onProjectClick, onHeaderClick }: ProjectPortfolioWidgetProps) {
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('My projects');

  const projects: Project[] = [
    {
      id: '1',
      name: 'Phoenix Rebrand',
      status: 'on-track',
      progress: 68,
      metadata: '8 open • 2 overdue'
    },
    {
      id: '2',
      name: 'Apex Digital Redesign',
      status: 'at-risk',
      progress: 45,
      metadata: 'Next milestone in 4 days'
    },
    {
      id: '3',
      name: 'Stellar Analytics Platform',
      status: 'critical',
      progress: 23,
      metadata: 'Budget used: 87%'
    }
  ];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'on-track':
        return { label: 'On Track', bg: '#D1FAE5', text: '#065F46' };
      case 'at-risk':
        return { label: 'At Risk', bg: '#FEF3C7', text: '#92400E' };
      case 'critical':
        return { label: 'Critical', bg: '#FEE2E2', text: '#991B1B' };
      case 'upcoming':
        return { label: 'Upcoming', bg: '#F3F4F6', text: '#374151' };
      default:
        return { label: 'Unknown', bg: '#F3F4F6', text: '#6B7280' };
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'on-track':
        return '#34D399';
      case 'at-risk':
        return '#FBBF24';
      case 'critical':
        return '#F87171';
      case 'upcoming':
        return '#9CA3AF';
      default:
        return '#60A5FA';
    }
  };

  return (
    <div
      style={{
        background: 'white',
        borderRadius: '8px',
        border: '1px solid #E5E7EB',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        position: 'relative'
      }}
    >
      {/* Top gradient bar - absolute positioned like other widgets */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 0,
          height: '4px',
          background: 'linear-gradient(90deg, #93C5FD 0%, #BFDBFE 100%)'
        }}
      />

      {/* Header - 40px total height */}
      <div
        style={{
          height: '40px',
          padding: '0 20px',
          borderBottom: '1px solid #E5E7EB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0,
          position: 'relative'
        }}
      >
        <div 
          onClick={onHeaderClick}
          style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: onHeaderClick ? 'pointer' : 'default',
            transition: 'color 150ms ease'
          }}
        >
          <Briefcase style={{ width: '16px', height: '16px', color: '#60A5FA' }} />
          <h3
            style={{ 
              fontSize: '14px', 
              fontWeight: 500, 
              color: '#1F2937', 
              margin: 0
            }}
          >
            Project Portfolio
          </h3>
        </div>
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '12px',
            color: '#6B7280',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '4px 6px',
            borderRadius: '4px',
            transition: 'background 150ms ease',
            position: 'relative'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          onClick={(e) => {
            e.stopPropagation();
            setShowFilterMenu(!showFilterMenu);
          }}
        >
          {selectedFilter}
          <ChevronDown style={{ width: '12px', height: '12px' }} />
        </button>
        
        {/* Filter Dropdown Menu */}
        {showFilterMenu && (
          <>
            {/* Backdrop to close menu */}
            <div
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 5
              }}
              onClick={() => setShowFilterMenu(false)}
            />
            
            {/* Menu */}
            <div
              style={{
                position: 'absolute',
                right: '20px',
                top: '40px',
                background: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '6px',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
                zIndex: 10,
                minWidth: '160px',
                padding: '4px 0'
              }}
            >
              {['My projects', 'All projects', 'Critical', 'At risk', 'Upcoming'].map((filter) => (
                <button
                  key={filter}
                  style={{
                    width: '100%',
                    display: 'block',
                    textAlign: 'left',
                    fontSize: '13px',
                    color: selectedFilter === filter ? '#0066FF' : '#0A0A0A',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '8px 16px',
                    transition: 'background 150ms ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                  onClick={() => {
                    setSelectedFilter(filter);
                    setShowFilterMenu(false);
                  }}
                >
                  {filter}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Project list - scrollable */}
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden'
        }}
      >
        {projects.map((project, index) => {
          const statusConfig = getStatusConfig(project.status);
          const progressColor = getProgressColor(project.status);

          return (
            <React.Fragment key={project.id}>
              {/* Project Row - 74px tall */}
              <div
                style={{
                  height: '74px',
                  padding: '12px 20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  cursor: 'pointer',
                  transition: 'background 150ms ease'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                onClick={() => {
                  if (onProjectClick) onProjectClick(project.id);
                }}
              >
                {/* Left column - Auto Layout vertical */}
                <div 
                  style={{ 
                    flex: 1, 
                    minWidth: 0,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '6px'
                  }}
                >
                  {/* Line 1: Name + Status pill */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span
                      style={{
                        fontSize: '14px',
                        fontWeight: 500,
                        color: '#0A0A0A',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        flex: 1
                      }}
                    >
                      {project.name}
                    </span>
                    <span
                      style={{
                        height: '18px',
                        fontSize: '11px',
                        fontWeight: 500,
                        color: statusConfig.text,
                        background: statusConfig.bg,
                        padding: '0 6px',
                        borderRadius: '6px',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                        display: 'flex',
                        alignItems: 'center'
                      }}
                    >
                      {statusConfig.label}
                    </span>
                  </div>

                  {/* Line 2: Progress bar - 4px height */}
                  <div
                    style={{
                      height: '4px',
                      background: '#E5E7EB',
                      borderRadius: '2px',
                      overflow: 'hidden',
                      position: 'relative'
                    }}
                  >
                    <div
                      style={{
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        bottom: 0,
                        width: `${project.progress}%`,
                        background: progressColor,
                        borderRadius: '2px',
                        transition: 'width 300ms ease'
                      }}
                    />
                  </div>

                  {/* Line 3: Metadata - one line only */}
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#6B7280',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {project.metadata}
                  </div>
                </div>

                {/* Right column - Arrow icon */}
                <div 
                  style={{ 
                    flexShrink: 0,
                    display: 'flex',
                    alignItems: 'center',
                    paddingRight: '4px'
                  }}
                >
                  <ArrowRight style={{ width: '14px', height: '14px', color: '#D1D5DB' }} />
                </div>
              </div>

              {/* Divider - 1px full width, not after last item */}
              {index < projects.length - 1 && (
                <div
                  style={{
                    height: '1px',
                    background: '#E5E7EB',
                    margin: 0
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
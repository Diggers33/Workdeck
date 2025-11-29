import React, { useState } from 'react';
import { ChevronDown, ArrowRight, Briefcase, FolderOpen } from 'lucide-react';
import { PortfolioProject } from '../api/dashboardApi';

interface ProjectPortfolioWidgetProps {
  projects?: PortfolioProject[];
  onProjectClick?: (projectId: string) => void;
  onHeaderClick?: () => void;
}

export function ProjectPortfolioWidget({ projects, onProjectClick, onHeaderClick }: ProjectPortfolioWidgetProps) {
  const [showFilterMenu, setShowFilterMenu] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('My projects');

  // Determine data state
  const isLoading = projects === undefined;
  const isEmpty = Array.isArray(projects) && projects.length === 0;
  const hasProjects = Array.isArray(projects) && projects.length > 0;

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
      case 'completed':
        return { label: 'Completed', bg: '#D1FAE5', text: '#065F46' };
      default:
        return { label: 'Unknown', bg: '#F3F4F6', text: '#6B7280' };
    }
  };

  const getProgressColor = (status: string) => {
    switch (status) {
      case 'on-track':
      case 'completed':
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

  // Generate metadata string for project
  const getMetadata = (project: PortfolioProject): string => {
    const parts: string[] = [];
    if (project.openTasks !== undefined) {
      parts.push(`${project.openTasks} open`);
    }
    if (project.overdueTasks !== undefined && project.overdueTasks > 0) {
      parts.push(`${project.overdueTasks} overdue`);
    }
    if (project.budget) {
      const percent = Math.round((project.budget.used / project.budget.total) * 100);
      parts.push(`Budget: ${percent}%`);
    }
    return parts.join(' • ') || `${project.progress}% complete`;
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
      {/* Top gradient bar */}
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

      {/* Header */}
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
          <h3 style={{ fontSize: '14px', fontWeight: 500, color: '#1F2937', margin: 0 }}>
            Project Portfolio
          </h3>
          {hasProjects && (
            <span style={{ fontSize: '10px', color: '#10B981', fontWeight: 500 }}>(Live)</span>
          )}
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
            <div
              style={{ position: 'fixed', inset: 0, zIndex: 5 }}
              onClick={() => setShowFilterMenu(false)}
            />
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

      {/* Content area */}
      <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
        {/* Loading state */}
        {isLoading && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '32px', textAlign: 'center' }}>
            <div style={{ width: '24px', height: '24px', border: '2px solid #60A5FA', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite', marginBottom: '8px' }}></div>
            <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>Loading projects...</p>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        )}

        {/* Empty state */}
        {isEmpty && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '32px', textAlign: 'center' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#F3F4F6', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
              <FolderOpen style={{ width: '24px', height: '24px', color: '#9CA3AF' }} />
            </div>
            <p style={{ fontSize: '13px', fontWeight: 500, color: '#374151', margin: '0 0 4px 0' }}>No projects yet</p>
            <p style={{ fontSize: '11px', color: '#9CA3AF', margin: 0 }}>Projects will appear here</p>
          </div>
        )}

        {/* Project list */}
        {hasProjects && projects.map((project, index) => {
          const statusConfig = getStatusConfig(project.status);
          const progressColor = getProgressColor(project.status);
          const metadata = getMetadata(project);

          return (
            <React.Fragment key={project.id}>
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
                onClick={() => onProjectClick?.(project.id)}
              >
                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {/* Name + Status pill */}
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

                  {/* Progress bar */}
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

                  {/* Metadata */}
                  <div
                    style={{
                      fontSize: '12px',
                      color: '#6B7280',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}
                  >
                    {metadata}
                  </div>
                </div>

                {/* Arrow */}
                <div style={{ flexShrink: 0, display: 'flex', alignItems: 'center', paddingRight: '4px' }}>
                  <ArrowRight style={{ width: '14px', height: '14px', color: '#D1D5DB' }} />
                </div>
              </div>

              {/* Divider */}
              {index < projects.length - 1 && (
                <div style={{ height: '1px', background: '#E5E7EB', margin: 0 }} />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Search, Plus, ChevronDown, MoreVertical, ArrowRight } from 'lucide-react';

export function ProjectTriageBoard({ onGanttClick }: { onGanttClick?: () => void }) {
  const [activeFilter, setActiveFilter] = useState('All Projects');
  const [hoveredRow, setHoveredRow] = useState<number | null>(null);
  const [openMenu, setOpenMenu] = useState<number | null>(null);
  const [hoveredAlert, setHoveredAlert] = useState<number | null>(null);
  const [scopeDropdownOpen, setScopeDropdownOpen] = useState(false);
  const [selectedScope, setSelectedScope] = useState('Mine');

  const projects = [
    {
      id: 1,
      alert: {
        dotColor: '#F87171',
        pulse: true,
        icon: '⏰'
      },
      name: 'BIOGEMSE',
      trend: '↗',
      trendColor: '#34D399',
      client: 'EU',
      owner: 'Charlie Day',
      badge: 'Retainer',
      timeline: "Feb'24 - Aug'24",
      duration: '6mo',
      progress: 30,
      progressColor: '#F87171',
      statusText: '30% • 476d overdue',
      statusColor: '#F87171',
      showActionBadge: true,
      actionBadgeBg: '#FEE2E2',
      actionBadgeColor: '#F87171',
      nextActivity: 'Client review',
      activityTime: 'Tomorrow',
      activityIcon: '⚠️',
      activityColor: '#F87171',
      activityWeight: 600,
      flagCount: 3,
      flagBg: '#FEE2E2',
      flagColor: '#F87171',
      alertBreakdown: [
        { label: 'Budget overrun', count: 2 },
        { label: 'Resource conflict', count: 1 }
      ]
    },
    {
      id: 2,
      alert: {
        dotColor: '#F87171',
        pulse: false,
        icon: '💰'
      },
      name: 'OCEAN-CLEAN-X',
      trend: '↘',
      trendColor: '#F87171',
      client: 'Global NGO',
      owner: 'Charlie Day',
      badge: 'Fixed Bid',
      timeline: "Jan'24 - Dec'24",
      duration: '11mo',
      progress: 15,
      progressColor: '#F87171',
      statusText: '15% • 324d overdue',
      statusColor: '#F87171',
      showActionBadge: true,
      actionBadgeBg: '#FEE2E2',
      actionBadgeColor: '#F87171',
      nextActivity: 'Budget approval',
      activityTime: 'in 3d',
      activityIcon: '📅',
      activityColor: '#FB923D',
      activityWeight: 600,
      flagCount: 5,
      flagBg: '#FEE2E2',
      flagColor: '#F87171',
      alertBreakdown: [
        { label: 'Schedule delays', count: 3 },
        { label: 'Pending approvals', count: 2 }
      ]
    },
    {
      id: 3,
      alert: {
        dotColor: '#FB923D',
        pulse: false,
        icon: '👥'
      },
      name: 'SUSALGAEFUEL',
      trend: '↘',
      trendColor: '#F87171',
      client: 'Green Energy Corp',
      owner: 'Bob Ross',
      badge: 'Retainer',
      timeline: "Nov'23 - Jun'25",
      duration: '19mo',
      progress: 52,
      progressColor: '#FB923D',
      statusText: '52% • 143d overdue',
      statusColor: '#FB923D',
      showActionBadge: true,
      actionBadgeBg: '#FED7AA',
      actionBadgeColor: '#FB923D',
      nextActivity: 'Phase kickoff',
      activityTime: 'in 1w',
      activityIcon: '📅',
      activityColor: '#6B7280',
      activityWeight: 400,
      flagCount: 8,
      flagBg: '#FED7AA',
      flagColor: '#FB923D',
      alertBreakdown: [
        { label: 'Dependencies blocked', count: 4 },
        { label: 'Scope changes', count: 3 },
        { label: 'Risk identified', count: 1 }
      ]
    },
    {
      id: 4,
      alert: {
        dotColor: '#FB923D',
        pulse: false,
        icon: null
      },
      name: 'AGRIMAX',
      trend: '↘',
      trendColor: '#F87171',
      client: 'European Commission',
      owner: 'John Doe',
      badge: 'Fixed Bid',
      timeline: "Jun'23 - Dec'25",
      duration: '30mo',
      progress: 45,
      progressColor: '#FB923D',
      statusText: '45% • At risk',
      statusColor: '#FB923D',
      showActionBadge: true,
      actionBadgeBg: '#FED7AA',
      actionBadgeColor: '#FB923D',
      nextActivity: 'Milestone delivery',
      activityTime: 'in 5d',
      activityIcon: '📅',
      activityColor: '#FB923D',
      activityWeight: 600,
      flagCount: 12,
      flagBg: '#FED7AA',
      flagColor: '#FB923D',
      alertBreakdown: [
        { label: 'Milestone delays', count: 6 },
        { label: 'Resource issues', count: 4 },
        { label: 'Contract issues', count: 2 }
      ]
    },
    {
      id: 5,
      alert: {
        dotColor: '#D1D5DB',
        pulse: false,
        icon: null
      },
      name: '5G-SOLUTIONS',
      trend: '→',
      trendColor: '#9CA3AF',
      client: 'European Commission',
      owner: 'Alice Chen',
      badge: 'Retainer',
      timeline: "Jan'24 - Apr'24",
      duration: '3mo',
      progress: 65,
      progressColor: '#34D399',
      statusText: '65% • On schedule',
      statusColor: '#34D399',
      showActionBadge: false,
      actionBadgeBg: '',
      actionBadgeColor: '',
      nextActivity: 'Status meeting',
      activityTime: 'in 2w',
      activityIcon: '✓',
      activityColor: '#6B7280',
      activityWeight: 400,
      flagCount: 0,
      flagBg: '',
      flagColor: '',
      alertBreakdown: []
    },
    {
      id: 6,
      alert: {
        dotColor: '#D1D5DB',
        pulse: false,
        icon: null
      },
      name: 'HEALTH-AI-DIAG',
      trend: '→',
      trendColor: '#9CA3AF',
      client: 'HealthPlus',
      owner: 'Dana White',
      badge: 'Retainer',
      timeline: "Jan'24 - Sep'24",
      duration: '8mo',
      progress: 22,
      progressColor: '#34D399',
      statusText: '22% • On schedule',
      statusColor: '#34D399',
      showActionBadge: false,
      actionBadgeBg: '',
      actionBadgeColor: '',
      nextActivity: 'Payment due',
      activityTime: 'in 10d',
      activityIcon: '📅',
      activityColor: '#6B7280',
      activityWeight: 400,
      flagCount: 0,
      flagBg: '',
      flagColor: '',
      alertBreakdown: []
    }
  ];

  const menuItems = [
    { type: 'view', label: 'Project Board', icon: null, color: '#6B7280' },
    { type: 'view', label: 'Project Financial', icon: null, color: '#6B7280' },
    { type: 'separator' },
    { type: 'action', label: 'Edit project', icon: '✏️', color: '#0A0A0A' },
    { type: 'action', label: 'Duplicate project', icon: '📋', color: '#0A0A0A' },
    { type: 'action', label: 'Unpublish project', icon: '👁️', color: '#0A0A0A' },
    { type: 'action', label: 'Delete project', icon: '🗑️', color: '#DC2626' }
  ];

  return (
    <div style={{ width: '1200px', minHeight: '1400px', background: '#FAFBFC', margin: '0 auto', position: 'relative', padding: '16px' }}>
      {/* HEADER SECTION - 160px height */}
      <div style={{ 
        padding: '20px 40px 20px', 
        background: 'white',
        border: '1px solid #E5E7EB',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '16px'
      }}>
        {/* TOP BAR - 60px height */}
        <div className="flex items-center justify-between" style={{ height: '60px', position: 'relative' }}>
          {/* Search Bar */}
          <div className="relative" style={{ width: '320px' }}>
            <Search 
              style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                width: '16px',
                height: '16px',
                color: '#9CA3AF'
              }} 
            />
            <input
              type="text"
              placeholder="Search projects, tasks, or people..."
              style={{
                width: '100%',
                height: '40px',
                paddingLeft: '40px',
                paddingRight: '12px',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                fontSize: '14px',
                color: '#0A0A0A',
                outline: 'none',
                background: 'white'
              }}
            />
          </div>

          {/* Center - Scope Dropdown */}
          <div style={{ position: 'absolute', left: '50%', transform: 'translateX(-50%)' }}>
            <button
              onClick={() => setScopeDropdownOpen(!scopeDropdownOpen)}
              style={{
                width: '160px',
                height: '40px',
                background: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                padding: '0 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                cursor: 'pointer',
                position: 'relative'
              }}
            >
              <span style={{ fontSize: '14px', fontWeight: 500, color: '#0A0A0A' }}>
                {selectedScope}
              </span>
              <ChevronDown style={{ width: '12px', height: '12px', color: '#6B7280' }} />
            </button>

            {/* Scope Dropdown Menu */}
            {scopeDropdownOpen && (
              <>
                <div 
                  className="fixed inset-0" 
                  style={{ zIndex: 40 }}
                  onClick={() => setScopeDropdownOpen(false)}
                />
                
                <div
                  style={{
                    position: 'absolute',
                    top: '48px',
                    left: 0,
                    width: '220px',
                    height: '140px',
                    background: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                    padding: '8px',
                    zIndex: 50,
                    animation: 'menuSlideIn 200ms ease-out'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Mine - Selected */}
                  <button
                    onClick={() => {
                      setSelectedScope('Mine');
                      setScopeDropdownOpen(false);
                    }}
                    style={{
                      width: '100%',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      background: selectedScope === 'Mine' ? '#EFF6FF' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: '6px'
                    }}
                  >
                    <div className="flex items-center" style={{ gap: '8px' }}>
                      {selectedScope === 'Mine' && (
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3B82F6' }} />
                      )}
                      <span style={{ fontSize: '14px', fontWeight: selectedScope === 'Mine' ? 500 : 400, color: selectedScope === 'Mine' ? '#0A0A0A' : '#6B7280' }}>
                        Mine
                      </span>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 400, color: selectedScope === 'Mine' ? '#6B7280' : '#9CA3AF' }}>
                      (12)
                    </span>
                  </button>

                  {/* Team */}
                  <button
                    onClick={() => {
                      setSelectedScope('Team');
                      setScopeDropdownOpen(false);
                    }}
                    style={{
                      width: '100%',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px 8px 26px',
                      background: selectedScope === 'Team' ? '#EFF6FF' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: '6px',
                      transition: 'background 150ms ease'
                    }}
                    onMouseEnter={(e) => { if (selectedScope !== 'Team') e.currentTarget.style.background = '#F9FAFB'; }}
                    onMouseLeave={(e) => { if (selectedScope !== 'Team') e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div className="flex items-center" style={{ gap: '8px' }}>
                      {selectedScope === 'Team' && (
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3B82F6', marginLeft: '-18px' }} />
                      )}
                      <span style={{ fontSize: '14px', fontWeight: selectedScope === 'Team' ? 500 : 400, color: selectedScope === 'Team' ? '#0A0A0A' : '#6B7280' }}>
                        Team
                      </span>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 400, color: selectedScope === 'Team' ? '#6B7280' : '#9CA3AF' }}>
                      (45)
                    </span>
                  </button>

                  {/* Company */}
                  <button
                    onClick={() => {
                      setSelectedScope('Company');
                      setScopeDropdownOpen(false);
                    }}
                    style={{
                      width: '100%',
                      height: '36px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px 8px 26px',
                      background: selectedScope === 'Company' ? '#EFF6FF' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      borderRadius: '6px',
                      transition: 'background 150ms ease'
                    }}
                    onMouseEnter={(e) => { if (selectedScope !== 'Company') e.currentTarget.style.background = '#F9FAFB'; }}
                    onMouseLeave={(e) => { if (selectedScope !== 'Company') e.currentTarget.style.background = 'transparent'; }}
                  >
                    <div className="flex items-center" style={{ gap: '8px' }}>
                      {selectedScope === 'Company' && (
                        <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#3B82F6', marginLeft: '-18px' }} />
                      )}
                      <span style={{ fontSize: '14px', fontWeight: selectedScope === 'Company' ? 500 : 400, color: selectedScope === 'Company' ? '#0A0A0A' : '#6B7280' }}>
                        Company
                      </span>
                    </div>
                    <span style={{ fontSize: '14px', fontWeight: 400, color: selectedScope === 'Company' ? '#6B7280' : '#9CA3AF' }}>
                      (180)
                    </span>
                  </button>
                </div>
              </>
            )}
          </div>

          {/* New Project Button */}
          <button
            style={{
              width: '140px',
              height: '40px',
              background: '#60A5FA',
              color: 'white',
              fontSize: '14px',
              fontWeight: 500,
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            <Plus style={{ width: '16px', height: '16px' }} />
            New Project
          </button>
        </div>

        {/* CONTEXT LINE */}
        <div className="flex items-center justify-between" style={{ marginTop: '12px', padding: '0 20px' }}>
          <div style={{ fontSize: '14px', fontWeight: 400, color: '#6B7280' }}>
            Showing: Charlie Day's Projects (12)
          </div>
          <div style={{ fontSize: '14px', fontWeight: 400, color: '#6B7280' }}>
            10 Active Projects
          </div>
        </div>

        {/* FILTER CHIPS ROW */}
        <div className="flex items-center" style={{ gap: '8px', marginTop: '12px', marginBottom: '24px' }}>
          {[
            { label: 'All', count: 12, active: true },
            { label: 'Urgent', count: 4, active: false },
            { label: 'Watch List', count: 0, active: false },
            { label: 'Completed', count: 2, active: false }
          ].map((filter) => (
            <button
              key={filter.label}
              onClick={() => setActiveFilter(filter.label)}
              style={{
                height: '36px',
                padding: '0 16px',
                borderRadius: '18px',
                border: filter.active ? 'none' : '1px solid #E5E7EB',
                background: filter.active ? '#60A5FA' : 'white',
                color: filter.active ? 'white' : '#6B7280',
                fontSize: '14px',
                fontWeight: 500,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                whiteSpace: 'nowrap'
              }}
            >
              {filter.label}
              <span
                style={{
                  background: filter.active ? 'rgba(255,255,255,0.3)' : '#F3F4F6',
                  color: filter.active ? 'white' : '#6B7280',
                  padding: '2px 8px',
                  borderRadius: '10px',
                  fontSize: '12px',
                  fontWeight: 600,
                  minWidth: '20px',
                  textAlign: 'center'
                }}
              >
                {filter.count}
              </span>
            </button>
          ))}
          
          <button
            style={{
              height: '36px',
              padding: '0 16px',
              borderRadius: '18px',
              border: '1px solid #E5E7EB',
              background: 'white',
              color: '#6B7280',
              fontSize: '14px',
              fontWeight: 500,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            By Client
            <ChevronDown style={{ width: '12px', height: '12px' }} />
          </button>
        </div>
      </div>

      {/* TABLE SECTION */}
      <div style={{
        background: 'white',
        border: '1px solid #E5E7EB',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
        {/* TABLE HEADER - 48px height */}
        <div
          style={{
            height: '48px',
            background: '#F9FAFB',
            display: 'grid',
            gridTemplateColumns: '60px 400px 280px 220px 160px',
            alignItems: 'center',
            padding: '0 40px'
          }}
        >
          <div style={{ fontSize: '11px', fontWeight: 500, color: '#6B7280', letterSpacing: '0.5px', textTransform: 'uppercase' }}>ALERT</div>
          <div style={{ fontSize: '11px', fontWeight: 500, color: '#6B7280', letterSpacing: '0.5px', textTransform: 'uppercase' }}>PROJECT CONTEXT</div>
          <div style={{ fontSize: '11px', fontWeight: 500, color: '#6B7280', letterSpacing: '0.5px', textTransform: 'uppercase' }}>TIMELINE & PROGRESS</div>
          <div style={{ fontSize: '11px', fontWeight: 500, color: '#6B7280', letterSpacing: '0.5px', textTransform: 'uppercase' }}>NEXT ACTIVITY</div>
          <div style={{ fontSize: '11px', fontWeight: 500, color: '#6B7280', letterSpacing: '0.5px', textTransform: 'uppercase', textAlign: 'right' }}>ACTION</div>
        </div>

        {/* PROJECT ROWS */}
        {projects.map((project, idx) => (
          <div
            key={project.id}
            onMouseEnter={() => setHoveredRow(idx)}
            onMouseLeave={() => setHoveredRow(null)}
            style={{
              minHeight: '88px',
              display: 'grid',
              gridTemplateColumns: '60px 400px 280px 220px 160px',
              alignItems: 'start',
              padding: '20px 40px',
              borderBottom: '1px solid #F3F4F6',
              background: hoveredRow === idx ? '#FAFAFA' : 'white',
              boxShadow: hoveredRow === idx ? '0 2px 12px rgba(0,0,0,0.08)' : 'none',
              transition: 'all 200ms ease',
              cursor: 'pointer',
              position: 'relative'
            }}
          >
            {/* COLUMN 1: ALERT ZONE */}
            <div className="flex flex-col items-center justify-center" style={{ gap: '8px', position: 'relative' }}>
              {project.flagCount > 0 && (
                <>
                  <div
                    onMouseEnter={() => setHoveredAlert(idx)}
                    onMouseLeave={() => setHoveredAlert(null)}
                    style={{ 
                      width: '36px',
                      height: '36px',
                      borderRadius: '50%',
                      background: project.flagBg,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '16px',
                      fontWeight: 700,
                      color: project.flagColor,
                      transition: 'transform 150ms ease',
                      transform: hoveredAlert === idx ? 'scale(1.05)' : 'scale(1)'
                    }}
                  >
                    {project.flagCount}
                  </div>

                  {/* Alert Breakdown Tooltip */}
                  {hoveredAlert === idx && project.alertBreakdown.length > 0 && (
                    <div
                      style={{ 
                        position: 'absolute',
                        top: '46px',
                        left: '50%',
                        marginLeft: '-100px',
                        width: '200px',
                        background: 'white',
                        border: '1px solid #E5E7EB',
                        borderRadius: '8px',
                        boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                        padding: '12px',
                        zIndex: 100,
                        animation: 'tooltipFadeIn 150ms ease-out',
                        pointerEvents: 'none'
                      }}
                    >
                      {/* Title */}
                      <div style={{ fontSize: '12px', fontWeight: 600, color: '#0A0A0A', marginBottom: '8px' }}>
                        Alert Breakdown
                      </div>
                      
                      {/* Breakdown Items */}
                      {project.alertBreakdown.map((item, itemIdx) => (
                        <div
                          key={itemIdx}
                          className="flex items-center justify-between"
                          style={{ 
                            padding: '4px 0',
                            borderBottom: itemIdx < project.alertBreakdown.length - 1 ? '1px solid #F3F4F6' : 'none'
                          }}
                        >
                          <span style={{ fontSize: '13px', color: '#6B7280' }}>
                            {item.label}
                          </span>
                          <span
                            style={{ 
                              fontSize: '13px',
                              fontWeight: 600,
                              color: '#0A0A0A',
                              minWidth: '20px',
                              textAlign: 'right'
                            }}
                          >
                            {item.count}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* COLUMN 2: PROJECT CONTEXT */}
            <div style={{ paddingLeft: '20px' }}>
              <div className="flex flex-col" style={{ gap: '4px' }}>
                {/* Line 1: Name + Trend */}
                <div className="flex items-center" style={{ gap: '8px' }}>
                  <span style={{ fontSize: '16px', fontWeight: 600, color: '#0A0A0A' }}>
                    {project.name}
                  </span>
                  <span style={{ fontSize: '14px', color: project.trendColor }}>
                    {project.trend}
                  </span>
                </div>

                {/* Line 2: Client + Owner */}
                <div style={{ fontSize: '14px', fontWeight: 400, color: '#6B7280' }}>
                  {project.client} • {project.owner}
                </div>

                {/* Line 3: Badge */}
                <div>
                  <span
                    style={{
                      display: 'inline-block',
                      padding: '2px 8px',
                      background: '#F3F4F6',
                      color: '#6B7280',
                      fontSize: '11px',
                      fontWeight: 500,
                      borderRadius: '10px'
                    }}
                  >
                    {project.badge}
                  </span>
                </div>
              </div>
            </div>

            {/* COLUMN 3: TIMELINE & PROGRESS */}
            <div style={{ paddingLeft: '0' }}>
              <div className="flex flex-col" style={{ gap: '4px' }}>
                {/* Line 1: Date Range */}
                <div style={{ fontSize: '14px', fontVariantNumeric: 'tabular-nums', color: '#6B7280' }}>
                  {project.timeline} • {project.duration}
                </div>

                {/* Line 2: Progress Bar */}
                <div style={{ width: '100%', maxWidth: '260px', height: '4px', background: '#F0F0F0', borderRadius: '2px', overflow: 'hidden' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${project.progress}%`,
                      background: project.progressColor,
                      borderRadius: '2px',
                      transition: 'width 1s ease-out'
                    }}
                  />
                </div>

                {/* Line 3: Status Text */}
                <div style={{ fontSize: '13px', fontWeight: 500, color: project.statusColor }}>
                  {project.statusText}
                </div>
              </div>
            </div>

            {/* COLUMN 4: NEXT ACTIVITY */}
            <div style={{ paddingLeft: '20px' }}>
              <div className="flex flex-col" style={{ gap: '4px' }}>
                {/* Line 1: Activity Name */}
                <div style={{ fontSize: '14px', fontWeight: 500, color: '#0A0A0A' }}>
                  {project.nextActivity}
                </div>

                {/* Line 2: Time with Icon */}
                <div style={{ fontSize: '13px', fontWeight: project.activityWeight, color: project.activityColor }}>
                  <span style={{ marginRight: '4px', fontSize: '14px' }}>{project.activityIcon}</span>
                  {project.activityTime}
                </div>
              </div>
            </div>

            {/* COLUMN 5: ACTIONS */}
            <div className="flex items-center justify-end" style={{ gap: '12px', paddingRight: '20px' }}>
              {/* Three-dot Menu */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setOpenMenu(openMenu === idx ? null : idx);
                }}
                style={{
                  width: '32px',
                  height: '32px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px',
                  background: 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#9CA3AF',
                  position: 'relative'
                }}
              >
                <MoreVertical style={{ width: '16px', height: '16px' }} />
              </button>

              {/* Arrow or Gantt Button */}
              {hoveredRow === idx ? (
                <button
                  onClick={onGanttClick}
                  style={{
                    width: '90px',
                    height: '32px',
                    background: '#60A5FA',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    animation: 'slideIn 200ms ease-out'
                  }}
                >
                  Gantt
                  <ArrowRight style={{ width: '14px', height: '14px' }} />
                </button>
              ) : (
                <ArrowRight style={{ width: '16px', height: '16px', color: '#9CA3AF' }} />
              )}
            </div>

            {/* THREE-DOT MENU DROPDOWN */}
            {openMenu === idx && (
              <>
                <div 
                  className="fixed inset-0" 
                  style={{ zIndex: 40 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setOpenMenu(null);
                  }}
                />
                
                <div
                  style={{
                    position: 'absolute',
                    top: '60px',
                    right: '60px',
                    width: '200px',
                    background: 'white',
                    border: '1px solid #E5E7EB',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
                    padding: '8px',
                    zIndex: 50,
                    animation: 'menuSlideIn 200ms ease-out'
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {menuItems.map((item, itemIdx) => {
                    if (item.type === 'separator') {
                      return (
                        <div 
                          key={`sep-${itemIdx}`}
                          style={{ 
                            height: '1px', 
                            background: '#E5E7EB', 
                            margin: '4px 0' 
                          }} 
                        />
                      );
                    }

                    return (
                      <button
                        key={itemIdx}
                        style={{
                          width: '100%',
                          height: '36px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: 400,
                          color: item.color,
                          borderRadius: '4px',
                          transition: 'background 150ms ease'
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <div className="flex items-center" style={{ gap: '8px' }}>
                          {item.icon && (
                            <span style={{ fontSize: '16px', lineHeight: 1 }}>{item.icon}</span>
                          )}
                          {item.label}
                        </div>
                        {item.type === 'view' && (
                          <ArrowRight style={{ width: '16px', height: '16px', color: '#9CA3AF' }} />
                        )}
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        ))}
      </div>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 0.8;
            transform: scale(1.0);
          }
          50% {
            opacity: 1.0;
            transform: scale(1.2);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(10px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

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

        @keyframes tooltipFadeIn {
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
    </div>
  );
}
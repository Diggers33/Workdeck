import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, AlertTriangle } from 'lucide-react';
import { CalendarEvent } from './WorkdeckCalendar';

interface CalendarRightSidebarProps {
  currentDate: Date;
  events: CalendarEvent[];
  onClose?: () => void;
}

type TimesheetStatus = 'not-submitted' | 'pending' | 'approved' | 'denied';

export function CalendarRightSidebar({ currentDate, events, onClose }: CalendarRightSidebarProps) {
  const [activeTab, setActiveTab] = useState<'timesheet' | 'comments' | 'activity'>('timesheet');
  const [timesheetPeriod, setTimesheetPeriod] = useState(new Date(2025, 8, 1)); // September 2025
  const [timesheetStatus, setTimesheetStatus] = useState<TimesheetStatus>('not-submitted');

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                      'July', 'August', 'September', 'October', 'November', 'December'];

  // Calculate week summary (Sep 29 - Oct 5)
  const weekProjects = [
    { name: 'No project', hours: 11.5, color: '#6B7280' },
    { name: 'Horizon Europe 2024', hours: 0.5, color: '#3B82F6' },
    { name: 'PROTEUS', hours: 4, color: '#F97316' }
  ];
  const weekTotal = weekProjects.reduce((sum, p) => sum + p.hours, 0);

  // Calculate monthly totals for September
  const monthlyLogged = 156.5;
  const workingDays = 22;
  const monthlyExpected = workingDays * 8;
  const monthlyDifference = monthlyLogged - monthlyExpected;

  const handlePreviousPeriod = () => {
    const newDate = new Date(timesheetPeriod);
    newDate.setMonth(newDate.getMonth() - 1);
    setTimesheetPeriod(newDate);
  };

  const handleNextPeriod = () => {
    const newDate = new Date(timesheetPeriod);
    newDate.setMonth(newDate.getMonth() + 1);
    setTimesheetPeriod(newDate);
  };

  const getStatusIcon = (status: TimesheetStatus) => {
    switch (status) {
      case 'not-submitted': return '⚪';
      case 'pending': return '🟡';
      case 'approved': return '🟢';
      case 'denied': return '🔴';
    }
  };

  const getStatusText = (status: TimesheetStatus) => {
    switch (status) {
      case 'not-submitted': return 'Not submitted';
      case 'pending': return 'Pending approval';
      case 'approved': return 'Approved';
      case 'denied': return 'Denied — needs revision';
    }
  };

  const getStatusColor = (status: TimesheetStatus) => {
    switch (status) {
      case 'not-submitted': return '#6B7280';
      case 'pending': return '#F59E0B';
      case 'approved': return '#10B981';
      case 'denied': return '#EF4444';
    }
  };

  return (
    <div style={{
      width: '360px',
      flexShrink: 0,
      background: 'white',
      borderLeft: '1px solid #E5E7EB',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px',
        borderBottom: '1px solid #E5E7EB',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0
      }}>
        <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#0A0A0A', margin: 0 }}>
          Calendar Details
        </h3>
        <button
          style={{
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            border: 'none',
            background: 'transparent',
            cursor: 'pointer',
            color: '#6B7280',
            fontSize: '20px',
            borderRadius: '4px'
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          onClick={onClose}
        >
          ✕
        </button>
      </div>

      {/* Timesheet Period Selector */}
      <div style={{ padding: '20px', borderBottom: '1px solid #E5E7EB', flexShrink: 0 }}>
        <div style={{
          padding: '16px',
          background: '#F9FAFB',
          borderRadius: '8px',
          border: '1px solid #E5E7EB'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '12px'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '15px' }}>📅</span>
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#0A0A0A' }}>
                {monthNames[timesheetPeriod.getMonth()]} {timesheetPeriod.getFullYear()}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                onClick={handlePreviousPeriod}
                style={{
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: '#6B7280',
                  borderRadius: '4px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#E5E7EB'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={handleNextPeriod}
                style={{
                  width: '24px',
                  height: '24px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: 'none',
                  background: 'transparent',
                  cursor: 'pointer',
                  color: '#6B7280',
                  borderRadius: '4px'
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = '#E5E7EB'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>
            Timesheet Period: {monthNames[timesheetPeriod.getMonth()]} 1 - {monthNames[timesheetPeriod.getMonth()]} 30
          </div>
          <div style={{
            fontSize: '13px',
            color: getStatusColor(timesheetStatus),
            fontWeight: 500,
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            Status: {getStatusIcon(timesheetStatus)} {getStatusText(timesheetStatus)}
          </div>
        </div>
      </div>

      {/* Scrollable Content */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {/* Weekly Summary */}
        <div style={{ padding: '20px', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{ fontSize: '14px', fontWeight: 600, color: '#0A0A0A', marginBottom: '12px' }}>
            Weekly Summary (Sep 29 - Oct 5)
          </div>
          <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '12px' }}>
            {weekProjects.map(project => (
              <div
                key={project.name}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '8px',
                  fontSize: '13px'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '3px',
                    height: '12px',
                    background: project.color,
                    borderRadius: '2px'
                  }} />
                  <span style={{ color: '#374151' }}>{project.name}</span>
                </div>
                <span style={{ fontWeight: 500, color: '#0A0A0A' }}>
                  {project.hours.toFixed(0)}h {((project.hours % 1) * 60).toFixed(0).padStart(2, '0')}m
                </span>
              </div>
            ))}
          </div>
          <div style={{
            borderTop: '1px solid #E5E7EB',
            marginTop: '12px',
            paddingTop: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '13px',
            fontWeight: 600
          }}>
            <span style={{ color: '#0A0A0A' }}>Week Total</span>
            <span style={{ color: '#0A0A0A' }}>
              {Math.floor(weekTotal)}h {((weekTotal % 1) * 60).toFixed(0).padStart(2, '0')}m
            </span>
          </div>
        </div>

        {/* Monthly Timesheet Summary */}
        <div style={{ padding: '20px', borderBottom: '1px solid #E5E7EB' }}>
          <div style={{
            padding: '16px',
            background: monthlyDifference < 0 ? '#FEF2F2' : '#F0FDF4',
            border: `1px solid ${monthlyDifference < 0 ? '#FECACA' : '#BBF7D0'}`,
            borderRadius: '8px'
          }}>
            <div style={{ fontSize: '14px', fontWeight: 600, color: '#0A0A0A', marginBottom: '16px', letterSpacing: '0.02em' }}>
              SEPTEMBER TIMESHEET
            </div>

            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>
                Logged
              </div>
              <div style={{ fontSize: '20px', fontWeight: 600, color: '#0A0A0A' }}>
                {Math.floor(monthlyLogged)}h {((monthlyLogged % 1) * 60).toFixed(0).padStart(2, '0')}m
              </div>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <div style={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}>
                Expected ({workingDays} days × 8h)
              </div>
              <div style={{ fontSize: '16px', fontWeight: 500, color: '#6B7280' }}>
                {monthlyExpected}h 00m
              </div>
            </div>

            <div style={{
              paddingTop: '12px',
              borderTop: '1px solid' + (monthlyDifference < 0 ? '#FCA5A5' : '#86EFAC')
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>
                  Difference
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '16px',
                  fontWeight: 600,
                  color: monthlyDifference < 0 ? '#DC2626' : '#059669'
                }}>
                  {monthlyDifference < 0 ? '-' : '+'}{Math.abs(Math.floor(monthlyDifference))}h {((Math.abs(monthlyDifference) % 1) * 60).toFixed(0).padStart(2, '0')}m
                  {monthlyDifference < 0 && <AlertTriangle size={16} color="#DC2626" />}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div style={{ padding: '20px' }}>
          <button
            style={{
              width: '100%',
              height: '44px',
              background: timesheetStatus === 'not-submitted' ? '#0066FF' : '#E5E7EB',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: 600,
              color: timesheetStatus === 'not-submitted' ? 'white' : '#9CA3AF',
              cursor: timesheetStatus === 'not-submitted' ? 'pointer' : 'not-allowed',
              transition: 'all 150ms'
            }}
            disabled={timesheetStatus !== 'not-submitted'}
            onMouseEnter={(e) => {
              if (timesheetStatus === 'not-submitted') {
                e.currentTarget.style.background = '#0052CC';
              }
            }}
            onMouseLeave={(e) => {
              if (timesheetStatus === 'not-submitted') {
                e.currentTarget.style.background = '#0066FF';
              }
            }}
          >
            Submit {monthNames[timesheetPeriod.getMonth()]} Timesheet
          </button>

          {timesheetStatus === 'pending' && (
            <div style={{
              marginTop: '12px',
              padding: '12px',
              background: '#FEF3C7',
              border: '1px solid #FDE68A',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#92400E'
            }}>
              ⏳ Awaiting manager approval
            </div>
          )}

          {timesheetStatus === 'approved' && (
            <div style={{
              marginTop: '12px',
              padding: '12px',
              background: '#D1FAE5',
              border: '1px solid #A7F3D0',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#065F46'
            }}>
              ✓ Approved by Sarah Johnson
            </div>
          )}

          {timesheetStatus === 'denied' && (
            <div style={{
              marginTop: '12px',
              padding: '12px',
              background: '#FEE2E2',
              border: '1px solid #FECACA',
              borderRadius: '6px',
              fontSize: '12px',
              color: '#991B1B'
            }}>
              ❌ Denied: Please add missing project codes
              <button
                style={{
                  marginTop: '8px',
                  width: '100%',
                  padding: '8px',
                  background: 'white',
                  border: '1px solid #FCA5A5',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#DC2626',
                  cursor: 'pointer'
                }}
              >
                Revise Timesheet
              </button>
            </div>
          )}
        </div>

        {/* Tabs */}
        <div style={{ borderTop: '1px solid #E5E7EB', padding: '0 20px' }}>
          <div style={{ display: 'flex', gap: '0', borderBottom: '1px solid #E5E7EB' }}>
            {(['timesheet', 'comments', 'activity'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '12px 16px',
                  border: 'none',
                  background: 'transparent',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: activeTab === tab ? '#0066FF' : '#6B7280',
                  cursor: 'pointer',
                  borderBottom: activeTab === tab ? '2px solid #0066FF' : 'none',
                  marginBottom: '-1px',
                  textTransform: 'capitalize'
                }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div style={{ padding: '20px' }}>
          {activeTab === 'timesheet' && (
            <div style={{ fontSize: '13px', color: '#6B7280', textAlign: 'center', padding: '32px 0' }}>
              Detailed timesheet breakdown will appear here
            </div>
          )}
          {activeTab === 'comments' && (
            <div style={{ fontSize: '13px', color: '#6B7280', textAlign: 'center', padding: '32px 0' }}>
              No comments yet
            </div>
          )}
          {activeTab === 'activity' && (
            <div style={{ fontSize: '13px', color: '#6B7280', textAlign: 'center', padding: '32px 0' }}>
              No activity to show
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
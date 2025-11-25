import React, { useState } from 'react';
import { X, Calendar, Info } from 'lucide-react';

interface QuickCreateModalProps {
  initialDate: Date;
  onClose: () => void;
  onSave: (event: any) => void;
}

export function QuickCreateModal({ initialDate, onClose, onSave }: QuickCreateModalProps) {
  const [eventType, setEventType] = useState<'event' | 'task' | 'timeblock'>('event');
  const [title, setTitle] = useState('');
  const [project, setProject] = useState('');
  const [task, setTask] = useState('');
  const [date, setDate] = useState(initialDate.toISOString().split('T')[0]);
  const [startTime, setStartTime] = useState('13:30');
  const [endTime, setEndTime] = useState('14:00');
  const [isTimesheet, setIsTimesheet] = useState(true);
  const [isBillable, setIsBillable] = useState(false);
  const [showMoreOptions, setShowMoreOptions] = useState(false);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);

  const recentProjects = [
    { name: 'Customer Support', color: '#F59E0B', isClient: false },
    { name: 'PROTEUS', color: '#3B82F6', isClient: true },
    { name: 'ETERNAL D2.1 Roadmap', color: '#9333EA', isClient: true }
  ];

  // Calculate duration
  const calculateDuration = () => {
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    const durationMinutes = (endHour * 60 + endMin) - (startHour * 60 + startMin);
    return durationMinutes > 0 ? `${durationMinutes}m` : '0m';
  };

  const getInfoMessage = () => {
    if (eventType === 'timeblock') {
      return 'Time blocks are private and not included in timesheets.';
    }
    if (task) {
      return 'Included in timesheet because it\'s linked to a task.';
    }
    if (project && recentProjects.find(p => p.name === project)?.isClient) {
      return `Billable because "${project}" is a client project.`;
    }
    if (!isTimesheet) {
      return 'Private events are not included in timesheets by default.';
    }
    return null;
  };

  const infoMessage = getInfoMessage();

  return (
    <>
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          zIndex: 9998,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onClick={onClose}
      />
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '520px',
          maxHeight: '90vh',
          background: 'white',
          borderRadius: '12px',
          boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          zIndex: 9999,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div style={{
          padding: '20px',
          borderBottom: '1px solid #E5E7EB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a title..."
            autoFocus
            style={{
              flex: 1,
              border: 'none',
              outline: 'none',
              fontSize: '18px',
              fontWeight: 600,
              color: '#0A0A0A',
              background: 'transparent'
            }}
          />
          <button
            onClick={onClose}
            style={{
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              color: '#6B7280',
              borderRadius: '6px'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
          {/* Event Type Selector */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '8px' }}>
              {(['event', 'task', 'timeblock'] as const).map(type => (
                <button
                  key={type}
                  onClick={() => {
                    setEventType(type);
                    if (type === 'timeblock') {
                      setIsTimesheet(false);
                      setIsBillable(false);
                    } else {
                      setIsTimesheet(true);
                    }
                  }}
                  style={{
                    padding: '8px 16px',
                    background: eventType === type ? '#EFF6FF' : 'transparent',
                    border: eventType === type ? '1px solid #0066FF' : '1px solid #E5E7EB',
                    borderRadius: '6px',
                    fontSize: '13px',
                    fontWeight: 500,
                    color: eventType === type ? '#0066FF' : '#6B7280',
                    cursor: 'pointer',
                    textTransform: 'capitalize'
                  }}
                >
                  {type === 'timeblock' ? 'Time block' : type}
                </button>
              ))}
            </div>
          </div>

          {/* User Info */}
          <div style={{ marginBottom: '20px' }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px',
              background: '#F9FAFB',
              borderRadius: '8px'
            }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: '#0066FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '13px',
                fontWeight: 600
              }}>
                👤
              </div>
              <div>
                <div style={{ fontSize: '13px', fontWeight: 500, color: '#0A0A0A' }}>
                  Colm Digby
                </div>
                <div style={{ fontSize: '12px', color: '#6B7280' }}>
                  cdigby@iris-eng.com
                </div>
              </div>
              <button
                style={{
                  marginLeft: 'auto',
                  width: '32px',
                  height: '32px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid #E5E7EB',
                  background: 'white',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  color: '#6B7280'
                }}
              >
                <Calendar size={16} />
              </button>
            </div>
          </div>

          {/* Project */}
          <div style={{ marginBottom: '20px', position: 'relative' }}>
            <label style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 500,
              color: '#374151',
              marginBottom: '8px'
            }}>
              Project
            </label>
            <button
              onClick={() => setShowProjectDropdown(!showProjectDropdown)}
              style={{
                width: '100%',
                height: '40px',
                padding: '0 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                border: '1px solid #E5E7EB',
                borderRadius: '6px',
                background: 'white',
                cursor: 'pointer',
                fontSize: '13px',
                color: project ? '#0A0A0A' : '#9CA3AF',
                textAlign: 'left'
              }}
            >
              {project || 'Select project...'}
              <span>▼</span>
            </button>

            {showProjectDropdown && (
              <>
                <div
                  style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    zIndex: 998
                  }}
                  onClick={() => setShowProjectDropdown(false)}
                />
                <div style={{
                  position: 'absolute',
                  top: '72px',
                  left: 0,
                  right: 0,
                  background: 'white',
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  zIndex: 999,
                  overflow: 'hidden'
                }}>
                  <div style={{ padding: '8px 12px', borderBottom: '1px solid #E5E7EB' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', letterSpacing: '0.05em' }}>
                      RECENT:
                    </div>
                  </div>
                  {recentProjects.map(proj => (
                    <button
                      key={proj.name}
                      onClick={() => {
                        setProject(proj.name);
                        setShowProjectDropdown(false);
                        if (proj.isClient) {
                          setIsBillable(true);
                        }
                      }}
                      style={{
                        width: '100%',
                        padding: '10px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        background: 'transparent',
                        border: 'none',
                        fontSize: '13px',
                        color: '#0A0A0A',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        background: proj.color
                      }} />
                      {proj.name}
                    </button>
                  ))}
                  <div style={{ padding: '8px 12px', borderTop: '1px solid #E5E7EB' }}>
                    <div style={{ fontSize: '11px', fontWeight: 600, color: '#6B7280', letterSpacing: '0.05em' }}>
                      All projects...
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Task */}
          {eventType !== 'timeblock' && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: '#374151',
                marginBottom: '8px'
              }}>
                Task (optional)
              </label>
              <select
                value={task}
                onChange={(e) => setTask(e.target.value)}
                style={{
                  width: '100%',
                  height: '40px',
                  padding: '0 12px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px',
                  background: 'white',
                  fontSize: '13px',
                  color: task ? '#0A0A0A' : '#9CA3AF'
                }}
              >
                <option value="">Select task...</option>
                <option value="task1">API Documentation</option>
                <option value="task2">Review deliverable</option>
              </select>
            </div>
          )}

          {/* Date and Time */}
          <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr auto', gap: '12px', marginBottom: '20px', alignItems: 'end' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: '#374151',
                marginBottom: '8px'
              }}>
                Date
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                style={{
                  height: '40px',
                  padding: '0 12px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px',
                  fontSize: '13px',
                  color: '#0A0A0A'
                }}
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: '#374151',
                marginBottom: '8px'
              }}>
                From
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                style={{
                  width: '100%',
                  height: '40px',
                  padding: '0 12px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px',
                  fontSize: '13px',
                  color: '#0A0A0A'
                }}
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: '#374151',
                marginBottom: '8px'
              }}>
                To
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                style={{
                  width: '100%',
                  height: '40px',
                  padding: '0 12px',
                  border: '1px solid #E5E7EB',
                  borderRadius: '6px',
                  fontSize: '13px',
                  color: '#0A0A0A'
                }}
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '13px',
                fontWeight: 500,
                color: '#374151',
                marginBottom: '8px'
              }}>
                Duration
              </label>
              <div style={{
                height: '40px',
                padding: '0 12px',
                display: 'flex',
                alignItems: 'center',
                background: '#F9FAFB',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 500,
                color: '#6B7280'
              }}>
                {calculateDuration()}
              </div>
            </div>
          </div>

          {/* Timesheet and Billable Checkboxes */}
          {eventType !== 'timeblock' && (
            <div style={{ marginBottom: '20px' }}>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '12px',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={isTimesheet}
                  onChange={(e) => setIsTimesheet(e.target.checked)}
                  style={{
                    width: '16px',
                    height: '16px',
                    cursor: 'pointer'
                  }}
                />
                <span style={{ fontSize: '13px', fontWeight: 500, color: '#0A0A0A' }}>
                  Timesheet
                </span>
                <span style={{ fontSize: '12px', color: '#6B7280' }}>
                  — Include in your submitted work hours
                </span>
              </label>
              <label style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer'
              }}>
                <input
                  type="checkbox"
                  checked={isBillable}
                  onChange={(e) => setIsBillable(e.target.checked)}
                  style={{
                    width: '16px',
                    height: '16px',
                    cursor: 'pointer'
                  }}
                />
                <span style={{ fontSize: '13px', fontWeight: 500, color: '#0A0A0A' }}>
                  Billable
                </span>
                <span style={{ fontSize: '12px', color: '#6B7280' }}>
                  — Track as billable time for client invoicing
                </span>
              </label>
            </div>
          )}

          {/* Info Message */}
          {infoMessage && (
            <div style={{
              padding: '12px',
              background: '#EFF6FF',
              border: '1px solid #BFDBFE',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              marginBottom: '20px'
            }}>
              <Info size={16} color="#0066FF" style={{ flexShrink: 0, marginTop: '2px' }} />
              <span style={{ fontSize: '12px', color: '#1E40AF' }}>
                {infoMessage}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid #E5E7EB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexShrink: 0
        }}>
          <button
            onClick={() => setShowMoreOptions(!showMoreOptions)}
            style={{
              padding: '0',
              border: 'none',
              background: 'transparent',
              fontSize: '13px',
              fontWeight: 500,
              color: '#0066FF',
              cursor: 'pointer'
            }}
          >
            {showMoreOptions ? 'Less options' : 'More options'}
          </button>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={onClose}
              style={{
                padding: '10px 20px',
                border: '1px solid #E5E7EB',
                borderRadius: '6px',
                background: 'white',
                fontSize: '13px',
                fontWeight: 500,
                color: '#0A0A0A',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
            <button
              onClick={() => onSave({ title, project, task, date, startTime, endTime, isTimesheet, isBillable })}
              disabled={!title}
              style={{
                padding: '10px 20px',
                border: 'none',
                borderRadius: '6px',
                background: title ? '#0066FF' : '#E5E7EB',
                fontSize: '13px',
                fontWeight: 500,
                color: title ? 'white' : '#9CA3AF',
                cursor: title ? 'pointer' : 'not-allowed'
              }}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

import React, { useState } from 'react';
import { Check, DollarSign, User, MessageCircle, Target, Paperclip, ChevronDown } from 'lucide-react';

const mockActivities = [
  {
    id: 1,
    type: 'task_completed',
    icon: <Check size={16} color="white" />,
    iconBg: '#10B981',
    title: 'Task completed',
    detail: 'Literature review',
    detailClickable: true,
    byLine: 'by Charlie Day',
    timestamp: '2 hours ago'
  },
  {
    id: 2,
    type: 'budget_update',
    icon: <DollarSign size={16} color="white" />,
    iconBg: '#F59E0B',
    title: 'Budget updated to €250,000',
    detail: null,
    detailClickable: false,
    byLine: 'by Bob Ross',
    timestamp: '5 hours ago'
  },
  {
    id: 3,
    type: 'team_member',
    icon: <User size={16} color="white" />,
    iconBg: '#3B82F6',
    title: 'Alice Chen added to project',
    detail: 'as Participant',
    detailClickable: false,
    byLine: 'by Charlie Day',
    timestamp: 'Yesterday'
  },
  {
    id: 4,
    type: 'comment',
    icon: <MessageCircle size={16} color="white" />,
    iconBg: '#6B7280',
    title: 'New comment on task',
    detail: 'Data collection',
    detailClickable: true,
    preview: 'We need to prioritize this...',
    byLine: 'by John Doe',
    timestamp: '2 days ago'
  },
  {
    id: 5,
    type: 'milestone',
    icon: <Target size={16} color="white" />,
    iconBg: '#10B981',
    title: 'Milestone achieved',
    detail: 'Phase 1 Complete',
    detailClickable: false,
    byLine: null,
    timestamp: '3 days ago'
  },
  {
    id: 6,
    type: 'file_upload',
    icon: <Paperclip size={16} color="white" />,
    iconBg: '#3B82F6',
    title: 'File uploaded',
    detail: 'Research_Report_Q1.pdf',
    detailClickable: true,
    byLine: 'by Alice Chen',
    timestamp: '1 week ago'
  }
];

export function ProjectActivityTab() {
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('All activity');
  const [activities] = useState(mockActivities);

  const filterOptions = ['All activity', 'Tasks', 'Comments', 'Files', 'Team', 'Milestones'];

  return (
    <div style={{ padding: '24px' }}>
      {/* Filter Dropdown */}
      <div style={{
        position: 'relative',
        marginBottom: '20px'
      }}>
        <button
          onClick={() => setFilterOpen(!filterOpen)}
          style={{
            width: '160px',
            height: '40px',
            border: '1px solid #E5E7EB',
            borderRadius: '6px',
            background: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 12px',
            fontSize: '14px',
            fontWeight: 500,
            color: '#6B7280',
            cursor: 'pointer',
            transition: 'all 150ms ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = '#D1D5DB'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
        >
          <span>{selectedFilter}</span>
          <ChevronDown size={16} />
        </button>

        {filterOpen && (
          <div style={{
            position: 'absolute',
            top: '48px',
            left: 0,
            width: '200px',
            background: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            padding: '8px',
            zIndex: 10
          }}>
            {filterOptions.map((option) => (
              <button
                key={option}
                onClick={() => {
                  setSelectedFilter(option);
                  setFilterOpen(false);
                }}
                style={{
                  width: '100%',
                  height: '36px',
                  padding: '0 12px',
                  background: selectedFilter === option ? '#EFF6FF' : 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  color: '#0A0A0A',
                  textAlign: 'left',
                  cursor: 'pointer',
                  transition: 'background 150ms ease'
                }}
                onMouseEnter={(e) => {
                  if (selectedFilter !== option) {
                    e.currentTarget.style.background = '#F9FAFB';
                  }
                }}
                onMouseLeave={(e) => {
                  if (selectedFilter !== option) {
                    e.currentTarget.style.background = 'transparent';
                  }
                }}
              >
                {option}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Activity Timeline */}
      <div>
        {activities.map((activity, index) => (
          <div key={activity.id}>
            {/* Date Separator */}
            {index === 3 && (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                margin: '20px 0',
                fontSize: '12px',
                fontWeight: 600,
                color: '#9CA3AF',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}>
                <span>Last week</span>
                <div style={{
                  flex: 1,
                  height: '1px',
                  background: '#F3F4F6'
                }} />
              </div>
            )}

            {/* Activity Item */}
            <div style={{
              display: 'flex',
              gap: '12px',
              padding: '16px 0',
              borderBottom: '1px solid #F3F4F6'
            }}>
              {/* Icon */}
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '16px',
                background: activity.iconBg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0
              }}>
                {activity.icon}
              </div>

              {/* Content */}
              <div style={{ flex: 1 }}>
                {/* Timestamp */}
                <div style={{
                  fontSize: '12px',
                  color: '#9CA3AF',
                  marginBottom: '4px'
                }}>
                  {activity.timestamp}
                </div>

                {/* Main Text */}
                <div style={{
                  fontSize: '14px',
                  fontWeight: 500,
                  color: '#0A0A0A',
                  marginBottom: activity.detail ? '4px' : '0'
                }}>
                  {activity.title}
                </div>

                {/* Detail */}
                {activity.detail && (
                  <div style={{
                    fontSize: '14px',
                    color: activity.detailClickable ? '#3B82F6' : '#0A0A0A',
                    cursor: activity.detailClickable ? 'pointer' : 'default',
                    marginBottom: '4px',
                    fontWeight: activity.type === 'milestone' ? 600 : 400
                  }}>
                    {activity.detail}
                  </div>
                )}

                {/* Preview (for comments) */}
                {activity.preview && (
                  <div style={{
                    fontSize: '13px',
                    fontStyle: 'italic',
                    color: '#9CA3AF',
                    marginBottom: '4px'
                  }}>
                    "{activity.preview}"
                  </div>
                )}

                {/* By Line */}
                {activity.byLine && (
                  <div style={{
                    fontSize: '13px',
                    color: '#6B7280'
                  }}>
                    {activity.byLine}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Load More */}
      <button style={{
        width: '100%',
        height: '40px',
        background: 'white',
        border: '2px dashed #3B82F6',
        borderRadius: '6px',
        fontSize: '14px',
        fontWeight: 500,
        color: '#3B82F6',
        cursor: 'pointer',
        transition: 'all 150ms ease',
        marginTop: '20px'
      }}
      onMouseEnter={(e) => e.currentTarget.style.background = '#EFF6FF'}
      onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
      >
        Load earlier activity
      </button>
    </div>
  );
}

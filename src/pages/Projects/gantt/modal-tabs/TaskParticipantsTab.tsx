import React, { useState } from 'react';
import { Search, User, Calendar, X } from 'lucide-react';

interface TaskParticipantsTabProps {
  task: any;
}

const participants = [
  { id: 1, name: 'Laura Rodriguez Turi...', avatar: 'LR', role: 'Leader', allocated: 0, consumed: '0h 30m', balance: '0h 30m', roleColor: '#3B82F6', roleBg: '#EFF6FF' },
  { id: 2, name: 'Marcelo Janvrot Viv', avatar: 'MJ', role: 'Owner', allocated: 0, consumed: '0h 00m', balance: '0h 00m', roleColor: '#F97316', roleBg: '#FFF7ED' },
  { id: 3, name: 'Manel Sánchez', avatar: 'MS', role: null, allocated: 0, consumed: '0h 00m', balance: '0h 00m' },
  { id: 4, name: 'Alexandra Poch', avatar: 'AP', role: null, allocated: 0, consumed: '0h 30m', balance: '0h 30m', active: true },
  { id: 5, name: 'Didac Muñoz', avatar: 'DM', role: null, allocated: 320, consumed: '0h 00m', balance: '320h 00m', active: true },
  { id: 6, name: 'Victor Olmos', avatar: 'VO', role: null, allocated: 0, consumed: '0h 30m', balance: '0h 30m', badge: 've' },
  { id: 7, name: 'Laurent Philippet', avatar: 'LP', role: null, allocated: 0, consumed: '4h 00m', balance: '4h 00m' },
  { id: 8, name: 'Alessandro Nardec', avatar: 'AN', role: null, allocated: 0, consumed: '2h 30m', balance: '2h 30m', badge: '4h' }
];

export function TaskParticipantsTab({ task }: TaskParticipantsTabProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const totalAllocated = participants.reduce((sum, p) => sum + p.allocated, 0);
  const totalConsumed = participants.reduce((sum, p) => {
    const hours = parseFloat(p.consumed.replace('h', '').replace('m', '')) || 0;
    return sum + hours;
  }, 0);
  const totalBalance = totalAllocated - totalConsumed;

  return (
    <div style={{ maxWidth: '100%' }}>
      {/* Search Bar */}
      <div style={{
        position: 'relative',
        marginBottom: '24px'
      }}>
        <Search size={18} color="#6B7280" style={{
          position: 'absolute',
          left: '16px',
          top: '50%',
          transform: 'translateY(-50%)',
          pointerEvents: 'none'
        }} />
        <input
          type="text"
          placeholder="Search and add participants..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            height: '48px',
            padding: '0 16px 0 48px',
            border: '1px solid #E5E7EB',
            borderRadius: '8px',
            fontSize: '15px',
            outline: 'none',
            transition: 'all 150ms ease'
          }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = '#3B82F6';
            e.currentTarget.style.boxShadow = '0 0 0 3px rgba(59,130,246,0.1)';
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = '#E5E7EB';
            e.currentTarget.style.boxShadow = 'none';
          }}
        />
      </div>

      {/* Participants Table */}
      <div style={{
        border: '1px solid #E5E7EB',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        {/* Table Header */}
        <div style={{
          height: '48px',
          background: '#F9FAFB',
          borderBottom: '1px solid #E5E7EB',
          padding: '0 20px',
          display: 'grid',
          gridTemplateColumns: '300px 140px 140px 140px 140px',
          alignItems: 'center'
        }}>
          <div style={{
            fontSize: '12px',
            fontWeight: 600,
            color: '#6B7280',
            textTransform: 'uppercase'
          }}>
            PARTICIPANT
          </div>
          <div style={{
            fontSize: '12px',
            fontWeight: 600,
            color: '#6B7280',
            textTransform: 'uppercase',
            textAlign: 'center'
          }}>
            ALLOCATED H.
          </div>
          <div style={{
            fontSize: '12px',
            fontWeight: 600,
            color: '#6B7280',
            textTransform: 'uppercase',
            textAlign: 'center'
          }}>
            CONSUMED H.
          </div>
          <div style={{
            fontSize: '12px',
            fontWeight: 600,
            color: '#6B7280',
            textTransform: 'uppercase',
            textAlign: 'center'
          }}>
            BALANCE
          </div>
          <div style={{
            fontSize: '12px',
            fontWeight: 600,
            color: '#6B7280',
            textTransform: 'uppercase'
          }}>
          </div>
        </div>

        {/* Table Rows */}
        {participants.map((participant, idx) => (
          <div
            key={participant.id}
            style={{
              height: '64px',
              background: 'white',
              borderBottom: idx < participants.length - 1 ? '1px solid #F3F4F6' : 'none',
              padding: '0 20px',
              display: 'grid',
              gridTemplateColumns: '300px 140px 140px 140px 140px',
              alignItems: 'center',
              transition: 'background 150ms ease',
              cursor: 'pointer'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#FAFAFA'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
          >
            {/* Participant */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {participant.active && (
                <div style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: '#10B981'
                }} />
              )}
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: '#D1D5DB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 600,
                color: '#6B7280'
              }}>
                {participant.avatar}
              </div>
              <div>
                <div style={{
                  fontSize: '15px',
                  fontWeight: 500,
                  color: '#0A0A0A',
                  marginBottom: '2px'
                }}>
                  {participant.name}
                </div>
                {participant.role && (
                  <div style={{
                    display: 'inline-block',
                    padding: '2px 8px',
                    background: participant.roleBg,
                    color: participant.roleColor,
                    fontSize: '12px',
                    fontWeight: 600,
                    borderRadius: '10px'
                  }}>
                    {participant.role}
                  </div>
                )}
                {participant.badge && (
                  <div style={{
                    display: 'inline-block',
                    padding: '2px 6px',
                    background: '#EFF6FF',
                    color: '#3B82F6',
                    fontSize: '11px',
                    fontWeight: 600,
                    borderRadius: '10px'
                  }}>
                    {participant.badge}
                  </div>
                )}
              </div>
            </div>

            {/* Allocated */}
            <div style={{
              fontSize: '15px',
              color: participant.allocated > 0 ? '#0A0A0A' : '#6B7280',
              fontWeight: participant.allocated > 0 ? 700 : 400,
              textAlign: 'center'
            }}>
              {participant.allocated}
            </div>

            {/* Consumed */}
            <div style={{
              fontSize: '15px',
              color: '#6B7280',
              textAlign: 'center'
            }}>
              {participant.consumed}
            </div>

            {/* Balance */}
            <div style={{
              fontSize: '15px',
              color: participant.allocated > 0 ? '#10B981' : '#6B7280',
              fontWeight: participant.allocated > 0 ? 700 : 400,
              textAlign: 'center'
            }}>
              {participant.balance}
            </div>

            {/* Actions */}
            <div style={{
              display: 'flex',
              gap: '8px',
              justifyContent: 'flex-end'
            }}>
              <button style={{
                width: '36px',
                height: '36px',
                border: '1px solid #E5E7EB',
                borderRadius: '6px',
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 150ms ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
              >
                <User size={16} color="#6B7280" />
              </button>
              <button style={{
                width: '36px',
                height: '36px',
                border: '1px solid #E5E7EB',
                borderRadius: '6px',
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 150ms ease'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'white'}
              >
                <Calendar size={16} color="#6B7280" />
              </button>
              <button style={{
                width: '36px',
                height: '36px',
                border: '1px solid #E5E7EB',
                borderRadius: '6px',
                background: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 150ms ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#FEE2E2';
                e.currentTarget.style.borderColor = '#DC2626';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = 'white';
                e.currentTarget.style.borderColor = '#E5E7EB';
              }}
              >
                <X size={16} color="#DC2626" />
              </button>
            </div>
          </div>
        ))}

        {/* Table Footer - Total Row */}
        <div style={{
          height: '72px',
          background: '#F9FAFB',
          borderTop: '2px solid #E5E7EB',
          padding: '0 20px',
          display: 'grid',
          gridTemplateColumns: '300px 140px 140px 140px 140px',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              background: '#10B981',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <div style={{
                width: '16px',
                height: '16px',
                border: '3px solid white',
                borderRadius: '50%'
              }} />
            </div>
            <span style={{
              fontSize: '18px',
              fontWeight: 600,
              color: '#0A0A0A'
            }}>
              Total hours
            </span>
          </div>
          <div style={{
            fontSize: '18px',
            fontWeight: 700,
            color: '#0A0A0A',
            textAlign: 'center'
          }}>
            {totalAllocated}h 00m
          </div>
          <div style={{
            fontSize: '18px',
            fontWeight: 700,
            color: '#0A0A0A',
            textAlign: 'center'
          }}>
            8h 00m
          </div>
          <div style={{
            fontSize: '18px',
            fontWeight: 700,
            color: '#10B981',
            textAlign: 'center'
          }}>
            319h 00m
          </div>
          <div></div>
        </div>
      </div>
    </div>
  );
}

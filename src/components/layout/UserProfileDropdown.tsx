import { useState } from 'react';
import { ChevronLeft, ChevronRight, User, Layout, Settings, HelpCircle, LogOut } from 'lucide-react';

export function UserProfileDropdown() {
  const [isOpen, setIsOpen] = useState(false);

  const user = {
    name: 'Sarah Martinez',
    email: 'sarah.m@agency.com',
    initials: 'SM',
    status: 'Office',
    statusColor: '#10B981'
  };

  const menuItems = [
    {
      icon: <User style={{ width: '16px', height: '16px' }} />,
      label: 'My Profile',
      color: '#0A0A0A'
    },
    {
      icon: <Layout style={{ width: '16px', height: '16px' }} />,
      label: 'Customize Widgets',
      color: '#0A0A0A'
    },
    {
      icon: <Settings style={{ width: '16px', height: '16px' }} />,
      label: 'Settings',
      color: '#0A0A0A'
    },
    {
      icon: <HelpCircle style={{ width: '16px', height: '16px' }} />,
      label: 'Help & Support',
      color: '#0A0A0A'
    },
    {
      icon: <LogOut style={{ width: '16px', height: '16px' }} />,
      label: 'Log Out',
      color: '#DC2626'
    }
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative ml-2 cursor-pointer"
        title="User Profile"
      >
        <div className="w-10 h-10 rounded-full bg-[#3B82F6] flex items-center justify-center text-white text-sm hover:ring-2 hover:ring-[#3B82F6] hover:ring-offset-2 transition-all">
          {user.initials}
        </div>
        <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-[#10B981] border-2 border-white rounded-full"></div>
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
              top: '56px',
              right: 0,
              width: '280px',
              background: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '12px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              zIndex: 50,
              animation: 'menuSlideIn 200ms ease-out'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* User Info Header */}
            <div style={{ padding: '20px 16px', borderBottom: '1px solid #F3F4F6' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div style={{ fontSize: '16px', fontWeight: 600, color: '#0A0A0A' }}>
                  {user.name}
                </div>
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    style={{
                      width: '24px',
                      height: '24px',
                      border: '1px solid #E5E7EB',
                      borderRadius: '6px',
                      background: 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: '#6B7280',
                      transition: 'all 150ms ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#F9FAFB';
                      e.currentTarget.style.color = '#0A0A0A';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#6B7280';
                    }}
                  >
                    <ChevronLeft style={{ width: '14px', height: '14px' }} />
                  </button>
                  <button
                    style={{
                      width: '24px',
                      height: '24px',
                      border: '1px solid #E5E7EB',
                      borderRadius: '6px',
                      background: 'transparent',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                      color: '#6B7280',
                      transition: 'all 150ms ease'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = '#F9FAFB';
                      e.currentTarget.style.color = '#0A0A0A';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'transparent';
                      e.currentTarget.style.color = '#6B7280';
                    }}
                  >
                    <ChevronRight style={{ width: '14px', height: '14px' }} />
                  </button>
                </div>
              </div>
              <div style={{ fontSize: '13px', color: '#6B7280', marginBottom: '8px' }}>
                {user.email}
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '4px 10px', background: '#ECFDF5', borderRadius: '12px' }}>
                <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: user.statusColor }}></div>
                <span style={{ fontSize: '12px', fontWeight: 500, color: '#059669' }}>{user.status}</span>
              </div>
            </div>

            {/* Menu Items */}
            <div style={{ padding: '8px' }}>
              {menuItems.map((item, index) => (
                <button
                  key={index}
                  style={{
                    width: '100%',
                    height: '44px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontWeight: 400,
                    color: item.color,
                    borderRadius: '8px',
                    transition: 'background 150ms ease'
                  }}
                  onMouseEnter={(e) => {
                    if (item.label === 'Log Out') {
                      e.currentTarget.style.background = '#FEF2F2';
                    } else {
                      e.currentTarget.style.background = '#F9FAFB';
                    }
                  }}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <div style={{ color: item.color }}>
                    {item.icon}
                  </div>
                  {item.label}
                </button>
              ))}
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

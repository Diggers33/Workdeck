import React, { useState } from 'react';
import { ChevronLeft, Plus, Search, Filter, Upload, Users as UsersIcon, MoreVertical, Edit2, Trash2, Copy, CheckCircle2, XCircle, X, Info } from 'lucide-react';
import { UserEditForm } from './UserEditForm';

interface UsersSettingsProps {
  onBack: () => void;
}

interface UserFormData {
  id?: number;
  name: string;
  surname: string;
  email: string;
  office: string;
  timetable: string;
  department: string;
  staffCategory: string;
  role: string;
  costPerHour: number;
  manager: string;
  availableHolidays: number;
  accessToFinancials: boolean;
  permissions: string[];
}

export function UsersSettings({ onBack }: UsersSettingsProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<number | null>(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserFormData | null>(null);
  const [showPermissionsDropdown, setShowPermissionsDropdown] = useState(false);
  
  const [users, setUsers] = useState([
    {
      id: 1,
      name: 'Sarah Johnson',
      email: 'sarah.johnson@acme.com',
      office: 'London HQ',
      department: 'Design',
      position: 'Senior Designer',
      manager: 'Emma Wilson',
      roles: ['Project Admin', 'Timesheet Manager'],
      costPerHour: 85,
      active: true,
      avatar: null
    },
    {
      id: 2,
      name: 'Michael Chen',
      email: 'michael.chen@acme.com',
      office: 'London HQ',
      department: 'Development',
      position: 'Developer',
      manager: 'David Brown',
      roles: ['Project Admin'],
      costPerHour: 75,
      active: true,
      avatar: null
    },
    {
      id: 3,
      name: 'Emma Wilson',
      email: 'emma.wilson@acme.com',
      office: 'London HQ',
      department: 'Design',
      position: 'Design Director',
      manager: null,
      roles: ['Administrator', 'Project Admin', 'HR Manager'],
      costPerHour: 120,
      active: true,
      avatar: null
    },
    {
      id: 4,
      name: 'James Rodriguez',
      email: 'james.rodriguez@acme.com',
      office: 'New York Office',
      department: 'Marketing',
      position: 'Marketing Manager',
      manager: 'Emma Wilson',
      roles: [],
      costPerHour: 90,
      active: false,
      avatar: null
    }
  ]);

  const filteredUsers = users.filter(user =>
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.department.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const avatarColors = ['#0066FF', '#34D399', '#F472B6', '#FBBF24', '#60A5FA', '#A78BFA'];

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      {/* Header */}
      <div className="bg-white border-b border-[#E5E7EB] sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button onClick={onBack} className="p-2 hover:bg-[#F3F4F6] rounded-lg transition-colors">
                <ChevronLeft className="w-5 h-5 text-[#6B7280]" />
              </button>
              <div>
                <h1 className="text-[20px] font-medium text-[#1F2937]">Users</h1>
                <p className="text-[13px] text-[#6B7280]">Team member management and roles</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="px-3 py-2 border border-[#D1D5DB] hover:bg-[#F9FAFB] text-[#374151] rounded-lg text-[13px] font-medium transition-colors flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Import CSV
              </button>
              <button 
                onClick={() => {
                  setEditingUser(null);
                  setShowUserForm(true);
                }}
                className="px-4 py-2 bg-[#0066FF] hover:bg-[#0052CC] text-white rounded-lg text-[14px] font-medium transition-colors flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add User
              </button>
            </div>
          </div>

          {/* Search and filters */}
          <div className="flex items-center gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search users..."
                className="w-full pl-10 pr-4 py-2 border border-[#D1D5DB] rounded-lg text-[14px] focus:outline-none focus:ring-2 focus:ring-[#0066FF] focus:border-transparent"
              />
            </div>
            <button className="px-3 py-2 border border-[#D1D5DB] hover:bg-[#F9FAFB] text-[#374151] rounded-lg text-[13px] font-medium transition-colors flex items-center gap-2">
              <Filter className="w-4 h-4" />
              Filters
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-8 py-6 pb-24">
        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
            <p className="text-[11px] font-medium text-[#9CA3AF] mb-1">Total Users</p>
            <p className="text-[24px] font-medium text-[#1F2937]">{users.length}</p>
          </div>
          <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
            <p className="text-[11px] font-medium text-[#9CA3AF] mb-1">Active</p>
            <p className="text-[24px] font-medium text-[#34D399]">{users.filter(u => u.active).length}</p>
          </div>
          <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
            <p className="text-[11px] font-medium text-[#9CA3AF] mb-1">Inactive</p>
            <p className="text-[24px] font-medium text-[#F87171]">{users.filter(u => !u.active).length}</p>
          </div>
          <div className="bg-white rounded-lg border border-[#E5E7EB] p-4">
            <p className="text-[11px] font-medium text-[#9CA3AF] mb-1">Admins</p>
            <p className="text-[24px] font-medium text-[#0066FF]">{users.filter(u => u.roles.includes('Administrator')).length}</p>
          </div>
        </div>

        {/* Users table */}
        <div className="bg-white rounded-lg border border-[#E5E7EB] overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
              <tr>
                <th className="px-6 py-3 text-left text-[12px] font-medium text-[#6B7280]">User</th>
                <th className="px-6 py-3 text-left text-[12px] font-medium text-[#6B7280]">Office</th>
                <th className="px-6 py-3 text-left text-[12px] font-medium text-[#6B7280]">Department</th>
                <th className="px-6 py-3 text-left text-[12px] font-medium text-[#6B7280]">Position</th>
                <th className="px-6 py-3 text-left text-[12px] font-medium text-[#6B7280]">Roles</th>
                <th className="px-6 py-3 text-left text-[12px] font-medium text-[#6B7280]">Status</th>
                <th className="px-6 py-3 text-right text-[12px] font-medium text-[#6B7280]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {filteredUsers.map((user, index) => (
                <tr 
                  key={user.id} 
                  className="hover:bg-[#F9FAFB] transition-colors cursor-pointer"
                  onClick={() => setSelectedUser(user.id)}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-medium flex-shrink-0"
                        style={{ backgroundColor: avatarColors[index % avatarColors.length] }}
                      >
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="text-[13px] font-medium text-[#1F2937]">{user.name}</p>
                        <p className="text-[11px] text-[#9CA3AF]">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[13px] text-[#6B7280]">{user.office}</td>
                  <td className="px-6 py-4 text-[13px] text-[#6B7280]">{user.department}</td>
                  <td className="px-6 py-4 text-[13px] text-[#6B7280]">{user.position}</td>
                  <td className="px-6 py-4">
                    {user.roles.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {user.roles.slice(0, 2).map((role, i) => (
                          <span key={i} className="text-[10px] font-medium px-2 py-0.5 bg-[#F0F4FF] text-[#0066FF] rounded">
                            {role}
                          </span>
                        ))}
                        {user.roles.length > 2 && (
                          <span className="text-[10px] font-medium px-2 py-0.5 bg-[#F3F4F6] text-[#6B7280] rounded">
                            +{user.roles.length - 2}
                          </span>
                        )}
                      </div>
                    ) : (
                      <span className="text-[12px] text-[#D1D5DB]">No roles</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {user.active ? (
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-[#34D399]" />
                        <span className="text-[12px] text-[#34D399] font-medium">Active</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5">
                        <XCircle className="w-3.5 h-3.5 text-[#F87171]" />
                        <span className="text-[12px] text-[#F87171] font-medium">Inactive</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        className="p-2 hover:bg-[#F3F4F6] rounded-lg transition-colors"
                        onClick={(e) => { 
                          e.stopPropagation(); 
                          setEditingUser(user as any);
                          setShowUserForm(true);
                        }}
                      >
                        <Edit2 className="w-4 h-4 text-[#6B7280]" />
                      </button>
                      <button 
                        className="p-2 hover:bg-[#F3F4F6] rounded-lg transition-colors"
                        onClick={(e) => { e.stopPropagation(); }}
                      >
                        <MoreVertical className="w-4 h-4 text-[#6B7280]" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="bg-white rounded-lg border border-[#E5E7EB] p-12 text-center">
            <UsersIcon className="w-12 h-12 text-[#D1D5DB] mx-auto mb-3" />
            <p className="text-[13px] text-[#6B7280]">No users found matching your search</p>
          </div>
        )}
      </div>

      {/* User Edit/Create Form */}
      <UserEditForm
        isOpen={showUserForm}
        user={editingUser}
        onClose={() => {
          setShowUserForm(false);
          setEditingUser(null);
        }}
        onSave={(userData) => {
          console.log('Saving user:', userData);
          // Handle save logic here
        }}
      />
    </div>
  );
}
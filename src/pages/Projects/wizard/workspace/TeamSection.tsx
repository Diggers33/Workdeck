import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Search, Plus, UserX, Mail, Clock } from 'lucide-react';
import { Badge } from '../ui/badge';

const getInitials = (name: string) => {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
};

const getAvatarColor = (index: number) => {
  const colors = [
    'bg-blue-100 text-blue-700',
    'bg-purple-100 text-purple-700',
    'bg-green-100 text-green-700',
    'bg-orange-100 text-orange-700',
    'bg-pink-100 text-pink-700',
    'bg-teal-100 text-teal-700',
  ];
  return colors[index % colors.length];
};

interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  status: 'online' | 'offline';
  allocatedHours: number;
}

export function TeamSection() {
  const [searchQuery, setSearchQuery] = useState('');
  const [members, setMembers] = useState<TeamMember[]>([
    {
      id: '1',
      name: 'Sarah Chen',
      role: 'Project Manager',
      email: 'sarah.chen@workdeck.io',
      status: 'online',
      allocatedHours: 120,
    },
    {
      id: '2',
      name: 'Michael Rodriguez',
      role: 'Lead Developer',
      email: 'michael.rodriguez@workdeck.io',
      status: 'online',
      allocatedHours: 160,
    },
    {
      id: '3',
      name: 'Emily Watson',
      role: 'UX Designer',
      email: 'emily.watson@workdeck.io',
      status: 'offline',
      allocatedHours: 80,
    },
    {
      id: '4',
      name: 'David Kim',
      role: 'Developer',
      email: 'david.kim@workdeck.io',
      status: 'online',
      allocatedHours: 140,
    },
    {
      id: '5',
      name: 'Jessica Martinez',
      role: 'QA Engineer',
      email: 'jessica.martinez@workdeck.io',
      status: 'offline',
      allocatedHours: 100,
    },
    {
      id: '6',
      name: 'James Thompson',
      role: 'Business Analyst',
      email: 'james.thompson@workdeck.io',
      status: 'online',
      allocatedHours: 90,
    },
  ]);

  const filteredMembers = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const removeMember = (id: string) => {
    setMembers(members.filter((m) => m.id !== id));
  };

  return (
    <div className="bg-white rounded-lg border border-[#E3E6EB] shadow-sm">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[#E3E6EB]">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-slate-900">Team & Roles</h2>
            <p className="text-sm text-slate-500 mt-1">Manage project team members and their roles</p>
          </div>
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2 stroke-[1.5]" />
            Add Team Member
          </Button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 stroke-[1.5]" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search team members..."
            className="pl-9 bg-[#FAFAFC] border-[#E3E6EB]"
          />
        </div>
      </div>

      {/* Team Members List */}
      <div className="p-6">
        <div className="space-y-3">
          {filteredMembers.map((member, idx) => (
            <div
              key={member.id}
              className="flex items-center gap-4 p-4 rounded-lg border border-[#E3E6EB] hover:border-slate-300 hover:shadow-sm transition-all"
            >
              {/* Avatar */}
              <div className="relative">
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center text-sm ${getAvatarColor(idx)}`}
                >
                  {getInitials(member.name)}
                </div>
                {member.status === 'online' && (
                  <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm text-slate-900">{member.name}</p>
                  <Badge
                    variant="outline"
                    className="text-xs border-slate-200 text-slate-600"
                  >
                    {member.role}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <div className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 stroke-[1.5]" />
                    {member.email}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 stroke-[1.5]" />
                    {member.allocatedHours}h allocated
                  </div>
                </div>
              </div>

              {/* Status & Actions */}
              <div className="flex items-center gap-3">
                <Badge
                  className={
                    member.status === 'online'
                      ? 'bg-green-100 text-green-700 hover:bg-green-100 border-0'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-100 border-0'
                  }
                >
                  {member.status}
                </Badge>
                <button
                  onClick={() => removeMember(member.id)}
                  className="text-slate-400 hover:text-red-600 transition-colors"
                  title="Remove from project"
                >
                  <UserX className="w-4 h-4 stroke-[1.5]" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {filteredMembers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-slate-500">No team members found</p>
          </div>
        )}
      </div>
    </div>
  );
}

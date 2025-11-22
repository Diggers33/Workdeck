import React from 'react';
import { MapPin, Building2, Laptop, Home } from 'lucide-react';

export function WhosWhereWidget() {
  const teamMembers = [
    { name: 'Marina Pellegrino', location: 'Office', dept: 'SALES', date: 'Nov 22', status: 'Office', statusColor: '#10B981', avatar: 'MP' },
    { name: 'Tom Brady', location: 'Remote', dept: 'Client call', date: 'Nov 22', status: 'Remote', statusColor: '#3B82F6', avatar: 'TB' },
    { name: 'Anna Smith', location: 'Office', dept: 'Engineering', date: 'Nov 22', status: 'Office', statusColor: '#10B981', avatar: 'AS' },
    { name: 'David Chen', location: 'Remote', dept: 'Design review', date: 'Nov 22', status: 'Remote', statusColor: '#3B82F6', avatar: 'DC' },
    { name: 'Sarah Lee', location: 'WFH', dept: 'Marketing', date: 'Nov 23', status: 'WFH', statusColor: '#8B5CF6', avatar: 'SL' },
    { name: 'Mike Ross', location: 'Office', dept: 'Legal', date: 'Nov 23', status: 'Office', statusColor: '#10B981', avatar: 'MR' }
  ];

  return (
    <div 
      className="bg-white rounded-lg relative overflow-hidden" 
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)', height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      {/* Colored top accent */}
      <div className="absolute left-0 right-0 top-0 h-1" style={{ background: 'linear-gradient(90deg, #5EEAD4 0%, #99F6E4 100%)' }}></div>
      
      {/* Header */}
      <div className="px-3 py-2 border-b border-[#E5E7EB] flex items-center justify-between" style={{ minHeight: '36px' }}>
        <div className="flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-[#5EEAD4]" />
          <h3 className="text-[14px] font-medium text-[#1F2937]">Who's where</h3>
        </div>
        <button className="bg-[#60A5FA] hover:bg-[#3B82F6] text-white px-2 py-1 rounded text-[11px] font-medium transition-all">
          Add +
        </button>
      </div>

      {/* Team list */}
      <div className="px-3 py-1.5 custom-scrollbar" style={{ flex: 1, overflowY: 'auto' }}>
        <div className="space-y-0.5">
          {teamMembers.map((person, idx) => (
            <div 
              key={idx} 
              className="flex items-center gap-2 p-1.5 rounded cursor-pointer hover:bg-[#F9FAFB] transition-all"
            >
              <div className="w-7 h-7 rounded-full flex items-center justify-center text-white text-[10px] font-medium flex-shrink-0" style={{ backgroundColor: person.statusColor }}>
                {person.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] font-medium text-[#1F2937] truncate leading-tight">{person.name}</p>
                <p className="text-[10px] text-[#9CA3AF] truncate leading-tight">{person.dept} • {person.date}</p>
              </div>
              <div className="flex-shrink-0 text-white text-[10px] font-medium px-1.5 py-0.5 rounded-full" style={{ backgroundColor: person.statusColor }}>
                {person.status}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-3 py-1.5 border-t border-[#E5E7EB] flex items-center gap-3" style={{ minHeight: '30px' }}>
        <div className="flex items-center gap-1">
          <Building2 className="w-3 h-3 text-[#10B981]" />
          <span className="text-[10px] text-[#6B7280]">Office</span>
        </div>
        <div className="flex items-center gap-1">
          <Laptop className="w-3 h-3 text-[#3B82F6]" />
          <span className="text-[10px] text-[#6B7280]">Remote</span>
        </div>
        <div className="flex items-center gap-1">
          <Home className="w-3 h-3 text-[#8B5CF6]" />
          <span className="text-[10px] text-[#6B7280]">WFH</span>
        </div>
      </div>
    </div>
  );
}
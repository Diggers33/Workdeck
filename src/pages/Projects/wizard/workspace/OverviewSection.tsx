import { Button } from '../ui/button';
import { Edit2, ChevronRight } from 'lucide-react';

const getInitials = (name: string) => {
  return name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);
};

interface OverviewSectionProps {
  onNavigate: (section: 'activities' | 'team') => void;
}

export function OverviewSection({ onNavigate }: OverviewSectionProps) {
  const activities = [
    { name: 'Planning Phase', tasks: 3, estimated: 40, allocated: 40, progress: 100, color: '#3B82F6' },
    { name: 'Design & Development', tasks: 5, estimated: 120, allocated: 100, progress: 83, color: '#8B5CF6' },
    { name: 'Testing & QA', tasks: 4, estimated: 60, allocated: 40, progress: 67, color: '#F59E0B' },
    { name: 'Deployment', tasks: 2, estimated: 20, allocated: 0, progress: 0, color: '#10B981' },
  ];

  const teamMembers = [
    { name: 'Sarah Chen', role: 'Project Manager', email: 'sarah.chen@acme.com', hours: 40, color: '#3B82F6' },
    { name: 'Michael Rodriguez', role: 'Lead Developer', email: 'm.rodriguez@acme.com', hours: 80, color: '#8B5CF6' },
    { name: 'Emily Watson', role: 'UX Designer', email: 'e.watson@acme.com', hours: 60, color: '#10B981' },
    { name: 'David Kim', role: 'QA Engineer', email: 'd.kim@acme.com', hours: 40, color: '#F59E0B' },
  ];

  return (
    <div className="space-y-6">
      {/* Project Essentials Card */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-[18px] font-semibold text-[#111827]">Project Essentials</h2>
          <button className="flex items-center gap-2 text-[14px] text-[#2563EB] hover:text-[#1D4ED8] transition-colors">
            <Edit2 className="w-4 h-4" />
            Edit
          </button>
        </div>

        {/* Two Column Grid */}
        <div className="grid grid-cols-2 gap-8">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <p className="text-[12px] text-[#6B7280] mb-1">Project Name</p>
              <p className="text-[14px] text-[#111827]">Digital Transformation Initiative</p>
            </div>
            <div>
              <p className="text-[12px] text-[#6B7280] mb-1">Project Type</p>
              <p className="text-[14px] text-[#111827]">Fixed Price</p>
            </div>
            <div>
              <p className="text-[12px] text-[#6B7280] mb-1">Start Date</p>
              <p className="text-[14px] text-[#111827]">01 Jan 2024</p>
            </div>
            <div>
              <p className="text-[12px] text-[#6B7280] mb-1">Cost Centre</p>
              <p className="text-[14px] text-[#111827]">CC-2024-IT</p>
            </div>
            <div>
              <p className="text-[12px] text-[#6B7280] mb-1">Contract Value</p>
              <p className="text-[14px] font-semibold text-[#059669]">€85,000</p>
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div>
              <p className="text-[12px] text-[#6B7280] mb-1">Client</p>
              <p className="text-[14px] text-[#111827]">Acme Corporation</p>
            </div>
            <div>
              <p className="text-[12px] text-[#6B7280] mb-1">Funding Type</p>
              <p className="text-[14px] text-[#111827]">Internal Budget</p>
            </div>
            <div>
              <p className="text-[12px] text-[#6B7280] mb-1">End Date</p>
              <p className="text-[14px] text-[#111827]">31 Dec 2024</p>
            </div>
            <div>
              <p className="text-[12px] text-[#6B7280] mb-1">Contracted Hours</p>
              <p className="text-[14px] text-[#111827]">500 hours</p>
            </div>
            <div>
              <p className="text-[12px] text-[#6B7280] mb-1">Workflow Template</p>
              <p className="text-[14px] text-[#111827]">Standard Agile</p>
            </div>
          </div>
        </div>

        {/* Bottom Row - Full Width */}
        <div className="grid grid-cols-2 gap-8 mt-4 pt-4 border-t border-[#F3F4F6]">
          <div className="flex items-center justify-between">
            <p className="text-[12px] text-[#6B7280]">Billable</p>
            <span className="bg-[#D1FAE5] text-[#065F46] px-3 py-1 rounded-md text-[13px] font-medium">
              Yes
            </span>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-[12px] text-[#6B7280]">Timesheet Required</p>
            <span className="bg-[#DBEAFE] text-[#1E40AF] px-3 py-1 rounded-md text-[13px] font-medium">
              Yes
            </span>
          </div>
        </div>
      </div>

      {/* Activity Overview Card */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[18px] font-semibold text-[#111827]">Activity Overview</h2>
          <button
            onClick={() => onNavigate('activities')}
            className="flex items-center gap-1 text-[14px] text-[#2563EB] hover:text-[#1D4ED8] hover:underline transition-colors"
          >
            View All
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Table */}
        <div className="mt-4">
          {/* Header Row */}
          <div className="bg-[#F9FAFB] rounded-lg px-4 py-3 grid grid-cols-12 gap-4 mb-2">
            <div className="col-span-4 text-[12px] font-medium text-[#6B7280]">Activity</div>
            <div className="col-span-1 text-[12px] font-medium text-[#6B7280]">Tasks</div>
            <div className="col-span-2 text-[12px] font-medium text-[#6B7280]">Estimated Hours</div>
            <div className="col-span-2 text-[12px] font-medium text-[#6B7280]">Allocated Hours</div>
            <div className="col-span-3 text-[12px] font-medium text-[#6B7280]">Progress</div>
          </div>

          {/* Data Rows */}
          <div className="space-y-0">
            {activities.map((activity, idx) => (
              <div
                key={idx}
                onClick={() => onNavigate('activities')}
                className="px-4 py-3 grid grid-cols-12 gap-4 items-center border-b border-[#F3F4F6] hover:bg-[#F9FAFB] cursor-pointer transition-colors"
                style={{ height: '56px' }}
              >
                {/* Activity Name with Color Dot */}
                <div className="col-span-4 flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: activity.color }}
                  ></div>
                  <span className="text-[14px] text-[#111827]">{activity.name}</span>
                </div>

                {/* Tasks */}
                <div className="col-span-1 text-[14px] text-[#6B7280]">{activity.tasks}</div>

                {/* Estimated Hours */}
                <div className="col-span-2 text-[14px] text-[#6B7280]">{activity.estimated}h</div>

                {/* Allocated Hours */}
                <div className="col-span-2 text-[14px] text-[#6B7280]">{activity.allocated}h</div>

                {/* Progress */}
                <div className="col-span-3 flex items-center gap-3">
                  <div className="flex-1 h-2 bg-[#F3F4F6] rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{
                        width: `${activity.progress}%`,
                        backgroundColor: activity.progress === 0 ? '#E5E7EB' : '#2563EB',
                      }}
                    ></div>
                  </div>
                  <span className="text-[13px] text-[#6B7280] w-10 text-right">{activity.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Team Overview Card */}
      <div className="bg-white border border-[#E5E7EB] rounded-xl p-6 shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[18px] font-semibold text-[#111827]">Team Overview</h2>
          <button
            onClick={() => onNavigate('team')}
            className="border border-[#2563EB] text-[#2563EB] hover:bg-[#EEF2FF] px-4 py-2 rounded-md text-[14px] font-medium transition-colors"
          >
            Manage Team
          </button>
        </div>

        {/* Team Grid - 4 Columns */}
        <div className="grid grid-cols-4 gap-4">
          {teamMembers.map((member, idx) => (
            <div
              key={idx}
              className="border border-[#E5E7EB] rounded-lg p-4 text-center hover:shadow-lg transition-shadow"
            >
              {/* Avatar */}
              <div
                className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-[18px] font-semibold text-white mb-3"
                style={{ backgroundColor: member.color }}
              >
                {getInitials(member.name)}
              </div>

              {/* Name */}
              <p className="text-[14px] font-semibold text-[#111827] mb-1">{member.name}</p>

              {/* Role Badge */}
              <div className="bg-[#F3F4F6] px-2 py-1 rounded inline-block mb-2">
                <span className="text-[12px] text-[#6B7280]">{member.role}</span>
              </div>

              {/* Email */}
              <p className="text-[12px] text-[#6B7280] mb-2 truncate" title={member.email}>
                {member.email}
              </p>

              {/* Allocated Hours */}
              <p className="text-[13px] text-[#111827]">{member.hours}h allocated</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

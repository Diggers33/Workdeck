import React, { useState } from 'react';
import { Search, Plus, MoreHorizontal, CheckCircle, ChevronDown, List, AlignJustify, Menu, BarChart3, Trello, DollarSign } from 'lucide-react';

export function ProjectPortfolio() {
  const [statsExpanded, setStatsExpanded] = useState(false);
  const [projectView, setProjectView] = useState<'comfortable' | 'compact' | 'list'>('comfortable');
  const [hoveredTableRow, setHoveredTableRow] = useState<number | null>(null);
  const [openActionMenu, setOpenActionMenu] = useState<number | null>(null);
  const [hoveredRisk, setHoveredRisk] = useState<number | null>(null);
  const [hoveredTeam, setHoveredTeam] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // All at-risk projects
  const atRiskProjects = [
    { name: 'SUSALGAEFUEL', health: 'Critical', healthColor: '#EF4444', flags: 12, issues: ['Budget exceeded €12,039', 'Timeline delayed 8 weeks', '4 overdue milestones'] },
    { name: 'MOBILE APP REDESIGN', health: 'Critical', healthColor: '#EF4444', flags: 8, issues: ['Timeline delayed 6 weeks', '5 tasks blocked', '3 resources needed'] },
    { name: 'Q4 MARKETING CAMPAIGN', health: 'At Risk', healthColor: '#F59E0B', flags: 6, issues: ['Budget warning €8,420 over', '3 pending approvals', '2 milestones at risk'] },
    { name: 'WEBSITE REFRESH', health: 'At Risk', healthColor: '#F59E0B', flags: 5, issues: ['Tasks blocked', 'Quality issues'] },
    { name: 'CLIENT PORTAL V2', health: 'At Risk', healthColor: '#F59E0B', flags: 4, issues: ['Resource constraints', 'Scope creep'] },
    { name: 'DATA MIGRATION', health: 'At Risk', healthColor: '#F59E0B', flags: 3, issues: ['Technical debt', 'Dependencies'] },
    { name: 'BIO-UPTAKE', health: 'At Risk', healthColor: '#F59E0B', flags: 3, issues: ['Budget risk', 'Timeline tight'] },
    { name: 'Agro2Circular', health: 'At Risk', healthColor: '#F59E0B', flags: 2, issues: ['Milestone delay', 'Staffing'] }
  ];

  const visibleCards = atRiskProjects.slice(0, 3);
  const overflowProjects = atRiskProjects.slice(3);

  return (
    <div className="space-y-6">
      {/* TIER 1: ATTENTION REQUIRED PANEL */}
      <div 
        className="rounded-xl p-6 relative transition-all hover:shadow-lg"
        style={{ 
          background: 'linear-gradient(180deg, #FEF2F2 0%, #FFFFFF 100%)',
          border: '1px solid #FCA5A5',
          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.08)'
        }}
      >
        {/* Header */}
        <div className="flex items-center gap-2 mb-4">
          <span className="text-2xl">⚠️</span>
          <h2 className="text-lg font-bold" style={{ color: '#991B1B' }}>Attention Required</h2>
          <span className="text-xs px-2 py-1 rounded-full" style={{ backgroundColor: '#FEF3C7', color: '#7C2D12' }}>8 projects</span>
        </div>

        {/* Project Cards Grid */}
        <div className="grid grid-cols-3 gap-4">
          {visibleCards.map((project, idx) => (
            <div 
              key={idx}
              className="bg-white rounded-lg p-4 cursor-pointer transition-all hover:scale-101"
              style={{ 
                border: `2px solid ${project.healthColor}`,
                boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                height: '108px'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: project.healthColor }}></div>
                  <span className="text-xs font-bold" style={{ color: project.healthColor }}>{project.health}</span>
                </div>
                <div className="flex items-center gap-1">
                  <span className="text-base">🚩</span>
                  <span className="text-base font-bold" style={{ color: '#991B1B' }}>{project.flags}</span>
                  <span className="text-xs text-[#6B7280]">active</span>
                </div>
              </div>
              <h3 className="text-sm font-bold text-[#1F2937] mb-1 truncate">{project.name}</h3>
              <div className="text-xs text-[#4B5563] space-y-0.5">
                {project.issues.slice(0, 2).map((issue, i) => (
                  <p key={i} className="truncate">• {issue}</p>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Compact List of Overflow Projects */}
        {overflowProjects.length > 0 && (
          <div className="mt-4">
            <div className="pt-3 mb-3">
              <p className="text-xs uppercase font-bold text-[#6B7280]" style={{ letterSpacing: '0.05em' }}>
                OTHER PROJECTS AT RISK ({overflowProjects.length})
              </p>
            </div>
            <div className="space-y-0">
              {overflowProjects.slice(0, 5).map((project, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between py-2 px-1 hover:bg-[#F9FAFB] cursor-pointer transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span style={{ fontSize: '6px', color: '#6B7280' }}>●</span>
                    <span className="text-sm text-[#1F2937]">{project.name}</span>
                  </div>
                  <span className="text-xs text-[#6B7280]">{project.flags} active risks</span>
                </div>
              ))}
            </div>
            
            {/* View All Link */}
            <div className="text-center mt-4">
              <button className="text-sm text-[#3B82F6] hover:text-[#2563EB] hover:underline transition-all">
                View all {atRiskProjects.length} at-risk projects →
              </button>
            </div>
          </div>
        )}
      </div>

      {/* TIER 2: PORTFOLIO STATS PANEL */}
      <div 
        className="rounded-xl border transition-all"
        style={{ 
          backgroundColor: '#EFF6FF',
          borderColor: '#BFDBFE',
          height: statsExpanded ? '200px' : '48px',
          overflow: 'hidden'
        }}
      >
        {/* Collapsed Header */}
        <div className="flex items-center justify-between px-4" style={{ height: '48px' }}>
          <div className="text-sm text-[#1F2937] flex items-center gap-2">
            {statsExpanded ? (
              <span className="font-medium">Portfolio Summary</span>
            ) : (
              <>
                <span className="font-medium">50 Projects:</span>
                <span className="font-bold" style={{ color: '#DC2626' }}>3 Critical</span>
                <span style={{ color: '#D1D5DB' }}>•</span>
                <span className="font-bold" style={{ color: '#F59E0B' }}>5 At Risk</span>
                <span style={{ color: '#D1D5DB' }}>•</span>
                <span className="font-bold" style={{ color: '#059669' }}>42 On Track</span>
                <span style={{ color: '#D1D5DB' }}>•</span>
                <span>€380K Margin</span>
              </>
            )}
          </div>
          <button 
            onClick={() => setStatsExpanded(!statsExpanded)}
            className="flex items-center gap-1 text-xs text-[#3B82F6] hover:text-[#2563EB]"
          >
            {statsExpanded ? 'Hide details' : 'Show details'}
            <ChevronDown className={`w-4 h-4 transition-transform ${statsExpanded ? 'rotate-180' : ''}`} />
          </button>
        </div>

        {/* Expanded Content */}
        {statsExpanded && (
          <div className="px-6 pb-6 grid grid-cols-4 gap-x-4 gap-y-5">
            {[
              { label: 'Total Contracted', value: '252,034 Hrs' },
              { label: 'Total Consumed', value: '299,990 Hrs' },
              { label: 'Total Contract Value', value: '€3,432,509' },
              { label: 'Total Personnel Cost', value: '€5,011,228' },
              { label: 'Total Scheduled', value: '125,447 Hrs' },
              { label: 'Pending Scheduling', value: '126,587 Hrs' },
              { label: 'Total Expenditure', value: '€1,592,731' },
              { label: 'Total Budget', value: '€6,603,959' }
            ].map((metric, idx) => (
              <div key={idx}>
                <p className="text-xs uppercase text-[#6B7280] mb-1" style={{ letterSpacing: '0.05em' }}>{metric.label}</p>
                <p className="text-xl font-bold text-[#1F2937]">{metric.value}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* TIER 3: ALL PROJECTS TABLE */}
      <div className="bg-white rounded-xl shadow-sm" style={{ boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
        {/* Table Header Bar */}
        <div className="bg-[#F9FAFB] border-b border-[#E5E7EB] px-6 py-4 rounded-t-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-[#1F2937]">All Projects</h3>
              <span className="text-sm text-[#6B7280]">(50)</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Search */}
              <div className="relative" style={{ width: '320px' }}>
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#9CA3AF]" />
                <input 
                  type="text"
                  placeholder="Search projects, clients, or tags..."
                  className="w-full h-9 pl-10 pr-3 bg-white border border-[#D1D5DB] rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#3B82F6] focus:border-[#3B82F6]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Filter */}
              <select className="h-9 px-3 bg-white border border-[#D1D5DB] rounded-md text-sm">
                <option>Filter: All</option>
                <option>Critical</option>
                <option>At Risk</option>
                <option>On Track</option>
              </select>

              {/* Sort */}
              <select className="h-9 px-3 bg-white border border-[#D1D5DB] rounded-md text-sm">
                <option>Sort: Health</option>
                <option>Name (A-Z)</option>
                <option>Active Risks</option>
                <option>End Date</option>
              </select>

              {/* View Toggle - REFINEMENT 1: DENSITY TOGGLE */}
              <div className="inline-flex items-center gap-1 p-0.5 bg-[#F3F4F6] rounded-lg" style={{ height: '36px' }}>
                <button 
                  onClick={() => setProjectView('comfortable')}
                  className={`w-8 h-8 flex items-center justify-center rounded transition-all ${
                    projectView === 'comfortable' ? 'bg-[#3B82F6] text-white shadow-sm' : 'text-[#6B7280] hover:bg-[#E5E7EB]'
                  }`}
                  title="Comfortable view (80px rows)"
                >
                  <AlignJustify className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setProjectView('compact')}
                  className={`w-8 h-8 flex items-center justify-center rounded transition-all ${
                    projectView === 'compact' ? 'bg-[#3B82F6] text-white shadow-sm' : 'text-[#6B7280] hover:bg-[#E5E7EB]'
                  }`}
                  title="Compact view (52px rows)"
                >
                  <Menu className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setProjectView('list')}
                  className={`w-8 h-8 flex items-center justify-center rounded transition-all ${
                    projectView === 'list' ? 'bg-[#3B82F6] text-white shadow-sm' : 'text-[#6B7280] hover:bg-[#E5E7EB]'
                  }`}
                  title="List view (40px rows)"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Add Project Button */}
              <button className="h-9 px-4 bg-[#3B82F6] hover:bg-[#2563EB] text-white text-sm rounded-md transition-all flex items-center gap-2">
                <Plus className="w-4 h-4" />
                Add project
              </button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-auto" style={{ maxHeight: '600px' }}>
          <table className="w-full">
            <thead className="sticky top-0 bg-[#F9FAFB] border-b-2 border-[#E5E7EB]">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase text-[#6B7280]" style={{ letterSpacing: '0.05em', width: '80px' }}>Health</th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase text-[#6B7280]" style={{ letterSpacing: '0.05em', width: '280px' }}>Project Name</th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase text-[#6B7280]" style={{ letterSpacing: '0.05em', width: '140px' }}>Active Risks</th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase text-[#6B7280]" style={{ letterSpacing: '0.05em', width: '180px' }}>Client</th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase text-[#6B7280]" style={{ letterSpacing: '0.05em', width: '200px' }}>Timeline</th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase text-[#6B7280]" style={{ letterSpacing: '0.05em', width: '140px' }}>Milestones</th>
                <th className="px-6 py-3 text-left text-xs font-bold uppercase text-[#6B7280]" style={{ letterSpacing: '0.05em', width: '100px' }}>Team</th>
                <th className="px-6 py-3 text-right text-xs font-bold uppercase text-[#6B7280]" style={{ letterSpacing: '0.05em', width: '72px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {[
                { health: 'Critical', healthColor: '#EF4444', name: 'SUSALGAEFUEL', code: 'PRJ-2024-089', flags: 12, flagIssues: ['Budget (5)', 'Milestones (4)', 'Resources (3)'], client: 'European Commission', timeline: '01/06/2019 - 01/05/2022', progress: 65, timeRemaining: '⚠️ 14 days overdue', milestones: '11 / 24', milestonesProgress: 46, nextMilestone: 'Q4 Review (Dec 15)', team: ['JD', 'AS', 'MK', 'LP', '+8'] },
                { health: 'Critical', healthColor: '#EF4444', name: 'MOBILE APP REDESIGN', code: 'PRJ-2024-102', flags: 8, flagIssues: ['Timeline (5)', 'Resources (3)'], client: 'TechCorp Inc', timeline: '15/01/2024 - 30/06/2024', progress: 42, timeRemaining: '847 days remaining', milestones: '5 / 12', milestonesProgress: 42, nextMilestone: 'Design Review (Nov 20)', team: ['TR', 'SK', 'DP', '+4'] },
                { health: 'At Risk', healthColor: '#F59E0B', name: 'Q4 MARKETING CAMPAIGN', code: 'PRJ-2024-115', flags: 6, flagIssues: ['Budget (4)', 'Approvals (2)'], client: 'Global Media', timeline: '01/10/2024 - 31/12/2024', progress: 55, timeRemaining: '42 days remaining', milestones: '8 / 15', milestonesProgress: 53, nextMilestone: 'Launch Prep (Nov 25)', team: ['EM', 'JW', 'AL'] },
                { health: 'At Risk', healthColor: '#F59E0B', name: 'WEBSITE REFRESH', code: 'PRJ-2024-098', flags: 5, flagIssues: ['Tasks (4)', 'Quality (1)'], client: 'StartupXYZ', timeline: '01/09/2024 - 30/11/2024', progress: 78, timeRemaining: '12 days remaining', milestones: '14 / 18', milestonesProgress: 78, nextMilestone: 'Final QA (Nov 28)', team: ['BC', 'NH', '+2'] },
                { health: 'On Track', healthColor: '#10B981', name: 'CLIENT PORTAL V2', code: 'PRJ-2024-087', flags: 0, flagIssues: [], client: 'Enterprise Solutions', timeline: '01/03/2024 - 31/08/2024', progress: 88, timeRemaining: '22 days remaining', milestones: '22 / 25', milestonesProgress: 88, nextMilestone: 'Beta Testing (Nov 30)', team: ['KT', 'RS', 'FG', 'WM'] },
                { health: 'On Track', healthColor: '#10B981', name: 'DATA MIGRATION', code: 'PRJ-2024-091', flags: 0, flagIssues: [], client: 'FinTech Corp', timeline: '15/02/2024 - 15/07/2024', progress: 92, timeRemaining: '5 days remaining', milestones: '18 / 20', milestonesProgress: 90, nextMilestone: 'Production Deploy (Nov 22)', team: ['DL', 'CP'] },
                { health: 'On Track', healthColor: '#10B981', name: 'API INTEGRATION', code: 'PRJ-2024-103', flags: 0, flagIssues: [], client: 'Cloud Services Ltd', timeline: '01/05/2024 - 31/10/2024', progress: 70, timeRemaining: '95 days remaining', milestones: '12 / 18', milestonesProgress: 67, nextMilestone: 'Phase 2 Kickoff (Dec 1)', team: ['MT', 'VK', 'BH', '+3'] },
                { health: 'On Track', healthColor: '#10B981', name: 'SECURITY AUDIT', code: 'PRJ-2024-108', flags: 0, flagIssues: [], client: 'SecureBank', timeline: '10/04/2024 - 10/09/2024', progress: 45, timeRemaining: '128 days remaining', milestones: '6 / 14', milestonesProgress: 43, nextMilestone: 'Penetration Test (Dec 5)', team: ['JR', 'TS', 'NK'] }
              ].map((project, idx) => {
                const rowHeight = projectView === 'comfortable' ? '80px' : projectView === 'compact' ? '50px' : '36px';
                
                return (
                  <tr 
                    key={idx}
                    className="border-b border-[#F3F4F6] hover:bg-[#F9FAFB] cursor-pointer transition-all"
                    style={{ 
                      height: rowHeight,
                      borderLeft: project.health === 'Critical' || project.health === 'At Risk' ? `4px solid ${project.healthColor}` : 'none'
                    }}
                    onMouseEnter={() => setHoveredTableRow(idx)}
                    onMouseLeave={() => setHoveredTableRow(null)}
                  >
                    {/* Health */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col items-start gap-1">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: project.healthColor }}></div>
                        {projectView === 'comfortable' && (
                          <span className="text-xs font-bold" style={{ color: project.healthColor }}>{project.health}</span>
                        )}
                      </div>
                    </td>

                    {/* Project Name */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-0.5">
                        <p className="text-sm font-bold text-[#1F2937] hover:text-[#3B82F6] truncate">{project.name}</p>
                        {projectView === 'comfortable' && (
                          <>
                            <p className="text-xs text-[#6B7280]">{project.code}</p>
                            <div className="flex gap-1 mt-1">
                              <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#E0E7FF', color: '#1F2937' }}>EU Grant</span>
                            </div>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Active Risks */}
                    <td className="px-6 py-4">
                      {project.flags > 0 ? (
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-1">
                            <span className="text-base">🚩</span>
                            <span className="text-base font-bold" style={{ color: '#991B1B' }}>{project.flags}</span>
                            <span className="text-xs text-[#6B7280]">active</span>
                          </div>
                          {projectView === 'comfortable' && project.flagIssues.slice(0, 2).map((issue, i) => (
                            <p key={i} className="text-xs text-[#6B7280]">{issue}</p>
                          ))}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1 text-[#10B981]">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span className="text-xs">None</span>
                        </div>
                      )}
                    </td>

                    {/* Client */}
                    <td className="px-6 py-4">
                      <p className="text-sm text-[#1F2937] truncate">{project.client}</p>
                    </td>

                    {/* Timeline */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <p className="text-xs text-[#4B5563]">{project.timeline}</p>
                        {projectView === 'comfortable' && (
                          <>
                            <div className="w-full h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                              <div 
                                className="h-full rounded-full transition-all"
                                style={{ 
                                  width: `${project.progress}%`,
                                  backgroundColor: project.health === 'Critical' ? '#EF4444' : project.health === 'At Risk' ? '#F59E0B' : '#3B82F6'
                                }}
                              ></div>
                            </div>
                            <p className="text-xs" style={{ color: project.timeRemaining.includes('overdue') ? '#DC2626' : '#6B7280' }}>
                              {project.timeRemaining}
                            </p>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Milestones */}
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-1">
                        <p className="text-sm font-bold text-[#1F2937]">{project.milestones}</p>
                        {projectView === 'comfortable' && (
                          <>
                            <div className="w-full h-1.5 bg-[#E5E7EB] rounded-full overflow-hidden">
                              <div 
                                className="h-full bg-[#3B82F6] rounded-full"
                                style={{ width: `${project.milestonesProgress}%` }}
                              ></div>
                            </div>
                            <p className="text-xs text-[#6B7280] truncate">Next: {project.nextMilestone}</p>
                          </>
                        )}
                      </div>
                    </td>

                    {/* Team */}
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        {project.team.slice(0, 4).map((member, i) => (
                          <div 
                            key={i}
                            className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-xs border-2 border-white"
                            style={{ marginLeft: i > 0 ? '-8px' : '0' }}
                          >
                            {member}
                          </div>
                        ))}
                      </div>
                    </td>

                    {/* Actions - REFINEMENT 2: QUICK ACTIONS ON HOVER */}
                    <td className="px-6 py-4 text-right">
                      <div className="relative inline-block">
                        {hoveredTableRow === idx ? (
                          /* Show quick action buttons on hover */
                          <div className="flex items-center justify-end gap-1">
                            <button 
                              className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#E5E7EB] text-[#6B7280] hover:text-[#1F2937] transition-all"
                              title="View Gantt (⌘G)"
                              style={{ animation: 'fadeIn 0.15s ease-out' }}
                            >
                              <BarChart3 className="w-4 h-4" />
                            </button>
                            <button 
                              className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#E5E7EB] text-[#6B7280] hover:text-[#1F2937] transition-all"
                              title="View Board (⌘B)"
                              style={{ animation: 'fadeIn 0.15s ease-out 0.05s', animationFillMode: 'backwards' }}
                            >
                              <Trello className="w-4 h-4" />
                            </button>
                            <button 
                              className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#E5E7EB] text-[#6B7280] hover:text-[#1F2937] transition-all"
                              title="View Financial (⌘F)"
                              style={{ animation: 'fadeIn 0.15s ease-out 0.1s', animationFillMode: 'backwards' }}
                            >
                              <DollarSign className="w-4 h-4" />
                            </button>
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                setOpenActionMenu(openActionMenu === idx ? null : idx);
                              }}
                              className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#E5E7EB] text-[#6B7280] hover:text-[#1F2937] transition-all"
                              title="More actions"
                              style={{ animation: 'fadeIn 0.15s ease-out 0.15s', animationFillMode: 'backwards' }}
                            >
                              <MoreHorizontal className="w-5 h-5 rotate-90" />
                            </button>
                          </div>
                        ) : (
                          /* Default state - just show more button */
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenActionMenu(openActionMenu === idx ? null : idx);
                            }}
                            className="w-8 h-8 flex items-center justify-center rounded hover:bg-[#F3F4F6] text-[#6B7280] hover:text-[#1F2937] transition-all"
                          >
                            <MoreHorizontal className="w-5 h-5 rotate-90" />
                          </button>
                        )}
                        
                        {openActionMenu === idx && (
                          <div 
                            className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-lg border border-[#E5E7EB] py-2 z-50"
                            style={{ boxShadow: '0 10px 40px rgba(0,0,0,0.15)' }}
                          >
                            {[
                              { label: 'Edit project', icon: '✏️' },
                              { label: 'Duplicate project', icon: '📄' },
                              { label: 'Unpublish project', icon: '🔒' },
                              { divider: true },
                              { label: 'Delete project', icon: '🗑️', danger: true }
                            ].map((item, i) => 
                              item.divider ? (
                                <div key={i} className="h-px bg-[#E5E7EB] my-1"></div>
                              ) : (
                                <button
                                  key={i}
                                  className="w-full px-3 py-2 text-left text-sm hover:bg-[#F3F4F6] flex items-center gap-2 transition-colors"
                                  style={{ color: item.danger ? '#DC2626' : '#1F2937' }}
                                >
                                  <span>{item.icon}</span>
                                  <span>{item.label}</span>
                                </button>
                              )
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
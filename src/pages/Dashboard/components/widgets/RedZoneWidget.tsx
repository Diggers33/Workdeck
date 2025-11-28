import React from 'react';
import { ArrowRight, AlertTriangle } from 'lucide-react';
import { RedZoneData } from '../../api/dashboardApi';

interface RedZoneWidgetProps {
  data?: RedZoneData | null;
}

// Default mock data
const defaultRisks = [
  { id: '1', name: 'SUSALGAEFUEL', projectName: '', dueDate: '', daysOverdue: 8, assignee: '', riskScore: 94, color: '#EF4444', issues: '8 overdue • €12k over' },
  { id: '2', name: 'Mobile App Redesign', projectName: '', dueDate: '', daysOverdue: 6, assignee: '', riskScore: 87, color: '#F59E0B', issues: '6 weeks late • 5 blocked' },
  { id: '3', name: 'Q4 Marketing Campaign', projectName: '', dueDate: '', daysOverdue: 3, assignee: '', riskScore: 72, color: '#FBBF24', issues: 'Budget +€8.4k' },
  { id: '4', name: 'Platform Migration', projectName: '', dueDate: '', daysOverdue: 2, assignee: '', riskScore: 68, color: '#FBBF24', issues: '3 dependencies' },
  { id: '5', name: 'Client Portal v2', projectName: '', dueDate: '', daysOverdue: 1, assignee: '', riskScore: 65, color: '#FCD34D', issues: '2 resources short' }
];

// Get color based on days overdue
function getRiskColor(daysOverdue: number): string {
  if (daysOverdue >= 7) return '#EF4444';
  if (daysOverdue >= 3) return '#F59E0B';
  return '#FBBF24';
}

// Calculate risk score based on days overdue
function getRiskScore(daysOverdue: number): number {
  return Math.min(99, 50 + (daysOverdue * 5));
}

export function RedZoneWidget({ data }: RedZoneWidgetProps) {
  // Use API data if available, otherwise fall back to mock data
  const hasApiData = data && data.items && data.items.length > 0;

  const risks = hasApiData
    ? data.items.map(item => ({
        ...item,
        riskScore: getRiskScore(item.daysOverdue),
        color: getRiskColor(item.daysOverdue),
        issues: `${item.daysOverdue} days overdue`
      }))
    : defaultRisks;

  return (
    <div
      className="bg-white rounded-lg relative overflow-hidden"
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)', height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      {/* Colored top accent */}
      <div className="absolute left-0 right-0 top-0 h-1" style={{ background: 'linear-gradient(90deg, #F87171 0%, #FCA5A5 100%)' }}></div>

      {/* Header */}
      <div className="px-3 py-2 border-b border-[#E5E7EB] flex items-center justify-between" style={{ minHeight: '36px' }}>
        <div className="flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-[#F87171]" />
          <h3 className="text-[14px] font-medium text-[#F87171]">Red Zone</h3>
          {hasApiData && (
            <span className="text-[10px] text-[#10B981] font-medium">(Live)</span>
          )}
          <span className="w-4 h-4 rounded-full bg-[#F87171] text-white text-[10px] font-bold flex items-center justify-center">
            {risks.length}
          </span>
        </div>
        <button className="text-[11px] text-[#9CA3AF] hover:text-[#111827]">
          Settings
        </button>
      </div>

      {/* Compact risk list - ONE LINE PER PROJECT */}
      <div className="px-3 py-1.5 custom-scrollbar" style={{ flex: 1, overflowY: 'auto' }}>
        <div className="space-y-1">
          {risks.map((risk: any) => (
            <div
              key={risk.id}
              className="flex items-center gap-2 p-1.5 rounded-lg bg-[#FAFAFA] border border-[#F3F4F6] cursor-pointer hover:shadow-sm transition-all"
            >
              {/* Risk indicator dot */}
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: risk.color }}></div>

              {/* Project name + score */}
              <div className="flex-1 min-w-0 flex items-center gap-2">
                <p className="text-[12px] font-bold text-[#1F2937] truncate">{risk.name || risk.project}</p>
                <span
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded flex-shrink-0"
                  style={{
                    backgroundColor: `${risk.color}20`,
                    color: risk.color
                  }}
                >
                  {risk.riskScore}
                </span>
              </div>

              {/* Issues - compact inline */}
              <div className="flex-shrink-0 text-[10px] text-[#6B7280]">
                {risk.issues}
              </div>

              {/* Arrow */}
              <button className="flex-shrink-0 p-0.5 hover:bg-white rounded transition-colors">
                <ArrowRight className="w-3.5 h-3.5 text-[#9CA3AF]" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-3 py-1.5 border-t border-[#E5E7EB]" style={{ minHeight: '30px' }}>
        <button className="text-[11px] text-[#3B82F6] hover:text-[#2563EB]">
          All projects →
        </button>
      </div>
    </div>
  );
}

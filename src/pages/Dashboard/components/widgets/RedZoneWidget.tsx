import React from 'react';
import { ArrowRight, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { RedZoneData } from '../../api/dashboardApi';

interface RedZoneWidgetProps {
  data?: RedZoneData | null;
}

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
  // Determine data state:
  // - undefined/null = API not called yet or failed
  // - data.items === [] = API returned empty (valid - no projects in red zone - good!)
  // - data.items has items = show the items
  const isLoading = data === undefined || data === null;
  const isEmpty = data && Array.isArray(data.items) && data.items.length === 0;
  const hasItems = data && Array.isArray(data.items) && data.items.length > 0;

  // Transform items if we have data
  const risks = hasItems
    ? data.items.map(item => ({
        ...item,
        riskScore: getRiskScore(item.daysOverdue),
        color: getRiskColor(item.daysOverdue),
        issues: `${item.daysOverdue} days overdue`
      }))
    : [];

  return (
    <div
      className="bg-white rounded-lg relative overflow-hidden"
      style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.1)', height: '100%', display: 'flex', flexDirection: 'column' }}
    >
      {/* Colored top accent - green when empty (good), red when issues */}
      <div
        className="absolute left-0 right-0 top-0 h-1"
        style={{
          background: isEmpty
            ? 'linear-gradient(90deg, #34D399 0%, #6EE7B7 100%)'
            : 'linear-gradient(90deg, #F87171 0%, #FCA5A5 100%)'
        }}
      ></div>

      {/* Header */}
      <div className="px-3 py-2 border-b border-[#E5E7EB] flex items-center justify-between" style={{ minHeight: '36px' }}>
        <div className="flex items-center gap-1.5">
          {isEmpty ? (
            <CheckCircle2 className="w-4 h-4 text-[#10B981]" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-[#F87171]" />
          )}
          <h3 className={`text-[14px] font-medium ${isEmpty ? 'text-[#10B981]' : 'text-[#F87171]'}`}>
            Red Zone
          </h3>
          {hasItems && (
            <>
              <span className="text-[10px] text-[#10B981] font-medium">(Live)</span>
              <span className="w-4 h-4 rounded-full bg-[#F87171] text-white text-[10px] font-bold flex items-center justify-center">
                {risks.length}
              </span>
            </>
          )}
        </div>
        <button className="text-[11px] text-[#9CA3AF] hover:text-[#111827]">
          Settings
        </button>
      </div>

      {/* Content area */}
      <div className="px-3 py-1.5 custom-scrollbar" style={{ flex: 1, overflowY: 'auto' }}>
        {/* Loading state */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center h-full py-8 text-center">
            <div className="w-6 h-6 border-2 border-[#F87171] border-t-transparent rounded-full animate-spin mb-2"></div>
            <p className="text-[12px] text-[#9CA3AF]">Loading red zone...</p>
          </div>
        )}

        {/* Empty state - no projects in red zone (great news!) */}
        {isEmpty && (
          <div className="flex flex-col items-center justify-center h-full py-8 text-center">
            <div className="w-12 h-12 rounded-full bg-[#D1FAE5] flex items-center justify-center mb-3">
              <CheckCircle2 className="w-6 h-6 text-[#10B981]" />
            </div>
            <p className="text-[13px] font-medium text-[#374151] mb-1">All clear!</p>
            <p className="text-[11px] text-[#9CA3AF]">No projects in the red zone</p>
          </div>
        )}

        {/* Risk items list */}
        {hasItems && (
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
        )}
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

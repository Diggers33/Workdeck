import React, { useState } from 'react';
import { ChevronLeft, Plus, GitBranch, ChevronRight, ChevronDown } from 'lucide-react';

interface CostCentersSettingsProps {
  onBack: () => void;
}

export function CostCentersSettings({ onBack }: CostCentersSettingsProps) {
  const [expanded, setExpanded] = useState<number[]>([1, 2]);

  const costCenters = [
    { id: 1, code: '100', name: 'Design Department', level: 0, hasChildren: true, active: true },
    { id: 2, code: '100.1', name: 'UI/UX Team', level: 1, hasChildren: true, active: true, parent: 1 },
    { id: 3, code: '100.1.1', name: 'Mobile Design', level: 2, hasChildren: false, active: true, parent: 2 },
    { id: 4, code: '100.1.2', name: 'Web Design', level: 2, hasChildren: false, active: true, parent: 2 },
    { id: 5, code: '100.2', name: 'Brand Team', level: 1, hasChildren: false, active: true, parent: 1 },
    { id: 6, code: '200', name: 'Development Department', level: 0, hasChildren: true, active: true },
    { id: 7, code: '200.1', name: 'Frontend Team', level: 1, hasChildren: false, active: true, parent: 6 },
    { id: 8, code: '200.2', name: 'Backend Team', level: 1, hasChildren: false, active: true, parent: 6 }
  ];

  const toggleExpand = (id: number) => {
    setExpanded(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="bg-white border-b border-[#E5E7EB] sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={onBack} className="p-2 hover:bg-[#F3F4F6] rounded-lg transition-colors">
                <ChevronLeft className="w-5 h-5 text-[#6B7280]" />
              </button>
              <div>
                <h1 className="text-[20px] font-medium text-[#1F2937]">Cost Centers</h1>
                <p className="text-[13px] text-[#6B7280]">Hierarchical budget tracking structure</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-[#0066FF] hover:bg-[#0052CC] text-white rounded-lg text-[14px] font-medium transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Cost Center
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8 pb-24">
        <div className="bg-white rounded-lg border border-[#E5E7EB] overflow-hidden">
          <div className="divide-y divide-[#E5E7EB]">
            {costCenters.map((center) => {
              const isExpanded = expanded.includes(center.id);
              const showItem = center.level === 0 || (center.parent && expanded.includes(center.parent));
              
              if (!showItem) return null;

              return (
                <div
                  key={center.id}
                  className="hover:bg-[#F9FAFB] transition-colors"
                  style={{ paddingLeft: `${center.level * 32 + 24}px` }}
                >
                  <div className="flex items-center py-4 pr-6">
                    <div className="flex items-center gap-3 flex-1">
                      {center.hasChildren ? (
                        <button
                          onClick={() => toggleExpand(center.id)}
                          className="p-1 hover:bg-[#E5E7EB] rounded transition-colors"
                        >
                          {isExpanded ? (
                            <ChevronDown className="w-4 h-4 text-[#6B7280]" />
                          ) : (
                            <ChevronRight className="w-4 h-4 text-[#6B7280]" />
                          )}
                        </button>
                      ) : (
                        <div className="w-6" />
                      )}
                      <GitBranch className="w-4 h-4 text-[#0066FF]" />
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className="text-[13px] font-medium text-[#1F2937]">{center.name}</span>
                          <span className="text-[12px] font-mono text-[#6B7280]">{center.code}</span>
                          {center.active && (
                            <span className="text-[10px] px-2 py-0.5 rounded bg-[#D1FAE5] text-[#065F46] font-medium">
                              Active
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
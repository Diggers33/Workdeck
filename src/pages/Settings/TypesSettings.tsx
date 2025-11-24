import React, { useState } from 'react';
import { ChevronLeft, Plus, Tag } from 'lucide-react';

interface TypesSettingsProps {
  onBack: () => void;
}

export function TypesSettings({ onBack }: TypesSettingsProps) {
  const [activeTab, setActiveTab] = useState('cost');

  const tabs = [
    { id: 'cost', label: 'Cost Types', count: 8 },
    { id: 'leave', label: 'Leave Types', count: 5 },
    { id: 'project', label: 'Project Types', count: 4 },
    { id: 'funding', label: 'Funding Types', count: 3 }
  ];

  const costTypes = [
    { id: 1, name: 'Travel', code: 'TRV', requiresReceipt: true, active: true },
    { id: 2, name: 'Meals', code: 'MEAL', requiresReceipt: true, active: true },
    { id: 3, name: 'Software', code: 'SOFT', requiresReceipt: false, active: true },
    { id: 4, name: 'Equipment', code: 'EQUIP', requiresReceipt: true, active: true }
  ];

  return (
    <div className="min-h-screen bg-[#F9FAFB]">
      <div className="bg-white border-b border-[#E5E7EB] sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-8 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <button onClick={onBack} className="p-2 hover:bg-[#F3F4F6] rounded-lg transition-colors">
                <ChevronLeft className="w-5 h-5 text-[#6B7280]" />
              </button>
              <div>
                <h1 className="text-[20px] font-medium text-[#1F2937]">Types</h1>
                <p className="text-[13px] text-[#6B7280]">Classification systems and categories</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-[#0066FF] hover:bg-[#0052CC] text-white rounded-lg text-[14px] font-medium transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Type
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-[#E5E7EB]">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 text-[13px] font-medium transition-colors relative ${
                  activeTab === tab.id
                    ? 'text-[#0066FF]'
                    : 'text-[#6B7280] hover:text-[#1F2937]'
                }`}
              >
                {tab.label}
                <span className="ml-2 text-[11px] px-1.5 py-0.5 rounded bg-[#F3F4F6] text-[#6B7280]">
                  {tab.count}
                </span>
                {activeTab === tab.id && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#0066FF]" />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8 pb-24">
        <div className="bg-white rounded-lg border border-[#E5E7EB] overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
              <tr>
                <th className="px-6 py-3 text-left text-[12px] font-medium text-[#6B7280]">Name</th>
                <th className="px-6 py-3 text-left text-[12px] font-medium text-[#6B7280]">Code</th>
                <th className="px-6 py-3 text-left text-[12px] font-medium text-[#6B7280]">Receipt Required</th>
                <th className="px-6 py-3 text-left text-[12px] font-medium text-[#6B7280]">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {costTypes.map((type) => (
                <tr key={type.id} className="hover:bg-[#F9FAFB]">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Tag className="w-4 h-4 text-[#0066FF]" />
                      <span className="text-[13px] font-medium text-[#1F2937]">{type.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[13px] text-[#6B7280]">{type.code}</td>
                  <td className="px-6 py-4">
                    <span className={`text-[12px] font-medium ${type.requiresReceipt ? 'text-[#34D399]' : 'text-[#9CA3AF]'}`}>
                      {type.requiresReceipt ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-[12px] px-2 py-0.5 rounded font-medium ${
                      type.active ? 'bg-[#D1FAE5] text-[#065F46]' : 'bg-[#F3F4F6] text-[#6B7280]'
                    }`}>
                      {type.active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
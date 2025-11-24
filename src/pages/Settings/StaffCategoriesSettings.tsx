import React, { useState } from 'react';
import { ChevronLeft, Plus, Briefcase, Edit2, Trash2 } from 'lucide-react';

interface StaffCategoriesSettingsProps {
  onBack: () => void;
}

export function StaffCategoriesSettings({ onBack }: StaffCategoriesSettingsProps) {
  const [categories, setCategories] = useState([
    { id: 1, name: 'Senior Designer', code: 'SD', level: 5, rate: 85 },
    { id: 2, name: 'Designer', code: 'DES', level: 3, rate: 65 },
    { id: 3, name: 'Junior Designer', code: 'JD', level: 1, rate: 45 },
    { id: 4, name: 'Project Manager', code: 'PM', level: 4, rate: 95 },
    { id: 5, name: 'Developer', code: 'DEV', level: 3, rate: 75 }
  ]);

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
                <h1 className="text-[20px] font-medium text-[#1F2937]">Staff Categories</h1>
                <p className="text-[13px] text-[#6B7280]">Job position definitions with pay rates</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-[#0066FF] hover:bg-[#0052CC] text-white rounded-lg text-[14px] font-medium transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Add Category
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8 pb-24">
        <div className="bg-white rounded-lg border border-[#E5E7EB] overflow-hidden">
          <table className="w-full">
            <thead className="bg-[#F9FAFB] border-b border-[#E5E7EB]">
              <tr>
                <th className="px-6 py-3 text-left text-[12px] font-medium text-[#6B7280]">Position Name</th>
                <th className="px-6 py-3 text-left text-[12px] font-medium text-[#6B7280]">Code</th>
                <th className="px-6 py-3 text-left text-[12px] font-medium text-[#6B7280]">Level</th>
                <th className="px-6 py-3 text-left text-[12px] font-medium text-[#6B7280]">Hourly Rate</th>
                <th className="px-6 py-3 text-right text-[12px] font-medium text-[#6B7280]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {categories.map((cat) => (
                <tr key={cat.id} className="hover:bg-[#F9FAFB] transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#F0F4FF] flex items-center justify-center">
                        <Briefcase className="w-4 h-4 text-[#0066FF]" />
                      </div>
                      <span className="text-[13px] font-medium text-[#1F2937]">{cat.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[13px] text-[#6B7280]">{cat.code}</td>
                  <td className="px-6 py-4">
                    <span className="text-[13px] text-[#6B7280]">Level {cat.level}</span>
                  </td>
                  <td className="px-6 py-4 text-[13px] font-medium text-[#1F2937]">€{cat.rate}/hr</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 hover:bg-[#F3F4F6] rounded-lg transition-colors">
                        <Edit2 className="w-4 h-4 text-[#6B7280]" />
                      </button>
                      <button className="p-2 hover:bg-[#FEE2E2] rounded-lg transition-colors">
                        <Trash2 className="w-4 h-4 text-[#F87171]" />
                      </button>
                    </div>
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
import React, { useState } from 'react';
import { ChevronLeft, Plus, Workflow, Edit2, Trash2, Star } from 'lucide-react';
import { WorkflowTemplateBuilder } from './WorkflowTemplateBuilder';

interface WorkflowsSettingsProps {
  onBack: () => void;
}

export function WorkflowsSettings({ onBack }: WorkflowsSettingsProps) {
  const [showBuilder, setShowBuilder] = useState(false);
  const [editingWorkflow, setEditingWorkflow] = useState<any>(null);
  const [workflows, setWorkflows] = useState([
    {
      id: 1,
      name: 'Standard Project Workflow',
      isDefault: true,
      columns: [
        { name: 'Backlog', color: '#9CA3AF' },
        { name: 'To Do', color: '#60A5FA' },
        { name: 'In Progress', color: '#FBBF24' },
        { name: 'Review', color: '#F472B6' },
        { name: 'Done', color: '#34D399' }
      ]
    },
    {
      id: 2,
      name: 'Design Sprint',
      isDefault: false,
      columns: [
        { name: 'Ideation', color: '#A78BFA' },
        { name: 'Design', color: '#60A5FA' },
        { name: 'Prototype', color: '#FBBF24' },
        { name: 'Testing', color: '#F472B6' },
        { name: 'Shipped', color: '#34D399' }
      ]
    },
    {
      id: 3,
      name: 'Development Pipeline',
      isDefault: false,
      columns: [
        { name: 'Planning', color: '#9CA3AF' },
        { name: 'Development', color: '#60A5FA' },
        { name: 'Code Review', color: '#FBBF24' },
        { name: 'QA', color: '#F472B6' },
        { name: 'Deployed', color: '#34D399' }
      ]
    }
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
                <h1 className="text-[20px] font-medium text-[#1F2937]">Workflows</h1>
                <p className="text-[13px] text-[#6B7280]">Kanban board templates for projects</p>
              </div>
            </div>
            <button 
              onClick={() => {
                setEditingWorkflow(null);
                setShowBuilder(true);
              }}
              className="px-4 py-2 bg-[#0066FF] hover:bg-[#0052CC] text-white rounded-lg text-[14px] font-medium transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Create Workflow
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-8 py-8 pb-24">
        <div className="grid gap-6">
          {workflows.map((workflow) => (
            <div key={workflow.id} className="bg-white rounded-lg border border-[#E5E7EB] overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-[#F0F4FF] flex items-center justify-center">
                      <Workflow className="w-5 h-5 text-[#0066FF]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-[15px] font-medium text-[#1F2937]">{workflow.name}</h3>
                        {workflow.isDefault && (
                          <div className="flex items-center gap-1 text-[#FBBF24]">
                            <Star className="w-3.5 h-3.5 fill-current" />
                            <span className="text-[11px] font-medium">Default</span>
                          </div>
                        )}
                      </div>
                      <p className="text-[12px] text-[#6B7280] mt-0.5">{workflow.columns.length} columns</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => {
                        setEditingWorkflow(workflow);
                        setShowBuilder(true);
                      }}
                      className="p-2 hover:bg-[#F3F4F6] rounded-lg transition-colors"
                    >
                      <Edit2 className="w-4 h-4 text-[#6B7280]" />
                    </button>
                    {!workflow.isDefault && (
                      <button 
                        onClick={() => {
                          if (confirm('Are you sure you want to delete this workflow?')) {
                            setWorkflows(workflows.filter(w => w.id !== workflow.id));
                          }
                        }}
                        className="p-2 hover:bg-[#FEE2E2] rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4 text-[#F87171]" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Workflow preview */}
                <div className="bg-[#F9FAFB] rounded-lg p-4">
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {workflow.columns.map((column, index) => (
                      <div
                        key={index}
                        className="flex-shrink-0 w-40 bg-white rounded-lg border border-[#E5E7EB] p-3"
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: column.color }}
                          />
                          <span className="text-[12px] font-medium text-[#1F2937]">{column.name}</span>
                        </div>
                        <div className="space-y-2">
                          <div className="h-12 bg-[#F9FAFB] rounded border border-[#E5E7EB]" />
                          {index < 3 && (
                            <div className="h-12 bg-[#F9FAFB] rounded border border-[#E5E7EB] opacity-50" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showBuilder && (
        <WorkflowTemplateBuilder
          onClose={() => {
            setShowBuilder(false);
            setEditingWorkflow(null);
          }}
          editingWorkflow={editingWorkflow}
          onSave={(newWorkflow) => {
            if (editingWorkflow) {
              setWorkflows(workflows.map(w => w.id === editingWorkflow.id ? newWorkflow : w));
            } else {
              setWorkflows([...workflows, newWorkflow]);
            }
            setShowBuilder(false);
            setEditingWorkflow(null);
          }}
        />
      )}
    </div>
  );
}
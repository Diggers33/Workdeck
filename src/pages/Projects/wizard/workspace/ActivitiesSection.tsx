import { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { GripVertical, Plus, Trash2, Clock, Users, ChevronDown, Settings } from 'lucide-react';
import { MultiSelect } from '../MultiSelect';
import { AllocationPanel } from '../AllocationPanel';

interface Task {
  id: string;
  name: string;
  estimatedHours: string;
  assignedMembers: string[];
  description?: string;
  allocations: { [memberId: string]: number };
}

interface Activity {
  id: string;
  name: string;
  tasks: Task[];
}

const TEAM_MEMBERS = [
  { value: '1', label: 'Sarah Chen' },
  { value: '2', label: 'Michael Rodriguez' },
  { value: '3', label: 'Emily Watson' },
  { value: '4', label: 'David Kim' },
  { value: '5', label: 'Jessica Martinez' },
  { value: '6', label: 'James Thompson' },
  { value: '7', label: 'Rachel Green' },
  { value: '8', label: 'Chris Anderson' },
];

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

export function ActivitiesSection() {
  const [activities, setActivities] = useState<Activity[]>([
    {
      id: '1',
      name: 'Planning Phase',
      tasks: [
        {
          id: '1-1',
          name: 'Define project scope',
          estimatedHours: '40',
          assignedMembers: ['1', '2'],
          description: '',
          allocations: { '1': 20, '2': 20 },
        },
        {
          id: '1-2',
          name: 'Identify stakeholders',
          estimatedHours: '16',
          assignedMembers: ['3'],
          description: '',
          allocations: { '3': 16 },
        },
      ],
    },
    {
      id: '2',
      name: 'Design & Development',
      tasks: [
        {
          id: '2-1',
          name: 'Create wireframes',
          estimatedHours: '32',
          assignedMembers: ['6', '7'],
          description: '',
          allocations: { '6': 16, '7': 16 },
        },
      ],
    },
  ]);

  const [selectedActivityId, setSelectedActivityId] = useState<string>('1');
  const [expandedTaskId, setExpandedTaskId] = useState<string | null>(null);
  const [allocationPanelOpen, setAllocationPanelOpen] = useState(false);
  const [allocationTaskId, setAllocationTaskId] = useState<string | null>(null);

  const selectedActivity = activities.find((a) => a.id === selectedActivityId);
  const allocationTask = selectedActivity?.tasks.find((t) => t.id === allocationTaskId);

  const addActivity = () => {
    const newActivity: Activity = {
      id: Date.now().toString(),
      name: `Activity ${activities.length + 1}`,
      tasks: [
        {
          id: `${Date.now()}-1`,
          name: '',
          estimatedHours: '',
          assignedMembers: [],
          description: '',
          allocations: {},
        },
      ],
    };
    setActivities([...activities, newActivity]);
    setSelectedActivityId(newActivity.id);
  };

  const updateActivityName = (activityId: string, name: string) => {
    setActivities(activities.map((a) => (a.id === activityId ? { ...a, name } : a)));
  };

  const addTask = () => {
    if (!selectedActivityId) return;
    setActivities(
      activities.map((a) =>
        a.id === selectedActivityId
          ? {
              ...a,
              tasks: [
                ...a.tasks,
                {
                  id: `${selectedActivityId}-${Date.now()}`,
                  name: '',
                  estimatedHours: '',
                  assignedMembers: [],
                  description: '',
                  allocations: {},
                },
              ],
            }
          : a
      )
    );
  };

  const deleteTask = (taskId: string) => {
    if (!selectedActivity || selectedActivity.tasks.length === 1) return;
    setActivities(
      activities.map((a) => (a.id === selectedActivityId ? { ...a, tasks: a.tasks.filter((t) => t.id !== taskId) } : a))
    );
    if (expandedTaskId === taskId) {
      setExpandedTaskId(null);
    }
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setActivities(
      activities.map((a) =>
        a.id === selectedActivityId
          ? {
              ...a,
              tasks: a.tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t)),
            }
          : a
      )
    );
  };

  const toggleTaskExpansion = (taskId: string) => {
    setExpandedTaskId(expandedTaskId === taskId ? null : taskId);
  };

  const openAllocationPanel = (taskId: string) => {
    setAllocationTaskId(taskId);
    setAllocationPanelOpen(true);
  };

  const handleUpdateAllocation = (taskId: string, memberId: string, hours: number) => {
    setActivities(
      activities.map((a) =>
        a.id === selectedActivityId
          ? {
              ...a,
              tasks: a.tasks.map((t) =>
                t.id === taskId
                  ? {
                      ...t,
                      allocations: {
                        ...t.allocations,
                        [memberId]: hours,
                      },
                    }
                  : t
              ),
            }
          : a
      )
    );
  };

  return (
    <div className="bg-white rounded-lg border border-[#E3E6EB] shadow-sm">
      <div className="flex" style={{ height: '700px' }}>
        {/* Left - Activities */}
        <div className="w-80 border-r border-[#E3E6EB] flex flex-col">
          <div className="px-5 py-4 border-b border-[#E3E6EB]">
            <h3 className="text-slate-900">Activities</h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {activities.map((activity) => (
              <div
                key={activity.id}
                onClick={() => {
                  setSelectedActivityId(activity.id);
                  setExpandedTaskId(null);
                }}
                className={`px-3 py-2.5 rounded-lg border cursor-pointer transition-all ${
                  selectedActivityId === activity.id
                    ? 'bg-blue-50 border-blue-200'
                    : 'bg-white border-[#E3E6EB] hover:border-slate-300'
                }`}
              >
                <p className={`text-sm ${selectedActivityId === activity.id ? 'text-blue-900' : 'text-slate-700'}`}>
                  {activity.name || 'Untitled Activity'}
                </p>
                <p className="text-xs text-slate-400 mt-0.5">{activity.tasks.length} tasks</p>
              </div>
            ))}
          </div>

          <div className="p-4 border-t border-[#E3E6EB]">
            <Button variant="ghost" onClick={addActivity} className="w-full">
              <Plus className="w-4 h-4 mr-2 stroke-[1.5]" />
              Add Activity
            </Button>
          </div>
        </div>

        {/* Right - Tasks */}
        <div className="flex-1 flex flex-col min-w-0">
          {selectedActivity ? (
            <>
              <div className="px-6 py-4 border-b border-[#E3E6EB]">
                <Label className="text-slate-600 text-xs mb-2 block">Activity Name</Label>
                <Input
                  value={selectedActivity.name}
                  onChange={(e) => updateActivityName(selectedActivity.id, e.target.value)}
                  placeholder="Enter activity name"
                  className="bg-[#FAFAFC] border-[#E3E6EB] h-10"
                />
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className="space-y-0 border border-[#E3E6EB] rounded-lg overflow-hidden">
                  {selectedActivity.tasks.map((task, index) => {
                    const isExpanded = expandedTaskId === task.id;
                    const assignedNames = task.assignedMembers
                      .map((id) => TEAM_MEMBERS.find((m) => m.value === id)?.label)
                      .filter(Boolean);

                    return (
                      <div key={task.id} className={index !== 0 ? 'border-t border-[#E3E6EB]' : ''}>
                        <div
                          onClick={() => toggleTaskExpansion(task.id)}
                          className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors hover:bg-slate-50 ${
                            isExpanded ? 'bg-blue-50' : 'bg-white'
                          }`}
                        >
                          <GripVertical className="w-3.5 h-3.5 text-slate-400 stroke-[1.5]" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-slate-700 truncate">{task.name || 'Untitled task'}</p>
                          </div>
                          {task.estimatedHours && (
                            <div className="flex items-center gap-1 px-2 py-0.5 bg-slate-100 rounded text-xs text-slate-600">
                              <Clock className="w-3 h-3 stroke-[1.5]" />
                              {task.estimatedHours}h
                            </div>
                          )}
                          <div className="flex items-center -space-x-1.5">
                            {assignedNames.slice(0, 3).map((name, idx) => (
                              <div
                                key={idx}
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-[10px] border-2 border-white ${getAvatarColor(
                                  idx
                                )}`}
                                title={name}
                              >
                                {getInitials(name || '')}
                              </div>
                            ))}
                            {assignedNames.length > 3 && (
                              <div className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] border-2 border-white bg-slate-100 text-slate-600">
                                +{assignedNames.length - 3}
                              </div>
                            )}
                          </div>
                          <ChevronDown
                            className={`w-4 h-4 text-slate-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          />
                        </div>

                        {isExpanded && (
                          <div className="bg-slate-50 px-4 py-4 border-t border-[#E3E6EB]">
                            <div className="space-y-3">
                              <div className="space-y-1.5">
                                <Label className="text-slate-600 text-xs">Task Name</Label>
                                <Input
                                  value={task.name}
                                  onChange={(e) => updateTask(task.id, { name: e.target.value })}
                                  placeholder="Enter task name"
                                  className="bg-white border-[#E3E6EB] h-9 text-sm"
                                />
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1.5">
                                  <Label className="text-slate-600 text-xs flex items-center gap-1.5">
                                    <Clock className="w-3 h-3 text-slate-400 stroke-[1.5]" />
                                    Estimated Hours
                                  </Label>
                                  <Input
                                    type="number"
                                    value={task.estimatedHours}
                                    onChange={(e) => updateTask(task.id, { estimatedHours: e.target.value })}
                                    placeholder="0"
                                    className="bg-white border-[#E3E6EB] h-9 text-sm"
                                  />
                                </div>

                                <div className="space-y-1.5">
                                  <div className="flex items-center justify-between">
                                    <Label className="text-slate-600 text-xs flex items-center gap-1.5">
                                      <Users className="w-3 h-3 text-slate-400 stroke-[1.5]" />
                                      Assigned To
                                    </Label>
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openAllocationPanel(task.id);
                                      }}
                                      className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700"
                                    >
                                      <Settings className="w-3 h-3 stroke-[1.5]" />
                                      Adjust
                                    </button>
                                  </div>
                                  <MultiSelect
                                    options={TEAM_MEMBERS}
                                    selected={task.assignedMembers}
                                    onChange={(members) => updateTask(task.id, { assignedMembers: members })}
                                    placeholder="Select members"
                                  />
                                </div>
                              </div>

                              <div className="space-y-1.5">
                                <Label className="text-slate-600 text-xs">Description</Label>
                                <Textarea
                                  value={task.description || ''}
                                  onChange={(e) => updateTask(task.id, { description: e.target.value })}
                                  placeholder="Add description..."
                                  className="bg-white border-[#E3E6EB] min-h-[60px] text-sm resize-none"
                                />
                              </div>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteTask(task.id);
                                }}
                                disabled={selectedActivity.tasks.length === 1}
                                className="text-red-600 hover:text-red-700 text-sm disabled:opacity-30"
                              >
                                Delete Task
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>

                <Button variant="ghost" onClick={addTask} className="w-full mt-3">
                  <Plus className="w-4 h-4 mr-2 stroke-[1.5]" />
                  Add Task
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-slate-500">Select an activity</p>
            </div>
          )}
        </div>
      </div>

      {allocationTask && (
        <AllocationPanel
          isOpen={allocationPanelOpen}
          onClose={() => {
            setAllocationPanelOpen(false);
            setAllocationTaskId(null);
          }}
          taskName={allocationTask.name}
          teamMembers={TEAM_MEMBERS}
          selectedMembers={allocationTask.assignedMembers}
          allocations={allocationTask.allocations}
          onUpdateAllocation={(memberId, hours) => handleUpdateAllocation(allocationTask.id, memberId, hours)}
          onAccept={() => {
            setAllocationPanelOpen(false);
            setAllocationTaskId(null);
          }}
        />
      )}
    </div>
  );
}
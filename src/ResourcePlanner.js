import React, { useState } from 'react';
import { Calendar, Users, AlertTriangle } from 'lucide-react';

const ResourcePlanner = () => {
  const [showTaskDetails, setShowTaskDetails] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [selectedView, setSelectedView] = useState('week');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [showAssignTaskModal, setShowAssignTaskModal] = useState(false);
  const [selectedMemberForAssignment, setSelectedMemberForAssignment] = useState(null);

  const goToPreviousWeek = () => setCurrentWeekOffset(prev => prev - 1);
  const goToNextWeek = () => setCurrentWeekOffset(prev => prev + 1);
  const goToToday = () => setCurrentWeekOffset(0);

  const getTaskStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-700 bg-green-100 border-green-200';
      case 'in-progress': return 'text-blue-700 bg-blue-100 border-blue-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getRemainingHours = (task) => Math.max(0, task.estimatedHours - task.actualHours);

  const getUtilizationColor = (utilization) => {
    if (utilization > 100) return 'text-red-600 bg-red-50 border-red-200';
    if (utilization > 85) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getDateRangeLabel = () => {
    if (selectedView === 'year') return '2025';
    if (selectedView === 'quarter') return 'Q4 2025 (Oct-Dec)';
    if (selectedView === 'month') return 'December 2025';
    
    const base = 12;
    const start = base + (currentWeekOffset * 7);
    const end = start + 8;
    
    if (currentWeekOffset === 0) return 'Dec 12-20, 2025';
    return `Dec ${start}-${end}, 2025`;
  };

  // Task management functions
  const handleAssignTask = (member) => {
    setSelectedMemberForAssignment(member);
    setShowAssignTaskModal(true);
  };

  const handleEditTask = (task, member) => {
    setSelectedTask({...task, memberName: member.name, isEditing: true});
  };

  const updateTaskIntensity = (taskId, memberId, newIntensity, newPattern) => {
    console.log('Updating task intensity:', { taskId, memberId, newIntensity, newPattern });
    setSelectedTask(null);
  };

  const submitTaskAssignment = (taskData) => {
    console.log('Assigning task:', taskData, 'to:', selectedMemberForAssignment.name);
    setShowAssignTaskModal(false);
    setSelectedMemberForAssignment(null);
  };

  const teamMembers = [
    {
      id: 1,
      name: 'Alejandro Rosales',
      avatar: '👨‍💻',
      department: 'Engineering',
      capacity: 40,
      scheduled: 32,
      utilization: 80,
      tasks: [
        {
          project: 'AI Platform',
          activity: 'Core Architecture',
          task: 'System Design & Planning',
          color: 'bg-purple-600',
          estimatedHours: 200,
          actualHours: 85,
          status: 'in-progress',
          pattern: [true, true, false, false, true, true, false, true, true],
          isLongTerm: true,
          targetHoursPerWeek: 6.25
        }
      ]
    },
    {
      id: 2,
      name: 'Sarah Kim',
      avatar: '👩‍💻',
      department: 'Engineering',
      capacity: 40,
      scheduled: 46,
      utilization: 115,
      tasks: [
        {
          project: 'AI Platform',
          activity: 'ML Algorithms',
          task: 'Model Development',
          color: 'bg-purple-600',
          estimatedHours: 200,
          actualHours: 120,
          status: 'in-progress',
          pattern: [true, true, false, false, true, true, true, true, true],
          isLongTerm: true,
          targetHoursPerWeek: 6.25
        }
      ]
    },
    {
      id: 3,
      name: 'Dr. Raj Patel',
      avatar: '👨‍💻',
      department: 'Data Science',
      capacity: 40,
      scheduled: 38,
      utilization: 95,
      tasks: [
        {
          project: 'AI Platform',
          activity: 'Data Pipeline',
          task: 'ETL Development',
          color: 'bg-purple-600',
          estimatedHours: 100,
          actualHours: 45,
          status: 'in-progress',
          pattern: [true, true, false, false, true, true, true, true, false],
          isLongTerm: true,
          targetHoursPerWeek: 5
        }
      ]
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <h1 className="text-xl font-semibold text-gray-900">Resource Planner</h1>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>{getDateRangeLabel()}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1 border border-gray-300 rounded-md">
              <button onClick={goToPreviousWeek} className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-l-md">
                ◀
              </button>
              <button onClick={goToToday} className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 hover:bg-gray-50 border-l border-r border-gray-300">
                Today
              </button>
              <button onClick={goToNextWeek} className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-r-md">
                ▶
              </button>
            </div>
            
            <button 
              onClick={() => setShowTaskDetails(!showTaskDetails)} 
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {showTaskDetails ? 'Hide Tasks' : 'Show Tasks'}
            </button>

            <select 
              value={selectedView} 
              onChange={(e) => setSelectedView(e.target.value)}
              className="text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md px-3 py-1.5"
            >
              <option value="week">Week View</option>
              <option value="month">Month View</option>
              <option value="quarter">Quarter View</option>
              <option value="year">Year View</option>
            </select>

            <select 
              value={selectedDepartment} 
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md px-3 py-1.5"
            >
              <option value="all">All Departments</option>
              <option value="Engineering">Engineering</option>
              <option value="Data Science">Data Science</option>
            </select>
            
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Users className="w-4 h-4" />
              <span>3 team members</span>
            </div>
          </div>
        </div>
      </div>

      {/* Date Headers */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex items-stretch">
          <div className="w-72 flex-shrink-0"></div>
          <div className="flex-1 grid grid-cols-9 gap-2">
            {['Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, i) => (
              <div key={i} className={`text-center py-1 px-1 rounded text-xs ${
                i === 0 ? 'bg-blue-500 text-white font-semibold' :
                i === 2 || i === 3 ? 'text-gray-400 bg-gray-50' : 'text-gray-700 font-medium'
              }`}>
                <div className="uppercase tracking-wide">{day}</div>
                <div className="text-sm font-bold">{12 + i}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-8">
          <div className="mb-4 p-3 bg-gray-800 text-white rounded">
            <h3 className="font-semibold">Engineering & Data Science</h3>
            <p className="text-sm text-gray-300">3 team members</p>
          </div>

          {teamMembers.map((member) => (
            <div key={member.id} className="mb-4">
              <div className="flex items-center justify-between mb-2 p-3 bg-white rounded border">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm">
                    {member.avatar}
                  </div>
                  <div>
                    <div className="font-medium text-sm">{member.name}</div>
                    <div className="text-xs text-gray-500">{member.scheduled}h / {member.capacity}h</div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => handleAssignTask(member)}
                    className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100">
                    + Assign Task
                  </button>
                  <div className={`px-2 py-1 rounded text-xs font-medium border ${getUtilizationColor(member.utilization)}`}>
                    {member.utilization}%
                    {member.utilization > 100 && <AlertTriangle className="w-3 h-3 inline ml-1" />}
                  </div>
                </div>
              </div>

              {showTaskDetails && (
                <div className="ml-4 space-y-1">
                  {member.tasks.map((task, idx) => (
                    <div key={idx} className="flex items-center bg-white rounded border p-2 hover:shadow-md cursor-pointer"
                         onClick={() => setSelectedTask({...task, memberName: member.name})}>
                      <div className="w-72 flex-shrink-0">
                        <div className="flex items-start space-x-2">
                          <div className={`w-3 h-3 rounded-full ${task.color} mt-0.5`}></div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <div className="text-sm font-medium truncate">{task.project}</div>
                              {task.isLongTerm && (
                                <span className="px-1 py-0.5 text-xs bg-purple-100 text-purple-700 rounded border">
                                  Long-term
                                </span>
                              )}
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditTask(task, member);
                                }}
                                className="px-1.5 py-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded border border-blue-200">
                                ⚙️ Edit
                              </button>
                            </div>
                            <div className="text-xs text-gray-600 mb-1">
                              <span className="font-medium">{task.activity}</span>
                              <span className="text-gray-400 mx-1">→</span>
                              <span>{task.task}</span>
                            </div>
                            <div className="text-xs text-gray-500 mb-1">
                              {task.actualHours}h / {task.estimatedHours}h • {getRemainingHours(task)}h left
                            </div>
                            <div className="text-xs text-gray-500 mb-1">
                              Target: {task.targetHoursPerWeek}h/week
                            </div>
                            <span className={`inline-block px-1 py-0.5 text-xs rounded border ${getTaskStatusColor(task.status)}`}>
                              {task.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex-1 grid grid-cols-9 gap-2">
                        {task.pattern.map((isActive, dateIdx) => (
                          <div key={dateIdx} className={`h-6 rounded ${
                            dateIdx === 2 || dateIdx === 3 ? 'bg-gray-100' : 
                            isActive ? `${task.color} opacity-80` : 'bg-gray-100'
                          }`}></div>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  {/* Workload Summary */}
                  <div className="flex items-center bg-blue-50 border-2 border-blue-200 rounded p-2">
                    <div className="w-72 flex-shrink-0">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <div>
                          <div className="text-sm font-medium text-blue-900">Daily Workload</div>
                          <div className="text-xs text-blue-700">Hours scheduled per day</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1 grid grid-cols-9 gap-2">
                      {Array.from({ length: 9 }, (_, dateIdx) => {
                        if (dateIdx === 2 || dateIdx === 3) {
                          return (
                            <div key={dateIdx} className="h-6 rounded bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-semibold">
                              —
                            </div>
                          );
                        }
                        
                        const hours = member.tasks.some(task => task.pattern[dateIdx]) ? 
                          Math.round(member.tasks[0].targetHoursPerWeek / 5 * 10) / 10 : 0;
                        
                        return (
                          <div key={dateIdx} className={`h-6 rounded flex items-center justify-center text-xs font-semibold ${
                            hours === 0 ? 'bg-gray-100 text-gray-400' :
                            hours > 8 ? 'bg-red-500 text-white' :
                            hours > 6 ? 'bg-orange-500 text-white' :
                            'bg-green-500 text-white'
                          } ${dateIdx === 0 ? 'ring-1 ring-blue-400' : ''}`}>
                            {hours === 0 ? '—' : `${hours}h`}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Enhanced Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedTask(null)}>
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start space-x-2 flex-1">
                  <div className={`w-3 h-3 rounded-full ${selectedTask.color} mt-1`}></div>
                  <div>
                    <h2 className="text-base font-semibold">{selectedTask.project}</h2>
                    <p className="text-gray-600 text-xs">
                      <span className="font-medium">{selectedTask.activity}</span>
                      <span className="text-gray-400 mx-1">→</span>
                      <span>{selectedTask.task}</span>
                    </p>
                  </div>
                </div>
                <button onClick={() => setSelectedTask(null)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>

              {selectedTask.isEditing ? (
                <form onSubmit={(e) => {
                  e.preventDefault();
                  const formData = new FormData(e.target);
                  const newIntensity = parseFloat(formData.get('weeklyHours'));
                  updateTaskIntensity(selectedTask.id, selectedTask.memberId, newIntensity, []);
                }}>
                  <div className="space-y-4">
                    <div className="bg-blue-50 p-3 rounded border border-blue-200">
                      <h3 className="text-sm font-semibold text-blue-900 mb-2">⚙️ Configure Task Intensity</h3>
                      <p className="text-xs text-blue-700">Adjust how much time {selectedTask.memberName} spends on this task</p>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-blue-50 p-2 rounded text-center">
                        <div className="text-xs text-blue-700">Total Budget</div>
                        <div className="text-sm font-bold text-blue-900">{selectedTask.estimatedHours}h</div>
                      </div>
                      <div className="bg-green-50 p-2 rounded text-center">
                        <div className="text-xs text-green-700">Completed</div>
                        <div className="text-sm font-bold text-green-900">{selectedTask.actualHours}h</div>
                      </div>
                      <div className="bg-orange-50 p-2 rounded text-center">
                        <div className="text-xs text-orange-700">Remaining</div>
                        <div className="text-sm font-bold text-orange-900">{getRemainingHours(selectedTask)}h</div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Weekly Time Allocation</label>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="number" 
                          name="weeklyHours"
                          step="0.5"
                          min="0.5"
                          max="40"
                          defaultValue={selectedTask.targetHoursPerWeek || 4}
                          className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                        />
                        <span className="text-sm text-gray-600">hours per week</span>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        At current pace: ~{Math.ceil(getRemainingHours(selectedTask) / (selectedTask.targetHoursPerWeek || 4))} weeks to complete
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Work Schedule</label>
                      <div className="grid grid-cols-7 gap-1">
                        {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, idx) => (
                          <label key={day} className="flex flex-col items-center p-1 text-xs">
                            <input 
                              type="checkbox" 
                              name="workDays"
                              value={day.toLowerCase()}
                              defaultChecked={selectedTask.pattern && selectedTask.pattern[idx]}
                              className="h-3 w-3 text-blue-600 border-gray-300 rounded"
                            />
                            <span className="mt-1">{day}</span>
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                      <div className="text-xs font-medium text-yellow-900 mb-1">💡 Example Scenarios</div>
                      <div className="text-xs text-yellow-800 space-y-1">
                        <div>• High intensity (32h/week) for 3 specific months</div>
                        <div>• Maintenance mode (8h/week) for remaining time</div>
                        <div>• Custom work patterns (Mon/Wed/Fri only)</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 mt-6">
                    <button 
                      type="button"
                      onClick={() => setSelectedTask({...selectedTask, isEditing: false})}
                      className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      Update Intensity
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="space-y-3">
                    <div className="text-xs">
                      <span className="text-gray-500">Assigned to:</span>
                      <span className="ml-2 font-medium text-gray-900">{selectedTask.memberName}</span>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="bg-blue-50 p-2 rounded text-center">
                        <div className="text-xs text-blue-700">Estimated</div>
                        <div className="text-sm font-bold text-blue-900">{selectedTask.estimatedHours}h</div>
                      </div>
                      <div className="bg-green-50 p-2 rounded text-center">
                        <div className="text-xs text-green-700">Actual</div>
                        <div className="text-sm font-bold text-green-900">{selectedTask.actualHours}h</div>
                      </div>
                      <div className="bg-orange-50 p-2 rounded text-center">
                        <div className="text-xs text-orange-700">Remaining</div>
                        <div className="text-sm font-bold text-orange-900">{getRemainingHours(selectedTask)}h</div>
                      </div>
                    </div>

                    <div className="bg-green-50 p-3 rounded border border-green-200">
                      <div className="text-xs font-medium text-green-900 mb-1">🎯 Current Intensity</div>
                      <div className="text-xs text-green-800">
                        {selectedTask.targetHoursPerWeek}h per week • Long-term project
                      </div>
                    </div>

                    <div>
                      <span className={`inline-block px-2 py-1 text-xs font-medium rounded border ${getTaskStatusColor(selectedTask.status)}`}>
                        {selectedTask.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <div className="flex justify-between mt-4">
                    {selectedTask.isLongTerm && (
                      <button 
                        onClick={() => setSelectedTask({...selectedTask, isEditing: true})}
                        className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                      >
                        ⚙️ Configure Intensity
                      </button>
                    )}
                    <button onClick={() => setSelectedTask(null)} className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50 ml-auto">
                      Close
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Task Assignment Modal */}
      {showAssignTaskModal && selectedMemberForAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowAssignTaskModal(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Assign Task to {selectedMemberForAssignment.name}</h2>
                <button onClick={() => setShowAssignTaskModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const taskData = {
                  project: formData.get('project'),
                  estimatedHours: parseInt(formData.get('estimatedHours')),
                  priority: formData.get('priority')
                };
                submitTaskAssignment(taskData);
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                    <select name="project" required className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                      <option value="">Select Project</option>
                      <option value="AI Platform">AI Platform</option>
                      <option value="BIORADAR">BIORADAR</option>
                      <option value="ENERGIZE">ENERGIZE</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Hours</label>
                      <input 
                        type="number" 
                        name="estimatedHours"
                        required 
                        min="1"
                        placeholder="40"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                      <select name="priority" required className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="low">Low</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-gray-700 mb-2">Current Capacity</div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Current: {selectedMemberForAssignment.scheduled}h / {selectedMemberForAssignment.capacity}h</span>
                      <span className={`font-medium ${
                        selectedMemberForAssignment.utilization > 100 ? 'text-red-600' :
                        selectedMemberForAssignment.utilization > 85 ? 'text-orange-600' : 'text-green-600'
                      }`}>
                        {selectedMemberForAssignment.utilization}% utilized
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end space-x-3 mt-6">
                  <button 
                    type="button"
                    onClick={() => setShowAssignTaskModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
                  >
                    Assign Task
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourcePlanner;

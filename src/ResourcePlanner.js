import React, { useState, useEffect } from 'react';
import { Calendar, Users, AlertTriangle } from 'lucide-react';

const ResourcePlanner = () => {
  const [showTaskDetails, setShowTaskDetails] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [selectedView, setSelectedView] = useState('month');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [showAssignTaskModal, setShowAssignTaskModal] = useState(false);
  const [selectedMemberForAssignment, setSelectedMemberForAssignment] = useState(null);
  const [showSpreadsheetView, setShowSpreadsheetView] = useState(false);
  const [editingCell, setEditingCell] = useState(null);
  const [showPhaseTemplates, setShowPhaseTemplates] = useState(false);
  const [spreadsheetView, setSpreadsheetView] = useState('month');

  // Static team data
  const staticTeamMembers = [
    {
      id: 1,
      name: 'Alejandro Rosales',
      avatar: '👨‍💻',
      department: 'Engineering',
      capacity: 40,
      scheduled: 42,
      utilization: 105,
      tasks: [
        {
          id: 1,
          project: 'AI Platform',
          activity: 'Core Architecture',
          task: 'System Design & Planning',
          color: 'bg-purple-600',
          estimatedHours: 200,
          actualHours: 85,
          velocity: 7.3,
          status: 'in-progress',
          targetHoursPerWeek: 6.25,
          pattern: [true, true, false, false, true, true, false, true, true]
        },
        {
          id: 2,
          project: 'Legacy Migration',
          activity: 'Database Migration',
          task: 'PostgreSQL to MongoDB',
          color: 'bg-orange-500',
          estimatedHours: 40,
          actualHours: 20,
          velocity: 5.0,
          status: 'in-progress',
          targetHoursPerWeek: 5,
          pattern: [true, true, false, false, true, false, false, false, false]
        }
      ]
    },
    {
      id: 2,
      name: 'Sarah Kim',
      avatar: '👩‍💻',
      department: 'Engineering',
      capacity: 40,
      scheduled: 38,
      utilization: 95,
      tasks: [
        {
          id: 7,
          project: 'AI Platform',
          activity: 'ML Algorithms',
          task: 'Model Development',
          color: 'bg-purple-600',
          estimatedHours: 300,
          actualHours: 120,
          velocity: 8.2,
          status: 'in-progress',
          targetHoursPerWeek: 8.33,
          pattern: [true, true, false, false, true, true, true, true, true]
        }
      ]
    },
    {
      id: 3,
      name: 'Dr. Raj Patel',
      avatar: '👨‍💻',
      department: 'Data Science',
      capacity: 40,
      scheduled: 39,
      utilization: 98,
      tasks: [
        {
          id: 13,
          project: 'AI Platform',
          activity: 'Data Pipeline',
          task: 'ETL Development',
          color: 'bg-purple-600',
          estimatedHours: 180,
          actualHours: 60,
          velocity: 6.8,
          status: 'in-progress',
          targetHoursPerWeek: 5,
          pattern: [true, true, false, false, true, true, true, true, false]
        },
        {
          id: 14,
          project: 'BIORADAR',
          activity: 'Bioinformatics Analysis',
          task: 'Genomic Data Processing',
          color: 'bg-teal-500',
          estimatedHours: 240,
          actualHours: 40,
          velocity: 5.0,
          status: 'in-progress',
          targetHoursPerWeek: 5,
          pattern: [true, true, false, false, true, true, false, false, false]
        }
      ]
    }
  ];

  // Unified data structure
  const [teamData, setTeamData] = useState([]);

  // Initialize team data
  useEffect(() => {
    if (teamData.length === 0) {
      const unifiedData = staticTeamMembers.map(member => ({
        ...member,
        tasks: member.tasks.map(task => ({
          ...task,
          projectId: task.project.toLowerCase().replace(/\s+/g, '-'),
          monthlyHours: Array.from({ length: 12 }, () => task.targetHoursPerWeek || 0)
        }))
      }));
      setTeamData(unifiedData);
    }
  }, [teamData.length]);

  const teamMembers = teamData.length > 0 ? teamData : staticTeamMembers;

  // Add loading state check
  if (!teamMembers || teamMembers.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="text-lg font-semibold">Loading Resource Planner...</div>
          <div className="text-sm text-gray-600">Initializing team data</div>
        </div>
      </div>
    );
  }

  // Sync functions
  const syncTaskFromSpreadsheet = (memberId, projectId, monthIndex, hours) => {
    console.log('🔄 Syncing:', { memberId, projectId, monthIndex, hours });
    
    setTeamData(prevData => 
      prevData.map(member => {
        if (member.id === memberId) {
          return {
            ...member,
            tasks: member.tasks.map(task => {
              if (task.projectId === projectId) {
                const newMonthlyHours = [...(task.monthlyHours || Array(12).fill(0))];
                newMonthlyHours[monthIndex] = hours;
                
                console.log('✅ Updated task:', task.project, 'Month:', monthIndex, 'New hours:', newMonthlyHours);
                
                return {
                  ...task,
                  monthlyHours: newMonthlyHours,
                  targetHoursPerWeek: hours
                };
              }
              return task;
            })
          };
        }
        return member;
      })
    );
  };

  const handleProjectCellEdit = (memberId, projectId, columnIndex, value) => {
    console.log('📝 Cell edit:', { memberId, projectId, columnIndex, value });
    
    if (value === '') {
      syncTaskFromSpreadsheet(memberId, projectId, columnIndex, 0);
      return;
    }
    
    const numValue = parseFloat(value);
    if (isNaN(numValue) || numValue < 0) return;
    
    let weeklyHours = numValue;
    if (spreadsheetView === 'month') {
      weeklyHours = numValue / 4.33;
      console.log('💱 Converting monthly to weekly:', numValue, '→', weeklyHours);
    }
    
    syncTaskFromSpreadsheet(memberId, projectId, columnIndex, weeklyHours);
  };

  const calculateDailyHours = (member, dateIdx, viewType = 'month') => {
    console.log('📊 Calculating for:', member.name, 'Month:', dateIdx, 'View:', viewType);
    
    if (!member.tasks) return 0;
    
    const total = member.tasks.reduce((sum, task) => {
      if (task.monthlyHours && task.monthlyHours[dateIdx]) {
        const hours = task.monthlyHours[dateIdx];
        
        if (task.project === 'AI Platform') {
          console.log('🎯 AI Platform hours for', member.name, ':', hours);
        }
        
        return sum + hours;
      }
      return sum + (task.targetHoursPerWeek || 0);
    }, 0);
    
    console.log('📈 Total hours for', member.name, ':', total);
    return total;
  };

  // Helper functions
  const getTaskStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'text-green-700 bg-green-100 border-green-200';
      case 'in-progress': return 'text-blue-700 bg-blue-100 border-blue-200';
      case 'over-budget': return 'text-red-700 bg-red-100 border-red-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getUtilizationColor = (utilization) => {
    if (utilization > 100) return 'text-red-600 bg-red-50 border-red-200';
    if (utilization > 85) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (utilization < 60) return 'text-blue-600 bg-blue-50 border-blue-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getWorkloadColor = (hours) => {
    if (hours === 0) return 'bg-gray-100 text-gray-400';
    if (hours > 30) return 'bg-red-500 text-white';
    if (hours > 20) return 'bg-orange-500 text-white';
    return 'bg-green-500 text-white';
  };

  const getCellColor = (hours) => {
    if (hours === 0) return 'bg-gray-100 text-gray-400';
    if (spreadsheetView === 'month') {
      if (hours <= 43) return 'bg-blue-100 text-blue-800';
      if (hours <= 87) return 'bg-green-100 text-green-800';
      if (hours <= 130) return 'bg-yellow-100 text-yellow-800';
      if (hours <= 173) return 'bg-orange-100 text-orange-800';
      return 'bg-red-100 text-red-800';
    }
    return 'bg-gray-100 text-gray-400';
  };

  const getSpreadsheetColumns = () => {
    return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  };

  const getMemberProjects = (memberId) => {
    const member = teamMembers.find(m => m.id === memberId);
    if (!member) return [];
    
    return member.tasks.map(task => ({
      id: task.project.toLowerCase().replace(/\s+/g, '-'),
      name: task.project,
      activity: task.activity,
      task: task.task,
      color: task.color
    }));
  };

  const getSpreadsheetValue = (memberId, index, projectId = null) => {
    const member = teamData.find(m => m.id === memberId);
    if (!member) return 0;

    if (projectId) {
      const task = member.tasks.find(t => t.projectId === projectId);
      if (!task || !task.monthlyHours) return 0;
      
      const weeklyHours = task.monthlyHours[index] || 0;
      return spreadsheetView === 'month' ? Math.round(weeklyHours * 4.33) : weeklyHours;
    } else {
      let total = 0;
      member.tasks.forEach(task => {
        if (task.monthlyHours) {
          const weeklyHours = task.monthlyHours[index] || 0;
          total += spreadsheetView === 'month' ? weeklyHours * 4.33 : weeklyHours;
        }
      });
      return Math.round(total);
    }
  };

  const getMemberRowTotal = (memberId) => {
    return getSpreadsheetColumns().reduce((total, _, index) => {
      return total + getSpreadsheetValue(memberId, index);
    }, 0);
  };

  const getProjectRowTotal = (memberId, projectId) => {
    return getSpreadsheetColumns().reduce((total, _, index) => {
      return total + getSpreadsheetValue(memberId, index, projectId);
    }, 0);
  };

  const handleAssignTask = (member) => {
    setSelectedMemberForAssignment(member);
    setShowAssignTaskModal(true);
  };

  const handleEditTask = (task, member) => {
    setSelectedTask({...task, memberName: member.name});
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <h1 className="text-xl font-semibold text-gray-900">Resource Planner</h1>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>June 2025</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Sync Status Indicator */}
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-md">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-green-700">Modes Synced</span>
            </div>
            
            <button 
              onClick={() => setShowTaskDetails(!showTaskDetails)} 
              className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              {showTaskDetails ? 'Hide Tasks' : 'Show Tasks'}
            </button>

            <button 
              onClick={() => setShowSpreadsheetView(!showSpreadsheetView)} 
              className={`px-3 py-1.5 text-sm font-medium border rounded-md ${
                showSpreadsheetView 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
              }`}
            >
              {showSpreadsheetView ? 'Timeline View' : 'Spreadsheet View'}
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
            
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Users className="w-4 h-4" />
              <span>3 team members</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Sync Info Panel */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">ℹ</div>
            <div>
              <h3 className="text-sm font-semibold text-blue-900 mb-1">Bi-Directional Sync Active</h3>
              <div className="text-xs text-blue-800 space-y-1">
                <div>• <strong>Timeline → Spreadsheet:</strong> Task edits automatically update hour allocations</div>
                <div>• <strong>Spreadsheet → Timeline:</strong> Hour changes instantly adjust task schedules</div>
                <div>• <strong>Real-time:</strong> Both views always show the same data</div>
              </div>
            </div>
          </div>
        </div>

        {showSpreadsheetView ? (
          /* Spreadsheet View */
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">12-Month Resource Planning</h2>
              <p className="text-sm text-gray-600">Edit hours to automatically sync with Timeline mode. Changes update task schedules in real-time.</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                      Team Member
                    </th>
                    {getSpreadsheetColumns().map((column, idx) => (
                      <th key={idx} className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                        <div>{column}</div>
                        <div className="text-xs text-gray-400 font-normal">2025</div>
                      </th>
                    ))}
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {teamMembers.map((member) => {
                    const memberProjects = getMemberProjects(member.id);
                    
                    return (
                      <React.Fragment key={member.id}>
                        {/* Member Summary Row */}
                        <tr className="hover:bg-gray-50 bg-gray-25">
                          <td className="px-4 py-3 border-r bg-gray-50">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm text-white font-medium">
                                {member.avatar}
                              </div>
                              <div>
                                <div className="text-sm font-semibold text-gray-900">{member.name}</div>
                                <div className="text-xs text-gray-500">{member.department}</div>
                                <div className="text-xs text-blue-600 font-medium">Total Allocation</div>
                              </div>
                            </div>
                          </td>
                          {getSpreadsheetColumns().map((column, columnIdx) => {
                            const hours = getSpreadsheetValue(member.id, columnIdx);
                            return (
                              <td key={columnIdx} className="px-1 py-1 border-r bg-gray-50">
                                <div className={`w-full px-2 py-2 text-center text-sm font-bold rounded ${getCellColor(hours)}`}>
                                  {hours > 0 ? `${Math.round(hours)}h` : '—'}
                                </div>
                              </td>
                            );
                          })}
                          <td className="px-3 py-3 text-center bg-gray-50">
                            <div className="text-sm font-bold text-gray-900">
                              {Math.round(getMemberRowTotal(member.id))}h
                            </div>
                          </td>
                        </tr>
                        
                        {/* Project Breakdown Rows */}
                        {memberProjects.map((project) => (
                          <tr key={`${member.id}-${project.id}`} className="hover:bg-gray-25">
                            <td className="px-4 py-2 border-r bg-white">
                              <div className="flex items-center space-x-3 ml-8">
                                <div className={`w-3 h-3 rounded-full ${project.color}`}></div>
                                <div>
                                  <div className="text-sm font-medium text-gray-800">{project.name}</div>
                                  <div className="text-xs text-gray-600">{project.activity} → {project.task}</div>
                                </div>
                              </div>
                            </td>
                            {getSpreadsheetColumns().map((column, columnIdx) => {
                              const hours = getSpreadsheetValue(member.id, columnIdx, project.id);
                              const isEditing = editingCell?.memberId === member.id && editingCell?.column === columnIdx && editingCell?.projectId === project.id;
                              return (
                                <td key={columnIdx} className="px-1 py-1 border-r">
                                  {isEditing ? (
                                    <input
                                      type="number"
                                      min="0"
                                      value={hours > 0 ? Math.round(hours) : ''}
                                      onChange={(e) => handleProjectCellEdit(member.id, project.id, columnIdx, e.target.value)}
                                      onBlur={() => setEditingCell(null)}
                                      onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === 'Tab') {
                                          setEditingCell(null);
                                        }
                                      }}
                                      autoFocus
                                      className="w-full h-8 px-2 py-1 text-center text-sm border border-blue-500 rounded focus:outline-none"
                                      placeholder="Monthly hours"
                                    />
                                  ) : (
                                    <div
                                      onClick={() => setEditingCell({ memberId: member.id, column: columnIdx, projectId: project.id })}
                                      className={`w-full h-8 px-2 py-1.5 text-center text-sm font-medium cursor-pointer hover:ring-1 hover:ring-blue-300 rounded flex items-center justify-center ${getCellColor(hours)}`}
                                    >
                                      {hours > 0 ? `${Math.round(hours)}h` : '—'}
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                            <td className="px-3 py-2 text-center bg-white">
                              <div className="text-sm font-medium text-gray-800">
                                {Math.round(getProjectRowTotal(member.id, project.id))}h
                              </div>
                            </td>
                          </tr>
                        ))}
                      </React.Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Timeline View */
          <div className="mb-8">
            <div className="mb-4 p-3 bg-gray-800 text-white rounded">
              <h3 className="font-semibold">Engineering & Data Science</h3>
              <p className="text-sm text-gray-300">3 team members</p>
            </div>

            {teamMembers.map((member) => (
              <div key={`${member.id}-${JSON.stringify(member.tasks.map(t => t.monthlyHours))}`} className="mb-4">
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

                <div className="ml-4 space-y-1">
                  {/* Individual task rows */}
                  {showTaskDetails && member.tasks.map((task, idx) => (
                    <div key={idx} className="flex items-center bg-white rounded border p-2 hover:shadow-md cursor-pointer"
                         onClick={() => setSelectedTask({...task, memberName: member.name})}>
                      <div className="w-72 flex-shrink-0">
                        <div className="flex items-start space-x-2">
                          <div className={`w-3 h-3 rounded-full ${task.color} mt-0.5`}></div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <div className="text-sm font-medium truncate">{task.project}</div>
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleEditTask(task, member);
                                }}
                                className="px-1.5 py-1 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded border border-blue-200">
                                Edit
                              </button>
                            </div>
                            <div className="text-xs text-gray-600 mb-1">
                              <span className="font-medium">{task.activity}</span>
                              <span className="text-gray-400 mx-1">→</span>
                              <span>{task.task}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-xs mb-1">
                              <span className="text-gray-500">Velocity:</span>
                              <span className="font-medium text-green-600">{task.velocity}h/week</span>
                            </div>
                            <span className={`inline-block px-1 py-0.5 text-xs rounded border ${getTaskStatusColor(task.status)}`}>
                              {task.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex-1 grid grid-cols-4 gap-3">
                        {Array.from({ length: 4 }, (_, dateIdx) => (
                          <div key={dateIdx} className={`h-6 rounded ${
                            dateIdx === 2 ? `${task.color} opacity-80 ring-1 ring-blue-400` : 'bg-gray-100'
                          }`}></div>
                        ))}
                      </div>
                    </div>
                  ))}
                  
                  {/* Monthly Workload Summary */}
                  <div className="flex items-center bg-blue-50 border-2 border-blue-200 rounded p-2">
                    <div className="w-72 flex-shrink-0">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <div>
                          <div className="text-sm font-medium text-blue-900">Monthly Workload</div>
                          <div className="text-xs text-blue-700">Hours per week in month</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1 grid grid-cols-4 gap-3">
                      {Array.from({ length: 4 }, (_, periodIndex) => {
                        console.log('🚀 WORKLOAD CALCULATION for:', member.name, 'Period:', periodIndex);
                        const currentMonth = 5; // June = 5
                        const hours = calculateDailyHours(member, currentMonth, 'month');
                        console.log('💡 Final workload hours:', hours);
                        
                        return (
                          <div key={periodIndex} className={`h-6 rounded flex items-center justify-center text-xs font-semibold ${
                            getWorkloadColor(hours)
                          } ${periodIndex === 2 ? 'ring-1 ring-blue-400' : ''}`}>
                            {hours === 0 ? '—' : `${Math.round(hours * 10) / 10}h`}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedTask(null)}>
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start space-x-2 flex-1">
                  <div className={`w-3 h-3 rounded-full ${selectedTask.color} mt-1`}></div>
                  <div>
                    <h2 className="text-base font-semibold">{selectedTask.project}</h2>
                    <p className="text-gray-600 text-xs">
                      <span className="font-medium">{selectedTask.activity}</span>
                      <span className="text-gray-400 mx-1">→</span>

import React, { useState } from 'react';
import { Calendar, Users, AlertTriangle } from 'lucide-react';

const ResourcePlanner = () => {
  const [showTaskDetails, setShowTaskDetails] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [selectedView, setSelectedView] = useState('week');
  const [selectedDepartment, setSelectedDepartment] = useState('all');

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

  const isTaskActive = (task, weekOffset) => {
    if (!task.startWeek && !task.endWeek) return true;
    const startWeek = task.startWeek || -Infinity;
    const endWeek = task.endWeek || Infinity;
    return weekOffset >= startWeek && weekOffset <= endWeek;
  };

  const getCurrentPhaseFromDates = (task, currentWeek) => {
    if (!task.intensityPhases) return null;
    return task.intensityPhases.find(phase => {
      return currentWeek >= phase.startWeek && currentWeek <= phase.endWeek;
    });
  };

  const calculateDailyHours = (member, dateIdx, viewType = 'day') => {
    if (viewType === 'day') {
      return member.tasks.reduce((totalHours, task) => {
        if (isTaskActive(task, currentWeekOffset) && task.pattern && task.pattern[dateIdx]) {
          if (task.intensityPhases) {
            const currentPhase = getCurrentPhaseFromDates(task, currentWeekOffset);
            if (currentPhase) {
              const activeDaysPerWeek = task.pattern.filter(day => day && ![2,3].includes(task.pattern.indexOf(day))).length;
              return totalHours + (currentPhase.hoursPerWeek / Math.max(1, activeDaysPerWeek));
            }
          }
          
          if (task.isLongTerm) {
            const weeklyHours = task.targetHoursPerWeek || Math.min(20, task.estimatedHours / 4);
            const activeDaysPerWeek = task.pattern.filter(day => day && ![2,3].includes(task.pattern.indexOf(day))).length;
            return totalHours + (weeklyHours / Math.max(1, activeDaysPerWeek));
          }
        }
        return totalHours;
      }, 0);
    } else if (viewType === 'week') {
      return member.tasks.reduce((totalHours, task) => {
        if (isTaskActive(task, currentWeekOffset)) {
          if (task.intensityPhases) {
            const currentPhase = getCurrentPhaseFromDates(task, currentWeekOffset);
            if (currentPhase) {
              return totalHours + currentPhase.hoursPerWeek;
            }
          }
          
          if (task.isLongTerm) {
            return totalHours + (task.targetHoursPerWeek || Math.min(20, task.estimatedHours / 4));
          }
        }
        return totalHours;
      }, 0);
    } else if (viewType === 'month') {
      return member.tasks.reduce((totalHours, task) => {
        if (isTaskActive(task, currentWeekOffset)) {
          if (task.intensityPhases) {
            const currentPhase = getCurrentPhaseFromDates(task, currentWeekOffset);
            if (currentPhase) {
              return totalHours + (currentPhase.hoursPerWeek * 4.33);
            }
          }
          
          if (task.isLongTerm) {
            const weeklyHours = task.targetHoursPerWeek || Math.min(20, task.estimatedHours / 4);
            return totalHours + (weeklyHours * 4.33);
          }
        }
        return totalHours;
      }, 0);
    }
    return 0;
  };

  const getWorkloadColor = (hours, viewType) => {
    if (hours === 0) return 'bg-gray-100 text-gray-400';
    
    if (viewType === 'year' || viewType === 'quarter') {
      if (hours > 160) return 'bg-red-500 text-white';
      if (hours > 120) return 'bg-orange-500 text-white';
      return 'bg-green-500 text-white';
    } else if (viewType === 'month') {
      if (hours > 40) return 'bg-red-500 text-white';
      if (hours > 30) return 'bg-orange-500 text-white';
      return 'bg-green-500 text-white';
    } else {
      if (hours > 8) return 'bg-red-500 text-white';
      if (hours > 6) return 'bg-orange-500 text-white';
      return 'bg-green-500 text-white';
    }
  };

  const getPeriodsForView = () => {
    switch (selectedView) {
      case 'year': return 12;
      case 'quarter': return 3;
      case 'month': return 4;
      default: return 9;
    }
  };

  const getDateRangeLabel = () => {
    if (selectedView === 'year') return '2025';
    if (selectedView === 'quarter') return 'Q4 2025 (Oct-Dec)';
    if (selectedView === 'month') return 'December 2025';
    
    if (currentWeekOffset === 0) return 'Dec 12-20, 2025';
    return `Dec 12-20, 2025 (${currentWeekOffset > 0 ? '+' : ''}${currentWeekOffset})`;
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
          totalActivityHours: 300,
          totalProjectHours: 500,
          velocity: 7.3,
          status: 'in-progress',
          startWeek: -8,
          endWeek: 24,
          pattern: [true, true, false, false, true, true, false, true, true],
          isLongTerm: true,
          targetHoursPerWeek: 6.25,
          intensityPhases: [
            { name: 'Planning Phase', hoursPerWeek: 8, startWeek: -8, endWeek: -4 },
            { name: 'Implementation', hoursPerWeek: 6, startWeek: -3, endWeek: 12 },
            { name: 'Testing', hoursPerWeek: 4, startWeek: 13, endWeek: 24 }
          ]
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
          totalActivityHours: 250,
          totalProjectHours: 500,
          velocity: 8.2,
          status: 'in-progress',
          startWeek: -8,
          endWeek: 24,
          pattern: [true, true, false, false, true, true, true, true, true],
          isLongTerm: true,
          targetHoursPerWeek: 6.25,
          intensityPhases: [
            { name: 'Research Phase', hoursPerWeek: 12, startWeek: -8, endWeek: -2 },
            { name: 'Development', hoursPerWeek: 10, startWeek: -1, endWeek: 16 },
            { name: 'Optimization', hoursPerWeek: 5, startWeek: 17, endWeek: 24 }
          ]
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
          totalActivityHours: 150,
          totalProjectHours: 500,
          velocity: 6.8,
          status: 'in-progress',
          startWeek: -4,
          endWeek: 16,
          pattern: [true, true, false, false, true, true, true, true, false],
          isLongTerm: true,
          targetHoursPerWeek: 5,
          intensityPhases: [
            { name: 'Setup Phase', hoursPerWeek: 8, startWeek: -4, endWeek: 0 },
            { name: 'Core Development', hoursPerWeek: 6, startWeek: 1, endWeek: 12 },
            { name: 'Maintenance', hoursPerWeek: 3, startWeek: 13, endWeek: 16 }
          ]
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
          <div className={`flex-1 ${
            selectedView === 'year' ? 'grid grid-cols-12 gap-2' :
            selectedView === 'quarter' ? 'grid grid-cols-3 gap-4' :
            selectedView === 'month' ? 'grid grid-cols-4 gap-3' : 
            'grid grid-cols-9 gap-2'
          }`}>
            {selectedView === 'year' ? (
              Array.from({ length: 12 }, (_, i) => (
                <div key={i} className={`text-center py-1 px-1 rounded text-xs ${
                  i === 11 ? 'bg-blue-500 text-white font-semibold' : 'text-gray-700 font-medium bg-white border border-gray-200'
                }`}>
                  <div className="uppercase tracking-wide">{['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]}</div>
                  <div className="text-xs font-bold">{i + 1}</div>
                  {i === 11 && <div className="text-xs">NOW</div>}
                </div>
              ))
            ) : selectedView === 'quarter' ? (
              ['Oct', 'Nov', 'Dec'].map((month, i) => (
                <div key={i} className={`text-center py-2 px-2 rounded border ${
                  i === 2 ? 'bg-blue-500 text-white border-blue-600' : 'text-gray-700 bg-white border-gray-200 hover:bg-gray-50'
                }`}>
                  <div className="text-sm font-semibold">{month}</div>
                  <div className="text-xs opacity-75">{i + 10}</div>
                  {i === 2 && <div className="text-xs font-medium">NOW</div>}
                </div>
              ))
            ) : selectedView === 'month' ? (
              ['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((week, i) => (
                <div key={i} className={`text-center py-2 px-2 rounded border ${
                  i === 1 ? 'bg-blue-500 text-white border-blue-600' : 'text-gray-700 bg-white border-gray-200 hover:bg-gray-50'
                }`}>
                  <div className="text-sm font-semibold">{week}</div>
                  <div className="text-xs opacity-75">Dec {i * 7 + 1}-{(i + 1) * 7}</div>
                  {i === 1 && <div className="text-xs font-medium">NOW</div>}
                </div>
              ))
            ) : (
              ['Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, i) => (
                <div key={i} className={`text-center py-1 px-1 rounded text-xs ${
                  i === 0 ? 'bg-blue-500 text-white font-semibold' :
                  i === 2 || i === 3 ? 'text-gray-400 bg-gray-50' : 'text-gray-700 font-medium'
                }`}>
                  <div className="uppercase tracking-wide">{day}</div>
                  <div className="text-sm font-bold">{12 + i}</div>
                </div>
              ))
            )}
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
                            </div>
                            <div className="text-xs text-gray-600 mb-1">
                              <span className="font-medium">{task.activity}</span>
                              <span className="text-gray-400 mx-1">→</span>
                              <span>{task.task}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-gray-500 mb-1">
                              <span className="font-medium">{task.actualHours}h / {task.estimatedHours}h personal</span>
                              <span>•</span>
                              <span className="text-orange-600">{task.totalActivityHours}h activity</span>
                              <span>•</span>
                              <span className="text-purple-600">{task.totalProjectHours}h project</span>
                            </div>
                            <div className="flex items-center space-x-2 text-xs mb-1">
                              <span className="text-gray-500">Velocity:</span>
                              <span className="font-medium text-green-600">🚀 {task.velocity}h/week</span>
                              <span className="text-gray-400">(target: {task.targetHoursPerWeek}h/week)</span>
                            </div>
                            <span className={`inline-block px-1 py-0.5 text-xs rounded border ${getTaskStatusColor(task.status)}`}>
                              {task.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className={`flex-1 ${
                        selectedView === 'year' ? 'grid grid-cols-12 gap-2' :
                        selectedView === 'quarter' ? 'grid grid-cols-3 gap-4' :
                        selectedView === 'month' ? 'grid grid-cols-4 gap-3' : 
                        'grid grid-cols-9 gap-2'
                      }`}>
                        {selectedView === 'year' ? 
                          Array.from({ length: 12 }, (_, dateIdx) => (
                            <div key={dateIdx} className={`h-6 rounded ${
                              dateIdx >= 6 ? `${task.color} opacity-60` : 'bg-gray-100'
                            } ${dateIdx === 11 ? 'ring-1 ring-blue-400' : ''}`}></div>
                          )) :
                          selectedView === 'quarter' ? 
                          Array.from({ length: 3 }, (_, dateIdx) => (
                            <div key={dateIdx} className={`h-6 rounded ${
                              `${task.color} opacity-70`
                            } ${dateIdx === 2 ? 'ring-1 ring-blue-400' : ''}`}></div>
                          )) :
                          selectedView === 'month' ? 
                          Array.from({ length: 4 }, (_, dateIdx) => (
                            <div key={dateIdx} className={`h-6 rounded ${
                              dateIdx === 1 ? `${task.color} opacity-80` : 'bg-gray-100'
                            } ${dateIdx === 1 ? 'ring-1 ring-blue-400' : ''}`}></div>
                          )) :
                          task.pattern.map((isActive, dateIdx) => (
                            <div key={dateIdx} className={`h-6 rounded ${
                              dateIdx === 2 || dateIdx === 3 ? 'bg-gray-100' : 
                              isActive ? `${task.color} opacity-80` : 'bg-gray-100'
                            }`}></div>
                          ))
                        }
                      </div>
                    </div>
                  ))}
                  
                  {/* Workload Summary */}
                  <div className="flex items-center bg-blue-50 border-2 border-blue-200 rounded p-2">
                    <div className="w-72 flex-shrink-0">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <div>
                          <div className="text-sm font-medium text-blue-900">
                            {selectedView === 'year' ? 'Monthly Workload' :
                             selectedView === 'quarter' ? 'Monthly Workload' :
                             selectedView === 'month' ? 'Weekly Workload' :
                             'Daily Workload'}
                          </div>
                          <div className="text-xs text-blue-700">
                            {selectedView === 'year' ? 'Hours scheduled per month' :
                             selectedView === 'quarter' ? 'Hours scheduled per month' :
                             selectedView === 'month' ? 'Hours scheduled per week' :
                             'Hours scheduled per day'}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className={`flex-1 ${
                      selectedView === 'year' ? 'grid grid-cols-12 gap-2' :
                      selectedView === 'quarter' ? 'grid grid-cols-3 gap-4' :
                      selectedView === 'month' ? 'grid grid-cols-4 gap-3' : 
                      'grid grid-cols-9 gap-2'
                    }`}>
                      {Array.from({ length: getPeriodsForView() }, (_, periodIndex) => {
                        if (selectedView === 'week' && (periodIndex === 2 || periodIndex === 3)) {
                          return (
                            <div key={periodIndex} className="h-6 rounded bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-semibold">
                              —
                            </div>
                          );
                        }
                        
                        let hours = 0;
                        if (selectedView === 'year' || selectedView === 'quarter') {
                          hours = calculateDailyHours(member, periodIndex, 'month');
                        } else if (selectedView === 'month') {
                          hours = calculateDailyHours(member, periodIndex, 'week');
                        } else {
                          hours = calculateDailyHours(member, periodIndex, 'day');
                        }
                        
                        const isCurrentPeriod = (
                          (selectedView === 'week' && periodIndex === 0) ||
                          (selectedView === 'month' && periodIndex === 1) ||
                          (selectedView === 'quarter' && periodIndex === 2) ||
                          (selectedView === 'year' && periodIndex === 11)
                        );
                        
                        return (
                          <div key={periodIndex} className={`h-6 rounded flex items-center justify-center text-xs font-semibold ${
                            getWorkloadColor(hours, selectedView)
                          } ${isCurrentPeriod ? 'ring-1 ring-blue-400' : ''}`}>
                            {hours === 0 ? '—' : `${Math.round(hours * 10) / 10}h`}
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

      {/* Task Detail Modal */}
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

                {selectedTask.intensityPhases && (
                  <div className="bg-green-50 p-3 rounded border border-green-200">
                    <div className="text-xs font-medium text-green-900 mb-1">🎯 Intensity Phases</div>
                    {selectedTask.intensityPhases.map((phase, idx) => (
                      <div key={idx} className="text-xs text-green-800">
                        • {phase.name}: {phase.hoursPerWeek}h/week (weeks {phase.startWeek} to {phase.endWeek})
                      </div>
                    ))}
                  </div>
                )}

                <div>
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded border ${getTaskStatusColor(selectedTask.status)}`}>
                    {selectedTask.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button onClick={() => setSelectedTask(null)} className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourcePlanner;

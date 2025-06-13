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
      case 'completed': 
        return 'text-green-700 bg-green-100 border-green-200';
      case 'in-progress': 
        return 'text-blue-700 bg-blue-100 border-blue-200';
      case 'over-budget': 
        return 'text-red-700 bg-red-100 border-red-200';
      case 'planned': 
        return 'text-gray-600 bg-gray-100 border-gray-200';
      default: 
        return 'text-gray-600 bg-gray-100 border-gray-200';
    }
  };

  const getRemainingHours = (task) => Math.max(0, task.estimatedHours - task.actualHours);

  const getUtilizationColor = (utilization) => {
    if (utilization > 100) return 'text-red-600 bg-red-50 border-red-200';
    if (utilization > 85) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (utilization < 60) return 'text-blue-600 bg-blue-50 border-blue-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getDailyHours = (memberName, hasWork) => {
    if (!hasWork) return 0;
    
    const hoursMap = {
      'Sarah Kim': 11,
      'Andoni Sanchez': 12,
      'Dr. Raj Patel': 8,
      'Marcus Chen': 7,
      'Alejandro Rosales': 6.5,
      'Lisa Zhang': 5,
      'Jennifer Lee': 4,
      'Dr. Elena Rodriguez': 3,
      'Carlos Zamora': 2
    };
    
    return hoursMap[memberName] || 4;
  };

  // New realistic calculation method
  const calculateDailyHours = (member, dateIdx, viewType = 'day') => {
    if (viewType === 'day') {
      // For daily view: sum up actual hours from all active tasks on this day
      return member.tasks.reduce((totalHours, task) => {
        if (isTaskActive(task, currentWeekOffset) && task.pattern && task.pattern[dateIdx]) {
          // For long-term tasks, use planned intensity rather than spreading thin
          if (task.isLongTerm) {
            // Use targetHoursPerWeek if available, otherwise calculate realistic intensity
            const weeklyHours = task.targetHoursPerWeek || Math.min(20, task.estimatedHours / 4); // Cap at 20h/week, min 4 weeks
            const activeDaysPerWeek = task.pattern.filter(day => day && ![2,3].includes(task.pattern.indexOf(day))).length; // Exclude weekends
            return totalHours + (weeklyHours / Math.max(1, activeDaysPerWeek));
          } else {
            // For short-term tasks, distribute more evenly
            const totalWeeks = Math.max(1, task.endWeek - task.startWeek + 1);
            const weeklyHours = task.estimatedHours / totalWeeks;
            const activeDaysPerWeek = task.pattern.filter(day => day && ![2,3].includes(task.pattern.indexOf(day))).length;
            return totalHours + (weeklyHours / Math.max(1, activeDaysPerWeek));
          }
        }
        return totalHours;
      }, 0);
    } else if (viewType === 'week') {
      // For weekly view: sum up all task hours for the week
      return member.tasks.reduce((totalHours, task) => {
        if (isTaskActive(task, currentWeekOffset)) {
          if (task.isLongTerm) {
            // Use planned weekly intensity for long-term tasks
            return totalHours + (task.targetHoursPerWeek || Math.min(20, task.estimatedHours / 4));
          } else {
            // For short tasks, calculate weekly allocation
            const totalWeeks = Math.max(1, task.endWeek - task.startWeek + 1);
            return totalHours + (task.estimatedHours / totalWeeks);
          }
        }
        return totalHours;
      }, 0);
    } else if (viewType === 'month') {
      // For monthly view: sum up all task hours for the month (4.33 weeks average)
      return member.tasks.reduce((totalHours, task) => {
        if (isTaskActive(task, currentWeekOffset)) {
          if (task.isLongTerm) {
            // Use planned weekly intensity * weeks per month
            const weeklyHours = task.targetHoursPerWeek || Math.min(20, task.estimatedHours / 4);
            return totalHours + (weeklyHours * 4.33);
          } else {
            // For short tasks, calculate monthly allocation
            const totalWeeks = Math.max(1, task.endWeek - task.startWeek + 1);
            const weeklyHours = task.estimatedHours / totalWeeks;
            return totalHours + (weeklyHours * Math.min(4.33, totalWeeks));
          }
        }
        return totalHours;
      }, 0);
    }
    return 0;
  };

  const getDateRangeLabel = () => {
    if (selectedView === 'year') {
      return '2025';
    }
    if (selectedView === 'quarter') {
      const quarters = ['Q1 2025 (Jan-Mar)', 'Q2 2025 (Apr-Jun)', 'Q3 2025 (Jul-Sep)', 'Q4 2025 (Oct-Dec)'];
      const quarterIndex = Math.max(0, Math.min(3, Math.floor(currentWeekOffset / 13) + 3));
      return quarters[quarterIndex];
    }
    if (selectedView === 'month') {
      return 'December 2025';
    }
    
    const base = 12;
    const start = base + (currentWeekOffset * 7);
    const end = start + 8;
    
    if (currentWeekOffset === 0) return 'Dec 12-20, 2025';
    return `Dec ${start}-${end}, 2025 (${currentWeekOffset > 0 ? '+' : ''}${currentWeekOffset})`;
  };

  const isTaskActive = (task, weekOffset) => weekOffset >= task.startWeek && weekOffset <= task.endWeek;

  const calculateVelocity = (task) => {
    if (!task.velocityHistory || task.velocityHistory.length < 2) return null;
    
    const recentWeeks = task.velocityHistory.slice(-4);
    const avgWeeklyHours = recentWeeks.reduce((sum, week) => sum + week.hoursLogged, 0) / recentWeeks.length;
    
    return {
      currentVelocity: avgWeeklyHours,
      targetVelocity: task.targetHoursPerWeek || 0,
      velocityTrend: avgWeeklyHours >= task.targetHoursPerWeek ? 'ahead' : 'behind',
      projectedCompletion: calculateProjectedCompletion(task, avgWeeklyHours)
    };
  };

  const calculateProjectedCompletion = (task, currentVelocity) => {
    const remainingHours = Math.max(0, task.estimatedHours - task.actualHours);
    if (currentVelocity <= 0) return 'Never at current pace';
    
    const weeksRemaining = Math.ceil(remainingHours / currentVelocity);
    const projectedWeek = currentWeekOffset + weeksRemaining;
    
    if (projectedWeek <= task.endWeek) {
      return `Week ${projectedWeek} (On time)`;
    } else {
      const weeksLate = projectedWeek - task.endWeek;
      return `Week ${projectedWeek} (${weeksLate} weeks late)`;
    }
  };

  const getVelocityStatusColor = (velocity) => {
    if (!velocity) return 'text-gray-500';
    
    const ratio = velocity.currentVelocity / velocity.targetVelocity;
    if (ratio >= 1.1) return 'text-green-600';
    if (ratio >= 0.9) return 'text-blue-600';
    if (ratio >= 0.7) return 'text-orange-600';
    return 'text-red-600';
  };

  const getVelocityIcon = (velocity) => {
    if (!velocity) return '📊';
    
    const ratio = velocity.currentVelocity / velocity.targetVelocity;
    if (ratio >= 1.1) return '🚀';
    if (ratio >= 0.9) return '✅';
    if (ratio >= 0.7) return '⚠️';
    return '🚨';
  };

  const handleAssignTask = (member) => {
    setSelectedMemberForAssignment(member);
    setShowAssignTaskModal(true);
  };

  const handleEditTask = (task, member) => {
    setSelectedTask({...task, memberName: member.name, isEditing: true});
  };

  const updateTaskIntensity = (taskId, memberId, newIntensity, newPattern) => {
    // In a real app, this would update the database
    console.log('Updating task intensity:', { taskId, memberId, newIntensity, newPattern });
    // Here you would update the team member's task in state
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
          startWeek: -8,
          endWeek: 24,
          pattern: [true, true, false, false, true, true, false, true, true],
          isLongTerm: true,
          totalActivityHours: 300,
          totalProjectHours: 500,
          projectTeam: ['Alejandro Rosales', 'Sarah Kim', 'Dr. Raj Patel'],
          targetHoursPerWeek: 6.25,
          velocityHistory: [
            { week: -8, hoursLogged: 8 },
            { week: -7, hoursLogged: 7 },
            { week: -6, hoursLogged: 5 },
            { week: -5, hoursLogged: 9 },
            { week: -4, hoursLogged: 6 },
            { week: -3, hoursLogged: 8 },
            { week: -2, hoursLogged: 7 },
            { week: -1, hoursLogged: 6 },
            { week: 0, hoursLogged: 8 }
          ],
          milestones: [
            { name: 'Architecture Design', targetDate: '2025-02-01', status: 'completed', targetHours: 60 },
            { name: 'Core Implementation', targetDate: '2025-04-01', status: 'in-progress', targetHours: 120 },
            { name: 'Testing & Optimization', targetDate: '2025-06-01', status: 'planned', targetHours: 20 }
          ]
        }
      ]
    },
    {
      id: 4,
      name: 'Dr. Elena Rodriguez',
      avatar: '👩‍🔬',
      department: 'Research',
      capacity: 40,
      scheduled: 28,
      utilization: 70,
      tasks: [
        {
          project: 'Long-term Research',
          activity: 'Data Analysis',
          task: 'Clinical Study Analysis',
          color: 'bg-emerald-600',
          estimatedHours: 100, // 100 hours over 6 months
          actualHours: 25,
          status: 'in-progress',
          startWeek: -8,
          endWeek: 18, // 26 weeks total (6 months)
          pattern: [false, true, false, false, true, false, true, false, false], // 3 days per week
          isLongTerm: true,
          totalActivityHours: 150,
          totalProjectHours: 200,
          projectTeam: ['Dr. Elena Rodriguez'],
          targetHoursPerWeek: 4, // Planned intensity: 4 hours/week when working
          velocityHistory: [
            { week: -8, hoursLogged: 3 },
            { week: -7, hoursLogged: 4 },
            { week: -6, hoursLogged: 2 },
            { week: -5, hoursLogged: 5 },
            { week: -4, hoursLogged: 3 },
            { week: -3, hoursLogged: 4 },
            { week: -2, hoursLogged: 4 },
            { week: -1, hoursLogged: 3 },
            { week: 0, hoursLogged: 4 }
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
          status: 'in-progress',
          startWeek: -8,
          endWeek: 24,
          pattern: [true, true, false, false, true, true, true, true, true],
          isLongTerm: true,
          totalActivityHours: 250,
          totalProjectHours: 500,
          projectTeam: ['Alejandro Rosales', 'Sarah Kim', 'Dr. Raj Patel'],
          targetHoursPerWeek: 6.25,
          velocityHistory: [
            { week: -8, hoursLogged: 10 },
            { week: -7, hoursLogged: 12 },
            { week: -6, hoursLogged: 8 },
            { week: -5, hoursLogged: 11 },
            { week: -4, hoursLogged: 9 },
            { week: -3, hoursLogged: 13 },
            { week: -2, hoursLogged: 11 },
            { week: -1, hoursLogged: 14 },
            { week: 0, hoursLogged: 12 }
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
          status: 'in-progress',
          startWeek: -4,
          endWeek: 16,
          pattern: [true, true, false, false, true, true, true, true, false],
          isLongTerm: true,
          totalActivityHours: 150,
          totalProjectHours: 500,
          projectTeam: ['Alejandro Rosales', 'Sarah Kim', 'Dr. Raj Patel'],
          targetHoursPerWeek: 5,
          velocityHistory: [
            { week: -4, hoursLogged: 6 },
            { week: -3, hoursLogged: 4 },
            { week: -2, hoursLogged: 7 },
            { week: -1, hoursLogged: 5 },
            { week: 0, hoursLogged: 3 }
          ]
        }
      ]
    }
  ];

  const departmentGroups = teamMembers.reduce((acc, member) => {
    if (!acc[member.department]) acc[member.department] = [];
    acc[member.department].push(member);
    return acc;
  }, {});

  const availableDepartments = Object.keys(departmentGroups);
  
  const filteredDepartmentGroups = selectedDepartment === 'all' 
    ? departmentGroups 
    : { [selectedDepartment]: departmentGroups[selectedDepartment] };

  const filteredTeamCount = Object.values(filteredDepartmentGroups).flat().length;

  return (
    <div className="bg-gray-50 min-h-screen">
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
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button onClick={goToToday} className="px-3 py-2 text-sm font-medium text-gray-700 hover:text-gray-800 hover:bg-gray-50 border-l border-r border-gray-300">
                Today
              </button>
              <button onClick={goToNextWeek} className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-r-md">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
            
            <button onClick={() => setShowTaskDetails(!showTaskDetails)} className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
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
              {availableDepartments.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Users className="w-4 h-4" />
              <span>
                {filteredTeamCount} team member{filteredTeamCount !== 1 ? 's' : ''}
                {selectedDepartment !== 'all' && (
                  <span className="text-blue-600 font-medium"> in {selectedDepartment}</span>
                )}
              </span>
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
            selectedView === 'month' ? 'grid grid-cols-5 gap-3' : 
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
                <div key={i} className={`text-center py-1 px-2 rounded border ${
                  i === 2 ? 'bg-blue-500 text-white border-blue-600' : 'text-gray-700 bg-white border-gray-200 hover:bg-gray-50'
                }`}>
                  <div className="text-sm font-semibold">{month}</div>
                  <div className="text-xs opacity-75">{i + 10}</div>
                  {i === 2 && <div className="text-xs font-medium">NOW</div>}
                </div>
              ))
            ) : selectedView === 'month' ? (
              ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5'].map((week, i) => (
                <div key={i} className={`text-center py-1 px-2 rounded border ${
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

      <div className="p-4">
        {Object.entries(filteredDepartmentGroups).map(([department, members]) => (
          <div key={department} className="mb-8">
            <div className="mb-4 p-3 bg-gray-800 text-white rounded">
              <h3 className="font-semibold">{department}</h3>
              <p className="text-sm text-gray-300">{members.length} team members</p>
            </div>

            {members.map((member) => (
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
                      className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100"
                    >
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
                    {member.tasks.map((task, idx) => {
                      if (!isTaskActive(task, currentWeekOffset)) return null;
                      
                      return (
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
                                
                                {task.isLongTerm ? (
                                  <div className="space-y-1">
                                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                                      <span className="font-medium">{task.actualHours}h / {task.estimatedHours}h personal</span>
                                      <span>•</span>
                                      <span className="text-orange-600">{task.totalActivityHours}h activity</span>
                                      <span>•</span>
                                      <span className="text-purple-600">{task.totalProjectHours}h project</span>
                                    </div>
                                    
                                    {(() => {
                                      const velocity = calculateVelocity(task);
                                      return velocity ? (
                                        <div className="flex items-center space-x-2 text-xs">
                                          <span className="text-gray-500">Velocity:</span>
                                          <span className={`font-medium ${getVelocityStatusColor(velocity)}`}>
                                            {getVelocityIcon(velocity)} {velocity.currentVelocity.toFixed(1)}h/week
                                          </span>
                                          <span className="text-gray-400">
                                            (target: {velocity.targetVelocity}h/week)
                                          </span>
                                        </div>
                                      ) : null;
                                    })()}
                                    
                                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                                      <div 
                                        className={`h-1.5 rounded-full ${
                                          task.actualHours >= task.estimatedHours ? 'bg-green-500' : 'bg-blue-500'
                                        }`}
                                        style={{ width: `${Math.min((task.actualHours / task.estimatedHours) * 100, 100)}%` }}
                                      ></div>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="text-xs text-gray-500 mb-1">
                                    {task.actualHours}h / {task.estimatedHours}h • {getRemainingHours(task)}h left
                                  </div>
                                )}
                                
                                <span className={`inline-block px-1 py-0.5 text-xs rounded border ${getTaskStatusColor(task.status)}`}>
                                  {task.status}
                                </span>
                              </div>
                            </div>
                          </div>
                          
                          <div className={`flex-1 ${
                            selectedView === 'year' ? 'grid grid-cols-12 gap-2' :
                            selectedView === 'quarter' ? 'grid grid-cols-3 gap-4' :
                            selectedView === 'month' ? 'grid grid-cols-5 gap-3' : 
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
                              Array.from({ length: 5 }, (_, dateIdx) => (
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
                      );
                    })}
                    
                    {/* Workload Summary Bar */}
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
                        selectedView === 'month' ? 'grid grid-cols-5 gap-3' : 
                        'grid grid-cols-9 gap-2'
                      }`}>
                        {selectedView === 'year' ?
                          Array.from({ length: 12 }, (_, dateIdx) => {
                            const monthlyHours = calculateDailyHours(member, dateIdx, 'month');
                            
                            return (
                              <div key={dateIdx} className={`h-6 rounded flex items-center justify-center text-xs font-semibold ${
                                monthlyHours === 0 ? 'bg-gray-100 text-gray-400' :
                                monthlyHours > 160 ? 'bg-red-500 text-white' :
                                monthlyHours > 120 ? 'bg-orange-500 text-white' :
                                'bg-green-500 text-white'
                              } ${dateIdx === 11 ? 'ring-1 ring-blue-400' : ''}`}>
                                {monthlyHours === 0 ? '—' : `${Math.round(monthlyHours)}h`}
                              </div>
                            );
                          }) :
                          selectedView === 'quarter' ?
                          Array.from({ length: 3 }, (_, dateIdx) => {
                            const monthlyHours = calculateDailyHours(member, dateIdx, 'month');
                            
                            return (
                              <div key={dateIdx} className={`h-6 rounded flex items-center justify-center text-xs font-semibold ${
                                monthlyHours === 0 ? 'bg-gray-100 text-gray-400' :
                                monthlyHours > 160 ? 'bg-red-500 text-white' :
                                monthlyHours > 120 ? 'bg-orange-500 text-white' :
                                'bg-green-500 text-white'
                              } ${dateIdx === 2 ? 'ring-1 ring-blue-400' : ''}`}>
                                {monthlyHours === 0 ? '—' : `${Math.round(monthlyHours)}h`}
                              </div>
                            );
                          }) :
                          selectedView === 'month' ?
                          Array.from({ length: 5 }, (_, dateIdx) => {
                            const weeklyHours = calculateDailyHours(member, dateIdx, 'week');
                            
                            return (
                              <div key={dateIdx} className={`h-6 rounded flex items-center justify-center text-xs font-semibold ${
                                weeklyHours === 0 ? 'bg-gray-100 text-gray-400' :
                                weeklyHours > 40 ? 'bg-red-500 text-white' :
                                weeklyHours > 30 ? 'bg-orange-500 text-white' :
                                'bg-green-500 text-white'
                              } ${dateIdx === 1 ? 'ring-1 ring-blue-400' : ''}`}>
                                {weeklyHours === 0 ? '—' : `${Math.round(weeklyHours)}h`}
                              </div>
                            );
                          }) :
                          Array.from({ length: 9 }, (_, dateIdx) => {
                            if (dateIdx === 2 || dateIdx === 3) {
                              return (
                                <div key={dateIdx} className="h-6 rounded bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-semibold">
                                  —
                                </div>
                              );
                            }
                            
                            const dailyHours = calculateDailyHours(member, dateIdx, 'day');
                            
                            return (
                              <div key={dateIdx} className={`h-6 rounded flex items-center justify-center text-xs font-semibold ${
                                dailyHours === 0 ? 'bg-gray-100 text-gray-400' :
                                dailyHours > 8 ? 'bg-red-500 text-white' :
                                dailyHours > 6 ? 'bg-orange-500 text-white' :
                                'bg-green-500 text-white'
                              } ${dateIdx === 0 ? 'ring-1 ring-blue-400' : ''}`}>
                                {dailyHours === 0 ? '—' : `${Math.round(dailyHours * 10) / 10}h`}
                              </div>
                            );
                          })
                        }
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ))}
      </div>

      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedTask(null)}>
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start space-x-2 flex-1 min-w-0">
                  <div className={`w-3 h-3 rounded-full ${selectedTask.color} mt-1 flex-shrink-0`}></div>
                  <div className="min-w-0 flex-1">
                    <h2 className="text-base font-semibold truncate">{selectedTask.project}</h2>
                    <p className="text-gray-600 text-xs">
                      <span className="font-medium">{selectedTask.activity}</span>
                      <span className="text-gray-400 mx-1">→</span>
                      <span>{selectedTask.task}</span>
                    </p>
                  </div>
                </div>
                <button onClick={() => setSelectedTask(null)} className="text-gray-400 hover:text-gray-600 ml-2 flex-shrink-0">✕</button>
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

                {selectedTask.isLongTerm && (() => {
                  const velocity = calculateVelocity(selectedTask);
                  return velocity ? (
                    <div className="bg-purple-50 p-3 rounded border border-purple-200">
                      <div className="text-xs font-medium text-purple-900 mb-2">📊 Velocity Tracking</div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span className="text-purple-700">Current Velocity:</span>
                          <span className={`font-medium ${getVelocityStatusColor(velocity)}`}>
                            {getVelocityIcon(velocity)} {velocity.currentVelocity.toFixed(1)}h/week
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-700">Target:</span>
                          <span className="text-purple-900">{velocity.targetVelocity}h/week</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-purple-700">Projected:</span>
                          <span className="text-purple-900">{velocity.projectedCompletion}</span>
                        </div>
                      </div>
                    </div>
                  ) : null;
                })()}

                {selectedTask.milestones && (
                  <div className="bg-gray-50 p-3 rounded">
                    <div className="text-xs font-medium text-gray-900 mb-2">🎯 Milestones</div>
                    <div className="space-y-1">
                      {selectedTask.milestones.map((milestone, idx) => (
                        <div key={idx} className="flex items-center justify-between text-xs">
                          <div className="flex items-center space-x-1">
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              milestone.status === 'completed' ? 'bg-green-500' :
                              milestone.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-300'
                            }`}></span>
                            <span className="text-gray-700">{milestone.name}</span>
                          </div>
                          <div className="text-gray-500">
                            {milestone.targetDate} • {milestone.targetHours}h
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div>
                  <span className={`inline-block px-2 py-1 text-xs font-medium rounded border ${getTaskStatusColor(selectedTask.status)}`}>
                    {selectedTask.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="flex justify-end mt-4">
                <button onClick={() => setSelectedTask(null)} className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ResourcePlanner;

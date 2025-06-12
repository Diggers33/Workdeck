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
      case 'over-budget': return 'text-red-700 bg-red-100 border-red-200';
      case 'planned': return 'text-gray-600 bg-gray-100 border-gray-200';
      default: return 'text-gray-600 bg-gray-100 border-gray-200';
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

  const getWeekDates = () => {
    if (selectedView === 'year') {
      return [
        { month: 'Jan', label: 'January', isCurrentMonth: false, monthNum: 1 },
        { month: 'Feb', label: 'February', isCurrentMonth: false, monthNum: 2 },
        { month: 'Mar', label: 'March', isCurrentMonth: false, monthNum: 3 },
        { month: 'Apr', label: 'April', isCurrentMonth: false, monthNum: 4 },
        { month: 'May', label: 'May', isCurrentMonth: false, monthNum: 5 },
        { month: 'Jun', label: 'June', isCurrentMonth: false, monthNum: 6 },
        { month: 'Jul', label: 'July', isCurrentMonth: false, monthNum: 7 },
        { month: 'Aug', label: 'August', isCurrentMonth: false, monthNum: 8 },
        { month: 'Sep', label: 'September', isCurrentMonth: false, monthNum: 9 },
        { month: 'Oct', label: 'October', isCurrentMonth: false, monthNum: 10 },
        { month: 'Nov', label: 'November', isCurrentMonth: false, monthNum: 11 },
        { month: 'Dec', label: 'December', isCurrentMonth: true, monthNum: 12 }
      ];
    }
    if (selectedView === 'quarter') {
      return [
        { month: 'Oct', label: 'October', isCurrentMonth: false, monthNum: 10 },
        { month: 'Nov', label: 'November', isCurrentMonth: false, monthNum: 11 },
        { month: 'Dec', label: 'December', isCurrentMonth: true, monthNum: 12 }
      ];
    }
    if (selectedView === 'month') {
      return [
        { week: 'Week 1', label: 'Dec 1-7', isCurrentWeek: false, weekNum: 1 },
        { week: 'Week 2', label: 'Dec 8-14', isCurrentWeek: true, weekNum: 2 },
        { week: 'Week 3', label: 'Dec 15-21', isCurrentWeek: false, weekNum: 3 },
        { week: 'Week 4', label: 'Dec 22-28', isCurrentWeek: false, weekNum: 4 },
        { week: 'Week 5', label: 'Dec 29-31', isCurrentWeek: false, weekNum: 5 }
      ];
    }
    
    const base = 12;
    const start = base + (currentWeekOffset * 7);
    const dayNames = ['Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    
    return Array.from({ length: 9 }, (_, i) => ({
      date: (start + i).toString(),
      day: dayNames[i],
      isWeekend: i === 2 || i === 3,
      isToday: currentWeekOffset === 0 && i === 0
    }));
  };

  const isTaskActive = (task, weekOffset) => weekOffset >= task.startWeek && weekOffset <= task.endWeek;

  // Velocity tracking functions
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

  // Task assignment functions
  const handleAssignTask = (member) => {
    setSelectedMemberForAssignment(member);
    setShowAssignTaskModal(true);
  };

  const submitTaskAssignment = (taskData) => {
    console.log('Assigning task:', taskData, 'to:', selectedMemberForAssignment.name);
    setShowAssignTaskModal(false);
    setSelectedMemberForAssignment(null);
  };

  // Project structure for assignment dropdown
  const projectStructure = {
    'AI Platform': {
      'Core Architecture': ['System Design & Planning', 'Technical Documentation', 'Code Review'],
      'ML Algorithms': ['Model Development', 'Algorithm Optimization', 'Performance Testing'],
      'Data Pipeline': ['ETL Development', 'Data Validation', 'Pipeline Monitoring']
    },
    'BIORADAR': {
      'Clinical Studies': ['Protocol Development', 'Data Collection', 'Analysis'],
      'Backend Infrastructure': ['API Development', 'Database Design', 'Security Implementation'],
      'Long-term Research Analysis': ['Literature Review', 'Methodology Design', 'Statistical Analysis']
    },
    'ENERGIZE': {
      'Mobile App': ['Frontend Development', 'UI/UX Design', 'Testing'],
      'Backend Services': ['API Integration', 'Data Management', 'Performance Optimization']
    },
    'H20forALL': {
      'ML Models': ['Data Preprocessing', 'Model Training', 'Evaluation'],
      'Web Platform': ['Frontend Development', 'Backend Integration', 'Deployment']
    }
  };

  // Enhanced team members with long-term tasks
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

  const weekDates = getWeekDates();
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
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 py-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
          <div className="flex items-center space-x-4 sm:space-x-6">
            <h1 className="text-lg sm:text-xl font-semibold text-gray-900">Resource Planner</h1>
            <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500">
              <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">{getDateRangeLabel()}</span>
              <span className="sm:hidden">{selectedView.charAt(0).toUpperCase() + selectedView.slice(1)}</span>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <div className="flex items-center space-x-1 border border-gray-300 rounded-md order-1 sm:order-none">
              <button onClick={goToPreviousWeek} className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-l-md">
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <button onClick={goToToday} className="px-2 sm:px-3 py-1.5 sm:py-2 text-xs sm:text-sm font-medium text-gray-700 hover:text-gray-800 hover:bg-gray-50 border-l border-r border-gray-300">
                Today
              </button>
              <button onClick={goToNextWeek} className="p-1.5 sm:p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-r-md">
                <svg className="w-3 h-3 sm:w-4 sm:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            <button onClick={() => setShowTaskDetails(!showTaskDetails)} className="px-2 sm:px-3 py-1.5 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 order-3 sm:order-none">
              <span className="hidden sm:inline">{showTaskDetails ? 'Hide Tasks' : 'Show Tasks'}</span>
              <span className="sm:hidden">{showTaskDetails ? 'Hide' : 'Show'}</span>
            </button>
            
            <select 
              value={selectedView} 
              onChange={(e) => setSelectedView(e.target.value)}
              className="text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md px-2 sm:px-3 py-1.5 order-2 sm:order-none"
            >
              <option value="week">Week</option>
              <option value="month">Month</option>
              <option value="quarter">Quarter</option>
              <option value="year">Year</option>
            </select>

            <select 
              value={selectedDepartment} 
              onChange={(e) => setSelectedDepartment(e.target.value)}
              className="text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md px-2 sm:px-3 py-1.5 order-4 sm:order-none"
            >
              <option value="all">All Depts</option>
              {availableDepartments.map(dept => (
                <option key={dept} value={dept}>{dept.split(' ')[0]}</option>
              ))}
            </select>
            
            <div className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500 order-5 sm:order-none">
              <Users className="w-3 h-3 sm:w-4 sm:h-4" />
              <span className="hidden sm:inline">
                {filteredTeamCount} team member{filteredTeamCount !== 1 ? 's' : ''}
                {selectedDepartment !== 'all' && (
                  <span className="text-blue-600 font-medium"> in {selectedDepartment}</span>
                )}
              </span>
              <span className="sm:hidden">{filteredTeamCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 overflow-x-auto">
        <div className="flex space-x-6 sm:space-x-8 min-w-max">
          <button className="py-3 px-1 border-b-2 border-blue-500 text-blue-600 font-medium text-sm whitespace-nowrap">Resource Planner</button>
          <button className="py-3 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm whitespace-nowrap">Gantt</button>
          <button className="py-3 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm whitespace-nowrap">My Tasks</button>
        </div>
      </div>

      {/* Date Headers */}
      <div className="bg-white border-b border-gray-200 px-2 sm:px-4 py-2 overflow-x-auto">
        <div className="flex items-stretch min-w-max">
          <div className="w-48 sm:w-72 flex-shrink-0"></div>
          <div className={`flex-1 min-w-0 ${
            selectedView === 'year' ? 'grid grid-cols-12 gap-1 sm:gap-2' :
            selectedView === 'quarter' ? 'grid grid-cols-3 gap-2 sm:gap-4' :
            selectedView === 'month' ? 'grid grid-cols-5 gap-2 sm:gap-3' : 
            'grid grid-cols-9 gap-1 sm:gap-2'
          }`}>
            {selectedView === 'year' ? (
              weekDates.map((month, idx) => (
                <div key={idx} className={`text-center py-1 px-1 rounded text-xs ${
                  month.isCurrentMonth ? 'bg-blue-500 text-white font-semibold' : 'text-gray-700 font-medium bg-white border border-gray-200'
                }`}>
                  <div className="uppercase tracking-wide">{month.month}</div>
                  <div className="text-xs font-bold">{month.monthNum}</div>
                  {month.isCurrentMonth && <div className="text-xs">NOW</div>}
                </div>
              ))
            ) : selectedView === 'quarter' ? (
              weekDates.map((month, idx) => (
                <div key={idx} className={`text-center py-1 px-2 rounded border ${
                  month.isCurrentMonth ? 'bg-blue-500 text-white border-blue-600' : 'text-gray-700 bg-white border-gray-200 hover:bg-gray-50'
                }`}>
                  <div className="text-sm font-semibold">{month.month}</div>
                  <div className="text-xs opacity-75">{month.monthNum}</div>
                  {month.isCurrentMonth && <div className="text-xs font-medium">NOW</div>}
                </div>
              ))
            ) : selectedView === 'month' ? (
              weekDates.map((week, idx) => (
                <div key={idx} className={`text-center py-1 px-2 rounded border ${
                  week.isCurrentWeek ? 'bg-blue-500 text-white border-blue-600' : 'text-gray-700 bg-white border-gray-200 hover:bg-gray-50'
                }`}>
                  <div className="text-sm font-semibold">{week.week}</div>
                  <div className="text-xs opacity-75">{week.label}</div>
                  {week.isCurrentWeek && <div className="text-xs font-medium">NOW</div>}
                </div>
              ))
            ) : (
              weekDates.map((date, idx) => (
                <div key={idx} className={`text-center py-1 px-1 rounded text-xs ${
                  date.isToday ? 'bg-blue-500 text-white font-semibold' :
                  date.isWeekend ? 'text-gray-400 bg-gray-50' : 'text-gray-700 font-medium'
                }`}>
                  <div className="uppercase tracking-wide">{date.day}</div>
                  <div className="text-sm font-bold">{date.date}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-2 sm:p-4 overflow-x-auto">
        {Object.entries(filteredDepartmentGroups).map(([department, members]) => (
          <div key={department} className="mb-6 sm:mb-8">
            <div className="mb-3 sm:mb-4 p-2 sm:p-3 bg-gray-800 text-white rounded">
              <h3 className="font-semibold text-sm sm:text-base">{department}</h3>
              <p className="text-xs sm:text-sm text-gray-300">{members.length} team members</p>
            </div>

            {members.map((member) => (
              <div key={member.id} className="mb-3 sm:mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 p-2 sm:p-3 bg-white rounded border space-y-2 sm:space-y-0">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 sm:w-8 sm:h-8 bg-blue-500 rounded-full flex items-center justify-center text-xs sm:text-sm">
                      {member.avatar}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{member.name}</div>
                      <div className="text-xs text-gray-500">{member.scheduled}h / {member.capacity}h</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end space-x-2">
                    <button
                      onClick={() => handleAssignTask(member)}
                      className="px-2 py-1 text-xs font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded hover:bg-blue-100 flex-shrink-0"
                    >
                      <span className="hidden sm:inline">+ Assign Task</span>
                      <span className="sm:hidden">+ Task</span>
                    </button>
                    <div className={`px-2 py-1 rounded text-xs font-medium border ${getUtilizationColor(member.utilization)} flex-shrink-0`}>
                      {member.utilization}%
                      {member.utilization > 100 && <AlertTriangle className="w-3 h-3 inline ml-1" />}
                    </div>
                  </div>
                </div>

                {showTaskDetails && (
                  <div className="ml-2 sm:ml-4 space-y-1 overflow-x-auto">
                    <div className="min-w-max">
                      {member.tasks.map((task, idx) => {
                        if (!isTaskActive(task, currentWeekOffset)) return null;
                        
                        return (
                          <div key={idx} className="flex items-center bg-white rounded border p-2 hover:shadow-md cursor-pointer mb-1"
                               onClick={() => setSelectedTask({...task, memberName: member.name})}>
                            <div className="w-48 sm:w-72 flex-shrink-0">
                              <div className="flex items-start space-x-2">
                                <div className={`w-3 h-3 rounded-full ${task.color} mt-0.5 flex-shrink-0`}></div>
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center space-x-2 mb-1">
                                    <div className="text-xs sm:text-sm font-medium truncate">{task.project}</div>
                                    {task.isLongTerm && (
                                      <span className="px-1 py-0.5 text-xs bg-purple-100 text-purple-700 rounded border flex-shrink-0">
                                        Long-term
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-600 mb-1">
                                    <span className="font-medium">{task.activity}</span>
                                    <span className="text-gray-400 mx-1">→</span>
                                    <span className="break-words">{task.task}</span>
                                  </div>
                                  
                                  {task.isLongTerm ? (
                                    <div className="space-y-1">
                                      <div className="flex flex-wrap items-center gap-1 text-xs text-gray-500">
                                        <span className="font-medium">{task.actualHours}h / {task.estimatedHours}h</span>
                                        <span>•</span>
                                        <span className="text-orange-600">{task.totalActivityHours}h activity</span>
                                        <span>•</span>
                                        <span className="text-purple-600">{task.totalProjectHours}h project</span>
                                      </div>
                                      
                                      {(() => {
                                        const velocity = calculateVelocity(task);
                                        return velocity ? (
                                          <div className="flex flex-wrap items-center gap-1 text-xs">
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
                            
                            <div className={`flex-1 min-w-0 ${
                              selectedView === 'year' ? 'grid grid-cols-12 gap-1 sm:gap-2' :
                              selectedView === 'quarter' ? 'grid grid-cols-3 gap-2 sm:gap-4' :
                              selectedView === 'month' ? 'grid grid-cols-5 gap-2 sm:gap-3' : 
                              'grid grid-cols-9 gap-1 sm:gap-2'
                            }`}>
                              {selectedView === 'year' ? 
                                weekDates.map((month, dateIdx) => {
                                  const taskStartMonth = Math.max(1, Math.min(12, 12 + (task.startWeek / 4.33)));
                                  const taskEndMonth = Math.max(1, Math.min(12, 12 + (task.endWeek / 4.33)));
                                  const isTaskActiveInMonth = month.monthNum >= taskStartMonth && month.monthNum <= taskEndMonth;
                                  
                                  return (
                                    <div key={dateIdx} className={`h-4 sm:h-6 rounded ${
                                      isTaskActiveInMonth ? `${task.color} opacity-60` : 'bg-gray-100'
                                    } ${month.isCurrentMonth ? 'ring-1 ring-blue-400' : ''}`}></div>
                                  );
                                }) :
                                selectedView === 'quarter' ? 
                                weekDates.map((month, dateIdx) => {
                                  const taskStartMonth = Math.max(1, Math.min(12, 12 + (task.startWeek / 4.33)));
                                  const taskEndMonth = Math.max(1, Math.min(12, 12 + (task.endWeek / 4.33)));
                                  const isTaskActiveInMonth = month.monthNum >= taskStartMonth && month.monthNum <= taskEndMonth;
                                  
                                  return (
                                    <div key={dateIdx} className={`h-4 sm:h-6 rounded ${
                                      isTaskActiveInMonth ? `${task.color} opacity-70` : 'bg-gray-100'
                                    } ${month.isCurrentMonth ? 'ring-1 ring-blue-400' : ''}`}></div>
                                  );
                                }) :
                                selectedView === 'month' ? 
                                weekDates.map((week, dateIdx) => {
                                  const isTaskActiveInWeek = task.startWeek <= week.weekNum && task.endWeek >= week.weekNum;
                                  return (
                                    <div key={dateIdx} className={`h-4 sm:h-6 rounded ${
                                      isTaskActiveInWeek ? `${task.color} opacity-80` : 'bg-gray-100'
                                    } ${week.isCurrentWeek ? 'ring-1 ring-blue-400' : ''}`}></div>
                                  );
                                }) :
                                weekDates.map((date, dateIdx) => (
                                  <div key={dateIdx} className={`h-4 sm:h-6 rounded ${
                                    date.isWeekend ? 'bg-gray-100' : 
                                    task.pattern[dateIdx] ? `${task.color} opacity-80` : 'bg-gray-100'
                                  }`}></div>
                                ))
                              }
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
                    
                {/* Workload summary - ALWAYS VISIBLE */}
                <div className="ml-2 sm:ml-4 mt-2 overflow-x-auto">
                  <div className="flex items-center bg-blue-50 border-2 border-blue-200 rounded p-2 min-w-max">
                    <div className="w-48 sm:w-72 flex-shrink-0">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500 flex-shrink-0"></div>
                        <div>
                          <div className="text-xs sm:text-sm font-medium text-blue-900">
                            {selectedView === 'year' ? 'Monthly Workload' :
                             selectedView === 'quarter' ? 'Monthly Workload' :
                             selectedView === 'month' ? 'Weekly Workload' :
                             'Daily Workload'}
                          </div>
                          <div className="text-xs text-blue-700">
                            {selectedView === 'year' ? 'Hours per month' :
                             selectedView === 'quarter' ? 'Hours per month' :
                             selectedView === 'month' ? 'Hours per week' :
                             'Hours per day'}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className={`flex-1 min-w-0 ${
                      selectedView === 'year' ? 'grid grid-cols-12 gap-1 sm:gap-2' :
                      selectedView === 'quarter' ? 'grid grid-cols-3 gap-2 sm:gap-4' :
                      selectedView === 'month' ? 'grid grid-cols-5 gap-2 sm:gap-3' : 
                      'grid grid-cols-9 gap-1 sm:gap-2'
                    }`}>
                      {selectedView === 'year' ?
                        weekDates.map((month, dateIdx) => {
                          const hasWork = member.tasks.some(task => {
                            const taskStartMonth = Math.max(1, Math.min(12, 12 + (task.startWeek / 4.33)));
                            const taskEndMonth = Math.max(1, Math.min(12, 12 + (task.endWeek / 4.33)));
                            return isTaskActive(task, currentWeekOffset) && month.monthNum >= taskStartMonth && month.monthNum <= taskEndMonth;
                          });
                          
                          const monthlyHours = hasWork ? getDailyHours(member.name, true) * 22 : 0;
                          
                          return (
                            <div key={dateIdx} className={`h-4 sm:h-6 rounded flex items-center justify-center text-xs font-semibold ${
                              monthlyHours === 0 ? 'bg-gray-100 text-gray-400' :
                              monthlyHours > 160 ? 'bg-red-500 text-white' :
                              monthlyHours > 120 ? 'bg-orange-500 text-white' :
                              'bg-green-500 text-white'
                            } ${month.isCurrentMonth ? 'ring-1 ring-blue-400' : ''}`}>
                              <span className="hidden sm:inline">{monthlyHours === 0 ? '—' : `${Math.round(monthlyHours)}h`}</span>
                              <span className="sm:hidden">{monthlyHours === 0 ? '—' : Math.round(monthlyHours)}</span>
                            </div>
                          );
                        }) :
                        selectedView === 'quarter' ?
                        weekDates.map((month, dateIdx) => {
                          const hasWork = member.tasks.some(task => {
                            const taskStartMonth = Math.max(1, Math.min(12, 12 + (task.startWeek / 4.33)));
                            const taskEndMonth = Math.max(1, Math.min(12, 12 + (task.endWeek / 4.33)));
                            return isTaskActive(task, currentWeekOffset) && month.monthNum >= taskStartMonth && month.monthNum <= taskEndMonth;
                          });
                          
                          const monthlyHours = hasWork ? getDailyHours(member.name, true) * 22 : 0;
                          
                          return (
                            <div key={dateIdx} className={`h-4 sm:h-6 rounded flex items-center justify-center text-xs font-semibold ${
                              monthlyHours === 0 ? 'bg-gray-100 text-gray-400' :
                              monthlyHours > 160 ? 'bg-red-500 text-white' :
                              monthlyHours > 120 ? 'bg-orange-500 text-white' :
                              'bg-green-500 text-white'
                            } ${month.isCurrentMonth ? 'ring-1 ring-blue-400' : ''}`}>
                              <span className="hidden sm:inline">{monthlyHours === 0 ? '—' : `${Math.round(monthlyHours)}h`}</span>
                              <span className="sm:hidden">{monthlyHours === 0 ? '—' : Math.round(monthlyHours)}</span>
                            </div>
                          );
                        }) :
                        selectedView === 'month' ?
                        weekDates.map((week, dateIdx) => {
                          const hasWork = member.tasks.some(task => 
                            isTaskActive(task, currentWeekOffset) && task.startWeek <= week.weekNum && task.endWeek >= week.weekNum
                          );
                          
                          const weeklyHours = hasWork ? getDailyHours(member.name, true) * 5 : 0;
                          
                          return (
                            <div key={dateIdx} className={`h-4 sm:h-6 rounded flex items-center justify-center text-xs font-semibold ${
                              weeklyHours === 0 ? 'bg-gray-100 text-gray-400' :
                              weeklyHours > 40 ? 'bg-red-500 text-white' :
                              weeklyHours > 30 ? 'bg-orange-500 text-white' :
                              'bg-green-500 text-white'
                            } ${week.isCurrentWeek ? 'ring-1 ring-blue-400' : ''}`}>
                              <span className="hidden sm:inline">{weeklyHours === 0 ? '—' : `${weeklyHours}h`}</span>
                              <span className="sm:hidden">{weeklyHours === 0 ? '—' : weeklyHours}</span>
                            </div>
                          );
                        }) :
                        weekDates.map((date, dateIdx) => {
                          if (date.isWeekend) {
                            return (
                              <div key={dateIdx} className="h-4 sm:h-6 rounded bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-semibold">
                                —
                              </div>
                            );
                          }
                          
                          const hasWork = member.tasks.some(task => 
                            isTaskActive(task, currentWeekOffset) && task.pattern[dateIdx]
                          );
                          
                          const hours = getDailyHours(member.name, hasWork);
                          
                          return (
                            <div key={dateIdx} className={`h-4 sm:h-6 rounded flex items-center justify-center text-xs font-semibold ${
                              hours === 0 ? 'bg-gray-100 text-gray-400' :
                              hours > 8 ? 'bg-red-500 text-white' :
                              hours > 6 ? 'bg-orange-500 text-white' :
                              'bg-green-500 text-white'
                            }`}>
                              <span className="hidden sm:inline">{hours === 0 ? '—' : `${hours}h`}</span>
                              <span className="sm:hidden">{hours === 0 ? '—' : hours}</span>
                            </div>
                          );
                        })
                      }
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setSelectedTask(null)}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${selectedTask.color}`}></div>
                  <div>
                    <h2 className="text-lg font-semibold">{selectedTask.project}</h2>
                    <p className="text-gray-600 text-sm">
                      <span className="font-medium">{selectedTask.activity}</span>
                      <span className="text-gray-400 mx-2">→</span>
                      <span>{selectedTask.task}</span>
                    </p>
                  </div>
                </div>
                <button onClick={() => setSelectedTask(null)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
              </div>

              <div className="space-y-4 sm:space-y-6">
                <div>
                  <label className="text-sm font-medium text-gray-700">Assigned to</label>
                  <p className="text-gray-900">{selectedTask.memberName}</p>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="bg-blue-50 p-3 rounded">
                    <div className="text-xs text-blue-700">Estimated</div>
                    <div className="text-lg font-bold text-blue-900">{selectedTask.estimatedHours}h</div>
                  </div>
                  <div className="bg-green-50 p-3 rounded">
                    <div className="text-xs text-green-700">Actual</div>
                    <div className="text-lg font-bold text-green-900">{selectedTask.actualHours}h</div>
                  </div>
                  <div className="bg-orange-50 p-3 rounded">
                    <div className="text-xs text-orange-700">Remaining</div>
                    <div className="text-lg font-bold text-orange-900">{getRemainingHours(selectedTask)}h</div>
                  </div>
                </div>

                <div>
                  <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${getTaskStatusColor(selectedTask.status)}`}>
                    {selectedTask.status.toUpperCase()}
                  </span>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button onClick={() => setSelectedTask(null)} className="px-4 py-2 border rounded hover:bg-gray-50">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Task Assignment Modal */}
      {showAssignTaskModal && selectedMemberForAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowAssignTaskModal(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full max-h-screen overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Assign Task to {selectedMemberForAssignment.name}</h2>
                <button onClick={() => setShowAssignTaskModal(false)} className="text-gray-400 hover:text-gray-600 text-xl">✕</button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const taskData = {
                  project: formData.get('project'),
                  activity: formData.get('activity'),
                  task: formData.get('task'),
                  estimatedHours: parseInt(formData.get('estimatedHours')),
                  startDate: formData.get('startDate'),
                  endDate: formData.get('endDate'),
                  priority: formData.get('priority'),
                  description: formData.get('description')
                };
                submitTaskAssignment(taskData);
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                    <select 
                      name="project" 
                      required 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      onChange={(e) => {
                        const project = e.target.value;
                        const activitySelect = document.querySelector('select[name="activity"]');
                        const taskSelect = document.querySelector('select[name="task"]');
                        
                        activitySelect.innerHTML = '<option value="">Select Activity</option>';
                        taskSelect.innerHTML = '<option value="">Select Task</option>';
                        
                        if (project && projectStructure[project]) {
                          Object.keys(projectStructure[project]).forEach(activity => {
                            const option = document.createElement('option');
                            option.value = activity;
                            option.textContent = activity;
                            activitySelect.appendChild(option);
                          });
                        }
                      }}
                    >
                      <option value="">Select Project</option>
                      {Object.keys(projectStructure).map(project => (
                        <option key={project} value={project}>{project}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Activity</label>
                    <select 
                      name="activity" 
                      required 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      onChange={(e) => {
                        const project = document.querySelector('select[name="project"]').value;
                        const activity = e.target.value;
                        const taskSelect = document.querySelector('select[name="task"]');
                        
                        taskSelect.innerHTML = '<option value="">Select Task</option>';
                        
                        if (project && activity && projectStructure[project][activity]) {
                          projectStructure[project][activity].forEach(task => {
                            const option = document.createElement('option');
                            option.value = task;
                            option.textContent = task;
                            taskSelect.appendChild(option);
                          });
                        }
                      }}
                    >
                      <option value="">Select Activity</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Task</label>
                      <select 
                        name="task"
                        required 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="">Select Task</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                      <select name="priority" required className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea 
                      name="description"
                      rows="3"
                      placeholder="Task requirements..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start</label>
                      <input 
                        type="date" 
                        name="startDate"
                        required 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End</label>
                      <input 
                        type="date" 
                        name="endDate"
                        required 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                  </div>

                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-gray-700 mb-2">Current Capacity</div>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm space-y-1 sm:space-y-0">
                      <span>Current: {selectedMemberForAssignment.scheduled}h / {selectedMemberForAssignment.capacity}h</span>
                      <span className={`font-medium ${
                        selectedMemberForAssignment.utilization > 100 ? 'text-red-600' :
                        selectedMemberForAssignment.utilization > 85 ? 'text-orange-600' : 'text-green-600'
                      }`}>
                        {selectedMemberForAssignment.utilization}% utilized
                      </span>
                    </div>
                    {selectedMemberForAssignment.utilization > 85 && (
                      <div className="text-xs text-orange-600 mt-1 flex items-center">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        High utilization - consider workload balance
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-6">
                  <button 
                    type="button"
                    onClick={() => setShowAssignTaskModal(false)}
                    className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700"
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

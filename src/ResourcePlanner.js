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

  // Fixed daily hours for each team member
  const getDailyHours = (memberName, hasWork) => {
    if (!hasWork) return 0;
    
    const hoursMap = {
      'Sarah Kim': 11,      // RED
      'Andoni Sanchez': 12, // RED
      'Dr. Raj Patel': 8,   // ORANGE
      'Marcus Chen': 7,     // ORANGE
      'Alejandro Rosales': 6.5, // ORANGE
      'Lisa Zhang': 5,      // GREEN
      'Jennifer Lee': 4,    // GREEN
      'Dr. Elena Rodriguez': 3, // GREEN
      'Carlos Zamora': 2    // GREEN
    };
    
    return hoursMap[memberName] || 4;
  };

  const getDateRangeLabel = () => {
    if (selectedView === 'year') {
      return '2025';
    }
    if (selectedView === 'quarter') {
      const quarters = ['Q1 2025 (Jan-Mar)', 'Q2 2025 (Apr-Jun)', 'Q3 2025 (Jul-Sep)', 'Q4 2025 (Oct-Dec)'];
      const quarterIndex = Math.max(0, Math.min(3, Math.floor(currentWeekOffset / 13) + 3)); // Q4 as default
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
      // Year view - return 12 months
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
      // Quarter view - return 3 months
      return [
        { month: 'Oct', label: 'October', isCurrentMonth: false, monthNum: 10 },
        { month: 'Nov', label: 'November', isCurrentMonth: false, monthNum: 11 },
        { month: 'Dec', label: 'December', isCurrentMonth: true, monthNum: 12 }
      ];
    }
    if (selectedView === 'month') {
      // Month view - return 5 weeks
      return [
        { week: 'Week 1', label: 'Dec 1-7', isCurrentWeek: false, weekNum: 1 },
        { week: 'Week 2', label: 'Dec 8-14', isCurrentWeek: true, weekNum: 2 },
        { week: 'Week 3', label: 'Dec 15-21', isCurrentWeek: false, weekNum: 3 },
        { week: 'Week 4', label: 'Dec 22-28', isCurrentWeek: false, weekNum: 4 },
        { week: 'Week 5', label: 'Dec 29-31', isCurrentWeek: false, weekNum: 5 }
      ];
    }
    
    // Week view
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
    
    const recentWeeks = task.velocityHistory.slice(-4); // Last 4 weeks
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
    if (ratio >= 1.1) return 'text-green-600'; // 10% ahead
    if (ratio >= 0.9) return 'text-blue-600';  // Within 10%
    if (ratio >= 0.7) return 'text-orange-600'; // 30% behind
    return 'text-red-600'; // More than 30% behind
  };

  const getVelocityIcon = (velocity) => {
    if (!velocity) return '📊';
    
    const ratio = velocity.currentVelocity / velocity.targetVelocity;
    if (ratio >= 1.1) return '🚀'; // Ahead
    if (ratio >= 0.9) return '✅'; // On track
    if (ratio >= 0.7) return '⚠️'; // At risk
    return '🚨'; // Behind
  };

  // Task assignment functions
  const handleAssignTask = (member) => {
    setSelectedMemberForAssignment(member);
    setShowAssignTaskModal(true);
  };

  const submitTaskAssignment = (taskData) => {
    // In a real app, this would make an API call
    console.log('Assigning task:', taskData, 'to:', selectedMemberForAssignment.name);
    setShowAssignTaskModal(false);
    setSelectedMemberForAssignment(null);
    // Here you would update the team member's tasks in state/database
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
          task: 'Core Architecture',
          color: 'bg-purple-600',
          estimatedHours: 200,
          actualHours: 85,
          status: 'in-progress',
          startWeek: -8,
          endWeek: 24, // 32 weeks total (8 months)
          pattern: [true, true, false, false, true, true, false, true, true],
          isLongTerm: true,
          totalProjectHours: 500,
          projectTeam: ['Alejandro Rosales', 'Sarah Kim', 'Dr. Raj Patel'],
          // Velocity tracking data
          targetHoursPerWeek: 6.25, // 200 hours / 32 weeks
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
        },
        {
          project: 'FoodSafeR',
          task: 'API Maintenance',
          color: 'bg-blue-500',
          estimatedHours: 24,
          actualHours: 18,
          status: 'in-progress',
          startWeek: -1,
          endWeek: 1,
          pattern: [false, true, false, false, false, true, true, false, false],
          isLongTerm: false
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
          task: 'ML Algorithms',
          color: 'bg-purple-600',
          estimatedHours: 200,
          actualHours: 120,
          status: 'in-progress',
          startWeek: -8,
          endWeek: 24, // 32 weeks total
          pattern: [true, true, false, false, true, true, true, true, true],
          isLongTerm: true,
          totalProjectHours: 500,
          projectTeam: ['Alejandro Rosales', 'Sarah Kim', 'Dr. Raj Patel'],
          // Velocity tracking for Sarah
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
          ],
          milestones: [
            { name: 'ML Model Design', targetDate: '2025-01-15', status: 'completed', targetHours: 40 },
            { name: 'Algorithm Implementation', targetDate: '2025-03-15', status: 'in-progress', targetHours: 100 },
            { name: 'Model Training & Tuning', targetDate: '2025-05-15', status: 'planned', targetHours: 60 }
          ]
        },
        {
          project: 'ENERGIZE',
          task: 'Mobile App',
          color: 'bg-teal-500',
          estimatedHours: 50,
          actualHours: 28,
          status: 'in-progress',
          startWeek: -1,
          endWeek: 2,
          pattern: [true, true, false, false, true, true, true, true, true],
          isLongTerm: false
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
          task: 'Data Pipeline',
          color: 'bg-purple-600',
          estimatedHours: 100,
          actualHours: 45,
          status: 'in-progress',
          startWeek: -4,
          endWeek: 16, // 20 weeks total
          pattern: [true, true, false, false, true, true, true, true, false],
          isLongTerm: true,
          totalProjectHours: 500,
          projectTeam: ['Alejandro Rosales', 'Sarah Kim', 'Dr. Raj Patel'],
          // Velocity tracking for Dr. Raj
          targetHoursPerWeek: 5, // 100 hours / 20 weeks
          velocityHistory: [
            { week: -4, hoursLogged: 6 },
            { week: -3, hoursLogged: 4 },
            { week: -2, hoursLogged: 7 },
            { week: -1, hoursLogged: 5 },
            { week: 0, hoursLogged: 3 }
          ],
          milestones: [
            { name: 'Data Architecture', targetDate: '2025-01-01', status: 'completed', targetHours: 25 },
            { name: 'Pipeline Development', targetDate: '2025-03-01', status: 'in-progress', targetHours: 50 },
            { name: 'Integration & Testing', targetDate: '2025-05-01', status: 'planned', targetHours: 25 }
          ]
        },
        {
          project: 'H20forALL',
          task: 'ML Models',
          color: 'bg-cyan-500',
          estimatedHours: 45,
          actualHours: 24,
          status: 'in-progress',
          startWeek: -1,
          endWeek: 2,
          pattern: [true, true, false, false, true, true, true, true, true],
          isLongTerm: false
        }
      ]
    },
    {
      id: 4,
      name: 'Dr. Elena Rodriguez',
      avatar: '👩‍🔬',
      department: 'Research',
      capacity: 40,
      scheduled: 16,
      utilization: 40,
      tasks: [
        {
          project: 'BIORADAR',
          task: 'Clinical Studies',
          color: 'bg-green-500',
          estimatedHours: 16,
          actualHours: 12,
          status: 'in-progress',
          startWeek: 0,
          endWeek: 2,
          pattern: [false, true, false, false, true, false, true, false, false],
          isLongTerm: false
        },
        // Add a long-term research project that's behind schedule
        {
          project: 'BIORADAR',
          task: 'Long-term Research Analysis',
          color: 'bg-emerald-600',
          estimatedHours: 120,
          actualHours: 25,
          status: 'in-progress',
          startWeek: -6,
          endWeek: 18, // 24 weeks total
          pattern: [false, true, false, false, true, false, true, false, false],
          isLongTerm: true,
          totalProjectHours: 200,
          projectTeam: ['Dr. Elena Rodriguez', 'Marcus Chen'],
          // Behind schedule velocity
          targetHoursPerWeek: 5, // 120 hours / 24 weeks
          velocityHistory: [
            { week: -6, hoursLogged: 4 },
            { week: -5, hoursLogged: 2 },
            { week: -4, hoursLogged: 3 },
            { week: -3, hoursLogged: 1 },
            { week: -2, hoursLogged: 2 },
            { week: -1, hoursLogged: 3 },
            { week: 0, hoursLogged: 2 }
          ],
          milestones: [
            { name: 'Literature Review', targetDate: '2024-12-15', status: 'completed', targetHours: 30 },
            { name: 'Data Collection', targetDate: '2025-02-15', status: 'in-progress', targetHours: 50 },
            { name: 'Analysis & Report', targetDate: '2025-05-15', status: 'planned', targetHours: 40 }
          ]
        }
      ]
    },
    {
      id: 5,
      name: 'Marcus Chen',
      avatar: '👨‍💻',
      department: 'Engineering',
      capacity: 40,
      scheduled: 36,
      utilization: 90,
      tasks: [
        {
          project: 'BIORADAR',
          task: 'Backend Infrastructure',
          color: 'bg-emerald-500',
          estimatedHours: 32,
          actualHours: 20,
          status: 'in-progress',
          startWeek: 0,
          endWeek: 2,
          pattern: [true, true, false, false, true, true, true, false, true],
          isLongTerm: false
        },
        // Add a struggling long-term project
        {
          project: 'Legacy System Migration',
          task: 'Database Migration',
          color: 'bg-red-600',
          estimatedHours: 160,
          actualHours: 35,
          status: 'in-progress',
          startWeek: -10,
          endWeek: 14, // 24 weeks total
          pattern: [true, false, false, false, true, false, true, false, false],
          isLongTerm: true,
          totalProjectHours: 300,
          projectTeam: ['Marcus Chen', 'Carlos Zamora'],
          // Severely behind schedule
          targetHoursPerWeek: 6.67, // 160 hours / 24 weeks
          velocityHistory: [
            { week: -10, hoursLogged: 8 },
            { week: -9, hoursLogged: 5 },
            { week: -8, hoursLogged: 3 },
            { week: -7, hoursLogged: 2 },
            { week: -6, hoursLogged: 4 },
            { week: -5, hoursLogged: 1 },
            { week: -4, hoursLogged: 2 },
            { week: -3, hoursLogged: 3 },
            { week: -2, hoursLogged: 2 },
            { week: -1, hoursLogged: 1 },
            { week: 0, hoursLogged: 4 }
          ],
          milestones: [
            { name: 'Schema Analysis', targetDate: '2024-11-01', status: 'completed', targetHours: 40 },
            { name: 'Data Migration Scripts', targetDate: '2025-01-15', status: 'in-progress', targetHours: 80 },
            { name: 'Testing & Validation', targetDate: '2025-04-01', status: 'planned', targetHours: 40 }
          ]
        }
      ]
    },
    {
      id: 6,
      name: 'Carlos Zamora',
      avatar: '👨‍🎯',
      department: 'Operations',
      capacity: 40,
      scheduled: 12,
      utilization: 30,
      tasks: [
        {
          project: 'Infrastructure',
          task: 'System Integration',
          color: 'bg-gray-500',
          estimatedHours: 12,
          actualHours: 8,
          status: 'in-progress',
          startWeek: 0,
          endWeek: 1,
          pattern: [false, true, false, false, false, false, true, false, false],
          isLongTerm: false
        },
        // Add a long-term project that's at risk
        {
          project: 'Process Automation',
          task: 'Workflow Optimization',
          color: 'bg-yellow-600',
          estimatedHours: 80,
          actualHours: 30,
          status: 'in-progress',
          startWeek: -8,
          endWeek: 12, // 20 weeks total
          pattern: [false, true, false, false, false, false, true, false, false],
          isLongTerm: true,
          totalProjectHours: 150,
          projectTeam: ['Carlos Zamora', 'Dr. Elena Rodriguez'],
          // At risk - slightly behind
          targetHoursPerWeek: 4, // 80 hours / 20 weeks
          velocityHistory: [
            { week: -8, hoursLogged: 5 },
            { week: -7, hoursLogged: 4 },
            { week: -6, hoursLogged: 3 },
            { week: -5, hoursLogged: 2 },
            { week: -4, hoursLogged: 4 },
            { week: -3, hoursLogged: 3 },
            { week: -2, hoursLogged: 2 },
            { week: -1, hoursLogged: 3 },
            { week: 0, hoursLogged: 3 }
          ],
          milestones: [
            { name: 'Current State Analysis', targetDate: '2024-11-15', status: 'completed', targetHours: 20 },
            { name: 'Process Redesign', targetDate: '2025-02-01', status: 'in-progress', targetHours: 40 },
            { name: 'Implementation', targetDate: '2025-04-15', status: 'planned', targetHours: 20 }
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

  // Get available departments for the selector
  const availableDepartments = Object.keys(departmentGroups);
  
  // Filter departments based on selection
  const filteredDepartmentGroups = selectedDepartment === 'all' 
    ? departmentGroups 
    : { [selectedDepartment]: departmentGroups[selectedDepartment] };

  // Calculate total filtered team members
  const filteredTeamCount = Object.values(filteredDepartmentGroups).flat().length;

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

      {/* Task Assignment Modal */}
      {showAssignTaskModal && selectedMemberForAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowAssignTaskModal(false)}>
          <div className="bg-white rounded-lg shadow-xl max-w-lg w-full m-4" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Assign Task to {selectedMemberForAssignment.name}</h2>
                <button onClick={() => setShowAssignTaskModal(false)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>

              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                const taskData = {
                  project: formData.get('project'),
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
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Project</label>
                      <select name="project" required className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                        <option value="">Select Project</option>
                        <option value="AI Platform">AI Platform</option>
                        <option value="BIORADAR">BIORADAR</option>
                        <option value="ENERGIZE">ENERGIZE</option>
                        <option value="H20forALL">H20forALL</option>
                        <option value="FoodSafeR">FoodSafeR</option>
                        <option value="Legacy System Migration">Legacy System Migration</option>
                        <option value="Process Automation">Process Automation</option>
                        <option value="Infrastructure">Infrastructure</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                      <select name="priority" required className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                        <option value="low">Low</option>
                        <option value="medium" selected>Medium</option>
                        <option value="high">High</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Task Name</label>
                    <input 
                      type="text" 
                      name="task"
                      required 
                      placeholder="e.g., Frontend Development, Data Analysis..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea 
                      name="description"
                      rows="3"
                      placeholder="Task details and requirements..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    ></textarea>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Hours</label>
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                      <input 
                        type="date" 
                        name="startDate"
                        required 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                      <input 
                        type="date" 
                        name="endDate"
                        required 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                  </div>

                  {/* Capacity Check */}
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-gray-700 mb-2">Current Capacity</div>
                    <div className="flex items-center justify-between text-sm">
                      <span>Current allocation: {selectedMemberForAssignment.scheduled}h / {selectedMemberForAssignment.capacity}h</span>
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
                        This person is already highly utilized. Consider workload balance.
                      </div>
                    )}
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
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="bg-white border-b border-gray-200 px-6">
        <div className="flex space-x-8">
          <button className="py-3 px-1 border-b-2 border-blue-500 text-blue-600 font-medium text-sm">Resource Planner</button>
          <button className="py-3 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm">Gantt</button>
          <button className="py-3 px-1 border-b-2 border-transparent text-gray-500 hover:text-gray-700 font-medium text-sm">My Tasks</button>
        </div>
      </div>

      {/* Date Headers */}
      <div className="bg-white border-b border-gray-200 px-4 py-2">
        <div className="flex items-stretch">
          <div style={{ width: '280px' }} className="flex-shrink-0"></div>
          <div className={`flex-1 ${
            selectedView === 'year' ? 'grid grid-cols-12 gap-2' :
            selectedView === 'quarter' ? 'grid grid-cols-3 gap-4' :
            selectedView === 'month' ? 'grid grid-cols-5 gap-3' : 
            'grid grid-cols-9 gap-2'
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
                          <div style={{ width: '280px' }} className="flex-shrink-0">
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
                                <div className="text-xs text-gray-600 mb-1">{task.task}</div>
                                
                                {/* Enhanced progress display for long-term tasks */}
                                {task.isLongTerm ? (
                                  <div className="space-y-1">
                                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                                      <span className="font-medium">{task.actualHours}h / {task.estimatedHours}h personal</span>
                                      <span>•</span>
                                      <span className="text-purple-600">
                                        {task.totalProjectHours}h total project
                                      </span>
                                    </div>
                                    
                                    {/* Velocity tracking display */}
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
                                    
                                    {/* Projected completion */}
                                    {(() => {
                                      const velocity = calculateVelocity(task);
                                      return velocity ? (
                                        <div className="flex items-center space-x-2 text-xs">
                                          <span className="text-gray-500">ETC:</span>
                                          <span className={`font-medium ${
                                            velocity.projectedCompletion.includes('late') ? 'text-red-600' : 
                                            velocity.projectedCompletion.includes('On time') ? 'text-green-600' : 'text-gray-600'
                                          }`}>
                                            {velocity.projectedCompletion}
                                          </span>
                                        </div>
                                      ) : null;
                                    })()}
                                    
                                    <div className="flex items-center space-x-2 text-xs">
                                      <span className="text-gray-500">Team:</span>
                                      <span className="text-gray-600">{task.projectTeam.join(', ')}</span>
                                    </div>
                                    {/* Progress bar for personal allocation */}
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
                              weekDates.map((month, dateIdx) => {
                                // For year view, show if task spans this month
                                const taskStartMonth = Math.max(1, Math.min(12, 12 + (task.startWeek / 4.33))); // Rough week to month conversion
                                const taskEndMonth = Math.max(1, Math.min(12, 12 + (task.endWeek / 4.33)));
                                const isTaskActiveInMonth = month.monthNum >= taskStartMonth && month.monthNum <= taskEndMonth;
                                
                                return (
                                  <div key={dateIdx} className={`h-6 rounded ${
                                    isTaskActiveInMonth ? `${task.color} opacity-60` : 'bg-gray-100'
                                  } ${month.isCurrentMonth ? 'ring-1 ring-blue-400' : ''}`}></div>
                                );
                              }) :
                              selectedView === 'quarter' ? 
                              weekDates.map((month, dateIdx) => {
                                // For quarter view, show if task spans this month
                                const taskStartMonth = Math.max(1, Math.min(12, 12 + (task.startWeek / 4.33)));
                                const taskEndMonth = Math.max(1, Math.min(12, 12 + (task.endWeek / 4.33)));
                                const isTaskActiveInMonth = month.monthNum >= taskStartMonth && month.monthNum <= taskEndMonth;
                                
                                return (
                                  <div key={dateIdx} className={`h-6 rounded ${
                                    isTaskActiveInMonth ? `${task.color} opacity-70` : 'bg-gray-100'
                                  } ${month.isCurrentMonth ? 'ring-1 ring-blue-400' : ''}`}></div>
                                );
                              }) :
                              selectedView === 'month' ? 
                              weekDates.map((week, dateIdx) => {
                                const isTaskActiveInWeek = task.startWeek <= week.weekNum && task.endWeek >= week.weekNum;
                                return (
                                  <div key={dateIdx} className={`h-6 rounded ${
                                    isTaskActiveInWeek ? `${task.color} opacity-80` : 'bg-gray-100'
                                  } ${week.isCurrentWeek ? 'ring-1 ring-blue-400' : ''}`}></div>
                                );
                              }) :
                              weekDates.map((date, dateIdx) => (
                                <div key={dateIdx} className={`h-6 rounded ${
                                  date.isWeekend ? 'bg-gray-100' : 
                                  task.pattern[dateIdx] ? `${task.color} opacity-80` : 'bg-gray-100'
                                }`}></div>
                              ))
                            }
                          </div>
                        </div>
                      );
                    })}
                    
                    {/* Workload summary - ADAPTIVE LABEL */}
                    <div className="flex items-center bg-blue-50 border-2 border-blue-200 rounded p-2">
                      <div style={{ width: '280px' }} className="flex-shrink-0">
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
                          weekDates.map((month, dateIdx) => {
                            // For year view, show monthly workload summary
                            const hasWork = member.tasks.some(task => {
                              const taskStartMonth = Math.max(1, Math.min(12, 12 + (task.startWeek / 4.33)));
                              const taskEndMonth = Math.max(1, Math.min(12, 12 + (task.endWeek / 4.33)));
                              return isTaskActive(task, currentWeekOffset) && month.monthNum >= taskStartMonth && month.monthNum <= taskEndMonth;
                            });
                            
                            const monthlyHours = hasWork ? getDailyHours(member.name, true) * 22 : 0; // ~22 work days per month
                            
                            return (
                              <div key={dateIdx} className={`h-6 rounded flex items-center justify-center text-xs font-semibold ${
                                monthlyHours === 0 ? 'bg-gray-100 text-gray-400' :
                                monthlyHours > 160 ? 'bg-red-500 text-white' :
                                monthlyHours > 120 ? 'bg-orange-500 text-white' :
                                'bg-green-500 text-white'
                              } ${month.isCurrentMonth ? 'ring-1 ring-blue-400' : ''}`}>
                                {monthlyHours === 0 ? '—' : `${Math.round(monthlyHours)}h`}
                              </div>
                            );
                          }) :
                          selectedView === 'quarter' ?
                          weekDates.map((month, dateIdx) => {
                            // For quarter view, show monthly workload
                            const hasWork = member.tasks.some(task => {
                              const taskStartMonth = Math.max(1, Math.min(12, 12 + (task.startWeek / 4.33)));
                              const taskEndMonth = Math.max(1, Math.min(12, 12 + (task.endWeek / 4.33)));
                              return isTaskActive(task, currentWeekOffset) && month.monthNum >= taskStartMonth && month.monthNum <= taskEndMonth;
                            });
                            
                            const monthlyHours = hasWork ? getDailyHours(member.name, true) * 22 : 0; // ~22 work days per month
                            
                            return (
                              <div key={dateIdx} className={`h-6 rounded flex items-center justify-center text-xs font-semibold ${
                                monthlyHours === 0 ? 'bg-gray-100 text-gray-400' :
                                monthlyHours > 160 ? 'bg-red-500 text-white' :
                                monthlyHours > 120 ? 'bg-orange-500 text-white' :
                                'bg-green-500 text-white'
                              } ${month.isCurrentMonth ? 'ring-1 ring-blue-400' : ''}`}>
                                {monthlyHours === 0 ? '—' : `${Math.round(monthlyHours)}h`}
                              </div>
                            );
                          }) :
                          selectedView === 'month' ?
                          weekDates.map((week, dateIdx) => {
                            // For month view, show weekly totals
                            const hasWork = member.tasks.some(task => 
                              isTaskActive(task, currentWeekOffset) && task.startWeek <= week.weekNum && task.endWeek >= week.weekNum
                            );
                            
                            const weeklyHours = hasWork ? getDailyHours(member.name, true) * 5 : 0; // 5 work days
                            
                            return (
                              <div key={dateIdx} className={`h-6 rounded flex items-center justify-center text-xs font-semibold ${
                                weeklyHours === 0 ? 'bg-gray-100 text-gray-400' :
                                weeklyHours > 40 ? 'bg-red-500 text-white' :
                                weeklyHours > 30 ? 'bg-orange-500 text-white' :
                                'bg-green-500 text-white'
                              } ${week.isCurrentWeek ? 'ring-1 ring-blue-400' : ''}`}>
                                {weeklyHours === 0 ? '—' : `${weeklyHours}h`}
                              </div>
                            );
                          }) :
                          weekDates.map((date, dateIdx) => {
                            if (date.isWeekend) {
                              return (
                                <div key={dateIdx} className="h-6 rounded bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-semibold">
                                  —
                                </div>
                              );
                            }
                            
                            const hasWork = member.tasks.some(task => 
                              isTaskActive(task, currentWeekOffset) && task.pattern[dateIdx]
                            );
                            
                            const hours = getDailyHours(member.name, hasWork);
                            
                            return (
                              <div key={dateIdx} className={`h-6 rounded flex items-center justify-center text-xs font-semibold ${
                                hours === 0 ? 'bg-gray-100 text-gray-400' :
                                hours > 8 ? 'bg-red-500 text-white' :
                                hours > 6 ? 'bg-orange-500 text-white' :
                                'bg-green-500 text-white'
                              }`}>
                                {hours === 0 ? '—' : `${hours}h`}
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

      {/* Task Detail Modal */}
      {selectedTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedTask(null)}>
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full m-4" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className={`w-4 h-4 rounded-full ${selectedTask.color}`}></div>
                  <div>
                    <h2 className="text-lg font-semibold">{selectedTask.project}</h2>
                    <p className="text-gray-600">{selectedTask.task}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedTask(null)} className="text-gray-400 hover:text-gray-600">✕</button>
              </div>

              <div className="space-y-6">
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

                {/* Velocity information for long-term tasks */}
                {selectedTask.isLongTerm && (() => {
                  const velocity = calculateVelocity(selectedTask);
                  return velocity ? (
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <h3 className="text-sm font-semibold text-purple-900 mb-3">📊 Velocity Tracking</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-xs text-purple-700">Current Velocity</div>
                          <div className={`text-lg font-bold ${getVelocityStatusColor(velocity)}`}>
                            {getVelocityIcon(velocity)} {velocity.currentVelocity.toFixed(1)}h/week
                          </div>
                          <div className="text-xs text-purple-600">Target: {velocity.targetVelocity}h/week</div>
                        </div>
                        <div>
                          <div className="text-xs text-purple-700">Projected Completion</div>
                          <div className={`text-sm font-medium ${
                            velocity.projectedCompletion.includes('late') ? 'text-red-600' : 
                            velocity.projectedCompletion.includes('On time') ? 'text-green-600' : 'text-gray-600'
                          }`}>
                            {velocity.projectedCompletion}
                          </div>
                        </div>
                      </div>
                      
                      {/* Recent velocity history */}
                      <div className="mt-4">
                        <div className="text-xs text-purple-700 mb-2">Recent Velocity (Last 4 weeks)</div>
                        <div className="flex space-x-1">
                          {selectedTask.velocityHistory?.slice(-4).map((week, idx) => (
                            <div key={idx} className="flex-1">
                              <div className="bg-purple-200 rounded-t h-12 flex items-end">
                                <div 
                                  className={`w-full rounded-t ${
                                    week.hoursLogged >= selectedTask.targetHoursPerWeek ? 'bg-green-400' : 
                                    week.hoursLogged >= selectedTask.targetHoursPerWeek * 0.8 ? 'bg-yellow-400' : 'bg-red-400'
                                  }`}
                                  style={{ 
                                    height: `${Math.min((week.hoursLogged / Math.max(selectedTask.targetHoursPerWeek, 10)) * 100, 100)}%` 
                                  }}
                                ></div>
                              </div>
                              <div className="text-xs text-center text-purple-600 mt-1">
                                W{week.week >= 0 ? '+' : ''}{week.week}
                              </div>
                              <div className="text-xs text-center font-medium text-purple-800">
                                {week.hoursLogged}h
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : null;
                })()}

                {/* Milestones for long-term tasks */}
                {selectedTask.milestones && (
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-sm font-semibold text-gray-900 mb-3">🎯 Milestones</h3>
                    <div className="space-y-2">
                      {selectedTask.milestones.map((milestone, idx) => (
                        <div key={idx} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className={`w-2 h-2 rounded-full ${
                              milestone.status === 'completed' ? 'bg-green-500' :
                              milestone.status === 'in-progress' ? 'bg-blue-500' : 'bg-gray-300'
                            }`}></span>
                            <span className="text-sm text-gray-700">{milestone.name}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {milestone.targetDate} • {milestone.targetHours}h
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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
    </div>
  );
};

export default ResourcePlanner;

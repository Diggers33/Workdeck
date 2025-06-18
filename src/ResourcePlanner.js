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
  const [showSpreadsheetView, setShowSpreadsheetView] = useState(false);
  const [editingCell, setEditingCell] = useState(null);
  const [showPhaseTemplates, setShowPhaseTemplates] = useState(false);
  const [selectedMemberForTemplate, setSelectedMemberForTemplate] = useState(null);
  const [spreadsheetView, setSpreadsheetView] = useState('month'); // 'week', 'month', 'quarter', 'year'
  
  // Sample spreadsheet data (hours per week for each month) - Updated for 40h work week
  const [spreadsheetData, setSpreadsheetData] = useState({
    1: { 0: 20, 1: 20, 2: 0, 3: 0, 4: 0, 5: 15, 6: 15, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0 },
    2: { 0: 25, 1: 25, 2: 25, 3: 0, 4: 0, 5: 0, 6: 30, 7: 30, 8: 0, 9: 0, 10: 0, 11: 0 },
    3: { 0: 15, 1: 15, 2: 15, 3: 15, 4: 0, 5: 0, 6: 0, 7: 0, 8: 20, 9: 20, 10: 0, 11: 0 }
  });

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

  const calculateVelocity = (task) => {
    if (!task.velocityHistory || task.velocityHistory.length < 2) return null;
    
    const recentWeeks = task.velocityHistory.slice(-4);
    const avgWeeklyHours = recentWeeks.reduce((sum, week) => sum + week.hoursLogged, 0) / recentWeeks.length;
    
    return {
      currentVelocity: avgWeeklyHours,
      targetVelocity: task.targetHoursPerWeek || 0,
      velocityTrend: avgWeeklyHours >= task.targetHoursPerWeek ? 'ahead' : 'behind'
    };
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

  // Spreadsheet functions
  const handleCellEdit = (memberId, columnIndex, value) => {
    const numValue = parseFloat(value) || 0;
    
    // For now, we'll only allow editing in month view to keep data consistency
    if (spreadsheetView === 'month') {
      setSpreadsheetData(prev => ({
        ...prev,
        [memberId]: {
          ...prev[memberId],
          [columnIndex]: Math.max(0, Math.min(2000, numValue))
        }
      }));
    }
  };

  const getCellColor = (hours) => {
    if (hours === 0) return 'bg-gray-100 text-gray-400';
    
    if (spreadsheetView === 'week') {
      // Weekly hours: 0-40h per week
      if (hours <= 10) return 'bg-blue-100 text-blue-800';      // Light: 1-10h/week
      if (hours <= 20) return 'bg-green-100 text-green-800';    // Moderate: 11-20h/week  
      if (hours <= 30) return 'bg-yellow-100 text-yellow-800';  // Heavy: 21-30h/week
      if (hours <= 40) return 'bg-orange-100 text-orange-800';  // Full-time: 31-40h/week
      return 'bg-red-100 text-red-800';                         // Overload: 40h+/week
    } else if (spreadsheetView === 'month') {
      // Monthly total hours: 0-173h (40h/week × 4.33 weeks)
      if (hours <= 43) return 'bg-blue-100 text-blue-800';      // ~10h/week
      if (hours <= 87) return 'bg-green-100 text-green-800';    // ~20h/week
      if (hours <= 130) return 'bg-yellow-100 text-yellow-800'; // ~30h/week
      if (hours <= 173) return 'bg-orange-100 text-orange-800'; // ~40h/week
      return 'bg-red-100 text-red-800';                         // Over full-time
    } else if (spreadsheetView === 'quarter') {
      // Quarterly total hours: 0-520h (40h/week × 13 weeks)
      if (hours <= 130) return 'bg-blue-100 text-blue-800';     // Light quarterly load
      if (hours <= 260) return 'bg-green-100 text-green-800';   // Moderate quarterly load
      if (hours <= 390) return 'bg-yellow-100 text-yellow-800'; // Heavy quarterly load
      if (hours <= 520) return 'bg-orange-100 text-orange-800'; // Full quarterly load
      return 'bg-red-100 text-red-800';                         // Overload
    } else if (spreadsheetView === 'year') {
      // Annual total hours: 0-2080h (40h/week × 52 weeks)
      if (hours <= 520) return 'bg-blue-100 text-blue-800';     // Light annual load
      if (hours <= 1040) return 'bg-green-100 text-green-800';  // Moderate annual load
      if (hours <= 1560) return 'bg-yellow-100 text-yellow-800'; // Heavy annual load
      if (hours <= 2080) return 'bg-orange-100 text-orange-800'; // Full annual load
      return 'bg-red-100 text-red-800';                         // Overload
    }
    
    return 'bg-gray-100 text-gray-400';
  };

  const getMonthlyTotal = (month) => {
    return teamMembers.reduce((total, member) => {
      return total + (spreadsheetData[member.id]?.[month] || 0);
    }, 0);
  };

  const getMemberTotal = (memberId) => {
    const memberData = spreadsheetData[memberId] || {};
    return Object.values(memberData).reduce((sum, hours) => sum + hours, 0);
  };

  const phaseTemplates = [
    {
      name: "2-Month Sprint + 3-Month Break + 2-Month Sprint",
      description: "Work intensively, then break, then final push",
      pattern: [25, 25, 0, 0, 0, 20, 20, 0, 0, 0, 0, 0],
      icon: "🚀"
    },
    {
      name: "Seasonal Work (Summer Focus)",
      description: "Light work, then summer intensive, then light",
      pattern: [10, 10, 10, 10, 10, 30, 30, 30, 10, 10, 10, 10],
      icon: "☀️"
    },
    {
      name: "Academic Schedule",
      description: "Term work with holiday breaks",
      pattern: [20, 20, 20, 20, 0, 0, 0, 20, 20, 20, 20, 0],
      icon: "🎓"
    },
    {
      name: "Quarterly Sprints",
      description: "3-month sprints with 1-month breaks",
      pattern: [20, 20, 20, 0, 20, 20, 20, 0, 20, 20, 20, 0],
      icon: "📅"
    },
    {
      name: "Steady Consistent Work",
      description: "Same hours every month",
      pattern: [20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20],
      icon: "⚡"
    }
  ];

  const applyTemplate = (memberId, template) => {
    setSpreadsheetData(prev => ({
      ...prev,
      [memberId]: {
        ...prev[memberId],
        ...template.pattern.reduce((acc, hours, month) => {
          acc[month] = hours;
          return acc;
        }, {})
      }
    }));
    setShowPhaseTemplates(false);
    setSelectedMemberForTemplate(null);
  };

  const clearMemberSchedule = (memberId) => {
    setSpreadsheetData(prev => ({
      ...prev,
      [memberId]: Array.from({ length: 12 }, () => 0).reduce((acc, _, month) => {
        acc[month] = 0;
        return acc;
      }, {})
    }));
  };

  const detectPattern = (memberId) => {
    const memberData = spreadsheetData[memberId] || {};
    const pattern = Object.values(memberData);
    
    const workMonths = pattern.filter(h => h > 0).length;
    const breakMonths = pattern.filter(h => h === 0).length;
    
    if (workMonths <= 4 && breakMonths >= 6) return "Sprint-based with long breaks";
    if (workMonths >= 10) return "Consistent year-round work";
    if (workMonths >= 6 && workMonths <= 9) return "Seasonal work pattern";
    return "Custom pattern";
  };

  const getSpreadsheetColumns = () => {
    switch (spreadsheetView) {
      case 'week':
        return Array.from({ length: 52 }, (_, i) => `W${i + 1}`);
      case 'month':
        return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      case 'quarter':
        return ['Q1 2025', 'Q2 2025', 'Q3 2025', 'Q4 2025'];
      case 'year':
        return ['2025'];
      default:
        return months;
    }
  };

  const getSpreadsheetValue = (memberId, index) => {
    const memberData = spreadsheetData[memberId] || {};
    
    switch (spreadsheetView) {
      case 'week':
        // For weekly view, show the weekly rate for that specific week
        const monthIndex = Math.floor(index / 4.33); // ~4.33 weeks per month
        return memberData[monthIndex] || 0; // Same weekly rate throughout the month
        
      case 'month':
        // Month view shows TOTAL hours for the entire month (weekly rate × 4.33 weeks)
        const weeklyHours = memberData[index] || 0;
        return Math.round(weeklyHours * 4.33);
        
      case 'quarter':
        // Quarter view shows TOTAL hours across 3 months
        const quarterMonths = [
          [0, 1, 2], [3, 4, 5], [6, 7, 8], [9, 10, 11]
        ];
        const monthsInQuarter = quarterMonths[index] || [];
        return Math.round(monthsInQuarter.reduce((sum, monthIdx) => {
          const weeklyHours = memberData[monthIdx] || 0;
          return sum + (weeklyHours * 4.33); // Convert weekly to monthly total (4.33 weeks/month)
        }, 0));
        
      case 'year':
        // Year view shows TOTAL hours for entire year
        return Math.round(Object.values(memberData).reduce((sum, weeklyHours) => {
          return sum + (weeklyHours * 4.33); // Convert each month's weekly hours to monthly total
        }, 0));
        
      default:
        return memberData[index] || 0;
    }
  };

  const getColumnTotal = (index) => {
    return teamMembers.reduce((total, member) => {
      return total + getSpreadsheetValue(member.id, index);
    }, 0);
  };

  const getSpreadsheetLabel = () => {
    switch (spreadsheetView) {
      case 'week':
        return '52-Week Resource Planning';
      case 'month':
        return '12-Month Resource Planning';
      case 'quarter':
        return 'Quarterly Resource Planning';
      case 'year':
        return 'Annual Resource Planning';
      default:
        return '12-Month Resource Planning';
    }
  };

  const getUnitLabel = () => {
    switch (spreadsheetView) {
      case 'week':
        return 'hours per week';
      case 'month':
        return 'total hours for entire month';
      case 'quarter':
        return 'total hours for entire quarter';
      case 'year':
        return 'total hours for entire year';
      default:
        return 'hours per week';
    }
  };

  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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
          id: 1,
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
          ],
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
      id: 2,
      name: 'Sarah Kim',
      avatar: '👩‍💻',
      department: 'Engineering',
      capacity: 40,
      scheduled: 46,
      utilization: 115,
      tasks: [
        {
          id: 2,
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
          ],
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
          id: 3,
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
          ],
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

            <button 
              onClick={() => setShowSpreadsheetView(!showSpreadsheetView)} 
              className={`px-3 py-1.5 text-sm font-medium border rounded-md ${
                showSpreadsheetView 
                  ? 'bg-blue-600 text-white border-blue-600' 
                  : 'text-gray-700 bg-white border-gray-300 hover:bg-gray-50'
              }`}
            >
              📊 {showSpreadsheetView ? 'Timeline View' : 'Spreadsheet View'}
            </button>

            {showSpreadsheetView && (
              <div className="flex items-center space-x-1 border border-gray-300 rounded-md bg-white">
                <button 
                  onClick={() => setSpreadsheetView('week')}
                  className={`px-3 py-1 text-xs font-medium rounded-l-md ${
                    spreadsheetView === 'week' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Week View
                </button>
                <button 
                  onClick={() => setSpreadsheetView('month')}
                  className={`px-3 py-1 text-xs font-medium ${
                    spreadsheetView === 'month' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Month View
                </button>
                <button 
                  onClick={() => setSpreadsheetView('quarter')}
                  className={`px-3 py-1 text-xs font-medium ${
                    spreadsheetView === 'quarter' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Quarter View
                </button>
                <button 
                  onClick={() => setSpreadsheetView('year')}
                  className={`px-3 py-1 text-xs font-medium rounded-r-md ${
                    spreadsheetView === 'year' ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Year View
                </button>
              </div>
            )}

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
        {showSpreadsheetView ? (
          /* Spreadsheet View */
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{getSpreadsheetLabel()}</h2>
                  <p className="text-sm text-gray-600">Click cells to edit {getUnitLabel()}. Use templates for quick setup.</p>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gray-100 rounded"></div>
                    <span>0h</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-100 rounded"></div>
                    <span>{
                      spreadsheetView === 'year' ? '1-520h' : 
                      spreadsheetView === 'quarter' ? '1-130h' : 
                      spreadsheetView === 'month' ? '1-43h' :
                      '1-10h'
                    }</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-100 rounded"></div>
                    <span>{
                      spreadsheetView === 'year' ? '521-1040h' : 
                      spreadsheetView === 'quarter' ? '131-260h' : 
                      spreadsheetView === 'month' ? '44-87h' :
                      '11-20h'
                    }</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-yellow-100 rounded"></div>
                    <span>{
                      spreadsheetView === 'year' ? '1041-1560h' : 
                      spreadsheetView === 'quarter' ? '261-390h' : 
                      spreadsheetView === 'month' ? '88-130h' :
                      '21-30h'
                    }</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-orange-100 rounded"></div>
                    <span>{
                      spreadsheetView === 'year' ? '1561-2080h' : 
                      spreadsheetView === 'quarter' ? '391-520h' : 
                      spreadsheetView === 'month' ? '131-173h' :
                      '31-40h'
                    }</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-100 rounded"></div>
                    <span>{
                      spreadsheetView === 'year' ? '2080h+' : 
                      spreadsheetView === 'quarter' ? '520h+' : 
                      spreadsheetView === 'month' ? '173h+' :
                      '40h+'
                    }</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions Bar */}
              <div className="flex items-center justify-between p-3 bg-white rounded border">
                <div className="flex items-center space-x-3">
                  <span className="text-sm font-medium text-gray-700">Quick Actions:</span>
                  <button 
                    onClick={() => setShowPhaseTemplates(!showPhaseTemplates)}
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    🚀 Apply Template
                  </button>
                  <button className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700">
                    📋 Export to Excel
                  </button>
                  <button className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700">
                    📁 Save as Template
                  </button>
                </div>
                <div className="text-xs text-gray-500">
                  💡 Select a team member row, then apply templates for instant scheduling
                </div>
              </div>

              {/* Phase Templates Panel */}
              {showPhaseTemplates && (
                <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-blue-900">📚 Phase Templates</h3>
                    <button 
                      onClick={() => setShowPhaseTemplates(false)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-xs text-blue-700 mb-3">
                    Choose a template to instantly apply a work pattern. You can then fine-tune individual months.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {phaseTemplates.map((template, idx) => (
                      <div key={idx} className="bg-white p-3 rounded border hover:shadow-md transition-shadow">
                        <div className="flex items-start space-x-2 mb-2">
                          <span className="text-lg">{template.icon}</span>
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{template.name}</div>
                            <div className="text-xs text-gray-600">{template.description}</div>
                          </div>
                        </div>
                        
                        {/* Mini timeline preview */}
                        <div className="flex space-x-1 mb-2">
                          {template.pattern.map((hours, month) => (
                            <div 
                              key={month} 
                              className={`h-2 w-full rounded ${getCellColor(hours).split(' ')[0]}`}
                              title={`${months[month]}: ${hours}h/week`}
                            ></div>
                          ))}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-xs text-gray-500">
                            {template.pattern.reduce((sum, h) => sum + h, 0)}h total
                          </div>
                          <div className="space-x-1">
                            {teamMembers.map(member => (
                              <button
                                key={member.id}
                                onClick={() => applyTemplate(member.id, template)}
                                className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                                title={`Apply to ${member.name}`}
                              >
                                {member.name.split(' ')[0]}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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
                        {spreadsheetView === 'month' && <div className="text-xs text-gray-400 font-normal">2025</div>}
                      </th>
                    ))}
                    <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {teamMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 border-r bg-gray-50">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm">
                              {member.avatar}
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{member.name}</div>
                              <div className="text-xs text-gray-500">{member.department}</div>
                              <div className="text-xs text-blue-600">{detectPattern(member.id)}</div>
                            </div>
                          </div>
                          <div className="flex flex-col space-y-1">
                            <button 
                              onClick={() => {
                                setSelectedMemberForTemplate(member.id);
                                setShowPhaseTemplates(true);
                              }}
                              className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                              title="Apply template to this member"
                            >
                              🚀 Template
                            </button>
                            <button 
                              onClick={() => clearMemberSchedule(member.id)}
                              className="px-2 py-1 text-xs bg-gray-400 text-white rounded hover:bg-gray-500"
                              title="Clear all months"
                            >
                              🗑️ Clear
                            </button>
                          </div>
                        </div>
                      </td>
                      {getSpreadsheetColumns().map((column, columnIdx) => {
                        const hours = getSpreadsheetValue(member.id, columnIdx);
                        const isEditing = editingCell?.memberId === member.id && editingCell?.column === columnIdx;
                        return (
                          <td key={columnIdx} className="px-1 py-1 border-r">
                            {isEditing ? (
                              <input
                                type="number"
                                min="0"
                                max={spreadsheetView === 'year' ? '2500' : spreadsheetView === 'quarter' ? '600' : '45'}
                                step="0.5"
                                value={hours}
                                onChange={(e) => handleCellEdit(member.id, columnIdx, e.target.value)}
                                onBlur={() => setEditingCell(null)}
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter' || e.key === 'Tab') {
                                    setEditingCell(null);
                                  }
                                  if (e.key === 'Escape') {
                                    setEditingCell(null);
                                  }
                                }}
                                autoFocus
                                className="w-full px-2 py-1 text-center text-sm border border-blue-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                              />
                            ) : (
                              <div
                                onClick={() => setEditingCell({ memberId: member.id, column: columnIdx })}
                                className={`w-full px-2 py-2 text-center text-sm font-medium cursor-pointer hover:ring-1 hover:ring-blue-300 rounded ${getCellColor(hours)}`}
                              >
                                {hours > 0 ? `${Math.round(hours)}h` : '—'}
                              </div>
                            )}
                          </td>
                        );
                      })}
                      <td className="px-3 py-3 text-center bg-gray-50">
                        <div className="text-sm font-semibold text-gray-900">
                          {getMemberTotal(member.id)}h
                        </div>
                        <div className="text-xs text-gray-500">
                          {Math.round(getMemberTotal(member.id) / 12)}h/mo
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot className="bg-gray-50">
                  <tr>
                    <td className="px-4 py-3 text-sm font-medium text-gray-900 border-r">
                      Column Totals
                    </td>
                    {getSpreadsheetColumns().map((column, columnIdx) => (
                      <td key={columnIdx} className="px-3 py-3 text-center border-r">
                        <div className="text-sm font-semibold text-gray-900">
                          {Math.round(getColumnTotal(columnIdx))}h
                        </div>
                        <div className="text-xs text-gray-500">
                          {teamMembers.length} people
                        </div>
                      </td>
                    ))}
                    <td className="px-3 py-3 text-center">
                      <div className="text-sm font-semibold text-gray-900">
                        {teamMembers.reduce((sum, member) => sum + getMemberTotal(member.id), 0)}h
                      </div>
                      <div className="text-xs text-gray-500">
                        Total Year
                      </div>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="p-4 bg-gray-50 border-t">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  💡 <strong>Quick Tips:</strong> Click cells to edit • Use templates for common patterns • 0 = break period • Switch views to see data at different time scales
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">
                    📋 Export to Excel
                  </button>
                  <button className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700">
                    📁 Save Template
                  </button>
                  <button 
                    onClick={() => setShowPhaseTemplates(!showPhaseTemplates)}
                    className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700"
                  >
                    🚀 Phase Templates
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Original Timeline View */
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
        )}
      </div>

      {/* Task Detail Modal */}
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

              {selectedTask.isEditing ? (
                <div className="space-y-4">
                  <div className="bg-blue-50 p-3 rounded border border-blue-200">
                    <h3 className="text-sm font-semibold text-blue-900 mb-2">⚙️ Quick Task Settings</h3>
                    <p className="text-xs text-blue-700">For detailed scheduling, use the Spreadsheet View with templates.</p>
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
                    <label className="block text-sm font-medium text-gray-700 mb-2">Weekly Hours Target</label>
                    <div className="flex items-center space-x-2">
                      <input 
                        type="number" 
                        step="0.5"
                        min="0.5"
                        max="40"
                        defaultValue={selectedTask.targetHoursPerWeek || 4}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-sm"
                      />
                      <span className="text-sm text-gray-600">hours per week</span>
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      This sets a general target. Use Spreadsheet View for month-by-month planning.
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
                    <div className="text-xs text-gray-500 mt-1">
                      Select which days this person typically works on this task
                    </div>
                  </div>

                  <div className="bg-yellow-50 p-3 rounded border border-yellow-200">
                    <div className="text-xs font-medium text-yellow-900 mb-1">📊 Current Performance</div>
                    <div className="text-xs text-yellow-800">
                      Averaging {selectedTask.velocity}h/week vs target {selectedTask.targetHoursPerWeek}h/week
                    </div>
                  </div>

                  <div className="bg-blue-50 p-3 rounded border border-blue-200">
                    <div className="text-xs font-medium text-blue-900 mb-1">💡 Pro Tip</div>
                    <div className="text-xs text-blue-800">
                      For complex scheduling (sprints, breaks, seasonal work), switch to <strong>Spreadsheet View</strong> and use phase templates for instant setup.
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
                      onClick={() => {
                        setSelectedTask({...selectedTask, isEditing: false});
                        setShowSpreadsheetView(true);
                      }}
                      className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      📊 Go to Spreadsheet
                    </button>
                  </div>
                </div>
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
                        {selectedTask.targetHoursPerWeek}h per week • Working {selectedTask.pattern?.filter(Boolean).length || 6} days/week
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

                    {(() => {
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
                              <span className="text-purple-900">Week 16 (On time)</span>
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

                  <div className="flex justify-between mt-4">
                    <button 
                      onClick={() => {
                        setSelectedTask(null);
                        setShowSpreadsheetView(true);
                      }}
                      className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      📊 Schedule in Spreadsheet
                    </button>
                    <button onClick={() => setSelectedTask(null)} className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50">
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

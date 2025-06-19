import React, { useState, useEffect } from 'react';
import { Calendar, Users, AlertTriangle } from 'lucide-react';

export default function ResourcePlanner() {
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
  const [spreadsheetView, setSpreadsheetView] = useState('month');

  // Static team data definition
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
          totalActivityHours: 300,
          totalProjectHours: 500,
          velocity: 7.3,
          status: 'in-progress',
          startWeek: -8,
          endWeek: 24,
          pattern: [true, true, false, false, true, true, false, true, true],
          isLongTerm: true,
          targetHoursPerWeek: 6.25,
          duration: '8 months'
        },
        {
          id: 2,
          project: 'Legacy Migration',
          activity: 'Database Migration',
          task: 'PostgreSQL to MongoDB',
          color: 'bg-orange-500',
          estimatedHours: 40,
          actualHours: 20,
          totalActivityHours: 40,
          totalProjectHours: 120,
          velocity: 5.0,
          status: 'in-progress',
          startWeek: -4,
          endWeek: 4,
          pattern: [true, true, false, false, true, false, false, false, false],
          isLongTerm: false,
          targetHoursPerWeek: 5,
          duration: '2 months'
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
          totalActivityHours: 400,
          totalProjectHours: 500,
          velocity: 8.2,
          status: 'in-progress',
          startWeek: -8,
          endWeek: 28,
          pattern: [true, true, false, false, true, true, true, true, true],
          isLongTerm: true,
          targetHoursPerWeek: 8.33,
          duration: '9 months'
        },
        {
          id: 8,
          project: 'Data Migration',
          activity: 'ETL Pipeline',
          task: 'Snowflake Integration',
          color: 'bg-indigo-500',
          estimatedHours: 60,
          actualHours: 30,
          totalActivityHours: 80,
          totalProjectHours: 120,
          velocity: 5.0,
          status: 'in-progress',
          startWeek: -6,
          endWeek: 6,
          pattern: [true, true, false, false, true, false, false, false, false],
          isLongTerm: false,
          targetHoursPerWeek: 5,
          duration: '3 months'
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
          totalActivityHours: 220,
          totalProjectHours: 500,
          velocity: 6.8,
          status: 'in-progress',
          startWeek: -4,
          endWeek: 32,
          pattern: [true, true, false, false, true, true, true, true, false],
          isLongTerm: true,
          targetHoursPerWeek: 5,
          duration: '9 months'
        },
        {
          id: 14,
          project: 'BIORADAR',
          activity: 'Bioinformatics Analysis',
          task: 'Genomic Data Processing',
          color: 'bg-teal-500',
          estimatedHours: 240,
          actualHours: 40,
          totalActivityHours: 300,
          totalProjectHours: 450,
          velocity: 5.0,
          status: 'in-progress',
          startWeek: -8,
          endWeek: 40,
          pattern: [true, true, false, false, true, true, false, false, false],
          isLongTerm: true,
          targetHoursPerWeek: 5,
          duration: '12 months'
        }
      ]
    }
  ];

  // Unified data structure - SINGLE SOURCE OF TRUTH
  const [teamData, setTeamData] = useState([]);

  // Initialize unified data structure from static team data
  React.useEffect(() => {
    const initializeTeamData = () => {
      const unifiedData = staticTeamMembers.map(member => ({
        ...member,
        tasks: member.tasks.map(task => {
          const projectId = task.project.toLowerCase().replace(/\s+/g, '-');
          return {
            ...task,
            projectId,
            monthlyHours: Array.from({ length: 12 }, (_, month) => {
              const weekInMonth = month * 4.33;
              if (task.startWeek !== undefined && task.endWeek !== undefined) {
                if (weekInMonth >= task.startWeek && weekInMonth <= task.endWeek) {
                  return task.targetHoursPerWeek || 0;
                }
              }
              return 0;
            })
          };
        })
      }));
      setTeamData(unifiedData);
    };

    if (teamData.length === 0) {
      initializeTeamData();
    }
  }, []);

  // Sync function: Updates task hours when spreadsheet cells are edited
  const syncTaskFromSpreadsheet = (memberId, projectId, monthIndex, hours) => {
    console.log('syncTaskFromSpreadsheet called:', { memberId, projectId, monthIndex, hours });
    
    setTeamData(prevData => {
      const newData = prevData.map(member => {
        if (member.id === memberId) {
          return {
            ...member,
            tasks: member.tasks.map(task => {
              if (task.projectId === projectId) {
                const newMonthlyHours = [...(task.monthlyHours || Array(12).fill(0))];
                newMonthlyHours[monthIndex] = hours;
                
                console.log('Updating task:', task.project, 'Month:', monthIndex, 'Hours:', hours);
                console.log('New monthly hours:', newMonthlyHours);
                
                const activeMonths = newMonthlyHours.filter(h => h > 0);
                const avgWeeklyHours = activeMonths.length > 0 
                  ? activeMonths.reduce((sum, h) => sum + h, 0) / activeMonths.length 
                  : 0;
                
                return {
                  ...task,
                  monthlyHours: newMonthlyHours,
                  targetHoursPerWeek: avgWeeklyHours,
                  startWeek: newMonthlyHours.findIndex(h => h > 0) * 4.33,
                  endWeek: (newMonthlyHours.length - 1 - [...newMonthlyHours].reverse().findIndex(h => h > 0)) * 4.33
                };
              }
              return task;
            })
          };
        }
        return member;
      });
      
      console.log('Final team data update:', newData);
      return newData;
    });
  };

  // Sync function: Updates spreadsheet when task properties change
  const syncSpreadsheetFromTask = (memberId, taskId, updates) => {
    setTeamData(prevData => 
      prevData.map(member => {
        if (member.id === memberId) {
          return {
            ...member,
            tasks: member.tasks.map(task => {
              if (task.id === taskId) {
                const updatedTask = { ...task, ...updates };
                
                if (updates.targetHoursPerWeek !== undefined) {
                  const newMonthlyHours = task.monthlyHours.map(hours => 
                    hours > 0 ? updates.targetHoursPerWeek : 0
                  );
                  updatedTask.monthlyHours = newMonthlyHours;
                }
                
                return updatedTask;
              }
              return task;
            })
          };
        }
        return member;
      })
    );
  };

  // Use teamData instead of static data for the component
  const teamMembers = teamData.length > 0 ? teamData : staticTeamMembers;

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

  // Enhanced calculateDailyHours with debugging  
  const calculateDailyHours = (member, dateIdx, viewType = 'day') => {
    console.log('calculateDailyHours called:', { memberName: member.name, dateIdx, viewType });
    
    if (!member.tasks) return 0;
    
    const totalHours = member.tasks.reduce((totalHours, task) => {
      console.log('Processing task:', task.project, 'monthlyHours:', task.monthlyHours);
      
      // Priority 1: Use monthlyHours from unified data structure
      if (task.monthlyHours && task.monthlyHours.length > 0) {
        let hours = 0;
        
        if (viewType === 'week') {
          const monthIndex = Math.floor(dateIdx / 4.33);
          hours = task.monthlyHours[monthIndex] || 0;
        } else if (viewType === 'month') {
          hours = task.monthlyHours[dateIdx] || 0;
        } else if (viewType === 'day') {
          const monthIndex = Math.floor(dateIdx / 4.33);
          const weeklyHours = task.monthlyHours[monthIndex] || 0;
          const activeDaysPerWeek = task.pattern ? task.pattern.filter(day => day && ![2,3].includes(task.pattern.indexOf(day))).length : 5;
          hours = weeklyHours / Math.max(1, activeDaysPerWeek);
        }
        
        // Debug log for AI Platform task
        if (task.project === 'AI Platform') {
          console.log('🎯 AI Platform calculation:', {
            memberName: member.name,
            taskProject: task.project,
            monthIndex: dateIdx,
            monthlyHours: task.monthlyHours,
            calculatedHours: hours,
            viewType
          });
        }
        
        return totalHours + hours;
      }
      
      console.log('Using fallback calculation for:', task.project);
      
      // Fallback to old calculation if monthlyHours not available
      if (isTaskActive(task, currentWeekOffset)) {
        const weeklyHours = task.targetHoursPerWeek || 0;
        if (viewType === 'day') {
          const activeDaysPerWeek = task.pattern ? task.pattern.filter(day => day && ![2,3].includes(task.pattern.indexOf(day))).length : 5;
          return totalHours + (weeklyHours / Math.max(1, activeDaysPerWeek));
        } else if (viewType === 'week') {
          return totalHours + weeklyHours;
        } else if (viewType === 'month') {
          return totalHours + (weeklyHours * 4.33);
        }
      }
      return totalHours;
    }, 0);
    
    console.log('Final calculated hours:', totalHours, 'for', member.name);
    return totalHours;
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
      case 'year': return 1;
      case 'quarter': return 3;
      case 'month': return 4;
      default: return 9;
    }
  };

  const getDateRangeLabel = () => {
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = currentDate.getMonth();
    const currentDay = currentDate.getDate();
    
    if (selectedView === 'year') return currentYear.toString();
    if (selectedView === 'quarter') {
      const quarterNumber = Math.floor(currentMonth / 3) + 1;
      const quarterMonths = [
        ['Jan', 'Feb', 'Mar'],
        ['Apr', 'May', 'Jun'], 
        ['Jul', 'Aug', 'Sep'],
        ['Oct', 'Nov', 'Dec']
      ];
      return `Q${quarterNumber} ${currentYear} (${quarterMonths[quarterNumber - 1].join('-')})`;
    }
    if (selectedView === 'month') {
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                         'July', 'August', 'September', 'October', 'November', 'December'];
      return `${monthNames[currentMonth]} ${currentYear}`;
    }
    
    const weekStart = currentDay - currentDate.getDay() + (currentWeekOffset * 7);
    const weekEnd = weekStart + 6;
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
                       'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    if (currentWeekOffset === 0) {
      return `${monthNames[currentMonth]} ${weekStart}-${Math.min(weekEnd, 30)}, ${currentYear}`;
    }
    return `${monthNames[currentMonth]} ${weekStart}-${Math.min(weekEnd, 30)}, ${currentYear} (${currentWeekOffset > 0 ? '+' : ''}${currentWeekOffset})`;
  };

  const handleAssignTask = (member) => {
    setSelectedMemberForAssignment(member);
    setShowAssignTaskModal(true);
  };

  const handleEditTask = (task, member) => {
    setSelectedTask({
      ...task, 
      memberName: member.name, 
      isEditing: true,
      onSave: (updates) => {
        syncSpreadsheetFromTask(member.id, task.id, updates);
        setSelectedTask(null);
      }
    });
  };

  const submitTaskAssignment = (taskData) => {
    console.log('Assigning task:', taskData, 'to:', selectedMemberForAssignment.name);
    setShowAssignTaskModal(false);
    setSelectedMemberForAssignment(null);
  };

  // Debug enhanced cell edit function
  const handleProjectCellEdit = (memberId, projectId, columnIndex, value) => {
    console.log('handleProjectCellEdit called:', { memberId, projectId, columnIndex, value, spreadsheetView });
    
    if (value === '') {
      syncTaskFromSpreadsheet(memberId, projectId, columnIndex, 0);
      return;
    }
    
    const numValue = parseFloat(value);
    
    if (isNaN(numValue) || numValue < 0) {
      console.log('Invalid value, returning');
      return;
    }
    
    const maxLimits = {
      week: 60,
      month: 300,
      quarter: 800,
      year: 3000
    };
    
    const clampedValue = Math.min(numValue, maxLimits[spreadsheetView] || 300);
    console.log('Clamped value:', clampedValue);
    
    let weeklyHours = clampedValue;
    
    if (spreadsheetView === 'month') {
      weeklyHours = clampedValue / 4.33;
      console.log('Converting monthly to weekly:', clampedValue, '→', weeklyHours);
    } else if (spreadsheetView === 'quarter') {
      weeklyHours = clampedValue / (4.33 * 3);
    } else if (spreadsheetView === 'year') {
      weeklyHours = clampedValue / (4.33 * 12);
    }
    
    console.log('Final weekly hours to store:', weeklyHours);
    
    syncTaskFromSpreadsheet(memberId, projectId, columnIndex, Math.max(0, weeklyHours));
  };

  const getCellColor = (hours) => {
    if (hours === 0) return 'bg-gray-100 text-gray-400';
    
    if (spreadsheetView === 'week') {
      if (hours <= 10) return 'bg-blue-100 text-blue-800';
      if (hours <= 20) return 'bg-green-100 text-green-800';
      if (hours <= 30) return 'bg-yellow-100 text-yellow-800';
      if (hours <= 40) return 'bg-orange-100 text-orange-800';
      return 'bg-red-100 text-red-800';
    } else if (spreadsheetView === 'month') {
      if (hours <= 43) return 'bg-blue-100 text-blue-800';
      if (hours <= 87) return 'bg-green-100 text-green-800';
      if (hours <= 130) return 'bg-yellow-100 text-yellow-800';
      if (hours <= 173) return 'bg-orange-100 text-orange-800';
      return 'bg-red-100 text-red-800';
    }
    
    return 'bg-gray-100 text-gray-400';
  };

  const phaseTemplates = [
    {
      name: "Quarterly Sprints",
      description: "3-month sprints with 1-month breaks",
      pattern: [20, 20, 20, 0, 20, 20, 20, 0, 20, 20, 20, 0]
    },
    {
      name: "Steady Consistent Work",
      description: "Same hours every month",
      pattern: [20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20, 20]
    }
  ];

  const applyTemplate = (memberId, template) => {
    setTeamData(prevData =>
      prevData.map(member => {
        if (member.id === memberId) {
          return {
            ...member,
            tasks: member.tasks.map(task => ({
              ...task,
              monthlyHours: template.pattern.map(hours => hours),
              targetHoursPerWeek: template.pattern.reduce((sum, h) => sum + h, 0) / template.pattern.filter(h => h > 0).length || 0
            }))
          };
        }
        return member;
      })
    );
    setShowPhaseTemplates(false);
    setSelectedMemberForTemplate(null);
  };

  const clearMemberSchedule = (memberId) => {
    setTeamData(prevData =>
      prevData.map(member => {
        if (member.id === memberId) {
          return {
            ...member,
            tasks: member.tasks.map(task => ({
              ...task,
              monthlyHours: Array.from({ length: 12 }, () => 0),
              targetHoursPerWeek: 0
            }))
          };
        }
        return member;
      })
    );
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
        return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    }
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
      
      if (spreadsheetView === 'month') {
        const weeklyHours = task.monthlyHours[index] || 0;
        return Math.round(weeklyHours * 4.33);
      }
      return task.monthlyHours[index] || 0;
    } else {
      if (spreadsheetView === 'month') {
        let monthTotal = 0;
        member.tasks.forEach(task => {
          if (task.monthlyHours) {
            const weeklyHours = task.monthlyHours[index] || 0;
            monthTotal += weeklyHours * 4.33;
          }
        });
        return Math.round(monthTotal);
      }
      
      return 0;
    }
  };

  const getMemberRowTotal = (memberId) => {
    const columns = getSpreadsheetColumns();
    return columns.reduce((total, _, index) => {
      return total + getSpreadsheetValue(memberId, index);
    }, 0);
  };

  const getProjectRowTotal = (memberId, projectId) => {
    const columns = getSpreadsheetColumns();
    return columns.reduce((total, _, index) => {
      return total + getSpreadsheetValue(memberId, index, projectId);
    }, 0);
  };

  const getColumnTotal = (index) => {
    return teamMembers.reduce((total, member) => {
      return total + getSpreadsheetValue(member.id, index);
    }, 0);
  };

  const getSpreadsheetLabel = () => {
    switch (spreadsheetView) {
      case 'week': return '52-Week Resource Planning';
      case 'month': return '12-Month Resource Planning';
      case 'quarter': return 'Quarterly Resource Planning';
      case 'year': return 'Annual Resource Planning';
      default: return '12-Month Resource Planning';
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen" style={{ 
      fontFamily: '"Inter", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", sans-serif',
      fontSize: '14px',
      lineHeight: '1.5'
    }}>
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
            {/* Sync Status Indicator */}
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-md">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-green-700">Modes Synced</span>
            </div>
            
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
              {showSpreadsheetView ? 'Timeline View' : 'Spreadsheet View'}
            </button>

            <select 
              value={showSpreadsheetView ? spreadsheetView : selectedView} 
              onChange={(e) => {
                if (showSpreadsheetView) {
                  setSpreadsheetView(e.target.value);
                } else {
                  setSelectedView(e.target.value);
                }
              }}
              className="text-sm font-medium text-gray-700 bg-

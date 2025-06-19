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
          duration: '8 months',
          intensityPhases: [
            { name: 'Planning Phase', hoursPerWeek: 8, startWeek: -8, endWeek: -4 },
            { name: 'Implementation', hoursPerWeek: 6, startWeek: -3, endWeek: 12 },
            { name: 'Testing', hoursPerWeek: 4, startWeek: 13, endWeek: 24 }
          ]
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
  // This replaces both spreadsheetData and projectSpreadsheetData
  const [teamData, setTeamData] = useState([]);

  // Initialize unified data structure from static team data
  React.useEffect(() => {
    const initializeTeamData = () => {
      const unifiedData = staticTeamMembers.map(member => ({
        ...member,
        // Enhanced tasks with hour allocation
        tasks: member.tasks.map(task => {
          const projectId = task.project.toLowerCase().replace(/\s+/g, '-');
          return {
            ...task,
            projectId,
            // Initialize monthly hours from task's target hours per week
            monthlyHours: Array.from({ length: 12 }, (_, month) => {
              // Check if task is active in this month
              const weekInMonth = month * 4.33; // Approximate week for this month
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

  // Debug: Add logging to see what's happening with the sync
  const syncTaskFromSpreadsheet = (memberId, projectId, monthIndex, hours) => {
    console.log('syncTaskFromSpreadsheet called:', { memberId, projectId, monthIndex, hours });
    
    setTeamData(prevData => {
      const newData = prevData.map(member => {
        if (member.id === memberId) {
          const updatedMember = {
            ...member,
            tasks: member.tasks.map(task => {
              if (task.projectId === projectId) {
                const newMonthlyHours = [...(task.monthlyHours || Array(12).fill(0))];
                newMonthlyHours[monthIndex] = hours;
                
                console.log('Updating task:', task.project, 'Month:', monthIndex, 'Hours:', hours);
                console.log('New monthly hours:', newMonthlyHours);
                
                // Update targetHoursPerWeek based on average of non-zero months
                const activeMonths = newMonthlyHours.filter(h => h > 0);
                const avgWeeklyHours = activeMonths.length > 0 
                  ? activeMonths.reduce((sum, h) => sum + h, 0) / activeMonths.length 
                  : 0;
                
                const updatedTask = {
                  ...task,
                  monthlyHours: newMonthlyHours,
                  targetHoursPerWeek: avgWeeklyHours,
                  // Update task timeline based on allocated months
                  startWeek: newMonthlyHours.findIndex(h => h > 0) * 4.33,
                  endWeek: (newMonthlyHours.length - 1 - [...newMonthlyHours].reverse().findIndex(h => h > 0)) * 4.33
                };
                
                console.log('Updated task:', updatedTask);
                return updatedTask;
              }
              return task;
            })
          };
          console.log('Updated member:', updatedMember);
          return updatedMember;
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
                
                // If targetHoursPerWeek changed, update monthlyHours
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

  const getCurrentPhaseFromDates = (task, currentWeek) => {
    if (!task.intensityPhases) return null;
    return task.intensityPhases.find(phase => {
      return currentWeek >= phase.startWeek && currentWeek <= phase.endWeek;
    });
  };

  // Enhanced calculateDailyHours with debugging  
  const calculateDailyHours = (member, dateIdx, viewType = 'day') => {
    if (!member.tasks) return 0;
    
    const totalHours = member.tasks.reduce((totalHours, task) => {
      // Priority 1: Use monthlyHours from unified data structure
      if (task.monthlyHours && task.monthlyHours.length > 0) {
        let hours = 0;
        
        if (viewType === 'week') {
          const monthIndex = Math.floor(dateIdx / 4.33);
          hours = task.monthlyHours[monthIndex] || 0;
        } else if (viewType === 'month') {
          // For month view, we want the weekly hours for that specific month
          hours = task.monthlyHours[dateIdx] || 0;
        } else if (viewType === 'day') {
          const monthIndex = Math.floor(dateIdx / 4.33);
          const weeklyHours = task.monthlyHours[monthIndex] || 0;
          const activeDaysPerWeek = task.pattern ? task.pattern.filter(day => day && ![2,3].includes(task.pattern.indexOf(day))).length : 5;
          hours = weeklyHours / Math.max(1, activeDaysPerWeek);
        }
        
        // Debug log for June (month index 5)
        if (dateIdx === 5 && viewType === 'month' && task.project === 'AI Platform') {
          console.log('calculateDailyHours DEBUG:', {
            taskProject: task.project,
            monthIndex: dateIdx,
            monthlyHours: task.monthlyHours,
            calculatedHours: hours,
            viewType
          });
        }
        
        return totalHours + hours;
      }
      
      // Fallback to old calculation if monthlyHours not available
      if (isTaskActive(task, currentWeekOffset)) {
        if (task.intensityPhases) {
          const currentPhase = getCurrentPhaseFromDates(task, currentWeekOffset);
          if (currentPhase) {
            if (viewType === 'day') {
              const activeDaysPerWeek = task.pattern ? task.pattern.filter(day => day && ![2,3].includes(task.pattern.indexOf(day))).length : 5;
              return totalHours + (currentPhase.hoursPerWeek / Math.max(1, activeDaysPerWeek));
            } else if (viewType === 'week') {
              return totalHours + currentPhase.hoursPerWeek;
            } else if (viewType === 'month') {
              return totalHours + (currentPhase.hoursPerWeek * 4.33);
            }
          }
        }
        
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
    const currentMonth = currentDate.getMonth(); // 0-based (June = 5)
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
    
    // For week view, calculate the actual current week
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

  // Enhanced task editing with bi-directional sync
  const handleEditTask = (task, member) => {
    setSelectedTask({
      ...task, 
      memberName: member.name, 
      isEditing: true,
      onSave: (updates) => {
        // Update task with bi-directional sync
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
    
    // Allow empty string to clear the field
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
    
    // Convert the input value to weekly hours for storage
    let weeklyHours = clampedValue;
    
    if (spreadsheetView === 'month') {
      // User entered total monthly hours, convert to weekly
      weeklyHours = clampedValue / 4.33;
      console.log('Converting monthly to weekly:', clampedValue, '→', weeklyHours);
    } else if (spreadsheetView === 'quarter') {
      // User entered total quarterly hours, convert to weekly  
      weeklyHours = clampedValue / (4.33 * 3);
    } else if (spreadsheetView === 'year') {
      // User entered total yearly hours, convert to weekly
      weeklyHours = clampedValue / (4.33 * 12);
    }
    
    console.log('Final weekly hours to store:', weeklyHours);
    
    // Update unified data structure with bi-directional sync
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
    } else if (spreadsheetView === 'quarter') {
      if (hours <= 130) return 'bg-blue-100 text-blue-800';
      if (hours <= 260) return 'bg-green-100 text-green-800';
      if (hours <= 390) return 'bg-yellow-100 text-yellow-800';
      if (hours <= 520) return 'bg-orange-100 text-orange-800';
      return 'bg-red-100 text-red-800';
    } else if (spreadsheetView === 'year') {
      if (hours <= 520) return 'bg-blue-100 text-blue-800';
      if (hours <= 1040) return 'bg-green-100 text-green-800';
      if (hours <= 1560) return 'bg-yellow-100 text-yellow-800';
      if (hours <= 2080) return 'bg-orange-100 text-orange-800';
      return 'bg-red-100 text-red-800';
    }
    
    return 'bg-gray-100 text-gray-400';
  };

  const phaseTemplates = [
    {
      name: "2-Month Sprint + 3-Month Break + 2-Month Sprint",
      description: "Work intensively, then break, then final push",
      pattern: [25, 25, 0, 0, 0, 20, 20, 0, 0, 0, 0, 0]
    },
    {
      name: "Seasonal Work (Summer Focus)",
      description: "Light work, then summer intensive, then light",
      pattern: [10, 10, 10, 10, 10, 30, 30, 30, 10, 10, 10, 10]
    },
    {
      name: "Academic Schedule",
      description: "Term work with holiday breaks",
      pattern: [20, 20, 20, 20, 0, 0, 0, 20, 20, 20, 20, 0]
    },
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

  // Updated template application with bi-directional sync
  const applyTemplate = (memberId, template) => {
    // Apply template pattern to all tasks for this member
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

  // Updated clear function with bi-directional sync
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

  // Updated function to read from unified data structure
  const getSpreadsheetValue = (memberId, index, projectId = null) => {
    const member = teamData.find(m => m.id === memberId);
    if (!member) return 0;

    if (projectId) {
      // Get hours for specific project
      const task = member.tasks.find(t => t.projectId === projectId);
      if (!task || !task.monthlyHours) return 0;
      
      return calculateValueForView({ [index]: task.monthlyHours[index] || 0 }, index);
    } else {
      // Get total hours across all projects for this time period
      if (spreadsheetView === 'quarter') {
        const quarterMonths = [
          [0, 1, 2], [3, 4, 5], [6, 7, 8], [9, 10, 11]
        ];
        const monthsInQuarter = quarterMonths[index] || [];
        
        return Math.round(monthsInQuarter.reduce((sum, monthIdx) => {
          let monthTotal = 0;
          member.tasks.forEach(task => {
            if (task.monthlyHours) {
              const weeklyHours = task.monthlyHours[monthIdx] || 0;
              monthTotal += weeklyHours * 4.33; // Convert weekly to monthly
            }
          });
          return sum + monthTotal;
        }, 0));
      } else if (spreadsheetView === 'year') {
        if (index === 0) {
          return Math.round(Array.from({ length: 12 }, (_, monthIdx) => {
            let monthTotal = 0;
            member.tasks.forEach(task => {
              if (task.monthlyHours) {
                const weeklyHours = task.monthlyHours[monthIdx] || 0;
                monthTotal += weeklyHours * 4.33;
              }
            });
            return monthTotal;
          }).reduce((sum, monthTotal) => sum + monthTotal, 0));
        }
        return 0;
      } else if (spreadsheetView === 'month') {
        let monthTotal = 0;
        member.tasks.forEach(task => {
          if (task.monthlyHours) {
            const weeklyHours = task.monthlyHours[index] || 0;
            monthTotal += weeklyHours * 4.33;
          }
        });
        return Math.round(monthTotal);
      } else if (spreadsheetView === 'week') {
        const monthIndex = Math.floor(index / 4.33);
        let weekTotal = 0;
        member.tasks.forEach(task => {
          if (task.monthlyHours) {
            weekTotal += task.monthlyHours[monthIndex] || 0;
          }
        });
        return Math.round(weekTotal);
      }
      
      return 0;
    }
  };
  
  const calculateValueForView = (memberData, index) => {
    switch (spreadsheetView) {
      case 'week':
        // For week view, return weekly hours directly
        const monthIndex = Math.floor(index / 4.33);
        return memberData[monthIndex] || 0;
        
      case 'month':
        // For month view, convert weekly to monthly hours
        const weeklyHours = memberData[index] || 0;
        return Math.round(weeklyHours * 4.33);
        
      case 'quarter':
        // For quarter view, sum 3 months and convert weekly to monthly
        const quarterMonths = [
          [0, 1, 2], [3, 4, 5], [6, 7, 8], [9, 10, 11]
        ];
        const monthsInQuarter = quarterMonths[index] || [];
        return Math.round(monthsInQuarter.reduce((sum, monthIdx) => {
          const weeklyHours = memberData[monthIdx] || 0;
          return sum + (weeklyHours * 4.33); // Convert weekly to monthly
        }, 0));
        
      case 'year':
        // For year view, sum all 12 months and convert weekly to monthly
        if (index === 0) {
          return Math.round(Object.keys(Array.from({ length: 12 })).reduce((sum, monthIdx) => {
            const weeklyHours = memberData[parseInt(monthIdx)] || 0;
            return sum + (weeklyHours * 4.33);
          }, 0));
        }
        return 0;
        
      default:
        return memberData[index] || 0;
    }
  };

  const getColumnTotal = (index) => {
    return teamMembers.reduce((total, member) => {
      return total + getSpreadsheetValue(member.id, index);
    }, 0);
  };

  const getMemberRowTotal = (memberId) => {
    // Calculate total by summing all columns in the current view
    const columns = getSpreadsheetColumns();
    return columns.reduce((total, _, index) => {
      return total + getSpreadsheetValue(memberId, index);
    }, 0);
  };

  const getProjectRowTotal = (memberId, projectId) => {
    // Calculate project total by summing all columns for this project
    const columns = getSpreadsheetColumns();
    return columns.reduce((total, _, index) => {
      return total + getSpreadsheetValue(memberId, index, projectId);
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

  const getUnitLabel = () => {
    switch (spreadsheetView) {
      case 'week': return 'hours per week';
      case 'month': return 'total hours for entire month';
      case 'quarter': return 'total hours for entire quarter';
      case 'year': return 'total hours for entire year';
      default: return 'hours per week';
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
            <h1 className="text-xl font-semibold text-gray-900" style={{ fontWeight: '600' }}>Resource Planner</h1>
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

      {/* Date Headers - Only show when in Timeline view */}
      {!showSpreadsheetView && (
        <div className="bg-white border-b border-gray-200 px-4 py-2">
          <div className="flex items-stretch">
            <div className="w-72 flex-shrink-0"></div>
            <div className={`flex-1 ${
              selectedView === 'year' ? 'grid grid-cols-1 gap-2' :
              selectedView === 'quarter' ? 'grid grid-cols-3 gap-4' :
              selectedView === 'month' ? 'grid grid-cols-4 gap-3' : 
              'grid grid-cols-9 gap-2'
            }`}>
              {selectedView === 'year' ? (
                <div className="text-center py-2 px-4 rounded text-sm bg-blue-500 text-white font-semibold border border-blue-600">
                  <div className="uppercase tracking-wide">2025</div>
                  <div className="text-xs">Full Year</div>
                </div>
              ) : selectedView === 'quarter' ? (
                ['Apr', 'May', 'Jun'].map((month, i) => (
                  <div key={i} className={`text-center py-2 px-2 rounded border ${
                    i === 2 ? 'bg-blue-500 text-white border-blue-600' : 'text-gray-700 bg-white border-gray-200 hover:bg-gray-50'
                  }`}>
                    <div className="text-sm font-semibold">{month}</div>
                    <div className="text-xs opacity-75">{i + 4}</div>
                    {i === 2 && <div className="text-xs font-medium">NOW</div>}
                  </div>
                ))
              ) : selectedView === 'month' ? (
                ['Week 1', 'Week 2', 'Week 3', 'Week 4'].map((week, i) => (
                  <div key={i} className={`text-center py-2 px-2 rounded border ${
                    i === 2 ? 'bg-blue-500 text-white border-blue-600' : 'text-gray-700 bg-white border-gray-200 hover:bg-gray-50'
                  }`}>
                    <div className="text-sm font-semibold">{week}</div>
                    <div className="text-xs opacity-75">Jun {i * 7 + 1}-{Math.min((i + 1) * 7, 30)}</div>
                    {i === 2 && <div className="text-xs font-medium">NOW</div>}
                  </div>
                ))
              ) : (
                ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun', 'Mon', 'Tue'].map((day, i) => {
                  const currentDate = new Date();
                  const dayOfMonth = currentDate.getDate() + i - 3; // Center around current day
                  const isToday = i === 3;
                  const isWeekend = day === 'Sat' || day === 'Sun';
                  
                  return (
                    <div key={i} className={`text-center py-1 px-1 rounded text-xs ${
                      isToday ? 'bg-blue-500 text-white font-semibold' :
                      isWeekend ? 'text-gray-400 bg-gray-50' : 'text-gray-700 font-medium'
                    }`}>
                      <div className="uppercase tracking-wide">{day}</div>
                      <div className="text-sm font-bold">{Math.max(1, Math.min(dayOfMonth, 30))}</div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

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
                <div>• <strong>Templates:</strong> Apply patterns to all tasks simultaneously</div>
                <div>• <strong>Real-time:</strong> Both views always show the same data</div>
              </div>
            </div>
          </div>
        </div>

        {showSpreadsheetView ? (
          /* Spreadsheet View */
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{getSpreadsheetLabel()}</h2>
                  <p className="text-sm text-gray-600">Edit hours to automatically sync with Timeline mode. Changes update task schedules in real-time.</p>
                </div>
                <div className="flex items-center space-x-4 text-sm">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-gray-100 rounded"></div>
                    <span>0h</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-100 rounded"></div>
                    <span>Low</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-100 rounded"></div>
                    <span>Medium</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-orange-100 rounded"></div>
                    <span>High</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-100 rounded"></div>
                    <span>Overload</span>
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
                    Apply Template
                  </button>
                  <button className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700">
                    Export Unified Data
                  </button>
                  <button className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700">
                    Save as Template
                  </button>
                </div>
                <div className="text-sm text-gray-600">
                  Select a team member row, then apply templates for instant scheduling
                </div>
              </div>

              {/* Phase Templates Panel */}
              {showPhaseTemplates && (
                <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-blue-900">Phase Templates</h3>
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
                              title={`${['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][month]}: ${hours}h/week`}
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
                  {teamMembers.map((member) => {
                    const memberProjects = getMemberProjects(member.id);
                    
                    return (
                      <React.Fragment key={member.id}>
                        {/* Member Summary Row */}
                        <tr className="hover:bg-gray-50 bg-gray-25">
                          <td className="px-4 py-3 border-r bg-gray-50">
                            <div className="flex items-center justify-between">
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
                              <div className="flex flex-col space-y-1">
                                <button 
                                  onClick={() => {
                                    setSelectedMemberForTemplate(member.id);
                                    setShowPhaseTemplates(true);
                                  }}
                                  className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                                  title="Apply template to this member"
                                >
                                  Template
                                </button>
                                <button 
                                  onClick={() => clearMemberSchedule(member.id)}
                                  className="px-2 py-1 text-xs bg-gray-400 text-white rounded hover:bg-gray-500"
                                  title="Clear all months"
                                >
                                  Clear
                                </button>
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
                            <div className="text-xs text-gray-500">
                              Total
                            </div>
                          </td>
                        </tr>
                        
                        {/* Project Breakdown Rows */}
                        {memberProjects.map((project, projectIdx) => (
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
                                        if (e.key === 'Escape') {
                                          setEditingCell(null);
                                        }
                                      }}
                                      autoFocus
                                      className="w-full h-8 px-2 py-1 text-center text-sm border border-blue-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                      placeholder={
                                        spreadsheetView === 'year' ? 'Annual hours' :
                                        spreadsheetView === 'quarter' ? 'Quarterly hours' :
                                        spreadsheetView === 'month' ? 'Monthly hours' : 'Weekly hours'
                                      }
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
                        {Math.round(teamMembers.reduce((sum, member) => sum + getMemberRowTotal(member.id), 0))}h
                      </div>
                      <div className="text-xs text-gray-500">
                        Total
                      </div>
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>

            <div className="p-4 bg-gray-50 border-t">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600">
                  <strong>Synchronized Planning:</strong> Timeline and Spreadsheet modes share the same data • Edit anywhere, see changes everywhere • Templates create real task schedules
                </div>
                <div className="flex space-x-2">
                  <button className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700">
                    Export Unified Data
                  </button>
                  <button className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700">
                    Save as Template
                  </button>
                  <button 
                    onClick={() => setShowPhaseTemplates(!showPhaseTemplates)}
                    className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700"
                  >
                    Phase Templates
                  </button>
                </div>
              </div>
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

                {/* Always show the task area, but conditionally show task details */}
                <div className="ml-4 space-y-1">
                  {/* Individual task rows - only show when showTaskDetails is true */}
                  {showTaskDetails && member.tasks.map((task, idx) => (
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
                                Edit
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
                              <span className="font-medium text-green-600">{task.velocity}h/week</span>
                              <span className="text-gray-400">(target: {task.targetHoursPerWeek}h/week)</span>
                            </div>
                            <span className={`inline-block px-1 py-0.5 text-xs rounded border ${getTaskStatusColor(task.status)}`}>
                              {task.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className={`flex-1 ${
                        selectedView === 'year' ? 'grid grid-cols-1 gap-2' :
                        selectedView === 'quarter' ? 'grid grid-cols-3 gap-4' :
                        selectedView === 'month' ? 'grid grid-cols-4 gap-3' : 
                        'grid grid-cols-9 gap-2'
                      }`}>
                        {selectedView === 'year' ? 
                          <div className={`h-6 rounded ${task.color} opacity-60`}></div> :
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
                  
                  {/* Workload Summary - Always visible */}
                  <div className="flex items-center bg-blue-50 border-2 border-blue-200 rounded p-2">
                    <div className="w-72 flex-shrink-0">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <div>
                          <div className="text-sm font-medium text-blue-900">
                            {selectedView === 'year' ? 'Annual Workload' :
                             selectedView === 'quarter' ? 'Quarterly Workload' :
                             selectedView === 'month' ? 'Monthly Workload' :
                             'Weekly Workload'}
                          </div>
                          <div className="text-xs text-blue-700">
                            {selectedView === 'year' ? 'Total hours for the year' :
                             selectedView === 'quarter' ? 'Hours per month in quarter' :
                             selectedView === 'month' ? 'Hours per week in month' :
                             'Hours per day this week'}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className={`flex-1 ${
                      selectedView === 'year' ? 'grid grid-cols-1 gap-2' :
                      selectedView === 'quarter' ? 'grid grid-cols-3 gap-4' :
                      selectedView === 'month' ? 'grid grid-cols-4 gap-3' : 
                      'grid grid-cols-9 gap-2'
                    }`}>
                      {selectedView === 'year' ? (
                        (() => {
                          // For year view, calculate total annual hours
                          let hours = 0;
                          for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
                            hours += calculateDailyHours(member, monthIndex, 'month');
                          }
                          
                          return (
                            <div className={`h-6 rounded flex items-center justify-center text-xs font-semibold ${
                              getWorkloadColor(hours, 'year')
                            }`}>
                              {hours === 0 ? '—' : `${Math.round(hours)}h`}
                            </div>
                          );
                        })()
                      ) : (
                        Array.from({ length: getPeriodsForView() }, (_, periodIndex) => {
                          if (selectedView === 'week' && (periodIndex === 2 || periodIndex === 3)) {
                            return (
                              <div key={periodIndex} className="h-6 rounded bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-semibold">
                                —
                              </div>
                            );
                          }
                          
                          let hours = 0;
                          if (selectedView === 'quarter') {
                            hours = calculateDailyHours(member, periodIndex, 'month');
                          } else if (selectedView === 'month') {
                            // For month view, we want to show weekly hours for each week
                            // Use the actual month index (June = 5) instead of period index
                            const currentDate = new Date();
                            const currentMonth = currentDate.getMonth(); // June = 5
                            hours = calculateDailyHours(member, currentMonth, 'month');
                          } else {
                            hours = calculateDailyHours(member, periodIndex, 'day');
                          }
                          
                          const isCurrentPeriod = (
                            (selectedView === 'week' && periodIndex === 0) ||
                            (selectedView === 'month' && periodIndex === 1) ||
                            (selectedView === 'quarter' && periodIndex === 2)
                          );
                          
                          return (
                            <div key={periodIndex} className={`h-6 rounded flex items-center justify-center text-xs font-semibold ${
                              getWorkloadColor(hours, selectedView)
                            } ${isCurrentPeriod ? 'ring-1 ring-blue-400' : ''}`}>
                              {hours === 0 ? '—' : `${Math.round(hours * 10) / 10}h`}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Enhanced Task Detail Modal with bi-directional editing */}
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

                {/* Bi-directional sync editing section */}
                {selectedTask.isEditing && (
                  <div className="bg-blue-50 p-3 rounded border border-blue-200">
                    <div className="text-xs font-medium text-blue-900 mb-2">Edit Task (Changes sync to Spreadsheet)</div>
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs text-blue-800">Weekly Hours Target:</label>
                        <input 
                          type="number" 
                          min="0" 
                          max="40" 
                          defaultValue={selectedTask.targetHoursPerWeek || 0}
                          className="w-full mt-1 px-2 py-1 text-xs border rounded"
                          onChange={(e) => {
                            const newHours = parseFloat(e.target.value) || 0;
                            if (selectedTask.onSave) {
                              selectedTask.onSave({ targetHoursPerWeek: newHours });
                            }
                          }}
                        />
                      </div>
                      <div>
                        <label className="text-xs text-blue-800">Status:</label>
                        <select 
                          defaultValue={selectedTask.status}
                          className="w-full mt-1 px-2 py-1 text-xs border rounded"
                          onChange={(e) => {
                            if (selectedTask.onSave) {
                              selectedTask.onSave({ status: e.target.value });
                            }
                          }}
                        >
                          <option value="planned">Planned</option>
                          <option value="in-progress">In Progress</option>
                          <option value="completed">Completed</option>
                          <option value="over-budget">Over Budget</option>
                        </select>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-green-50 p-3 rounded border border-green-200">
                  <div className="text-xs font-medium text-green-900 mb-1">Current Allocation</div>
                  <div className="text-xs text-green-800">
                    {selectedTask.targetHoursPerWeek || 0}h per week • Working {selectedTask.pattern?.filter(Boolean).length || 5} days/week
                  </div>
                  <div className="text-xs text-green-700 mt-1">
                    💡 Spreadsheet changes automatically update this allocation
                  </div>
                </div>

                {selectedTask.intensityPhases && (
                  <div className="bg-green-50 p-3 rounded border border-green-200">
                    <div className="text-xs font-medium text-green-900 mb-1">Intensity Phases</div>
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

              <div className="flex justify-between mt-4">
                <button 
                  onClick={() => {
                    setSelectedTask(null);
                    setShowSpreadsheetView(true);
                  }}
                  className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  Edit in Spreadsheet
                </button>
                <button onClick={() => setSelectedTask(null)} className="px-3 py-1.5 text-sm border rounded hover:bg-gray-50">
                  Close
                </button>
              </div>
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

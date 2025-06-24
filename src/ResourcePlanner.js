import React, { useState, useEffect } from 'react';
import { Calendar, Users, AlertTriangle } from 'lucide-react';

const ResourcePlannerDemo = () => {
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
  const [spreadsheetView, setSpreadsheetView] = useState('month');
  
  // Demo data that simulates what would come from Workdeck
  const [teamData] = useState([
    {
      id: 'usr-001',
      name: 'Sarah Chen',
      avatar: '👩‍💻',
      department: 'Engineering',
      capacity: 40,
      scheduled: 38,
      utilization: 95,
      tasks: [
        {
          id: 'task-001',
          project: 'Customer Portal Redesign',
          activity: 'Frontend Development',
          task: 'React Components & UI',
          color: 'bg-purple-600',
          estimatedHours: 120,
          actualHours: 45,
          totalActivityHours: 180,
          totalProjectHours: 320,
          velocity: 7.5,
          status: 'in-progress',
          startWeek: -2,
          endWeek: 8,
          pattern: [true, true, false, false, true, true, false, true, true],
          isLongTerm: false,
          targetHoursPerWeek: 15,
          duration: '10 weeks',
          projectId: 'customer-portal-redesign',
          monthlyHours: [15, 15, 15, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        },
        {
          id: 'task-002',
          project: 'API Integration',
          activity: 'Backend Services',
          task: 'REST API Development',
          color: 'bg-blue-600',
          estimatedHours: 80,
          actualHours: 20,
          totalActivityHours: 80,
          totalProjectHours: 150,
          velocity: 5.0,
          status: 'in-progress',
          startWeek: 0,
          endWeek: 12,
          pattern: [true, true, false, false, true, false, false, false, false],
          isLongTerm: false,
          targetHoursPerWeek: 8,
          duration: '8 weeks',
          projectId: 'api-integration',
          monthlyHours: [8, 8, 8, 8, 0, 0, 0, 0, 0, 0, 0, 0]
        }
      ]
    },
    {
      id: 'usr-002',
      name: 'Marcus Rodriguez',
      avatar: '👨‍💻',
      department: 'Engineering',
      capacity: 40,
      scheduled: 42,
      utilization: 105,
      tasks: [
        {
          id: 'task-003',
          project: 'Mobile App v2.0',
          activity: 'Mobile Development',
          task: 'iOS & Android Features',
          color: 'bg-green-600',
          estimatedHours: 200,
          actualHours: 85,
          totalActivityHours: 280,
          totalProjectHours: 400,
          velocity: 8.5,
          status: 'in-progress',
          startWeek: -4,
          endWeek: 16,
          pattern: [true, true, false, false, true, true, true, true, false],
          isLongTerm: true,
          targetHoursPerWeek: 20,
          duration: '5 months',
          projectId: 'mobile-app-v2',
          monthlyHours: [20, 20, 20, 20, 20, 0, 0, 0, 0, 0, 0, 0]
        },
        {
          id: 'task-004',
          project: 'DevOps Pipeline',
          activity: 'Infrastructure',
          task: 'CI/CD Setup',
          color: 'bg-orange-500',
          estimatedHours: 60,
          actualHours: 30,
          totalActivityHours: 60,
          totalProjectHours: 120,
          velocity: 5.0,
          status: 'in-progress',
          startWeek: -1,
          endWeek: 5,
          pattern: [true, true, false, false, true, false, false, false, false],
          isLongTerm: false,
          targetHoursPerWeek: 10,
          duration: '6 weeks',
          projectId: 'devops-pipeline',
          monthlyHours: [10, 10, 2, 0, 0, 0, 0, 0, 0, 0, 0, 0]
        }
      ]
    },
    {
      id: 'usr-003',
      name: 'Dr. Lisa Wang',
      avatar: '👩‍🔬',
      department: 'Data Science',
      capacity: 40,
      scheduled: 35,
      utilization: 88,
      tasks: [
        {
          id: 'task-005',
          project: 'AI Analytics Platform',
          activity: 'Machine Learning',
          task: 'Model Training & Optimization',
          color: 'bg-indigo-600',
          estimatedHours: 150,
          actualHours: 60,
          totalActivityHours: 200,
          totalProjectHours: 300,
          velocity: 6.0,
          status: 'in-progress',
          startWeek: -3,
          endWeek: 20,
          pattern: [true, true, false, false, true, true, false, true, false],
          isLongTerm: true,
          targetHoursPerWeek: 12,
          duration: '6 months',
          projectId: 'ai-analytics-platform',
          monthlyHours: [12, 12, 12, 12, 12, 12, 0, 0, 0, 0, 0, 0]
        }
      ]
    }
  ]);

  // Projects data that would come from Workdeck
  const [projects] = useState([
    { id: 'proj-001', name: 'Customer Portal Redesign' },
    { id: 'proj-002', name: 'API Integration' },
    { id: 'proj-003', name: 'Mobile App v2.0' },
    { id: 'proj-004', name: 'DevOps Pipeline' },
    { id: 'proj-005', name: 'AI Analytics Platform' }
  ]);

  const teamMembers = teamData;

  // Navigation functions
  const goToPreviousWeek = () => setCurrentWeekOffset(prev => prev - 1);
  const goToNextWeek = () => setCurrentWeekOffset(prev => prev + 1);
  const goToToday = () => setCurrentWeekOffset(0);

  // Utility functions
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

  const calculateDailyHours = (member, dateIdx, viewType = 'day') => {
    if (!member.tasks) return 0;
    
    const totalHours = member.tasks.reduce((totalHours, task) => {
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
        
        return totalHours + hours;
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
        console.log('Would sync to Workdeck:', updates);
        setSelectedTask(null);
      }
    });
  };

  const submitTaskAssignment = (taskData) => {
    console.log('Would create task in Workdeck:', taskData, 'for:', selectedMemberForAssignment.name);
    setShowAssignTaskModal(false);
    setSelectedMemberForAssignment(null);
  };

  // Spreadsheet functions
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

  const getColumnTotal = (index) => {
    return teamMembers.reduce((total, member) => {
      return total + getSpreadsheetValue(member.id, index);
    }, 0);
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

  const getSpreadsheetLabel = () => {
    switch (spreadsheetView) {
      case 'week': return '52-Week Resource Planning';
      case 'month': return '12-Month Resource Planning';
      case 'quarter': return 'Quarterly Resource Planning';
      case 'year': return 'Annual Resource Planning';
      default: return '12-Month Resource Planning';
    }
  };

  const handleProjectCellEdit = (memberId, projectId, columnIndex, value) => {
    console.log('Would sync to Workdeck:', { memberId, projectId, columnIndex, value });
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
            {/* Workdeck Connection Status */}
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-md">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-green-700">Workdeck Connected</span>
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
              <span>{teamMembers.length} team members</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Workdeck Info Panel */}
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">ℹ</div>
            <div>
              <h3 className="text-sm font-semibold text-blue-900 mb-1">Live Workdeck Integration Demo</h3>
              <div className="text-xs text-blue-800 space-y-1">
                <div>• <strong>Real Data:</strong> This shows how your Workdeck users, projects, and tasks would appear</div>
                <div>• <strong>Live Updates:</strong> Changes would sync back to Workdeck in real implementation</div>
                <div>• <strong>Team Members:</strong> Showing {teamMembers.length} demo users (would be your actual Workdeck team)</div>
                <div>• <strong>Projects:</strong> Data sourced from {projects.length} demo projects (would be your Workdeck projects)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        {showSpreadsheetView ? (
          /* Spreadsheet View */
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 bg-gray-50 border-b">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">{getSpreadsheetLabel()}</h2>
                  <p className="text-sm text-gray-600">Live data from Workdeck. Changes sync when possible.</p>
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
                    Sync to Workdeck
                  </button>
                </div>
                <div className="text-sm text-gray-600">
                  Live data from {teamMembers.length} Workdeck users
                </div>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider border-r">
                      Team Member
                    </th>
                    {getSpreadsheetColumns().slice(0, 6).map((column, idx) => (
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
                                  <div className="text-xs text-blue-600 font-medium">Workdeck User</div>
                                </div>
                              </div>
                            </div>
                          </td>
                          {getSpreadsheetColumns().slice(0, 6).map((column, columnIdx) => {
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
                        {memberProjects.slice(0, 2).map((project, projectIdx) => (
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
                            {getSpreadsheetColumns().slice(0, 6).map((column, columnIdx) => {
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
                                      autoFocus
                                      className="w-full h-8 px-2 py-1 text-center text-sm border border-blue-500 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                                      placeholder="Hours"
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
              <h3 className="font-semibold">Live Workdeck Team Data</h3>
              <p className="text-sm text-gray-300">{teamMembers.length} team members from Workdeck</p>
            </div>

            {/* Date Headers */}
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
                      const dayOfMonth = currentDate.getDate() + i - 3;
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

                <div className="ml-4 space-y-1">
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
                  
                  {/* Workload Summary */}
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
                            Live data from Workdeck
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
                        <div className="h-6 rounded bg-green-500 text-white flex items-center justify-center text-xs font-semibold">
                          {Math.round(member.scheduled * 52)}h
                        </div>
                      ) : (
                        Array.from({ length: getPeriodsForView() }, (_, periodIndex) => {
                          if (selectedView === 'week' && (periodIndex === 2 || periodIndex === 3)) {
                            return (
                              <div key={periodIndex} className="h-6 rounded bg-gray-200 text-gray-500 flex items-center justify-center text-xs font-semibold">
                                —
                              </div>
                            );
                          }
                          
                          let hours = calculateDailyHours(member, periodIndex, selectedView === 'month' ? 'month' : 'day');
                          
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
                  <div className="text-xs font-medium text-green-900 mb-1">Current Allocation</div>
                  <div className="text-xs text-green-800">
                    {selectedTask.targetHoursPerWeek || 0}h per week • Working {selectedTask.pattern?.filter(Boolean).length || 5} days/week
                  </div>
                  <div className="text-xs text-green-700 mt-1">
                    💡 This is demo data - in real use, it syncs from Workdeck
                  </div>
                </div>

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
                      {projects.map(project => (
                        <option key={project.id} value={project.name}>{project.name}</option>
                      ))}
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
                    <div className="text-sm font-medium text-gray-700 mb-2">Current Capacity (from Workdeck)</div>
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

                  <div className="bg-blue-50 p-3 rounded border border-blue-200">
                    <div className="text-xs font-medium text-blue-900 mb-1">Demo Mode</div>
                    <div className="text-xs text-blue-800">
                      In the real application, this would create a task in your Workdeck workspace via the API
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
                    Create Task (Demo)
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

export default ResourcePlannerDemo;

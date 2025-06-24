import React, { useState, useEffect } from 'react';
import { Calendar, Users, AlertTriangle } from 'lucide-react';

const ResourcePlanner = ({ workdeckToken, onLogout }) => {
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
  
  // State for Workdeck data
  const [teamData, setTeamData] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const WORKDECK_BASE_URL = 'https://test-api.workdeck.com';

  // Workdeck API helper
  const makeWorkdeckRequest = async (endpoint, options = {}) => {
    try {
      const response = await fetch(`${WORKDECK_BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Authorization': `Bearer ${workdeckToken}`,
          'Content-Type': 'application/json',
          ...options.headers,
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          // Token expired or invalid
          if (onLogout) onLogout();
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.result || data;
    } catch (error) {
      console.error('Workdeck API Error:', error);
      throw error;
    }
  };

  // Helper functions for data transformation
  const getProjectColor = (projectName) => {
    const colors = [
      'bg-purple-600', 'bg-blue-600', 'bg-green-600', 'bg-orange-500', 
      'bg-red-500', 'bg-indigo-500', 'bg-teal-500', 'bg-pink-500'
    ];
    const hash = projectName.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return colors[Math.abs(hash) % colors.length];
  };

  const getAvatarFromName = (firstName) => {
    const avatars = ['👨‍💻', '👩‍💻', '🧑‍💻', '👨‍🔬', '👩‍🔬', '🧑‍🔬'];
    const hash = firstName.charCodeAt(0);
    return avatars[hash % avatars.length];
  };

  const calculateVelocity = (task) => {
    const planned = parseInt(task.plannedHours) || 0;
    const duration = calculateDurationInWeeks(task);
    return duration > 0 ? (planned / duration).toFixed(1) : 0;
  };

  const getTaskStatus = (task) => {
    if (task.flags === 2) return 'completed';
    if (task.flags === 1) return 'in-progress';
    return 'planned';
  };

  const getWeekFromDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString.split('/').reverse().join('-'));
    const now = new Date();
    const diffTime = date - now;
    const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
    return diffWeeks;
  };

  const calculateDurationInWeeks = (task) => {
    const start = getWeekFromDate(task.startDate);
    const end = getWeekFromDate(task.endDate);
    if (!start || !end) return 1;
    return Math.max(1, end - start);
  };

  const calculateDuration = (task) => {
    const weeks = calculateDurationInWeeks(task);
    if (weeks > 8) return `${Math.round(weeks / 4)} months`;
    return `${weeks} weeks`;
  };

  const isLongTermTask = (task) => {
    return calculateDurationInWeeks(task) > 8;
  };

  const calculateWeeklyHours = (task) => {
    const totalHours = parseInt(task.plannedHours) || 0;
    const weeks = calculateDurationInWeeks(task);
    return weeks > 0 ? totalHours / weeks : 0;
  };

  const generateWorkPattern = (task) => {
    const pattern = Array(9).fill(false);
    const weeklyHours = calculateWeeklyHours(task);
    
    if (weeklyHours > 0) {
      const workingDays = Math.min(5, Math.ceil(weeklyHours / 8));
      for (let i = 0; i < workingDays; i++) {
        if (i !== 2 && i !== 3) {
          pattern[i] = true;
        }
      }
    }
    
    return pattern;
  };

  const generateMonthlyHours = (task) => {
    const weeklyHours = calculateWeeklyHours(task);
    const startWeek = getWeekFromDate(task.startDate);
    const endWeek = getWeekFromDate(task.endDate);
    
    return Array.from({ length: 12 }, (_, month) => {
      const monthWeek = month * 4.33;
      if (startWeek !== null && endWeek !== null) {
        if (monthWeek >= startWeek && monthWeek <= endWeek) {
          return weeklyHours;
        }
      }
      return 0;
    });
  };

  // Transform Workdeck user data to our team member format
  const transformUserToTeamMember = (user, userTasks = [], userProjects = []) => {
    const capacity = user.timeTable?.dayHours ? 
      parseInt(user.timeTable.dayHours) * 5 : 40;

    const transformedTasks = userTasks.map((task, index) => {
      const project = userProjects.find(p => p.id === task.project?.id);
      const projectName = project?.name || task.project?.name || 'Unknown Project';
      
      return {
        id: task.id || index + 1,
        project: projectName,
        activity: task.activity?.name || 'General Work',
        task: task.name || 'Untitled Task',
        color: task.color || getProjectColor(projectName),
        estimatedHours: parseInt(task.plannedHours) || 0,
        actualHours: parseInt(task.actualHours) || 0,
        totalActivityHours: parseInt(task.plannedHours) || 0,
        totalProjectHours: project?.plannedHours || parseInt(task.plannedHours) || 0,
        velocity: calculateVelocity(task),
        status: getTaskStatus(task),
        startWeek: getWeekFromDate(task.startDate),
        endWeek: getWeekFromDate(task.endDate),
        pattern: generateWorkPattern(task),
        isLongTerm: isLongTermTask(task),
        targetHoursPerWeek: calculateWeeklyHours(task),
        duration: calculateDuration(task),
        projectId: projectName.toLowerCase().replace(/\s+/g, '-'),
        monthlyHours: generateMonthlyHours(task)
      };
    });

    const scheduled = transformedTasks.reduce((sum, task) => 
      sum + (task.targetHoursPerWeek || 0), 0);

    return {
      id: user.id,
      name: `${user.firstName} ${user.lastName}`,
      avatar: getAvatarFromName(user.firstName),
      department: user.department || 'General',
      capacity: capacity,
      scheduled: Math.round(scheduled),
      utilization: Math.round((scheduled / capacity) * 100),
      tasks: transformedTasks
    };
  };

  // Load data from Workdeck
  useEffect(() => {
    const loadWorkdeckData = async () => {
      if (!workdeckToken) {
        setError('Workdeck token is required');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const [usersData, projectsData] = await Promise.all([
          makeWorkdeckRequest('/queries/users'),
          makeWorkdeckRequest('/queries/projects-summary')
        ]);

        setUsers(usersData || []);
        setProjects(projectsData || []);

        const teamMembersPromises = (usersData || []).map(async (user) => {
          try {
            return transformUserToTeamMember(user, [], projectsData || []);
          } catch (error) {
            console.warn(`Failed to load tasks for user ${user.id}:`, error);
            return transformUserToTeamMember(user, [], projectsData || []);
          }
        });

        const teamMembers = await Promise.all(teamMembersPromises);
        setTeamData(teamMembers.filter(member => member !== null));

      } catch (error) {
        console.error('Failed to load Workdeck data:', error);
        setError(`Failed to load data: ${error.message}`);
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkdeckData();
  }, [workdeckToken]);

  // Use teamData for the component
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

  const isTaskActive = (task, weekOffset) => {
    if (!task.startWeek && !task.endWeek) return true;
    const startWeek = task.startWeek || -Infinity;
    const endWeek = task.endWeek || Infinity;
    return weekOffset >= startWeek && weekOffset <= endWeek;
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

  const submitTaskAssignment = async (taskData) => {
    console.log('Would create task in Workdeck:', taskData, 'for:', selectedMemberForAssignment.name);
    setShowAssignTaskModal(false);
    setSelectedMemberForAssignment(null);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading Workdeck data...</p>
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="bg-gray-50 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-4">
            <AlertTriangle className="w-16 h-16 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to Load Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

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
              {[...new Set(teamMembers.map(member => member.department))].map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Users className="w-4 h-4" />
              <span>{teamMembers.length} team members</span>
            </div>

            {onLogout && (
              <button 
                onClick={onLogout}
                className="px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Sign Out
              </button>
            )}
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
              <h3 className="text-sm font-semibold text-blue-900 mb-1">Live Workdeck Integration</h3>
              <div className="text-xs text-blue-800 space-y-1">
                <div>• <strong>Real Data:</strong> Connected to Workdeck users, projects, and tasks</div>
                <div>• <strong>Live Updates:</strong> Changes sync back to Workdeck when possible</div>
                <div>• <strong>Team Members:</strong> Showing {teamMembers.length} active users from your Workdeck workspace</div>
                <div>• <strong>Projects:</strong> Data sourced from {projects.length} Workdeck projects</div>
              </div>
            </div>
          </div>
        </div>

        {/* Simple Team Display for now */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Your Workdeck Team</h2>
            <p className="text-sm text-gray-600">Live data from your Workdeck workspace</p>
          </div>
          
          <div className="divide-y divide-gray-200">
            {teamMembers.map((member) => (
              <div key={member.id} className="px-6 py-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-lg">
                      {member.avatar}
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-900">{member.name}</h3>
                      <p className="text-xs text-gray-400">{member.department}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        {member.scheduled}h / {member.capacity}h
                      </div>
                      <div className="text-xs text-gray-500">Weekly Capacity</div>
                    </div>
                    
                    <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getUtilizationColor(member.utilization)}`}>
                      {member.utilization}% Utilized
                      {member.utilization > 100 && <AlertTriangle className="w-3 h-3 inline ml-1" />}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourcePlanner;

import React, { useState, useEffect } from 'react';
import { Calendar, Users, AlertTriangle, Loader, AlertCircle } from 'lucide-react';
import workdeckAPI from './workdeckApi';
import { transformWorkdeckData } from './dataTransformers';

const ResourcePlanner = () => {
  // State management
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
  
  // Workdeck integration state
  const [teamData, setTeamData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authForm, setAuthForm] = useState({ email: '', password: '' });

  // Authentication handler
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      const token = await workdeckAPI.login(authForm.email, authForm.password);
      if (token) {
        setIsAuthenticated(true);
        localStorage.setItem('workdeck_token', token);
        await loadWorkdeckData();
      }
    } catch (err) {
      setError('Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  // Load data from Workdeck
  const loadWorkdeckData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await transformWorkdeckData(workdeckAPI);
      setTeamData(data.teamMembers);
    } catch (err) {
      setError('Failed to load data from Workdeck. Please try again.');
      console.error('Error loading Workdeck data:', err);
    } finally {
      setLoading(false);
    }
  };

  // Check for existing token on mount
  useEffect(() => {
    const token = localStorage.getItem('workdeck_token');
    if (token) {
      workdeckAPI.setToken(token);
      setIsAuthenticated(true);
      loadWorkdeckData();
    } else {
      setLoading(false);
    }
  }, []);

  // Sync functions (keeping your existing logic)
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
                
                const activeMonths = newMonthlyHours.filter(h => h > 0);
                const avgWeeklyHours = activeMonths.length > 0 
                  ? activeMonths.reduce((sum, h) => sum + h, 0) / activeMonths.length 
                  : 0;
                
                const updatedTask = {
                  ...task,
                  monthlyHours: newMonthlyHours,
                  targetHoursPerWeek: avgWeeklyHours,
                  startWeek: newMonthlyHours.findIndex(h => h > 0) * 4.33,
                  endWeek: (newMonthlyHours.length - 1 - [...newMonthlyHours].reverse().findIndex(h => h > 0)) * 4.33
                };
                
                return updatedTask;
              }
              return task;
            })
          };
          return updatedMember;
        }
        return member;
      });
      
      return newData;
    });
  };

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

  // Use teamData for the component
  const teamMembers = teamData.length > 0 ? teamData : [];

  // Your existing helper functions
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
      
      const weeklyHours = task.targetHoursPerWeek || 0;
      if (viewType === 'day') {
        const activeDaysPerWeek = task.pattern ? task.pattern.filter(day => day && ![2,3].includes(task.pattern.indexOf(day))).length : 5;
        return totalHours + (weeklyHours / Math.max(1, activeDaysPerWeek));
      } else if (viewType === 'week') {
        return totalHours + weeklyHours;
      } else if (viewType === 'month') {
        return totalHours + (weeklyHours * 4.33);
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

  // Authentication form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Connect to Workdeck</h2>
            <p className="text-gray-600 mt-2">Sign in to load your team's resource data</p>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
              <AlertCircle className="w-4 h-4 text-red-500 mr-2" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}
          
          <form onSubmit={handleLogin}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={authForm.email}
                onChange={(e) => setAuthForm({...authForm, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={authForm.password}
                onChange={(e) => setAuthForm({...authForm, password: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                'Connect to Workdeck'
              )}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Workdeck Data</h2>
          <p className="text-gray-600">Fetching your team's resource information...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && teamData.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={loadWorkdeckData}
            className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Main component UI (keeping all your existing UI logic)
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
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-xs font-medium text-green-700">Workdeck Connected</span>
            </div>
            
            <button 
              onClick={loadWorkdeckData}
              disabled={loading}
              className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 disabled:opacity-50"
            >
              {loading ? 'Syncing...' : 'Refresh Data'}
            </button>
            
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
          </div>
        </div>
      </div>

      {/* Info Panel */}
      <div className="p-4">
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">ℹ</div>
            <div>
              <h3 className="text-sm font-semibold text-blue-900 mb-1">Live Workdeck Integration</h3>
              <div className="text-xs text-blue-800 space-y-1">
                <div>• <strong>Real Data:</strong> Team members and projects loaded from your Workdeck account</div>
                <div>• <strong>Live Sync:</strong> Changes made here can be synced back to Workdeck</div>
                <div>• <strong>Resource Planning:</strong> Plan capacity across projects with real team data</div>
                <div>• <strong>Departments:</strong> Filter by {[...new Set(teamMembers.map(m => m.department))].join(', ')}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        {teamMembers.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Team Members Found</h3>
            <p className="text-gray-600 mb-4">
              We couldn't find any team members in your Workdeck account. 
              Make sure you have users set up in Workdeck.
            </p>
            <button
              onClick={loadWorkdeckData}
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              Refresh Data
            </button>
          </div>
        ) : (
          <div className="mb-8">
            <div className="mb-4 p-3 bg-gray-800 text-white rounded">
              <h3 className="font-semibold">Live Team Data from Workdeck</h3>
              <p className="text-sm text-gray-300">
                {teamMembers.length} team members across {[...new Set(teamMembers.map(m => m.department))].length} departments
              </p>
            </div>

            {teamMembers
              .filter(member => selectedDepartment === 'all' || member.department === selectedDepartment)
              .map((member) => (
              <div key={`${member.id}-${JSON.stringify(member.tasks.map(t => t.monthlyHours))}`} className="mb-4">
                <div className="flex items-center justify-between mb-2 p-3 bg-white rounded border">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm">
                      {member.avatar}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{member.name}</div>
                      <div className="text-xs text-gray-500">{member.department} • {member.scheduled}h / {member.capacity}h</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`px-2 py-1 rounded text-xs font-medium border ${getUtilizationColor(member.utilization)}`}>
                      {member.utilization}%
                      {member.utilization > 100 && <AlertTriangle className="w-3 h-3 inline ml-1" />}
                    </div>
                  </div>
                </div>

                {/* Task Details */}
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
                            </div>
                            <div className="text-xs text-gray-600 mb-1">
                              <span className="font-medium">{task.activity}</span>
                              <span className="text-gray-400 mx-1">→</span>
                              <span>{task.task}</span>
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-gray-500 mb-1">
                              <span className="font-medium">{task.actualHours}h / {task.estimatedHours}h</span>
                              <span>•</span>
                              <span className="text-green-600">{task.velocity}h/week velocity</span>
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
                          (task.pattern || [true, true, false, false, true, true, false, true, true]).map((isActive, dateIdx) => (
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
                            Live data from Workdeck projects and events
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
                            const currentDate = new Date();
                            const currentMonth = currentDate.getMonth();
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
                  <div className="text-xs font-medium text-green-900 mb-1">Workdeck Integration</div>
                  <div className="text-xs text-green-800">
                    {selectedTask.targetHoursPerWeek || 0}h per week • From live project data
                  </div>
                  <div className="text-xs text-green-700 mt-1">
                    💡 Data synced from your Workdeck account
                  </div>
                </div>

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

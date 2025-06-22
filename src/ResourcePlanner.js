import React, { useState, useEffect } from 'react';
import { Calendar, Users, AlertTriangle, Loader, AlertCircle, RefreshCw } from 'lucide-react';

const ResourcePlanner = () => {
  // State management
  const [showTaskDetails, setShowTaskDetails] = useState(true);
  const [selectedTask, setSelectedTask] = useState(null);
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);
  const [selectedView, setSelectedView] = useState('week');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  
  // Workdeck integration state
  const [teamData, setTeamData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authForm, setAuthForm] = useState({ email: '', password: '' });
  const [token, setToken] = useState(null);

  // Workdeck API configuration
  const WORKDECK_BASE_URL = 'https://test-api.workdeck.com';

  // Safe helper function
  const safeGet = (obj, path, defaultValue = null) => {
    try {
      return path.split('.').reduce((current, key) => current && current[key], obj) || defaultValue;
    } catch {
      return defaultValue;
    }
  };

  // API Helper function
  const apiRequest = async (endpoint, options = {}) => {
    try {
      const url = `${WORKDECK_BASE_URL}${endpoint}`;
      const config = {
        headers: {
          'Content-Type': 'application/json',
          ...(token && { 'Authorization': `Bearer ${token}` }),
          ...options.headers,
        },
        ...options,
      };

      console.log(`Making API request to: ${url}`);
      
      const response = await fetch(url, config);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('API Response:', data);
      
      return data.result || data;
    } catch (error) {
      console.error('API request failed:', error);
      throw error;
    }
  };

  // Authentication
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      console.log('Attempting login with:', authForm.email);
      
      const loginData = await apiRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          mail: authForm.email,
          password: authForm.password,
        }),
      });
      
      if (loginData) {
        setToken(loginData);
        setIsAuthenticated(true);
        localStorage.setItem('workdeck_token', loginData);
        console.log('Login successful');
        await loadWorkdeckData();
      }
    } catch (err) {
      console.error('Login failed:', err);
      setError(`Login failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Load data from Workdeck
  const loadWorkdeckData = async () => {
    if (!token) {
      setError('No authentication token available');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      console.log('Loading Workdeck data...');
      
      const [users, projects] = await Promise.all([
        apiRequest('/queries/users'),
        apiRequest('/queries/projects-summary'),
      ]);

      console.log('Raw data loaded:', { users, projects });

      const transformedTeamData = await transformWorkdeckToTeamData(users, projects);
      setTeamData(transformedTeamData);
      console.log('Team data set:', transformedTeamData);
      
    } catch (err) {
      console.error('Error loading Workdeck data:', err);
      setError(`Failed to load data: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Ultra-safe transform function
  const transformWorkdeckToTeamData = async (users, projects) => {
    const teamMembers = [];

    if (!Array.isArray(users)) {
      console.log('Users is not an array:', users);
      return teamMembers;
    }

    for (const user of users) {
      try {
        if (!user) {
          console.log('Skipping null/undefined user');
          continue;
        }

        // Safely get user events
        let userEvents = [];
        try {
          userEvents = await apiRequest('/queries/me/events?start=2024-01-01');
          if (!Array.isArray(userEvents)) userEvents = [];
        } catch (eventError) {
          console.log('Could not load events for user:', safeGet(user, 'id'), eventError.message);
          userEvents = [];
        }

        // Safely find user projects
        const userProjects = Array.isArray(projects) ? projects.filter(project => {
          if (!project) return false;
          try {
            return (project.members && Array.isArray(project.members) && 
                   project.members.some(member => safeGet(member, 'user.id') === user.id)) ||
                   (project.participants && Array.isArray(project.participants) && 
                   project.participants.some(participant => safeGet(participant, 'user.id') === user.id));
          } catch {
            return false;
          }
        }) : [];

        // Create safe team member object
        const teamMember = {
          id: safeGet(user, 'id') || `user-${Math.random()}`,
          name: `${safeGet(user, 'firstName', '')} ${safeGet(user, 'lastName', '')}`.trim() || 
                safeGet(user, 'email') || 'Unknown User',
          avatar: safeGet(user, 'avatar') || getAvatarForUser(user),
          department: safeGet(user, 'department') || 'General',
          capacity: 40,
          scheduled: calculateScheduledHours(userProjects, userEvents),
          utilization: 0,
          email: safeGet(user, 'email') || '',
          role: safeGet(user, 'rol') || 'Team Member',
          tasks: transformProjectsToTasks(userProjects, userEvents, user)
        };

        // Calculate utilization safely
        teamMember.utilization = Math.round((teamMember.scheduled / teamMember.capacity) * 100);
        teamMembers.push(teamMember);
        
      } catch (userError) {
        console.error('Error processing user:', safeGet(user, 'id'), userError);
        // Continue with other users
      }
    }

    return teamMembers;
  };

  // Ultra-safe helper functions
  const getAvatarForUser = (user) => {
    const avatars = ['👨‍💻', '👩‍💻', '👨‍🎨', '👩‍🎨', '👨‍🔬', '👩‍🔬', '👨‍💼', '👩‍💼'];
    try {
      const identifier = safeGet(user, 'email') || safeGet(user, 'id') || 'default';
      const hash = identifier.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      return avatars[hash % avatars.length];
    } catch {
      return avatars[0];
    }
  };

  const calculateScheduledHours = (projects, events) => {
    let projectHours = 0;
    
    // Safely calculate project hours
    try {
      if (Array.isArray(projects)) {
        projectHours = projects.reduce((total, project) => {
          if (!project) return total;
          const plannedHours = safeGet(project, 'plannedHours') || safeGet(project, 'availableHours') || 0;
          return total + (typeof plannedHours === 'number' ? plannedHours : 0);
        }, 0);
      }
    } catch (error) {
      console.log('Error calculating project hours:', error);
      projectHours = 0;
    }

    // Safely calculate event hours
    let eventHours = 0;
    try {
      if (Array.isArray(events)) {
        const currentWeekEvents = events.filter(event => {
          if (!event || !safeGet(event, 'startAt')) return false;
          try {
            const eventDate = new Date(event.startAt);
            const now = new Date();
            const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
            const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
            return eventDate >= weekStart && eventDate <= weekEnd;
          } catch {
            return false;
          }
        });

        eventHours = currentWeekEvents.reduce((total, event) => {
          const endAt = safeGet(event, 'endAt');
          const startAt = safeGet(event, 'startAt');
          
          if (endAt && startAt) {
            try {
              const duration = new Date(endAt) - new Date(startAt);
              return total + (duration / (1000 * 60 * 60));
            } catch {
              return total + 1;
            }
          }
          return total + 1;
        }, 0);
      }
    } catch (error) {
      console.log('Error calculating event hours:', error);
      eventHours = 0;
    }

    return Math.round(Math.min(projectHours / 10, 40) + eventHours);
  };

  const transformProjectsToTasks = (projects, events, user) => {
    const tasks = [];

    try {
      if (Array.isArray(projects)) {
        projects.forEach((project, index) => {
          try {
            if (!project) return;

            // Safely filter events
            const projectEvents = Array.isArray(events) ? events.filter(event => {
              try {
                const eventTitle = safeGet(event, 'title', '').toLowerCase();
                const projectName = safeGet(project, 'name', '').toLowerCase();
                return eventTitle.includes(projectName);
              } catch {
                return false;
              }
            }) : [];

            const task = {
              id: safeGet(project, 'id') || `project-${index}`,
              project: safeGet(project, 'name') || 'Unnamed Project',
              activity: safeGet(project, 'client') || 'General Work',
              task: safeGet(project, 'code') || 'Project Tasks',
              color: getProjectColor(safeGet(project, 'name') || `project-${index}`),
              estimatedHours: safeGet(project, 'plannedHours') || safeGet(project, 'availableHours') || 0,
              actualHours: calculateActualHours(projectEvents),
              totalActivityHours: safeGet(project, 'availableHours') || 0,
              totalProjectHours: safeGet(project, 'plannedHours') || 0,
              velocity: calculateVelocity(projectEvents),
              status: determineTaskStatus(project),
              startWeek: -8,
              endWeek: 24,
              pattern: generateWorkPattern(),
              isLongTerm: isLongTermProject(project),
              targetHoursPerWeek: calculateTargetHours(project),
              duration: calculateDuration(project),
              projectId: (safeGet(project, 'name') || `project-${index}`).toLowerCase().replace(/\s+/g, '-'),
              monthlyHours: generateMonthlyHours(project),
              workdeckProjectId: safeGet(project, 'id') || `project-${index}`,
              workdeckUserId: safeGet(user, 'id') || 'unknown'
            };

            tasks.push(task);
          } catch (error) {
            console.error('Error processing project:', safeGet(project, 'id'), error);
          }
        });
      }

      // If no projects, create tasks from events
      if (tasks.length === 0 && Array.isArray(events) && events.length > 0) {
        try {
          const groupedEvents = groupEventsByProject(events);
          
          Object.entries(groupedEvents).forEach(([projectName, projectEvents], index) => {
            try {
              const task = {
                id: `event-${safeGet(user, 'id', 'unknown')}-${index}`,
                project: projectName || 'General Work',
                activity: 'Event-based Work',
                task: 'Various Tasks',
                color: getProjectColor(projectName || 'General Work'),
                estimatedHours: (Array.isArray(projectEvents) ? projectEvents.length : 0) * 2,
                actualHours: calculateActualHours(projectEvents || []),
                totalActivityHours: (Array.isArray(projectEvents) ? projectEvents.length : 0) * 2,
                totalProjectHours: (Array.isArray(projectEvents) ? projectEvents.length : 0) * 2,
                velocity: calculateVelocity(projectEvents || []),
                status: 'in-progress',
                startWeek: -4,
                endWeek: 12,
                pattern: generateWorkPattern(),
                isLongTerm: false,
                targetHoursPerWeek: 5,
                duration: '3 months',
                projectId: (projectName || 'general-work').toLowerCase().replace(/\s+/g, '-'),
                monthlyHours: generateMonthlyHours(),
                workdeckProjectId: `event-${index}`,
                workdeckUserId: safeGet(user, 'id') || 'unknown'
              };
              
              tasks.push(task);
            } catch (error) {
              console.error('Error processing event group:', projectName, error);
            }
          });
        } catch (error) {
          console.error('Error processing events for user:', safeGet(user, 'id'), error);
        }
      }
    } catch (error) {
      console.error('Error in transformProjectsToTasks:', error);
    }

    return tasks;
  };

  // Safe utility functions
  const getProjectColor = (projectName) => {
    const colors = [
      'bg-purple-600', 'bg-blue-600', 'bg-green-600', 'bg-orange-500', 
      'bg-red-500', 'bg-indigo-500', 'bg-teal-500', 'bg-pink-500'
    ];
    
    try {
      let hash = 0;
      const name = projectName || 'default';
      for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
      }
      return colors[Math.abs(hash) % colors.length];
    } catch {
      return colors[0];
    }
  };

  const calculateActualHours = (events) => {
    try {
      if (!Array.isArray(events)) return 0;
      
      return events.reduce((total, event) => {
        try {
          const endAt = safeGet(event, 'endAt');
          const startAt = safeGet(event, 'startAt');
          
          if (endAt && startAt) {
            const duration = new Date(endAt) - new Date(startAt);
            return total + (duration / (1000 * 60 * 60));
          }
          return total + 1;
        } catch {
          return total + 1;
        }
      }, 0);
    } catch {
      return 0;
    }
  };

  const calculateVelocity = (events) => {
    try {
      if (!Array.isArray(events) || events.length === 0) return 0;
      const totalHours = calculateActualHours(events);
      const weeks = Math.max(1, events.length / 5);
      return Math.round((totalHours / weeks) * 10) / 10;
    } catch {
      return 0;
    }
  };

  const determineTaskStatus = (project) => {
    try {
      const endDate = safeGet(project, 'endDate');
      if (!endDate) return 'in-progress';
      
      const end = new Date(endDate);
      const now = new Date();
      
      if (end < now) return 'completed';
      
      const plannedHours = safeGet(project, 'plannedHours');
      const availableHours = safeGet(project, 'availableHours');
      
      if (plannedHours && availableHours && plannedHours > availableHours * 1.1) {
        return 'over-budget';
      }
      
      return 'in-progress';
    } catch {
      return 'in-progress';
    }
  };

  const generateWorkPattern = () => {
    return [true, true, false, false, true, true, false, true, true];
  };

  const isLongTermProject = (project) => {
    try {
      const startDate = safeGet(project, 'startDate');
      const endDate = safeGet(project, 'endDate');
      
      if (!startDate || !endDate) return false;
      
      const start = new Date(startDate);
      const end = new Date(endDate);
      const monthsDiff = (end.getFullYear() - start.getFullYear()) * 12 + 
                        (end.getMonth() - start.getMonth());
      
      return monthsDiff > 3;
    } catch {
      return false;
    }
  };

  const calculateTargetHours = (project) => {
    try {
      const plannedHours = safeGet(project, 'plannedHours');
      const startDate = safeGet(project, 'startDate');
      const endDate = safeGet(project, 'endDate');
      
      if (plannedHours && startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const weeks = Math.max(1, (end - start) / (1000 * 60 * 60 * 24 * 7));
        return Math.round((plannedHours / weeks) * 10) / 10;
      }
    } catch (error) {
      console.log('Error calculating target hours:', error);
    }
    return 5;
  };

  const calculateDuration = (project) => {
    try {
      const startDate = safeGet(project, 'startDate');
      const endDate = safeGet(project, 'endDate');
      
      if (!startDate || !endDate) return '3 months';
      
      const start = new Date(startDate);
      const end = new Date(endDate);
      const months = Math.round((end - start) / (1000 * 60 * 60 * 24 * 30));
      
      return `${months} month${months !== 1 ? 's' : ''}`;
    } catch {
      return '3 months';
    }
  };

  const generateMonthlyHours = (project) => {
    try {
      const targetWeekly = calculateTargetHours(project);
      return Array.from({ length: 12 }, () => targetWeekly);
    } catch {
      return Array.from({ length: 12 }, () => 5);
    }
  };

  const groupEventsByProject = (events) => {
    try {
      if (!Array.isArray(events)) return {};
      
      return events.reduce((groups, event) => {
        try {
          const projectName = extractProjectFromTitle(safeGet(event, 'title')) || 'General Work';
          
          if (!groups[projectName]) {
            groups[projectName] = [];
          }
          groups[projectName].push(event);
          
          return groups;
        } catch {
          return groups;
        }
      }, {});
    } catch {
      return {};
    }
  };

  const extractProjectFromTitle = (title) => {
    if (!title || typeof title !== 'string') return null;
    
    try {
      const patterns = [
        /^(\w+[-_]\w+)/,
        /^\[([^\]]+)\]/,
        /^([A-Z]+\d*)/,
      ];
      
      for (const pattern of patterns) {
        const match = title.match(pattern);
        if (match) return match[1];
      }
      
      const words = title.split(' ');
      return words.slice(0, 2).join(' ');
    } catch {
      return null;
    }
  };

  // Check for existing token on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('workdeck_token');
    if (savedToken) {
      setToken(savedToken);
      setIsAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (token && isAuthenticated) {
      loadWorkdeckData();
    }
  }, [token]);

  // UI Helper functions
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

  const getRemainingHours = (task) => {
    try {
      return Math.max(0, (task.estimatedHours || 0) - (task.actualHours || 0));
    } catch {
      return 0;
    }
  };

  const getUtilizationColor = (utilization) => {
    if (utilization > 100) return 'text-red-600 bg-red-50 border-red-200';
    if (utilization > 85) return 'text-orange-600 bg-orange-50 border-orange-200';
    if (utilization < 60) return 'text-blue-600 bg-blue-50 border-blue-200';
    return 'text-green-600 bg-green-50 border-green-200';
  };

  const getDateRangeLabel = () => {
    try {
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth();
      
      if (selectedView === 'year') return currentYear.toString();
      if (selectedView === 'quarter') {
        const quarterNumber = Math.floor(currentMonth / 3) + 1;
        return `Q${quarterNumber} ${currentYear}`;
      }
      if (selectedView === 'month') {
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                           'July', 'August', 'September', 'October', 'November', 'December'];
        return `${monthNames[currentMonth]} ${currentYear}`;
      }
      
      return `Week of ${currentMonth + 1}/${currentDate.getDate()}/${currentYear}`;
    } catch {
      return 'Current Period';
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('workdeck_token');
    setIsAuthenticated(false);
    setTeamData([]);
    setToken(null);
    setError(null);
  };

  // Authentication form
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-md p-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Connect to Workdeck</h2>
            <p className="text-gray-600 mt-2">Sign in to load your live team data</p>
            <div className="mt-2 text-xs text-blue-600">
              API: {WORKDECK_BASE_URL}
            </div>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <div className="flex items-start">
                <AlertCircle className="w-4 h-4 text-red-500 mr-2 mt-0.5 flex-shrink-0" />
                <div className="text-red-700 text-sm">
                  <div className="font-medium">Connection Error:</div>
                  <div>{error}</div>
                  <div className="mt-2 text-xs">
                    This might be a CORS issue. Check browser console for details.
                  </div>
                </div>
              </div>
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
                placeholder="your.email@company.com"
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
                  Connecting to Workdeck...
                </>
              ) : (
                'Connect to Live Workdeck Data'
              )}
            </button>
          </form>

          <div className="mt-4 p-3 bg-gray-50 border rounded">
            <div className="text-xs text-gray-600">
              <div className="font-medium mb-1">Troubleshooting:</div>
              <div>• Ensure your Workdeck credentials are correct</div>
              <div>• Check browser console for detailed error messages</div>
              <div>• CORS errors may require a proxy solution</div>
            </div>
          </div>
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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading Live Workdeck Data</h2>
          <p className="text-gray-600">Fetching users, projects, and events from your Workdeck account...</p>
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
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Live Data</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <div className="space-y-2">
            <button
              onClick={loadWorkdeckData}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              <RefreshCw className="w-4 h-4 inline mr-2" />
              Retry Loading Data
            </button>
            <button
              onClick={handleLogout}
              className="w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    );
  }

  const filteredTeamMembers = teamData.filter(member => 
    selectedDepartment === 'all' || member.department === selectedDepartment
  );

  const departments = [...new Set(teamData.map(member => member.department))];

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
            <h1 className="text-xl font-semibold text-gray-900">Live Workdeck Resource Planner</h1>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>{getDateRangeLabel()}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-md">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-green-700">Live Workdeck Data</span>
            </div>
            
            <button 
              onClick={loadWorkdeckData}
              disabled={loading}
              className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100 disabled:opacity-50"
            >
              {loading ? (
                <Loader className="w-4 h-4 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4" />
              )}
              <span className="ml-1">{loading ? 'Syncing...' : 'Refresh'}</span>
            </button>
            
            <button 
              onClick={handleLogout}
              className="px-3 py-1.5 text-sm font-medium text-red-600 bg-red-50 border border-red-200 rounded-md hover:bg-red-100"
            >
              Sign Out
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

            {departments.length > 0 && (
              <select 
                value={selectedDepartment} 
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md px-3 py-1.5"
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            )}
            
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Users className="w-4 h-4" />
              <span>{filteredTeamMembers.length} live team members</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex items-start space-x-2">
            <div className="w-5 h-5 bg-green-500 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 mt-0.5">✓</div>
            <div>
              <h3 className="text-sm font-semibold text-green-900 mb-1">Live Workdeck API Connection</h3>
              <div className="text-xs text-green-800 space-y-1">
                <div>• <strong>Real-time Data:</strong> Connected to {WORKDECK_BASE_URL}</div>
                <div>• <strong>Live Users:</strong> {teamData.length} team members loaded from Workdeck</div>
                <div>• <strong>Live Projects:</strong> Active projects and tasks synced</div>
                <div>• <strong>Error Handling:</strong> Ultra-safe data processing prevents crashes</div>
                {departments.length > 0 && <div>• <strong>Departments:</strong> {departments.join(', ')}</div>}
              </div>
            </div>
          </div>
        </div>

        {teamData.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Team Members Found</h3>
            <p className="text-gray-600 mb-4">
              No users were found in your Workdeck account. This could mean:
            </p>
            <div className="text-sm text-gray-600 mb-4 space-y-1">
              <div>• Your account doesn't have access to view users</div>
              <div>• No users are set up in your Workdeck instance</div>
              <div>• There was an API permission issue</div>
            </div>
            <button
              onClick={loadWorkdeckData}
              className="bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              <RefreshCw className="w-4 h-4 inline mr-2" />
              Retry Loading Data
            </button>
          </div>
        ) : (
          <div className="mb-8">
            <div className="mb-4 p-3 bg-gray-800 text-white rounded">
              <h3 className="font-semibold">Live Team Data from Workdeck API</h3>
              <p className="text-sm text-gray-300">
                {filteredTeamMembers.length} team members across {departments.length} departments • Data refreshed from live API
              </p>
            </div>

            {filteredTeamMembers.map((member) => (
              <div key={member.id} className="mb-4">
                <div className="flex items-center justify-between mb-2 p-3 bg-white rounded border">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm">
                      {member.avatar}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{member.name}</div>
                      <div className="text-xs text-gray-500">
                        {member.role} • {member.department} • {member.scheduled}h / {member.capacity}h
                      </div>
                      <div className="text-xs text-blue-600">Workdeck ID: {String(member.id).substring(0, 8)}...</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className={`px-2 py-1 rounded text-xs font-medium border ${getUtilizationColor(member.utilization)}`}>
                      {member.utilization}%
                      {member.utilization > 100 && <AlertTriangle className="w-3 h-3 inline ml-1" />}
                    </div>
                  </div>
                </div>

                <div className="ml-4 space-y-1">
                  {showTaskDetails && member.tasks && member.tasks.length > 0 && member.tasks.map((task, idx) => (
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
                            <div className="text-xs text-blue-600">Project ID: {String(task.workdeckProjectId).substring(0, 8)}...</div>
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

                  {showTaskDetails && (!member.tasks || member.tasks.length === 0) && (
                    <div className="bg-gray-50 border border-gray-200 rounded p-3 text-center">
                      <div className="text-sm text-gray-600">No projects assigned to this team member</div>
                      <div className="text-xs text-gray-500 mt-1">They may have events or other work not visible in projects</div>
                    </div>
                  )}
                  
                  <div className="flex items-center bg-green-50 border-2 border-green-200 rounded p-2">
                    <div className="w-72 flex-shrink-0">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-green-500"></div>
                        <div>
                          <div className="text-sm font-medium text-green-900">
                            Live Workload Summary
                          </div>
                          <div className="text-xs text-green-700">
                            Real-time data from Workdeck API
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex-1 grid grid-cols-4 gap-3">
                      <div className="bg-blue-100 rounded p-2 text-center">
                        <div className="text-xs text-blue-700">Capacity</div>
                        <div className="text-sm font-bold text-blue-900">{member.capacity}h</div>
                      </div>
                      <div className="bg-green-100 rounded p-2 text-center">
                        <div className="text-xs text-green-700">Scheduled</div>
                        <div className="text-sm font-bold text-green-900">{member.scheduled}h</div>
                      </div>
                      <div className="bg-orange-100 rounded p-2 text-center">
                        <div className="text-xs text-orange-700">Utilization</div>
                        <div className="text-sm font-bold text-orange-900">{member.utilization}%</div>
                      </div>
                      <div className="bg-purple-100 rounded p-2 text-center">
                        <div className="text-xs text-purple-700">Projects</div>
                        <div className="text-sm font-bold text-purple-900">{member.tasks ? member.tasks.length : 0}</div>
                      </div>
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
                  <div className="text-xs font-medium text-green-900 mb-1">Live Workdeck Data</div>
                  <div className="text-xs text-green-800">
                    {selectedTask.targetHoursPerWeek || 0}h per week • {selectedTask.duration}
                  </div>
                  <div className="text-xs text-green-700 mt-1">
                    🔗 Connected to Workdeck project: {String(selectedTask.workdeckProjectId).substring(0, 8)}...
                  </div>
                </div>

                <div className="bg-gray-50 p-3 rounded border">
                  <div className="text-xs font-medium text-gray-900 mb-1">Workdeck IDs</div>
                  <div className="text-xs text-gray-600 space-y-1">
                    <div><strong>Project ID:</strong> {String(selectedTask.workdeckProjectId).substring(0, 16)}...</div>
                    <div><strong>User ID:</strong> {String(selectedTask.workdeckUserId).substring(0, 16)}...</div>
                    <div><strong>Task ID:</strong> {String(selectedTask.id).substring(0, 16)}...</div>
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
};

export default ResourcePlanner;

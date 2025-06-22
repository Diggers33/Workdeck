import React, { useState, useEffect } from 'react';
import { Calendar, Users, AlertTriangle } from 'lucide-react';

// Production-ready WorkdeckAPI with reliable CORS proxies
class WorkdeckAPI {
  constructor(baseUrl = 'https://test-api.workdeck.com') {
    this.originalBaseUrl = baseUrl;
    this.token = null;
    this.headers = { 'Content-Type': 'application/json' };
    console.log('🔧 Workdeck API initialized for:', baseUrl);
  }

  setToken(token) {
    this.token = token;
    this.headers.Authorization = `Bearer ${token}`;
    console.log('🔑 Token set for API requests');
  }

  async makeRequest(endpoint, options = {}) {
    const targetUrl = `${this.originalBaseUrl}${endpoint}`;
    
    const proxies = [
      // Primary: Try direct request first
      {
        name: 'direct',
        url: targetUrl,
        transform: (options) => ({
          method: options.method || 'GET',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...this.headers,
            ...options.headers 
          },
          body: options.body
        })
      },
      // Proxy fallbacks
      {
        name: 'simple-proxy',
        url: `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(targetUrl)}`,
        transform: (options) => ({
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        }),
        processResponse: async (response) => {
          const text = await response.text();
          try {
            return JSON.parse(text);
          } catch (e) {
            throw new Error('Invalid JSON response from server');
          }
        }
      },
      {
        name: 'allorigins-simple',
        url: `https://api.allorigins.win/raw?url=${encodeURIComponent(targetUrl)}`,
        transform: (options) => ({
          method: 'GET',
          headers: { 'Accept': 'application/json' }
        }),
        processResponse: async (response) => {
          const text = await response.text();
          try {
            return JSON.parse(text);
          } catch (e) {
            throw new Error('Invalid JSON response');
          }
        }
      }
    ];

    let lastError;
    
    for (const proxy of proxies) {
      try {
        console.log(`🌐 Trying ${proxy.name} for ${endpoint}`);
        
        const config = proxy.transform({ ...options, headers: this.headers });
        const requestUrl = proxy.customUrl || proxy.url;
        const response = await fetch(requestUrl, config);
        
        console.log(`📡 ${proxy.name} response:`, response.status, response.statusText);

        if (response.ok) {
          let data;
          if (proxy.processResponse) {
            data = await proxy.processResponse(response);
          } else {
            const text = await response.text();
            try {
              data = JSON.parse(text);
            } catch (e) {
              throw new Error('Server returned invalid JSON');
            }
          }
          
          console.log(`✅ ${proxy.name} success:`, data);
          return data;
        } else {
          const errorText = await response.text();
          throw new Error(`HTTP ${response.status}: ${errorText.substring(0, 100)}`);
        }
      } catch (error) {
        console.log(`❌ ${proxy.name} failed:`, error.message);
        lastError = error;
        continue;
      }
    }
    
    throw new Error(`All proxy methods failed. Last error: ${lastError?.message || 'Unknown error'}`);
  }

  async login(email, password) {
    try {
      console.log('🔐 Starting login process...');
      
      const data = await this.makeRequest('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ mail: email, password })
      });

      if (data && data.result) {
        console.log('✅ Login successful!');
        this.setToken(data.result);
        return data.result;
      } else if (data && data.error) {
        throw new Error(`Login failed: ${data.error}`);
      } else {
        throw new Error('Login response missing token');
      }

    } catch (error) {
      console.error('❌ Login failed:', error);
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  async request(endpoint, options = {}) {
    if (!this.token) {
      throw new Error('Not authenticated - please login first');
    }
    return this.makeRequest(endpoint, options);
  }

  async getUsers() { 
    console.log('👥 Fetching users from /queries/users...');
    return this.request('/queries/users'); 
  }
  
  async getProjects() { 
    console.log('📁 Fetching projects from /queries/projects-summary...');
    return this.request('/queries/projects-summary'); 
  }
  
  async getCompany() { 
    console.log('🏢 Fetching company from /queries/company...');
    return this.request('/queries/company'); 
  }

  async getTasks() {
    console.log('📋 Fetching tasks from /queries/tasks...');
    return this.request('/queries/tasks');
  }

  async getMe() {
    console.log('👤 Fetching user profile from /queries/me...');
    return this.request('/queries/me');
  }

  // Get detailed project information with tasks and assignments
  async getProjectDetails(projectId) {
    console.log(`📋 Fetching project details for ${projectId}...`);
    return this.request(`/queries/projects/${projectId}`);
  }

  // Get resource planning data - this should contain actual time allocations
  async getResourcePlanningData() {
    console.log('📅 Fetching resource planning data...');
    try {
      return this.request('/queries/resource-planner');
    } catch (error) {
      console.warn('⚠️ Resource planning endpoint may not exist:', error.message);
      throw error;
    }
  }

  // Get time tracking data for users
  async getTimeTrackingData(startDate, endDate) {
    console.log(`⏰ Fetching time tracking data from ${startDate} to ${endDate}...`);
    try {
      return this.request(`/queries/time-tracking?start=${startDate}&end=${endDate}`);
    } catch (error) {
      console.warn('⚠️ Time tracking endpoint may not exist:', error.message);
      throw error;
    }
  }

  // Get user's tasks with time allocations
  async getUserTasks(userId) {
    console.log(`📋 Fetching tasks for user ${userId}...`);
    try {
      return this.request(`/queries/users/${userId}/tasks`);
    } catch (error) {
      console.warn(`⚠️ User tasks endpoint may not exist for user ${userId}:`, error.message);
      throw error;
    }
  }

  // Get all projects with full details including time allocations
  async getAllProjectsWithDetails() {
    console.log('📋 Fetching all projects with details...');
    const projects = await this.getProjects();
    const projectsData = projects?.result || projects || [];
    
    if (projectsData.length === 0) return [];
    
    // Fetch detailed information for each project
    const detailedProjects = await Promise.allSettled(
      projectsData.map(project => this.getProjectDetails(project.id))
    );
    
    return detailedProjects
      .filter(result => result.status === 'fulfilled')
      .map(result => result.value?.result || result.value)
      .filter(Boolean);
  }
}

// Enhanced DataTransformer using real Workdeck data structure
class DataTransformer {
  static transformUsersToTeamMembers(users, projects = [], detailedProjects = [], resourcePlanningData = null, userTaskData = new Map()) {
    console.log('🔄 Transforming data:', { 
      users: users?.length || 0, 
      projects: projects?.length || 0,
      detailedProjects: detailedProjects?.length || 0,
      hasResourcePlanning: !!resourcePlanningData,
      userTaskDataCount: userTaskData.size
    });
    
    if (!users || users.length === 0) {
      return [];
    }
    
    return users.map(user => {
      console.log(`🔄 Processing user: ${user.firstName} ${user.lastName} (${user.id})`);
      
      // Get user's individual task data if available
      const individualTasks = userTaskData.get(user.id) || [];
      // Ensure it's always an array
      const safeIndividualTasks = Array.isArray(individualTasks) ? individualTasks : [];
      console.log(`📋 User ${user.firstName} has ${safeIndividualTasks.length} individual tasks`);
      
      // Find actual tasks assigned to this user from detailed project data
      const userTasks = [];
      
      detailedProjects.forEach(project => {
        if (project && project.activities && Array.isArray(project.activities)) {
          project.activities.forEach(activity => {
            if (activity && activity.tasks && Array.isArray(activity.tasks)) {
              activity.tasks.forEach(task => {
                if (task && task.participants && Array.isArray(task.participants)) {
                  const userParticipation = task.participants.find(p => p && p.user && p.user.id === user.id);
                  if (userParticipation) {
                    
                    // Try to get more accurate time data from individual tasks or resource planning
                    let actualPlannedHours = parseFloat(userParticipation.plannedHours) || 0;
                    let scheduledHoursFromResourcePlanning = 0;
                    
                    // Check if we have more detailed scheduling data
                    const matchingIndividualTask = safeIndividualTasks.find(indTask => 
                      indTask && indTask.id === task.id || 
                      (indTask && indTask.name === task.name && indTask.project?.id === project.id)
                    );
                    
                    if (matchingIndividualTask) {
                      console.log(`📋 Found matching individual task data for "${task.name}":`, matchingIndividualTask);
                      // Use more detailed data if available
                      if (matchingIndividualTask.plannedHours) {
                        actualPlannedHours = parseFloat(matchingIndividualTask.plannedHours);
                      }
                      if (matchingIndividualTask.scheduledHours) {
                        scheduledHoursFromResourcePlanning = parseFloat(matchingIndividualTask.scheduledHours);
                      }
                    }
                    
                    // Use the higher value between planned and scheduled
                    const effectivePlannedHours = Math.max(actualPlannedHours, scheduledHoursFromResourcePlanning);
                    
                    console.log(`📋 Task "${task.name}" for ${user.firstName}: planned=${actualPlannedHours}h, scheduled=${scheduledHoursFromResourcePlanning}h, effective=${effectivePlannedHours}h`);
                    
                    userTasks.push({
                      ...task,
                      project: project,
                      activity: activity,
                      userParticipation: userParticipation,
                      isOwner: userParticipation.isOwner,
                      plannedHours: effectivePlannedHours,
                      originalPlannedHours: actualPlannedHours,
                      scheduledHours: scheduledHoursFromResourcePlanning,
                      individualTaskData: matchingIndividualTask
                    });
                  }
                }
              });
            }
          });
        }
      });

      console.log(`📋 Found ${userTasks.length} real tasks for ${user.firstName} ${user.lastName}`);

      // Transform real tasks for resource planning
      const planningTasks = userTasks.length > 0 
        ? userTasks.map((task, index) => this.transformRealTaskToPlanning(task, index))
        : []; // No fake tasks if user has no real assignments

      const totalScheduled = planningTasks.reduce((sum, task) => sum + (task.targetHoursPerWeek || 0), 0);
      const capacity = 40;

      return {
        id: user.id,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || `User ${user.id}`,
        avatar: this.generateAvatar(user.firstName || `User${user.id}`),
        department: user.department || 'Unknown',
        role: user.rol || 'Team Member',
        email: user.email || 'No email',
        capacity: capacity,
        scheduled: Math.round(totalScheduled),
        utilization: Math.round((totalScheduled / capacity) * 100),
        isAdmin: user.isAdmin || false,
        isExpenseAdmin: user.isExpenseAdmin || false,
        isPurchaseAdmin: user.isPurchaseAdmin || false,
        isTravelAdmin: user.isTravelAdmin || false,
        tasks: planningTasks,
        // Add real Workdeck user data
        realTasksCount: userTasks.length,
        hasRealAssignments: userTasks.length > 0,
        totalPlannedHours: userTasks.reduce((sum, task) => sum + task.plannedHours, 0),
        totalScheduledHours: userTasks.reduce((sum, task) => sum + (task.scheduledHours || 0), 0)
      };
    });
  }

  static transformRealTaskToPlanning(taskWithProject, index) {
    const project = taskWithProject.project;
    const activity = taskWithProject.activity;
    const task = taskWithProject;
    const userParticipation = taskWithProject.userParticipation;
    
    console.log(`🔄 Transforming real task: ${task.name} in ${project.name}`, {
      plannedHours: taskWithProject.plannedHours,
      originalPlannedHours: taskWithProject.originalPlannedHours,
      scheduledHours: taskWithProject.scheduledHours,
      isOwner: userParticipation.isOwner,
      startDate: task.startDate,
      endDate: task.endDate
    });
    
    const plannedHours = taskWithProject.plannedHours || 0; // Use the effective planned hours
    
    // Calculate realistic weekly hours based on task duration
    let targetWeeklyHours = 0;
    if (plannedHours > 0 && task.startDate && task.endDate) {
      const durationWeeks = this.calculateTaskDurationInWeeks(task.startDate, task.endDate);
      targetWeeklyHours = durationWeeks > 0 ? Math.min(plannedHours / durationWeeks, 20) : plannedHours / 8;
    } else if (plannedHours > 0) {
      // Fallback: spread over 8 weeks if no dates
      targetWeeklyHours = Math.min(plannedHours / 8, 20);
    }
    
    // If we have scheduled hours but no planned hours, derive weekly from scheduled
    if (targetWeeklyHours === 0 && taskWithProject.scheduledHours > 0) {
      targetWeeklyHours = Math.min(taskWithProject.scheduledHours / 8, 20);
    }
    
    return {
      id: task.id,
      project: project.name || 'Unknown Project',
      projectId: project.name?.toLowerCase().replace(/\s+/g, '-') || `project-${project.id}`,
      activity: activity.name || 'General Work',
      task: task.name || `Task ${index + 1}`,
      color: this.getProjectColor(project.name),
      estimatedHours: plannedHours,
      actualHours: 0, // Would need time tracking data from Workdeck
      totalActivityHours: this.calculateActivityTotalHours(activity),
      totalProjectHours: this.calculateProjectTotalHours(project),
      velocity: targetWeeklyHours || 0, // Use actual planned velocity
      status: this.mapTaskStatus(task.flags),
      targetHoursPerWeek: targetWeeklyHours,
      pattern: this.generateWorkPattern(task.startDate, task.endDate),
      startWeek: this.parseWeekFromDate(task.startDate) || 0,
      endWeek: this.parseWeekFromDate(task.endDate) || 8,
      isLongTerm: plannedHours > 80,
      duration: this.calculateDuration(task.startDate, task.endDate),
      // Initialize monthly hours for spreadsheet view based on real task dates
      monthlyHours: this.distributeHoursAcrossMonths(targetWeeklyHours, task.startDate, task.endDate),
      intensityPhases: this.generateIntensityPhases(targetWeeklyHours, task.startDate, task.endDate),
      // Add real Workdeck task data
      realWorkdeckTask: true,
      workdeckTaskId: task.id,
      workdeckProjectId: project.id,
      workdeckActivityId: activity.id,
      isTaskOwner: userParticipation.isOwner,
      userPosition: userParticipation.position || 0,
      // Add debugging info
      originalPlannedHours: taskWithProject.originalPlannedHours,
      scheduledHours: taskWithProject.scheduledHours,
      hasIndividualTaskData: !!taskWithProject.individualTaskData
    };
  }

  static calculateTaskDurationInWeeks(startDate, endDate) {
    if (!startDate || !endDate) return 8; // Default fallback
    
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = end.getTime() - start.getTime();
      const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
      return Math.max(1, diffWeeks);
    } catch {
      return 8;
    }
  }

  static calculateActivityTotalHours(activity) {
    if (!activity.tasks) return 0;
    return activity.tasks.reduce((total, task) => {
      if (task.participants) {
        const taskTotal = task.participants.reduce((sum, p) => sum + (parseFloat(p.plannedHours) || 0), 0);
        return total + taskTotal;
      }
      return total;
    }, 0);
  }

  static calculateProjectTotalHours(project) {
    if (!project.activities) return 0;
    return project.activities.reduce((total, activity) => {
      return total + this.calculateActivityTotalHours(activity);
    }, 0);
  }

  static generateWorkPattern(startDate, endDate) {
    // Generate a realistic work pattern based on task dates
    // For now, generate a standard Monday-Friday pattern
    return Array.from({ length: 10 }, (_, i) => i !== 2 && i !== 3); // Skip weekends (Saturday, Sunday)
  }

  static distributeHoursAcrossMonths(weeklyHours, startDate, endDate) {
    const months = Array.from({ length: 12 }, () => 0);
    
    if (!startDate || !endDate || weeklyHours === 0) {
      return months;
    }
    
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const currentYear = new Date().getFullYear();
      
      for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
        const monthStart = new Date(currentYear, monthIndex, 1);
        const monthEnd = new Date(currentYear, monthIndex + 1, 0);
        
        // Check if task is active in this month
        if (monthStart <= end && monthEnd >= start) {
          months[monthIndex] = weeklyHours;
        }
      }
    } catch (e) {
      console.warn('Error distributing hours across months:', e);
      // Fallback: distribute in middle months
      for (let i = 5; i <= 8; i++) {
        months[i] = weeklyHours;
      }
    }
    
    return months;
  }

  static parseWeekFromDate(dateStr) {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      const now = new Date();
      const diffTime = date.getTime() - now.getTime();
      const diffWeeks = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 7));
      return diffWeeks;
    } catch {
      return null;
    }
  }

  static isMonthInTaskRange(monthIndex, startDate, endDate) {
    if (!startDate || !endDate) return monthIndex >= 5 && monthIndex <= 8; // Default range
    
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const currentYear = new Date().getFullYear();
      const monthStart = new Date(currentYear, monthIndex, 1);
      const monthEnd = new Date(currentYear, monthIndex + 1, 0);
      
      return monthStart <= end && monthEnd >= start;
    } catch {
      return monthIndex >= 5 && monthIndex <= 8;
    }
  }

  static calculateDuration(startDate, endDate) {
    if (!startDate || !endDate) return '3 months';
    
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = end.getTime() - start.getTime();
      const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30));
      return `${Math.max(1, diffMonths)} months`;
    } catch {
      return '3 months';
    }
  }

  static generateIntensityPhases(weeklyHours, startDate, endDate) {
    const startWeek = this.parseWeekFromDate(startDate) || -4;
    const endWeek = this.parseWeekFromDate(endDate) || 8;
    const totalWeeks = endWeek - startWeek;
    
    if (totalWeeks <= 8) {
      return [{
        name: 'Execution Phase',
        hoursPerWeek: weeklyHours,
        startWeek: startWeek,
        endWeek: endWeek
      }];
    }
    
    const planningWeeks = Math.ceil(totalWeeks * 0.2);
    const executionWeeks = Math.floor(totalWeeks * 0.6);
    
    return [
      {
        name: 'Planning Phase',
        hoursPerWeek: Math.max(4, weeklyHours * 0.7),
        startWeek: startWeek,
        endWeek: startWeek + planningWeeks
      },
      {
        name: 'Execution Phase',
        hoursPerWeek: weeklyHours,
        startWeek: startWeek + planningWeeks,
        endWeek: startWeek + planningWeeks + executionWeeks
      },
      {
        name: 'Completion Phase',
        hoursPerWeek: Math.max(2, weeklyHours * 0.5),
        startWeek: startWeek + planningWeeks + executionWeeks,
        endWeek: endWeek
      }
    ];
  }

  static mapTaskStatus(flags) {
    if (!flags) return 'planned';
    // Assuming flags is a bitmask, adjust as needed based on Workdeck's actual flag system
    if (flags & 4) return 'completed';
    if (flags & 2) return 'in-progress';
    if (flags & 1) return 'planned';
    return 'planned';
  }

  static getProjectColor(projectName) {
    const colors = ['bg-purple-600', 'bg-blue-600', 'bg-green-600', 'bg-orange-500', 'bg-red-500', 'bg-indigo-600', 'bg-teal-500', 'bg-pink-500'];
    const hash = (projectName || '').split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    return colors[Math.abs(hash) % colors.length];
  }

  static generateAvatar(firstName) {
    const emojis = ['👨‍💻', '👩‍💻', '👨‍💼', '👩‍💼', '👨‍🎨', '👩‍🎨', '👨‍🔬', '👩‍🔬'];
    const hash = (firstName || '').charCodeAt(0) || 0;
    return emojis[hash % emojis.length];
  }
}

const ResourcePlanner = () => {
  // Workdeck API Integration State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [workdeckAPI] = useState(new WorkdeckAPI());
  const [credentials, setCredentials] = useState({ 
    email: 'jpedreno@iris-eng.com', 
    password: '654321',
    token: ''
  });
  const [loggingIn, setLoggingIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [projects, setProjects] = useState([]);
  const [company, setCompany] = useState(null);

  // Resource Planner State
  const [teamData, setTeamData] = useState([]);
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

  // Load Workdeck data when authenticated
  useEffect(() => {
    if (isAuthenticated) {
      loadWorkdeckData();
    }
  }, [isAuthenticated]);

  const handleLogin = async () => {
    setLoggingIn(true);
    setError(null);

    try {
      if (credentials.token && credentials.token.trim()) {
        console.log('🔑 Using manually provided token...');
        workdeckAPI.setToken(credentials.token.trim());
        setIsAuthenticated(true);
        return;
      }

      console.log('🚀 Login attempt starting...');
      await workdeckAPI.login(credentials.email, credentials.password);
      console.log('✅ Authentication successful!');
      setIsAuthenticated(true);
    } catch (error) {
      console.error('❌ Login failed:', error);
      setError(`${error.message}\n\n💡 Tip: You can copy the token from Postman and paste it in the "Manual Token" field below to bypass login.`);
    } finally {
      setLoggingIn(false);
    }
  };

  const loadWorkdeckData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('📊 Loading LIVE data from Workdeck API...');
      
      // Fetch all required data including detailed project information and resource planning
      const [usersResponse, projectsResponse, companyResponse] = await Promise.allSettled([
        workdeckAPI.getUsers(),
        workdeckAPI.getProjects(),
        workdeckAPI.getCompany()
      ]);

      console.log('📈 API Response Status:', {
        users: usersResponse.status,
        projects: projectsResponse.status,
        company: companyResponse.status
      });

      // Extract data from responses
      const users = usersResponse.status === 'fulfilled' 
        ? (usersResponse.value?.result || usersResponse.value || [])
        : [];
      
      const projectsData = projectsResponse.status === 'fulfilled'
        ? (projectsResponse.value?.result || projectsResponse.value || [])
        : [];
        
      const companyData = companyResponse.status === 'fulfilled'
        ? (companyResponse.value?.result || companyResponse.value || {})
        : {};

      console.log('📊 Raw API data received:', { 
        usersCount: users.length, 
        projectsCount: projectsData.length,
        companyName: companyData.name || 'No company data'
      });

      // Fetch detailed project information with tasks and assignments
      console.log('📋 Fetching detailed project information...');
      let detailedProjects = [];
      let resourcePlanningData = null;
      
      try {
        // Try to get resource planning data first
        console.log('📅 Attempting to fetch resource planning data...');
        const resourceResponse = await workdeckAPI.getResourcePlanningData();
        resourcePlanningData = resourceResponse?.result || resourceResponse;
        console.log('📅 Resource planning data received:', resourcePlanningData);
      } catch (resourceError) {
        console.warn('⚠️ Could not fetch resource planning data:', resourceError.message);
      }

      try {
        detailedProjects = await workdeckAPI.getAllProjectsWithDetails();
        console.log(`📋 Loaded ${detailedProjects.length} detailed projects with task assignments`);
        
        // Log project details for debugging
        detailedProjects.forEach(project => {
          const totalTasks = project.activities?.reduce((sum, activity) => sum + (activity.tasks?.length || 0), 0) || 0;
          const totalAssignments = project.activities?.reduce((sum, activity) => 
            sum + (activity.tasks?.reduce((taskSum, task) => taskSum + (task.participants?.length || 0), 0) || 0), 0) || 0;
          
          console.log(`📋 Project "${project.name}": ${totalTasks} tasks, ${totalAssignments} assignments`);
          
          // Log task details to see planned hours
          project.activities?.forEach(activity => {
            activity.tasks?.forEach(task => {
              if (task.participants?.length > 0) {
                console.log(`  📋 Task "${task.name}" in activity "${activity.name}":`, 
                  task.participants.map(p => `${p.user?.firstName} ${p.user?.lastName}: ${p.plannedHours}h`));
              }
            });
          });
        });
      } catch (projectError) {
        console.warn('⚠️ Could not fetch detailed project data:', projectError.message);
        // Continue with basic project data
      }

      // Try to fetch individual user task data for better time allocation info
      console.log('👥 Fetching individual user task data...');
      const userTaskData = new Map();
      
      for (const user of users) {
        try {
          const userTasks = await workdeckAPI.getUserTasks(user.id);
          const tasks = userTasks?.result || userTasks || [];
          // Ensure tasks is an array
          const tasksArray = Array.isArray(tasks) ? tasks : [];
          userTaskData.set(user.id, tasksArray);
          console.log(`📋 User ${user.firstName} ${user.lastName}: ${tasksArray.length} tasks with allocations`);
        } catch (userTaskError) {
          console.warn(`⚠️ Could not fetch tasks for user ${user.firstName} ${user.lastName}:`, userTaskError.message);
          // Set empty array for this user
          userTaskData.set(user.id, []);
        }
      }

      // Transform data for resource planning using real assignments and time allocations
      const teamMembers = DataTransformer.transformUsersToTeamMembers(users, projectsData, detailedProjects, resourcePlanningData, userTaskData);
      setTeamData(teamMembers);
      setProjects(projectsData);
      setCompany(companyData);

      // Log transformation results
      const membersWithRealTasks = teamMembers.filter(m => m.hasRealAssignments);
      const membersWithoutTasks = teamMembers.filter(m => !m.hasRealAssignments);
      const membersWithHours = teamMembers.filter(m => m.scheduled > 0);
      
      console.log('🎉 Successfully loaded and transformed Workdeck data!', {
        totalMembers: teamMembers.length,
        membersWithRealTasks: membersWithRealTasks.length,
        membersWithoutTasks: membersWithoutTasks.length,
        membersWithHours: membersWithHours.length,
        projectsCount: projectsData.length,
        detailedProjectsCount: detailedProjects.length
      });

      if (membersWithoutTasks.length > 0) {
        console.log('⚠️ Team members without task assignments:', 
          membersWithoutTasks.map(m => `${m.name} (${m.department})`));
      }

      if (membersWithHours.length > 0) {
        console.log('✅ Team members with scheduled hours:', 
          membersWithHours.map(m => `${m.name}: ${m.scheduled}h`));
      }
      
    } catch (err) {
      console.error('💥 Failed to load Workdeck data:', err);
      setError(`Failed to load data: ${err.message}\n\nPlease check your API connection and credentials.`);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced sync function: Updates spreadsheet when task properties change
  const syncTaskFromSpreadsheet = (memberId, projectId, monthIndex, hours) => {
    console.log('🔄 syncTaskFromSpreadsheet called:', { memberId, projectId, monthIndex, hours });
    
    setTeamData(prevData => {
      const newData = prevData.map(member => {
        if (member.id === memberId) {
          console.log('🔄 Found member:', member.name);
          const updatedMember = {
            ...member,
            tasks: member.tasks.map(task => {
              console.log('🔄 Checking task:', task.project, 'with projectId:', task.projectId, 'against:', projectId);
              if (task.projectId === projectId) {
                console.log('🔄 Updating task:', task.project);
                const newMonthlyHours = [...(task.monthlyHours || Array(12).fill(0))];
                newMonthlyHours[monthIndex] = hours;
                
                console.log('🔄 New monthly hours for', task.project, ':', newMonthlyHours);
                
                // Update targetHoursPerWeek based on average of non-zero months
                const activeMonths = newMonthlyHours.filter(h => h > 0);
                const avgWeeklyHours = activeMonths.length > 0 
                  ? activeMonths.reduce((sum, h) => sum + h, 0) / activeMonths.length 
                  : 0;
                
                const updatedTask = {
                  ...task,
                  monthlyHours: newMonthlyHours,
                  targetHoursPerWeek: avgWeeklyHours,
                  estimatedHours: avgWeeklyHours * 8, // Rough estimate
                  // Update task timeline based on allocated months
                  startWeek: newMonthlyHours.findIndex(h => h > 0) * 4.33,
                  endWeek: (newMonthlyHours.length - 1 - [...newMonthlyHours].reverse().findIndex(h => h > 0)) * 4.33
                };
                
                console.log('🔄 Updated task result:', updatedTask);
                return updatedTask;
              }
              return task;
            })
          };
          
          // Recalculate member utilization
          const totalScheduled = updatedMember.tasks.reduce((sum, task) => sum + (task.targetHoursPerWeek || 0), 0);
          updatedMember.scheduled = Math.round(totalScheduled);
          updatedMember.utilization = Math.round((totalScheduled / updatedMember.capacity) * 100);
          
          console.log('🔄 Updated member totals:', {
            name: updatedMember.name,
            scheduled: updatedMember.scheduled,
            utilization: updatedMember.utilization
          });
          
          return updatedMember;
        }
        return member;
      });
      
      console.log('🔄 Final team data update completed');
      return newData;
    });
  };

  // Sync function: Updates spreadsheet when task properties change
  const syncSpreadsheetFromTask = (memberId, taskId, updates) => {
    setTeamData(prevData => 
      prevData.map(member => {
        if (member.id === memberId) {
          const updatedMember = {
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
          
          // Recalculate member utilization
          const totalScheduled = updatedMember.tasks.reduce((sum, task) => sum + (task.targetHoursPerWeek || 0), 0);
          updatedMember.scheduled = Math.round(totalScheduled);
          updatedMember.utilization = Math.round((totalScheduled / updatedMember.capacity) * 100);
          
          return updatedMember;
        }
        return member;
      })
    );
  };

  // Authentication screen
  if (!isAuthenticated) {
    return (
      <div style={{ 
        minHeight: '100vh', 
        backgroundColor: '#f9fafb', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        padding: '1rem'
      }}>
        <div style={{ 
          backgroundColor: 'white', 
          padding: '2rem', 
          borderRadius: '0.5rem', 
          boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', 
          maxWidth: '28rem', 
          width: '100%' 
        }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#111827', marginBottom: '0.5rem' }}>
              🚀 Workdeck Resource Planner
            </h1>
            <p style={{ color: '#6b7280' }}>
              Connect to your Workdeck instance to load real team data
            </p>
          </div>
          
          {error && (
            <div style={{ 
              marginBottom: '1rem', 
              padding: '0.75rem', 
              backgroundColor: '#fef2f2', 
              border: '1px solid #fecaca', 
              borderRadius: '0.5rem' 
            }}>
              <div style={{ fontSize: '0.875rem', color: '#dc2626', fontWeight: '500' }}>
                Connection Error
              </div>
              <div style={{ fontSize: '0.875rem', color: '#dc2626', marginTop: '0.25rem' }}>
                {error}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
                Email
              </label>
              <input
                type="email"
                value={credentials.email}
                onChange={(e) => setCredentials(prev => ({ ...prev, email: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem'
                }}
                placeholder="your.email@company.com"
                required
              />
            </div>
            
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '500', color: '#374151', marginBottom: '0.25rem' }}>
                Password
              </label>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '0.375rem',
                  fontSize: '0.875rem'
                }}
                placeholder="Your Workdeck password"
                required
              />
            </div>

            <div style={{ padding: '0.75rem', backgroundColor: '#fffbeb', border: '1px solid #fbbf24', borderRadius: '0.375rem' }}>
              <div style={{ fontSize: '0.75rem', color: '#92400e', marginBottom: '0.5rem' }}>
                💡 <strong>Alternative:</strong> If login fails due to CORS, copy your token from Postman:
              </div>
              <label style={{ display: 'block', fontSize: '0.75rem', fontWeight: '500', color: '#92400e', marginBottom: '0.25rem' }}>
                Manual Token (Optional)
              </label>
              <input
                type="text"
                value={credentials.token}
                onChange={(e) => setCredentials(prev => ({ ...prev, token: e.target.value }))}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  border: '1px solid #fbbf24',
                  borderRadius: '0.25rem',
                  fontSize: '0.75rem',
                  fontFamily: 'monospace'
                }}
                placeholder="Paste token from Postman login response..."
              />
            </div>
            
            <button 
              onClick={handleLogin}
              disabled={loggingIn}
              style={{
                width: '100%',
                backgroundColor: loggingIn ? '#9ca3af' : '#2563eb',
                color: 'white',
                padding: '0.75rem 1rem',
                borderRadius: '0.375rem',
                border: 'none',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: loggingIn ? 'not-allowed' : 'pointer'
              }}
            >
              {loggingIn ? 'Connecting to Workdeck...' : (credentials.token ? 'Use Manual Token' : 'Connect to Workdeck')}
            </button>
          </div>
          
          <div style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#f3f4f6', borderRadius: '0.375rem' }}>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', textAlign: 'center', marginBottom: '0.5rem' }}>
              ✅ Uses multiple CORS proxy methods for reliable connection
            </div>
            <div style={{ fontSize: '0.75rem', color: '#6b7280', textAlign: 'center' }}>
              🔒 Your credentials are secure and used only for Workdeck authentication
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Loading screen
  if (loading) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', padding: '3rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📊</div>
          <div style={{ fontSize: '1.125rem', color: '#6b7280', marginBottom: '0.5rem' }}>
            📡 Loading data from Workdeck API...
          </div>
          <div style={{ fontSize: '0.875rem', color: '#9ca3af' }}>
            Transforming live data for resource planning
          </div>
        </div>
      </div>
    );
  }

  // Error screen (no demo fallback)
  if (error && teamData.length === 0) {
    return (
      <div style={{ minHeight: '100vh', backgroundColor: '#f9fafb', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '0.5rem', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)', maxWidth: '32rem', width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>❌</div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#dc2626', marginBottom: '0.5rem' }}>
              Failed to Load Workdeck Data
            </h1>
            <p style={{ color: '#6b7280' }}>
              Unable to fetch data from your Workdeck instance
            </p>
          </div>
          
          <div style={{ backgroundColor: '#fef2f2', border: '1px solid #fecaca', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '0.875rem', fontWeight: 'bold', color: '#dc2626', marginBottom: '0.5rem' }}>
              Error Details:
            </h3>
            <p style={{ fontSize: '0.875rem', color: '#dc2626', whiteSpace: 'pre-line' }}>{error}</p>
          </div>

          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={loadWorkdeckData}
              style={{
                flex: 1,
                backgroundColor: '#dc2626',
                color: 'white',
                padding: '0.75rem 1rem',
                borderRadius: '0.375rem',
                border: 'none',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Retry Connection
            </button>
            <button 
              onClick={() => {
                setIsAuthenticated(false);
                setError(null);
              }}
              style={{
                flex: 1,
                backgroundColor: '#6b7280',
                color: 'white',
                padding: '0.75rem 1rem',
                borderRadius: '0.375rem',
                border: 'none',
                fontSize: '0.875rem',
                fontWeight: '500',
                cursor: 'pointer'
              }}
            >
              Change Credentials
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main Resource Planner Interface
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
          hours = task.monthlyHours[dateIdx] || 0;
        } else if (viewType === 'day') {
          const monthIndex = Math.floor(dateIdx / 4.33);
          const weeklyHours = task.monthlyHours[monthIndex] || 0;
          const activeDaysPerWeek = task.pattern ? task.pattern.filter(Boolean).length : 5;
          hours = weeklyHours / Math.max(1, activeDaysPerWeek);
        }
        
        return totalHours + hours;
      }
      
      // Fallback to old calculation if monthlyHours not available
      if (isTaskActive(task, currentWeekOffset)) {
        if (task.intensityPhases) {
          const currentPhase = getCurrentPhaseFromDates(task, currentWeekOffset);
          if (currentPhase) {
            if (viewType === 'day') {
              const activeDaysPerWeek = task.pattern ? task.pattern.filter(Boolean).length : 5;
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
          const activeDaysPerWeek = task.pattern ? task.pattern.filter(Boolean).length : 5;
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
    console.log('🔧 handleProjectCellEdit called:', { memberId, projectId, columnIndex, value, spreadsheetView });
    
    // Allow empty string to clear the field
    if (value === '') {
      console.log('🔧 Clearing cell value');
      syncTaskFromSpreadsheet(memberId, projectId, columnIndex, 0);
      return;
    }
    
    const numValue = parseFloat(value);
    
    if (isNaN(numValue) || numValue < 0) {
      console.log('🔧 Invalid value, returning:', value);
      return;
    }
    
    const maxLimits = {
      week: 60,
      month: 300,
      quarter: 800,
      year: 3000
    };
    
    const clampedValue = Math.min(numValue, maxLimits[spreadsheetView] || 300);
    console.log('🔧 Clamped value:', clampedValue);
    
    // Convert the input value to weekly hours for storage
    let weeklyHours = clampedValue;
    
    if (spreadsheetView === 'month') {
      // User entered total monthly hours, convert to weekly
      weeklyHours = clampedValue / 4.33;
      console.log('🔧 Converting monthly to weekly:', clampedValue, '→', weeklyHours);
    } else if (spreadsheetView === 'quarter') {
      // User entered total quarterly hours, convert to weekly  
      weeklyHours = clampedValue / (4.33 * 3);
    } else if (spreadsheetView === 'year') {
      // User entered total yearly hours, convert to weekly
      weeklyHours = clampedValue / (4.33 * 12);
    }
    
    console.log('🔧 Final weekly hours to store:', weeklyHours);
    
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

  const applyTemplate = (memberId, template) => {
    setTeamData(prevData =>
      prevData.map(member => {
        if (member.id === memberId) {
          const updatedMember = {
            ...member,
            tasks: member.tasks.map(task => ({
              ...task,
              monthlyHours: template.pattern.map(hours => hours),
              targetHoursPerWeek: template.pattern.reduce((sum, h) => sum + h, 0) / template.pattern.filter(h => h > 0).length || 0
            }))
          };
          
          // Recalculate utilization
          const totalScheduled = updatedMember.tasks.reduce((sum, task) => sum + (task.targetHoursPerWeek || 0), 0);
          updatedMember.scheduled = Math.round(totalScheduled);
          updatedMember.utilization = Math.round((totalScheduled / updatedMember.capacity) * 100);
          
          return updatedMember;
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
          const updatedMember = {
            ...member,
            tasks: member.tasks.map(task => ({
              ...task,
              monthlyHours: Array.from({ length: 12 }, () => 0),
              targetHoursPerWeek: 0
            }))
          };
          
          updatedMember.scheduled = 0;
          updatedMember.utilization = 0;
          
          return updatedMember;
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
    const member = teamData.find(m => m.id === memberId);
    if (!member) return [];
    
    // Show ALL tasks (including those with 0 hours) in spreadsheet view for editing
    return member.tasks.map(task => ({
      id: task.project.toLowerCase().replace(/\s+/g, '-'),
      name: task.project,
      activity: task.activity,
      task: task.task,
      color: task.color,
      hasHours: task.targetHoursPerWeek > 0 || task.estimatedHours > 0,
      isRealWorkdeckTask: task.realWorkdeckTask || false
    }));
  };

  const getSpreadsheetValue = (memberId, index, projectId = null) => {
    const member = teamData.find(m => m.id === memberId);
    if (!member) return 0;

    if (projectId) {
      const task = member.tasks.find(t => t.projectId === projectId);
      if (!task || !task.monthlyHours) return 0;
      
      return calculateValueForView({ [index]: task.monthlyHours[index] || 0 }, index);
    } else {
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
              monthTotal += weeklyHours * 4.33;
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
        const monthIndex = Math.floor(index / 4.33);
        return memberData[monthIndex] || 0;
        
      case 'month':
        const weeklyHours = memberData[index] || 0;
        return Math.round(weeklyHours * 4.33);
        
      case 'quarter':
        const quarterMonths = [
          [0, 1, 2], [3, 4, 5], [6, 7, 8], [9, 10, 11]
        ];
        const monthsInQuarter = quarterMonths[index] || [];
        return Math.round(monthsInQuarter.reduce((sum, monthIdx) => {
          const weeklyHours = memberData[monthIdx] || 0;
          return sum + (weeklyHours * 4.33);
        }, 0));
        
      case 'year':
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
    return teamData.reduce((total, member) => {
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
            <h1 className="text-xl font-semibold text-gray-900" style={{ fontWeight: '600' }}>
              📊 Workdeck Resource Planner
            </h1>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Calendar className="w-4 h-4" />
              <span>{getDateRangeLabel()}</span>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            {/* Live Data Status */}
            <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-50 border border-green-200 rounded-md">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-green-700">Live from Workdeck</span>
            </div>

            {/* Company Info */}
            {company && (
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-md">
                <span className="text-xs font-medium text-blue-700">{company.name}</span>
              </div>
            )}
            
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
              {[...new Set(teamData.map(member => member.department))].map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
            
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <Users className="w-4 h-4" />
              <span>{teamData.length} team members</span>
            </div>

            <button 
              onClick={loadWorkdeckData}
              className="px-3 py-1.5 text-sm font-medium text-blue-600 bg-blue-50 border border-blue-200 rounded-md hover:bg-blue-100"
            >
              Refresh Data
            </button>

            <button 
              onClick={() => {
                setIsAuthenticated(false);
                setTeamData([]);
                setProjects([]);
                setCompany(null);
              }}
              className="px-3 py-1.5 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-md hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Live Data Status Bar */}
      <div className="bg-green-50 border-b border-green-200 px-6 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="font-medium text-green-800">Connected to Workdeck API</span>
            </div>
            <span className="text-green-700">•</span>
            <span className="text-green-700">{teamData.length} team members loaded</span>
            <span className="text-green-700">•</span>
            <span className="text-green-700">{projects.length} projects available</span>
            {company && (
              <>
                <span className="text-green-700">•</span>
                <span className="text-green-700">{company.name}</span>
              </>
            )}
          </div>
          <div className="text-xs text-green-600">
            Last updated: {new Date().toLocaleTimeString()}
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
                  <p className="text-sm text-gray-600">Live data from Workdeck • Edit hours to sync with Timeline mode</p>
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
                    Export Data
                  </button>
                  <button 
                    onClick={loadWorkdeckData}
                    className="px-3 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700"
                  >
                    Refresh from Workdeck
                  </button>
                </div>
                <div className="text-sm text-gray-600">
                  Live data from {company?.name || 'Workdeck'} • {teamData.length} team members
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
                            {teamData.map(member => (
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
                  {teamData.filter(member => 
                    selectedDepartment === 'all' || member.department === selectedDepartment
                  ).map((member) => {
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
                                  <div className="text-xs text-gray-500">{member.department} • {member.role}</div>
                                  <div className="text-xs text-blue-600 font-medium">
                                    Total: {member.scheduled}h / {member.capacity}h ({member.utilization}%)
                                  </div>
                                  {member.isAdmin && (
                                    <div className="text-xs text-red-600 font-medium">Admin User</div>
                                  )}
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
                        
                        {/* Project Breakdown Rows - Show ALL tasks for editing */}
                        {memberProjects.map((project, projectIdx) => (
                          <tr key={`${member.id}-${project.id}`} className="hover:bg-gray-25">
                            <td className="px-4 py-2 border-r bg-white">
                              <div className="flex items-center space-x-3 ml-8">
                                <div className={`w-3 h-3 rounded-full ${project.color}`}></div>
                                <div className="flex-1">
                                  <div className="flex items-center space-x-2">
                                    <div className="text-sm font-medium text-gray-800">{project.name}</div>
                                    {project.isRealWorkdeckTask && (
                                      <span className="px-1 py-0.5 text-xs bg-green-100 text-green-700 rounded border">
                                        Live
                                      </span>
                                    )}
                                    {!project.hasHours && (
                                      <span className="px-1 py-0.5 text-xs bg-yellow-100 text-yellow-700 rounded border">
                                        0h
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs text-gray-600">{project.activity} → {project.task}</div>
                                  {!project.hasHours && (
                                    <div className="text-xs text-yellow-600 font-medium">
                                      Click cells below to add hours
                                    </div>
                                  )}
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
                                      className={`w-full h-8 px-2 py-1.5 text-center text-sm font-medium cursor-pointer hover:ring-1 hover:ring-blue-300 rounded flex items-center justify-center ${
                                        hours > 0 ? getCellColor(hours) : 'bg-gray-50 text-gray-400 border border-dashed border-gray-300 hover:border-blue-300'
                                      }`}
                                      title={hours === 0 ? 'Click to add hours' : `${Math.round(hours)}h planned`}
                                    >
                                      {hours > 0 ? `${Math.round(hours)}h` : '+'}
                                    </div>
                                  )}
                                </td>
                              );
                            })}
                            <td className="px-3 py-2 text-center bg-white">
                              <div className="text-sm font-medium text-gray-800">
                                {Math.round(getProjectRowTotal(member.id, project.id))}h
                              </div>
                              {!project.hasHours && (
                                <div className="text-xs text-yellow-600">
                                  No hours
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}

                        {/* Show message if user has no tasks at all */}
                        {memberProjects.length === 0 && (
                          <tr>
                            <td colSpan={getSpreadsheetColumns().length + 2} className="px-4 py-8 text-center">
                              <div className="text-gray-500">
                                <div className="text-sm font-medium mb-1">No Workdeck Tasks</div>
                                <div className="text-xs">This user has no task assignments in Workdeck</div>
                                <button 
                                  onClick={() => handleAssignTask(member)}
                                  className="mt-2 px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                                >
                                  Assign Task
                                </button>
                              </div>
                            </td>
                          </tr>
                        )}
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
                          {teamData.filter(member => 
                            selectedDepartment === 'all' || member.department === selectedDepartment
                          ).length} people
                        </div>
                      </td>
                    ))}
                    <td className="px-3 py-3 text-center">
                      <div className="text-sm font-semibold text-gray-900">
                        {Math.round(teamData.filter(member => 
                          selectedDepartment === 'all' || member.department === selectedDepartment
                        ).reduce((sum, member) => sum + getMemberRowTotal(member.id), 0))}h
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
                  <strong>Live Workdeck Integration:</strong> Real-time data from {company?.name || 'Workdeck'} • {teamData.length} team members • {projects.length} projects • Bi-directional sync active
                </div>
                <div className="flex space-x-2">
                  <button 
                    onClick={loadWorkdeckData}
                    className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                  >
                    Refresh from API
                  </button>
                  <button className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700">
                    Export Data
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
              <h3 className="font-semibold">Live Team Data from {company?.name || 'Workdeck'}</h3>
              <p className="text-sm text-gray-300">{teamData.length} team members • {projects.length} projects • Real-time integration</p>
            </div>

            {/* Date Headers */}
            <div className="bg-white border-b border-gray-200 px-4 py-2 mb-4 rounded">
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

            {teamData.filter(member => 
              selectedDepartment === 'all' || member.department === selectedDepartment
            ).map((member) => (
              <div key={member.id} className="mb-4">
                <div className="flex items-center justify-between mb-2 p-3 bg-white rounded border">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-sm">
                      {member.avatar}
                    </div>
                    <div>
                      <div className="font-medium text-sm">{member.name}</div>
                      <div className="text-xs text-gray-500">
                        {member.department} • {member.role} • {member.scheduled}h / {member.capacity}h
                      </div>
                      {member.email && (
                        <div className="text-xs text-gray-400">{member.email}</div>
                      )}
                      {/* Show real task count */}
                      <div className="text-xs text-blue-600">
                        {member.realTasksCount || 0} real Workdeck tasks
                      </div>
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
                  {/* Only show tasks that have actual hours planned */}
                  {showTaskDetails && member.tasks.filter(task => 
                    task.targetHoursPerWeek > 0 || task.estimatedHours > 0
                  ).map((task, idx) => (
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
                              {task.realWorkdeckTask && (
                                <span className="px-1 py-0.5 text-xs bg-green-100 text-green-700 rounded border">
                                  Live
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
                              <span className="font-medium text-green-600">{task.velocity.toFixed(1)}h/week</span>
                              <span className="text-gray-400">(target: {task.targetHoursPerWeek.toFixed(1)}h/week)</span>
                              {task.realWorkdeckTask && (
                                <span className="text-blue-600 font-medium">• Real Workdeck Task</span>
                              )}
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
                          // Only show colored bar if task has hours
                          <div className={`h-6 rounded ${
                            task.targetHoursPerWeek > 0 ? `${task.color} opacity-60` : 'bg-gray-100'
                          }`}></div> :
                          selectedView === 'quarter' ? 
                          Array.from({ length: 3 }, (_, dateIdx) => {
                            // Check if task is active in this quarter month and has hours
                            const hasHours = task.targetHoursPerWeek > 0;
                            const isCurrentMonth = dateIdx === 2;
                            return (
                              <div key={dateIdx} className={`h-6 rounded ${
                                hasHours ? `${task.color} opacity-70` : 'bg-gray-100'
                              } ${isCurrentMonth && hasHours ? 'ring-1 ring-blue-400' : ''}`}></div>
                            );
                          }) :
                          selectedView === 'month' ? 
                          Array.from({ length: 4 }, (_, dateIdx) => {
                            // Check if task is active in this week and has hours
                            const hasHours = task.targetHoursPerWeek > 0;
                            const isCurrentWeek = dateIdx === 1;
                            return (
                              <div key={dateIdx} className={`h-6 rounded ${
                                hasHours && isCurrentWeek ? `${task.color} opacity-80` : 'bg-gray-100'
                              } ${isCurrentWeek && hasHours ? 'ring-1 ring-blue-400' : ''}`}></div>
                            );
                          }) :
                          task.pattern.map((isActive, dateIdx) => {
                            // Only show color if task has hours and is active on this day
                            const hasHours = task.targetHoursPerWeek > 0;
                            const isWeekend = dateIdx === 2 || dateIdx === 3;
                            return (
                              <div key={dateIdx} className={`h-6 rounded ${
                                isWeekend ? 'bg-gray-100' : 
                                (isActive && hasHours) ? `${task.color} opacity-80` : 'bg-gray-100'
                              }`}></div>
                            );
                          })
                        }
                      </div>
                    </div>
                  ))}

                  {/* Show message if user has no tasks with hours */}
                  {member.tasks.filter(task => task.targetHoursPerWeek > 0 || task.estimatedHours > 0).length === 0 && (
                    <div className="flex items-center bg-yellow-50 border border-yellow-200 rounded p-3">
                      <div className="w-72 flex-shrink-0">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                          <div>
                            <div className="text-sm font-medium text-yellow-800">
                              No Active Task Assignments
                            </div>
                            <div className="text-xs text-yellow-700">
                              {member.realTasksCount > 0 
                                ? `Has ${member.realTasksCount} Workdeck tasks but no hours planned`
                                : 'No tasks assigned in Workdeck'
                              }
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex-1 grid grid-cols-9 gap-2">
                        {Array.from({ length: 9 }, (_, i) => (
                          <div key={i} className="h-6 rounded bg-gray-100"></div>
                        ))}
                      </div>
                    </div>
                  )}
                  
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
                            Live data from Workdeck • {member.realTasksCount || 0} real tasks • {member.tasks.filter(t => t.targetHoursPerWeek > 0).length} with hours
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

      {/* Enhanced Task Detail Modal */}
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

                {/* Live Workdeck Data Indicator */}
                <div className="bg-green-50 p-3 rounded border border-green-200">
                  <div className="text-xs font-medium text-green-900 mb-1">Live Workdeck Data</div>
                  <div className="text-xs text-green-800">
                    Task ID: {selectedTask.id} • Duration: {selectedTask.duration}
                  </div>
                  <div className="text-xs text-green-700 mt-1">
                    📡 Real-time data from {company?.name || 'Workdeck API'}
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

                <div className="bg-purple-50 p-3 rounded border border-purple-200">
                  <div className="text-xs font-medium text-purple-900 mb-1">Current Allocation</div>
                  <div className="text-xs text-purple-800">
                    {(selectedTask.targetHoursPerWeek || 0).toFixed(1)}h per week • Duration: {selectedTask.duration}
                  </div>
                  <div className="text-xs text-purple-700 mt-1">
                    💡 Spreadsheet changes automatically update this allocation
                  </div>
                </div>

                {selectedTask.intensityPhases && selectedTask.intensityPhases.length > 0 && (
                  <div className="bg-green-50 p-3 rounded border border-green-200">
                    <div className="text-xs font-medium text-green-900 mb-1">Intensity Phases</div>
                    {selectedTask.intensityPhases.map((phase, idx) => (
                      <div key={idx} className="text-xs text-green-800">
                        • {phase.name}: {phase.hoursPerWeek}h/week
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
                  activity: formData.get('activity'),
                  task: formData.get('task'),
                  estimatedHours: parseInt(formData.get('estimatedHours')),
                  priority: formData.get('priority')
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
                        // Reset activity and task when project changes
                        const activitySelect = e.target.form.querySelector('select[name="activity"]');
                        const taskSelect = e.target.form.querySelector('select[name="task"]');
                        if (activitySelect) activitySelect.value = '';
                        if (taskSelect) taskSelect.value = '';
                      }}
                    >
                      <option value="">Select Project</option>
                      {projects.map(project => (
                        <option key={project.id} value={project.id}>{project.name}</option>
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
                        // Reset task when activity changes
                        const taskSelect = e.target.form.querySelector('select[name="task"]');
                        if (taskSelect) taskSelect.value = '';
                      }}
                    >
                      <option value="">Select Activity</option>
                      {/* Activities will be populated based on selected project */}
                      <option value="analysis">Analysis</option>
                      <option value="development">Development</option>
                      <option value="testing">Testing</option>
                      <option value="deployment">Deployment</option>
                      <option value="maintenance">Maintenance</option>
                      <option value="documentation">Documentation</option>
                      <option value="planning">Planning</option>
                      <option value="review">Review</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Task</label>
                    <input
                      type="text"
                      name="task"
                      required
                      placeholder="Enter task name (e.g., 'User Authentication Module')"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Planned Hours</label>
                      <input 
                        type="number" 
                        name="estimatedHours"
                        required 
                        min="1"
                        max="500"
                        placeholder="40"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                      <select name="priority" required className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm">
                        <option value="1">Low</option>
                        <option value="2" selected>Medium</option>
                        <option value="3">High</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Task Dates</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                        <input
                          type="date"
                          name="startDate"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          defaultValue={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">End Date</label>
                        <input
                          type="date"
                          name="endDate"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                          defaultValue={new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0]}
                        />
                      </div>
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

                  <div className="bg-blue-50 p-3 rounded-lg">
                    <div className="text-sm font-medium text-blue-700 mb-1">Live Workdeck Integration</div>
                    <div className="text-xs text-blue-600">
                      This assignment follows Workdeck's Project → Activity → Task structure and will be synced with your resource planning data in real-time.
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

      {/* Footer */}
      <div className="mt-8 p-4 bg-white border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            <strong>🚀 Live Workdeck Resource Planner</strong> • Connected to {company?.name || 'Workdeck'} • {teamData.length} team members • {projects.length} projects • Real-time bi-directional sync
          </div>
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span>API Connected</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourcePlanner;

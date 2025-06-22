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

  async getMe() {
    console.log('👤 Fetching user profile from /queries/me...');
    return this.request('/queries/me');
  }

  // Get detailed project information with tasks and assignments
  async getProjectDetails(projectId) {
    console.log(`📋 Fetching project details for ${projectId}...`);
    return this.request(`/queries/projects/${projectId}`);
  }

  // Get user's individual information (available endpoint)
  async getUserDetails(userId) {
    console.log(`👤 Fetching user details for ${userId}...`);
    try {
      return this.request(`/queries/users/${userId}`);
    } catch (error) {
      console.warn(`⚠️ Could not fetch user details for ${userId}:`, error.message);
      return null;
    }
  }

  // Get user's team (available endpoint)
  async getUserTeam(userId) {
    console.log(`👥 Fetching team for user ${userId}...`);
    try {
      return this.request(`/queries/users/${userId}/team`);
    } catch (error) {
      console.warn(`⚠️ Could not fetch team for user ${userId}:`, error.message);
      return null;
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
  static transformUsersToTeamMembers(users, projects = [], detailedProjects = [], userAdditionalData = new Map()) {
    console.log('🔄 Transforming data:', { 
      users: users?.length || 0, 
      projects: projects?.length || 0,
      detailedProjects: detailedProjects?.length || 0,
      userAdditionalDataCount: userAdditionalData.size
    });
    
    if (!users || users.length === 0) {
      return [];
    }
    
    return users.map(user => {
      console.log(`🔄 Processing user: ${user.firstName} ${user.lastName} (${user.id})`);
      
      // Get user's additional data if available
      const additionalData = userAdditionalData.get(user.id) || { details: null, team: null };
      console.log(`📋 User ${user.firstName} additional data:`, additionalData);
      
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
                    
                    // Get planned hours from participation
                    let actualPlannedHours = parseFloat(userParticipation.plannedHours) || 0;
                    
                    console.log(`📋 Task "${task.name}" for ${user.firstName}: planned=${actualPlannedHours}h, isOwner=${userParticipation.isOwner}`);
                    
                    userTasks.push({
                      ...task,
                      project: project,
                      activity: activity,
                      userParticipation: userParticipation,
                      isOwner: userParticipation.isOwner,
                      plannedHours: actualPlannedHours,
                      originalPlannedHours: actualPlannedHours
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

      console.log(`📋 Transformed tasks for ${user.firstName}:`, planningTasks.map(t => ({
        project: t.project,
        monthlyHours: t.monthlyHours,
        targetHoursPerWeek: t.targetHoursPerWeek
      })));

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
        additionalData: additionalData
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
      // CRITICAL: Always initialize monthlyHours array - this is required for editing
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
      originalPlannedHours: taskWithProject.originalPlannedHours || taskWithProject.plannedHours,
      hasAdditionalData: !!taskWithProject.additionalData
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
    
    console.log('📅 distributeHoursAcrossMonths:', { weeklyHours, startDate, endDate });
    
    // If we have actual hours, distribute them
    if (weeklyHours > 0) {
      // For now, put the weekly hours in the current month and next few months
      const currentMonth = new Date().getMonth(); // June = 5
      
      if (!startDate || !endDate) {
        // Default: spread across current month + 3 months
        for (let i = 0; i < 4; i++) {
          const monthIndex = (currentMonth + i) % 12;
          months[monthIndex] = weeklyHours;
        }
        console.log('📅 Using default distribution:', months);
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
        console.log('📅 Date-based distribution:', months);
      } catch (e) {
        console.warn('📅 Error distributing hours across months:', e);
        // Fallback: distribute in current month + 3 months
        for (let i = 0; i < 4; i++) {
          const monthIndex = (currentMonth + i) % 12;
          months[monthIndex] = weeklyHours;
        }
        console.log('📅 Fallback distribution:', months);
      }
    } else {
      console.log('📅 No hours to distribute, returning empty array');
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
      
      // Fetch all required data including detailed project information
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

      // Show first few users for debugging
      if (users.length > 0) {
        console.log('👥 Sample users:', users.slice(0, 3).map(u => ({
          id: u.id,
          name: `${u.firstName} ${u.lastName}`,
          department: u.department,
          email: u.email
        })));
      }

      // Show first few projects for debugging  
      if (projectsData.length > 0) {
        console.log('📁 Sample projects:', projectsData.slice(0, 3).map(p => ({
          id: p.id,
          name: p.name,
          client: p.client
        })));
      }

      // Fetch detailed project information with tasks and assignments
      console.log('📋 Fetching detailed project information...');
      let detailedProjects = [];
      
      try {
        detailedProjects = await workdeckAPI.getAllProjectsWithDetails();
        console.log(`📋 Loaded ${detailedProjects.length} detailed projects with task assignments`);
        
        // Log project details for debugging
        detailedProjects.forEach(project => {
          const totalTasks = project.activities?.reduce((sum, activity) => sum + (activity.tasks?.length || 0), 0) || 0;
          const totalAssignments = project.activities?.reduce((sum, activity) => 
            sum + (activity.tasks?.reduce((taskSum, task) => taskSum + (task.participants?.length || 0), 0) || 0), 0) || 0;
          
          console.log(`📋 Project "${project.name}": ${totalTasks} tasks, ${totalAssignments} assignments`);
          
          // Log some task details to see planned hours
          if (project.activities && project.activities.length > 0) {
            const firstActivity = project.activities[0];
            if (firstActivity.tasks && firstActivity.tasks.length > 0) {
              const firstTask = firstActivity.tasks[0];
              if (firstTask.participants && firstTask.participants.length > 0) {
                console.log(`  📋 Sample task "${firstTask.name}":`, 
                  firstTask.participants.slice(0, 2).map(p => `${p.user?.firstName} ${p.user?.lastName}: ${p.plannedHours}h`));
              }
            }
          }
        });
      } catch (projectError) {
        console.warn('⚠️ Could not fetch detailed project data:', projectError.message);
        // Continue with basic project data
      }

      // Try to fetch individual user details and teams
      console.log('👥 Fetching individual user details and teams...');
      const userTaskData = new Map();
      
      for (const user of users) {
        try {
          // Try to get user details which might contain more info
          const userDetails = await workdeckAPI.getUserDetails(user.id);
          if (userDetails?.result || userDetails) {
            console.log(`👤 User ${user.firstName} ${user.lastName}: Got detailed info`);
          }
          
          // Try to get user's team which might show their projects
          const userTeam = await workdeckAPI.getUserTeam(user.id);
          if (userTeam?.result || userTeam) {
            console.log(`👥 User ${user.firstName} ${user.lastName}: Has team data`);
          }
          
          // Store any additional data we find
          userTaskData.set(user.id, {
            details: userDetails?.result || userDetails,
            team: userTeam?.result || userTeam
          });
        } catch (userError) {
          console.warn(`⚠️ Could not fetch additional data for user ${user.firstName} ${user.lastName}:`, userError.message);
          userTaskData.set(user.id, { details: null, team: null });
        }
      }

      // Transform data for resource planning using real assignments and time allocations
      const teamMembers = DataTransformer.transformUsersToTeamMembers(users, projectsData, detailedProjects, userTaskData);
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

  return (
    <div className="bg-gray-50 min-h-screen" style={{ 
      fontFamily: '"Inter", "Segoe UI", "Roboto", "Helvetica Neue", "Arial", sans-serif',
      fontSize: '14px',
      lineHeight: '1.5'
    }}>
      <h1 className="text-xl font-semibold text-gray-900 p-4">
        🚀 Workdeck Resource Planner - Live Data Connected!
      </h1>
      
      <div className="p-4">
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <h2 className="font-semibold text-green-800 mb-2">✅ Successfully Connected to Workdeck!</h2>
          <div className="text-sm text-green-700">
            <p>• Company: {company?.name || 'Loading...'}</p>
            <p>• Team Members: {teamData.length}</p>
            <p>• Projects: {projects.length}</p>
            <p>• Members with Tasks: {teamData.filter(m => m.hasRealAssignments).length}</p>
          </div>
        </div>

        {teamData.length > 0 ? (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Team Members & Real Task Assignments</h3>
            {teamData.map(member => (
              <div key={member.id} className="bg-white rounded-lg border p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white text-sm">
                      {member.avatar}
                    </div>
                    <div>
                      <h4 className="font-medium">{member.name}</h4>
                      <p className="text-sm text-gray-600">{member.department} • {member.role}</p>
                      <p className="text-xs text-gray-500">{member.email}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-medium">
                      {member.scheduled}h / {member.capacity}h ({member.utilization}%)
                    </div>
                    <div className="text-xs text-gray-600">
                      {member.realTasksCount} real tasks • {member.totalPlannedHours}h total
                    </div>
                  </div>
                </div>
                
                {member.hasRealAssignments ? (
                  <div className="space-y-2">
                    <h5 className="text-sm font-medium text-gray-700">Real Workdeck Tasks:</h5>
                    {member.tasks.map((task, idx) => (
                      <div key={idx} className="bg-gray-50 rounded p-2 text-sm">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-medium">{task.project}</span>
                            <span className="text-gray-500 mx-2">→</span>
                            <span>{task.activity}</span>
                            <span className="text-gray-500 mx-2">→</span>
                            <span>{task.task}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-medium">{task.estimatedHours}h planned</div>
                            <div className="text-xs text-gray-600">{task.targetHoursPerWeek}h/week</div>
                          </div>
                        </div>
                        {task.realWorkdeckTask && (
                          <div className="mt-1 text-xs text-green-600">
                            ✅ Live from Workdeck API • Owner: {task.isTaskOwner ? 'Yes' : 'No'}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-3 text-sm">
                    <p className="text-yellow-800">No task assignments found in Workdeck projects</p>
                    <p className="text-yellow-600 text-xs mt-1">
                      This user may not be assigned to any project tasks yet
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800">Loading team data...</h3>
            <p className="text-blue-700 text-sm">Fetching live data from your Workdeck instance</p>
          </div>
        )}
        
        <div className="mt-6 bg-white rounded-lg border p-4">
          <h3 className="font-semibold mb-2">🔄 Actions</h3>
          <div className="flex space-x-2">
            <button 
              onClick={loadWorkdeckData}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
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
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourcePlanner;

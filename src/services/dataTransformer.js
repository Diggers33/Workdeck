// dataTransformers.js - Transform Workdeck data to match your app's structure

// Transform Workdeck user to your team member format
export const transformUserToTeamMember = (workdeckUser, userProjects = [], userEvents = []) => {
  // Calculate capacity and utilization based on events/tasks
  const calculateWorkload = (events) => {
    const currentWeekEvents = events.filter(event => {
      const eventDate = new Date(event.startAt);
      const now = new Date();
      const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
      const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
      return eventDate >= weekStart && eventDate <= weekEnd;
    });
    
    return currentWeekEvents.reduce((total, event) => {
      const duration = new Date(event.endAt) - new Date(event.startAt);
      return total + (duration / (1000 * 60 * 60)); // Convert to hours
    }, 0);
  };

  const scheduled = calculateWorkload(userEvents);
  const capacity = 40; // Standard 40-hour work week
  const utilization = Math.round((scheduled / capacity) * 100);

  return {
    id: workdeckUser.id,
    name: `${workdeckUser.firstName} ${workdeckUser.lastName}`,
    avatar: workdeckUser.avatar || '👤',
    department: workdeckUser.department,
    capacity: capacity,
    scheduled: Math.round(scheduled),
    utilization: utilization,
    tasks: transformProjectsToTasks(userProjects, userEvents)
  };
};

// Transform Workdeck projects and events to your task format
export const transformProjectsToTasks = (projects = [], events = []) => {
  const tasks = [];
  
  // Transform projects to tasks
  projects.forEach((project, index) => {
    const projectEvents = events.filter(event => 
      event.title?.toLowerCase().includes(project.name?.toLowerCase())
    );
    
    const task = {
      id: project.id || `project-${index}`,
      project: project.name || 'Unnamed Project',
      activity: project.client || 'General Work',
      task: project.code || 'Project Tasks',
      color: getProjectColor(project.name),
      estimatedHours: project.plannedHours || project.availableHours || 0,
      actualHours: calculateActualHours(projectEvents),
      totalActivityHours: project.availableHours || 0,
      totalProjectHours: project.plannedHours || 0,
      velocity: calculateVelocity(projectEvents),
      status: determineTaskStatus(project),
      startWeek: -8, // Default values, can be calculated from project dates
      endWeek: 24,
      pattern: generateWorkPattern(),
      isLongTerm: isLongTermProject(project),
      targetHoursPerWeek: calculateTargetHours(project),
      duration: calculateDuration(project),
      projectId: project.name?.toLowerCase().replace(/\s+/g, '-') || `project-${index}`,
      monthlyHours: generateMonthlyHours(project)
    };
    
    tasks.push(task);
  });
  
  // If no projects, create tasks from events
  if (projects.length === 0 && events.length > 0) {
    const groupedEvents = groupEventsByProject(events);
    
    Object.entries(groupedEvents).forEach(([projectName, projectEvents], index) => {
      const task = {
        id: `event-${index}`,
        project: projectName,
        activity: 'Event-based Work',
        task: 'Various Tasks',
        color: getProjectColor(projectName),
        estimatedHours: projectEvents.length * 2, // Estimate 2 hours per event
        actualHours: calculateActualHours(projectEvents),
        totalActivityHours: projectEvents.length * 2,
        totalProjectHours: projectEvents.length * 2,
        velocity: calculateVelocity(projectEvents),
        status: 'in-progress',
        startWeek: -4,
        endWeek: 12,
        pattern: generateWorkPattern(),
        isLongTerm: false,
        targetHoursPerWeek: 5,
        duration: '3 months',
        projectId: projectName.toLowerCase().replace(/\s+/g, '-'),
        monthlyHours: generateMonthlyHours()
      };
      
      tasks.push(task);
    });
  }
  
  return tasks;
};

// Helper functions
const getProjectColor = (projectName) => {
  const colors = [
    'bg-purple-600', 'bg-blue-600', 'bg-green-600', 'bg-orange-500', 
    'bg-red-500', 'bg-indigo-500', 'bg-teal-500', 'bg-pink-500'
  ];
  
  if (!projectName) return colors[0];
  
  // Simple hash function to consistently assign colors
  let hash = 0;
  for (let i = 0; i < projectName.length; i++) {
    hash = projectName.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const calculateActualHours = (events) => {
  return events.reduce((total, event) => {
    if (event.endAt && event.startAt) {
      const duration = new Date(event.endAt) - new Date(event.startAt);
      return total + (duration / (1000 * 60 * 60)); // Convert to hours
    }
    return total + 1; // Default 1 hour if no end time
  }, 0);
};

const calculateVelocity = (events) => {
  if (events.length === 0) return 0;
  const totalHours = calculateActualHours(events);
  const weeks = Math.max(1, events.length / 5); // Rough estimate
  return Math.round((totalHours / weeks) * 10) / 10;
};

const determineTaskStatus = (project) => {
  if (!project.endDate) return 'in-progress';
  
  const endDate = new Date(project.endDate);
  const now = new Date();
  
  if (endDate < now) return 'completed';
  if (project.plannedHours && project.availableHours && 
      project.plannedHours > project.availableHours * 1.1) return 'over-budget';
  
  return 'in-progress';
};

const generateWorkPattern = () => {
  // Generate a realistic work pattern (true = working day)
  return [true, true, false, false, true, true, false, true, true];
};

const isLongTermProject = (project) => {
  if (!project.startDate || !project.endDate) return false;
  
  const start = new Date(project.startDate);
  const end = new Date(project.endDate);
  const monthsDiff = (end.getFullYear() - start.getFullYear()) * 12 + 
                    (end.getMonth() - start.getMonth());
  
  return monthsDiff > 3;
};

const calculateTargetHours = (project) => {
  if (project.plannedHours && project.startDate && project.endDate) {
    const start = new Date(project.startDate);
    const end = new Date(project.endDate);
    const weeks = Math.max(1, (end - start) / (1000 * 60 * 60 * 24 * 7));
    return Math.round((project.plannedHours / weeks) * 10) / 10;
  }
  return 5; // Default 5 hours per week
};

const calculateDuration = (project) => {
  if (!project.startDate || !project.endDate) return '3 months';
  
  const start = new Date(project.startDate);
  const end = new Date(project.endDate);
  const months = Math.round((end - start) / (1000 * 60 * 60 * 24 * 30));
  
  return `${months} month${months !== 1 ? 's' : ''}`;
};

const generateMonthlyHours = (project) => {
  const targetWeekly = calculateTargetHours(project);
  
  // Generate 12 months of data
  return Array.from({ length: 12 }, (_, month) => {
    // Vary the hours based on project timeline
    if (project && project.startDate && project.endDate) {
      const start = new Date(project.startDate);
      const end = new Date(project.endDate);
      const currentMonth = new Date();
      currentMonth.setMonth(month);
      
      if (currentMonth < start || currentMonth > end) {
        return 0;
      }
    }
    
    return targetWeekly;
  });
};

const groupEventsByProject = (events) => {
  return events.reduce((groups, event) => {
    // Try to extract project name from event title or use a default
    const projectName = extractProjectFromTitle(event.title) || 'General Work';
    
    if (!groups[projectName]) {
      groups[projectName] = [];
    }
    groups[projectName].push(event);
    
    return groups;
  }, {});
};

const extractProjectFromTitle = (title) => {
  if (!title) return null;
  
  // Look for common project patterns in titles
  const patterns = [
    /^(\w+[-_]\w+)/, // PROJECT-NAME or PROJECT_NAME
    /^\[([^\]]+)\]/, // [PROJECT NAME]
    /^([A-Z]+\d*)/, // PROJ123 or PROJECTNAME
  ];
  
  for (const pattern of patterns) {
    const match = title.match(pattern);
    if (match) return match[1];
  }
  
  // Fallback: use first two words
  const words = title.split(' ');
  return words.slice(0, 2).join(' ');
};

// Transform Workdeck data to your expected format
export const transformWorkdeckData = async (workdeckAPI) => {
  try {
    const [users, projects, company] = await Promise.all([
      workdeckAPI.getUsers(),
      workdeckAPI.getProjects(),
      workdeckAPI.getCompany()
    ]);

    const teamMembers = [];
    
    for (const user of users) {
      // Get user-specific events (tasks)
      const userEvents = await workdeckAPI.getUserTasks(user.id).catch(() => []);
      
      // Filter projects for this user (if they're a participant)
      const userProjects = projects.filter(project => 
        project.members?.some(member => member.user?.id === user.id) ||
        project.participants?.some(participant => participant.user?.id === user.id)
      );
      
      const teamMember = transformUserToTeamMember(user, userProjects, userEvents);
      teamMembers.push(teamMember);
    }
    
    return {
      teamMembers,
      company,
      projects
    };
  } catch (error) {
    console.error('Error transforming Workdeck data:', error);
    throw error;
  }
};

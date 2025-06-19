// dataTransformer.js
export class DataTransformer {
  static transformUsersToTeamMembers(users, projects = [], userTasks = {}) {
    return users.map(user => {
      const tasks = userTasks[user.id] || [];
      const transformedTasks = tasks.map((task, index) => ({
        id: task.id || `task-${index}`,
        project: task.project?.name || 'Unknown Project',
        activity: task.activity?.name || 'General Work',
        task: task.name || 'Untitled Task',
        color: this.getProjectColor(task.project?.name),
        estimatedHours: parseInt(task.plannedHours) || 40,
        actualHours: this.getActualHours(task, user.id),
        velocity: 7.5,
        status: this.mapTaskStatus(task.flags || task.status),
        targetHoursPerWeek: 8,
        duration: '3 months',
        startWeek: -4,
        endWeek: 8,
        pattern: [true, true, true, true, true, false, false, true, true],
        isLongTerm: true,
        projectId: (task.project?.name || 'unknown').toLowerCase().replace(/\s+/g, '-'),
        monthlyHours: Array.from({ length: 12 }, () => 8)
      }));

      return {
        id: user.id,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        avatar: this.generateAvatar(user.firstName),
        department: user.department || 'Unknown',
        capacity: 40,
        scheduled: transformedTasks.length * 8,
        utilization: Math.min(100, (transformedTasks.length * 8 / 40) * 100),
        tasks: transformedTasks
      };
    });
  }

  static getActualHours(task, userId) {
    const participant = task.participants?.find(p => p.user?.id === userId);
    return parseInt(participant?.actualHours) || Math.floor(Math.random() * 30);
  }

  static mapTaskStatus(status) {
    if (typeof status === 'number') {
      switch (status) {
        case 1: return 'planned';
        case 2: return 'in-progress';
        case 3: return 'completed';
        default: return 'planned';
      }
    }
    return status || 'in-progress';
  }

  static getProjectColor(projectName) {
    const colors = ['bg-purple-600', 'bg-blue-600', 'bg-green-600', 'bg-orange-500'];
    if (!projectName) return colors[0];
    return colors[projectName.length % colors.length];
  }

  static generateAvatar(firstName) {
    const emojis = ['👨‍💻', '👩‍💻', '👨‍💼', '👩‍💼'];
    if (!firstName) return emojis[0];
    return emojis[firstName.charCodeAt(0) % emojis.length];
  }

  static generateSampleTasks(user, projects) {
    return projects.slice(0, 2).map((project, index) => ({
      id: `${user.id}-task-${index}`,
      name: `${project.name} Work`,
      plannedHours: 80,
      project: { id: project.id, name: project.name },
      participants: [{ user: { id: user.id }, plannedHours: 80, actualHours: 30 }]
    }));
  }
}

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
        estimatedHours: parseInt(task.plannedHours) || 40,
        actualHours: this.getActualHours(task, user.id),
        status: this.mapTaskStatus(task.flags || task.status),
        // ... other task properties
      }));

      return {
        id: user.id,
        name: `${user.firstName || ''} ${user.lastName || ''}`.trim(),
        department: user.department || 'Unknown',
        capacity: 40,
        tasks: transformedTasks
      };
    });
  }

  static getActualHours(task, userId) {
    const participant = task.participants?.find(p => p.user?.id === userId);
    return parseInt(participant?.actualHours) || 0;
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
    return status || 'planned';
  }
}

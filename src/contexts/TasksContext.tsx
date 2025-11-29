import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Task {
  id: string;
  title: string;
  projectId: string;
  projectName: string;
  projectColor: string;
  status: 'Open' | 'In Progress' | 'In Review' | 'Done';
  dueDate?: string;
  priority: 'High' | 'Medium' | 'Low';
  commentsCount: number;
  description?: string;
  subtasksCompleted?: number;
  subtasksTotal?: number;
  parentActivity?: string;
  timeEstimate?: number; // in minutes
  timeLogged?: number; // in minutes
  waitingOn?: string;
  watchers?: number;
  tags?: Array<{ id: string; name: string; color: string }>;
  assignedTo?: string; // user ID or name
  columnId?: string; // for project board
}

export interface ColumnData {
  id: string;
  name: string;
  color: string;
  taskIds: string[];
}

interface TasksContextType {
  tasks: Record<string, Task>;
  columns: ColumnData[];
  updateTask: (taskId: string, updates: Partial<Task>) => void;
  addTask: (task: Task) => void;
  deleteTask: (taskId: string) => void;
  moveTask: (taskId: string, newColumnId: string) => void;
  setColumns: (columns: ColumnData[]) => void;
}

const TasksContext = createContext<TasksContextType | undefined>(undefined);

const initialTasks: Record<string, Task> = {
  'task-1': {
    id: 'task-1',
    title: 'Update API documentation',
    projectId: 'biogemse',
    projectName: 'BIOGEMSE',
    projectColor: '#3B82F6',
    status: 'In Progress',
    dueDate: '2025-11-25', // Today
    priority: 'High',
    commentsCount: 3,
    description: 'Update API docs with new endpoints',
    subtasksCompleted: 2,
    subtasksTotal: 5,
    timeEstimate: 180,
    timeLogged: 45,
    assignedTo: 'Alex Morgan',
    columnId: 'in-progress',
  },
  'task-2': {
    id: 'task-2',
    title: 'Code review for PR #234',
    projectId: 'halotex',
    projectName: 'HALO-TEX',
    projectColor: '#F59E0B',
    status: 'In Review',
    dueDate: '2025-11-25', // Today
    priority: 'High',
    commentsCount: 5,
    description: 'Review authentication changes',
    timeEstimate: 90,
    assignedTo: 'Alex Morgan',
    columnId: 'review',
  },
  'task-3': {
    id: 'task-3',
    title: 'Fix mobile responsive layout',
    projectId: 'retain',
    projectName: 'RETAIN',
    projectColor: '#10B981',
    status: 'Open',
    dueDate: '2025-11-25', // Today
    priority: 'Medium',
    commentsCount: 2,
    description: 'Tablet breakpoint issues',
    timeEstimate: 120,
    assignedTo: 'Alex Morgan',
    columnId: 'backlog',
  },
  'task-4': {
    id: 'task-4',
    title: 'Database migration script',
    projectId: 'biogemse',
    projectName: 'BIOGEMSE',
    projectColor: '#3B82F6',
    status: 'Open',
    dueDate: '2025-11-28',
    priority: 'High',
    commentsCount: 8,
    description: 'Prepare migration for v2.0 schema changes',
    timeEstimate: 240,
    assignedTo: 'Sarah Chen',
    columnId: 'backlog',
  },
  'task-5': {
    id: 'task-5',
    title: 'UI component library audit',
    projectId: 'retain',
    projectName: 'RETAIN',
    projectColor: '#10B981',
    status: 'Open',
    dueDate: '2025-11-29',
    priority: 'Medium',
    commentsCount: 4,
    description: 'Review and document all reusable components',
    timeEstimate: 180,
    assignedTo: 'Mike Johnson',
    tags: [{ id: 'tag1', name: 'Design System', color: '#8B5CF6' }],
    columnId: 'backlog',
  },
  'task-6': {
    id: 'task-6',
    title: 'Performance optimization',
    projectId: 'halotex',
    projectName: 'HALO-TEX',
    projectColor: '#F59E0B',
    status: 'Open',
    dueDate: '2025-12-02',
    priority: 'Low',
    commentsCount: 1,
    timeEstimate: 300,
    assignedTo: 'Sarah Chen',
    columnId: 'backlog',
  },
  'task-7': {
    id: 'task-7',
    title: 'Implement dark mode',
    projectId: 'retain',
    projectName: 'RETAIN',
    projectColor: '#10B981',
    status: 'In Progress',
    dueDate: '2025-11-27',
    priority: 'Medium',
    commentsCount: 12,
    description: 'Add dark mode support across all views',
    subtasksCompleted: 3,
    subtasksTotal: 8,
    timeEstimate: 360,
    timeLogged: 120,
    assignedTo: 'Mike Johnson',
    tags: [{ id: 'tag2', name: 'UI/UX', color: '#EC4899' }],
    columnId: 'in-progress',
  },
  'task-8': {
    id: 'task-8',
    title: 'User authentication refactor',
    projectId: 'biogemse',
    projectName: 'BIOGEMSE',
    projectColor: '#3B82F6',
    status: 'In Progress',
    dueDate: '2025-11-26',
    priority: 'High',
    commentsCount: 15,
    description: 'Migrate to OAuth 2.0',
    subtasksCompleted: 5,
    subtasksTotal: 7,
    timeEstimate: 480,
    timeLogged: 280,
    assignedTo: 'Sarah Chen',
    tags: [{ id: 'tag3', name: 'Security', color: '#EF4444' }],
    columnId: 'in-progress',
  },
  'task-9': {
    id: 'task-9',
    title: 'Write unit tests',
    projectId: 'halotex',
    projectName: 'HALO-TEX',
    projectColor: '#F59E0B',
    status: 'Done',
    dueDate: '2025-11-20',
    priority: 'Medium',
    commentsCount: 6,
    timeLogged: 150,
    assignedTo: 'Mike Johnson',
    columnId: 'done',
  },
  'task-10': {
    id: 'task-10',
    title: 'Analytics dashboard wireframes',
    projectId: 'retain',
    projectName: 'RETAIN',
    projectColor: '#10B981',
    status: 'Open',
    dueDate: '2025-12-01',
    priority: 'Low',
    commentsCount: 3,
    timeEstimate: 120,
    assignedTo: 'Sarah Chen',
    tags: [{ id: 'tag4', name: 'Design', color: '#8B5CF6' }],
    columnId: 'backlog',
  },
  'task-11': {
    id: 'task-11',
    title: 'Update privacy policy',
    projectId: 'biogemse',
    projectName: 'BIOGEMSE',
    projectColor: '#3B82F6',
    status: 'In Review',
    dueDate: '2025-11-26',
    priority: 'High',
    commentsCount: 9,
    description: 'GDPR compliance updates',
    timeEstimate: 90,
    waitingOn: 'External vendor',
    assignedTo: 'Alex Morgan',
    columnId: 'review',
  },
  'task-12': {
    id: 'task-12',
    title: 'Design system audit',
    projectId: 'retain',
    projectName: 'RETAIN',
    projectColor: '#10B981',
    status: 'Open',
    dueDate: '2025-11-30',
    priority: 'Medium',
    commentsCount: 5,
    description: 'Review color palette and spacing tokens',
    timeEstimate: 180,
    waitingOn: 'Sarah Chen',
    assignedTo: 'Alex Morgan',
    tags: [{ id: 'tag5', name: 'Design System', color: '#8B5CF6' }],
    columnId: 'backlog',
  },
  'task-13': {
    id: 'task-13',
    title: 'Email notification system',
    projectId: 'halotex',
    projectName: 'HALO-TEX',
    projectColor: '#F59E0B',
    status: 'In Progress',
    dueDate: '2025-11-28',
    priority: 'Medium',
    commentsCount: 7,
    subtasksCompleted: 2,
    subtasksTotal: 4,
    timeEstimate: 200,
    timeLogged: 60,
    assignedTo: 'Mike Johnson',
    columnId: 'in-progress',
  },
  'task-14': {
    id: 'task-14',
    title: 'Accessibility compliance',
    projectId: 'biogemse',
    projectName: 'BIOGEMSE',
    projectColor: '#3B82F6',
    status: 'Open',
    dueDate: '2025-12-05',
    priority: 'High',
    commentsCount: 11,
    description: 'WCAG 2.1 Level AA compliance',
    timeEstimate: 320,
    assignedTo: 'Sarah Chen',
    tags: [{ id: 'tag6', name: 'A11y', color: '#3B82F6' }],
    watchers: 3,
    columnId: 'backlog',
  },
  'task-15': {
    id: 'task-15',
    title: 'Security audit review',
    projectId: 'biogemse',
    projectName: 'BIOGEMSE',
    projectColor: '#3B82F6',
    status: 'In Review',
    dueDate: '2025-11-27',
    priority: 'High',
    commentsCount: 7,
    description: 'Review and address security audit findings',
    timeEstimate: 240,
    assignedTo: 'Mike Johnson',
    tags: [{ id: 'tag7', name: 'Security', color: '#EF4444' }],
    columnId: 'review',
  },
  'task-16': {
    id: 'task-16',
    title: 'Performance benchmarking',
    projectId: 'halotex',
    projectName: 'HALO-TEX',
    projectColor: '#F59E0B',
    status: 'Done',
    dueDate: '2025-11-23',
    priority: 'Medium',
    commentsCount: 2,
    timeLogged: 120,
    assignedTo: 'Sarah Chen',
    columnId: 'done',
  },
};

const initialColumns: ColumnData[] = [
  {
    id: 'backlog',
    name: 'Backlog',
    color: '#F59E0B',
    taskIds: ['task-3', 'task-4', 'task-5', 'task-6', 'task-10', 'task-12', 'task-14'],
  },
  {
    id: 'in-progress',
    name: 'In Progress',
    color: '#34D399',
    taskIds: ['task-1', 'task-7', 'task-8', 'task-13'],
  },
  {
    id: 'review',
    name: 'In Review',
    color: '#F59E0B',
    taskIds: ['task-2', 'task-11', 'task-15'],
  },
  {
    id: 'done',
    name: 'Done',
    color: '#10B981',
    taskIds: ['task-9', 'task-16'],
  },
];

export function TasksProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<Record<string, Task>>(initialTasks);
  const [columns, setColumns] = useState<ColumnData[]>(initialColumns);
  const [loading, setLoading] = useState(true);

  // Load tasks from API
  useEffect(() => {
    async function loadTasks() {
      try {
        setLoading(true);
        const { getTasks, getTaskStages } = await import('../services/tasksApi');
        const { getCurrentUser } = await import('../services/usersApi');
        
        // Get current user and their tasks
        const user = await getCurrentUser();
        const apiTasks = await getTasks();
        const stages = await getTaskStages(user.id);

        // Transform API tasks to Task format
        const transformedTasks: Record<string, Task> = {};
        apiTasks.forEach(apiTask => {
          // Check if task is assigned to current user
          const isAssigned = apiTask.participants?.some(p => p.user.id === user.id);
          if (!isAssigned) return;

          // Map column/status
          const statusMap: Record<string, 'Open' | 'In Progress' | 'In Review' | 'Done'> = {
            'To Do': 'Open',
            'In Progress': 'In Progress',
            'Review': 'In Review',
            'Done': 'Done',
          };

          transformedTasks[apiTask.id] = {
            id: apiTask.id,
            title: apiTask.name,
            projectId: apiTask.activity.project.id,
            projectName: apiTask.activity.project.name,
            projectColor: apiTask.color || '#3B82F6',
            status: statusMap[apiTask.column?.name || 'To Do'] || 'Open',
            dueDate: apiTask.endDate, // DD/MM/YYYY format
            priority: apiTask.importance === 3 ? 'High' : apiTask.importance === 2 ? 'Medium' : 'Low',
            commentsCount: apiTask.numComments || 0,
            description: apiTask.description,
            timeEstimate: parseFloat(apiTask.plannedHours || '0') * 60, // Convert to minutes
            timeLogged: parseFloat(apiTask.spentHours || '0') * 60,
            assignedTo: apiTask.participants?.[0]?.user.fullName || user.fullName,
            columnId: apiTask.column?.id,
          };
        });

        // Transform stages to columns
        const transformedColumns: ColumnData[] = stages.map(stage => ({
          id: stage.id,
          name: stage.name,
          color: stage.color,
          taskIds: apiTasks
            .filter(t => t.column?.id === stage.id && t.participants?.some(p => p.user.id === user.id))
            .map(t => t.id),
        }));

        setTasks(transformedTasks);
        setColumns(transformedColumns);
      } catch (error) {
        console.error('Error loading tasks:', error);
        // Keep initial tasks on error
      } finally {
        setLoading(false);
      }
    }

    loadTasks();
  }, []);

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    // Update local state immediately
    setTasks(prev => ({
      ...prev,
      [taskId]: { ...prev[taskId], ...updates }
    }));

    // Update via API
    try {
      const { updateTask: updateTaskAPI } = await import('../services/tasksApi');
      await updateTaskAPI(taskId, {
        name: updates.title,
        plannedHours: updates.timeEstimate ? (updates.timeEstimate / 60).toString() : undefined,
        // Map other fields as needed
      });
    } catch (error) {
      console.error('Error updating task:', error);
    }
  };

  const addTask = (task: Task) => {
    setTasks(prev => ({
      ...prev,
      [task.id]: task
    }));
  };

  const deleteTask = (taskId: string) => {
    setTasks(prev => {
      const newTasks = { ...prev };
      delete newTasks[taskId];
      return newTasks;
    });
  };

  const moveTask = async (taskId: string, newColumnId: string) => {
    // Update local state immediately
    setTasks(prev => ({
      ...prev,
      [taskId]: { ...prev[taskId], columnId: newColumnId }
    }));

    // Update via API
    try {
      const { moveTask: moveTaskAPI } = await import('../services/tasksApi');
      const task = tasks[taskId];
      const newColumn = columns.find(c => c.id === newColumnId);
      if (task && newColumn) {
        await moveTaskAPI(taskId, newColumnId, newColumn.taskIds.length);
      }
    } catch (error) {
      console.error('Error moving task:', error);
    }
  };

  return (
    <TasksContext.Provider value={{ tasks, columns, updateTask, addTask, deleteTask, moveTask, setColumns }}>
      {children}
    </TasksContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TasksContext);
  if (context === undefined) {
    throw new Error('useTasks must be used within a TasksProvider');
  }
  return context;
}

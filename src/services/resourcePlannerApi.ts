/**
 * Resource Planner API Service
 * Maps Workdeck API data to Resource Planner component format
 */

import { getUsers } from './usersApi';
import { getTasks } from './tasksApi';
import { getProjects } from './projectsApi';
import { getLeaveRequests } from './leaveApi';
import { formatDate } from './apiClient';
import type { UserEntity, ProjectEntity, TaskEntity } from './projectsApi';
import type { LeaveRequestEntity } from './leaveApi';

// Resource Planner types (matching the component expectations)
export interface User {
  id: string;
  name: string;
  avatar?: string;
  department: string;
  totalCapacity: number;
  role?: string;
}

export interface Project {
  id: string;
  name: string;
  color: string;
  duration?: string;
  amount?: number;
  isBillable: boolean;
  activities?: Activity[];
}

export interface Activity {
  id: string;
  name: string;
  projectId: string;
  tasks: Task[];
}

export interface Task {
  id: string;
  name: string;
  projectId: string;
  activityId: string;
  activity?: string;
  assigneeId?: string;
  assignedUserId?: string;
  plannedHours: number;
  loggedHours?: number;
  startDate: Date;
  endDate: Date;
  isBillable: boolean;
  allocationType: 'hard' | 'soft';
  status: string;
}

export interface Leave {
  id: string;
  userId: string;
  startDate: Date;
  endDate: Date;
  type: string;
  status: string;
}

/**
 * Fetch all Resource Planner data
 */
export async function fetchResourcePlannerData() {
  try {
    // Fetch data in parallel
    const [users, tasks, projects, leaves] = await Promise.all([
      getUsers(),
      getTasks(),
      getProjects(),
      getLeaveRequests({ startDate: formatDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)) }),
    ]);

    // Transform users
    const transformedUsers: User[] = users.map((user) => ({
      id: user.id,
      name: user.fullName,
      avatar: undefined, // API doesn't provide avatar URL
      department: user.department?.name || 'Unknown',
      totalCapacity: 40, // Default capacity, should come from user.timeTable
      role: user.staffCategory?.name || undefined,
    }));

    // Transform projects
    const transformedProjects: Project[] = projects.map((project) => ({
      id: project.id,
      name: project.name,
      color: project.colorAllTasks || '#3B82F6',
      isBillable: project.billable,
      amount: 0, // Not directly available in API
      activities: project.activities?.map((activity) => ({
        id: activity.id,
        name: activity.name,
        projectId: project.id,
        tasks: [], // Will be populated from tasks
      })),
    }));

    // Transform tasks
    const transformedTasks: Task[] = tasks.map((task) => {
      const startDate = parseDate(task.startDate);
      const endDate = parseDate(task.endDate);
      const plannedHours = parseFloat(task.plannedHours || '0');
      const spentHours = parseFloat(task.spentHours || '0');

      // Get primary participant (owner or first participant)
      const owner = task.participants?.find((p) => p.isOwner);
      const participant = owner || task.participants?.[0];

      return {
        id: task.id,
        name: task.name,
        projectId: task.activity.project.id,
        activityId: task.activity.id,
        activity: task.activity.name,
        assignedUserId: participant?.user.id,
        assigneeId: participant?.user.id,
        plannedHours,
        loggedHours: spentHours,
        startDate,
        endDate,
        isBillable: task.billable,
        allocationType: 'hard', // Default, could be determined from task properties
        status: task.column?.name || 'To Do',
      };
    });

    // Populate activities with tasks
    transformedProjects.forEach((project) => {
      project.activities?.forEach((activity) => {
        activity.tasks = transformedTasks.filter(
          (task) => task.activityId === activity.id && task.projectId === project.id
        );
      });
    });

    // Transform leaves - map to Resource Planner Leave type
    const transformedLeaves: Leave[] = leaves.map((leave) => {
      // Map leave type name to LeaveType enum
      const typeMap: Record<string, 'vacation' | 'sick' | 'personal' | 'holiday' | 'training' | 'wfh'> = {
        'vacation': 'vacation',
        'sick': 'sick',
        'personal': 'personal',
        'holiday': 'holiday',
        'training': 'training',
        'wfh': 'wfh',
      };
      const leaveType = typeMap[leave.leaveType.name.toLowerCase()] || 'personal';
      
      return {
        id: leave.id,
        userId: leave.user.id,
        startDate: parseDate(leave.startDate),
        endDate: parseDate(leave.endDate),
        type: leaveType,
        status: (leave.status === 0 ? 'pending' : leave.status === 1 ? 'approved' : 'denied') as 'pending' | 'approved' | 'denied',
        description: leave.comment,
        approvedBy: leave.approver?.fullName,
        requestedOn: new Date(leave.createdAt),
      };
    });

    return {
      users: transformedUsers,
      tasks: transformedTasks,
      projects: transformedProjects,
      leaves: transformedLeaves,
    };
  } catch (error) {
    console.error('Error fetching Resource Planner data:', error);
    throw error;
  }
}

/**
 * Parse DD/MM/YYYY date string to Date object
 */
function parseDate(dateString: string): Date {
  const [day, month, year] = dateString.split('/').map(Number);
  return new Date(year, month - 1, day);
}


// Core data types for Resource Planner

export interface User {
  id: string;
  name: string;
  avatar: string;
  department: string;
  totalCapacity: number; // hours per week
  role: string;
}

export interface Task {
  id: string;
  name: string;
  projectId: string;
  activityId?: string;
  assignedUserId: string;
  plannedHours: number;
  loggedHours?: number;
  startDate: Date;
  endDate: Date;
  isBillable: boolean;
  allocationType: 'soft' | 'hard';
  status?: 'To Do' | 'In Progress' | 'Completed' | 'Blocked';
}

export interface Activity {
  id: string;
  name: string;
  projectId: string;
  tasks: Task[];
}

export interface Project {
  id: string;
  name: string;
  color: string;
  duration: string;
  amount: number;
  isBillable: boolean;
  activities: Activity[];
}

export interface DayAllocation {
  date: string;
  plannedHours: number;
  totalCapacity: number;
  tasks: Task[];
}

export interface UserCapacity {
  userId: string;
  allocations: Map<string, DayAllocation>;
  totalPlanned: number;
  totalCapacity: number;
}

export interface AIRecommendation {
  id: string;
  taskId: string;
  taskName: string;
  currentUser: string;
  recommendedUser: string;
  currentUserName: string;
  recommendedUserName: string;
  hours: number;
  newStartDate: Date;
  newEndDate: Date;
  projectName: string;
  reason: string;
  impact: number; // billable % improvement
}

export type TimeResolution = 'day' | 'week' | 'month';

export type CapacityStatus = 'available' | 'optimal' | 'overallocated' | 'none';

export type LeaveType = 'vacation' | 'sick' | 'personal' | 'holiday' | 'training' | 'wfh';

export type LeaveStatus = 'approved' | 'pending' | 'denied';

export interface Leave {
  id: string;
  userId: string;
  type: LeaveType;
  startDate: Date;
  endDate: Date;
  description?: string;
  status: LeaveStatus;
  approvedBy?: string;
  requestedOn: Date;
  isHalfDay?: boolean;
}
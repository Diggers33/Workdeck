import { User, Project, Task, Activity, Leave } from '../types';

export const mockUsers: User[] = [
  {
    id: 'u1',
    name: 'Sarah Mitchell',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    department: 'Engineering',
    totalCapacity: 40,
    role: 'Senior Developer'
  },
  {
    id: 'u2',
    name: 'Marcus Chen',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Marcus',
    department: 'Engineering',
    totalCapacity: 40,
    role: 'Lead Developer'
  },
  {
    id: 'u3',
    name: 'Emma Rodriguez',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Emma',
    department: 'Design',
    totalCapacity: 40,
    role: 'UX Designer'
  },
  {
    id: 'u4',
    name: 'James Wilson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=James',
    department: 'Engineering',
    totalCapacity: 40,
    role: 'Developer'
  },
  {
    id: 'u5',
    name: 'Priya Patel',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Priya',
    department: 'Product',
    totalCapacity: 40,
    role: 'Product Manager'
  },
  {
    id: 'u6',
    name: 'Alex Thompson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    department: 'Engineering',
    totalCapacity: 40,
    role: 'Developer'
  },
  {
    id: 'u7',
    name: 'Lisa Anderson',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Lisa',
    department: 'Design',
    totalCapacity: 40,
    role: 'Senior Designer'
  },
  {
    id: 'u8',
    name: 'David Kim',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=David',
    department: 'Engineering',
    totalCapacity: 40,
    role: 'Tech Lead'
  },
  {
    id: 'u9',
    name: 'Rachel Green',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Rachel',
    department: 'Product',
    totalCapacity: 40,
    role: 'Product Designer'
  },
  {
    id: 'u10',
    name: 'Michael Brown',
    avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Michael',
    department: 'Engineering',
    totalCapacity: 40,
    role: 'Developer'
  },
];

export const mockProjects: Project[] = [
  {
    id: 'p1',
    name: 'E-Commerce Platform',
    color: '#3B82F6',
    duration: '3 months',
    amount: 125000,
    isBillable: true,
    activities: []
  },
  {
    id: 'p2',
    name: 'Mobile App Redesign',
    color: '#8B5CF6',
    duration: '2 months',
    amount: 85000,
    isBillable: true,
    activities: []
  },
  {
    id: 'p3',
    name: 'Internal Tools',
    color: '#F97316',
    duration: '1 month',
    amount: 0,
    isBillable: false,
    activities: []
  },
  {
    id: 'p4',
    name: 'Customer Portal',
    color: '#10B981',
    duration: '4 months',
    amount: 180000,
    isBillable: true,
    activities: []
  },
  {
    id: 'p5',
    name: 'Marketing Website',
    color: '#F59E0B',
    duration: '6 weeks',
    amount: 45000,
    isBillable: true,
    activities: []
  },
];

// Helper to create dates relative to today
const getDate = (daysOffset: number): Date => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  date.setHours(0, 0, 0, 0);
  return date;
};

export const mockTasks: Task[] = [
  // Sarah Mitchell - Engineering
  {
    id: 't1',
    name: 'Backend API Development',
    projectId: 'p1',
    activityId: 'a1',
    activity: 'Backend Development',
    assigneeId: 'u1',
    assignedUserId: 'u1',
    plannedHours: 4,
    loggedHours: 2,
    startDate: getDate(1),
    endDate: getDate(4),
    isBillable: true,
    allocationType: 'hard',
    status: 'In Progress'
  },
  {
    id: 't2',
    name: 'Database Migration',
    projectId: 'p3',
    activity: 'Code Review',
    assigneeId: 'u1',
    assignedUserId: 'u1',
    plannedHours: 2,
    loggedHours: 1,
    startDate: getDate(1),
    endDate: getDate(2),
    isBillable: false,
    allocationType: 'soft',
    status: 'In Progress'
  },
  // Marcus Chen - Engineering (Overallocated)
  {
    id: 't3',
    name: 'Frontend Framework',
    projectId: 'p2',
    activity: 'Frontend Development',
    assigneeId: 'u2',
    assignedUserId: 'u2',
    plannedHours: 6,
    loggedHours: 3,
    startDate: getDate(1),
    endDate: getDate(3),
    isBillable: true,
    allocationType: 'hard',
    status: 'In Progress'
  },
  {
    id: 't4',
    name: 'Component Library',
    projectId: 'p2',
    activity: 'Frontend Development',
    assigneeId: 'u2',
    assignedUserId: 'u2',
    plannedHours: 4,
    startDate: getDate(1),
    endDate: getDate(4),
    isBillable: true,
    allocationType: 'soft',
    status: 'To Do'
  },
  {
    id: 't5',
    name: 'Code Review',
    projectId: 'p3',
    activity: 'Code Review',
    assigneeId: 'u2',
    assignedUserId: 'u2',
    plannedHours: 2,
    startDate: getDate(2),
    endDate: getDate(3),
    isBillable: false,
    allocationType: 'soft',
    status: 'To Do'
  },
  // Emma Rodriguez - Design (Overallocated)
  {
    id: 't6',
    name: 'User Research',
    projectId: 'p4',
    activity: 'UX Design',
    assigneeId: 'u3',
    assignedUserId: 'u3',
    plannedHours: 5,
    startDate: getDate(1),
    endDate: getDate(3),
    isBillable: true,
    allocationType: 'hard',
    status: 'In Progress'
  },
  {
    id: 't7',
    name: 'Wireframing',
    projectId: 'p5',
    activity: 'Design',
    assigneeId: 'u3',
    assignedUserId: 'u3',
    plannedHours: 4,
    startDate: getDate(1),
    endDate: getDate(4),
    isBillable: true,
    allocationType: 'soft',
    status: 'To Do'
  },
  {
    id: 't8',
    name: 'Prototype',
    projectId: 'p2',
    activity: 'Design',
    assigneeId: 'u3',
    assignedUserId: 'u3',
    plannedHours: 3,
    startDate: getDate(2),
    endDate: getDate(4),
    isBillable: true,
    allocationType: 'soft',
    status: 'To Do'
  },
  // Lisa Anderson - Design
  {
    id: 't9',
    name: 'Visual Design',
    projectId: 'p5',
    activity: 'Design',
    assigneeId: 'u7',
    assignedUserId: 'u7',
    plannedHours: 5,
    startDate: getDate(1),
    endDate: getDate(3),
    isBillable: true,
    allocationType: 'hard',
    status: 'In Progress'
  },
  {
    id: 't10',
    name: 'Design System',
    projectId: 'p4',
    activity: 'Design System',
    assigneeId: 'u7',
    assignedUserId: 'u7',
    plannedHours: 3,
    startDate: getDate(2),
    endDate: getDate(4),
    isBillable: true,
    allocationType: 'soft',
    status: 'To Do'
  },
  // James Wilson - Engineering
  {
    id: 't11',
    name: 'Payment Integration',
    projectId: 'p1',
    activity: 'Payment System',
    assigneeId: 'u4',
    assignedUserId: 'u4',
    plannedHours: 5,
    startDate: getDate(1),
    endDate: getDate(4),
    isBillable: true,
    allocationType: 'hard',
    status: 'In Progress'
  },
  {
    id: 't12',
    name: 'Testing',
    projectId: 'p1',
    activity: 'Testing',
    assigneeId: 'u4',
    assignedUserId: 'u4',
    plannedHours: 2,
    startDate: getDate(2),
    endDate: getDate(3),
    isBillable: true,
    allocationType: 'soft',
    status: 'To Do'
  },
  // Alex Thompson - Engineering (Available capacity)
  {
    id: 't13',
    name: 'Feature Development',
    projectId: 'p2',
    activity: 'Frontend Development',
    assigneeId: 'u6',
    assignedUserId: 'u6',
    plannedHours: 3,
    startDate: getDate(2),
    endDate: getDate(4),
    isBillable: true,
    allocationType: 'soft',
    status: 'To Do'
  },
  // David Kim - Engineering (Overallocated)
  {
    id: 't14',
    name: 'Architecture Design',
    projectId: 'p4',
    activity: 'Architecture',
    assigneeId: 'u8',
    assignedUserId: 'u8',
    plannedHours: 5,
    startDate: getDate(1),
    endDate: getDate(3),
    isBillable: true,
    allocationType: 'hard',
    status: 'In Progress'
  },
  {
    id: 't15',
    name: 'Tech Debt',
    projectId: 'p3',
    activity: 'Refactoring',
    assigneeId: 'u8',
    assignedUserId: 'u8',
    plannedHours: 3,
    startDate: getDate(1),
    endDate: getDate(4),
    isBillable: false,
    allocationType: 'soft',
    status: 'To Do'
  },
  {
    id: 't16',
    name: 'Team Mentoring',
    projectId: 'p3',
    activity: 'Mentoring',
    assigneeId: 'u8',
    assignedUserId: 'u8',
    plannedHours: 2,
    startDate: getDate(2),
    endDate: getDate(3),
    isBillable: false,
    allocationType: 'soft',
    status: 'To Do'
  },
  // Michael Brown - Engineering (Overallocated)
  {
    id: 't17',
    name: 'API Integration',
    projectId: 'p4',
    activity: 'API Development',
    assigneeId: 'u10',
    assignedUserId: 'u10',
    plannedHours: 6,
    startDate: getDate(1),
    endDate: getDate(3),
    isBillable: true,
    allocationType: 'hard',
    status: 'In Progress'
  },
  {
    id: 't18',
    name: 'Unit Tests',
    projectId: 'p4',
    activity: 'Testing',
    assigneeId: 'u10',
    assignedUserId: 'u10',
    plannedHours: 3,
    startDate: getDate(1),
    endDate: getDate(4),
    isBillable: true,
    allocationType: 'soft',
    status: 'To Do'
  },
  {
    id: 't19',
    name: 'Documentation',
    projectId: 'p3',
    activity: 'Documentation',
    assigneeId: 'u10',
    assignedUserId: 'u10',
    plannedHours: 2,
    startDate: getDate(2),
    endDate: getDate(3),
    isBillable: false,
    allocationType: 'soft',
    status: 'To Do'
  },
  // Priya Patel - Product
  {
    id: 't20',
    name: 'Requirements Gathering',
    projectId: 'p2',
    activity: 'Product Planning',
    assigneeId: 'u5',
    assignedUserId: 'u5',
    plannedHours: 4,
    startDate: getDate(1),
    endDate: getDate(4),
    isBillable: true,
    allocationType: 'hard',
    status: 'In Progress'
  },
  // Rachel Green - Product
  {
    id: 't21',
    name: 'Product Strategy',
    projectId: 'p4',
    activity: 'Strategy',
    assigneeId: 'u9',
    assignedUserId: 'u9',
    plannedHours: 5,
    startDate: getDate(1),
    endDate: getDate(3),
    isBillable: true,
    allocationType: 'hard',
    status: 'In Progress'
  },
];

export const mockActivities: Activity[] = [
  {
    id: 'a1',
    name: 'Backend Development',
    projectId: 'p1',
    tasks: mockTasks.filter(t => t.activityId === 'a1')
  },
  {
    id: 'a2',
    name: 'Frontend Development',
    projectId: 'p2',
    tasks: mockTasks.filter(t => t.activityId === 'a2')
  },
  {
    id: 'a3',
    name: 'UX Design',
    projectId: 'p4',
    tasks: mockTasks.filter(t => t.activityId === 'a3')
  },
  {
    id: 'a4',
    name: 'Payment System',
    projectId: 'p1',
    tasks: mockTasks.filter(t => t.activityId === 'a4')
  },
];

// Update projects with activities
mockProjects[0].activities = mockActivities.filter(a => a.projectId === 'p1');
mockProjects[1].activities = mockActivities.filter(a => a.projectId === 'p2');
mockProjects[3].activities = mockActivities.filter(a => a.projectId === 'p4');

export const departments = ['All Departments', 'Engineering', 'Design', 'Product'];

// Mock leave data
export const mockLeaves: Leave[] = [
  // Sarah Mitchell - Thanksgiving
  {
    id: 'l1',
    userId: 'u1',
    type: 'vacation',
    startDate: new Date(2024, 10, 28), // Nov 28
    endDate: new Date(2024, 10, 29), // Nov 29
    description: 'Thanksgiving Weekend',
    status: 'approved',
    approvedBy: 'John Manager',
    requestedOn: new Date(2024, 10, 1),
  },
  // Marcus Chen - Holiday Break
  {
    id: 'l2',
    userId: 'u2',
    type: 'vacation',
    startDate: new Date(2024, 11, 23), // Dec 23
    endDate: new Date(2024, 11, 27), // Dec 27
    description: 'Holiday Break',
    status: 'approved',
    approvedBy: 'John Manager',
    requestedOn: new Date(2024, 10, 5),
  },
  // Emma Rodriguez - Sick day
  {
    id: 'l3',
    userId: 'u3',
    type: 'sick',
    startDate: new Date(2024, 10, 20), // Nov 20
    endDate: new Date(2024, 10, 20), // Nov 20
    description: 'Flu',
    status: 'approved',
    approvedBy: 'Manager',
    requestedOn: new Date(2024, 10, 20),
  },
  // James Wilson - Personal day
  {
    id: 'l4',
    userId: 'u4',
    type: 'personal',
    startDate: new Date(2024, 10, 25), // Nov 25
    endDate: new Date(2024, 10, 25), // Nov 25
    description: 'Personal matters',
    status: 'approved',
    approvedBy: 'Manager',
    requestedOn: new Date(2024, 10, 15),
  },
  // Priya Patel - Conference
  {
    id: 'l5',
    userId: 'u5',
    type: 'training',
    startDate: new Date(2024, 10, 18), // Nov 18
    endDate: new Date(2024, 10, 19), // Nov 19
    description: 'Product Management Conference',
    status: 'approved',
    approvedBy: 'Director',
    requestedOn: new Date(2024, 9, 20),
  },
  // Alex Thompson - Work from home
  {
    id: 'l6',
    userId: 'u6',
    type: 'wfh',
    startDate: new Date(2024, 10, 21), // Nov 21
    endDate: new Date(2024, 10, 22), // Nov 22
    description: 'Home office',
    status: 'approved',
    approvedBy: 'Manager',
    requestedOn: new Date(2024, 10, 18),
  },
  // Public Holiday - Thanksgiving (everyone)
  {
    id: 'l7',
    userId: 'u1',
    type: 'holiday',
    startDate: new Date(2024, 10, 28), // Nov 28 (Thanksgiving)
    endDate: new Date(2024, 10, 28),
    description: 'Thanksgiving Day',
    status: 'approved',
    requestedOn: new Date(2024, 0, 1),
  },
  {
    id: 'l8',
    userId: 'u2',
    type: 'holiday',
    startDate: new Date(2024, 10, 28),
    endDate: new Date(2024, 10, 28),
    description: 'Thanksgiving Day',
    status: 'approved',
    requestedOn: new Date(2024, 0, 1),
  },
  {
    id: 'l9',
    userId: 'u3',
    type: 'holiday',
    startDate: new Date(2024, 10, 28),
    endDate: new Date(2024, 10, 28),
    description: 'Thanksgiving Day',
    status: 'approved',
    requestedOn: new Date(2024, 0, 1),
  },
  {
    id: 'l10',
    userId: 'u4',
    type: 'holiday',
    startDate: new Date(2024, 10, 28),
    endDate: new Date(2024, 10, 28),
    description: 'Thanksgiving Day',
    status: 'approved',
    requestedOn: new Date(2024, 0, 1),
  },
  // Pending leave - awaiting approval
  {
    id: 'l11',
    userId: 'u7',
    type: 'vacation',
    startDate: new Date(2024, 11, 16), // Dec 16
    endDate: new Date(2024, 11, 20), // Dec 20
    description: 'Year-end vacation',
    status: 'pending',
    requestedOn: new Date(2024, 10, 10),
  },
  // Half day example
  {
    id: 'l12',
    userId: 'u8',
    type: 'personal',
    startDate: new Date(2024, 10, 22), // Nov 22
    endDate: new Date(2024, 10, 22),
    description: 'Doctor appointment',
    status: 'approved',
    approvedBy: 'Manager',
    requestedOn: new Date(2024, 10, 15),
    isHalfDay: true,
  },
];
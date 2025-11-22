import { Task, User, DayAllocation, UserCapacity, CapacityStatus } from '../types';

export const getCapacityStatus = (plannedHours: number, totalCapacity: number): CapacityStatus => {
  if (plannedHours === 0) return 'none';
  const utilization = plannedHours / totalCapacity;
  if (utilization >= 1) return 'overallocated';
  if (utilization >= 0.5) return 'optimal';
  return 'available';
};

export const getCapacityColor = (status: CapacityStatus): string => {
  switch (status) {
    case 'available':
      return 'bg-green-100 border-green-300 text-green-800';
    case 'optimal':
      return 'bg-amber-100 border-amber-300 text-amber-800';
    case 'overallocated':
      return 'bg-red-100 border-red-300 text-red-800';
    case 'none':
      return 'bg-gray-50 border-gray-200 text-gray-400';
  }
};

export const formatDateKey = (date: Date): string => {
  return date.toISOString().split('T')[0];
};

export const parseDate = (dateKey: string): Date => {
  return new Date(dateKey);
};

export const getDatesInRange = (startDate: Date, endDate: Date): Date[] => {
  const dates: Date[] = [];
  const current = new Date(startDate);
  const end = new Date(endDate);
  
  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  
  return dates;
};

export const getWeeksInRange = (startDate: Date, endDate: Date): Date[] => {
  const weeks: Date[] = [];
  const current = new Date(startDate);
  
  // Start from beginning of week (Monday)
  current.setDate(current.getDate() - ((current.getDay() + 6) % 7));
  
  while (current <= endDate) {
    weeks.push(new Date(current));
    current.setDate(current.getDate() + 7);
  }
  
  return weeks;
};

export const getMonthsInRange = (startDate: Date, endDate: Date): Date[] => {
  const months: Date[] = [];
  const current = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
  const end = new Date(endDate.getFullYear(), endDate.getMonth(), 1);
  
  while (current <= end) {
    months.push(new Date(current));
    current.setMonth(current.getMonth() + 1);
  }
  
  return months;
};

export const calculateUserCapacity = (
  user: User,
  tasks: Task[],
  startDate: Date,
  endDate: Date
): UserCapacity => {
  const userTasks = tasks.filter(t => t.assignedUserId === user.id);
  const allocations = new Map<string, DayAllocation>();
  
  const dates = getDatesInRange(startDate, endDate);
  
  dates.forEach(date => {
    const dateKey = formatDateKey(date);
    const dayTasks = userTasks.filter(task => {
      const taskStart = new Date(task.startDate);
      const taskEnd = new Date(task.endDate);
      taskStart.setHours(0, 0, 0, 0);
      taskEnd.setHours(0, 0, 0, 0);
      return date >= taskStart && date <= taskEnd;
    });
    
    const plannedHours = dayTasks.reduce((sum, task) => sum + task.plannedHours, 0);
    
    allocations.set(dateKey, {
      date: dateKey,
      plannedHours,
      totalCapacity: 8, // 8 hours per day
      tasks: dayTasks
    });
  });
  
  const totalPlanned = Array.from(allocations.values()).reduce(
    (sum, alloc) => sum + alloc.plannedHours,
    0
  );
  
  const totalCapacity = dates.length * 8;
  
  return {
    userId: user.id,
    allocations,
    totalPlanned,
    totalCapacity
  };
};

export const calculateWeeklyCapacity = (
  user: User,
  tasks: Task[],
  weekStart: Date
): DayAllocation => {
  const userTasks = tasks.filter(t => t.assignedUserId === user.id);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekEnd.getDate() + 6);
  
  const weekTasks = userTasks.filter(task => {
    const taskStart = new Date(task.startDate);
    const taskEnd = new Date(task.endDate);
    return !(taskEnd < weekStart || taskStart > weekEnd);
  });
  
  const plannedHours = weekTasks.reduce((sum, task) => sum + task.plannedHours, 0);
  
  return {
    date: formatDateKey(weekStart),
    plannedHours,
    totalCapacity: 40, // 40 hours per week
    tasks: weekTasks
  };
};

export const calculateMonthlyCapacity = (
  user: User,
  tasks: Task[],
  monthStart: Date
): DayAllocation => {
  const userTasks = tasks.filter(t => t.assignedUserId === user.id);
  const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
  
  const monthTasks = userTasks.filter(task => {
    const taskStart = new Date(task.startDate);
    const taskEnd = new Date(task.endDate);
    return !(taskEnd < monthStart || taskStart > monthEnd);
  });
  
  // Calculate working days in month (excluding weekends)
  let workingDays = 0;
  const current = new Date(monthStart);
  while (current <= monthEnd) {
    const day = current.getDay();
    if (day !== 0 && day !== 6) workingDays++;
    current.setDate(current.getDate() + 1);
  }
  
  const plannedHours = monthTasks.reduce((sum, task) => sum + task.plannedHours, 0);
  
  return {
    date: formatDateKey(monthStart),
    plannedHours,
    totalCapacity: workingDays * 8,
    tasks: monthTasks
  };
};

export const formatDateHeader = (date: Date, resolution: 'day' | 'week' | 'month'): string => {
  if (resolution === 'day') {
    return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
  } else if (resolution === 'week') {
    const weekEnd = new Date(date);
    weekEnd.setDate(weekEnd.getDate() + 6);
    return `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`;
  } else {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }
};

export const calculateBillableUtilization = (tasks: Task[], users: User[]): number => {
  const totalHours = tasks.reduce((sum, task) => sum + task.plannedHours, 0);
  const billableHours = tasks.filter(t => t.isBillable).reduce((sum, task) => sum + task.plannedHours, 0);
  
  return totalHours > 0 ? (billableHours / totalHours) * 100 : 0;
};

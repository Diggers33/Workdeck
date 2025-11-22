import { useState, useMemo } from 'react';
import { Sparkles, TrendingUp, TrendingDown, Target, Calendar, Filter } from 'lucide-react';
import { Task, User, Project, AIRecommendation } from '../types';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { SimulationPanel } from './SimulationPanel';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Calendar as CalendarComponent } from './ui/calendar';
import { format, startOfWeek, endOfWeek, eachWeekOfInterval, addWeeks } from 'date-fns';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface ResourceAllocationProps {
  users: User[];
  tasks: Task[];
  projects: Project[];
  departments: string[];
}

export function ResourceAllocation({
  users,
  tasks,
  projects,
  departments,
}: ResourceAllocationProps) {
  const [selectedDepartment, setSelectedDepartment] = useState('All Departments');
  const [dateRange, setDateRange] = useState<{ start: Date; end: Date }>({
    start: new Date(),
    end: addWeeks(new Date(), 8),
  });
  const [showSimulation, setShowSimulation] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [recommendations, setRecommendations] = useState<AIRecommendation[]>([]);
  
  const filteredTasks = useMemo(() => {
    if (selectedDepartment === 'All Departments') return tasks;
    const departmentUsers = users.filter(u => u.department === selectedDepartment);
    return tasks.filter(t => departmentUsers.some(u => u.id === t.assignedUserId));
  }, [tasks, users, selectedDepartment]);
  
  // Calculate KPIs
  const totalHours = useMemo(() => {
    return filteredTasks.reduce((sum, task) => sum + task.plannedHours, 0);
  }, [filteredTasks]);
  
  const billableHours = useMemo(() => {
    return filteredTasks.filter(t => t.isBillable).reduce((sum, task) => sum + task.plannedHours, 0);
  }, [filteredTasks]);
  
  const currentUtilization = useMemo(() => {
    return totalHours > 0 ? (billableHours / totalHours) * 100 : 0;
  }, [billableHours, totalHours]);
  
  const availableCapacity = useMemo(() => {
    return 100 - currentUtilization;
  }, [currentUtilization]);
  
  const targetUtilization = 75;
  
  // Weekly breakdown data
  const weeklyData = useMemo(() => {
    const weeks = eachWeekOfInterval({
      start: dateRange.start,
      end: dateRange.end,
    });
    
    return weeks.map(weekStart => {
      const weekEnd = endOfWeek(weekStart);
      const weekTasks = filteredTasks.filter(task => {
        const taskStart = new Date(task.startDate);
        const taskEnd = new Date(task.endDate);
        return !(taskEnd < weekStart || taskStart > weekEnd);
      });
      
      const billable = weekTasks.filter(t => t.isBillable).reduce((sum, t) => sum + t.plannedHours, 0);
      const nonBillable = weekTasks.filter(t => !t.isBillable).reduce((sum, t) => sum + t.plannedHours, 0);
      const total = billable + nonBillable;
      const capacity = users.length * 40; // 40 hours per user per week
      const available = Math.max(0, capacity - total);
      
      return {
        week: format(weekStart, 'MMM d'),
        billable,
        nonBillable,
        available,
        total: capacity,
      };
    });
  }, [filteredTasks, dateRange, users]);
  
  // Project breakdown
  const projectBreakdown = useMemo(() => {
    return projects.map(project => {
      const projectTasks = filteredTasks.filter(t => t.projectId === project.id);
      const hours = projectTasks.reduce((sum, t) => sum + t.plannedHours, 0);
      const percentage = totalHours > 0 ? (hours / totalHours) * 100 : 0;
      
      return {
        ...project,
        hours,
        percentage,
      };
    }).filter(p => p.hours > 0).sort((a, b) => b.hours - a.hours);
  }, [projects, filteredTasks, totalHours]);
  
  const runSimulation = () => {
    setIsSimulating(true);
    
    // Simulate AI processing
    setTimeout(() => {
      // Generate mock recommendations
      const mockRecommendations: AIRecommendation[] = [
        {
          id: 'r1',
          taskId: 't3',
          taskName: 'Code Review',
          currentUser: 'u1',
          recommendedUser: 'u6',
          currentUserName: 'Sarah Mitchell',
          recommendedUserName: 'Alex Thompson',
          hours: 2,
          newStartDate: new Date(),
          newEndDate: addWeeks(new Date(), 2),
          projectName: 'Internal Tools',
          reason: 'Sarah is overallocated (120% capacity). Alex has available capacity (45%).',
          impact: 3.2,
        },
        {
          id: 'r2',
          taskId: 't16',
          taskName: 'Tech Debt',
          currentUser: 'u8',
          recommendedUser: 'u10',
          currentUserName: 'David Kim',
          recommendedUserName: 'Michael Brown',
          hours: 4,
          newStartDate: new Date(),
          newEndDate: addWeeks(new Date(), 1),
          projectName: 'Internal Tools',
          reason: 'Reallocating non-billable work to balance team capacity.',
          impact: 2.8,
        },
        {
          id: 'r3',
          taskId: 't6',
          taskName: 'User Research',
          currentUser: 'u3',
          recommendedUser: 'u9',
          currentUserName: 'Emma Rodriguez',
          recommendedUserName: 'Rachel Green',
          hours: 4,
          newStartDate: addWeeks(new Date(), 1),
          newEndDate: addWeeks(new Date(), 2),
          projectName: 'Customer Portal',
          reason: 'Rachel has stronger background in user research and available capacity.',
          impact: 4.5,
        },
        {
          id: 'r4',
          taskId: 't10',
          taskName: 'Documentation',
          currentUser: 'u4',
          recommendedUser: 'u6',
          currentUserName: 'James Wilson',
          recommendedUserName: 'Alex Thompson',
          hours: 2,
          newStartDate: new Date(),
          newEndDate: addWeeks(new Date(), 1),
          projectName: 'Internal Tools',
          reason: 'James is overallocated. Moving non-billable tasks to available team members.',
          impact: 1.9,
        },
        {
          id: 'r5',
          taskId: 't12',
          taskName: 'Feature Development',
          currentUser: 'u6',
          recommendedUser: 'u2',
          currentUserName: 'Alex Thompson',
          recommendedUserName: 'Marcus Chen',
          hours: 5,
          newStartDate: addWeeks(new Date(), 1),
          newEndDate: addWeeks(new Date(), 3),
          projectName: 'Mobile App Redesign',
          reason: 'Marcus has expertise in this area and optimal capacity utilization.',
          impact: 5.2,
        },
      ];
      
      setRecommendations(mockRecommendations);
      setIsSimulating(false);
      setShowSimulation(true);
    }, 2000);
  };
  
  return (
    <div className="flex flex-col h-full bg-gray-50 relative">
      <div className="flex-1 overflow-auto p-6">
        {/* Header */}
        <div className="mb-6">
          <h2 className="text-lg font-semibold">Resource Allocation & Billable Optimization</h2>
          <p className="text-sm text-gray-600">
            Track billable utilization and optimize team capacity
          </p>
        </div>
        
        {/* Controls */}
        <div className="flex items-center gap-3 mb-6">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <Calendar className="h-4 w-4 mr-2" />
                {format(dateRange.start, 'MMM d')} - {format(dateRange.end, 'MMM d, yyyy')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-4" align="start">
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Start Date</label>
                  <CalendarComponent
                    mode="single"
                    selected={dateRange.start}
                    onSelect={(date) => date && setDateRange({ ...dateRange, start: date })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">End Date</label>
                  <CalendarComponent
                    mode="single"
                    selected={dateRange.end}
                    onSelect={(date) => date && setDateRange({ ...dateRange, end: date })}
                  />
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-48">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {departments.map(dept => (
                <SelectItem key={dept} value={dept}>
                  {dept}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button
            onClick={runSimulation}
            disabled={isSimulating}
            className="ml-auto"
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {isSimulating ? 'Running Simulation...' : 'Run AI Simulation'}
          </Button>
        </div>
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Billable Utilization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-3xl font-semibold">
                  {currentUtilization.toFixed(1)}%
                </div>
                <Progress value={currentUtilization} className="h-2" />
                <div className="flex items-center gap-1 text-sm">
                  {currentUtilization >= targetUtilization ? (
                    <>
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-green-600">Above target</span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="h-4 w-4 text-red-600" />
                      <span className="text-red-600">
                        {(targetUtilization - currentUtilization).toFixed(1)}% below target
                      </span>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 flex items-center gap-2">
                <Target className="h-4 w-4" />
                Target Utilization
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-3xl font-semibold">
                  {targetUtilization}%
                </div>
                <div className="relative pt-1">
                  <div className="flex items-center justify-center">
                    <div className="relative w-24 h-24">
                      <svg className="transform -rotate-90 w-24 h-24">
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          stroke="#e5e7eb"
                          strokeWidth="8"
                          fill="none"
                        />
                        <circle
                          cx="48"
                          cy="48"
                          r="40"
                          stroke="#3b82f6"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${(currentUtilization / targetUtilization) * 251} 251`}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center text-sm font-medium">
                        {((currentUtilization / targetUtilization) * 100).toFixed(0)}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-600">
                Available Capacity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-3xl font-semibold">
                  {availableCapacity.toFixed(1)}%
                </div>
                <Progress value={availableCapacity} className="h-2" />
                <div className="text-sm text-gray-600">
                  {billableHours.toFixed(0)}h billable / {totalHours.toFixed(0)}h total
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Weekly Breakdown Chart */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Weekly Capacity Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis label={{ value: 'Hours', angle: -90, position: 'insideLeft' }} />
                <Tooltip />
                <Legend />
                <Bar dataKey="billable" stackId="a" fill="#10B981" name="Billable" />
                <Bar dataKey="nonBillable" stackId="a" fill="#F97316" name="Non-billable" />
                <Bar dataKey="available" stackId="a" fill="#6B7280" name="Available" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        {/* Project Breakdown Table */}
        <Card>
          <CardHeader>
            <CardTitle>Project Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Project Name
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-gray-600">
                      Duration
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                      Amount
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                      Hours
                    </th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-gray-600">
                      Percentage
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {projectBreakdown.map(project => (
                    <tr key={project.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded"
                            style={{ backgroundColor: project.color }}
                          />
                          <span>{project.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {project.duration}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {project.isBillable ? `$${project.amount.toLocaleString()}` : '—'}
                      </td>
                      <td className="py-3 px-4 text-right">
                        {project.hours.toFixed(0)}h
                      </td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 bg-gray-200 h-2 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-blue-500"
                              style={{ width: `${project.percentage}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium w-12">
                            {project.percentage.toFixed(1)}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Simulation Panel */}
      {showSimulation && (
        <SimulationPanel
          recommendations={recommendations}
          currentUtilization={currentUtilization}
          onClose={() => setShowSimulation(false)}
          onApply={(selectedIds) => {
            console.log('Applying recommendations:', selectedIds);
            setShowSimulation(false);
          }}
        />
      )}
    </div>
  );
}

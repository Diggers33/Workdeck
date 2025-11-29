import { useState, useMemo, useEffect } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { HeatMap } from './components/HeatMap';
import { ResourceAllocation } from './components/ResourceAllocation';
import { TaskDetailModal } from './components/TaskDetailModal';
import { PlanTimeDialog } from './components/PlanTimeDialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs';
import { Toaster } from './components/ui/sonner';
import { fetchResourcePlannerData } from '../../../services/resourcePlannerApi';
import { getDepartments } from '../../../services/usersApi';
import { Task, User, Project, Leave } from './types';
import { toast } from 'sonner';
import { TrendingUp, TrendingDown, Loader2 } from 'lucide-react';
import { colors, typography } from './constants/designTokens';

// Default departments if API doesn't return them
const defaultDepartments = [
  { id: 'eng', name: 'Engineering' },
  { id: 'design', name: 'Design' },
  { id: 'product', name: 'Product' },
];

export default function App() {
  const [activeTab, setActiveTab] = useState<'heatmap' | 'allocation'>('heatmap');
  const [users, setUsers] = useState<User[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [departments, setDepartments] = useState(defaultDepartments);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [planTimeUserId, setPlanTimeUserId] = useState<string | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showPlanTimeDialog, setShowPlanTimeDialog] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch Resource Planner data and departments in parallel
        const [data, depts] = await Promise.all([
          fetchResourcePlannerData(),
          getDepartments().catch(() => defaultDepartments), // Fallback to defaults
        ]);

        setUsers(data.users);
        setTasks(data.tasks);
        setProjects(data.projects);
        setLeaves(data.leaves);
        setDepartments(depts.length > 0 ? depts.map(d => ({ id: d.id, name: d.name })) : defaultDepartments);
      } catch (err) {
        console.error('Error loading Resource Planner data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
        toast.error('Failed to load Resource Planner data');
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const teamCount = users.length;
    const activeProjects = projects.filter(p => p.isBillable || (p.amount && p.amount > 0)).length;

    // Calculate utilization per user based on current week's tasks
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const userUtilization = users.map(user => {
      const userTasks = tasks.filter(t =>
        t.assignedUserId === user.id &&
        new Date(t.startDate) <= weekEnd &&
        new Date(t.endDate) >= weekStart
      );
      const totalPlannedHours = userTasks.reduce((sum, t) => sum + (t.plannedHours || 0), 0);
      const utilizationPercent = (totalPlannedHours / user.totalCapacity) * 100;
      return { userId: user.id, utilization: utilizationPercent };
    });

    const overCapacity = userUtilization.filter(u => u.utilization > 100).length;
    const optimalCapacity = userUtilization.filter(u => u.utilization >= 70 && u.utilization <= 100).length;
    const underCapacity = userUtilization.filter(u => u.utilization < 70).length;

    const avgUtilization = userUtilization.length > 0
      ? Math.round(userUtilization.reduce((sum, u) => sum + u.utilization, 0) / userUtilization.length)
      : 0;

    // Mock trend - in real app would compare to last week
    const trendUp = avgUtilization >= 75;

    return {
      teamCount,
      activeProjects,
      overCapacity,
      optimalCapacity,
      underCapacity,
      avgUtilization,
      trendUp
    };
  }, [users, tasks, projects]);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const handleTaskSave = async (updatedTask: Task) => {
    try {
      // Update task via API
      const { updateTask } = await import('../../../services/tasksApi');
      await updateTask(updatedTask.id, {
        name: updatedTask.name,
        plannedHours: updatedTask.plannedHours.toString(),
        // Add other fields as needed
      });
      
      // Update local state
      setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
      toast.success('Task updated successfully');
    } catch (err) {
      console.error('Error updating task:', err);
      toast.error('Failed to update task');
    }
  };

  const handlePlanTime = (userId: string) => {
    setPlanTimeUserId(userId);
    setShowPlanTimeDialog(true);
  };

  const handlePlanTimeSave = () => {
    toast.success('Time allocation planned successfully');
    // In a real app, this would update the tasks
  };

  // Show loading state
  if (loading) {
    return (
      <AppLayout>
        <div className="h-[calc(100vh-60px)] flex items-center justify-center" style={{ backgroundColor: colors.bgSubtle }}>
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin" style={{ color: colors.textSecondary }} />
            <p style={{ color: colors.textSecondary }}>Loading Resource Planner data...</p>
          </div>
        </div>
      </AppLayout>
    );
  }

  // Show error state
  if (error) {
    return (
      <AppLayout>
        <div className="h-[calc(100vh-60px)] flex items-center justify-center" style={{ backgroundColor: colors.bgSubtle }}>
          <div className="flex flex-col items-center gap-4">
            <p style={{ color: colors.statusRed }}>Error: {error}</p>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '8px 16px',
                backgroundColor: colors.bgWhite,
                border: `1px solid ${colors.borderDefault}`,
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="h-[calc(100vh-60px)] flex flex-col" style={{ backgroundColor: colors.bgSubtle }}>
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'heatmap' | 'allocation')} className="flex-1 flex flex-col">
          <div style={{ borderBottom: `1px solid ${colors.borderDefault}`, backgroundColor: colors.bgWhite, padding: '0 24px' }}>
            <TabsList className="h-12">
              <TabsTrigger value="heatmap">Heat Map</TabsTrigger>
              <TabsTrigger value="allocation">Resource Allocation</TabsTrigger>
            </TabsList>
          </div>

          {/* Summary Bar */}
          <div
            className="flex items-center justify-between"
            style={{
              height: '44px',
              padding: '0 16px',
              backgroundColor: colors.bgSubtle,
              borderBottom: `1px solid ${colors.borderDefault}`,
            }}
          >
            {/* Left: Team & Projects count */}
            <div style={{ fontSize: typography.base, color: colors.textSecondary }}>
              {summaryStats.teamCount} Team Members · {summaryStats.activeProjects} Active Projects
            </div>

            {/* Center: Capacity status with dots */}
            <div
              className="flex items-center"
              style={{
                gap: '16px',
                fontSize: typography.sm,
                color: colors.textSecondary,
              }}
            >
              <span className="flex items-center" style={{ gap: '6px' }}>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: colors.statusRed,
                  }}
                />
                {summaryStats.overCapacity} Over
              </span>
              <span className="flex items-center" style={{ gap: '6px' }}>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: colors.statusGreen,
                  }}
                />
                {summaryStats.optimalCapacity} Optimal
              </span>
              <span className="flex items-center" style={{ gap: '6px' }}>
                <span
                  style={{
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: colors.statusGray,
                  }}
                />
                {summaryStats.underCapacity} Under
              </span>
            </div>

            {/* Right: Avg Utilization with trend */}
            <div className="flex items-center" style={{ gap: '6px' }}>
              <span
                style={{
                  fontSize: typography.base,
                  fontWeight: typography.medium,
                  color: colors.textPrimary,
                }}
              >
                {summaryStats.avgUtilization}%
              </span>
              <span style={{ fontSize: typography.sm, color: colors.textSecondary }}>
                Avg Utilization
              </span>
              {summaryStats.trendUp ? (
                <TrendingUp size={14} style={{ color: colors.statusGreen }} />
              ) : (
                <TrendingDown size={14} style={{ color: colors.statusRed }} />
              )}
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            <TabsContent value="heatmap" className="m-0 h-full">
              <HeatMap
                users={users}
                tasks={tasks}
                projects={projects}
                departments={departments}
                leaves={leaves}
                onTaskClick={handleTaskClick}
                onPlanTime={handlePlanTime}
              />
            </TabsContent>

            <TabsContent value="allocation" className="m-0 h-full">
              <ResourceAllocation
                users={users}
                tasks={tasks}
                projects={projects}
                departments={departments}
              />
            </TabsContent>
          </div>
        </Tabs>

        {/* Task Detail Modal */}
        {selectedTask && (
          <TaskDetailModal
            task={selectedTask}
            open={showTaskModal}
            onClose={() => setShowTaskModal(false)}
            onSave={handleTaskSave}
          />
        )}

        {/* Plan Time Dialog */}
        {planTimeUserId && (
          <PlanTimeDialog
            userId={planTimeUserId}
            open={showPlanTimeDialog}
            onClose={() => setShowPlanTimeDialog(false)}
            onSave={handlePlanTimeSave}
          />
        )}

        <Toaster />
      </div>
    </AppLayout>
  );
}

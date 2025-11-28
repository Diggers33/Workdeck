import { useState, useMemo } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { HeatMap } from './components/HeatMap';
import { ResourceAllocation } from './components/ResourceAllocation';
import { TaskDetailModal } from './components/TaskDetailModal';
import { PlanTimeDialog } from './components/PlanTimeDialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from './components/ui/tabs';
import { Toaster } from './components/ui/sonner';
import { mockUsers, mockTasks, mockProjects, departments, mockLeaves } from './data/mockData';
import { Task } from './types';
import { toast } from 'sonner';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'heatmap' | 'allocation'>('heatmap');
  const [tasks, setTasks] = useState(mockTasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [planTimeUserId, setPlanTimeUserId] = useState<string | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showPlanTimeDialog, setShowPlanTimeDialog] = useState(false);

  // Calculate summary stats
  const summaryStats = useMemo(() => {
    const teamCount = mockUsers.length;
    const activeProjects = mockProjects.filter(p => p.isBillable || p.amount > 0).length;

    // Calculate utilization per user based on current week's tasks
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay());
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 6);

    const userUtilization = mockUsers.map(user => {
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
  }, [tasks]);

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setShowTaskModal(true);
  };

  const handleTaskSave = (updatedTask: Task) => {
    setTasks(tasks.map(t => t.id === updatedTask.id ? updatedTask : t));
    toast.success('Task updated successfully');
  };

  const handlePlanTime = (userId: string) => {
    setPlanTimeUserId(userId);
    setShowPlanTimeDialog(true);
  };

  const handlePlanTimeSave = (allocation: any) => {
    toast.success('Time allocation planned successfully');
    // In a real app, this would update the tasks
  };

  return (
    <AppLayout>
      <div className="h-[calc(100vh-60px)] flex flex-col bg-gray-50">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'heatmap' | 'allocation')} className="flex-1 flex flex-col">
          <div className="border-b bg-white px-6">
            <TabsList className="h-12">
              <TabsTrigger value="heatmap">Heat Map</TabsTrigger>
              <TabsTrigger value="allocation">Resource Allocation</TabsTrigger>
            </TabsList>
          </div>

          {/* Summary Bar */}
          <div
            className="flex items-center justify-between px-6"
            style={{
              height: '44px',
              backgroundColor: '#F8FAFC',
              borderBottom: '1px solid #E2E8F0',
            }}
          >
            {/* Left: Team & Projects count */}
            <div style={{ fontSize: '14px', color: '#64748B' }}>
              {summaryStats.teamCount} Team Members · {summaryStats.activeProjects} Active Projects
            </div>

            {/* Center: Capacity badges */}
            <div className="flex items-center" style={{ gap: '8px' }}>
              <span
                style={{
                  fontSize: '12px',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  backgroundColor: '#FEE2E2',
                  color: '#DC2626',
                }}
              >
                {summaryStats.overCapacity} Over
              </span>
              <span
                style={{
                  fontSize: '12px',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  backgroundColor: '#D1FAE5',
                  color: '#059669',
                }}
              >
                {summaryStats.optimalCapacity} Optimal
              </span>
              <span
                style={{
                  fontSize: '12px',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  backgroundColor: '#FEF3C7',
                  color: '#D97706',
                }}
              >
                {summaryStats.underCapacity} Under
              </span>
            </div>

            {/* Right: Avg Utilization with trend */}
            <div className="flex items-center gap-1.5">
              <span style={{ fontSize: '14px', fontWeight: 600, color: '#1E293B' }}>
                {summaryStats.avgUtilization}% Avg Utilization
              </span>
              {summaryStats.trendUp ? (
                <TrendingUp size={14} style={{ color: '#059669' }} />
              ) : (
                <TrendingDown size={14} style={{ color: '#DC2626' }} />
              )}
            </div>
          </div>

          <div className="flex-1 overflow-auto">
            <TabsContent value="heatmap" className="m-0 h-full">
              <HeatMap
                users={mockUsers}
                tasks={tasks}
                projects={mockProjects}
                departments={departments}
                leaves={mockLeaves}
                onTaskClick={handleTaskClick}
                onPlanTime={handlePlanTime}
              />
            </TabsContent>

            <TabsContent value="allocation" className="m-0 h-full">
              <ResourceAllocation
                users={mockUsers}
                tasks={tasks}
                projects={mockProjects}
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

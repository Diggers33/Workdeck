import { useState } from 'react';
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

export default function App() {
  const [activeTab, setActiveTab] = useState<'heatmap' | 'allocation'>('heatmap');
  const [tasks, setTasks] = useState(mockTasks);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [planTimeUserId, setPlanTimeUserId] = useState<string | null>(null);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [showPlanTimeDialog, setShowPlanTimeDialog] = useState(false);

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

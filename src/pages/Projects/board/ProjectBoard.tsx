import React, { useState } from 'react';
import { Search, Plus, Settings, X, ChevronLeft, MoreVertical, Tag, Filter, Users } from 'lucide-react';
import { BoardColumn } from './BoardColumn';
import { CreateBoardDialog } from './CreateBoardDialog';
import { ColumnSettingsDialog } from './ColumnSettingsDialog';
import { LabelManagementDialog } from './LabelManagementDialog';
import { ViewSwitcherDropdown } from './ViewSwitcherDropdown';
import { FilterBar } from './FilterBar';
import { CreateViewModal } from './CreateViewModal';
import { ImprovedTaskCard } from './ImprovedTaskCard';
import { TaskDetailModal } from '../gantt/TaskDetailModal';
import { GanttTask } from '../gantt/types';
import { BoardLegend } from './BoardLegend';

interface ProjectBoardProps {
  onClose: () => void;
  projectName?: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  projectName: string;
  activityName: string;
  labels?: Array<{ id: string; name: string; color: string }>;
  participants?: Array<{ id: string; name: string; avatar?: string }>;
  attachmentCount?: number;
  commentCount?: number;
  checklistProgress?: { completed: number; total: number };
  priority?: 'high' | 'medium' | 'low';
  dueDate?: string;
  status?: 'blocked' | 'active';
  blockedReason?: string;
  color: string;
}

export interface Column {
  id: string;
  name: string;
  color: string;
  isCompleted?: boolean;
  tasks: Task[];
  wipLimit?: number;
}

export function ProjectBoard({ onClose, projectName = 'BIOGEMSE' }: ProjectBoardProps) {
  const [boardExists, setBoardExists] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedTask, setDraggedTask] = useState<{ task: Task; fromColumnId: string } | null>(null);
  const [dragOverTask, setDragOverTask] = useState<{ taskId: string; position: 'before' | 'after' } | null>(null);
  const [showColumnSettings, setShowColumnSettings] = useState<string | null>(null);
  const [cardSize, setCardSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [showDescription, setShowDescription] = useState(true);
  const [showParticipants, setShowParticipants] = useState(true);
  const [selectedTask, setSelectedTask] = useState<GanttTask | null>(null);
  const [showLabelManagement, setShowLabelManagement] = useState(false);
  const [showCreateViewModal, setShowCreateViewModal] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Array<{ type: string; value: string; label: string }>>([]);
  const [showFilterBar, setShowFilterBar] = useState(false);
  const [groupBy, setGroupBy] = useState<'none' | 'workPackage' | 'assignee' | 'priority'>('none');

  // Drag state for columns
  const [draggedColumn, setDraggedColumn] = useState<string | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

  // Saved views
  const [savedViews, setSavedViews] = useState([
    { id: 'all', name: 'All Tasks', filters: [], groupBy: 'none', cardSize: 'medium' as const, isSystem: true },
    { id: 'my-tasks', name: 'My Tasks', filters: [{ type: 'assignee', value: 'me', label: 'Me' }], groupBy: 'none', cardSize: 'medium' as const, isSystem: true },
    { id: 'wp1', name: 'WP1: Project Setup', filters: [{ type: 'workPackage', value: 'wp1', label: 'WP1' }], groupBy: 'none', cardSize: 'medium' as const, isSystem: true },
    { id: 'wp2', name: 'WP2: Development', filters: [{ type: 'workPackage', value: 'wp2', label: 'WP2' }], groupBy: 'none', cardSize: 'medium' as const, isSystem: true },
    { id: 'blocked-overdue', name: 'Blocked & Overdue', filters: [], groupBy: 'none', cardSize: 'medium' as const, isSystem: true, hasAlert: true }
  ]);
  const [currentView, setCurrentView] = useState(savedViews[0]);

  // Board labels state
  const [boardLabels, setBoardLabels] = useState([
    { id: 'l1', name: 'Design', color: '#968fe5' },
    { id: 'l2', name: 'Backend', color: '#34D399' },
    { id: 'l3', name: 'Frontend', color: '#60A5FA' },
    { id: 'l4', name: 'Testing', color: '#ffbd01' },
    { id: 'l5', name: 'Documentation', color: '#00b4cd' },
    { id: 'l6', name: 'Bug', color: '#F87171' },
    { id: 'l7', name: 'Enhancement', color: '#00d400' },
    { id: 'l9', name: 'High Priority', color: '#ff4f6a' },
    { id: 'l8', name: 'Urgent', color: '#F87171' }
  ]);

  const generateTasks = (columnId: string, color: string, count: number): Task[] => {
    const taskTitles = [
      'User authentication flow design', 'Database schema optimization', 'API documentation update',
      'End-to-end test suite', 'Performance monitoring setup', 'Security audit implementation',
      'Mobile responsive layout', 'Payment gateway integration', 'Email notification system',
      'User profile management', 'Search functionality enhancement', 'Analytics dashboard design',
      'File upload module', 'Real-time chat feature', 'Role-based access control',
      'Data export functionality', 'Third-party API integration', 'Caching layer implementation',
      'Error logging system', 'Backup automation script', 'Load balancing configuration',
      'CI/CD pipeline setup', 'Database migration script', 'API rate limiting',
      'Webhook implementation', 'OAuth2 integration', 'Multi-language support',
      'Dark mode implementation', 'Accessibility improvements', 'SEO optimization',
      'Unit test coverage', 'Integration testing', 'User acceptance testing',
      'Bug fix: Login issue', 'Bug fix: Data sync', 'Bug fix: Memory leak',
      'Refactor: Legacy code', 'Refactor: API endpoints', 'Refactor: Database queries',
      'Update dependencies', 'Security patches', 'Documentation update',
      'Code review', 'Design review', 'Architecture planning',
      'Feature flag implementation', 'A/B testing setup', 'Performance optimization',
      'Database indexing', 'Query optimization', 'Frontend optimization'
    ];
    
    const descriptions = [
      'Implement comprehensive solution with best practices',
      'Review and optimize for better performance',
      'Update documentation with latest changes',
      'Create detailed test cases for all scenarios',
      'Setup monitoring and alerting system',
      null, // Some tasks have no description
      'Design responsive layout for mobile devices',
      'Integrate payment processing system',
      'Configure email templates and delivery',
      'Build user management interface'
    ];
    
    const activities = [
      'WP1: Project Setup',
      'WP2: Development',
      'WP3: Quality Assurance',
      'WP4: Design',
      'WP5: Infrastructure',
      'WP6: Security'
    ];
    
    const labelSets = [
      [{ id: 'l1', name: 'Design', color: '#968fe5' }],
      [{ id: 'l2', name: 'Backend', color: '#34D399' }],
      [{ id: 'l3', name: 'Frontend', color: '#60A5FA' }],
      [{ id: 'l4', name: 'Testing', color: '#ffbd01' }],
      [{ id: 'l5', name: 'Documentation', color: '#00b4cd' }],
      [{ id: 'l6', name: 'Bug', color: '#F87171' }],
      [{ id: 'l7', name: 'Enhancement', color: '#00d400' }],
      [{ id: 'l1', name: 'Design', color: '#968fe5' }, { id: 'l9', name: 'High Priority', color: '#ff4f6a' }],
      [{ id: 'l3', name: 'Frontend', color: '#60A5FA' }, { id: 'l8', name: 'Urgent', color: '#F87171' }],
      []
    ];
    
    const priorities: Array<'high' | 'medium' | 'low' | undefined> = ['high', 'medium', 'low', 'medium', undefined];
    
    const participants = [
      [{ id: 'u1', name: 'Sarah Chen', avatar: 'SC' }],
      [{ id: 'u2', name: 'Mike Johnson', avatar: 'MJ' }],
      [{ id: 'u3', name: 'Alex Park', avatar: 'AP' }],
      [{ id: 'u4', name: 'Emma Wilson', avatar: 'EW' }],
      [{ id: 'u5', name: 'David Lee', avatar: 'DL' }],
      [{ id: 'u1', name: 'Sarah Chen', avatar: 'SC' }, { id: 'u2', name: 'Mike Johnson', avatar: 'MJ' }],
      [{ id: 'u3', name: 'Alex Park', avatar: 'AP' }, { id: 'u4', name: 'Emma Wilson', avatar: 'EW' }],
      [{ id: 'u1', name: 'Sarah Chen', avatar: 'SC' }, { id: 'u2', name: 'Mike Johnson', avatar: 'MJ' }, { id: 'u5', name: 'David Lee', avatar: 'DL' }],
      []
    ];
    
    const blockingReasons = [
      'Waiting for approval',
      'Dependency not resolved',
      'Resource allocation issue',
      'External dependency'
    ];
    
    const tasks: Task[] = [];
    for (let i = 0; i < count; i++) {
      const hasAttachments = Math.random() > 0.6;
      const hasComments = Math.random() > 0.4;
      const hasChecklist = Math.random() > 0.7;
      const hasDescription = Math.random() > 0.5;
      
      tasks.push({
        id: `task-${columnId}-${i + 1}`,
        title: taskTitles[i % taskTitles.length],
        description: hasDescription ? descriptions[i % descriptions.length] || undefined : undefined,
        projectName: 'BIOGEMSE',
        activityName: activities[i % activities.length],
        labels: labelSets[i % labelSets.length],
        participants: participants[i % participants.length],
        attachmentCount: hasAttachments ? Math.floor(Math.random() * 5) + 1 : undefined,
        commentCount: hasComments ? Math.floor(Math.random() * 10) + 1 : undefined,
        checklistProgress: hasChecklist ? { 
          completed: Math.floor(Math.random() * 5), 
          total: Math.floor(Math.random() * 5) + 3 
        } : undefined,
        priority: priorities[i % priorities.length],
        // Realistic date distribution: Most tasks have future dates
        dueDate: (() => {
          const random = Math.random();
          if (random < 0.03) {
            // Only 3% overdue (November dates)
            const day = 10 + (i % 10);
            return `2024-11-${day.toString().padStart(2, '0')}`;
          } else if (random < 0.12) {
            // 9% this week (late November)
            const day = 25 + (i % 4);
            return `2024-11-${day.toString().padStart(2, '0')}`;
          } else if (random < 0.65) {
            // 53% next few weeks (early December)
            const day = 1 + (i % 20);
            return `2024-12-${day.toString().padStart(2, '0')}`;
          } else if (random < 0.88) {
            // 23% later dates (late December / January)
            if (i % 2 === 0) {
              const day = 20 + (i % 11);
              return `2024-12-${day.toString().padStart(2, '0')}`;
            } else {
              const day = 1 + (i % 15);
              return `2025-01-${day.toString().padStart(2, '0')}`;
            }
          } else {
            // 12% no due date
            return undefined;
          }
        })(),
        status: Math.random() > 0.92 ? 'blocked' : undefined, // Only 8% blocked
        blockedReason: Math.random() > 0.92 ? blockingReasons[i % blockingReasons.length] : undefined,
        color: color
      });
    }
    return tasks;
  };

  const [columns, setColumns] = useState<Column[]>(() => [
    {
      id: 'open',
      name: 'Open',
      color: '#60A5FA',
      tasks: generateTasks('open-v2', '#60A5FA', 35)
    },
    {
      id: 'in-progress',
      name: 'In Progress',
      color: '#ffbd01',
      tasks: generateTasks('in-progress-v2', '#ffbd01', 40),
      wipLimit: 15
    },
    {
      id: 'in-review',
      name: 'In Review',
      color: '#968fe5',
      tasks: generateTasks('in-review-v2', '#968fe5', 30),
      wipLimit: 20
    },
    {
      id: 'testing',
      name: 'Testing',
      color: '#00d400',
      tasks: generateTasks('testing-v2', '#00d400', 28),
      wipLimit: 25
    },
    {
      id: 'ready-deploy',
      name: 'Ready to Deploy',
      color: '#00b4cd',
      tasks: generateTasks('ready-deploy-v2', '#00b4cd', 22)
    },
    {
      id: 'completed',
      name: 'Completed',
      color: '#34D399',
      isCompleted: true,
      tasks: generateTasks('completed-v2', '#34D399', 25)
    }
  ]);

  const handleCreateBoard = () => {
    setBoardExists(true);
    setShowCreateDialog(false);
  };

  const handleDragStart = (task: Task, columnId: string) => {
    setDraggedTask({ task, fromColumnId: columnId });
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (toColumnId: string, insertBeforeTaskId?: string) => {
    if (!draggedTask) return;

    setColumns(prevColumns => {
      const newColumns = [...prevColumns];
      const fromColumn = newColumns.find(col => col.id === draggedTask.fromColumnId);
      const toColumn = newColumns.find(col => col.id === toColumnId);

      if (fromColumn && toColumn) {
        // Remove task from source column
        fromColumn.tasks = fromColumn.tasks.filter(t => t.id !== draggedTask.task.id);
        
        // Add task to target column with updated color
        const updatedTask = { ...draggedTask.task, color: toColumn.color };
        
        // If insertBeforeTaskId is provided, insert at that position
        if (insertBeforeTaskId) {
          const insertIndex = toColumn.tasks.findIndex(t => t.id === insertBeforeTaskId);
          if (insertIndex !== -1) {
            toColumn.tasks.splice(insertIndex, 0, updatedTask);
          } else {
            toColumn.tasks.push(updatedTask);
          }
        } else {
          toColumn.tasks.push(updatedTask);
        }
      }

      return newColumns;
    });

    setDraggedTask(null);
    setDragOverTask(null);
    setDraggedColumn(null);
    setDragOverColumn(null);
  };

  const handleAddColumn = () => {
    const newColumn: Column = {
      id: `col-${Date.now()}`,
      name: 'New Column',
      color: '#00b4cd',
      tasks: []
    };
    
    // Insert before the last column (Completed)
    setColumns(prev => {
      const newCols = [...prev];
      newCols.splice(newCols.length - 1, 0, newColumn);
      return newCols;
    });
  };

  const handleDeleteColumn = (columnId: string) => {
    const column = columns.find(c => c.id === columnId);
    if (!column) return;
    
    if (column.id === 'open' || column.id === 'completed') {
      alert('Cannot delete mandatory columns (Open or Completed)');
      return;
    }

    if (column.tasks.length > 0) {
      alert('Cannot delete column with tasks. Please move or delete tasks first.');
      return;
    }

    setColumns(prev => prev.filter(col => col.id !== columnId));
  };

  const handleUpdateColumn = (columnId: string, updates: Partial<Column>) => {
    setColumns(prev => prev.map(col => 
      col.id === columnId ? { ...col, ...updates } : col
    ));
    setShowColumnSettings(null);
  };

  const handleDeleteTask = (columnId: string, taskId: string) => {
    setColumns(prev => prev.map(col => 
      col.id === columnId 
        ? { ...col, tasks: col.tasks.filter(t => t.id !== taskId) }
        : col
    ));
  };

  const handleMarkAsDone = (columnId: string, taskId: string) => {
    const task = columns.find(col => col.id === columnId)?.tasks.find(t => t.id === taskId);
    if (!task) return;

    setColumns(prev => {
      const newColumns = [...prev];
      const fromColumn = newColumns.find(col => col.id === columnId);
      const completedColumn = newColumns.find(col => col.isCompleted);

      if (fromColumn && completedColumn) {
        fromColumn.tasks = fromColumn.tasks.filter(t => t.id !== taskId);
        const updatedTask = { ...task, color: completedColumn.color };
        completedColumn.tasks.unshift(updatedTask);
      }

      return newColumns;
    });
  };

  const handleCardUpdateTask = (columnId: string, taskId: string, updates: any) => {
    setColumns(prev => prev.map(col => 
      col.id === columnId 
        ? { 
            ...col, 
            tasks: col.tasks.map(t => 
              t.id === taskId 
                ? { ...t, ...updates }
                : t
            )
          }
        : col
    ));
  };

  const handleTaskClick = (task: Task) => {
    // Convert Task to GanttTask format for the modal
    const ganttTask: GanttTask = {
      id: task.id,
      name: task.title,
      activityId: 'wp1', // Default, would come from actual activity
      start: 0,
      duration: 7,
      type: 'task' as const,
      assignees: task.participants?.map(p => p.name) || [],
      priority: task.priority || 'medium',
      status: 'in-progress',
      description: task.description,
      dependencies: []
    };
    setSelectedTask(ganttTask);
  };

  const handleUpdateTask = (taskId: string, updates: Partial<GanttTask>) => {
    // Update the task in the columns
    setColumns(prev => prev.map(col => ({
      ...col,
      tasks: col.tasks.map(t => 
        t.id === taskId 
          ? { 
              ...t, 
              title: updates.name || t.title,
              description: updates.description || t.description,
              priority: updates.priority || t.priority
            }
          : t
      )
    })));
    setSelectedTask(null);
  };

  // Column drag handlers
  const handleColumnDragStart = (columnId: string) => {
    const column = columns.find(c => c.id === columnId);
    if (column?.isCompleted || columnId === 'open') return; // Prevent dragging Open and Completed columns
    setDraggedColumn(columnId);
  };

  const handleColumnDragOver = (e: React.DragEvent, columnId: string) => {
    e.preventDefault();
    const column = columns.find(c => c.id === columnId);
    if (column?.isCompleted || columnId === 'open') return; // Prevent dropping on Open and Completed
    setDragOverColumn(columnId);
  };

  const handleColumnDrop = (targetColumnId: string) => {
    if (!draggedColumn || draggedColumn === targetColumnId) {
      setDraggedColumn(null);
      setDragOverColumn(null);
      return;
    }

    const targetColumn = columns.find(c => c.id === targetColumnId);
    if (targetColumn?.isCompleted || targetColumnId === 'open') {
      setDraggedColumn(null);
      setDragOverColumn(null);
      return;
    }

    setColumns(prev => {
      const newColumns = [...prev];
      const draggedIndex = newColumns.findIndex(c => c.id === draggedColumn);
      const targetIndex = newColumns.findIndex(c => c.id === targetColumnId);

      if (draggedIndex === -1 || targetIndex === -1) return prev;

      // Remove dragged column
      const [removed] = newColumns.splice(draggedIndex, 1);
      
      // Insert at new position
      newColumns.splice(targetIndex, 0, removed);

      return newColumns;
    });

    setDraggedColumn(null);
    setDragOverColumn(null);
  };

  const filteredColumns = columns.map(col => ({
    ...col,
    tasks: col.tasks.filter(task => {
      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        task.title.toLowerCase().includes(query) ||
        task.description?.toLowerCase().includes(query) ||
        task.activityName.toLowerCase().includes(query) ||
        task.labels?.some(label => label.name.toLowerCase().includes(query))
      );
    })
  }));

  if (!boardExists) {
    return (
      <div style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%', 
        height: '100vh', 
        background: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        zIndex: 1000
      }}>
        {/* Header */}
        <div style={{
          height: '60px',
          borderBottom: '1px solid #E5E7EB',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          justifyContent: 'space-between'
        }}>
          <button
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#6B7280',
              fontSize: '14px',
              fontWeight: 500
            }}
          >
            <ChevronLeft size={20} />
            Back to Gantt
          </button>
        </div>

        {/* Empty State */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '24px'
        }}>
          <div style={{ fontSize: '64px', opacity: 0.3 }}>📋</div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '18px', fontWeight: 600, color: '#1F2937', marginBottom: '8px' }}>
              No Project Board Yet
            </div>
            <div style={{ fontSize: '14px', color: '#6B7280', marginBottom: '24px' }}>
              Create a board to start organizing tasks visually
            </div>
          </div>
          <button
            onClick={() => setShowCreateDialog(true)}
            style={{
              height: '44px',
              padding: '0 24px',
              background: '#0066FF',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            Create Board
          </button>
        </div>

        {showCreateDialog && (
          <CreateBoardDialog
            onClose={() => setShowCreateDialog(false)}
            onCreate={handleCreateBoard}
            projectName={projectName}
          />
        )}
      </div>
    );
  }

  return (
    <div style={{ 
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      width: '100%', 
      height: '100vh', 
      background: '#FFFFFF',
      display: 'flex',
      flexDirection: 'column',
      zIndex: 1000
    }}>
      {/* Header */}
      <div style={{
        height: '60px',
        borderBottom: '1px solid #E5E7EB',
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        justifyContent: 'space-between',
        flexShrink: 0
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button
            onClick={onClose}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: '#6B7280',
              fontSize: '14px',
              fontWeight: 500
            }}
          >
            <ChevronLeft size={20} />
            Back to Gantt
          </button>
          
          <div style={{ width: '1px', height: '24px', background: '#E5E7EB' }} />
          
          <div style={{ fontSize: '16px', fontWeight: 600, color: '#1F2937' }}>
            {projectName} Board
          </div>

          <div style={{ width: '1px', height: '24px', background: '#E5E7EB' }} />

          {/* View Switcher */}
          <ViewSwitcherDropdown
            currentView={currentView}
            views={savedViews}
            onSelectView={(view) => {
              setCurrentView(view);
              setActiveFilters(view.filters);
              setCardSize(view.cardSize);
            }}
            onCreateView={() => setShowCreateViewModal(true)}
          />

          {/* Filters Button */}
          <button
            onClick={() => setShowFilterBar(!showFilterBar)}
            style={{
              height: '36px',
              padding: '0 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: showFilterBar || activeFilters.length > 0 ? '#EFF6FF' : 'white',
              border: `1px solid ${showFilterBar || activeFilters.length > 0 ? '#BFDBFE' : '#E5E7EB'}`,
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 500,
              color: showFilterBar || activeFilters.length > 0 ? '#1E40AF' : '#6B7280',
              cursor: 'pointer'
            }}
          >
            <Filter size={14} />
            Filters
            {activeFilters.length > 0 && (
              <div style={{
                minWidth: '18px',
                height: '18px',
                padding: '0 5px',
                background: '#1E40AF',
                color: 'white',
                borderRadius: '9px',
                fontSize: '11px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {activeFilters.length}
              </div>
            )}
          </button>

          {/* Group By Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              style={{
                height: '36px',
                padding: '0 12px',
                background: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '6px',
                fontSize: '13px',
                fontWeight: 500,
                color: '#6B7280',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              Group: {groupBy === 'none' ? 'None' : groupBy === 'workPackage' ? 'Work Package' : groupBy === 'assignee' ? 'Assignee' : 'Priority'}
              <span style={{ fontSize: '11px' }}>▼</span>
            </button>
          </div>

          {/* My Tasks Quick Toggle */}
          <button
            onClick={() => {
              const myTasksView = savedViews.find(v => v.id === 'my-tasks')!;
              setCurrentView(myTasksView);
              setActiveFilters(myTasksView.filters);
            }}
            style={{
              height: '36px',
              padding: '0 16px',
              background: currentView.id === 'my-tasks' ? '#0066FF' : 'white',
              border: `1px solid ${currentView.id === 'my-tasks' ? '#0066FF' : '#E5E7EB'}`,
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 600,
              color: currentView.id === 'my-tasks' ? 'white' : '#6B7280',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Users size={14} />
            My Tasks
          </button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Search */}
          <div style={{ position: 'relative' }}>
            <Search 
              size={16} 
              style={{ 
                position: 'absolute', 
                left: '12px', 
                top: '50%', 
                transform: 'translateY(-50%)',
                color: '#9CA3AF'
              }} 
            />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                height: '36px',
                width: '240px',
                paddingLeft: '36px',
                paddingRight: searchQuery ? '32px' : '12px',
                border: '1px solid #E5E7EB',
                borderRadius: '6px',
                fontSize: '14px',
                outline: 'none'
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'transparent',
                  border: 'none',
                  cursor: 'pointer',
                  color: '#9CA3AF',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <X size={16} />
              </button>
            )}
          </div>

          {/* Card Size Toggle */}
          <div style={{ display: 'flex', gap: '4px', padding: '4px', background: '#F3F4F6', borderRadius: '6px' }}>
            {(['small', 'medium', 'large'] as const).map(size => (
              <button
                key={size}
                onClick={() => setCardSize(size)}
                style={{
                  padding: '4px 12px',
                  background: cardSize === size ? 'white' : 'transparent',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px',
                  fontWeight: 500,
                  color: cardSize === size ? '#1F2937' : '#6B7280',
                  cursor: 'pointer',
                  textTransform: 'capitalize'
                }}
              >
                {size[0].toUpperCase()}
              </button>
            ))}
          </div>

          {/* Tags Button */}
          <button
            onClick={() => setShowLabelManagement(true)}
            style={{
              height: '36px',
              padding: '0 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 500,
              color: '#6B7280',
              cursor: 'pointer'
            }}
            title="Manage Tags"
          >
            <Tag size={14} />
            Tags
          </button>

          {/* Legend Button */}
          <button
            onClick={() => setShowLegend(true)}
            style={{
              height: '36px',
              padding: '0 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '6px',
              fontSize: '13px',
              fontWeight: 500,
              color: '#6B7280',
              cursor: 'pointer'
            }}
            title="View Legend"
          >
            <span style={{ fontSize: '15px' }}>?</span>
            Legend
          </button>

          <button
            style={{
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'transparent',
              border: '1px solid #E5E7EB',
              borderRadius: '6px',
              cursor: 'pointer',
              color: '#6B7280'
            }}
          >
            <MoreVertical size={18} />
          </button>
        </div>
      </div>

      {/* Filter Bar - Conditionally rendered */}
      {showFilterBar && (
        <FilterBar
          activeFilters={activeFilters}
          onUpdateFilters={setActiveFilters}
          availableAssignees={[
            { id: 'me', label: 'Me' },
            { id: 'u1', label: 'Sarah Chen' },
            { id: 'u2', label: 'Mike Johnson' },
            { id: 'u3', label: 'Alex Park' },
            { id: 'u4', label: 'Emma Wilson' },
            { id: 'u5', label: 'David Lee' }
          ]}
          availableWorkPackages={[
            { id: 'wp1', label: 'WP1: Project Setup' },
            { id: 'wp2', label: 'WP2: Development' },
            { id: 'wp3', label: 'WP3: Quality Assurance' },
            { id: 'wp4', label: 'WP4: Design' },
            { id: 'wp5', label: 'WP5: Infrastructure' },
            { id: 'wp6', label: 'WP6: Security' }
          ]}
          availableTags={[
            { id: 'l1', label: 'Design' },
            { id: 'l2', label: 'Backend' },
            { id: 'l3', label: 'Frontend' },
            { id: 'l4', label: 'Testing' },
            { id: 'l5', label: 'Documentation' },
            { id: 'l6', label: 'Bug' },
            { id: 'l7', label: 'Enhancement' }
          ]}
        />
      )}

      {/* Board Columns */}
      <div style={{
        flex: 1,
        overflowX: 'auto',
        overflowY: 'hidden',
        padding: '20px'
      }}>
        <div style={{
          display: 'flex',
          gap: '16px',
          height: '100%',
          minWidth: 'fit-content'
        }}>
          {filteredColumns.map((column) => (
            <BoardColumn
              key={column.id}
              column={column}
              cardSize={cardSize}
              showDescription={showDescription}
              showParticipants={showParticipants}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onDeleteColumn={handleDeleteColumn}
              onEditColumn={() => setShowColumnSettings(column.id)}
              onDeleteTask={handleDeleteTask}
              onMarkAsDone={handleMarkAsDone}
              onUpdateTask={handleCardUpdateTask}
              onTaskClick={handleTaskClick}
              onColumnDragStart={handleColumnDragStart}
              onColumnDragOver={handleColumnDragOver}
              onColumnDrop={handleColumnDrop}
              draggedColumn={draggedColumn}
              dragOverColumn={dragOverColumn}
            />
          ))}
          
          {/* Add Column Button */}
          <button
            onClick={handleAddColumn}
            style={{
              width: '280px',
              height: '48px',
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              background: '#F9FAFB',
              border: '2px dashed #D1D5DB',
              borderRadius: '6px',
              cursor: 'pointer',
              color: '#6B7280',
              fontSize: '14px',
              fontWeight: 500
            }}
          >
            <Plus size={18} />
            Add Column
          </button>
        </div>
      </div>

      {/* Column Settings Dialog */}
      {showColumnSettings && (
        <ColumnSettingsDialog
          column={columns.find(c => c.id === showColumnSettings)!}
          onClose={() => setShowColumnSettings(null)}
          onSave={(updates) => handleUpdateColumn(showColumnSettings, updates)}
        />
      )}

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdate={handleUpdateTask}
        />
      )}

      {/* Label Management Dialog */}
      {showLabelManagement && (
        <LabelManagementDialog
          onClose={() => setShowLabelManagement(false)}
          currentLabels={boardLabels}
          onSaveLabels={(newLabels) => {
            setBoardLabels(newLabels);
            setShowLabelManagement(false);
          }}
        />
      )}

      {/* Create View Modal */}
      {showCreateViewModal && (
        <CreateViewModal
          onClose={() => setShowCreateViewModal(false)}
          onCreate={(viewData) => {
            const newView = {
              ...viewData,
              id: `view-${Date.now()}`
            };
            setSavedViews([...savedViews, newView]);
            setCurrentView(newView);
            setShowCreateViewModal(false);
          }}
          currentFilters={activeFilters}
          currentGrouping={groupBy}
          currentCardSize={cardSize}
        />
      )}

      {/* Board Legend */}
      {showLegend && (
        <BoardLegend
          onClose={() => setShowLegend(false)}
        />
      )}
    </div>
  );
}
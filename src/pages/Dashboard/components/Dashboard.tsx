import React, { useState, useEffect } from 'react';
import { PendingApprovalsWidget } from './widgets/PendingApprovalsWidget';
import { AgendaWidget } from './widgets/AgendaWidget';
import { TodoListWidget } from './widgets/TodoListWidget';
import { FYIWidget } from './widgets/FYIWidget';
import { WhosWhereWidget } from './widgets/WhosWhereWidget';
import { RedZoneWidget } from './widgets/RedZoneWidget';
import { QuickAccessWidget } from './widgets/QuickAccessWidget';
import { ProjectPortfolioWidget } from './ProjectPortfolioWidget';
import { WidgetConfigModal } from './WidgetConfigModal';
import { AlertModal } from './AlertModal';
import { TaskDetailModal } from '../../Projects/gantt/TaskDetailModal';
import { useDashboardData } from '../hooks/useDashboardData';
import { WIDGET_TYPES } from '../api/dashboardApi';

interface DashboardProps {
  userRole?: 'project_manager' | 'team_member' | 'executive';
  showWidgetConfig?: boolean;
  onCloseWidgetConfig?: () => void;
  onNavigateToProject?: (projectId: string) => void;
  onNavigateToPortfolio?: () => void;
}

interface WidgetConfig {
  id: string;
  name: string;
  description: string;
  visible: boolean;
  gridPosition: string;
}

// Loading spinner component
const LoadingSpinner = () => (
  <div style={{
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    width: '100%',
  }}>
    <div style={{
      width: '40px',
      height: '40px',
      border: '3px solid #f3f3f3',
      borderTop: '3px solid #0069df',
      borderRadius: '50%',
      animation: 'spin 1s linear infinite',
    }} />
    <style>{`
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
    `}</style>
  </div>
);

// Error display component
const ErrorDisplay = ({ message, onRetry }: { message: string; onRetry: () => void }) => (
  <div style={{
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: '16px',
    color: '#5B6F89',
  }}>
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#ff6b6b" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
    <p style={{ margin: 0, textAlign: 'center' }}>{message}</p>
    <button
      onClick={onRetry}
      style={{
        padding: '8px 16px',
        background: '#0069df',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '14px',
      }}
    >
      Retry
    </button>
  </div>
);

export function Dashboard({ userRole = 'project_manager', showWidgetConfig = false, onCloseWidgetConfig, onNavigateToProject, onNavigateToPortfolio }: DashboardProps) {
  const [draggedTask, setDraggedTask] = useState<any>(null);
  const [showAlert, setShowAlert] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);

  // Use the dashboard data hook for real API data
  const { data: dashboardData, loading, error, refresh } = useDashboardData();

  // Handle task updates from modal
  const handleUpdateTask = (taskId: string, updates: any) => {
    console.log('Task updated:', taskId, updates);
  };

  // Load initial widget configs from localStorage or use defaults
  const getInitialWidgetConfigs = (): WidgetConfig[] => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('workdeck-dashboard-widgets');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          console.error('Failed to parse saved widget configs:', e);
        }
      }
    }

    // Default configuration
    return [
      {
        id: 'fyi',
        name: 'FYI',
        description: 'Important updates and information you need to be aware of',
        visible: true,
        gridPosition: 'Row 1, Col 1'
      },
      {
        id: 'whos-where',
        name: "Who's Where",
        description: 'Team member locations and availability status',
        visible: true,
        gridPosition: 'Row 1, Col 2'
      },
      {
        id: 'todo',
        name: 'To-Do List',
        description: 'Your personal task list with drag-and-drop functionality',
        visible: true,
        gridPosition: 'Row 1-2, Col 3'
      },
      {
        id: 'agenda',
        name: 'Agenda',
        description: 'Upcoming meetings and scheduled events',
        visible: true,
        gridPosition: 'Row 1-2, Col 4'
      },
      {
        id: 'pending-approvals',
        name: 'Pending Approvals',
        description: 'Items requiring your review and approval',
        visible: true,
        gridPosition: 'Row 2, Col 1'
      },
      {
        id: 'red-zone',
        name: 'Red Zone',
        description: 'Critical issues and urgent items requiring attention',
        visible: true,
        gridPosition: 'Row 2, Col 2'
      },
      {
        id: 'project-portfolio',
        name: 'Project Portfolio',
        description: 'High-level overview of all active projects with status and progress',
        visible: false,
        gridPosition: 'Row 1, Col 1'
      }
    ];
  };

  const [widgetConfigs, setWidgetConfigs] = useState<WidgetConfig[]>(getInitialWidgetConfigs);

  // Save to localStorage whenever widgetConfigs changes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('workdeck-dashboard-widgets', JSON.stringify(widgetConfigs));
    }
  }, [widgetConfigs]);

  const handleToggleWidget = (id: string) => {
    setWidgetConfigs(prev => {
      const currentWidget = prev.find(w => w.id === id);
      const isEnabling = currentWidget && !currentWidget.visible;

      if (isEnabling) {
        const visibleCount = prev.filter(w => w.visible).length;
        if (visibleCount >= 6) {
          setShowAlert(true);
          return prev;
        }

        const firstDisabledWidget = prev.find(w => w.id !== id && !w.visible);

        if (firstDisabledWidget) {
          return prev.map(widget =>
            widget.id === id
              ? { ...widget, visible: true, gridPosition: firstDisabledWidget.gridPosition }
              : widget
          );
        }
      }

      return prev.map(widget =>
        widget.id === id ? { ...widget, visible: !widget.visible } : widget
      );
    });
  };

  const handleChangePosition = (id: string, position: string) => {
    setWidgetConfigs(prev => {
      const updated = prev.map(widget =>
        widget.id === id ? { ...widget, gridPosition: position } : widget
      );
      return updated;
    });
  };

  const handleSave = () => {
    // Saved automatically via useEffect
  };

  const getWidgetVisible = (id: string) => {
    return widgetConfigs.find(w => w.id === id)?.visible ?? true;
  };

  const getProjectPortfolioPosition = () => {
    const ppWidget = widgetConfigs.find(w => w.id === 'project-portfolio');
    const position = ppWidget?.gridPosition || 'Row 1, Col 1';
    return position;
  };

  const renderWidgetInPosition = (position: string, widgetId: string, component: React.ReactNode) => {
    const ppPosition = getProjectPortfolioPosition();
    const ppVisible = getWidgetVisible('project-portfolio');

    if (ppVisible && ppPosition === position && widgetId !== 'project-portfolio') {
      return null;
    }

    if (widgetId === 'project-portfolio') {
      return ppVisible && ppPosition === position ? component : null;
    }

    return getWidgetVisible(widgetId) ? component : null;
  };

  // Show loading state
  if (loading) {
    return (
      <div style={{ background: '#FAFBFC', height: 'calc(100vh - 60px)', padding: '16px' }}>
        <LoadingSpinner />
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div style={{ background: '#FAFBFC', height: 'calc(100vh - 60px)', padding: '16px' }}>
        <ErrorDisplay message={error} onRetry={refresh} />
      </div>
    );
  }

  return (
    <div style={{ background: '#FAFBFC', height: 'calc(100vh - 60px)', padding: '16px', position: 'relative' }}>
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr 1fr',
        gridTemplateRows: '1fr 1fr',
        gap: '12px',
        height: '100%',
        maxWidth: '1600px',
        margin: '0 auto'
      }}>
        {/* ROW 1, COL 1: FYI or Project Portfolio */}
        {renderWidgetInPosition('Row 1, Col 1', 'fyi',
          <div style={{ gridColumn: '1', gridRow: '1', minHeight: 0 }}>
            <FYIWidget items={dashboardData.whatsNew} />
          </div>
        )}
        {renderWidgetInPosition('Row 1, Col 1', 'project-portfolio',
          <div style={{ gridColumn: '1', gridRow: '1', minHeight: 0 }}>
            <ProjectPortfolioWidget
              projects={dashboardData.portfolioProjects}
              onProjectClick={onNavigateToProject}
              onHeaderClick={onNavigateToPortfolio}
            />
          </div>
        )}

        {/* ROW 1, COL 2: Who's Where or Project Portfolio */}
        {renderWidgetInPosition('Row 1, Col 2', 'whos-where',
          <div style={{ gridColumn: '2', gridRow: '1', minHeight: 0 }}>
            <WhosWhereWidget data={dashboardData.whosWhere} />
          </div>
        )}
        {renderWidgetInPosition('Row 1, Col 2', 'project-portfolio',
          <div style={{ gridColumn: '2', gridRow: '1', minHeight: 0 }}>
            <ProjectPortfolioWidget
              projects={dashboardData.portfolioProjects}
              onProjectClick={onNavigateToProject}
              onHeaderClick={onNavigateToPortfolio}
            />
          </div>
        )}

        {/* ROW 1-2, COL 3: To-Do (FULL LENGTH) */}
        {renderWidgetInPosition('Row 1-2, Col 3', 'todo',
          <div style={{ gridColumn: '3', gridRow: '1 / 3', minHeight: 0 }}>
            <TodoListWidget
              items={dashboardData.checklist}
              assignedTasks={dashboardData.assignedTasks}
              onDragStart={setDraggedTask}
              onDragEnd={() => setDraggedTask(null)}
              onTaskClick={setSelectedTask}
            />
          </div>
        )}
        {renderWidgetInPosition('Row 1-2, Col 3', 'project-portfolio',
          <div style={{ gridColumn: '3', gridRow: '1 / 3', minHeight: 0 }}>
            <ProjectPortfolioWidget
              projects={dashboardData.portfolioProjects}
              onProjectClick={onNavigateToProject}
              onHeaderClick={onNavigateToPortfolio}
            />
          </div>
        )}

        {/* ROW 1-2, COL 4: Agenda (RIGHT SIDE, spans all rows) */}
        {renderWidgetInPosition('Row 1-2, Col 4', 'agenda',
          <div style={{ gridColumn: '4', gridRow: '1 / 3', minHeight: 0 }}>
            <AgendaWidget draggedTask={draggedTask} events={dashboardData.todayEvents} />
          </div>
        )}
        {renderWidgetInPosition('Row 1-2, Col 4', 'project-portfolio',
          <div style={{ gridColumn: '4', gridRow: '1 / 3', minHeight: 0 }}>
            <ProjectPortfolioWidget
              projects={dashboardData.portfolioProjects}
              onProjectClick={onNavigateToProject}
              onHeaderClick={onNavigateToPortfolio}
            />
          </div>
        )}

        {/* ROW 2, COL 1: Pending Approvals or Project Portfolio */}
        {renderWidgetInPosition('Row 2, Col 1', 'pending-approvals',
          <div style={{ gridColumn: '1', gridRow: '2', minHeight: 0 }}>
            <PendingApprovalsWidget items={dashboardData.whatsPending} />
          </div>
        )}
        {renderWidgetInPosition('Row 2, Col 1', 'project-portfolio',
          <div style={{ gridColumn: '1', gridRow: '2', minHeight: 0 }}>
            <ProjectPortfolioWidget
              projects={dashboardData.portfolioProjects}
              onProjectClick={onNavigateToProject}
              onHeaderClick={onNavigateToPortfolio}
            />
          </div>
        )}

        {/* ROW 2, COL 2: Red Zone or Project Portfolio */}
        {renderWidgetInPosition('Row 2, Col 2', 'red-zone',
          <div style={{ gridColumn: '2', gridRow: '2', minHeight: 0 }}>
            <RedZoneWidget data={dashboardData.redZone} />
          </div>
        )}
        {renderWidgetInPosition('Row 2, Col 2', 'project-portfolio',
          <div style={{ gridColumn: '2', gridRow: '2', minHeight: 0 }}>
            <ProjectPortfolioWidget
              projects={dashboardData.portfolioProjects}
              onProjectClick={onNavigateToProject}
              onHeaderClick={onNavigateToPortfolio}
            />
          </div>
        )}
      </div>

      {/* Widget Configuration Modal */}
      <WidgetConfigModal
        isOpen={showWidgetConfig}
        onClose={() => onCloseWidgetConfig?.()}
        widgets={widgetConfigs}
        onToggleWidget={handleToggleWidget}
        onChangePosition={handleChangePosition}
        onSave={handleSave}
      />

      {/* Alert Modal */}
      <AlertModal
        isOpen={showAlert}
        onClose={() => setShowAlert(false)}
        title="Maximum 6 widgets allowed"
        message="You can only have 6 widgets active at once. Please disable another widget first."
      />

      {/* Task Detail Modal */}
      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
          onUpdateTask={handleUpdateTask}
        />
      )}
    </div>
  );
}

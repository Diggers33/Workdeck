import { useState } from 'react';
import { AppLayout } from '../../components/layout/AppLayout';
import { Dashboard } from './components/Dashboard';

function App() {
  const [showWidgetConfig, setShowWidgetConfig] = useState(false);

  const handleNavigateToProject = (projectId: string) => {
    // Could navigate to specific project if route exists
  };

  const handleNavigateToPortfolio = () => {
    // Navigate to projects
  };

  return (
    <AppLayout onSettingsClick={() => setShowWidgetConfig(true)}>
      <Dashboard
        userRole="project_manager"
        showWidgetConfig={showWidgetConfig}
        onCloseWidgetConfig={() => setShowWidgetConfig(false)}
        onNavigateToProject={handleNavigateToProject}
        onNavigateToPortfolio={handleNavigateToPortfolio}
      />
    </AppLayout>
  );
}

export default App;

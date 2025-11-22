import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardApp from './pages/Dashboard/DashboardApp';
import ResourcePlannerApp from './pages/ResourcePlanner/ResourcePlannerApp';
import ProjectsApp from './pages/Projects/ProjectsApp';
import ProjectWizardPage from './pages/Projects/ProjectWizardPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashboardApp />} />
        <Route path="/planner" element={<ResourcePlannerApp />} />
        <Route path="/projects" element={<ProjectsApp />} />
        <Route path="/projects/new" element={<ProjectWizardPage />} />
        <Route path="/projects/edit/:id" element={<ProjectWizardPage />} />
      </Routes>
    </Router>
  );
}

export default App;

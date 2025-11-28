import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import DashboardApp from './pages/Dashboard/DashboardApp';
import ResourcePlannerApp from './pages/ResourcePlanner/ResourcePlannerApp';
import ProjectsApp from './pages/Projects/ProjectsApp';
import ProjectWizardPage from './pages/Projects/ProjectWizardPage';
import MyCalendarApp from './pages/Time/Calendar/MyCalendarApp';
import MyTasksApp from './pages/Work/MyTasks/MyTasksApp';
import SpendingApp from './pages/Finance/Spending/SpendingApp';
import BillingApp from './pages/Finance/Billing/BillingApp';
import { PendingScreen } from './pages/Dashboard/components/PendingScreen';
import { AppLayout } from './components/layout/AppLayout';
import { SettingsDashboardRedesigned } from './pages/Settings/SettingsDashboardRedesigned';
import { LoginPage } from './pages/Login';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected routes */}
          <Route path="/" element={<ProtectedRoute><DashboardApp /></ProtectedRoute>} />
          <Route path="/planner" element={<ProtectedRoute><ResourcePlannerApp /></ProtectedRoute>} />
          <Route path="/projects" element={<ProtectedRoute><ProjectsApp /></ProtectedRoute>} />
          <Route path="/projects/new" element={<ProtectedRoute><ProjectWizardPage /></ProtectedRoute>} />
          <Route path="/projects/edit/:id" element={<ProtectedRoute><ProjectWizardPage /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><SettingsDashboardRedesigned /></ProtectedRoute>} />

          {/* WORK TAB SCREENS */}
          <Route path="/work/my-tasks" element={<ProtectedRoute><MyTasksApp /></ProtectedRoute>} />
          <Route path="/work/manager-view" element={<ProtectedRoute><AppLayout><PendingScreen title="Manager View"
              category="WORK MANAGEMENT"
              description="Team oversight with workload balancing, performance tracking, and resource allocation."
              onBack={() => window.history.back()}
            /></AppLayout></ProtectedRoute>} />
          <Route path="/work/client-board" element={<ProtectedRoute><AppLayout><PendingScreen title="Client Board"
              category="WORK MANAGEMENT"
              description="Client-facing project status board with milestones and deliverables."
              onBack={() => window.history.back()}
            /></AppLayout></ProtectedRoute>} />

          {/* TIME TAB SCREENS */}
          <Route path="/time/my-calendar" element={<ProtectedRoute><MyCalendarApp /></ProtectedRoute>} />
          <Route path="/time/timesheets" element={<ProtectedRoute><AppLayout><PendingScreen title="Timesheets"
              category="TIME MANAGEMENT"
              description="Track time spent on projects and tasks with easy entry and reporting."
              onBack={() => window.history.back()}
            /></AppLayout></ProtectedRoute>} />
          <Route path="/time/leave" element={<ProtectedRoute><AppLayout><PendingScreen title="Leave Management"
              category="TIME MANAGEMENT"
              description="Request time off, view balances, and manage vacation days."
              onBack={() => window.history.back()}
            /></AppLayout></ProtectedRoute>} />
          <Route path="/time/team-leave" element={<ProtectedRoute><AppLayout><PendingScreen title="Team Leave Calendar"
              category="TIME MANAGEMENT"
              description="See who's out and plan around team availability."
              onBack={() => window.history.back()}
            /></AppLayout></ProtectedRoute>} />
          <Route path="/time/approvals" element={<ProtectedRoute><AppLayout><PendingScreen title="Time Approvals"
              category="TIME MANAGEMENT"
              description="Review and approve timesheets and leave requests from your team."
              onBack={() => window.history.back()}
            /></AppLayout></ProtectedRoute>} />

          {/* FINANCE TAB SCREENS */}
          <Route path="/finance/spending" element={<ProtectedRoute><SpendingApp /></ProtectedRoute>} />
          <Route path="/finance/billing" element={<ProtectedRoute><BillingApp /></ProtectedRoute>} />

          {/* PEOPLE TAB PENDING SCREENS */}
          <Route path="/people/directory" element={<ProtectedRoute><AppLayout><PendingScreen title="People Directory"
              category="PEOPLE MANAGEMENT"
              description="Company directory with contact information, roles, and team structures."
              onBack={() => window.history.back()}
            /></AppLayout></ProtectedRoute>} />
          <Route path="/people/org-chart" element={<ProtectedRoute><AppLayout><PendingScreen title="Organization Chart"
              category="PEOPLE MANAGEMENT"
              description="Visual representation of company hierarchy and reporting relationships."
              onBack={() => window.history.back()}
            /></AppLayout></ProtectedRoute>} />
          <Route path="/people/profiles" element={<ProtectedRoute><AppLayout><PendingScreen title="Team Profiles"
              category="PEOPLE MANAGEMENT"
              description="Detailed team member profiles with skills, experience, and projects."
              onBack={() => window.history.back()}
            /></AppLayout></ProtectedRoute>} />
          <Route path="/people/skills" element={<ProtectedRoute><AppLayout><PendingScreen title="Skills Matrix"
              category="PEOPLE MANAGEMENT"
              description="Track team competencies and identify skill gaps for training needs."
              onBack={() => window.history.back()}
            /></AppLayout></ProtectedRoute>} />

          {/* ANALYTICS TAB PENDING SCREENS */}
          <Route path="/analytics/reports" element={<ProtectedRoute><AppLayout><PendingScreen title="Reports"
              category="ANALYTICS"
              description="Custom reports and data visualization for project and business metrics."
              onBack={() => window.history.back()}
            /></AppLayout></ProtectedRoute>} />
          <Route path="/analytics/insights" element={<ProtectedRoute><AppLayout><PendingScreen title="AI Insights"
              category="ANALYTICS"
              description="AI-powered analysis of trends, predictions, and optimization recommendations."
              onBack={() => window.history.back()}
            /></AppLayout></ProtectedRoute>} />
          <Route path="/analytics/utilization" element={<ProtectedRoute><AppLayout><PendingScreen title="Utilization Metrics"
              category="ANALYTICS"
              description="Team capacity utilization, billable vs non-billable time analysis."
              onBack={() => window.history.back()}
            /></AppLayout></ProtectedRoute>} />
          <Route path="/analytics/forecasting" element={<ProtectedRoute><AppLayout><PendingScreen title="Forecasting"
              category="ANALYTICS"
              description="Project completion predictions, resource demand forecasting, and capacity planning."
              onBack={() => window.history.back()}
            /></AppLayout></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;

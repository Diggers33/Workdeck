import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardApp from './pages/Dashboard/DashboardApp';
import ResourcePlannerApp from './pages/ResourcePlanner/ResourcePlannerApp';
import ProjectsApp from './pages/Projects/ProjectsApp';
import ProjectWizardPage from './pages/Projects/ProjectWizardPage';
import MyCalendarApp from './pages/Time/Calendar/MyCalendarApp';
import MyTasksApp from './pages/Work/MyTasks/MyTasksApp';
import { PendingScreen } from './pages/Dashboard/components/PendingScreen';
import { AppLayout } from './components/layout/AppLayout';
import { SettingsDashboardRedesigned } from './pages/Settings/SettingsDashboardRedesigned';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<DashboardApp />} />
        <Route path="/planner" element={<ResourcePlannerApp />} />
        <Route path="/projects" element={<ProjectsApp />} />
        <Route path="/projects/new" element={<ProjectWizardPage />} />
        <Route path="/projects/edit/:id" element={<ProjectWizardPage />} />
        <Route path="/settings" element={<SettingsDashboardRedesigned />} />

        {/* WORK TAB SCREENS */}
        <Route path="/work/my-tasks" element={<MyTasksApp />} />
        <Route path="/work/manager-view" element={<AppLayout><PendingScreen title="Manager View"
            category="WORK MANAGEMENT"
            description="Team oversight with workload balancing, performance tracking, and resource allocation."
            onBack={() => window.history.back()}
          /></AppLayout>} />
        <Route path="/work/client-board" element={<AppLayout><PendingScreen title="Client Board"
            category="WORK MANAGEMENT"
            description="Client-facing project status board with milestones and deliverables."
            onBack={() => window.history.back()}
          /></AppLayout>} />

        {/* TIME TAB SCREENS */}
        <Route path="/time/my-calendar" element={<MyCalendarApp />} />
        <Route path="/time/timesheets" element={<AppLayout><PendingScreen title="Timesheets"
            category="TIME MANAGEMENT"
            description="Track time spent on projects and tasks with easy entry and reporting."
            onBack={() => window.history.back()}
          /></AppLayout>} />
        <Route path="/time/leave" element={<AppLayout><PendingScreen title="Leave Management"
            category="TIME MANAGEMENT"
            description="Request time off, view balances, and manage vacation days."
            onBack={() => window.history.back()}
          /></AppLayout>} />
        <Route path="/time/team-leave" element={<AppLayout><PendingScreen title="Team Leave Calendar"
            category="TIME MANAGEMENT"
            description="See who's out and plan around team availability."
            onBack={() => window.history.back()}
          /></AppLayout>} />
        <Route path="/time/approvals" element={<AppLayout><PendingScreen title="Time Approvals"
            category="TIME MANAGEMENT"
            description="Review and approve timesheets and leave requests from your team."
            onBack={() => window.history.back()}
          /></AppLayout>} />

        {/* FINANCE TAB PENDING SCREENS */}
        <Route path="/finance/expenses" element={<AppLayout><PendingScreen title="Expenses"
            category="FINANCE MANAGEMENT"
            description="Submit and track expense reports with receipt management."
            onBack={() => window.history.back()}
          /></AppLayout>} />
        <Route path="/finance/purchases" element={<AppLayout><PendingScreen title="Purchase Orders"
            category="FINANCE MANAGEMENT"
            description="Create and manage purchase orders with approval workflows."
            onBack={() => window.history.back()}
          /></AppLayout>} />
        <Route path="/finance/invoices" element={<AppLayout><PendingScreen title="Invoices"
            category="FINANCE MANAGEMENT"
            description="Generate client invoices and track payment status."
            onBack={() => window.history.back()}
          /></AppLayout>} />
        <Route path="/finance/billing" element={<AppLayout><PendingScreen title="Billing Dashboard"
            category="FINANCE MANAGEMENT"
            description="Overview of billing cycles, revenue tracking, and financial metrics."
            onBack={() => window.history.back()}
          /></AppLayout>} />

        {/* PEOPLE TAB PENDING SCREENS */}
        <Route path="/people/directory" element={<AppLayout><PendingScreen title="People Directory"
            category="PEOPLE MANAGEMENT"
            description="Company directory with contact information, roles, and team structures."
            onBack={() => window.history.back()}
          /></AppLayout>} />
        <Route path="/people/org-chart" element={<AppLayout><PendingScreen title="Organization Chart"
            category="PEOPLE MANAGEMENT"
            description="Visual representation of company hierarchy and reporting relationships."
            onBack={() => window.history.back()}
          /></AppLayout>} />
        <Route path="/people/profiles" element={<AppLayout><PendingScreen title="Team Profiles"
            category="PEOPLE MANAGEMENT"
            description="Detailed team member profiles with skills, experience, and projects."
            onBack={() => window.history.back()}
          /></AppLayout>} />
        <Route path="/people/skills" element={<AppLayout><PendingScreen title="Skills Matrix"
            category="PEOPLE MANAGEMENT"
            description="Track team competencies and identify skill gaps for training needs."
            onBack={() => window.history.back()}
          /></AppLayout>} />

        {/* ANALYTICS TAB PENDING SCREENS */}
        <Route path="/analytics/reports" element={<AppLayout><PendingScreen title="Reports"
            category="ANALYTICS"
            description="Custom reports and data visualization for project and business metrics."
            onBack={() => window.history.back()}
          /></AppLayout>} />
        <Route path="/analytics/insights" element={<AppLayout><PendingScreen title="AI Insights"
            category="ANALYTICS"
            description="AI-powered analysis of trends, predictions, and optimization recommendations."
            onBack={() => window.history.back()}
          /></AppLayout>} />
        <Route path="/analytics/utilization" element={<AppLayout><PendingScreen title="Utilization Metrics"
            category="ANALYTICS"
            description="Team capacity utilization, billable vs non-billable time analysis."
            onBack={() => window.history.back()}
          /></AppLayout>} />
        <Route path="/analytics/forecasting" element={<AppLayout><PendingScreen title="Forecasting"
            category="ANALYTICS"
            description="Project completion predictions, resource demand forecasting, and capacity planning."
            onBack={() => window.history.back()}
          /></AppLayout>} />
      </Routes>
    </Router>
  );
}

export default App;

import { useNavigate, useParams } from 'react-router-dom';
import { X } from 'lucide-react';
import { AppLayout } from '../../components/layout/AppLayout';
import { ProjectWorkspace } from './wizard/ProjectWorkspace';

export default function ProjectWizardPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const handleClose = () => {
    navigate('/projects');
  };

  return (
    <AppLayout>
      {/* BREADCRUMB / TITLE BAR */}
      <div className="bg-white border-b" style={{ borderBottomColor: '#E5E7EB' }}>
        <div className="mx-auto px-6 py-4" style={{ maxWidth: '1440px' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
              <div>
                <h1 className="text-xl font-semibold">
                  {id ? 'Edit Project' : 'Create New Project'}
                </h1>
                <p className="text-sm text-gray-600">
                  {id ? 'Update project details and settings' : 'Set up your new project'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - Project Wizard */}
      <div className="p-6 bg-[#F8F9FC] min-h-[calc(100vh-120px)]">
        <ProjectWorkspace
          projectId={id || null}
          onClose={handleClose}
        />
      </div>
    </AppLayout>
  );
}

import { Button } from '../ui/button';
import { Upload, FileText, Image, File, Download, Trash2, MoreVertical } from 'lucide-react';

interface FileItem {
  id: string;
  name: string;
  type: 'document' | 'image' | 'other';
  size: string;
  uploadedBy: string;
  uploadedDate: string;
}

export function FilesSection() {
  const files: FileItem[] = [
    {
      id: '1',
      name: 'Project Requirements.pdf',
      type: 'document',
      size: '2.4 MB',
      uploadedBy: 'Sarah Chen',
      uploadedDate: '2024-01-15',
    },
    {
      id: '2',
      name: 'Design Mockups.fig',
      type: 'other',
      size: '8.1 MB',
      uploadedBy: 'Emily Watson',
      uploadedDate: '2024-02-20',
    },
    {
      id: '3',
      name: 'Architecture Diagram.png',
      type: 'image',
      size: '1.2 MB',
      uploadedBy: 'Michael Rodriguez',
      uploadedDate: '2024-03-05',
    },
    {
      id: '4',
      name: 'Technical Specifications.docx',
      type: 'document',
      size: '456 KB',
      uploadedBy: 'David Kim',
      uploadedDate: '2024-03-10',
    },
  ];

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'document':
        return FileText;
      case 'image':
        return Image;
      default:
        return File;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <div className="bg-white rounded-lg border border-[#E3E6EB] shadow-sm">
      {/* Header */}
      <div className="px-6 py-5 border-b border-[#E3E6EB] flex items-center justify-between">
        <div>
          <h2 className="text-slate-900">Files</h2>
          <p className="text-sm text-slate-500 mt-1">Project documents and attachments</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Upload className="w-4 h-4 mr-2 stroke-[1.5]" />
          Upload File
        </Button>
      </div>

      {/* Files Grid */}
      <div className="p-6">
        <div className="grid grid-cols-4 gap-4">
          {files.map((file) => {
            const Icon = getFileIcon(file.type);
            return (
              <div
                key={file.id}
                className="group p-4 rounded-lg border border-[#E3E6EB] hover:border-slate-300 hover:shadow-md transition-all cursor-pointer"
              >
                {/* File Icon */}
                <div className="w-12 h-12 bg-slate-100 rounded-lg flex items-center justify-center mb-3">
                  <Icon className="w-6 h-6 text-slate-400 stroke-[1.5]" />
                </div>

                {/* File Info */}
                <p className="text-sm text-slate-900 truncate mb-1">{file.name}</p>
                <p className="text-xs text-slate-500 mb-2">{file.size}</p>
                <p className="text-xs text-slate-400">
                  {file.uploadedBy} • {formatDate(file.uploadedDate)}
                </p>

                {/* Actions - Show on hover */}
                <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    className="flex-1 flex items-center justify-center gap-1.5 py-1.5 px-2 text-xs text-slate-600 hover:bg-slate-100 rounded transition-colors"
                    title="Download"
                  >
                    <Download className="w-3.5 h-3.5 stroke-[1.5]" />
                    Download
                  </button>
                  <button
                    className="w-7 h-7 flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded transition-colors"
                    title="More"
                  >
                    <MoreVertical className="w-3.5 h-3.5 stroke-[1.5]" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

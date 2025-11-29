import React, { useState, useEffect, useRef } from 'react';
import { Upload, Eye, Download, Trash2, Monitor, Search, Grid, List as ListIcon, Maximize2, X, Loader2 } from 'lucide-react';

const GoogleDriveLogo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M7.71 3.5L1.13 15L4.55 21L11.13 9.5L7.71 3.5Z" fill="#0066DA"/>
    <path d="M14.29 3.5L7.71 15L11.13 21L17.71 9.5L14.29 3.5Z" fill="#00AC47"/>
    <path d="M14.29 3.5H7.71L4.29 9.5H17.71L14.29 3.5Z" fill="#EA4335"/>
  </svg>
);

const OneDriveLogo = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
    <path d="M13.8 8.5C15.7 8.2 17.4 8.9 18.6 10.1C21.6 10.4 24 12.9 24 16C24 19.3 21.3 22 18 22H8C4.1 22 1 18.9 1 15C1 11.1 4.1 8 8 8C10.2 8 12.2 9 13.8 10.5V8.5Z" fill="#0078D4"/>
  </svg>
);

const mockFiles = [
  {
    id: 1,
    name: 'Technical_Specifications_v3.pdf',
    icon: '📄',
    size: '2.4 MB',
    uploadedBy: 'Alice Chen',
    uploadedTime: '2 hours ago',
    type: 'pdf',
    taskName: 'Task 3.2. Optical sorting',
    taskId: 'task-3-2',
    source: 'computer'
  },
  {
    id: 2,
    name: 'Material_Analysis_Report.docx',
    icon: '📝',
    size: '1.8 MB',
    uploadedBy: 'Bob Ross',
    uploadedTime: '5 hours ago',
    type: 'word',
    taskName: 'Task 2.1. Material testing',
    taskId: 'task-2-1',
    source: 'google-drive'
  },
  {
    id: 3,
    name: 'Process_Diagram.png',
    icon: '🖼️',
    size: '856 KB',
    uploadedBy: 'Charlie Day',
    uploadedTime: '1 day ago',
    type: 'image',
    taskName: 'Task 1.3. Process design',
    taskId: 'task-1-3',
    source: 'computer'
  },
  {
    id: 4,
    name: 'Budget_Overview_Q4.xlsx',
    icon: '📊',
    size: '324 KB',
    uploadedBy: 'Alice Chen',
    uploadedTime: '2 days ago',
    type: 'excel',
    taskName: 'Direct upload',
    taskId: null,
    source: 'onedrive'
  },
  {
    id: 5,
    name: 'Lab_Setup_Photos.zip',
    icon: '📦',
    size: '24.3 MB',
    uploadedBy: 'Bob Ross',
    uploadedTime: '3 days ago',
    type: 'archive',
    taskName: 'Task 2.3. Site inspection',
    taskId: 'task-2-3',
    source: 'onedrive'
  },
  {
    id: 6,
    name: 'Project_Timeline.pptx',
    icon: '📊',
    size: '5.6 MB',
    uploadedBy: 'John Doe',
    uploadedTime: '1 week ago',
    type: 'powerpoint',
    taskName: 'Task 4.1. Stakeholder meeting',
    taskId: 'task-4-1',
    source: 'computer'
  },
  {
    id: 7,
    name: 'Lab_Results_Data.csv',
    icon: '📊',
    size: '142 KB',
    uploadedBy: 'Charlie Day',
    uploadedTime: '2 weeks ago',
    type: 'excel',
    taskName: 'Task 3.1. Laboratory testing',
    taskId: 'task-3-1',
    source: 'google-drive'
  },
  {
    id: 8,
    name: 'Equipment_Manual.pdf',
    icon: '📄',
    size: '8.7 MB',
    uploadedBy: 'Alice Chen',
    uploadedTime: '3 weeks ago',
    type: 'pdf',
    taskName: 'Direct upload',
    taskId: null,
    source: 'computer'
  },
  {
    id: 9,
    name: 'Research_Report_Q1.pdf',
    icon: '📄',
    size: '2.4 MB',
    uploadedBy: 'Charlie Day',
    uploadedTime: '1 month ago',
    type: 'pdf',
    taskName: 'Task 1.1. Research phase',
    taskId: 'task-1-1',
    source: 'computer'
  },
  {
    id: 10,
    name: 'Budget_Analysis_2024.xlsx',
    icon: '📊',
    size: '1.8 MB',
    uploadedBy: 'Alice Chen',
    uploadedTime: '1 month ago',
    type: 'excel',
    taskName: 'Direct upload',
    taskId: null,
    source: 'google-drive'
  },
  {
    id: 11,
    name: 'Team_Meeting_Notes.docx',
    icon: '📝',
    size: '890 KB',
    uploadedBy: 'Alice Chen',
    uploadedTime: '1 month ago',
    type: 'word',
    taskName: 'Task 4.2. Team sync',
    taskId: 'task-4-2',
    source: 'computer'
  },
  {
    id: 12,
    name: 'Safety_Guidelines.pdf',
    icon: '📄',
    size: '3.2 MB',
    uploadedBy: 'Bob Ross',
    uploadedTime: '2 months ago',
    type: 'pdf',
    taskName: 'Direct upload',
    taskId: null,
    source: 'onedrive'
  }
];

interface ProjectFilesTabProps {
  projectId?: string;
}

export function ProjectFilesTab({ projectId }: ProjectFilesTabProps) {
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const [files, setFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Load current user ID
  useEffect(() => {
    import('../../../../services/usersApi').then(({ getCurrentUser }) => {
      getCurrentUser().then(user => setCurrentUserId(user.id)).catch(() => {});
    });
  }, []);

  // Load files from API
  useEffect(() => {
    if (!projectId) {
      setLoading(false);
      return;
    }

    async function loadFiles() {
      try {
        setLoading(true);
        const { getFiles, getFileDownloadUrl } = await import('../../../../services/filesApi');
        const { formatDistanceToNow } = await import('date-fns');
        
        const apiFiles = await getFiles('projects', projectId);
        const transformed = apiFiles.map(file => {
          const ext = file.filename.split('.').pop()?.toLowerCase();
          const iconMap: Record<string, string> = {
            pdf: '📄', doc: '📝', docx: '📝', xls: '📊', xlsx: '📊',
            ppt: '📊', pptx: '📊', jpg: '🖼️', jpeg: '🖼️', png: '🖼️',
            gif: '🖼️', zip: '📦', rar: '📦'
          };
          const formatSize = (bytes: number) => {
            if (bytes < 1024) return bytes + ' B';
            if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
            return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
          };
          
          return {
            id: file.id,
            name: file.filename,
            icon: iconMap[ext || ''] || '📄',
            size: formatSize(file.size),
            uploadedBy: file.creator.fullName,
            uploadedTime: formatDistanceToNow(new Date(file.createdAt), { addSuffix: true }),
            type: file.mimeType.split('/')[0],
            taskName: 'Direct upload',
            taskId: null,
            source: 'computer',
            url: currentUserId ? getFileDownloadUrl(file.token, currentUserId) : undefined
          };
        });
        
        setFiles(transformed);
      } catch (error) {
        console.error('Error loading files:', error);
        setFiles([]);
      } finally {
        setLoading(false);
      }
    }

    loadFiles();
  }, [projectId, currentUserId]);

  const handleFileUpload = async (file: File) => {
    if (!projectId || uploading) return;

    try {
      setUploading(true);
      const { uploadFile } = await import('../../../../services/filesApi');
      await uploadFile(file, 'projects', projectId);
      
      // Reload files
      const { getFiles, getFileDownloadUrl } = await import('../../../../services/filesApi');
      const { formatDistanceToNow } = await import('date-fns');
      const apiFiles = await getFiles('projects', projectId);
      const transformed = apiFiles.map(f => {
        const ext = f.filename.split('.').pop()?.toLowerCase();
        const iconMap: Record<string, string> = {
          pdf: '📄', doc: '📝', docx: '📝', xls: '📊', xlsx: '📊',
          ppt: '📊', pptx: '📊', jpg: '🖼️', jpeg: '🖼️', png: '🖼️',
          gif: '🖼️', zip: '📦', rar: '📦'
        };
        const formatSize = (bytes: number) => {
          if (bytes < 1024) return bytes + ' B';
          if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
          return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
        };
        return {
          id: f.id,
          name: f.filename,
          icon: iconMap[ext || ''] || '📄',
          size: formatSize(f.size),
          uploadedBy: f.creator.fullName,
          uploadedTime: formatDistanceToNow(new Date(f.createdAt), { addSuffix: true }),
          type: f.mimeType.split('/')[0],
          taskName: 'Direct upload',
          taskId: null,
          source: 'computer',
          url: currentUserId ? getFileDownloadUrl(f.token, currentUserId) : undefined
        };
      });
      setFiles(transformed);
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
    } finally {
      setUploading(false);
      setShowUploadMenu(false);
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return;

    try {
      const { deleteFile } = await import('../../../../services/filesApi');
      await deleteFile(fileId, 'projects');
      setFiles(files.filter(f => f.id !== fileId));
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete file. Please try again.');
    }
  };

  const uploadOptions = [
    { 
      id: 'computer', 
      icon: <Monitor size={20} color="#6B7280" />, 
      label: 'Computer' 
    },
    { 
      id: 'gdrive', 
      icon: <GoogleDriveLogo />, 
      label: 'Google Drive' 
    },
    { 
      id: 'onedrive', 
      icon: <OneDriveLogo />, 
      label: 'OneDrive' 
    }
  ];

  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
        <Loader2 className="animate-spin" size={24} />
      </div>
    );
  }

  const renderFileCard = (file: any) => (
    <div
      key={file.id}
      style={{
        minHeight: '80px',
        background: 'white',
        border: '1px solid #E5E7EB',
        borderRadius: '8px',
        padding: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        marginBottom: '12px',
        transition: 'all 150ms ease',
        cursor: 'pointer'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = '#3B82F6';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = '#E5E7EB';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* File Icon */}
      <div style={{
        fontSize: '32px',
        minWidth: '32px',
        alignSelf: 'flex-start'
      }}>
        {file.icon}
      </div>

      {/* File Info */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{
          fontSize: '14px',
          fontWeight: 500,
          color: '#0A0A0A',
          marginBottom: '6px',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap'
        }}>
          {file.name}
        </div>
        {/* Task Badge */}
        {file.taskId && (
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '2px 8px',
            background: '#EFF6FF',
            border: '1px solid #BFDBFE',
            borderRadius: '4px',
            marginBottom: '6px'
          }}>
            <span style={{
              fontSize: '11px',
              fontWeight: 600,
              color: '#1D4ED8'
            }}>
              {file.taskName}
            </span>
          </div>
        )}
        <div style={{
          fontSize: '12px',
          color: '#9CA3AF',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          {file.source === 'google-drive' && (<GoogleDriveLogo />)}
          {file.source === 'onedrive' && (<OneDriveLogo />)}
          {file.source === 'computer' && (<Monitor size={12} color="#9CA3AF" />)}
          <span>{file.size} • Uploaded {file.uploadedTime} by {file.uploadedBy}</span>
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '8px', alignSelf: 'flex-start' }}>
        <button style={{
          width: '32px',
          height: '32px',
          border: '1px solid #E5E7EB',
          borderRadius: '6px',
          background: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 150ms ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#EFF6FF';
          e.currentTarget.style.borderColor = '#3B82F6';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'white';
          e.currentTarget.style.borderColor = '#E5E7EB';
        }}
        >
          <Eye size={14} color="#3B82F6" />
        </button>
        <button style={{
          width: '32px',
          height: '32px',
          border: '1px solid #E5E7EB',
          borderRadius: '6px',
          background: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 150ms ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#EFF6FF';
          e.currentTarget.style.borderColor = '#3B82F6';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'white';
          e.currentTarget.style.borderColor = '#E5E7EB';
        }}
        >
          <Download size={14} color="#3B82F6" />
        </button>
        <button style={{
          width: '32px',
          height: '32px',
          border: '1px solid #E5E7EB',
          borderRadius: '6px',
          background: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          transition: 'all 150ms ease'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#FEE2E2';
          e.currentTarget.style.borderColor = '#DC2626';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'white';
          e.currentTarget.style.borderColor = '#E5E7EB';
        }}
        >
          <Trash2 size={14} color="#DC2626" />
        </button>
      </div>
    </div>
  );

  const renderContent = () => (
    <>
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file);
        }}
      />
      
      {/* Top Actions Bar */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '24px',
        gap: '12px'
      }}>
        {/* Upload Button */}
        <div style={{ position: 'relative' }}>
          <button
            onClick={() => {
              if (uploadOptions[0].id === 'computer') {
                fileInputRef.current?.click();
              } else {
                setShowUploadMenu(!showUploadMenu);
              }
            }}
            disabled={uploading || !projectId}
            style={{
              height: '40px',
              padding: '0 16px',
              background: '#3B82F6',
              border: 'none',
              borderRadius: '6px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '14px',
              fontWeight: 500,
              color: 'white',
              cursor: 'pointer',
              transition: 'all 150ms ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#2563EB'}
            onMouseLeave={(e) => e.currentTarget.style.background = '#3B82F6'}
          >
            {uploading ? (
              <Loader2 className="animate-spin" size={16} />
            ) : (
              <Upload size={16} />
            )}
            <span>{uploading ? 'Uploading...' : 'Upload'}</span>
          </button>

          {/* Upload Dropdown */}
          {showUploadMenu && (
            <div style={{
              position: 'absolute',
              top: '48px',
              left: 0,
              width: '200px',
              background: 'white',
              border: '1px solid #E5E7EB',
              borderRadius: '8px',
              boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
              padding: '8px',
              zIndex: 10
            }}>
              {uploadOptions.map((option) => (
                <button
                  key={option.id}
                  onClick={() => setShowUploadMenu(false)}
                  style={{
                    width: '100%',
                    height: '44px',
                    padding: '12px',
                    background: 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    fontSize: '14px',
                    color: '#0A0A0A',
                    cursor: 'pointer',
                    transition: 'background 150ms ease'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#F9FAFB'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  {option.icon}
                  <span>{option.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Search Bar */}
        <div style={{
          flex: 1,
          position: 'relative',
          maxWidth: '300px'
        }}>
          <Search size={16} color="#9CA3AF" style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)'
          }} />
          <input
            type="text"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              height: '40px',
              padding: '0 12px 0 40px',
              border: '1px solid #E5E7EB',
              borderRadius: '6px',
              fontSize: '14px',
              color: '#0A0A0A',
              outline: 'none'
            }}
            onFocus={(e) => e.currentTarget.style.borderColor = '#3B82F6'}
            onBlur={(e) => e.currentTarget.style.borderColor = '#E5E7EB'}
          />
        </div>

        {/* Fullscreen Button */}
        <button
          onClick={() => setIsFullscreen(!isFullscreen)}
          style={{
            width: '40px',
            height: '40px',
            background: 'white',
            border: '1px solid #E5E7EB',
            borderRadius: '6px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            transition: 'all 150ms ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#F9FAFB';
            e.currentTarget.style.borderColor = '#3B82F6';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'white';
            e.currentTarget.style.borderColor = '#E5E7EB';
          }}
        >
          {isFullscreen ? <X size={16} color="#3B82F6" /> : <Maximize2 size={16} color="#3B82F6" />}
        </button>

        {/* View Mode Toggle */}
        <div style={{
          display: 'flex',
          gap: '4px',
          background: '#F9FAFB',
          padding: '4px',
          borderRadius: '6px'
        }}>
          <button
            onClick={() => setViewMode('grid')}
            style={{
              width: '32px',
              height: '32px',
              border: 'none',
              background: viewMode === 'grid' ? 'white' : 'transparent',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 150ms ease'
            }}
          >
            <Grid size={16} color={viewMode === 'grid' ? '#3B82F6' : '#6B7280'} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            style={{
              width: '32px',
              height: '32px',
              border: 'none',
              background: viewMode === 'list' ? 'white' : 'transparent',
              borderRadius: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 150ms ease'
            }}
          >
            <ListIcon size={16} color={viewMode === 'list' ? '#3B82F6' : '#6B7280'} />
          </button>
        </div>
      </div>

      {/* File Count */}
      <div style={{
        fontSize: '13px',
        color: '#6B7280',
        marginBottom: '16px'
      }}>
        {filteredFiles.length} file{filteredFiles.length !== 1 ? 's' : ''}
      </div>

      {/* Files List */}
      {viewMode === 'list' ? (
        <div>
          {filteredFiles.map((file) => renderFileCard(file))}
        </div>
      ) : (
        /* Grid View */
        <div style={{
          display: 'grid',
          gridTemplateColumns: isFullscreen ? 'repeat(4, 1fr)' : 'repeat(2, 1fr)',
          gap: '16px'
        }}>
          {filteredFiles.map((file) => (
            <div
              key={file.id}
              style={{
                background: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                padding: '16px',
                transition: 'all 150ms ease',
                cursor: 'pointer'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#3B82F6';
                e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#E5E7EB';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              {/* File Icon - Centered */}
              <div style={{
                fontSize: '48px',
                textAlign: 'center',
                marginBottom: '12px'
              }}>
                {file.icon}
              </div>

              {/* File Name */}
              <div style={{
                fontSize: '13px',
                fontWeight: 500,
                color: '#0A0A0A',
                marginBottom: '8px',
                textAlign: 'center',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}>
                {file.name}
              </div>

              {/* File Meta */}
              <div style={{
                fontSize: '11px',
                color: '#9CA3AF',
                textAlign: 'center',
                marginBottom: '12px'
              }}>
                {file.size}
              </div>

              {/* Actions */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                gap: '8px'
              }}>
                <button
                  onClick={() => file.url && window.open(file.url, '_blank')}
                  style={{
                    width: '32px',
                    height: '32px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '6px',
                    background: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 150ms ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#EFF6FF';
                    e.currentTarget.style.borderColor = '#3B82F6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.borderColor = '#E5E7EB';
                  }}
                >
                  <Eye size={14} color="#3B82F6" />
                </button>
                <button
                  onClick={() => file.url && window.open(file.url, '_blank')}
                  style={{
                    width: '32px',
                    height: '32px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '6px',
                    background: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 150ms ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#EFF6FF';
                    e.currentTarget.style.borderColor = '#3B82F6';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.borderColor = '#E5E7EB';
                  }}
                >
                  <Download size={14} color="#3B82F6" />
                </button>
                <button
                  onClick={() => handleDeleteFile(file.id)}
                  style={{
                    width: '32px',
                    height: '32px',
                    border: '1px solid #E5E7EB',
                    borderRadius: '6px',
                    background: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    transition: 'all 150ms ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = '#FEE2E2';
                    e.currentTarget.style.borderColor = '#DC2626';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'white';
                    e.currentTarget.style.borderColor = '#E5E7EB';
                  }}
                >
                  <Trash2 size={14} color="#DC2626" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {filteredFiles.length === 0 && (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: '60px'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px',
            opacity: 0.3
          }}>
            📁
          </div>
          <div style={{
            fontSize: '15px',
            fontWeight: 600,
            color: '#0A0A0A',
            marginBottom: '8px'
          }}>
            No files found
          </div>
          <div style={{
            fontSize: '13px',
            color: '#9CA3AF'
          }}>
            Try adjusting your search
          </div>
        </div>
      )}
    </>
  );

  if (isFullscreen) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'white',
        zIndex: 2000,
        overflowY: 'auto'
      }}>
        <div style={{
          maxWidth: '1600px',
          margin: '0 auto',
          padding: '40px'
        }}>
          <div style={{
            fontSize: '24px',
            fontWeight: 600,
            color: '#0A0A0A',
            marginBottom: '32px'
          }}>
            Project Repository
          </div>
          {renderContent()}
        </div>
      </div>
    );
  }

  return <div style={{ padding: '24px' }}>{renderContent()}</div>;
}
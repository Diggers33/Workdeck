import React, { useState, useEffect, useRef } from 'react';
import { Upload, Eye, Download, Trash2, Monitor, Loader2 } from 'lucide-react';
import { getFiles, uploadFile, deleteFile, getFileDownloadUrl, type FileEntity } from '../../../../services/filesApi';
import { getCurrentUser } from '../../../../services/usersApi';
import { formatDistanceToNow } from 'date-fns';

interface TaskFilesTabProps {
  task: any;
}

interface File {
  id: string;
  name: string;
  icon: string;
  size: string;
  uploadedBy: string;
  uploadedTime: string;
  type: string;
  url?: string;
}

// Get file icon based on extension
const getFileIcon = (filename: string): string => {
  const ext = filename.split('.').pop()?.toLowerCase();
  const iconMap: Record<string, string> = {
    pdf: '📄',
    doc: '📝',
    docx: '📝',
    xls: '📊',
    xlsx: '📊',
    ppt: '📊',
    pptx: '📊',
    jpg: '🖼',
    jpeg: '🖼',
    png: '🖼',
    gif: '🖼',
    zip: '📦',
    rar: '📦',
  };
  return iconMap[ext || ''] || '📄';
};

// Format file size
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' B';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
};

export function TaskFilesTab({ task }: TaskFilesTabProps) {
  const [showUploadMenu, setShowUploadMenu] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load current user ID
  useEffect(() => {
    getCurrentUser().then(user => setCurrentUserId(user.id)).catch(() => {});
  }, []);

  // Load files
  useEffect(() => {
    if (!task?.id) return;

    async function loadFiles() {
      try {
        setLoading(true);
        const apiFiles = await getFiles('tasks', task.id);
        const transformed: File[] = apiFiles.map(file => ({
          id: file.id,
          name: file.filename,
          icon: getFileIcon(file.filename),
          size: formatFileSize(file.size),
          uploadedBy: file.creator.fullName,
          uploadedTime: formatDistanceToNow(new Date(file.createdAt), { addSuffix: true }),
          type: file.mimeType.split('/')[0],
          url: currentUserId ? getFileDownloadUrl(file.token, currentUserId) : undefined,
        }));
        setFiles(transformed);
      } catch (error) {
        console.error('Error loading files:', error);
      } finally {
        setLoading(false);
      }
    }

    loadFiles();
  }, [task?.id, currentUserId]);

  const handleFileUpload = async (file: File) => {
    if (!task?.id || uploading) return;

    try {
      setUploading(true);
      await uploadFile(file, 'tasks', task.id);
      
      // Reload files
      const apiFiles = await getFiles('tasks', task.id);
      const transformed: File[] = apiFiles.map(f => ({
        id: f.id,
        name: f.filename,
        icon: getFileIcon(f.filename),
        size: formatFileSize(f.size),
        uploadedBy: f.creator.fullName,
        uploadedTime: formatDistanceToNow(new Date(f.createdAt), { addSuffix: true }),
        type: f.mimeType.split('/')[0],
        url: currentUserId ? getFileDownloadUrl(f.token, currentUserId) : undefined,
      }));
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
      await deleteFile(fileId, 'tasks');
      setFiles(files.filter(f => f.id !== fileId));
    } catch (error) {
      console.error('Error deleting file:', error);
      alert('Failed to delete file. Please try again.');
    }
  };

  const handleDownload = (file: File) => {
    if (file.url) {
      window.open(file.url, '_blank');
    }
  };

// Brand Logo Components
const GoogleDriveLogo = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M7.71 3.5L1.13 15L4.55 21L11.13 9.5L7.71 3.5Z" fill="#0066DA"/>
    <path d="M14.29 3.5L7.71 15L11.13 21L17.71 9.5L14.29 3.5Z" fill="#00AC47"/>
    <path d="M14.29 3.5H7.71L4.29 9.5H17.71L14.29 3.5Z" fill="#EA4335"/>
    <path d="M4.55 21L7.71 15L1.13 15L4.55 21Z" fill="#00832D"/>
    <path d="M19.45 21L22.87 15L16.29 15L19.45 21Z" fill="#2684FC"/>
    <path d="M11.13 9.5L7.71 15H16.29L19.45 21H4.55L1.13 15L7.71 3.5H14.29L17.71 9.5H11.13Z" fill="#FFBA00"/>
  </svg>
);

const OneDriveLogo = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M13.8 8.5C12.2 7 10.2 6 8 6C4.1 6 1 9.1 1 13C1 16.9 4.1 20 8 20H18C21.3 20 24 17.3 24 14C24 10.9 21.6 8.4 18.6 8.1C17.4 6.9 15.7 6.2 13.8 6.5V8.5Z" fill="#0364B8"/>
    <path d="M13.8 8.5C15.7 8.2 17.4 8.9 18.6 10.1C21.6 10.4 24 12.9 24 16C24 19.3 21.3 22 18 22H8C4.1 22 1 18.9 1 15C1 11.1 4.1 8 8 8C10.2 8 12.2 9 13.8 10.5V8.5Z" fill="#0078D4"/>
    <path d="M13.8 8.5V10.5C12.2 9 10.2 8 8 8C6.3 8 4.8 8.6 3.6 9.7C2.6 10.7 2 12.2 2 13.8C2 14.5 2.1 15.1 2.4 15.7C3.1 17.3 4.8 18.5 6.8 18.8C7.2 18.9 7.6 19 8 19H18C20.2 19 22 17.2 22 15C22 13 20.5 11.3 18.6 11C17.9 9.6 16.5 8.6 14.8 8.5H13.8Z" fill="#1490DF"/>
    <path d="M18.6 11C20.5 11.3 22 13 22 15C22 17.2 20.2 19 18 19H8C7.6 19 7.2 18.9 6.8 18.8C8.4 18.5 9.8 17.6 10.7 16.3C11.4 15.3 11.8 14.2 11.9 13H13.8C15.5 13 17.2 12.3 18.6 11Z" fill="#28A8EA"/>
  </svg>
);

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

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
        <Loader2 className="animate-spin" size={24} />
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '100%' }}>
      <input
        ref={fileInputRef}
        type="file"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileUpload(file);
        }}
      />
      
      {/* Upload Button */}
      <div style={{ position: 'relative', marginBottom: '24px' }}>
        <button
          onClick={() => {
            if (uploadOptions[0].id === 'computer') {
              fileInputRef.current?.click();
            } else {
              setShowUploadMenu(!showUploadMenu);
            }
          }}
          disabled={uploading}
          style={{
            width: '160px',
            height: '48px',
            background: 'white',
            border: '2px dashed #3B82F6',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            fontSize: '15px',
            fontWeight: 600,
            color: '#3B82F6',
            cursor: 'pointer',
            transition: 'all 150ms ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#EFF6FF';
            e.currentTarget.style.borderStyle = 'solid';
          }}
          onMouseLeave={(e) => {
            if (!showUploadMenu) {
              e.currentTarget.style.background = 'white';
              e.currentTarget.style.borderStyle = 'dashed';
            }
          }}
        >
          {uploading ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <Upload size={18} />
          )}
          <span>{uploading ? 'Uploading...' : 'Upload File'}</span>
        </button>

        {/* Upload Dropdown */}
        {showUploadMenu && (
          <div style={{
            position: 'absolute',
            top: '56px',
            left: 0,
            width: '240px',
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
                  height: '48px',
                  padding: '12px',
                  background: 'transparent',
                  border: 'none',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  fontSize: '15px',
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

      {/* File List */}
      {files.length === 0 ? (
        // Empty State
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          paddingTop: '40px'
        }}>
          <div style={{
            fontSize: '48px',
            marginBottom: '16px',
            opacity: 0.3
          }}>
            📎
          </div>
          <div style={{
            fontSize: '16px',
            fontWeight: 600,
            color: '#0A0A0A',
            marginBottom: '8px'
          }}>
            No files attached
          </div>
          <div style={{
            fontSize: '14px',
            color: '#9CA3AF'
          }}>
            Upload files from your computer or cloud storage
          </div>
        </div>
      ) : (
        // Files List
        <div>
          {files.map((file) => (
            <div
              key={file.id}
              style={{
                height: '80px',
                background: 'white',
                border: '1px solid #E5E7EB',
                borderRadius: '8px',
                padding: '16px 20px',
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
                fontSize: '40px',
                minWidth: '40px'
              }}>
                {file.icon}
              </div>

              {/* File Info */}
              <div style={{ flex: 1 }}>
                <div style={{
                  fontSize: '15px',
                  fontWeight: 500,
                  color: '#0A0A0A',
                  marginBottom: '4px'
                }}>
                  {file.name}
                </div>
                <div style={{
                  fontSize: '13px',
                  color: '#9CA3AF'
                }}>
                  {file.size} • Uploaded {file.uploadedTime} by {file.uploadedBy}
                </div>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button style={{
                  width: '36px',
                  height: '36px',
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
                  <Eye size={16} color="#3B82F6" />
                </button>
                <button style={{
                  width: '36px',
                  height: '36px',
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
                  <Download size={16} color="#3B82F6" />
                </button>
                <button
                  onClick={() => handleDownload(file)}
                  style={{
                    width: '36px',
                    height: '36px',
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
                  <Download size={16} color="#3B82F6" />
                </button>
                <button
                  onClick={() => handleDeleteFile(file.id)}
                  style={{
                    width: '36px',
                    height: '36px',
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
                  <Trash2 size={16} color="#DC2626" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
/**
 * Files API Service
 * Based on Workdeck API Complete Reference Guide
 */

import { apiGet, apiPost, API_BASE_URL } from './apiClient';
import { getAuthHeaders } from './authService';

// ==================== Types ====================

export type FileEntityType = 'projects' | 'tasks' | 'events' | 'expenses' | 'purchases' | 'clients';

export interface FileEntity {
  id: string;
  filename: string;
  token: string;
  size: number;
  mimeType: string;
  url: string;
  creator: {
    id: string;
    fullName: string;
  };
  createdAt: string;
}

export interface UploadUrlResponse {
  uploadUrl: string;
  fileId: string;
  token: string;
  expiresIn: number;
}

// ==================== API Functions ====================

/**
 * Get files by entity
 * GET /queries/files/{entityType}/{entityId}
 */
export async function getFiles(
  entityType: FileEntityType,
  entityId: string
): Promise<FileEntity[]> {
  return apiGet<FileEntity[]>(`/queries/files/${entityType}/${entityId}`);
}

/**
 * Get upload URL (Step 1 of file upload)
 * POST /commands/sync/upload-url
 */
export async function getUploadUrl(
  fileName: string,
  fileSize: number,
  contentType: string,
  entityType: FileEntityType,
  entityId: string
): Promise<UploadUrlResponse> {
  const payload: any = {
    fileName,
    fileSize,
    contentType,
  };

  // Add entity-specific ID field
  payload[`${entityType.slice(0, -1)}Id`] = entityId; // Remove 's' from plural

  return apiPost<UploadUrlResponse>('/commands/sync/upload-url', payload);
}

/**
 * Upload file (complete flow)
 * Step 1: Get upload URL
 * Step 2: Upload to presigned URL
 * Step 3: Return file entity
 */
export async function uploadFile(
  file: File,
  entityType: FileEntityType,
  entityId: string
): Promise<FileEntity> {
  // Step 1: Get upload URL
  const { uploadUrl, fileId, token } = await getUploadUrl(
    file.name,
    file.size,
    file.type,
    entityType,
    entityId
  );

  // Step 2: Upload to presigned URL
  await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': file.type,
    },
    body: file,
  });

  // Step 3: Return file entity (we need to fetch it or construct it)
  // The API should return the file entity, but if not, we construct it
  return {
    id: fileId,
    filename: file.name,
    token: token,
    size: file.size,
    mimeType: file.type,
    url: `${API_BASE_URL}/queries/file/${token}/`, // Will need userId appended
    creator: {
      id: '',
      fullName: '',
    },
    createdAt: new Date().toISOString(),
  };
}

/**
 * Download file
 * GET /queries/file/{token}/{userId}
 */
export function getFileDownloadUrl(token: string, userId: string): string {
  return `${API_BASE_URL}/queries/file/${token}/${userId}`;
}

/**
 * Delete file
 * POST /commands/sync/delete-file
 */
export async function deleteFile(id: string, type: FileEntityType): Promise<void> {
  return apiPost('/commands/sync/delete-file', { id, type });
}


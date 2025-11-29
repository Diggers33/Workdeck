/**
 * Comments API Service
 * Based on Workdeck API Complete Reference Guide
 */

import { apiGet, apiPost } from './apiClient';

// ==================== Types ====================

export type CommentEntityType = 'project' | 'task' | 'activity' | 'expense' | 'purchase';

export interface CommentsEntity {
  id: string;
  entityId: string;

  creator: {
    id: string;
    fullName: string;
  };

  createdAt: string; // DateTime
  updatedAt: string; // DateTime (as 'updatedAtDB')

  text: string;
  state: number;

  reply?: CommentsEntity;

  mentions: {
    id: string;
    fullName: string;
  }[];
}

// ==================== API Functions ====================

/**
 * Get comments by entity
 * GET /queries/comments/{entityType}/{entityId}
 */
export async function getComments(
  entityType: CommentEntityType,
  entityId: string
): Promise<CommentsEntity[]> {
  return apiGet<CommentsEntity[]>(`/queries/comments/${entityType}/${entityId}`);
}

/**
 * Create comment
 * POST /commands/sync/{entityType}/create-comment
 */
export async function createComment(
  entityType: CommentEntityType,
  comment: {
    entityId: string;
    text: string;
    reply?: { id: string };
    mentions?: { id: string }[];
  }
): Promise<CommentsEntity> {
  return apiPost<CommentsEntity>(`/commands/sync/${entityType}/create-comment`, comment);
}

/**
 * Update comment
 * POST /commands/sync/update-comment
 */
export async function updateComment(
  id: string,
  text: string,
  mentions?: { id: string }[]
): Promise<void> {
  return apiPost('/commands/sync/update-comment', { id, text, mentions });
}

/**
 * Delete comment
 * POST /commands/sync/delete-comment
 */
export async function deleteComment(id: string): Promise<void> {
  return apiPost('/commands/sync/delete-comment', { id });
}


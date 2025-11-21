import { apiClient } from './client';

export interface Comment {
  id: number;
  photo_id: number;
  user_id: number;
  user_name: string;
  user_avatar?: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface CreateCommentRequest {
  photo_id: number;
  content: string;
}

export const commentService = {
  /**
   * Get comments for a photo
   */
  async getPhotoComments(photoId: number): Promise<Comment[]> {
    return apiClient.get<Comment[]>(`/v2/comments/photos/${photoId}`);
  },

  /**
   * Add a comment to a photo
   */
  async addComment(data: CreateCommentRequest): Promise<Comment> {
    return apiClient.post<Comment>('/v2/comments', data);
  },

  /**
   * Update a comment
   */
  async updateComment(commentId: number, content: string): Promise<Comment> {
    return apiClient.patch<Comment>(`/v2/comments/${commentId}`, { content });
  },

  /**
   * Delete a comment
   */
  async deleteComment(commentId: number): Promise<void> {
    return apiClient.delete<void>(`/v2/comments/${commentId}`);
  },
};

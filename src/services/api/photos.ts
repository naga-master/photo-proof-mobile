import { apiClient } from './client';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';

export interface Photo {
  id: number;
  project_id: number;
  folder_id?: number;
  filename: string;
  original_filename: string;
  file_path: string;
  file_size: number;
  mime_type: string;
  width?: number;
  height?: number;
  order_index: number;
  is_favorite: boolean;
  is_selected: boolean;
  created_at: string;
  updated_at: string;
  status?: 'pending' | 'uploading' | 'processing' | 'completed' | 'failed';
  processing_error?: string;
  processing_attempts?: number;
  last_processing_attempt_at?: string;
}

export interface PhotoUploadProgress {
  id: string;
  filename: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

export const photoService = {
  /**
   * Get photos for a project
   */
  async getProjectPhotos(
    projectId: number,
    params?: {
      folder_id?: number;
      limit?: number;
      offset?: number;
    }
  ): Promise<Photo[]> {
    return apiClient.get<Photo[]>(`/v2/photos/projects/${projectId}/photos`, params as any);
  },

  /**
   * Get a single photo
   */
  async getPhoto(photoId: number): Promise<Photo> {
    return apiClient.get<Photo>(`/v2/photos/${photoId}`);
  },

  /**
   * Upload a photo
   */
  async uploadPhoto(
    projectId: number,
    fileUri: string,
    fileName: string,
    folderId?: number,
    onProgress?: (progress: number) => void
  ): Promise<Photo> {
    // Create form data
    const formData = new FormData();
    
    // Add the file
    const file = {
      uri: fileUri,
      name: fileName,
      type: 'image/jpeg',
    } as any;
    
    formData.append('file', file);
    formData.append('project_id', projectId.toString());
    
    if (folderId) {
      formData.append('folder_id', folderId.toString());
    }

    // Upload with progress
    return apiClient.upload('/v2/upload', formData, onProgress);
  },

  /**
   * Upload multiple photos
   */
  async uploadPhotos(
    projectId: number,
    photos: Array<{ uri: string; name: string }>,
    folderId?: number,
    onBatchProgress?: (completed: number, total: number) => void,
    onPhotoProgress?: (photoId: string, progress: number) => void
  ): Promise<Photo[]> {
    const results: Photo[] = [];
    
    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      
      try {
        const result = await this.uploadPhoto(
          projectId,
          photo.uri,
          photo.name,
          folderId,
          (progress) => {
            onPhotoProgress?.(photo.uri, progress);
          }
        );
        
        results.push(result);
        onBatchProgress?.(i + 1, photos.length);
      } catch (error) {
        console.error(`Failed to upload ${photo.name}:`, error);
        // Continue with next photo
      }
    }
    
    return results;
  },

  /**
   * Delete a photo
   */
  async deletePhoto(photoId: number): Promise<void> {
    return apiClient.delete<void>(`/v2/photos/${photoId}`);
  },

  /**
   * Toggle photo favorite
   */
  async toggleFavorite(photoId: number): Promise<Photo> {
    return apiClient.post<Photo>(`/v2/photos/${photoId}/favorite`);
  },

  /**
   * Update photo
   */
  async updatePhoto(photoId: number, data: { order_index?: number; folder_id?: number }): Promise<Photo> {
    return apiClient.patch<Photo>(`/v2/photos/${photoId}`, data);
  },

  /**
   * Get photo URL for display
   */
  getPhotoUrl(photoId: number, quality: 'thumbnail' | 'small' | 'medium' | 'large' | 'original' = 'medium'): string {
    const baseUrl = apiClient.getBaseUrl();
    return `${baseUrl}/uploads/photos/${photoId}/variants/${quality}`;
  },

  /**
   * Generate thumbnail locally before upload
   */
  async generateThumbnail(uri: string, width: number = 300): Promise<string> {
    try {
      const manipResult = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width } }],
        { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
      );
      
      return manipResult.uri;
    } catch (error) {
      console.error('Failed to generate thumbnail:', error);
      return uri;
    }
  },

  /**
   * Download photo to device
   */
  async downloadPhoto(photoId: number, quality: 'medium' | 'large' | 'original' = 'original'): Promise<string> {
    const url = this.getPhotoUrl(photoId, quality);
    const filename = `photo_${photoId}_${quality}.jpg`;
    const downloadPath = `${FileSystem.documentDirectory}${filename}`;
    
    const downloadResumable = FileSystem.createDownloadResumable(
      url,
      downloadPath,
      {}
    );
    
    const result = await downloadResumable.downloadAsync();
    
    if (result) {
      return result.uri;
    }
    
    throw new Error('Download failed');
  },

  /**
   * Get photos with processing issues for current user
   */
  async getProcessingIssues(): Promise<{
    total_failed: number;
    photos: Array<{
      id: number;
      project_id: number;
      filename: string;
      error: string;
      uploaded_at: string;
      last_attempt: string;
      attempts: number;
    }>;
  }> {
    return apiClient.get('/v2/photos/processing-issues');
  },
};

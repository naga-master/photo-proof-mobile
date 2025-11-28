/**
 * Photos Hook - Photo data fetching and management
 */

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/services/api/client';
import type { Photo } from '@/types';

interface UsePhotosOptions {
  projectId: string;
  folderId?: string | null;
  autoFetch?: boolean;
}

interface UsePhotosResult {
  photos: Photo[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  toggleFavorite: (photoId: string) => Promise<void>;
}

export function usePhotos({ projectId, folderId, autoFetch = true }: UsePhotosOptions): UsePhotosResult {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPhotos = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const endpoint = folderId
        ? `/api/projects/${projectId}/folders/${folderId}/photos`
        : `/api/projects/${projectId}/photos`;
      
      const response = await apiClient.get<{ photos: Photo[] }>(endpoint);
      setPhotos(response.photos || []);
    } catch (err: any) {
      setError(err.detail || 'Failed to fetch photos');
    } finally {
      setIsLoading(false);
    }
  }, [projectId, folderId]);

  useEffect(() => {
    if (autoFetch && projectId) {
      fetchPhotos();
    }
  }, [fetchPhotos, autoFetch, projectId]);

  const toggleFavorite = useCallback(async (photoId: string) => {
    try {
      await apiClient.post(`/api/photos/${photoId}/favorite`);
      setPhotos((prev) =>
        prev.map((p) => (p.id === photoId ? { ...p, is_favorite: !p.is_favorite } : p))
      );
    } catch (err: any) {
      console.error('Failed to toggle favorite:', err);
    }
  }, []);

  return {
    photos,
    isLoading,
    error,
    refetch: fetchPhotos,
    toggleFavorite,
  };
}

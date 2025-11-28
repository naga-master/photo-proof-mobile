/**
 * Projects Hook - Project data fetching and management
 */

import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '@/services/api/client';
import type { Project } from '@/types';

interface UseProjectsOptions {
  autoFetch?: boolean;
  clientId?: string;
}

interface UseProjectsResult {
  projects: Project[];
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  createProject: (title: string, clientId?: string) => Promise<Project | null>;
  deleteProject: (projectId: string) => Promise<boolean>;
}

export function useProjects({ autoFetch = true, clientId }: UseProjectsOptions = {}): UseProjectsResult {
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const endpoint = clientId 
        ? `/api/projects/?client_id=${clientId}` 
        : '/api/projects/';
      
      const response = await apiClient.get<{ projects: Project[]; total: number }>(endpoint);
      setProjects(response.projects || []);
    } catch (err: any) {
      setError(err.detail || 'Failed to fetch projects');
    } finally {
      setIsLoading(false);
    }
  }, [clientId]);

  useEffect(() => {
    if (autoFetch) {
      fetchProjects();
    }
  }, [fetchProjects, autoFetch]);

  const createProject = useCallback(async (title: string, projectClientId?: string): Promise<Project | null> => {
    try {
      const response = await apiClient.post<Project>('/api/projects/', {
        title,
        client_id: projectClientId,
      });
      setProjects((prev) => [response, ...prev]);
      return response;
    } catch (err: any) {
      console.error('Failed to create project:', err);
      return null;
    }
  }, []);

  const deleteProject = useCallback(async (projectId: string): Promise<boolean> => {
    try {
      await apiClient.delete(`/api/projects/${projectId}`);
      setProjects((prev) => prev.filter((p) => p.id !== projectId));
      return true;
    } catch (err: any) {
      console.error('Failed to delete project:', err);
      return false;
    }
  }, []);

  return {
    projects,
    isLoading,
    error,
    refetch: fetchProjects,
    createProject,
    deleteProject,
  };
}

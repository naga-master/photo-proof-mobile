import { apiClient } from './client';

export interface Project {
  id: number;
  title: string;
  client_id?: number;
  shoot_date?: string;
  cover_photo_id?: number;
  cover_photo_src?: string;
  photo_count: number;
  is_locked: boolean;
  layout?: string;
  payment_status?: string;
  price?: number;
  package_id?: number;
  status?: string;
  created_at: string;
  updated_at: string;
  has_folders?: boolean;
  client_name?: string;
}

export interface Folder {
  id: number;
  project_id: number;
  name: string;
  photo_count: number;
  created_at: string;
}

export interface CreateProjectRequest {
  title: string;
  client_id?: number;
  shoot_date?: string;
  layout?: string;
  package_id?: number;
}

export interface UpdateProjectRequest {
  title?: string;
  shoot_date?: string;
  layout?: string;
  cover_photo_id?: number;
  is_locked?: boolean;
  payment_status?: string;
  price?: number;
}

export const projectService = {
  /**
   * Get all projects
   */
  async getProjects(params?: {
    client_id?: number;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<Project[]> {
    const response = await apiClient.get<Project[]>('/api/projects', params as any);
    return response;
  },

  /**
   * Get a single project by ID
   */
  async getProject(projectId: number): Promise<Project> {
    return apiClient.get<Project>(`/api/projects/${projectId}`);
  },

  /**
   * Create a new project
   */
  async createProject(data: CreateProjectRequest): Promise<Project> {
    return apiClient.post<Project>('/api/projects', data);
  },

  /**
   * Update a project
   */
  async updateProject(projectId: number, data: UpdateProjectRequest): Promise<Project> {
    return apiClient.patch<Project>(`/api/projects/${projectId}`, data);
  },

  /**
   * Delete a project
   */
  async deleteProject(projectId: number): Promise<void> {
    return apiClient.delete<void>(`/api/projects/${projectId}`);
  },

  /**
   * Get project folders
   */
  async getProjectFolders(projectId: number): Promise<Folder[]> {
    return apiClient.get<Folder[]>(`/api/projects/${projectId}/folders`);
  },

  /**
   * Get cover photo URL with variant
   */
  getCoverPhotoUrl(project: Project, quality: 'thumbnail' | 'small' | 'medium' | 'large' = 'medium'): string {
    if (!project.cover_photo_id) {
      return 'https://via.placeholder.com/400x600?text=No+Cover+Photo';
    }
    
    const baseUrl = apiClient.getBaseUrl();
    return `${baseUrl}/uploads/photos/${project.cover_photo_id}/variants/${quality}`;
  },
};

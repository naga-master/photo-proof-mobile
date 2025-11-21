import { apiClient } from './client';

export interface Client {
  id: number;
  studio_id: number;
  name: string;
  email: string;
  username?: string;
  phone?: string;
  address?: string;
  is_active: boolean;
  user_id?: number;
  avatar_url?: string;
  profile_picture?: string;
  whatsapp_opt_in?: boolean;
  email_opt_in?: boolean;
  total_projects?: number;
  created_at: string;
  updated_at: string;
}

export interface CreateClientRequest {
  name: string;
  email: string;
  phone?: string;
  address?: string;
  whatsapp_opt_in?: boolean;
  email_opt_in?: boolean;
}

export interface UpdateClientRequest {
  name?: string;
  email?: string;
  phone?: string;
  address?: string;
  is_active?: boolean;
  whatsapp_opt_in?: boolean;
  email_opt_in?: boolean;
}

export const clientService = {
  /**
   * Get all clients
   */
  async getClients(params?: {
    search?: string;
    is_active?: boolean;
    limit?: number;
    offset?: number;
  }): Promise<Client[]> {
    return apiClient.get<Client[]>('/v2/clients', params as any);
  },

  /**
   * Get a single client
   */
  async getClient(clientId: number): Promise<Client> {
    return apiClient.get<Client>(`/v2/clients/${clientId}`);
  },

  /**
   * Create a new client
   */
  async createClient(data: CreateClientRequest): Promise<Client> {
    return apiClient.post<Client>('/v2/clients', data);
  },

  /**
   * Update a client
   */
  async updateClient(clientId: number, data: UpdateClientRequest): Promise<Client> {
    return apiClient.patch<Client>(`/v2/clients/${clientId}`, data);
  },

  /**
   * Delete a client
   */
  async deleteClient(clientId: number): Promise<void> {
    return apiClient.delete<void>(`/v2/clients/${clientId}`);
  },

  /**
   * Get client's projects
   */
  async getClientProjects(clientId: number) {
    return apiClient.get(`/v2/clients/${clientId}/projects`);
  },

  /**
   * Search clients
   */
  async searchClients(query: string): Promise<Client[]> {
    return apiClient.get<Client[]>('/v2/clients', { search: query } as any);
  },
};

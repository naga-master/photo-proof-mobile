import { apiClient } from './client';
import { storage } from '@/utils/storage';

interface LoginRequest {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
    studio_id?: string;
    client_id?: string;
    avatar?: string;
  };
}

interface RegisterRequest {
  email: string;
  password: string;
  name: string;
  phone?: string;
}

export const authService = {
  async login(email: string, password: string, isStudio: boolean = false): Promise<LoginResponse> {
    const endpoint = isStudio ? '/api/auth/studio/login' : '/api/auth/client/login';
    
    console.log('🔐 Login attempt:', { endpoint, username: email });
    
    const response = await apiClient.post<LoginResponse>(endpoint, {
      username: email,  // Backend expects 'username', not 'email'
      password,
    });

    // Store tokens
    if (response.token) {
      await storage.setItem('auth_token', response.token);
    }
    if (response.refresh_token) {
      await storage.setItem('refresh_token', response.refresh_token);
    }

    return response;
  },

  async register(data: RegisterRequest): Promise<LoginResponse> {
    const response = await apiClient.post<LoginResponse>('/api/auth/register', data);
    
    // Store tokens
    if (response.token) {
      await storage.setItem('auth_token', response.token);
    }
    if (response.refresh_token) {
      await storage.setItem('refresh_token', response.refresh_token);
    }

    return response;
  },

  async logout(): Promise<void> {
    try {
      await apiClient.post('/api/auth/logout');
    } catch (error) {
      // Ignore logout errors
      console.log('Logout API error:', error);
    }
  },

  async refreshToken(): Promise<string> {
    const refreshToken = await storage.getItem('refresh_token');
    
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post<{ token: string; refresh_token: string }>(
      '/api/auth/refresh',
      { refresh_token: refreshToken }
    );

    // Store new tokens
    await storage.setItem('auth_token', response.token);
    await storage.setItem('refresh_token', response.refresh_token);

    return response.token;
  },

  async validateToken(token: string): Promise<boolean> {
    try {
      await apiClient.get('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return true;
    } catch (error) {
      return false;
    }
  },

  async forgotPassword(email: string): Promise<void> {
    await apiClient.post('/api/auth/forgot-password', { email });
  },

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiClient.post('/api/auth/reset-password', {
      token,
      new_password: newPassword,
    });
  },

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiClient.post('/api/auth/change-password', {
      current_password: currentPassword,
      new_password: newPassword,
    });
  },
};

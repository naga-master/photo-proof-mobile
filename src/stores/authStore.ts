import { create } from 'zustand';
import { storage } from '@/utils/storage';
import { authService } from '@/services/api/auth';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'studio' | 'client';
  studioId?: string;
  clientId?: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  login: (email: string, password: string, isStudio?: boolean) => Promise<void>;
  logout: () => Promise<void>;
  initializeAuth: () => Promise<void>;
  updateUser: (user: Partial<User>) => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email: string, password: string, isStudio = false) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await authService.login(email, password, isStudio);
      
      const { user: userData, token } = response;
      
      // Transform user data to match User interface
      const user: User = {
        id: userData.id,
        email: userData.email,
        name: userData.name,
        role: userData.role as 'studio' | 'client',
        studioId: userData.studio_id,
        clientId: userData.client_id,
        avatar: userData.avatar,
      };
      
      // Store token securely
      await storage.setItem('auth_token', token);
      await storage.setItem('user_data', JSON.stringify(user));
      
      set({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: error.message || 'Login failed',
      });
      throw error;
    }
  },

  logout: async () => {
    try {
      // Clear secure storage
      await storage.removeItem('auth_token');
      await storage.removeItem('user_data');
      
      // Call logout API
      await authService.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      set({
        user: null,
        token: null,
        isAuthenticated: false,
        error: null,
      });
    }
  },

  initializeAuth: async () => {
    set({ isLoading: true });
    
    try {
      const token = await storage.getItem('auth_token');
      const userData = await storage.getItem('user_data');
      
      if (token && userData) {
        const user = JSON.parse(userData);
        
        // Validate token with backend
        const isValid = await authService.validateToken(token);
        
        if (isValid) {
          set({
            user,
            token,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          // Token invalid, clear auth
          await get().logout();
        }
      } else {
        set({ isLoading: false });
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      set({ isLoading: false });
    }
  },

  updateUser: (userData: Partial<User>) => {
    const currentUser = get().user;
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userData };
      set({ user: updatedUser });
      
      // Update stored user data
      storage.setItem('user_data', JSON.stringify(updatedUser));
    }
  },

  clearError: () => set({ error: null }),
}))

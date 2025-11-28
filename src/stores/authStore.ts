/**
 * Authentication Store with JWT and Biometrics support
 */

import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';

import { apiClient } from '../services/api/client';
import type { User, AuthResponse, LoginCredentials } from '../types';

// Storage keys
const BIOMETRICS_ENABLED_KEY = 'biometrics_enabled';
const STORED_USERNAME_KEY = 'stored_username';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  biometricsAvailable: boolean;
  biometricsEnabled: boolean;

  // Actions
  initialize: () => Promise<void>;
  studioLogin: (credentials: LoginCredentials) => Promise<void>;
  clientLogin: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  clearError: () => void;

  // Biometrics
  checkBiometrics: () => Promise<void>;
  enableBiometrics: (username: string) => Promise<void>;
  disableBiometrics: () => Promise<void>;
  loginWithBiometrics: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,
  error: null,
  biometricsAvailable: false,
  biometricsEnabled: false,

  initialize: async () => {
    console.log('[AuthStore] Initializing...');
    set({ isLoading: true });

    try {
      // Check biometrics availability
      await get().checkBiometrics();

      // Check for existing auth
      const isAuth = await apiClient.isAuthenticated();
      
      if (isAuth) {
        // Try to get stored user data
        const storedUser = await apiClient.getStoredUser();
        
        if (storedUser) {
          // Validate token by fetching current user
          try {
            const currentUser = await apiClient.get<User>('/api/auth/me');
            set({
              user: currentUser,
              isAuthenticated: true,
              isLoading: false,
              isInitialized: true,
            });
            console.log('[AuthStore] User restored:', currentUser.email);
            return;
          } catch (error) {
            console.log('[AuthStore] Token validation failed, clearing auth');
            await apiClient.clearAuth();
          }
        }
      }

      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
      });
      console.log('[AuthStore] No valid session found');
    } catch (error) {
      console.error('[AuthStore] Initialization error:', error);
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
        error: 'Failed to initialize authentication',
      });
    }
  },

  studioLogin: async (credentials: LoginCredentials) => {
    console.log('[AuthStore] Studio login attempt:', credentials.username);
    set({ isLoading: true, error: null });

    try {
      const response = await apiClient.post<AuthResponse>(
        '/api/auth/studio/login',
        credentials
      );

      await apiClient.setAuth(
        response.token,
        response.refresh_token,
        response.user
      );

      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      console.log('[AuthStore] Studio login successful:', response.user.email);
    } catch (error: any) {
      console.error('[AuthStore] Studio login failed:', error);
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error.detail || 'Invalid username or password',
      });
      throw error;
    }
  },

  clientLogin: async (credentials: LoginCredentials) => {
    console.log('[AuthStore] Client login attempt:', credentials.username);
    set({ isLoading: true, error: null });

    try {
      const response = await apiClient.post<AuthResponse>(
        '/api/auth/client/login',
        credentials
      );

      await apiClient.setAuth(
        response.token,
        response.refresh_token,
        response.user
      );

      set({
        user: response.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      console.log('[AuthStore] Client login successful:', response.user.email);
    } catch (error: any) {
      console.error('[AuthStore] Client login failed:', error);
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error.detail || 'Invalid username or password',
      });
      throw error;
    }
  },

  logout: async () => {
    console.log('[AuthStore] Logging out...');
    set({ isLoading: true });

    try {
      // Call logout API to clear server-side session
      await apiClient.post('/api/auth/logout');
    } catch (error) {
      console.error('[AuthStore] Logout API error:', error);
    } finally {
      // Always clear local auth
      await apiClient.clearAuth();
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
      console.log('[AuthStore] Logout complete');
    }
  },

  refreshUser: async () => {
    if (!get().isAuthenticated) return;

    try {
      const currentUser = await apiClient.get<User>('/api/auth/me');
      set({ user: currentUser });
      console.log('[AuthStore] User refreshed:', currentUser.email);
    } catch (error) {
      console.error('[AuthStore] Failed to refresh user:', error);
    }
  },

  clearError: () => {
    set({ error: null });
  },

  // Biometrics support
  checkBiometrics: async () => {
    try {
      const hasHardware = await LocalAuthentication.hasHardwareAsync();
      const isEnrolled = await LocalAuthentication.isEnrolledAsync();
      const biometricsAvailable = hasHardware && isEnrolled;

      // Check if biometrics was enabled by user
      const biometricsEnabledStr = await SecureStore.getItemAsync(BIOMETRICS_ENABLED_KEY);
      const biometricsEnabled = biometricsEnabledStr === 'true' && biometricsAvailable;

      set({ biometricsAvailable, biometricsEnabled });

      console.log('[AuthStore] Biometrics check:', {
        hasHardware,
        isEnrolled,
        available: biometricsAvailable,
        enabled: biometricsEnabled,
      });
    } catch (error) {
      console.error('[AuthStore] Biometrics check failed:', error);
      set({ biometricsAvailable: false, biometricsEnabled: false });
    }
  },

  enableBiometrics: async (username: string) => {
    const { biometricsAvailable } = get();
    
    if (!biometricsAvailable) {
      throw new Error('Biometrics not available on this device');
    }

    // Authenticate first
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: 'Enable biometric login',
      cancelLabel: 'Cancel',
      disableDeviceFallback: false,
    });

    if (result.success) {
      await SecureStore.setItemAsync(BIOMETRICS_ENABLED_KEY, 'true');
      await SecureStore.setItemAsync(STORED_USERNAME_KEY, username);
      set({ biometricsEnabled: true });
      console.log('[AuthStore] Biometrics enabled for:', username);
    } else {
      throw new Error('Biometric authentication failed');
    }
  },

  disableBiometrics: async () => {
    await SecureStore.deleteItemAsync(BIOMETRICS_ENABLED_KEY);
    await SecureStore.deleteItemAsync(STORED_USERNAME_KEY);
    set({ biometricsEnabled: false });
    console.log('[AuthStore] Biometrics disabled');
  },

  loginWithBiometrics: async () => {
    const { biometricsEnabled, biometricsAvailable } = get();

    if (!biometricsAvailable || !biometricsEnabled) {
      throw new Error('Biometrics not available or not enabled');
    }

    set({ isLoading: true, error: null });

    try {
      // Authenticate with biometrics
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: 'Sign in with biometrics',
        cancelLabel: 'Cancel',
        disableDeviceFallback: false,
      });

      if (!result.success) {
        throw new Error('Biometric authentication failed');
      }

      // Check if we have a valid session
      const isAuth = await apiClient.isAuthenticated();
      
      if (isAuth) {
        const currentUser = await apiClient.get<User>('/api/auth/me');
        set({
          user: currentUser,
          isAuthenticated: true,
          isLoading: false,
        });
        console.log('[AuthStore] Biometric login successful:', currentUser.email);
      } else {
        // No valid session, need to login with credentials
        throw new Error('Session expired. Please login with your credentials.');
      }
    } catch (error: any) {
      console.error('[AuthStore] Biometric login failed:', error);
      set({
        isLoading: false,
        error: error.message || 'Biometric login failed',
      });
      throw error;
    }
  },
}));

// Helper hooks
export const useAuth = () => {
  const store = useAuthStore();
  return {
    user: store.user,
    isAuthenticated: store.isAuthenticated,
    isLoading: store.isLoading,
    isInitialized: store.isInitialized,
    error: store.error,
    isStudioUser: store.user?.role?.startsWith('studio') ?? false,
    isClientUser: store.user?.role === 'client',
  };
};

export const useBiometrics = () => {
  const store = useAuthStore();
  return {
    available: store.biometricsAvailable,
    enabled: store.biometricsEnabled,
    enable: store.enableBiometrics,
    disable: store.disableBiometrics,
    login: store.loginWithBiometrics,
  };
};

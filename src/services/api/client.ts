/**
 * API Client with interceptors, token refresh, and offline queue support
 */

import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosError,
  InternalAxiosRequestConfig,
} from 'axios';
import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';

import type { ApiError } from '../../types';

// Storage key for offline queue
const OFFLINE_QUEUE_KEY = '@offline_queue';

// API Configuration
const getApiUrl = (): string => {
  if (__DEV__) {
    return Platform.select({
      ios: 'http://localhost:8000',
      android: 'http://10.0.2.2:8000',
      default: 'http://localhost:8000',
    }) as string;
  }
  return 'https://api.photoproof.com';
};

// Offline queue item type
interface QueuedRequest {
  id: string;
  method: string;
  url: string;
  data?: any;
  headers?: Record<string, string>;
  timestamp: number;
  retryCount: number;
}

// Token storage keys
const TOKEN_KEY = 'auth_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_DATA_KEY = 'user_data';

class ApiClient {
  private instance: AxiosInstance;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: any) => void;
  }> = [];
  private offlineQueue: QueuedRequest[] = [];
  private isOnline = true;

  constructor() {
    const baseURL = getApiUrl();
    console.log('[ApiClient] Initializing with baseURL:', baseURL);

    this.instance = axios.create({
      baseURL,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    this.setupInterceptors();
    this.setupNetworkListener();
    this.loadOfflineQueue();
  }

  private setupInterceptors(): void {
    // Request interceptor - Add auth token
    this.instance.interceptors.request.use(
      async (config: InternalAxiosRequestConfig) => {
        console.log('[ApiClient] Request:', config.method?.toUpperCase(), config.url);

        // Check if online
        if (!this.isOnline && config.method !== 'get') {
          // Queue non-GET requests when offline
          const queueId = this.queueRequest(config);
          return Promise.reject({
            isOfflineQueued: true,
            queueId,
            message: 'Request queued for offline sync',
          });
        }

        try {
          const token = await SecureStore.getItemAsync(TOKEN_KEY);
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.warn('[ApiClient] Failed to get auth token:', error);
        }

        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor - Handle errors and token refresh
    this.instance.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<ApiError>) => {
        const originalRequest = error.config as InternalAxiosRequestConfig & {
          _retry?: boolean;
        };

        // Handle 401 - Token expired
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                originalRequest.headers.Authorization = `Bearer ${token}`;
                return this.instance(originalRequest);
              })
              .catch((err) => Promise.reject(err));
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const refreshToken = await SecureStore.getItemAsync(REFRESH_TOKEN_KEY);
            if (!refreshToken) {
              throw new Error('No refresh token available');
            }

            const response = await this.instance.post('/api/auth/refresh', {
              refresh_token: refreshToken,
            });

            const { token, refresh_token } = response.data;

            await SecureStore.setItemAsync(TOKEN_KEY, token);
            if (refresh_token) {
              await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refresh_token);
            }

            this.processQueue(null, token);

            originalRequest.headers.Authorization = `Bearer ${token}`;
            return this.instance(originalRequest);
          } catch (refreshError) {
            this.processQueue(refreshError, null);
            await this.clearAuth();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        // Handle network errors
        if (!error.response) {
          console.error('[ApiClient] Network error:', error.message);
        }

        return Promise.reject(this.formatError(error));
      }
    );
  }

  private setupNetworkListener(): void {
    NetInfo.addEventListener((state: NetInfoState) => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected ?? false;

      console.log('[ApiClient] Network status:', this.isOnline ? 'online' : 'offline');

      // Process offline queue when coming back online
      if (wasOffline && this.isOnline) {
        this.processOfflineQueue();
      }
    });
  }

  private processQueue(error: any, token: string | null = null): void {
    this.failedQueue.forEach((prom) => {
      if (error) {
        prom.reject(error);
      } else {
        prom.resolve(token!);
      }
    });
    this.failedQueue = [];
  }

  private formatError(error: AxiosError<ApiError>): ApiError {
    if (error.response?.data) {
      return {
        detail: error.response.data.detail || 'An error occurred',
        status_code: error.response.status,
        errors: error.response.data.errors,
      };
    }
    return {
      detail: error.message || 'Network error',
      status_code: error.response?.status,
    };
  }

  // Offline Queue Management
  private queueRequest(config: InternalAxiosRequestConfig): string {
    const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const queuedRequest: QueuedRequest = {
      id,
      method: config.method || 'get',
      url: config.url || '',
      data: config.data,
      headers: config.headers as Record<string, string>,
      timestamp: Date.now(),
      retryCount: 0,
    };

    this.offlineQueue.push(queuedRequest);
    this.saveOfflineQueue();

    console.log('[ApiClient] Request queued:', id);
    return id;
  }

  private async saveOfflineQueue(): Promise<void> {
    try {
      await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(this.offlineQueue));
    } catch (error) {
      console.error('[ApiClient] Failed to save offline queue:', error);
    }
  }

  private async loadOfflineQueue(): Promise<void> {
    try {
      const queueData = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
      if (queueData) {
        this.offlineQueue = JSON.parse(queueData);
        console.log('[ApiClient] Loaded offline queue:', this.offlineQueue.length, 'items');
      }
    } catch (error) {
      console.error('[ApiClient] Failed to load offline queue:', error);
      this.offlineQueue = [];
    }
  }

  private async processOfflineQueue(): Promise<void> {
    if (this.offlineQueue.length === 0) return;

    console.log('[ApiClient] Processing offline queue:', this.offlineQueue.length, 'items');

    const queue = [...this.offlineQueue];
    this.offlineQueue = [];

    for (const request of queue) {
      try {
        await this.instance.request({
          method: request.method,
          url: request.url,
          data: request.data,
          headers: request.headers,
        });
        console.log('[ApiClient] Queued request succeeded:', request.id);
      } catch (error) {
        console.error('[ApiClient] Queued request failed:', request.id, error);
        if (request.retryCount < 3) {
          request.retryCount++;
          this.offlineQueue.push(request);
        }
      }
    }

    this.saveOfflineQueue();
  }

  // Auth helpers
  async clearAuth(): Promise<void> {
    try {
      await SecureStore.deleteItemAsync(TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
      await SecureStore.deleteItemAsync(USER_DATA_KEY);
    } catch (error) {
      console.error('[ApiClient] Failed to clear auth:', error);
    }
  }

  async setAuth(token: string, refreshToken?: string, userData?: any): Promise<void> {
    try {
      await SecureStore.setItemAsync(TOKEN_KEY, token);
      if (refreshToken) {
        await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
      }
      if (userData) {
        await SecureStore.setItemAsync(USER_DATA_KEY, JSON.stringify(userData));
      }
    } catch (error) {
      console.error('[ApiClient] Failed to set auth:', error);
    }
  }

  async getStoredUser(): Promise<any | null> {
    try {
      const userData = await SecureStore.getItemAsync(USER_DATA_KEY);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('[ApiClient] Failed to get stored user:', error);
      return null;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      const token = await SecureStore.getItemAsync(TOKEN_KEY);
      return !!token;
    } catch (error) {
      return false;
    }
  }

  // HTTP Methods
  async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.get<T>(url, config);
    return response.data;
  }

  async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.post<T>(url, data, config);
    return response.data;
  }

  async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.put<T>(url, data, config);
    return response.data;
  }

  async patch<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.patch<T>(url, data, config);
    return response.data;
  }

  async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.instance.delete<T>(url, config);
    return response.data;
  }

  async upload(
    url: string,
    formData: FormData,
    onProgress?: (progress: number) => void
  ): Promise<any> {
    const response = await this.instance.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      },
    });
    return response.data;
  }

  // Utility methods
  getBaseUrl(): string {
    return getApiUrl();
  }

  isNetworkOnline(): boolean {
    return this.isOnline;
  }

  getPendingQueueCount(): number {
    return this.offlineQueue.length;
  }
}

// Export singleton instance
export const apiClient = new ApiClient();
export const API_BASE_URL = getApiUrl();

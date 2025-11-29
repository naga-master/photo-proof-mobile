/**
 * Offline Sync Service
 * Handles data persistence and synchronization
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { apiClient } from './api/client';

// Cache keys
const CACHE_KEYS = {
  PROJECTS: 'cached_projects',
  CLIENTS: 'cached_clients',
  USER: 'cached_user',
  LAST_SYNC: 'last_sync_timestamp',
} as const;

// Cache expiry (24 hours)
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000;

interface CachedData<T> {
  data: T;
  timestamp: number;
}

class OfflineSyncService {
  private isOnline = true;
  private syncInProgress = false;

  constructor() {
    this.setupNetworkListener();
  }

  private setupNetworkListener(): void {
    NetInfo.addEventListener((state: NetInfoState) => {
      const wasOffline = !this.isOnline;
      this.isOnline = state.isConnected ?? false;

      if (wasOffline && this.isOnline) {
        console.log('[OfflineSync] Back online, triggering sync');
        this.syncAll();
      }
    });
  }

  // Cache data with timestamp
  async cacheData<T>(key: string, data: T): Promise<void> {
    const cached: CachedData<T> = {
      data,
      timestamp: Date.now(),
    };
    await AsyncStorage.setItem(key, JSON.stringify(cached));
  }

  // Get cached data if not expired
  async getCachedData<T>(key: string): Promise<T | null> {
    try {
      const raw = await AsyncStorage.getItem(key);
      if (!raw) return null;

      const cached: CachedData<T> = JSON.parse(raw);
      const isExpired = Date.now() - cached.timestamp > CACHE_EXPIRY_MS;

      if (isExpired) {
        await AsyncStorage.removeItem(key);
        return null;
      }

      return cached.data;
    } catch {
      return null;
    }
  }

  // Clear specific cache
  async clearCache(key: string): Promise<void> {
    await AsyncStorage.removeItem(key);
  }

  // Clear all cached data
  async clearAllCache(): Promise<void> {
    await Promise.all(Object.values(CACHE_KEYS).map((key) => AsyncStorage.removeItem(key)));
  }

  // Cache projects
  async cacheProjects(): Promise<void> {
    try {
      const response = await apiClient.get<{ projects: any[] }>('/api/projects/');
      await this.cacheData(CACHE_KEYS.PROJECTS, response.projects);
      console.log('[OfflineSync] Projects cached');
    } catch (error) {
      console.error('[OfflineSync] Failed to cache projects:', error);
    }
  }

  // Get cached projects
  async getCachedProjects(): Promise<any[] | null> {
    return this.getCachedData<any[]>(CACHE_KEYS.PROJECTS);
  }

  // Cache clients
  async cacheClients(): Promise<void> {
    try {
      const response = await apiClient.get<{ clients: any[] }>('/v2/clients');
      await this.cacheData(CACHE_KEYS.CLIENTS, response.clients);
      console.log('[OfflineSync] Clients cached');
    } catch (error) {
      console.error('[OfflineSync] Failed to cache clients:', error);
    }
  }

  // Get cached clients
  async getCachedClients(): Promise<any[] | null> {
    return this.getCachedData<any[]>(CACHE_KEYS.CLIENTS);
  }

  // Sync all data
  async syncAll(): Promise<void> {
    if (this.syncInProgress || !this.isOnline) return;

    this.syncInProgress = true;
    console.log('[OfflineSync] Starting full sync');

    try {
      await Promise.all([
        this.cacheProjects(),
        this.cacheClients(),
      ]);

      await AsyncStorage.setItem(CACHE_KEYS.LAST_SYNC, Date.now().toString());
      console.log('[OfflineSync] Full sync completed');
    } catch (error) {
      console.error('[OfflineSync] Sync failed:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  // Get last sync timestamp
  async getLastSyncTime(): Promise<Date | null> {
    const timestamp = await AsyncStorage.getItem(CACHE_KEYS.LAST_SYNC);
    return timestamp ? new Date(parseInt(timestamp, 10)) : null;
  }

  // Check if device is online
  isDeviceOnline(): boolean {
    return this.isOnline;
  }

  // Get sync status
  isSyncing(): boolean {
    return this.syncInProgress;
  }
}

export const offlineSyncService = new OfflineSyncService();

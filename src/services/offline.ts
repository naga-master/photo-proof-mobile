/**
 * Offline Sync Service
 * Handles data persistence and synchronization
 */

import { MMKV } from 'react-native-mmkv';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { apiClient } from './api/client';

// Storage instance
const storage = new MMKV({ id: 'offline-data' });

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
  cacheData<T>(key: string, data: T): void {
    const cached: CachedData<T> = {
      data,
      timestamp: Date.now(),
    };
    storage.set(key, JSON.stringify(cached));
  }

  // Get cached data if not expired
  getCachedData<T>(key: string): T | null {
    try {
      const raw = storage.getString(key);
      if (!raw) return null;

      const cached: CachedData<T> = JSON.parse(raw);
      const isExpired = Date.now() - cached.timestamp > CACHE_EXPIRY_MS;

      if (isExpired) {
        storage.delete(key);
        return null;
      }

      return cached.data;
    } catch {
      return null;
    }
  }

  // Clear specific cache
  clearCache(key: string): void {
    storage.delete(key);
  }

  // Clear all cached data
  clearAllCache(): void {
    Object.values(CACHE_KEYS).forEach((key) => storage.delete(key));
  }

  // Cache projects
  async cacheProjects(): Promise<void> {
    try {
      const response = await apiClient.get<{ projects: any[] }>('/api/projects/');
      this.cacheData(CACHE_KEYS.PROJECTS, response.projects);
      console.log('[OfflineSync] Projects cached');
    } catch (error) {
      console.error('[OfflineSync] Failed to cache projects:', error);
    }
  }

  // Get cached projects
  getCachedProjects(): any[] | null {
    return this.getCachedData<any[]>(CACHE_KEYS.PROJECTS);
  }

  // Cache clients
  async cacheClients(): Promise<void> {
    try {
      const response = await apiClient.get<{ clients: any[] }>('/v2/clients');
      this.cacheData(CACHE_KEYS.CLIENTS, response.clients);
      console.log('[OfflineSync] Clients cached');
    } catch (error) {
      console.error('[OfflineSync] Failed to cache clients:', error);
    }
  }

  // Get cached clients
  getCachedClients(): any[] | null {
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

      storage.set(CACHE_KEYS.LAST_SYNC, Date.now().toString());
      console.log('[OfflineSync] Full sync completed');
    } catch (error) {
      console.error('[OfflineSync] Sync failed:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  // Get last sync timestamp
  getLastSyncTime(): Date | null {
    const timestamp = storage.getString(CACHE_KEYS.LAST_SYNC);
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

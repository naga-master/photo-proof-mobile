/**
 * Global App Store for application-wide state
 */

import { create } from 'zustand';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { MMKV } from 'react-native-mmkv';

import { apiClient } from '../services/api/client';

// Storage for app preferences
const storage = new MMKV({ id: 'app-storage' });

// Storage keys
const ONBOARDING_COMPLETE_KEY = 'onboarding_complete';
const LAST_SYNC_KEY = 'last_sync';

interface AppState {
  // Network state
  isOnline: boolean;
  connectionType: string | null;

  // App state
  isInitialized: boolean;
  isOnboardingComplete: boolean;
  lastSyncTimestamp: number | null;

  // Sync state
  isSyncing: boolean;
  pendingSyncCount: number;
  syncError: string | null;

  // Actions
  initialize: () => Promise<void>;
  setOnboardingComplete: (complete: boolean) => void;
  checkConnectivity: () => Promise<void>;
  syncData: () => Promise<void>;
  updatePendingSyncCount: () => void;
}

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  isOnline: true,
  connectionType: null,
  isInitialized: false,
  isOnboardingComplete: false,
  lastSyncTimestamp: null,
  isSyncing: false,
  pendingSyncCount: 0,
  syncError: null,

  initialize: async () => {
    console.log('[AppStore] Initializing...');

    try {
      // Load persisted state
      const onboardingComplete = storage.getBoolean(ONBOARDING_COMPLETE_KEY) ?? false;
      const lastSync = storage.getNumber(LAST_SYNC_KEY) ?? null;

      // Check network connectivity
      await get().checkConnectivity();

      // Update pending sync count
      get().updatePendingSyncCount();

      // Set up network listener
      NetInfo.addEventListener((state: NetInfoState) => {
        const wasOffline = !get().isOnline;
        const isNowOnline = state.isConnected ?? false;

        set({
          isOnline: isNowOnline,
          connectionType: state.type,
        });

        // Auto-sync when coming back online
        if (wasOffline && isNowOnline) {
          console.log('[AppStore] Back online, triggering sync...');
          get().syncData();
        }
      });

      set({
        isInitialized: true,
        isOnboardingComplete: onboardingComplete,
        lastSyncTimestamp: lastSync,
      });

      console.log('[AppStore] Initialized successfully');
    } catch (error) {
      console.error('[AppStore] Initialization error:', error);
      set({ isInitialized: true }); // Still mark as initialized to prevent blocking
    }
  },

  setOnboardingComplete: (complete: boolean) => {
    storage.set(ONBOARDING_COMPLETE_KEY, complete);
    set({ isOnboardingComplete: complete });
    console.log('[AppStore] Onboarding complete:', complete);
  },

  checkConnectivity: async () => {
    try {
      const state = await NetInfo.fetch();
      set({
        isOnline: state.isConnected ?? false,
        connectionType: state.type,
      });
      console.log('[AppStore] Network status:', state.isConnected ? 'online' : 'offline');
    } catch (error) {
      console.error('[AppStore] Failed to check connectivity:', error);
    }
  },

  syncData: async () => {
    const { isOnline, isSyncing } = get();

    if (!isOnline || isSyncing) {
      console.log('[AppStore] Sync skipped:', { isOnline, isSyncing });
      return;
    }

    set({ isSyncing: true, syncError: null });

    try {
      console.log('[AppStore] Starting data sync...');

      // The API client handles offline queue processing internally
      // This is where we would add additional sync logic

      const now = Date.now();
      storage.set(LAST_SYNC_KEY, now);

      set({
        isSyncing: false,
        lastSyncTimestamp: now,
        syncError: null,
      });

      get().updatePendingSyncCount();

      console.log('[AppStore] Sync completed successfully');
    } catch (error: any) {
      console.error('[AppStore] Sync failed:', error);
      set({
        isSyncing: false,
        syncError: error.message || 'Sync failed',
      });
    }
  },

  updatePendingSyncCount: () => {
    const count = apiClient.getPendingQueueCount();
    set({ pendingSyncCount: count });
  },
}));

// Helper hooks
export const useNetworkStatus = () => {
  const { isOnline, connectionType } = useAppStore();
  return { isOnline, connectionType };
};

export const useSyncStatus = () => {
  const { isSyncing, pendingSyncCount, lastSyncTimestamp, syncError } = useAppStore();
  return { isSyncing, pendingSyncCount, lastSyncTimestamp, syncError };
};

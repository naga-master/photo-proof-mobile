/**
 * Refresh Hook - Pull-to-refresh state management
 */

import { useState, useCallback } from 'react';

interface UseRefreshResult {
  isRefreshing: boolean;
  onRefresh: () => Promise<void>;
}

export function useRefresh(fetchFn: () => Promise<void>): UseRefreshResult {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const onRefresh = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await fetchFn();
    } finally {
      setIsRefreshing(false);
    }
  }, [fetchFn]);

  return { isRefreshing, onRefresh };
}

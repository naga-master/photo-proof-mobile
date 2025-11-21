import { useEffect, useState } from 'react';
import { router, useRootNavigationState } from 'expo-router';
import { useAuthStore } from '@/stores/authStore';
import { View, ActivityIndicator } from 'react-native';

export default function Index() {
  const { isAuthenticated, isLoading } = useAuthStore();
  const rootNavigationState = useRootNavigationState();
  const [hasNavigated, setHasNavigated] = useState(false);

  useEffect(() => {
    // Wait for root navigation to be ready
    if (!rootNavigationState?.key || isLoading || hasNavigated) {
      return;
    }

    // Navigate once ready
    const timeout = setTimeout(() => {
      if (isAuthenticated) {
        router.replace('/(tabs)');
      } else {
        router.replace('/(auth)/welcome');
      }
      setHasNavigated(true);
    }, 100);

    return () => clearTimeout(timeout);
  }, [rootNavigationState?.key, isAuthenticated, isLoading, hasNavigated]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' }}>
      <ActivityIndicator size="large" color="#667EEA" />
    </View>
  );
}

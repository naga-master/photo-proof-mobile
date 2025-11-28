/**
 * Root Layout - App Entry Point
 * Handles initialization, providers, and navigation structure
 */

import { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Stack, useRouter, useSegments, Href } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import * as SplashScreen from 'expo-splash-screen';

import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';
import { useAuthStore } from '@/stores/authStore';
import { useAppStore } from '@/stores/appStore';
import { colors } from '@/theme';

// Prevent auto-hiding splash screen
SplashScreen.preventAutoHideAsync();

// Create React Query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
    },
  },
});

// Navigation guard component
function NavigationGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const segments = useSegments();
  
  const { user, isAuthenticated, isInitialized: authInitialized } = useAuthStore();
  const { isInitialized: appInitialized } = useAppStore();

  useEffect(() => {
    if (!authInitialized || !appInitialized) {
      return;
    }

    const currentSegment = segments[0] as string;
    const inAuthGroup = currentSegment === '(auth)';
    const inStudioGroup = currentSegment === '(studio)';
    const inClientGroup = currentSegment === '(client)';

    if (!isAuthenticated && !inAuthGroup) {
      // Not authenticated, redirect to login
      console.log('[NavigationGuard] Not authenticated, redirecting to login');
      router.replace('/(auth)/login' as Href);
    } else if (isAuthenticated && inAuthGroup) {
      // Authenticated but in auth group, redirect based on role
      if (user?.role?.startsWith('studio')) {
        console.log('[NavigationGuard] Studio user, redirecting to dashboard');
        router.replace('/(studio)/dashboard' as Href);
      } else {
        console.log('[NavigationGuard] Client user, redirecting to albums');
        router.replace('/(client)/albums' as Href);
      }
    } else if (isAuthenticated) {
      // Check if user is in the correct group for their role
      const isStudioUser = user?.role?.startsWith('studio');
      
      if (isStudioUser && inClientGroup) {
        console.log('[NavigationGuard] Studio user in client area, redirecting');
        router.replace('/(studio)/dashboard' as Href);
      } else if (!isStudioUser && inStudioGroup) {
        console.log('[NavigationGuard] Client user in studio area, redirecting');
        router.replace('/(client)/albums' as Href);
      }
    }
  }, [isAuthenticated, authInitialized, appInitialized, segments, user?.role]);

  return <>{children}</>;
}

// App initializer component
function AppInitializer({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const initializeAuth = useAuthStore((state) => state.initialize);
  const initializeApp = useAppStore((state) => state.initialize);
  const { isDark } = useTheme();

  useEffect(() => {
    async function prepare() {
      try {
        console.log('[App] Starting initialization...');

        // Initialize stores in parallel
        await Promise.all([
          initializeAuth(),
          initializeApp(),
        ]);

        console.log('[App] Initialization complete');
      } catch (error) {
        console.error('[App] Initialization error:', error);
      } finally {
        setIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  if (!isReady) {
    return (
      <View style={[styles.loadingContainer, isDark && styles.loadingContainerDark]}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
      </View>
    );
  }

  return <>{children}</>;
}

// Main layout component
function RootLayoutNav() {
  const { isDark, theme } = useTheme();

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          gestureEnabled: true,
          gestureDirection: 'horizontal',
          contentStyle: {
            backgroundColor: theme.colors.background,
          },
        }}
      >
        {/* Auth screens */}
        <Stack.Screen
          name="(auth)"
          options={{
            animation: 'fade',
          }}
        />

        {/* Studio screens */}
        <Stack.Screen
          name="(studio)"
          options={{
            animation: 'slide_from_bottom',
          }}
        />

        {/* Client screens */}
        <Stack.Screen
          name="(client)"
          options={{
            animation: 'slide_from_bottom',
          }}
        />

        {/* Common screens */}
        <Stack.Screen
          name="(common)"
          options={{
            animation: 'slide_from_right',
          }}
        />

        {/* Index redirect */}
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
      <Toast />
    </>
  );
}

// Root layout export
export default function RootLayout() {
  return (
    <GestureHandlerRootView style={styles.container}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <AppInitializer>
              <NavigationGuard>
                <RootLayoutNav />
              </NavigationGuard>
            </AppInitializer>
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
  loadingContainerDark: {
    backgroundColor: colors.neutral[900],
  },
});

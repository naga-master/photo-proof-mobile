import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Toast from 'react-native-toast-message';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { useAuthStore } from '@/stores/authStore';
import { ThemeProvider } from '@/theme/ThemeProvider';

// Prevent auto-hiding of splash screen
SplashScreen.preventAutoHideAsync();

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

export default function RootLayout() {
  const { initializeAuth } = useAuthStore();

  useEffect(() => {
    async function prepare() {
      try {
        // TODO: Load custom fonts when available
        // await Font.loadAsync({
        //   'Inter-Light': require('@/assets/fonts/Inter-Light.ttf'),
        //   'Inter-Regular': require('@/assets/fonts/Inter-Regular.ttf'),
        //   'Inter-Medium': require('@/assets/fonts/Inter-Medium.ttf'),
        //   'Inter-SemiBold': require('@/assets/fonts/Inter-SemiBold.ttf'),
        //   'Inter-Bold': require('@/assets/fonts/Inter-Bold.ttf'),
        // });

        // Initialize auth
        await initializeAuth();
      } catch (e) {
        console.warn('Error during app initialization:', e);
      } finally {
        // Hide splash screen
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <StatusBar style="auto" />
            <Stack
              screenOptions={{
                headerShown: false,
                animation: 'slide_from_right',
                gestureEnabled: true,
                gestureDirection: 'horizontal',
              }}
            >
              <Stack.Screen 
                name="index" 
                options={{
                  headerShown: false,
                }}
              />
              <Stack.Screen 
                name="(auth)" 
                options={{
                  animation: 'fade',
                }}
              />
              <Stack.Screen 
                name="(tabs)" 
                options={{
                  animation: 'slide_from_bottom',
                }}
              />
              <Stack.Screen
                name="photo/[id]"
                options={{
                  animation: 'fade',
                  presentation: 'fullScreenModal',
                }}
              />
              <Stack.Screen
                name="gallery/[id]"
                options={{
                  animation: 'slide_from_right',
                }}
              />
              <Stack.Screen
                name="clients"
                options={{
                  animation: 'slide_from_right',
                }}
              />
            </Stack>
            <Toast />
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

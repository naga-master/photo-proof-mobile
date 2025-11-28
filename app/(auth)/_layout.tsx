/**
 * Auth Group Layout
 * Handles authentication screens (login, register, forgot password)
 */

import { Stack } from 'expo-router';
import { useTheme } from '@/theme/ThemeProvider';

export default function AuthLayout() {
  const { theme } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        contentStyle: {
          backgroundColor: theme.colors.background,
        },
      }}
    >
      <Stack.Screen
        name="login"
        options={{
          animation: 'fade',
        }}
      />
      <Stack.Screen
        name="register"
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="forgot-password"
        options={{
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen
        name="welcome"
        options={{
          animation: 'fade',
        }}
      />
    </Stack>
  );
}

/**
 * Common Group Layout
 * Stack navigation for shared screens across studio and client
 */

import { Stack } from 'expo-router';

import { useTheme } from '@/theme/ThemeProvider';

export default function CommonLayout() {
  const { theme, isDark } = useTheme();

  return (
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
      <Stack.Screen name="gallery/[id]" />
      <Stack.Screen name="photo/[id]" options={{ animation: 'fade' }} />
      <Stack.Screen name="project/[id]" />
      <Stack.Screen name="client/[id]" />
      <Stack.Screen name="contract/[id]" />
      <Stack.Screen name="product/[id]" />
      <Stack.Screen name="cart" />
      <Stack.Screen name="checkout" />
      <Stack.Screen name="orders" />
      <Stack.Screen name="invoices" />
    </Stack>
  );
}

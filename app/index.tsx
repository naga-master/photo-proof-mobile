/**
 * Index Page - Entry point redirect
 * Redirects users based on authentication state
 */

import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { Redirect, Href } from 'expo-router';

import { useAuthStore } from '@/stores/authStore';
import { colors } from '@/theme';

export default function Index() {
  const { isAuthenticated, isInitialized, user } = useAuthStore();

  // Show loading while initializing
  if (!isInitialized) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={colors.primary[600]} />
      </View>
    );
  }

  // Redirect based on auth state
  if (!isAuthenticated) {
    return <Redirect href={'/(auth)/login' as Href} />;
  }

  // Redirect based on user role
  if (user?.role?.startsWith('studio')) {
    return <Redirect href={'/(studio)/dashboard' as Href} />;
  }

  return <Redirect href={'/(client)/albums' as Href} />;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.white,
  },
});

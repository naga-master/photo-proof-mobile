/**
 * Loading Screen Component
 */

import React from 'react';
import { View, ActivityIndicator, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography } from '@/theme';

interface LoadingScreenProps {
  message?: string;
  fullScreen?: boolean;
  color?: string;
}

export function LoadingScreen({ 
  message, 
  fullScreen = true,
  color = colors.primary[600],
}: LoadingScreenProps) {
  return (
    <View style={[styles.container, fullScreen && styles.fullScreen]}>
      <ActivityIndicator size="large" color={color} />
      {message && <Text style={styles.message}>{message}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[8],
  },
  fullScreen: {
    flex: 1,
    backgroundColor: colors.white,
  },
  message: {
    marginTop: spacing[4],
    fontSize: typography.fontSize.base,
    color: colors.neutral[600],
  },
});

export default LoadingScreen;

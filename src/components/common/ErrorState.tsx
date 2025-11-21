import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn } from 'react-native-reanimated';

export interface ErrorInfo {
  type: 'network' | 'server' | 'not_found' | 'unauthorized' | 'unknown';
  message: string;
  code?: number;
}

interface ErrorStateProps {
  error: ErrorInfo;
  onRetry?: () => void;
  onDismiss?: () => void;
  style?: any;
}

export function ErrorState({ error, onRetry, onDismiss, style }: ErrorStateProps) {
  const getIcon = () => {
    switch (error.type) {
      case 'network':
        return 'cloud-offline-outline';
      case 'not_found':
        return 'search-outline';
      case 'unauthorized':
        return 'lock-closed-outline';
      case 'server':
        return 'warning-outline';
      default:
        return 'alert-circle-outline';
    }
  };

  const getColor = () => {
    switch (error.type) {
      case 'network':
        return '#F59E0B';
      case 'not_found':
        return '#6B7280';
      case 'unauthorized':
        return '#EF4444';
      case 'server':
        return '#F59E0B';
      default:
        return '#6B7280';
    }
  };

  return (
    <Animated.View 
      entering={FadeIn} 
      style={[styles.container, style]}
    >
      <View style={[styles.iconContainer, { backgroundColor: getColor() + '20' }]}>
        <Ionicons name={getIcon()} size={48} color={getColor()} />
      </View>
      
      <Text style={styles.title}>
        {error.type === 'network' && 'No Internet Connection'}
        {error.type === 'not_found' && 'Not Found'}
        {error.type === 'unauthorized' && 'Unauthorized'}
        {error.type === 'server' && 'Server Error'}
        {error.type === 'unknown' && 'Something Went Wrong'}
      </Text>
      
      <Text style={styles.message}>{error.message}</Text>
      
      {error.code && (
        <Text style={styles.code}>Error Code: {error.code}</Text>
      )}
      
      <View style={styles.actions}>
        {onRetry && (
          <Pressable
            onPress={onRetry}
            style={({ pressed }) => [
              styles.button,
              styles.retryButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Ionicons name="refresh-outline" size={20} color="white" />
            <Text style={styles.buttonText}>Try Again</Text>
          </Pressable>
        )}
        
        {onDismiss && (
          <Pressable
            onPress={onDismiss}
            style={({ pressed }) => [
              styles.button,
              styles.dismissButton,
              pressed && styles.buttonPressed,
            ]}
          >
            <Text style={[styles.buttonText, styles.dismissText]}>Dismiss</Text>
          </Pressable>
        )}
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#FFFFFF',
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1F2937',
    marginBottom: 8,
    textAlign: 'center',
  },
  message: {
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  code: {
    fontSize: 12,
    color: '#9CA3AF',
    marginBottom: 24,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
    minWidth: 120,
  },
  retryButton: {
    backgroundColor: '#667EEA',
  },
  dismissButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  buttonPressed: {
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    color: 'white',
  },
  dismissText: {
    color: '#6B7280',
  },
});

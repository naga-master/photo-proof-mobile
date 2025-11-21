import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Haptic feedback utilities that work across all platforms
 * Safely handles web platform where haptics are not available
 */

export const haptics = {
  /**
   * Light impact feedback (for button presses, selections)
   */
  light: async () => {
    if (Platform.OS === 'web') return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      // Silently fail on unsupported platforms
    }
  },

  /**
   * Medium impact feedback (for moderate actions)
   */
  medium: async () => {
    if (Platform.OS === 'web') return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch (error) {
      // Silently fail on unsupported platforms
    }
  },

  /**
   * Heavy impact feedback (for significant actions)
   */
  heavy: async () => {
    if (Platform.OS === 'web') return;
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
    } catch (error) {
      // Silently fail on unsupported platforms
    }
  },

  /**
   * Success notification feedback
   */
  success: async () => {
    if (Platform.OS === 'web') return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      // Silently fail on unsupported platforms
    }
  },

  /**
   * Warning notification feedback
   */
  warning: async () => {
    if (Platform.OS === 'web') return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
    } catch (error) {
      // Silently fail on unsupported platforms
    }
  },

  /**
   * Error notification feedback
   */
  error: async () => {
    if (Platform.OS === 'web') return;
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } catch (error) {
      // Silently fail on unsupported platforms
    }
  },

  /**
   * Selection changed feedback (for picker/wheel scrolling)
   */
  selection: async () => {
    if (Platform.OS === 'web') return;
    try {
      await Haptics.selectionAsync();
    } catch (error) {
      // Silently fail on unsupported platforms
    }
  },
};

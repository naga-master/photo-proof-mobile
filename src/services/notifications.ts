/**
 * Push Notifications Service
 * Handles push notification registration and handling
 */

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { apiClient } from './api/client';

// Configure notification handling
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export interface PushNotificationState {
  token: string | null;
  isRegistered: boolean;
  error: string | null;
}

class NotificationService {
  private pushToken: string | null = null;
  private notificationListener: any = null;
  private responseListener: any = null;

  async registerForPushNotifications(): Promise<string | null> {
    if (!Device.isDevice) {
      console.log('[Notifications] Push notifications require a physical device');
      return null;
    }

    try {
      // Check/request permissions
      const { status: existingStatus } = await Notifications.getPermissionsAsync();
      let finalStatus = existingStatus;

      if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
      }

      if (finalStatus !== 'granted') {
        console.log('[Notifications] Permission not granted');
        return null;
      }

      // Get Expo push token
      const tokenData = await Notifications.getExpoPushTokenAsync({
        projectId: 'your-project-id', // Replace with actual Expo project ID
      });
      this.pushToken = tokenData.data;

      // Register token with backend
      await this.registerTokenWithBackend(this.pushToken);

      // Configure Android channel
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync('default', {
          name: 'Default',
          importance: Notifications.AndroidImportance.MAX,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: '#FF6B35',
        });
      }

      console.log('[Notifications] Registered with token:', this.pushToken);
      return this.pushToken;
    } catch (error) {
      console.error('[Notifications] Registration failed:', error);
      return null;
    }
  }

  private async registerTokenWithBackend(token: string): Promise<void> {
    try {
      await apiClient.post('/api/notifications/register', {
        token,
        platform: Platform.OS,
      });
    } catch (error) {
      console.error('[Notifications] Failed to register token with backend:', error);
    }
  }

  setupListeners(
    onNotification?: (notification: Notifications.Notification) => void,
    onNotificationResponse?: (response: Notifications.NotificationResponse) => void
  ): void {
    // Listener for incoming notifications when app is foregrounded
    this.notificationListener = Notifications.addNotificationReceivedListener((notification) => {
      console.log('[Notifications] Received:', notification);
      onNotification?.(notification);
    });

    // Listener for user interactions with notifications
    this.responseListener = Notifications.addNotificationResponseReceivedListener((response) => {
      console.log('[Notifications] Response:', response);
      onNotificationResponse?.(response);
    });
  }

  removeListeners(): void {
    if (this.notificationListener) {
      Notifications.removeNotificationSubscription(this.notificationListener);
    }
    if (this.responseListener) {
      Notifications.removeNotificationSubscription(this.responseListener);
    }
  }

  async scheduleLocalNotification(
    title: string,
    body: string,
    data?: Record<string, any>,
    trigger?: Notifications.NotificationTriggerInput
  ): Promise<string> {
    return await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: trigger || null, // null = immediate
    });
  }

  async cancelNotification(notificationId: string): Promise<void> {
    await Notifications.cancelScheduledNotificationAsync(notificationId);
  }

  async cancelAllNotifications(): Promise<void> {
    await Notifications.cancelAllScheduledNotificationsAsync();
  }

  async setBadgeCount(count: number): Promise<void> {
    await Notifications.setBadgeCountAsync(count);
  }

  async getBadgeCount(): Promise<number> {
    return await Notifications.getBadgeCountAsync();
  }

  getToken(): string | null {
    return this.pushToken;
  }
}

export const notificationService = new NotificationService();

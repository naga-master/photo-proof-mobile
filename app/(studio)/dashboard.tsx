/**
 * Studio Dashboard Screen
 * Overview of studio metrics and recent activity
 */

import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router, Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { useAuthStore } from '@/stores/authStore';
import { useNetworkStatus } from '@/stores/appStore';
import { useTheme } from '@/theme/ThemeProvider';
import { apiClient } from '@/services/api/client';
import { colors, spacing, borderRadius, typography, shadows } from '@/theme';
import type { DashboardStats } from '@/types';

export default function DashboardScreen() {
  const { theme, isDark } = useTheme();
  const { user } = useAuthStore();
  const { isOnline } = useNetworkStatus();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // In a real implementation, this would fetch from the API
      // For now, we'll use mock data
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setStats({
        total_projects: 24,
        total_clients: 18,
        total_photos: 3456,
        total_revenue: 125000,
        pending_invoices: 5,
        pending_contracts: 3,
        recent_activity: [
          {
            id: '1',
            type: 'upload',
            description: 'Uploaded 45 photos to "Wedding - Sarah & John"',
            timestamp: new Date().toISOString(),
            user_name: 'You',
          },
          {
            id: '2',
            type: 'contract',
            description: 'Contract signed by Emily James',
            timestamp: new Date(Date.now() - 3600000).toISOString(),
            user_name: 'Emily James',
          },
          {
            id: '3',
            type: 'payment',
            description: 'Payment received - $2,500',
            timestamp: new Date(Date.now() - 7200000).toISOString(),
          },
        ],
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchDashboardData();
    setIsRefreshing(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const styles = createStyles(theme, isDark);

  const StatCard = ({
    icon,
    label,
    value,
    gradient,
    onPress,
  }: {
    icon: string;
    label: string;
    value: string | number;
    gradient: string[];
    onPress?: () => void;
  }) => (
    <Pressable onPress={onPress} style={({ pressed }) => pressed && styles.cardPressed}>
      <LinearGradient colors={gradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.statCard}>
        <View style={styles.statIconContainer}>
          <Ionicons name={icon as any} size={24} color={colors.white} />
        </View>
        <Text style={styles.statValue}>{typeof value === 'number' ? value.toLocaleString() : value}</Text>
        <Text style={styles.statLabel}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );

  const QuickAction = ({
    icon,
    label,
    color,
    onPress,
  }: {
    icon: string;
    label: string;
    color: string;
    onPress: () => void;
  }) => (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.quickAction, pressed && styles.cardPressed]}>
      <View style={[styles.quickActionIcon, { backgroundColor: color + '20' }]}>
        <Ionicons name={icon as any} size={24} color={color} />
      </View>
      <Text style={styles.quickActionLabel}>{label}</Text>
    </Pressable>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <Animated.View entering={FadeIn} style={styles.header}>
          <View>
            <Text style={styles.greeting}>{getGreeting()}</Text>
            <Text style={styles.userName}>{user?.name || 'User'}</Text>
          </View>
          <View style={styles.headerRight}>
            {!isOnline && (
              <View style={styles.offlineBadge}>
                <Ionicons name="cloud-offline" size={16} color={colors.warning.main} />
              </View>
            )}
            <Pressable style={styles.notificationButton}>
              <Ionicons name="notifications-outline" size={24} color={theme.colors.text} />
              <View style={styles.notificationBadge} />
            </Pressable>
          </View>
        </Animated.View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Quick Actions */}
          <Animated.View entering={FadeInDown.delay(100)}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsRow}>
              <QuickAction
                icon="add-circle"
                label="New Project"
                color={theme.colors.primary}
                onPress={() => router.push('/(studio)/projects' as Href)}
              />
              <QuickAction
                icon="cloud-upload"
                label="Upload"
                color={colors.success.main}
                onPress={() => router.push('/(studio)/upload' as Href)}
              />
              <QuickAction
                icon="document-text"
                label="Invoice"
                color={colors.warning.main}
                onPress={() => {}}
              />
              <QuickAction
                icon="create"
                label="Contract"
                color={colors.info.main}
                onPress={() => {}}
              />
            </View>
          </Animated.View>

          {/* Stats Grid */}
          <Animated.View entering={FadeInDown.delay(200)}>
            <Text style={styles.sectionTitle}>Overview</Text>
            <View style={styles.statsGrid}>
              <StatCard
                icon="folder"
                label="Projects"
                value={stats?.total_projects || 0}
                gradient={[colors.primary[500], colors.primary[700]]}
                onPress={() => router.push('/(studio)/projects' as Href)}
              />
              <StatCard
                icon="people"
                label="Clients"
                value={stats?.total_clients || 0}
                gradient={[colors.secondary[500], colors.secondary[700]]}
                onPress={() => router.push('/(studio)/clients' as Href)}
              />
              <StatCard
                icon="images"
                label="Photos"
                value={stats?.total_photos || 0}
                gradient={['#FF8C42', '#FF6B1A']}
              />
              <StatCard
                icon="cash"
                label="Revenue"
                value={`₹${((stats?.total_revenue || 0) / 1000).toFixed(0)}K`}
                gradient={['#10B981', '#059669']}
              />
            </View>
          </Animated.View>

          {/* Pending Items */}
          <Animated.View entering={FadeInDown.delay(300)}>
            <Text style={styles.sectionTitle}>Pending</Text>
            <View style={styles.pendingRow}>
              <View style={styles.pendingCard}>
                <View style={[styles.pendingIcon, { backgroundColor: colors.warning.light + '40' }]}>
                  <Ionicons name="receipt-outline" size={20} color={colors.warning.main} />
                </View>
                <Text style={styles.pendingValue}>{stats?.pending_invoices || 0}</Text>
                <Text style={styles.pendingLabel}>Unpaid Invoices</Text>
              </View>
              <View style={styles.pendingCard}>
                <View style={[styles.pendingIcon, { backgroundColor: colors.info.light + '40' }]}>
                  <Ionicons name="document-outline" size={20} color={colors.info.main} />
                </View>
                <Text style={styles.pendingValue}>{stats?.pending_contracts || 0}</Text>
                <Text style={styles.pendingLabel}>Unsigned Contracts</Text>
              </View>
            </View>
          </Animated.View>

          {/* Recent Activity */}
          <Animated.View entering={FadeInDown.delay(400)}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              <Pressable>
                <Text style={styles.seeAllText}>See all</Text>
              </Pressable>
            </View>
            <View style={styles.activityList}>
              {stats?.recent_activity.map((activity, index) => (
                <View key={activity.id} style={styles.activityItem}>
                  <View style={styles.activityIcon}>
                    <Ionicons
                      name={
                        activity.type === 'upload'
                          ? 'cloud-upload'
                          : activity.type === 'contract'
                          ? 'document'
                          : 'cash'
                      }
                      size={20}
                      color={theme.colors.primary}
                    />
                  </View>
                  <View style={styles.activityContent}>
                    <Text style={styles.activityText} numberOfLines={2}>
                      {activity.description}
                    </Text>
                    <Text style={styles.activityTime}>
                      {new Date(activity.timestamp).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </Animated.View>

          {/* Bottom spacing for tab bar */}
          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing[6],
      paddingVertical: spacing[4],
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    greeting: {
      fontSize: typography.fontSize.sm,
      color: theme.colors.textSecondary,
    },
    userName: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.bold,
      color: theme.colors.text,
      marginTop: spacing[1],
    },
    headerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[3],
    },
    offlineBadge: {
      padding: spacing[2],
      borderRadius: borderRadius.full,
      backgroundColor: colors.warning.light + '20',
    },
    notificationButton: {
      width: 44,
      height: 44,
      borderRadius: borderRadius.full,
      backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100],
      alignItems: 'center',
      justifyContent: 'center',
    },
    notificationBadge: {
      position: 'absolute',
      top: 8,
      right: 8,
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.error.main,
      borderWidth: 2,
      borderColor: isDark ? colors.neutral[800] : colors.white,
    },
    scrollContent: {
      padding: spacing[6],
    },
    sectionTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: theme.colors.text,
      marginBottom: spacing[4],
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing[4],
    },
    seeAllText: {
      fontSize: typography.fontSize.sm,
      color: theme.colors.primary,
      fontWeight: typography.fontWeight.medium,
    },
    quickActionsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing[8],
    },
    quickAction: {
      alignItems: 'center',
      flex: 1,
    },
    quickActionIcon: {
      width: 56,
      height: 56,
      borderRadius: borderRadius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing[2],
    },
    quickActionLabel: {
      fontSize: typography.fontSize.xs,
      color: theme.colors.textSecondary,
      fontWeight: typography.fontWeight.medium,
    },
    statsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing[3],
      marginBottom: spacing[8],
    },
    statCard: {
      width: '48%',
      flexGrow: 1,
      padding: spacing[4],
      borderRadius: borderRadius.xl,
      minHeight: 110,
    },
    statIconContainer: {
      width: 40,
      height: 40,
      borderRadius: borderRadius.lg,
      backgroundColor: 'rgba(255, 255, 255, 0.2)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing[2],
    },
    statValue: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.bold,
      color: colors.white,
    },
    statLabel: {
      fontSize: typography.fontSize.sm,
      color: 'rgba(255, 255, 255, 0.8)',
      marginTop: spacing[1],
    },
    cardPressed: {
      opacity: 0.9,
      transform: [{ scale: 0.98 }],
    },
    pendingRow: {
      flexDirection: 'row',
      gap: spacing[3],
      marginBottom: spacing[8],
    },
    pendingCard: {
      flex: 1,
      backgroundColor: isDark ? colors.neutral[800] : colors.white,
      padding: spacing[4],
      borderRadius: borderRadius.lg,
      ...shadows.sm,
    },
    pendingIcon: {
      width: 40,
      height: 40,
      borderRadius: borderRadius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing[3],
    },
    pendingValue: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.bold,
      color: theme.colors.text,
    },
    pendingLabel: {
      fontSize: typography.fontSize.sm,
      color: theme.colors.textSecondary,
      marginTop: spacing[1],
    },
    activityList: {
      backgroundColor: isDark ? colors.neutral[800] : colors.white,
      borderRadius: borderRadius.lg,
      ...shadows.sm,
    },
    activityItem: {
      flexDirection: 'row',
      padding: spacing[4],
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    activityIcon: {
      width: 40,
      height: 40,
      borderRadius: borderRadius.full,
      backgroundColor: theme.colors.primary + '15',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing[3],
    },
    activityContent: {
      flex: 1,
    },
    activityText: {
      fontSize: typography.fontSize.sm,
      color: theme.colors.text,
      lineHeight: 20,
    },
    activityTime: {
      fontSize: typography.fontSize.xs,
      color: theme.colors.textSecondary,
      marginTop: spacing[1],
    },
  });

/**
 * Orders Screen
 * View order history
 */

import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { useTheme } from '@/theme/ThemeProvider';
import { apiClient } from '@/services/api/client';
import { colors, spacing, borderRadius, typography, shadows } from '@/theme';
import type { Order } from '@/types';

export default function OrdersScreen() {
  const { theme, isDark } = useTheme();

  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await apiClient.get<{ orders: Order[] }>('/api/store/orders');
      setOrders(response.orders || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchOrders();
    setIsRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return colors.success.main;
      case 'shipped':
      case 'processing':
        return colors.info.main;
      case 'pending':
      case 'confirmed':
        return colors.warning.main;
      case 'cancelled':
        return colors.error.main;
      default:
        return colors.neutral[400];
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const styles = createStyles(theme, isDark);

  const renderOrderItem = useCallback(
    ({ item, index }: { item: Order; index: number }) => (
      <Animated.View entering={FadeInDown.delay(index * 100)}>
        <Pressable
          style={({ pressed }) => [styles.orderCard, pressed && styles.cardPressed]}
        >
          <View style={styles.orderHeader}>
            <View>
              <Text style={styles.orderNumber}>Order #{item.order_number}</Text>
              <Text style={styles.orderDate}>
                {new Date(item.created_at).toLocaleDateString()}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                {item.status}
              </Text>
            </View>
          </View>

          <View style={styles.orderItems}>
            <Text style={styles.itemsText}>
              {item.items.length} {item.items.length === 1 ? 'item' : 'items'}
            </Text>
          </View>

          <View style={styles.orderFooter}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalValue}>{formatPrice(item.total)}</Text>
          </View>
        </Pressable>
      </Animated.View>
    ),
    [theme]
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
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>My Orders</Text>
          <View style={{ width: 40 }} />
        </View>

        <FlatList
          data={orders}
          renderItem={renderOrderItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="bag-outline" size={64} color={theme.colors.textSecondary} />
              <Text style={styles.emptyTitle}>No Orders Yet</Text>
              <Text style={styles.emptyText}>Your order history will appear here</Text>
            </View>
          }
        />
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
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[3],
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: borderRadius.full,
      backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100],
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.bold,
      color: theme.colors.text,
    },
    listContent: {
      padding: spacing[4],
    },
    orderCard: {
      backgroundColor: isDark ? colors.neutral[800] : colors.white,
      borderRadius: borderRadius.lg,
      padding: spacing[4],
      marginBottom: spacing[3],
      ...shadows.sm,
    },
    cardPressed: {
      opacity: 0.9,
    },
    orderHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing[3],
    },
    orderNumber: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.bold,
      color: theme.colors.text,
    },
    orderDate: {
      fontSize: typography.fontSize.sm,
      color: theme.colors.textSecondary,
      marginTop: spacing[0.5],
    },
    statusBadge: {
      paddingHorizontal: spacing[2],
      paddingVertical: spacing[1],
      borderRadius: borderRadius.sm,
    },
    statusText: {
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.medium,
      textTransform: 'capitalize',
    },
    orderItems: {
      paddingVertical: spacing[2],
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: theme.colors.border,
    },
    itemsText: {
      fontSize: typography.fontSize.sm,
      color: theme.colors.textSecondary,
    },
    orderFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: spacing[3],
    },
    totalLabel: {
      fontSize: typography.fontSize.sm,
      color: theme.colors.textSecondary,
    },
    totalValue: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: theme.colors.primary,
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing[16],
    },
    emptyTitle: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.semibold,
      color: theme.colors.text,
      marginTop: spacing[4],
    },
    emptyText: {
      fontSize: typography.fontSize.base,
      color: theme.colors.textSecondary,
      marginTop: spacing[2],
    },
  });

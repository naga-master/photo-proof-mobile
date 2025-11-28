/**
 * Invoices Screen
 * View and pay invoices
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
import Animated, { FadeInDown } from 'react-native-reanimated';

import { useTheme } from '@/theme/ThemeProvider';
import { apiClient } from '@/services/api/client';
import { colors, spacing, borderRadius, typography, shadows } from '@/theme';
import type { Invoice } from '@/types';

export default function InvoicesScreen() {
  const { theme, isDark } = useTheme();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchInvoices();
  }, []);

  const fetchInvoices = async () => {
    try {
      const response = await apiClient.get<{ invoices: Invoice[] }>('/api/invoices/');
      setInvoices(response.invoices || []);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchInvoices();
    setIsRefreshing(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Paid':
        return colors.success.main;
      case 'Unpaid':
        return colors.warning.main;
      case 'Overdue':
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

  const renderInvoiceItem = useCallback(
    ({ item, index }: { item: Invoice; index: number }) => (
      <Animated.View entering={FadeInDown.delay(index * 100)}>
        <Pressable
          style={({ pressed }) => [styles.invoiceCard, pressed && styles.cardPressed]}
        >
          <View style={styles.invoiceHeader}>
            <View style={styles.invoiceIcon}>
              <Ionicons name="receipt-outline" size={24} color={theme.colors.primary} />
            </View>
            <View style={styles.invoiceInfo}>
              <Text style={styles.invoiceNumber}>{item.invoice_number}</Text>
              <Text style={styles.invoiceDate}>
                Due: {new Date(item.due_date).toLocaleDateString()}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                {item.status}
              </Text>
            </View>
          </View>

          <View style={styles.invoiceDetails}>
            <Text style={styles.clientName}>{item.client_name}</Text>
            <Text style={styles.itemCount}>
              {item.items.length} {item.items.length === 1 ? 'item' : 'items'}
            </Text>
          </View>

          <View style={styles.invoiceFooter}>
            <Text style={styles.totalValue}>{formatPrice(item.total)}</Text>
            {item.status !== 'Paid' && (
              <Pressable style={styles.payButton}>
                <Text style={styles.payButtonText}>Pay Now</Text>
              </Pressable>
            )}
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
          <Text style={styles.headerTitle}>Invoices</Text>
          <View style={{ width: 40 }} />
        </View>

        <FlatList
          data={invoices}
          renderItem={renderInvoiceItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={64} color={theme.colors.textSecondary} />
              <Text style={styles.emptyTitle}>No Invoices</Text>
              <Text style={styles.emptyText}>Your invoices will appear here</Text>
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
    invoiceCard: {
      backgroundColor: isDark ? colors.neutral[800] : colors.white,
      borderRadius: borderRadius.lg,
      padding: spacing[4],
      marginBottom: spacing[3],
      ...shadows.sm,
    },
    cardPressed: {
      opacity: 0.9,
    },
    invoiceHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing[3],
    },
    invoiceIcon: {
      width: 48,
      height: 48,
      borderRadius: borderRadius.lg,
      backgroundColor: theme.colors.primary + '15',
      alignItems: 'center',
      justifyContent: 'center',
    },
    invoiceInfo: {
      flex: 1,
      marginLeft: spacing[3],
    },
    invoiceNumber: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.bold,
      color: theme.colors.text,
    },
    invoiceDate: {
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
    },
    invoiceDetails: {
      paddingVertical: spacing[2],
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: theme.colors.border,
    },
    clientName: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      color: theme.colors.text,
    },
    itemCount: {
      fontSize: typography.fontSize.sm,
      color: theme.colors.textSecondary,
      marginTop: spacing[0.5],
    },
    invoiceFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: spacing[3],
    },
    totalValue: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.bold,
      color: theme.colors.primary,
    },
    payButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[2],
      borderRadius: borderRadius.full,
    },
    payButtonText: {
      color: colors.white,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
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

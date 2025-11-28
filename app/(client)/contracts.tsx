/**
 * Contracts Screen - Client's Contracts List
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
import { router, Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { useTheme } from '@/theme/ThemeProvider';
import { apiClient } from '@/services/api/client';
import { colors, spacing, borderRadius, typography, shadows } from '@/theme';
import type { Contract } from '@/types';

export default function ContractsScreen() {
  const { theme, isDark } = useTheme();

  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      const response = await apiClient.get<{ contracts: Contract[]; total: number }>(
        '/api/contracts/'
      );
      setContracts(response.contracts || []);
    } catch (error) {
      console.error('Failed to fetch contracts:', error);
      setContracts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchContracts();
    setIsRefreshing(false);
  };

  const handleContractPress = (contract: Contract) => {
    router.push(`/(common)/contract/${contract.id}` as Href);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'signed':
        return colors.success.main;
      case 'pending':
        return colors.warning.main;
      case 'expired':
        return colors.error.main;
      default:
        return colors.neutral[400];
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'signed':
        return 'checkmark-circle';
      case 'pending':
        return 'time';
      case 'expired':
        return 'close-circle';
      default:
        return 'document';
    }
  };

  const styles = createStyles(theme, isDark);

  const renderContractItem = useCallback(
    ({ item, index }: { item: Contract; index: number }) => (
      <Animated.View entering={FadeInDown.delay(index * 100)}>
        <Pressable
          onPress={() => handleContractPress(item)}
          style={({ pressed }) => [styles.contractCard, pressed && styles.cardPressed]}
        >
          <View style={[styles.statusIndicator, { backgroundColor: getStatusColor(item.status) }]} />
          <View style={styles.contractInfo}>
            <Text style={styles.contractTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <Text style={styles.contractProject} numberOfLines={1}>
              {item.project_title || 'No project assigned'}
            </Text>
            <View style={styles.contractMeta}>
              <View style={styles.statusBadge}>
                <Ionicons
                  name={getStatusIcon(item.status) as any}
                  size={14}
                  color={getStatusColor(item.status)}
                />
                <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                  {item.status}
                </Text>
              </View>
              {item.sent_at && (
                <Text style={styles.dateText}>
                  {new Date(item.sent_at).toLocaleDateString()}
                </Text>
              )}
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
        </Pressable>
      </Animated.View>
    ),
    [theme, isDark]
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
          <Text style={styles.headerTitle}>Contracts</Text>
        </Animated.View>

        {/* Pending Alert */}
        {contracts.filter((c) => c.status === 'pending').length > 0 && (
          <View style={styles.alertBanner}>
            <Ionicons name="information-circle" size={20} color={colors.warning.main} />
            <Text style={styles.alertText}>
              You have {contracts.filter((c) => c.status === 'pending').length} contract(s) awaiting your signature
            </Text>
          </View>
        )}

        {/* Contracts List */}
        <FlatList
          data={contracts}
          renderItem={renderContractItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="document-text-outline" size={64} color={theme.colors.textSecondary} />
              </View>
              <Text style={styles.emptyTitle}>No Contracts</Text>
              <Text style={styles.emptyText}>
                Your contracts will appear here when your photographer sends them
              </Text>
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
      paddingHorizontal: spacing[6],
      paddingVertical: spacing[4],
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerTitle: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.bold,
      color: theme.colors.text,
    },
    alertBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing[6],
      paddingVertical: spacing[3],
      backgroundColor: colors.warning.light + '20',
      gap: spacing[2],
    },
    alertText: {
      flex: 1,
      fontSize: typography.fontSize.sm,
      color: colors.warning.dark,
    },
    listContent: {
      padding: spacing[6],
      paddingBottom: 120,
    },
    contractCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? colors.neutral[800] : colors.white,
      borderRadius: borderRadius.lg,
      padding: spacing[4],
      marginBottom: spacing[3],
      overflow: 'hidden',
      ...shadows.sm,
    },
    cardPressed: {
      opacity: 0.9,
      transform: [{ scale: 0.98 }],
    },
    statusIndicator: {
      width: 4,
      height: '100%',
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      borderTopLeftRadius: borderRadius.lg,
      borderBottomLeftRadius: borderRadius.lg,
    },
    contractInfo: {
      flex: 1,
      marginLeft: spacing[2],
    },
    contractTitle: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      color: theme.colors.text,
    },
    contractProject: {
      fontSize: typography.fontSize.sm,
      color: theme.colors.textSecondary,
      marginTop: spacing[1],
    },
    contractMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginTop: spacing[2],
    },
    statusBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[1],
    },
    statusText: {
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.medium,
      textTransform: 'capitalize',
    },
    dateText: {
      fontSize: typography.fontSize.xs,
      color: theme.colors.textSecondary,
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing[16],
    },
    emptyIconContainer: {
      width: 120,
      height: 120,
      borderRadius: borderRadius.full,
      backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100],
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing[4],
    },
    emptyTitle: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.semibold,
      color: theme.colors.text,
    },
    emptyText: {
      fontSize: typography.fontSize.base,
      color: theme.colors.textSecondary,
      marginTop: spacing[2],
      textAlign: 'center',
      lineHeight: 24,
    },
  });

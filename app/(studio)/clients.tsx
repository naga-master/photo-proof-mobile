/**
 * Clients Screen - Studio Client Management
 */

import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Pressable,
  TextInput,
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
import type { Client } from '@/types';

export default function ClientsScreen() {
  const { theme, isDark } = useTheme();

  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = clients.filter(
        (c) =>
          c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          c.email.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredClients(filtered);
    } else {
      setFilteredClients(clients);
    }
  }, [searchQuery, clients]);

  const fetchClients = async () => {
    try {
      const response = await apiClient.get<{ clients: Client[]; total: number }>('/v2/clients');
      setClients(response.clients || []);
      setFilteredClients(response.clients || []);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchClients();
    setIsRefreshing(false);
  };

  const handleClientPress = (client: Client) => {
    router.push(`/(common)/client/${client.id}` as Href);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const styles = createStyles(theme, isDark);

  const renderClientItem = useCallback(
    ({ item, index }: { item: Client; index: number }) => (
      <Animated.View entering={FadeInDown.delay(index * 50)}>
        <Pressable
          onPress={() => handleClientPress(item)}
          style={({ pressed }) => [styles.clientCard, pressed && styles.cardPressed]}
        >
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{getInitials(item.name)}</Text>
          </View>
          <View style={styles.clientInfo}>
            <Text style={styles.clientName} numberOfLines={1}>
              {item.name}
            </Text>
            <Text style={styles.clientEmail} numberOfLines={1}>
              {item.email}
            </Text>
            <View style={styles.clientMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="folder-outline" size={14} color={theme.colors.textSecondary} />
                <Text style={styles.metaText}>{item.total_projects || 0} projects</Text>
              </View>
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
          <Text style={styles.headerTitle}>Clients</Text>
          <Pressable
            style={styles.addButton}
            onPress={() => router.push('/(common)/client/new' as Href)}
          >
            <Ionicons name="add" size={24} color={colors.white} />
          </Pressable>
        </Animated.View>

        {/* Search */}
        <View style={styles.searchContainer}>
          <View style={styles.searchWrapper}>
            <Ionicons name="search" size={20} color={theme.colors.textSecondary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search clients..."
              placeholderTextColor={theme.colors.textSecondary}
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color={theme.colors.textSecondary} />
              </Pressable>
            )}
          </View>
        </View>

        {/* Stats */}
        <View style={styles.statsBar}>
          <Text style={styles.statsText}>
            {filteredClients.length} {filteredClients.length === 1 ? 'client' : 'clients'}
          </Text>
        </View>

        {/* Clients List */}
        <FlatList
          data={filteredClients}
          renderItem={renderClientItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="people-outline" size={64} color={theme.colors.textSecondary} />
              <Text style={styles.emptyTitle}>No Clients</Text>
              <Text style={styles.emptyText}>
                {searchQuery ? 'No clients match your search' : 'Add your first client'}
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
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
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
    addButton: {
      width: 40,
      height: 40,
      borderRadius: borderRadius.lg,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    searchContainer: {
      paddingHorizontal: spacing[6],
      paddingVertical: spacing[3],
      backgroundColor: theme.colors.surface,
    },
    searchWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100],
      borderRadius: borderRadius.lg,
      paddingHorizontal: spacing[4],
      height: 44,
      gap: spacing[2],
    },
    searchInput: {
      flex: 1,
      fontSize: typography.fontSize.base,
      color: theme.colors.text,
    },
    statsBar: {
      paddingHorizontal: spacing[6],
      paddingVertical: spacing[2],
      backgroundColor: theme.colors.background,
    },
    statsText: {
      fontSize: typography.fontSize.sm,
      color: theme.colors.textSecondary,
    },
    listContent: {
      padding: spacing[6],
      paddingTop: 0,
      paddingBottom: 120,
    },
    clientCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? colors.neutral[800] : colors.white,
      borderRadius: borderRadius.lg,
      padding: spacing[4],
      marginBottom: spacing[3],
      ...shadows.sm,
    },
    cardPressed: {
      opacity: 0.9,
      transform: [{ scale: 0.98 }],
    },
    avatar: {
      width: 50,
      height: 50,
      borderRadius: borderRadius.full,
      backgroundColor: theme.colors.primary + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing[3],
    },
    avatarText: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
      color: theme.colors.primary,
    },
    clientInfo: {
      flex: 1,
    },
    clientName: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      color: theme.colors.text,
    },
    clientEmail: {
      fontSize: typography.fontSize.sm,
      color: theme.colors.textSecondary,
      marginTop: spacing[0.5],
    },
    clientMeta: {
      flexDirection: 'row',
      gap: spacing[4],
      marginTop: spacing[2],
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[1],
    },
    metaText: {
      fontSize: typography.fontSize.xs,
      color: theme.colors.textSecondary,
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

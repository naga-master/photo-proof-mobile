/**
 * Albums Screen - Client's Projects/Albums View
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
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router, Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { useAuthStore } from '@/stores/authStore';
import { useTheme } from '@/theme/ThemeProvider';
import { apiClient, API_BASE_URL } from '@/services/api/client';
import { colors, spacing, borderRadius, typography, shadows } from '@/theme';
import type { Project } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - spacing[6] * 2 - spacing[3]) / 2;

export default function AlbumsScreen() {
  const { theme, isDark } = useTheme();
  const { user } = useAuthStore();

  const [albums, setAlbums] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    try {
      const response = await apiClient.get<{ projects: Project[]; total: number }>(
        '/api/projects/'
      );
      setAlbums(response.projects || []);
    } catch (error) {
      console.error('Failed to fetch albums:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchAlbums();
    setIsRefreshing(false);
  };

  const handleAlbumPress = (album: Project) => {
    router.push(`/(common)/gallery/${album.id}` as Href);
  };

  const styles = createStyles(theme, isDark);

  const renderAlbumCard = useCallback(
    ({ item, index }: { item: Project; index: number }) => (
      <Animated.View entering={FadeInDown.delay(index * 100)}>
        <Pressable
          onPress={() => handleAlbumPress(item)}
          style={({ pressed }) => [styles.albumCard, pressed && styles.cardPressed]}
        >
          <Image
            source={{
              uri: item.cover_photo_src || `${API_BASE_URL}/placeholder-album.jpg`,
            }}
            style={styles.albumImage}
            contentFit="cover"
            transition={300}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.7)']}
            style={styles.albumGradient}
          >
            <Text style={styles.albumTitle} numberOfLines={2}>
              {item.title}
            </Text>
            <View style={styles.albumMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="images-outline" size={14} color={colors.white} />
                <Text style={styles.metaText}>{item.photo_count}</Text>
              </View>
              {item.shoot_date && (
                <Text style={styles.metaDate}>
                  {new Date(item.shoot_date).toLocaleDateString()}
                </Text>
              )}
            </View>
          </LinearGradient>
          {item.is_locked && (
            <View style={styles.lockBadge}>
              <Ionicons name="lock-closed" size={14} color={colors.white} />
            </View>
          )}
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
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name || 'Guest'}</Text>
          </View>
          <Pressable style={styles.notificationButton}>
            <Ionicons name="notifications-outline" size={24} color={theme.colors.text} />
          </Pressable>
        </Animated.View>

        {/* Albums Grid */}
        <FlatList
          data={albums}
          renderItem={renderAlbumCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
          ListHeaderComponent={
            <Text style={styles.sectionTitle}>Your Albums</Text>
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="albums-outline" size={64} color={theme.colors.textSecondary} />
              <Text style={styles.emptyTitle}>No Albums Yet</Text>
              <Text style={styles.emptyText}>
                Your photo albums will appear here
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
    notificationButton: {
      width: 44,
      height: 44,
      borderRadius: borderRadius.full,
      backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100],
      alignItems: 'center',
      justifyContent: 'center',
    },
    listContent: {
      padding: spacing[6],
      paddingBottom: 120,
    },
    columnWrapper: {
      gap: spacing[3],
    },
    sectionTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: theme.colors.text,
      marginBottom: spacing[4],
    },
    albumCard: {
      width: CARD_WIDTH,
      height: CARD_WIDTH * 1.3,
      borderRadius: borderRadius.xl,
      overflow: 'hidden',
      marginBottom: spacing[3],
      ...shadows.md,
    },
    cardPressed: {
      opacity: 0.9,
      transform: [{ scale: 0.98 }],
    },
    albumImage: {
      width: '100%',
      height: '100%',
    },
    albumGradient: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '50%',
      justifyContent: 'flex-end',
      padding: spacing[3],
    },
    albumTitle: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      color: colors.white,
      marginBottom: spacing[1],
    },
    albumMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    metaItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[1],
    },
    metaText: {
      fontSize: typography.fontSize.xs,
      color: colors.white,
    },
    metaDate: {
      fontSize: typography.fontSize.xs,
      color: 'rgba(255, 255, 255, 0.7)',
    },
    lockBadge: {
      position: 'absolute',
      top: spacing[3],
      right: spacing[3],
      width: 28,
      height: 28,
      borderRadius: borderRadius.full,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      alignItems: 'center',
      justifyContent: 'center',
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
      textAlign: 'center',
    },
  });

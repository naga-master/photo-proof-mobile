/**
 * Favorites Screen - Client's Favorite Photos
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
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { useTheme } from '@/theme/ThemeProvider';
import { apiClient, API_BASE_URL } from '@/services/api/client';
import { colors, spacing, borderRadius, typography, shadows } from '@/theme';
import type { Photo } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const NUM_COLUMNS = 3;
const SPACING = spacing[1];
const PHOTO_SIZE = (SCREEN_WIDTH - spacing[6] * 2 - SPACING * (NUM_COLUMNS - 1)) / NUM_COLUMNS;

export default function FavoritesScreen() {
  const { theme, isDark } = useTheme();

  const [favorites, setFavorites] = useState<Photo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      // For now, we'll simulate fetching favorites
      // In real implementation, this would call the favorites API endpoint
      await new Promise((resolve) => setTimeout(resolve, 500));
      setFavorites([]);
    } catch (error) {
      console.error('Failed to fetch favorites:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchFavorites();
    setIsRefreshing(false);
  };

  const handlePhotoPress = (photo: Photo) => {
    router.push(`/(common)/photo/${photo.id}` as Href);
  };

  const styles = createStyles(theme, isDark);

  const renderPhotoItem = useCallback(
    ({ item, index }: { item: Photo; index: number }) => (
      <Animated.View entering={FadeInDown.delay(index * 30)}>
        <Pressable
          onPress={() => handlePhotoPress(item)}
          style={({ pressed }) => [styles.photoContainer, pressed && styles.cardPressed]}
        >
          <Image
            source={{ uri: item.thumbnail_src || item.src }}
            style={styles.photo}
            contentFit="cover"
            transition={200}
          />
          <View style={styles.favoriteIcon}>
            <Ionicons name="heart" size={14} color={colors.error.main} />
          </View>
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
          <Text style={styles.headerTitle}>Favorites</Text>
          <Text style={styles.headerSubtitle}>
            {favorites.length} {favorites.length === 1 ? 'photo' : 'photos'}
          </Text>
        </Animated.View>

        {/* Favorites Grid */}
        <FlatList
          data={favorites}
          renderItem={renderPhotoItem}
          keyExtractor={(item) => item.id}
          numColumns={NUM_COLUMNS}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="heart-outline" size={64} color={theme.colors.textSecondary} />
              </View>
              <Text style={styles.emptyTitle}>No Favorites Yet</Text>
              <Text style={styles.emptyText}>
                Photos you love will appear here.{'\n'}
                Tap the heart icon on any photo to add it.
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
    headerSubtitle: {
      fontSize: typography.fontSize.sm,
      color: theme.colors.textSecondary,
      marginTop: spacing[1],
    },
    listContent: {
      padding: spacing[6],
      paddingBottom: 120,
    },
    photoContainer: {
      width: PHOTO_SIZE,
      height: PHOTO_SIZE,
      marginRight: SPACING,
      marginBottom: SPACING,
      borderRadius: borderRadius.sm,
      overflow: 'hidden',
    },
    cardPressed: {
      opacity: 0.8,
    },
    photo: {
      width: '100%',
      height: '100%',
    },
    favoriteIcon: {
      position: 'absolute',
      top: spacing[1],
      right: spacing[1],
      width: 24,
      height: 24,
      borderRadius: borderRadius.full,
      backgroundColor: 'rgba(255, 255, 255, 0.9)',
      alignItems: 'center',
      justifyContent: 'center',
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

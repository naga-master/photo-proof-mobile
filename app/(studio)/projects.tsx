/**
 * Projects Screen - Studio Projects Management
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
import { Image } from 'expo-image';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { useTheme } from '@/theme/ThemeProvider';
import { apiClient, API_BASE_URL } from '@/services/api/client';
import { colors, spacing, borderRadius, typography, shadows } from '@/theme';
import type { Project } from '@/types';

export default function ProjectsScreen() {
  const { theme, isDark } = useTheme();

  const [projects, setProjects] = useState<Project[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = projects.filter((p) =>
        p.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProjects(filtered);
    } else {
      setFilteredProjects(projects);
    }
  }, [searchQuery, projects]);

  const fetchProjects = async () => {
    try {
      const response = await apiClient.get<{ projects: Project[]; total: number }>(
        '/api/projects/'
      );
      setProjects(response.projects || []);
      setFilteredProjects(response.projects || []);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchProjects();
    setIsRefreshing(false);
  };

  const handleProjectPress = (project: Project) => {
    // Navigate to project details
    router.push(`/(common)/project/${project.id}` as Href);
  };

  const styles = createStyles(theme, isDark);

  const renderProjectItem = useCallback(
    ({ item, index }: { item: Project; index: number }) => (
      <Animated.View entering={FadeInDown.delay(index * 50)}>
        <Pressable
          onPress={() => handleProjectPress(item)}
          style={({ pressed }) => [styles.projectCard, pressed && styles.cardPressed]}
        >
          <Image
            source={{
              uri: item.cover_photo_src || `${API_BASE_URL}/placeholder-project.jpg`,
            }}
            style={styles.projectImage}
            contentFit="cover"
            transition={200}
          />
          <View style={styles.projectInfo}>
            <Text style={styles.projectTitle} numberOfLines={1}>
              {item.title}
            </Text>
            <View style={styles.projectMeta}>
              <View style={styles.metaItem}>
                <Ionicons name="images-outline" size={14} color={theme.colors.textSecondary} />
                <Text style={styles.metaText}>{item.photo_count}</Text>
              </View>
              <View style={styles.metaItem}>
                <Ionicons name="calendar-outline" size={14} color={theme.colors.textSecondary} />
                <Text style={styles.metaText}>
                  {item.shoot_date
                    ? new Date(item.shoot_date).toLocaleDateString()
                    : 'No date'}
                </Text>
              </View>
            </View>
            {item.status && (
              <View
                style={[
                  styles.statusBadge,
                  item.status === 'active' && styles.statusActive,
                  item.status === 'delivered' && styles.statusDelivered,
                ]}
              >
                <Text style={styles.statusText}>{item.status}</Text>
              </View>
            )}
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
          <Text style={styles.headerTitle}>Projects</Text>
          <Pressable
            style={styles.addButton}
            onPress={() => router.push('/(common)/project/new' as Href)}
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
              placeholder="Search projects..."
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

        {/* Projects List */}
        <FlatList
          data={filteredProjects}
          renderItem={renderProjectItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="folder-open-outline" size={64} color={theme.colors.textSecondary} />
              <Text style={styles.emptyTitle}>No Projects</Text>
              <Text style={styles.emptyText}>
                {searchQuery ? 'No projects match your search' : 'Create your first project'}
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
    listContent: {
      padding: spacing[6],
      paddingBottom: 120,
    },
    projectCard: {
      flexDirection: 'row',
      backgroundColor: isDark ? colors.neutral[800] : colors.white,
      borderRadius: borderRadius.lg,
      overflow: 'hidden',
      marginBottom: spacing[4],
      ...shadows.sm,
    },
    cardPressed: {
      opacity: 0.9,
      transform: [{ scale: 0.98 }],
    },
    projectImage: {
      width: 100,
      height: 100,
    },
    projectInfo: {
      flex: 1,
      padding: spacing[3],
      justifyContent: 'space-between',
    },
    projectTitle: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      color: theme.colors.text,
    },
    projectMeta: {
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
    statusBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: spacing[2],
      paddingVertical: spacing[1],
      borderRadius: borderRadius.sm,
      backgroundColor: colors.neutral[200],
      marginTop: spacing[2],
    },
    statusActive: {
      backgroundColor: colors.success.light + '40',
    },
    statusDelivered: {
      backgroundColor: colors.primary[100],
    },
    statusText: {
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.medium,
      color: theme.colors.text,
      textTransform: 'capitalize',
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

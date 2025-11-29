/**
 * Project Detail Screen
 * View and manage project details (for studio users)
 */

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, router, Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { useTheme } from '@/theme/ThemeProvider';
import { apiClient, API_BASE_URL } from '@/services/api/client';
import { colors, spacing, borderRadius, typography, shadows } from '@/theme';
import type { Project, Photo, Client } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProjectDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme, isDark } = useTheme();

  const [project, setProject] = useState<Project | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [client, setClient] = useState<Client | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchProjectData();
  }, [id]);

  const fetchProjectData = async () => {
    try {
      // Fetch project details
      const projectData = await apiClient.get<Project>(`/api/projects/${id}`);
      setProject(projectData);

      // Fetch photos preview using V2 endpoint
      const photosResponse = await apiClient.get<{ photos: Photo[] }>(
        `/v2/photos/projects/${id}/photos?limit=6`
      );
      setPhotos(photosResponse.photos || []);

      // Fetch client if assigned
      if (projectData.client_id) {
        try {
          const clientData = await apiClient.get<Client>(
            `/v2/clients/${projectData.client_id}`
          );
          setClient(clientData);
        } catch (e) {
          console.log('Client not found');
        }
      }
    } catch (error) {
      console.error('Failed to fetch project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'active':
        return colors.success.main;
      case 'delivered':
        return colors.info.main;
      case 'draft':
        return colors.warning.main;
      case 'archived':
        return colors.neutral[400];
      default:
        return colors.neutral[400];
    }
  };

  const styles = createStyles(theme, isDark);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  if (!project) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="folder-outline" size={64} color={theme.colors.textSecondary} />
          <Text style={styles.errorTitle}>Project Not Found</Text>
          <Pressable onPress={() => router.back()} style={styles.backLink}>
            <Text style={styles.backLinkText}>Go Back</Text>
          </Pressable>
        </View>
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
          <View style={styles.headerTitle}>
            <Text style={styles.title} numberOfLines={1}>{project.title}</Text>
          </View>
          <Pressable style={styles.actionButton}>
            <Ionicons name="ellipsis-vertical" size={22} color={theme.colors.text} />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Cover Image */}
          <Image
            source={{ uri: project.cover_photo_src || `${API_BASE_URL}/placeholder-project.jpg` }}
            style={styles.coverImage}
            contentFit="cover"
          />

          {/* Project Info */}
          <Animated.View entering={FadeInDown} style={styles.infoSection}>
            <View style={styles.infoRow}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{project.photo_count}</Text>
                <Text style={styles.statLabel}>Photos</Text>
              </View>
              <View style={styles.stat}>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(project.status) + '20' }]}>
                  <Text style={[styles.statusText, { color: getStatusColor(project.status) }]}>
                    {project.status || 'draft'}
                  </Text>
                </View>
                <Text style={styles.statLabel}>Status</Text>
              </View>
              <View style={styles.stat}>
                <Text style={styles.statValue}>
                  {project.shoot_date ? new Date(project.shoot_date).toLocaleDateString() : '-'}
                </Text>
                <Text style={styles.statLabel}>Shoot Date</Text>
              </View>
            </View>
          </Animated.View>

          {/* Quick Actions */}
          <Animated.View entering={FadeInDown.delay(100)} style={styles.actionsSection}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.actionsGrid}>
              <Pressable
                onPress={() => router.push(`/(common)/gallery/${id}` as Href)}
                style={styles.actionCard}
              >
                <View style={[styles.actionIcon, { backgroundColor: theme.colors.primary + '15' }]}>
                  <Ionicons name="images" size={24} color={theme.colors.primary} />
                </View>
                <Text style={styles.actionText}>View Gallery</Text>
              </Pressable>
              <Pressable style={styles.actionCard}>
                <View style={[styles.actionIcon, { backgroundColor: colors.success.main + '15' }]}>
                  <Ionicons name="cloud-upload" size={24} color={colors.success.main} />
                </View>
                <Text style={styles.actionText}>Upload Photos</Text>
              </Pressable>
              <Pressable style={styles.actionCard}>
                <View style={[styles.actionIcon, { backgroundColor: colors.info.main + '15' }]}>
                  <Ionicons name="share-social" size={24} color={colors.info.main} />
                </View>
                <Text style={styles.actionText}>Share</Text>
              </Pressable>
              <Pressable style={styles.actionCard}>
                <View style={[styles.actionIcon, { backgroundColor: colors.warning.main + '15' }]}>
                  <Ionicons name="settings" size={24} color={colors.warning.main} />
                </View>
                <Text style={styles.actionText}>Settings</Text>
              </Pressable>
            </View>
          </Animated.View>

          {/* Client Info */}
          {client && (
            <Animated.View entering={FadeInDown.delay(200)} style={styles.section}>
              <Text style={styles.sectionTitle}>Client</Text>
              <Pressable
                onPress={() => router.push(`/(common)/client/${client.id}` as Href)}
                style={styles.clientCard}
              >
                <View style={styles.clientAvatar}>
                  <Text style={styles.avatarText}>
                    {client.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.clientInfo}>
                  <Text style={styles.clientName}>{client.name}</Text>
                  <Text style={styles.clientEmail}>{client.email}</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={theme.colors.textSecondary} />
              </Pressable>
            </Animated.View>
          )}

          {/* Recent Photos */}
          {photos.length > 0 && (
            <Animated.View entering={FadeInDown.delay(300)} style={styles.section}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Photos</Text>
                <Pressable onPress={() => router.push(`/(common)/gallery/${id}` as Href)}>
                  <Text style={styles.seeAllText}>See all</Text>
                </Pressable>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {photos.map((photo, index) => (
                  <Pressable
                    key={photo.id}
                    onPress={() => router.push({
                      pathname: '/(common)/photo/[id]' as any,
                      params: { id: photo.id, projectId: id, initialIndex: index.toString() },
                    })}
                    style={styles.photoThumb}
                  >
                    <Image
                      source={{ uri: photo.thumbnail_src || photo.src }}
                      style={styles.thumbImage}
                      contentFit="cover"
                    />
                  </Pressable>
                ))}
              </ScrollView>
            </Animated.View>
          )}

          <View style={{ height: 40 }} />
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
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing[6],
    },
    errorTitle: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.semibold,
      color: theme.colors.text,
      marginTop: spacing[4],
    },
    backLink: {
      marginTop: spacing[4],
    },
    backLinkText: {
      fontSize: typography.fontSize.base,
      color: theme.colors.primary,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
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
      flex: 1,
      marginLeft: spacing[3],
    },
    title: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: theme.colors.text,
    },
    actionButton: {
      width: 40,
      height: 40,
      borderRadius: borderRadius.full,
      backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100],
      alignItems: 'center',
      justifyContent: 'center',
    },
    coverImage: {
      width: SCREEN_WIDTH,
      height: 200,
    },
    infoSection: {
      padding: spacing[4],
      backgroundColor: theme.colors.surface,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    stat: {
      alignItems: 'center',
    },
    statValue: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.bold,
      color: theme.colors.text,
    },
    statLabel: {
      fontSize: typography.fontSize.sm,
      color: theme.colors.textSecondary,
      marginTop: spacing[1],
    },
    statusBadge: {
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[1],
      borderRadius: borderRadius.full,
    },
    statusText: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      textTransform: 'capitalize',
    },
    actionsSection: {
      padding: spacing[4],
    },
    sectionTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: theme.colors.text,
      marginBottom: spacing[3],
    },
    actionsGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing[3],
    },
    actionCard: {
      width: (SCREEN_WIDTH - spacing[4] * 2 - spacing[3]) / 2,
      backgroundColor: isDark ? colors.neutral[800] : colors.white,
      borderRadius: borderRadius.lg,
      padding: spacing[4],
      alignItems: 'center',
      ...shadows.sm,
    },
    actionIcon: {
      width: 48,
      height: 48,
      borderRadius: borderRadius.lg,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing[2],
    },
    actionText: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      color: theme.colors.text,
    },
    section: {
      padding: spacing[4],
    },
    sectionHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing[3],
    },
    seeAllText: {
      fontSize: typography.fontSize.sm,
      color: theme.colors.primary,
    },
    clientCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: isDark ? colors.neutral[800] : colors.white,
      borderRadius: borderRadius.lg,
      padding: spacing[4],
      ...shadows.sm,
    },
    clientAvatar: {
      width: 48,
      height: 48,
      borderRadius: borderRadius.full,
      backgroundColor: theme.colors.primary + '20',
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: theme.colors.primary,
    },
    clientInfo: {
      flex: 1,
      marginLeft: spacing[3],
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
    photoThumb: {
      width: 100,
      height: 100,
      marginRight: spacing[2],
      borderRadius: borderRadius.md,
      overflow: 'hidden',
    },
    thumbImage: {
      width: '100%',
      height: '100%',
    },
  });

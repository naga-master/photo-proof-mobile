/**
 * Client Detail Screen
 * View client details and their projects
 */

import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  Linking,
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
import type { Client, Project } from '@/types';

export default function ClientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme, isDark } = useTheme();

  const [client, setClient] = useState<Client | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchClientData();
  }, [id]);

  const fetchClientData = async () => {
    try {
      const clientData = await apiClient.get<Client>(`/v2/clients/${id}`);
      setClient(clientData);

      // Fetch client's projects
      const projectsResponse = await apiClient.get<{ projects: Project[] }>(
        `/api/projects/?client_id=${id}`
      );
      setProjects(projectsResponse.projects || []);
    } catch (error) {
      console.error('Failed to fetch client:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCall = () => {
    if (client?.phone) {
      Linking.openURL(`tel:${client.phone}`);
    }
  };

  const handleEmail = () => {
    if (client?.email) {
      Linking.openURL(`mailto:${client.email}`);
    }
  };

  const handleWhatsApp = () => {
    if (client?.phone) {
      Linking.openURL(`whatsapp://send?phone=${client.phone}`);
    }
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

  const renderProjectItem = useCallback(
    ({ item, index }: { item: Project; index: number }) => (
      <Animated.View entering={FadeInDown.delay(index * 100)}>
        <Pressable
          onPress={() => router.push(`/(common)/project/${item.id}` as Href)}
          style={({ pressed }) => [styles.projectCard, pressed && styles.cardPressed]}
        >
          <Image
            source={{ uri: item.cover_photo_src || `${API_BASE_URL}/placeholder-project.jpg` }}
            style={styles.projectImage}
            contentFit="cover"
          />
          <View style={styles.projectInfo}>
            <Text style={styles.projectTitle} numberOfLines={1}>{item.title}</Text>
            <View style={styles.projectMeta}>
              <Ionicons name="images-outline" size={14} color={theme.colors.textSecondary} />
              <Text style={styles.metaText}>{item.photo_count} photos</Text>
            </View>
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

  if (!client) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="person-outline" size={64} color={theme.colors.textSecondary} />
          <Text style={styles.errorTitle}>Client Not Found</Text>
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
          <Text style={styles.headerTitle}>Client Details</Text>
          <Pressable style={styles.actionButton}>
            <Ionicons name="create-outline" size={22} color={theme.colors.text} />
          </Pressable>
        </View>

        <FlatList
          data={projects}
          renderItem={renderProjectItem}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={
            <>
              {/* Client Profile */}
              <Animated.View entering={FadeIn} style={styles.profileSection}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{getInitials(client.name)}</Text>
                </View>
                <Text style={styles.clientName}>{client.name}</Text>
                <Text style={styles.clientEmail}>{client.email}</Text>
                {client.phone && (
                  <Text style={styles.clientPhone}>{client.phone}</Text>
                )}

                {/* Contact Actions */}
                <View style={styles.contactActions}>
                  <Pressable onPress={handleCall} style={styles.contactButton}>
                    <Ionicons name="call" size={20} color={colors.white} />
                  </Pressable>
                  <Pressable onPress={handleEmail} style={styles.contactButton}>
                    <Ionicons name="mail" size={20} color={colors.white} />
                  </Pressable>
                  <Pressable onPress={handleWhatsApp} style={[styles.contactButton, { backgroundColor: '#25D366' }]}>
                    <Ionicons name="logo-whatsapp" size={20} color={colors.white} />
                  </Pressable>
                </View>
              </Animated.View>

              {/* Stats */}
              <Animated.View entering={FadeInDown.delay(100)} style={styles.statsRow}>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>{projects.length}</Text>
                  <Text style={styles.statLabel}>Projects</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>
                    {projects.reduce((sum, p) => sum + p.photo_count, 0)}
                  </Text>
                  <Text style={styles.statLabel}>Photos</Text>
                </View>
                <View style={styles.statCard}>
                  <Text style={styles.statValue}>
                    {client.status === 'active' ? 'Active' : 'Inactive'}
                  </Text>
                  <Text style={styles.statLabel}>Status</Text>
                </View>
              </Animated.View>

              {/* Projects Header */}
              {projects.length > 0 && (
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Projects</Text>
                </View>
              )}
            </>
          }
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyProjects}>
              <Ionicons name="folder-open-outline" size={48} color={theme.colors.textSecondary} />
              <Text style={styles.emptyText}>No projects yet</Text>
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
    listContent: {
      paddingBottom: spacing[8],
    },
    profileSection: {
      alignItems: 'center',
      paddingVertical: spacing[8],
      backgroundColor: theme.colors.surface,
    },
    avatar: {
      width: 100,
      height: 100,
      borderRadius: 50,
      backgroundColor: theme.colors.primary + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing[4],
    },
    avatarText: {
      fontSize: typography.fontSize['3xl'],
      fontWeight: typography.fontWeight.bold,
      color: theme.colors.primary,
    },
    clientName: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.bold,
      color: theme.colors.text,
    },
    clientEmail: {
      fontSize: typography.fontSize.base,
      color: theme.colors.textSecondary,
      marginTop: spacing[1],
    },
    clientPhone: {
      fontSize: typography.fontSize.base,
      color: theme.colors.textSecondary,
      marginTop: spacing[0.5],
    },
    contactActions: {
      flexDirection: 'row',
      gap: spacing[4],
      marginTop: spacing[6],
    },
    contactButton: {
      width: 48,
      height: 48,
      borderRadius: borderRadius.full,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    statsRow: {
      flexDirection: 'row',
      gap: spacing[3],
      padding: spacing[4],
    },
    statCard: {
      flex: 1,
      backgroundColor: isDark ? colors.neutral[800] : colors.white,
      borderRadius: borderRadius.lg,
      padding: spacing[4],
      alignItems: 'center',
      ...shadows.sm,
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
    sectionHeader: {
      paddingHorizontal: spacing[4],
      paddingTop: spacing[4],
      paddingBottom: spacing[2],
    },
    sectionTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: theme.colors.text,
    },
    projectCard: {
      flexDirection: 'row',
      backgroundColor: isDark ? colors.neutral[800] : colors.white,
      borderRadius: borderRadius.lg,
      marginHorizontal: spacing[4],
      marginBottom: spacing[3],
      overflow: 'hidden',
      ...shadows.sm,
    },
    cardPressed: {
      opacity: 0.9,
    },
    projectImage: {
      width: 100,
      height: 100,
    },
    projectInfo: {
      flex: 1,
      padding: spacing[3],
      justifyContent: 'center',
    },
    projectTitle: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      color: theme.colors.text,
    },
    projectMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[1],
      marginTop: spacing[2],
    },
    metaText: {
      fontSize: typography.fontSize.sm,
      color: theme.colors.textSecondary,
    },
    emptyProjects: {
      alignItems: 'center',
      paddingVertical: spacing[8],
    },
    emptyText: {
      fontSize: typography.fontSize.base,
      color: theme.colors.textSecondary,
      marginTop: spacing[2],
    },
  });

/**
 * Gallery Detail Screen
 * Shows photos in a project/album with folder navigation and layout options
 */

import { useState, useEffect, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  Dimensions,
  ScrollView,
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
import type { Project, Photo, Folder, LayoutId } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Layout configurations
const LAYOUTS: Record<LayoutId, { columns: number; aspectRatio: number; gap: number }> = {
  layout1: { columns: 3, aspectRatio: 1, gap: 2 },      // Grid 3x3 square
  layout2: { columns: 2, aspectRatio: 1, gap: 4 },      // Grid 2x2 square
  layout3: { columns: 1, aspectRatio: 1.5, gap: 8 },    // Single column landscape
  layout4: { columns: 3, aspectRatio: 0.75, gap: 2 },   // Grid 3 portrait
  layout5: { columns: 2, aspectRatio: 0.75, gap: 4 },   // Grid 2 portrait
  layout6: { columns: 4, aspectRatio: 1, gap: 1 },      // Grid 4x4 compact
  layout7: { columns: 1, aspectRatio: 0.66, gap: 12 },  // Single portrait large
  layout8: { columns: 2, aspectRatio: 1.5, gap: 4 },    // Grid 2 landscape
  layout9: { columns: 3, aspectRatio: 1.2, gap: 3 },    // Masonry style
};

export default function GalleryScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme, isDark } = useTheme();

  const [project, setProject] = useState<Project | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedLayout, setSelectedLayout] = useState<LayoutId>('layout1');
  const [showLayoutPicker, setShowLayoutPicker] = useState(false);
  const [selectedPhotos, setSelectedPhotos] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  useEffect(() => {
    fetchGalleryData();
  }, [id]);

  useEffect(() => {
    fetchPhotos();
  }, [currentFolderId]);

  const fetchGalleryData = async () => {
    try {
      // Fetch project details
      const projectData = await apiClient.get<Project>(`/api/projects/${id}`);
      setProject(projectData);
      setSelectedLayout(projectData.layout || 'layout1');

      // Fetch folders if project has them
      if (projectData.has_folders) {
        const foldersData = await apiClient.get<{ folders: Folder[] }>(
          `/api/projects/${id}/folders`
        );
        setFolders(foldersData.folders || []);
      }

      // Fetch photos
      await fetchPhotos();
    } catch (error) {
      console.error('Failed to fetch gallery data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPhotos = async () => {
    try {
      const endpoint = currentFolderId
        ? `/api/projects/${id}/folders/${currentFolderId}/photos`
        : `/api/projects/${id}/photos`;
      
      const response = await apiClient.get<{ photos: Photo[] }>(endpoint);
      setPhotos(response.photos || []);
    } catch (error) {
      console.error('Failed to fetch photos:', error);
    }
  };

  const handlePhotoPress = (photo: Photo, index: number) => {
    if (isSelectionMode) {
      togglePhotoSelection(photo.id);
    } else {
      router.push({
        pathname: '/(common)/photo/[id]' as any,
        params: { 
          id: photo.id, 
          projectId: id,
          folderId: currentFolderId || '',
          initialIndex: index.toString(),
        },
      });
    }
  };

  const togglePhotoSelection = (photoId: string) => {
    setSelectedPhotos((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(photoId)) {
        newSet.delete(photoId);
      } else {
        newSet.add(photoId);
      }
      return newSet;
    });
  };

  const handleFolderPress = (folder: Folder) => {
    setCurrentFolderId(folder.id);
  };

  const handleBackToRoot = () => {
    setCurrentFolderId(null);
  };

  const toggleFavorite = async (photoId: string) => {
    try {
      await apiClient.post(`/api/photos/${photoId}/favorite`);
      setPhotos((prev) =>
        prev.map((p) => (p.id === photoId ? { ...p, is_favorite: !p.is_favorite } : p))
      );
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
    }
  };

  const layout = LAYOUTS[selectedLayout];
  const photoWidth = (SCREEN_WIDTH - spacing[4] * 2 - layout.gap * (layout.columns - 1)) / layout.columns;
  const photoHeight = photoWidth / layout.aspectRatio;

  const styles = createStyles(theme, isDark, layout);

  const currentFolder = folders.find((f) => f.id === currentFolderId);

  const renderPhoto = useCallback(
    ({ item, index }: { item: Photo; index: number }) => {
      const isSelected = selectedPhotos.has(item.id);
      
      return (
        <Animated.View entering={FadeInDown.delay(index * 20).duration(300)}>
          <Pressable
            onPress={() => handlePhotoPress(item, index)}
            onLongPress={() => {
              setIsSelectionMode(true);
              togglePhotoSelection(item.id);
            }}
            style={({ pressed }) => [
              styles.photoContainer,
              { width: photoWidth, height: photoHeight },
              pressed && styles.photoPressed,
              isSelected && styles.photoSelected,
            ]}
          >
            <Image
              source={{ uri: item.thumbnail_src || item.src }}
              style={styles.photo}
              contentFit="cover"
              transition={200}
            />
            
            {/* Favorite indicator */}
            {item.is_favorite && (
              <View style={styles.favoriteIndicator}>
                <Ionicons name="heart" size={16} color={colors.error.main} />
              </View>
            )}

            {/* Selection indicator */}
            {isSelectionMode && (
              <View style={[styles.selectionIndicator, isSelected && styles.selectionIndicatorActive]}>
                {isSelected && <Ionicons name="checkmark" size={16} color={colors.white} />}
              </View>
            )}
          </Pressable>
        </Animated.View>
      );
    },
    [photoWidth, photoHeight, isSelectionMode, selectedPhotos, theme]
  );

  const renderFolder = useCallback(
    ({ item, index }: { item: Folder; index: number }) => (
      <Animated.View entering={FadeInDown.delay(index * 50)}>
        <Pressable
          onPress={() => handleFolderPress(item)}
          style={({ pressed }) => [styles.folderCard, pressed && styles.folderPressed]}
        >
          <Image
            source={{ uri: item.cover_photo_src || `${API_BASE_URL}/placeholder-folder.jpg` }}
            style={styles.folderImage}
            contentFit="cover"
          />
          <View style={styles.folderOverlay}>
            <Ionicons name="folder" size={24} color={colors.white} />
            <Text style={styles.folderName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.folderCount}>{item.photo_count} photos</Text>
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
          
          <View style={styles.headerTitle}>
            <Text style={styles.title} numberOfLines={1}>
              {currentFolder?.name || project?.title || 'Gallery'}
            </Text>
            <Text style={styles.subtitle}>
              {photos.length} photos
            </Text>
          </View>

          <View style={styles.headerActions}>
            <Pressable
              onPress={() => setShowLayoutPicker(!showLayoutPicker)}
              style={styles.actionButton}
            >
              <Ionicons name="grid-outline" size={22} color={theme.colors.text} />
            </Pressable>
            
            {isSelectionMode ? (
              <Pressable
                onPress={() => {
                  setIsSelectionMode(false);
                  setSelectedPhotos(new Set());
                }}
                style={styles.actionButton}
              >
                <Ionicons name="close" size={22} color={theme.colors.text} />
              </Pressable>
            ) : (
              <Pressable style={styles.actionButton}>
                <Ionicons name="ellipsis-vertical" size={22} color={theme.colors.text} />
              </Pressable>
            )}
          </View>
        </View>

        {/* Breadcrumb for folders */}
        {currentFolderId && (
          <Pressable onPress={handleBackToRoot} style={styles.breadcrumb}>
            <Ionicons name="arrow-back" size={16} color={theme.colors.primary} />
            <Text style={styles.breadcrumbText}>Back to all folders</Text>
          </Pressable>
        )}

        {/* Layout Picker */}
        {showLayoutPicker && (
          <Animated.View entering={FadeIn} style={styles.layoutPicker}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {(Object.keys(LAYOUTS) as LayoutId[]).map((layoutId) => (
                <Pressable
                  key={layoutId}
                  onPress={() => {
                    setSelectedLayout(layoutId);
                    setShowLayoutPicker(false);
                  }}
                  style={[
                    styles.layoutOption,
                    selectedLayout === layoutId && styles.layoutOptionActive,
                  ]}
                >
                  <View style={styles.layoutPreview}>
                    {Array.from({ length: Math.min(LAYOUTS[layoutId].columns * 2, 6) }).map((_, i) => (
                      <View
                        key={i}
                        style={styles.layoutPreviewCell}
                      />
                    ))}
                  </View>
                  <Text style={styles.layoutLabel}>
                    {layoutId.replace('layout', 'Layout ')}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </Animated.View>
        )}

        {/* Selection bar */}
        {isSelectionMode && selectedPhotos.size > 0 && (
          <View style={styles.selectionBar}>
            <Text style={styles.selectionCount}>
              {selectedPhotos.size} selected
            </Text>
            <View style={styles.selectionActions}>
              <Pressable style={styles.selectionAction}>
                <Ionicons name="heart-outline" size={20} color={theme.colors.primary} />
                <Text style={styles.selectionActionText}>Favorite</Text>
              </Pressable>
              <Pressable style={styles.selectionAction}>
                <Ionicons name="download-outline" size={20} color={theme.colors.primary} />
                <Text style={styles.selectionActionText}>Download</Text>
              </Pressable>
              <Pressable style={styles.selectionAction}>
                <Ionicons name="cart-outline" size={20} color={theme.colors.primary} />
                <Text style={styles.selectionActionText}>Add to Cart</Text>
              </Pressable>
            </View>
          </View>
        )}

        {/* Folders (if at root level and has folders) */}
        {!currentFolderId && folders.length > 0 && (
          <View style={styles.foldersSection}>
            <Text style={styles.sectionTitle}>Folders</Text>
            <FlatList
              data={folders}
              renderItem={renderFolder}
              keyExtractor={(item) => item.id}
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.foldersList}
            />
          </View>
        )}

        {/* Photos Grid */}
        <FlatList
          data={photos}
          renderItem={renderPhoto}
          keyExtractor={(item) => item.id}
          numColumns={layout.columns}
          key={selectedLayout} // Force re-render when layout changes
          contentContainerStyle={styles.photosGrid}
          columnWrapperStyle={layout.columns > 1 ? { gap: layout.gap } : undefined}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="images-outline" size={64} color={theme.colors.textSecondary} />
              <Text style={styles.emptyTitle}>No Photos</Text>
              <Text style={styles.emptyText}>
                {currentFolderId ? 'This folder is empty' : 'No photos in this album yet'}
              </Text>
            </View>
          }
        />
      </SafeAreaView>
    </>
  );
}

const createStyles = (theme: any, isDark: boolean, layout: any) =>
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
    subtitle: {
      fontSize: typography.fontSize.sm,
      color: theme.colors.textSecondary,
    },
    headerActions: {
      flexDirection: 'row',
      gap: spacing[2],
    },
    actionButton: {
      width: 40,
      height: 40,
      borderRadius: borderRadius.full,
      backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100],
      alignItems: 'center',
      justifyContent: 'center',
    },
    breadcrumb: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[2],
      gap: spacing[1],
    },
    breadcrumbText: {
      fontSize: typography.fontSize.sm,
      color: theme.colors.primary,
    },
    layoutPicker: {
      paddingVertical: spacing[3],
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    layoutOption: {
      alignItems: 'center',
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[2],
      marginHorizontal: spacing[1],
      borderRadius: borderRadius.lg,
      backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100],
    },
    layoutOptionActive: {
      backgroundColor: theme.colors.primary + '20',
      borderWidth: 2,
      borderColor: theme.colors.primary,
    },
    layoutPreview: {
      width: 50,
      height: 50,
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 2,
      justifyContent: 'center',
      alignItems: 'center',
    },
    layoutPreviewCell: {
      backgroundColor: theme.colors.textSecondary,
      borderRadius: 2,
      width: 12,
      height: 12,
    },
    layoutLabel: {
      fontSize: typography.fontSize.xs,
      color: theme.colors.textSecondary,
      marginTop: spacing[1],
    },
    selectionBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[3],
      backgroundColor: theme.colors.primary + '10',
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    selectionCount: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      color: theme.colors.primary,
    },
    selectionActions: {
      flexDirection: 'row',
      gap: spacing[4],
    },
    selectionAction: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[1],
    },
    selectionActionText: {
      fontSize: typography.fontSize.sm,
      color: theme.colors.primary,
    },
    foldersSection: {
      paddingTop: spacing[4],
    },
    sectionTitle: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      color: theme.colors.text,
      paddingHorizontal: spacing[4],
      marginBottom: spacing[3],
    },
    foldersList: {
      paddingHorizontal: spacing[4],
    },
    folderCard: {
      width: 140,
      height: 100,
      marginRight: spacing[3],
      borderRadius: borderRadius.lg,
      overflow: 'hidden',
    },
    folderPressed: {
      opacity: 0.8,
    },
    folderImage: {
      width: '100%',
      height: '100%',
    },
    folderOverlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing[2],
    },
    folderName: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: colors.white,
      marginTop: spacing[1],
      textAlign: 'center',
    },
    folderCount: {
      fontSize: typography.fontSize.xs,
      color: 'rgba(255,255,255,0.8)',
    },
    photosGrid: {
      padding: spacing[4],
      paddingBottom: 100,
      gap: layout.gap,
    },
    photoContainer: {
      borderRadius: borderRadius.sm,
      overflow: 'hidden',
      marginBottom: layout.gap,
    },
    photoPressed: {
      opacity: 0.8,
    },
    photoSelected: {
      opacity: 0.7,
    },
    photo: {
      width: '100%',
      height: '100%',
    },
    favoriteIndicator: {
      position: 'absolute',
      top: spacing[1],
      right: spacing[1],
      width: 24,
      height: 24,
      borderRadius: borderRadius.full,
      backgroundColor: 'rgba(255,255,255,0.9)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    selectionIndicator: {
      position: 'absolute',
      top: spacing[1],
      left: spacing[1],
      width: 24,
      height: 24,
      borderRadius: borderRadius.full,
      borderWidth: 2,
      borderColor: colors.white,
      backgroundColor: 'rgba(0,0,0,0.3)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    selectionIndicatorActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
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

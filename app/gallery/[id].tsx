import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { FlashList } from '@shopify/flash-list';
import { Image } from 'expo-image';
import Animated, { FadeIn, FadeInRight } from 'react-native-reanimated';
import { projectService, Project } from '@/services/api/projects';
import { photoService, Photo } from '@/services/api/photos';
import Toast from 'react-native-toast-message';
import { haptics } from '@/utils/haptics';
import { ErrorState } from '@/components/common/ErrorState';
import { EmptyState } from '@/components/common/EmptyState';
import { handleApiError, isNotFoundError } from '@/utils/apiErrors';
import type { ErrorInfo } from '@/components/common/ErrorState';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const NUM_COLUMNS = 3;
const GAP = 2;
const ITEM_SIZE = (SCREEN_WIDTH - GAP * (NUM_COLUMNS + 1)) / NUM_COLUMNS;

export default function GalleryDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<ErrorInfo | null>(null);
  const [galleryProcessingIssues, setGalleryProcessingIssues] = useState(0);

  useEffect(() => {
    if (id) {
      fetchGalleryData();
    }
  }, [id]);

  // Count processing issues in this gallery
  useEffect(() => {
    if (photos) {
      const issues = photos.filter(p => p.processing_error).length;
      setGalleryProcessingIssues(issues);
    }
  }, [photos]);

  // Auto-refresh when photos are processing
  useEffect(() => {
    const hasProcessing = photos.some(p => p.status === 'processing');
    
    if (hasProcessing) {
      const interval = setInterval(() => {
        fetchGalleryData(); // Refresh silently
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [photos]);

  const fetchGalleryData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch project details
      const projectData = await projectService.getProject(parseInt(id));
      setProject(projectData);
      
      // Fetch photos
      const photosData = await photoService.getProjectPhotos(parseInt(id));
      setPhotos(photosData);
    } catch (err: any) {
      console.error('Failed to fetch gallery:', err);
      const errorInfo = handleApiError(err);
      setError(errorInfo);
      
      // Only show toast for non-404 errors (404 shows empty state)
      if (!isNotFoundError(err)) {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: errorInfo.message,
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchGalleryData();
    setRefreshing(false);
  };

  const handlePhotoPress = (photo: Photo) => {
    haptics.impact('light');
    // TODO: Navigate to photo viewer
    router.push(`/photo/${photo.id}`);
  };

  const handleBackPress = () => {
    haptics.impact('light');
    router.back();
  };

  const renderPhoto = ({ item, index }: { item: Photo; index: number }) => {
    const photoUrl = photoService.getPhotoUrl(item.id, 'small');
    
    return (
      <Animated.View
        entering={FadeInRight.delay(index * 20).springify()}
        style={styles.photoContainer}
      >
        <Pressable
          onPress={() => handlePhotoPress(item)}
          style={({ pressed }) => [
            styles.photoItem,
            pressed && styles.photoItemPressed,
          ]}
        >
          <Image
            source={{ uri: photoUrl }}
            style={styles.photoImage}
            contentFit="cover"
            transition={200}
            placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
          />
          
          {/* Favorite indicator */}
          {item.is_favorite && (
            <View style={styles.favoriteIndicator}>
              <Ionicons name="heart" size={16} color="#EF4444" />
            </View>
          )}
          
          {/* Selected indicator */}
          {item.is_selected && (
            <View style={styles.selectedIndicator}>
              <Ionicons name="checkmark-circle" size={20} color="#10B981" />
            </View>
          )}
        </Pressable>
      </Animated.View>
    );
  };

  const EmptyState = () => (
    <Animated.View entering={FadeIn} style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="images-outline" size={64} color="#D1D5DB" />
      </View>
      <Text style={styles.emptyTitle}>No Photos Yet</Text>
      <Text style={styles.emptySubtitle}>
        This gallery doesn't have any photos
      </Text>
    </Animated.View>
  );

  // Loading state
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667EEA" />
        <Text style={styles.loadingText}>Loading gallery...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={handleBackPress} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </Pressable>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Error</Text>
          </View>
        </View>
        <ErrorState 
          error={error} 
          onRetry={fetchGalleryData}
          onDismiss={handleBackPress}
        />
      </SafeAreaView>
    );
  }

  // No gallery found
  if (!project) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={handleBackPress} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </Pressable>
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Gallery Not Found</Text>
          </View>
        </View>
        <EmptyState
          icon="search-outline"
          title="Gallery Not Found"
          message="This gallery doesn't exist or has been removed."
          actionLabel="Go Back"
          onAction={handleBackPress}
        />
      </SafeAreaView>
    );
  }

  return (
    <>
      <StatusBar style="light" />
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={handleBackPress} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </Pressable>
          
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {project?.title || 'Gallery'}
            </Text>
            <Text style={styles.headerSubtitle}>
              {photos.length} {photos.length === 1 ? 'photo' : 'photos'}
            </Text>
          </View>
          
          <Pressable style={styles.moreButton}>
            <Ionicons name="ellipsis-horizontal" size={24} color="white" />
          </Pressable>
        </View>

        {/* Processing Issues Banner */}
        {galleryProcessingIssues > 0 && (
          <Pressable 
            style={styles.processingBanner}
            onPress={() => {
              router.push('/(tabs)/activity');
            }}
          >
            <Ionicons name="warning" size={20} color="#EF4444" />
            <Text style={styles.bannerText}>
              {galleryProcessingIssues} photo{galleryProcessingIssues > 1 ? 's' : ''} failed processing
            </Text>
            <Text style={styles.bannerAction}>View Details →</Text>
          </Pressable>
        )}

        {/* Photo Grid */}
        {photos.length === 0 ? (
          <EmptyState />
        ) : (
          <FlashList
            data={photos}
            renderItem={renderPhoto}
            keyExtractor={(item) => item.id.toString()}
            numColumns={NUM_COLUMNS}
            estimatedItemSize={ITEM_SIZE}
            contentContainerStyle={styles.gridContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="white"
              />
            }
          />
        )}

        {/* Action Bar */}
        <View style={styles.actionBar}>
          <Pressable style={styles.actionButton}>
            <Ionicons name="heart-outline" size={24} color="#374151" />
            <Text style={styles.actionButtonText}>Favorites</Text>
          </Pressable>
          
          <Pressable style={styles.actionButton}>
            <Ionicons name="checkmark-circle-outline" size={24} color="#374151" />
            <Text style={styles.actionButtonText}>Select</Text>
          </Pressable>
          
          <Pressable style={styles.actionButton}>
            <Ionicons name="share-outline" size={24} color="#374151" />
            <Text style={styles.actionButtonText}>Share</Text>
          </Pressable>
          
          <Pressable style={styles.actionButton}>
            <Ionicons name="download-outline" size={24} color="#374151" />
            <Text style={styles.actionButtonText}>Download</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.7)',
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.7)',
    marginTop: 2,
  },
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridContent: {
    padding: GAP,
  },
  photoContainer: {
    padding: GAP / 2,
  },
  photoItem: {
    width: ITEM_SIZE - GAP,
    height: ITEM_SIZE - GAP,
    borderRadius: 4,
    overflow: 'hidden',
    backgroundColor: '#1F2937',
  },
  photoItemPressed: {
    opacity: 0.8,
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  favoriteIndicator: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedIndicator: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    color: 'white',
    marginTop: 16,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#1F2937',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  actionBar: {
    flexDirection: 'row',
    backgroundColor: 'white',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  actionButtonText: {
    fontSize: 11,
    color: '#374151',
    marginTop: 4,
    fontWeight: '500',
  },
  processingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderLeftWidth: 4,
    borderLeftColor: '#EF4444',
    padding: 12,
    marginHorizontal: 12,
    marginTop: 12,
    borderRadius: 8,
    gap: 8,
  },
  bannerText: {
    flex: 1,
    fontSize: 14,
    color: '#991B1B',
    fontWeight: '500',
  },
  bannerAction: {
    fontSize: 14,
    color: '#EF4444',
    fontWeight: '600',
  },
});

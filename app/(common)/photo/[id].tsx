/**
 * Photo Viewer Screen
 * Full-screen photo viewer with gestures, comments, and actions
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  Dimensions,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  runOnJS,
} from 'react-native-reanimated';
import {
  Gesture,
  GestureDetector,
  GestureHandlerRootView,
} from 'react-native-gesture-handler';
import { BlurView } from 'expo-blur';

import { useTheme } from '@/theme/ThemeProvider';
import { useAuthStore } from '@/stores/authStore';
import { apiClient } from '@/services/api/client';
import { colors, spacing, borderRadius, typography, shadows } from '@/theme';
import type { Photo, Comment } from '@/types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function PhotoViewerScreen() {
  const { id, projectId, folderId, initialIndex } = useLocalSearchParams<{
    id: string;
    projectId: string;
    folderId?: string;
    initialIndex?: string;
  }>();
  const { theme, isDark } = useTheme();
  const { user } = useAuthStore();

  const [photo, setPhoto] = useState<Photo | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [currentIndex, setCurrentIndex] = useState(parseInt(initialIndex || '0', 10));
  const [isLoading, setIsLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Animation values
  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);

  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    fetchPhotoData();
    fetchAllPhotos();
  }, [id, projectId, folderId]);

  useEffect(() => {
    if (photo) {
      fetchComments();
    }
  }, [photo]);

  const fetchPhotoData = async () => {
    try {
      // Use V2 photos endpoint
      const photoData = await apiClient.get<Photo>(`/v2/photos/${id}`);
      setPhoto(photoData);
    } catch (error) {
      console.error('Failed to fetch photo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllPhotos = async () => {
    try {
      // Use V2 photos endpoint
      const endpoint = folderId
        ? `/v2/photos/projects/${projectId}/photos?folder_id=${folderId}`
        : `/v2/photos/projects/${projectId}/photos`;
      
      const response = await apiClient.get<{ photos: Photo[] }>(endpoint);
      setPhotos(response.photos || []);
    } catch (error) {
      console.error('Failed to fetch photos:', error);
    }
  };

  const fetchComments = async () => {
    try {
      // Use V2 comments endpoint
      const response = await apiClient.get<{ comments: Comment[] }>(
        `/v2/comments/photos/${photo?.id}`
      );
      setComments(response.comments || []);
    } catch (error) {
      console.error('Failed to fetch comments:', error);
      setComments([]);
    }
  };

  const handleSubmitComment = async () => {
    if (!newComment.trim() || !photo) return;

    setIsSubmittingComment(true);
    try {
      // Use V2 comments endpoint
      await apiClient.post(`/v2/comments/photos/${photo.id}`, {
        text: newComment.trim(),
      });
      setNewComment('');
      await fetchComments();
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const toggleFavorite = async () => {
    if (!photo) return;
    try {
      // Use V2 photos endpoint for favorite
      await apiClient.post(`/v2/photos/${photo.id}/favorite`);
      setPhoto((prev) => prev ? { ...prev, is_favorite: !prev.is_favorite } : null);
    } catch (error) {
      console.error('Failed to toggle favorite:', error);
      // Still toggle locally for demo
      setPhoto((prev) => prev ? { ...prev, is_favorite: !prev.is_favorite } : null);
    }
  };

  const goToPhoto = useCallback((index: number) => {
    if (index >= 0 && index < photos.length) {
      setCurrentIndex(index);
      setPhoto(photos[index]);
      flatListRef.current?.scrollToIndex({ index, animated: true });
    }
  }, [photos]);

  const toggleControls = () => {
    setShowControls((prev) => !prev);
  };

  // Pinch gesture for zooming
  const pinchGesture = Gesture.Pinch()
    .onUpdate((e) => {
      scale.value = Math.min(Math.max(e.scale, 0.5), 4);
    })
    .onEnd(() => {
      if (scale.value < 1) {
        scale.value = withSpring(1);
      }
    });

  // Pan gesture for moving zoomed image
  const panGesture = Gesture.Pan()
    .onUpdate((e) => {
      if (scale.value > 1) {
        translateX.value = e.translationX;
        translateY.value = e.translationY;
      }
    })
    .onEnd(() => {
      if (scale.value <= 1) {
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      }
    });

  // Double tap to zoom
  const doubleTapGesture = Gesture.Tap()
    .numberOfTaps(2)
    .onEnd(() => {
      if (scale.value > 1) {
        scale.value = withSpring(1);
        translateX.value = withSpring(0);
        translateY.value = withSpring(0);
      } else {
        scale.value = withSpring(2);
      }
    });

  // Single tap to toggle controls
  const singleTapGesture = Gesture.Tap()
    .numberOfTaps(1)
    .onEnd(() => {
      runOnJS(toggleControls)();
    });

  const composedGestures = Gesture.Exclusive(
    doubleTapGesture,
    Gesture.Simultaneous(pinchGesture, panGesture),
    singleTapGesture
  );

  const animatedImageStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  const styles = createStyles(theme, isDark);

  const renderPhotoItem = useCallback(
    ({ item }: { item: Photo }) => (
      <GestureDetector gesture={composedGestures}>
        <Animated.View style={[styles.photoContainer, animatedImageStyle]}>
          <Image
            source={{ uri: item.src }}
            style={styles.fullPhoto}
            contentFit="contain"
            transition={200}
          />
        </Animated.View>
      </GestureDetector>
    ),
    [composedGestures, animatedImageStyle]
  );

  const renderComment = useCallback(
    ({ item }: { item: Comment }) => (
      <Animated.View entering={FadeInDown} style={styles.commentItem}>
        <View style={styles.commentAvatar}>
          <Text style={styles.commentAvatarText}>
            {item.author_name.charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={styles.commentContent}>
          <View style={styles.commentHeader}>
            <Text style={styles.commentAuthor}>{item.author_name}</Text>
            <Text style={styles.commentTime}>
              {new Date(item.created_at).toLocaleDateString()}
            </Text>
          </View>
          <Text style={styles.commentText}>{item.text}</Text>
        </View>
      </Animated.View>
    ),
    [theme]
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.white} />
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={styles.container}>
      <StatusBar style="light" />
      
      {/* Photo Viewer */}
      <FlatList
        ref={flatListRef}
        data={photos}
        renderItem={renderPhotoItem}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        initialScrollIndex={currentIndex}
        getItemLayout={(_, index) => ({
          length: SCREEN_WIDTH,
          offset: SCREEN_WIDTH * index,
          index,
        })}
        onMomentumScrollEnd={(e) => {
          const newIndex = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
          if (newIndex !== currentIndex && photos[newIndex]) {
            setCurrentIndex(newIndex);
            setPhoto(photos[newIndex]);
          }
        }}
      />

      {/* Top Controls */}
      {showControls && (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.topControls}>
          <BlurView intensity={80} tint="dark" style={styles.controlsBlur}>
            <SafeAreaView edges={['top']} style={styles.topControlsContent}>
              <Pressable onPress={() => router.back()} style={styles.controlButton}>
                <Ionicons name="close" size={28} color={colors.white} />
              </Pressable>
              
              <View style={styles.photoCounter}>
                <Text style={styles.counterText}>
                  {currentIndex + 1} / {photos.length}
                </Text>
              </View>

              <View style={styles.topActions}>
                <Pressable onPress={toggleFavorite} style={styles.controlButton}>
                  <Ionicons
                    name={photo?.is_favorite ? 'heart' : 'heart-outline'}
                    size={24}
                    color={photo?.is_favorite ? colors.error.main : colors.white}
                  />
                </Pressable>
                <Pressable style={styles.controlButton}>
                  <Ionicons name="share-outline" size={24} color={colors.white} />
                </Pressable>
              </View>
            </SafeAreaView>
          </BlurView>
        </Animated.View>
      )}

      {/* Bottom Controls */}
      {showControls && (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.bottomControls}>
          <BlurView intensity={80} tint="dark" style={styles.controlsBlur}>
            <SafeAreaView edges={['bottom']} style={styles.bottomControlsContent}>
              <View style={styles.photoInfo}>
                <Text style={styles.photoName} numberOfLines={1}>
                  {photo?.original_filename}
                </Text>
                <Text style={styles.photoDimensions}>
                  {photo?.width} x {photo?.height}
                </Text>
              </View>

              <View style={styles.bottomActions}>
                <Pressable
                  onPress={() => setShowComments(true)}
                  style={styles.actionButton}
                >
                  <Ionicons name="chatbubble-outline" size={22} color={colors.white} />
                  {comments.length > 0 && (
                    <View style={styles.badge}>
                      <Text style={styles.badgeText}>{comments.length}</Text>
                    </View>
                  )}
                </Pressable>
                <Pressable style={styles.actionButton}>
                  <Ionicons name="download-outline" size={22} color={colors.white} />
                </Pressable>
                <Pressable style={styles.actionButton}>
                  <Ionicons name="cart-outline" size={22} color={colors.white} />
                </Pressable>
              </View>
            </SafeAreaView>
          </BlurView>
        </Animated.View>
      )}

      {/* Comments Sheet */}
      {showComments && (
        <Animated.View entering={FadeIn} style={styles.commentsOverlay}>
          <Pressable
            style={styles.commentsBackdrop}
            onPress={() => setShowComments(false)}
          />
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.commentsSheet}
          >
            <BlurView intensity={100} tint="dark" style={styles.commentsBlur}>
              <View style={styles.commentsHeader}>
                <Text style={styles.commentsTitle}>
                  Comments ({comments.length})
                </Text>
                <Pressable onPress={() => setShowComments(false)}>
                  <Ionicons name="close" size={24} color={colors.white} />
                </Pressable>
              </View>

              <FlatList
                data={comments}
                renderItem={renderComment}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.commentsList}
                ListEmptyComponent={
                  <View style={styles.noComments}>
                    <Text style={styles.noCommentsText}>No comments yet</Text>
                  </View>
                }
              />

              <View style={styles.commentInput}>
                <TextInput
                  style={styles.input}
                  placeholder="Add a comment..."
                  placeholderTextColor={colors.neutral[400]}
                  value={newComment}
                  onChangeText={setNewComment}
                  multiline
                />
                <Pressable
                  onPress={handleSubmitComment}
                  disabled={!newComment.trim() || isSubmittingComment}
                  style={[
                    styles.sendButton,
                    (!newComment.trim() || isSubmittingComment) && styles.sendButtonDisabled,
                  ]}
                >
                  {isSubmittingComment ? (
                    <ActivityIndicator size="small" color={colors.white} />
                  ) : (
                    <Ionicons name="send" size={20} color={colors.white} />
                  )}
                </Pressable>
              </View>
            </BlurView>
          </KeyboardAvoidingView>
        </Animated.View>
      )}
    </GestureHandlerRootView>
  );
}

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.black,
    },
    loadingContainer: {
      flex: 1,
      backgroundColor: colors.black,
      justifyContent: 'center',
      alignItems: 'center',
    },
    photoContainer: {
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT,
      justifyContent: 'center',
      alignItems: 'center',
    },
    fullPhoto: {
      width: SCREEN_WIDTH,
      height: SCREEN_HEIGHT,
    },
    topControls: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
    },
    bottomControls: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
    },
    controlsBlur: {
      overflow: 'hidden',
    },
    topControlsContent: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing[4],
      paddingBottom: spacing[3],
    },
    bottomControlsContent: {
      paddingHorizontal: spacing[4],
      paddingTop: spacing[3],
    },
    controlButton: {
      width: 44,
      height: 44,
      borderRadius: borderRadius.full,
      alignItems: 'center',
      justifyContent: 'center',
    },
    photoCounter: {
      backgroundColor: 'rgba(0,0,0,0.5)',
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[1],
      borderRadius: borderRadius.full,
    },
    counterText: {
      color: colors.white,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
    },
    topActions: {
      flexDirection: 'row',
      gap: spacing[2],
    },
    photoInfo: {
      marginBottom: spacing[3],
    },
    photoName: {
      color: colors.white,
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.medium,
    },
    photoDimensions: {
      color: colors.neutral[400],
      fontSize: typography.fontSize.sm,
      marginTop: spacing[0.5],
    },
    bottomActions: {
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    actionButton: {
      alignItems: 'center',
      padding: spacing[3],
    },
    badge: {
      position: 'absolute',
      top: spacing[1],
      right: spacing[1],
      backgroundColor: theme.colors.primary,
      width: 18,
      height: 18,
      borderRadius: 9,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeText: {
      color: colors.white,
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.bold,
    },
    // Comments
    commentsOverlay: {
      ...StyleSheet.absoluteFillObject,
      justifyContent: 'flex-end',
    },
    commentsBackdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.5)',
    },
    commentsSheet: {
      maxHeight: SCREEN_HEIGHT * 0.7,
      borderTopLeftRadius: borderRadius.xl,
      borderTopRightRadius: borderRadius.xl,
      overflow: 'hidden',
    },
    commentsBlur: {
      paddingTop: spacing[4],
    },
    commentsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing[4],
      paddingBottom: spacing[3],
      borderBottomWidth: 1,
      borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    commentsTitle: {
      color: colors.white,
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
    },
    commentsList: {
      padding: spacing[4],
      paddingBottom: spacing[2],
    },
    noComments: {
      alignItems: 'center',
      paddingVertical: spacing[8],
    },
    noCommentsText: {
      color: colors.neutral[400],
      fontSize: typography.fontSize.base,
    },
    commentItem: {
      flexDirection: 'row',
      marginBottom: spacing[4],
    },
    commentAvatar: {
      width: 36,
      height: 36,
      borderRadius: borderRadius.full,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing[3],
    },
    commentAvatarText: {
      color: colors.white,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.bold,
    },
    commentContent: {
      flex: 1,
    },
    commentHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: spacing[1],
    },
    commentAuthor: {
      color: colors.white,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      marginRight: spacing[2],
    },
    commentTime: {
      color: colors.neutral[400],
      fontSize: typography.fontSize.xs,
    },
    commentText: {
      color: colors.neutral[200],
      fontSize: typography.fontSize.sm,
      lineHeight: 20,
    },
    commentInput: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      padding: spacing[4],
      paddingTop: spacing[2],
      borderTopWidth: 1,
      borderTopColor: 'rgba(255,255,255,0.1)',
    },
    input: {
      flex: 1,
      backgroundColor: 'rgba(255,255,255,0.1)',
      borderRadius: borderRadius.xl,
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[3],
      color: colors.white,
      fontSize: typography.fontSize.base,
      maxHeight: 100,
      marginRight: spacing[2],
    },
    sendButton: {
      width: 44,
      height: 44,
      borderRadius: borderRadius.full,
      backgroundColor: theme.colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    sendButtonDisabled: {
      opacity: 0.5,
    },
  });

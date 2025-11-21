import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Pressable,
  Modal,
  Share,
  Alert,
  Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withTiming,
  runOnJS,
} from 'react-native-reanimated';
import { GestureDetector, Gesture } from 'react-native-gesture-handler';
import { photoService, Photo } from '@/services/api/photos';
import { haptics } from '@/utils/haptics';
import * as MediaLibrary from 'expo-media-library';
import * as FileSystem from 'expo-file-system';
import Toast from 'react-native-toast-message';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function PhotoViewerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [photo, setPhoto] = useState<Photo | null>(null);
  const [loading, setLoading] = useState(true);
  const [showControls, setShowControls] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const scale = useSharedValue(1);
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const savedScale = useSharedValue(1);

  useEffect(() => {
    if (id) {
      fetchPhoto();
    }
  }, [id]);

  const fetchPhoto = async () => {
    try {
      const data = await photoService.getPhoto(parseInt(id));
      setPhoto(data);
      setIsFavorite(data.is_favorite);
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load photo',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    haptics.impact('light');
    router.back();
  };

  const pinchGesture = Gesture.Pinch()
    .onUpdate((event) => {
      scale.value = savedScale.value * event.scale;
    })
    .onEnd(() => {
      savedScale.value = scale.value;
      if (scale.value < 1) {
        scale.value = withSpring(1);
        savedScale.value = 1;
      } else if (scale.value > 4) {
        scale.value = withSpring(4);
        savedScale.value = 4;
      }
    });

  const panGesture = Gesture.Pan()
    .onUpdate((event) => {
      if (scale.value > 1) {
        translateX.value = event.translationX;
        translateY.value = event.translationY;
      } else {
        translateY.value = event.translationY;
      }
    })
    .onEnd(() => {
      if (scale.value <= 1) {
        if (translateY.value > 150) {
          runOnJS(handleClose)();
        } else {
          translateX.value = withSpring(0);
          translateY.value = withSpring(0);
        }
      } else {
        // Limit panning when zoomed
        translateX.value = withSpring(translateX.value);
        translateY.value = withSpring(translateY.value);
      }
    });

  const composedGesture = Gesture.Simultaneous(pinchGesture, panGesture);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scale.value },
      { translateX: translateX.value },
      { translateY: translateY.value },
    ],
  }));

  const handleToggleFavorite = async () => {
    if (!photo) return;

    haptics.impact('medium');
    try {
      await photoService.toggleFavorite(photo.id);
      setIsFavorite(!isFavorite);
      Toast.show({
        type: 'success',
        text1: isFavorite ? 'Removed from favorites' : 'Added to favorites',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to update favorite',
      });
    }
  };

  const handleDownload = async () => {
    if (!photo) return;

    haptics.impact('medium');
    
    try {
      // Request permission
      const { status } = await MediaLibrary.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant photo library access to download');
        return;
      }

      Toast.show({
        type: 'info',
        text1: 'Downloading...',
        text2: 'Please wait',
      });

      const localUri = await photoService.downloadPhoto(photo.id, 'large');
      
      // Save to media library
      await MediaLibrary.createAssetAsync(localUri);
      
      Toast.show({
        type: 'success',
        text1: 'Downloaded!',
        text2: 'Photo saved to your library',
      });
    } catch (error) {
      Toast.show({
        type: 'error',
        text1: 'Download Failed',
        text2: 'Could not save photo',
      });
    }
  };

  const handleShare = async () => {
    if (!photo) return;

    haptics.impact('light');
    
    try {
      const photoUrl = photoService.getPhotoUrl(photo.id, 'large');
      
      await Share.share({
        message: `Check out this photo: ${photo.original_filename}`,
        url: photoUrl,
        title: 'Share Photo',
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleDelete = () => {
    if (!photo) return;

    Alert.alert(
      'Delete Photo',
      'Are you sure you want to delete this photo?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await photoService.deletePhoto(photo.id);
              Toast.show({
                type: 'success',
                text1: 'Photo Deleted',
              });
              router.back();
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Delete Failed',
              });
            }
          },
        },
      ]
    );
  };

  const toggleControls = () => {
    setShowControls(!showControls);
  };

  if (loading || !photo) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const photoUrl = photoService.getPhotoUrl(photo.id, 'large');

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Top Controls */}
      {showControls && (
        <Animated.View style={styles.topControls}>
          <Pressable onPress={handleClose} style={styles.controlButton}>
            <Ionicons name="close" size={28} color="white" />
          </Pressable>
          
          <View style={styles.topRight}>
            <Pressable onPress={() => setShowInfo(true)} style={styles.controlButton}>
              <Ionicons name="information-circle-outline" size={28} color="white" />
            </Pressable>
          </View>
        </Animated.View>
      )}

      {/* Photo */}
      <Pressable style={styles.photoContainer} onPress={toggleControls}>
        <GestureDetector gesture={composedGesture}>
          <Animated.View style={[styles.imageContainer, animatedStyle]}>
            <Image
              source={{ uri: photoUrl }}
              style={styles.image}
              contentFit="contain"
              transition={300}
            />
          </Animated.View>
        </GestureDetector>
      </Pressable>

      {/* Bottom Controls */}
      {showControls && (
        <Animated.View style={styles.bottomControls}>
          <Pressable onPress={handleToggleFavorite} style={styles.actionButton}>
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={28}
              color={isFavorite ? '#EF4444' : 'white'}
            />
          </Pressable>

          <Pressable onPress={handleDownload} style={styles.actionButton}>
            <Ionicons name="download-outline" size={28} color="white" />
          </Pressable>

          <Pressable onPress={handleShare} style={styles.actionButton}>
            <Ionicons name="share-outline" size={28} color="white" />
          </Pressable>

          <Pressable onPress={handleDelete} style={styles.actionButton}>
            <Ionicons name="trash-outline" size={28} color="#EF4444" />
          </Pressable>
        </Animated.View>
      )}

      {/* Photo Info Modal */}
      <Modal visible={showInfo} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Photo Info</Text>
              <Pressable onPress={() => setShowInfo(false)}>
                <Ionicons name="close" size={24} color="#111827" />
              </Pressable>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Filename:</Text>
              <Text style={styles.infoValue}>{photo.original_filename}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Size:</Text>
              <Text style={styles.infoValue}>
                {(photo.file_size / 1024 / 1024).toFixed(2)} MB
              </Text>
            </View>

            {photo.width && photo.height && (
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Dimensions:</Text>
                <Text style={styles.infoValue}>
                  {photo.width} × {photo.height}
                </Text>
              </View>
            )}

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Type:</Text>
              <Text style={styles.infoValue}>{photo.mime_type}</Text>
            </View>

            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Uploaded:</Text>
              <Text style={styles.infoValue}>
                {new Date(photo.created_at).toLocaleDateString()}
              </Text>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#000000',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: 'white',
    fontSize: 16,
  },
  photoContainer: {
    flex: 1,
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: SCREEN_WIDTH,
    height: SCREEN_HEIGHT,
  },
  topControls: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 60,
    paddingBottom: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 10,
  },
  topRight: {
    flexDirection: 'row',
    gap: 16,
  },
  controlButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bottomControls: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 24,
    paddingBottom: 40,
    backgroundColor: 'rgba(0,0,0,0.5)',
    zIndex: 10,
  },
  actionButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 40,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  infoValue: {
    fontSize: 14,
    color: '#111827',
    maxWidth: '60%',
    textAlign: 'right',
  },
});

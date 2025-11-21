import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import { FlashList } from '@shopify/flash-list';
import Animated, { FadeIn, FadeInDown, Layout } from 'react-native-reanimated';
import { router } from 'expo-router';
import { photoService } from '@/services/api/photos';
import { projectService } from '@/services/api/projects';
import { useAuthStore } from '@/stores/authStore';
import Toast from 'react-native-toast-message';
import { haptics } from '@/utils/haptics';

interface SelectedPhoto {
  id: string;
  uri: string;
  thumbnailUri: string;
  width: number;
  height: number;
  fileName: string;
}

export default function CreateScreen() {
  const { user } = useAuthStore();
  const [step, setStep] = useState<'select' | 'details' | 'uploading'>('select');
  const [selectedPhotos, setSelectedPhotos] = useState<SelectedPhoto[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [galleryTitle, setGalleryTitle] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadedCount, setUploadedCount] = useState(0);

  const pickPhotos = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please grant photo library access');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 1,
        selectionLimit: 50,
      });

      if (!result.canceled) {
        setIsProcessing(true);
        
        const processedPhotos = await Promise.all(
          result.assets.map(async (asset, index) => {
            // Generate thumbnail
            const thumbnail = await ImageManipulator.manipulateAsync(
              asset.uri,
              [{ resize: { width: 300 } }],
              { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
            );

            return {
              id: `${Date.now()}-${index}`,
              uri: asset.uri,
              thumbnailUri: thumbnail.uri,
              width: asset.width,
              height: asset.height,
              fileName: asset.fileName || `photo-${index}.jpg`,
            };
          })
        );

        setSelectedPhotos([...selectedPhotos, ...processedPhotos]);
        setIsProcessing(false);
        
        haptics.success();
      }
    } catch (error) {
      console.error('Photo picker error:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to select photos',
      });
      setIsProcessing(false);
    }
  };

  const removePhoto = (id: string) => {
    haptics.light();
    setSelectedPhotos(selectedPhotos.filter(p => p.id !== id));
  };

  const handleNext = () => {
    if (selectedPhotos.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'No Photos',
        text2: 'Please select at least one photo',
      });
      return;
    }
    setStep('details');
  };

  const handleUpload = async () => {
    if (!galleryTitle.trim()) {
      Toast.show({
        type: 'error',
        text1: 'Gallery Title Required',
        text2: 'Please enter a title for your gallery',
      });
      return;
    }

    setStep('uploading');
    haptics.success();

    try {
      // Create project first
      const project = await projectService.createProject({
        title: galleryTitle,
      });

      // Upload photos
      const photos = selectedPhotos.map(p => ({
        uri: p.uri,
        name: p.fileName,
      }));

      await photoService.uploadPhotos(
        project.id,
        photos,
        undefined,
        (completed, total) => {
          setUploadedCount(completed);
          setUploadProgress((completed / total) * 100);
        }
      );

      Toast.show({
        type: 'success',
        text1: 'Gallery Created!',
        text2: `${selectedPhotos.length} photos uploaded successfully`,
      });

      // Reset and navigate
      setSelectedPhotos([]);
      setGalleryTitle('');
      setStep('select');
      setUploadProgress(0);
      setUploadedCount(0);
      
      router.push(`/gallery/${project.id}`);
    } catch (error) {
      console.error('Upload error:', error);
      Toast.show({
        type: 'error',
        text1: 'Upload Failed',
        text2: 'Could not create gallery',
      });
      setStep('details');
    }
  };

  const renderSelectedPhoto = ({ item, index }: { item: SelectedPhoto; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 30)}
      layout={Layout.springify()}
      style={styles.photoItem}
    >
      <Image
        source={{ uri: item.thumbnailUri }}
        style={styles.photoImage}
        contentFit="cover"
      />
      <Pressable
        onPress={() => removePhoto(item.id)}
        style={styles.removeButton}
      >
        <Ionicons name="close-circle" size={24} color="#EF4444" />
      </Pressable>
    </Animated.View>
  );

  if (step === 'uploading') {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.uploadingContainer}>
          <Animated.View entering={FadeIn} style={styles.uploadingContent}>
            <View style={styles.progressCircle}>
              <Text style={styles.progressText}>{Math.round(uploadProgress)}%</Text>
            </View>
            <Text style={styles.uploadingTitle}>Uploading Photos</Text>
            <Text style={styles.uploadingSubtitle}>
              {uploadedCount} of {selectedPhotos.length} photos uploaded
            </Text>
            <View style={styles.progressBarContainer}>
              <View style={[styles.progressBar, { width: `${uploadProgress}%` }]} />
            </View>
          </Animated.View>
        </View>
      </SafeAreaView>
    );
  }

  if (step === 'details') {
    return (
      <>
        <StatusBar style="dark" />
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <Pressable onPress={() => setStep('select')} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#111827" />
            </Pressable>
            <Text style={styles.headerTitle}>Gallery Details</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView contentContainerStyle={styles.detailsContent}>
            <View style={styles.inputContainer}>
              <Text style={styles.inputLabel}>Gallery Title *</Text>
              <TextInput
                style={styles.textInput}
                placeholder="e.g., Summer Wedding 2024"
                value={galleryTitle}
                onChangeText={setGalleryTitle}
                autoFocus
              />
            </View>

            <View style={styles.photosSummary}>
              <Ionicons name="images" size={24} color="#667EEA" />
              <Text style={styles.photosSummaryText}>
                {selectedPhotos.length} {selectedPhotos.length === 1 ? 'photo' : 'photos'} selected
              </Text>
            </View>

            <Pressable
              onPress={handleUpload}
              style={styles.uploadButton}
            >
              <Ionicons name="cloud-upload" size={24} color="white" />
              <Text style={styles.uploadButtonText}>Create Gallery</Text>
            </Pressable>
          </ScrollView>
        </SafeAreaView>
      </>
    );
  }

  return (
    <>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Upload Photos</Text>
          {selectedPhotos.length > 0 && (
            <Pressable onPress={handleNext} style={styles.nextButton}>
              <Text style={styles.nextButtonText}>Next</Text>
              <Ionicons name="arrow-forward" size={20} color="white" />
            </Pressable>
          )}
        </View>

        {selectedPhotos.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Animated.View entering={FadeIn} style={styles.emptyContent}>
              <View style={styles.iconContainer}>
                <Ionicons name="cloud-upload-outline" size={64} color="#667EEA" />
              </View>
              <Text style={styles.emptyTitle}>Upload Photos</Text>
              <Text style={styles.emptySubtitle}>
                Create a new gallery by selecting photos from your device
              </Text>
              
              <Pressable
                onPress={pickPhotos}
                disabled={isProcessing}
                style={styles.selectButton}
              >
                {isProcessing ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Ionicons name="add-circle-outline" size={24} color="white" />
                    <Text style={styles.selectButtonText}>Select Photos</Text>
                  </>
                )}
              </Pressable>
            </Animated.View>
          </View>
        ) : (
          <>
            <FlashList
              data={selectedPhotos}
              renderItem={renderSelectedPhoto}
              keyExtractor={item => item.id}
              numColumns={3}
              estimatedItemSize={120}
              contentContainerStyle={styles.gridContent}
              ListHeaderComponent={
                <Pressable onPress={pickPhotos} style={styles.addMoreButton}>
                  <Ionicons name="add" size={32} color="#667EEA" />
                  <Text style={styles.addMoreText}>Add More</Text>
                </Pressable>
              }
            />
          </>
        )}
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
  },
  nextButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#667EEA',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  nextButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyContent: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 32,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#667EEA',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
    minWidth: 180,
    justifyContent: 'center',
  },
  selectButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  gridContent: {
    padding: 12,
  },
  photoItem: {
    flex: 1,
    aspectRatio: 1,
    margin: 4,
    borderRadius: 8,
    overflow: 'hidden',
  },
  photoImage: {
    width: '100%',
    height: '100%',
  },
  removeButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  addMoreButton: {
    margin: 4,
    aspectRatio: 1,
    borderRadius: 8,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
  },
  addMoreText: {
    fontSize: 12,
    color: '#667EEA',
    fontWeight: '500',
    marginTop: 4,
  },
  detailsContent: {
    padding: 24,
  },
  inputContainer: {
    marginBottom: 24,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    color: '#111827',
  },
  photosSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    backgroundColor: '#EEF2FF',
    borderRadius: 12,
    marginBottom: 32,
  },
  photosSummaryText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#667EEA',
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#667EEA',
    paddingVertical: 16,
    borderRadius: 30,
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  uploadButtonText: {
    color: 'white',
    fontSize: 17,
    fontWeight: '600',
  },
  uploadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  uploadingContent: {
    alignItems: 'center',
  },
  progressCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  progressText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#667EEA',
  },
  uploadingTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  uploadingSubtitle: {
    fontSize: 16,
    color: '#6B7280',
    marginBottom: 32,
  },
  progressBarContainer: {
    width: 300,
    height: 8,
    backgroundColor: '#E5E7EB',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#667EEA',
    borderRadius: 4,
  },
});

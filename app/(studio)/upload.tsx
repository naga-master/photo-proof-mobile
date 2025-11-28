/**
 * Upload Screen - Photo Upload Wizard
 * Full 5-step upload process for studio users
 */

import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  FlatList,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import Animated, { FadeIn, FadeInDown, FadeInRight } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';

import { useTheme } from '@/theme/ThemeProvider';
import { apiClient } from '@/services/api/client';
import { colors, spacing, borderRadius, typography, shadows } from '@/theme';
import type { Project, UploadFile } from '@/types';

type UploadMode = 'new' | 'existing' | null;
type UploadStep = 1 | 2 | 3 | 4 | 5;

export default function UploadScreen() {
  const { theme, isDark } = useTheme();
  
  const [mode, setMode] = useState<UploadMode>(null);
  const [step, setStep] = useState<UploadStep>(1);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<UploadFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isLoadingProjects, setIsLoadingProjects] = useState(false);

  useEffect(() => {
    if (mode === 'existing') {
      fetchProjects();
    }
  }, [mode]);

  const fetchProjects = async () => {
    setIsLoadingProjects(true);
    try {
      const response = await apiClient.get<{ projects: Project[] }>('/api/projects/');
      setProjects(response.projects || []);
    } catch (error) {
      console.error('Failed to fetch projects:', error);
    } finally {
      setIsLoadingProjects(false);
    }
  };

  const pickImages = async () => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Required', 'Please allow access to your photo library');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 1,
      exif: true,
    });

    if (!result.canceled && result.assets) {
      const files: UploadFile[] = result.assets.map((asset, index) => ({
        id: `${Date.now()}-${index}`,
        uri: asset.uri,
        name: asset.fileName || `photo_${index + 1}.jpg`,
        size: asset.fileSize || 0,
        type: asset.mimeType || 'image/jpeg',
        status: 'queued',
        progress: 0,
      }));
      setSelectedFiles((prev) => [...prev, ...files]);
    }
  };

  const takePhoto = async () => {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Permission Required', 'Please allow access to camera');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      quality: 1,
      exif: true,
    });

    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const file: UploadFile = {
        id: `${Date.now()}`,
        uri: asset.uri,
        name: asset.fileName || `photo_${Date.now()}.jpg`,
        size: asset.fileSize || 0,
        type: asset.mimeType || 'image/jpeg',
        status: 'queued',
        progress: 0,
      };
      setSelectedFiles((prev) => [...prev, file]);
    }
  };

  const removeFile = (id: string) => {
    setSelectedFiles((prev) => prev.filter((f) => f.id !== id));
  };

  const startUpload = async () => {
    if (selectedFiles.length === 0) return;

    const projectId = mode === 'existing' 
      ? selectedProject?.id 
      : await createNewProject();

    if (!projectId) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'No project selected' });
      return;
    }

    setIsUploading(true);
    setStep(5);

    let completed = 0;
    for (const file of selectedFiles) {
      try {
        setSelectedFiles((prev) =>
          prev.map((f) => f.id === file.id ? { ...f, status: 'uploading' } : f)
        );

        const formData = new FormData();
        formData.append('file', {
          uri: file.uri,
          name: file.name,
          type: file.type,
        } as any);

        await apiClient.upload(`/api/projects/${projectId}/photos`, formData, (progress) => {
          setSelectedFiles((prev) =>
            prev.map((f) => f.id === file.id ? { ...f, progress } : f)
          );
        });

        setSelectedFiles((prev) =>
          prev.map((f) => f.id === file.id ? { ...f, status: 'success', progress: 100 } : f)
        );
        completed++;
        setUploadProgress(Math.round((completed / selectedFiles.length) * 100));
      } catch (error) {
        setSelectedFiles((prev) =>
          prev.map((f) => f.id === file.id ? { ...f, status: 'failed', error: 'Upload failed' } : f)
        );
      }
    }

    setIsUploading(false);
    Toast.show({
      type: 'success',
      text1: 'Upload Complete',
      text2: `${completed} of ${selectedFiles.length} photos uploaded`,
    });
  };

  const createNewProject = async (): Promise<string | null> => {
    if (!newProjectName.trim()) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Please enter a project name' });
      return null;
    }

    try {
      const response = await apiClient.post<{ id: string }>('/api/projects/', {
        title: newProjectName.trim(),
      });
      return response.id;
    } catch (error) {
      Toast.show({ type: 'error', text1: 'Error', text2: 'Failed to create project' });
      return null;
    }
  };

  const resetWizard = () => {
    setMode(null);
    setStep(1);
    setSelectedProject(null);
    setNewProjectName('');
    setSelectedFiles([]);
    setUploadProgress(0);
  };

  const canProceed = () => {
    switch (step) {
      case 1: return mode === 'new' ? newProjectName.trim().length > 0 : selectedProject !== null;
      case 2: return selectedFiles.length > 0;
      case 3: return true;
      case 4: return true;
      default: return false;
    }
  };

  const styles = createStyles(theme, isDark);

  // Mode selection screen
  if (!mode) {
    return (
      <>
        <StatusBar style={isDark ? 'light' : 'dark'} />
        <SafeAreaView style={styles.container} edges={['top']}>
          <Animated.View entering={FadeIn} style={styles.header}>
            <Text style={styles.headerTitle}>Upload Photos</Text>
          </Animated.View>

          <ScrollView contentContainerStyle={styles.content}>
            <Animated.View entering={FadeInDown.delay(100)}>
              <Text style={styles.sectionTitle}>Choose Upload Type</Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(200)} style={styles.optionsContainer}>
              <Pressable
                onPress={() => setMode('new')}
                style={({ pressed }) => [styles.optionCard, pressed && styles.cardPressed]}
              >
                <View style={[styles.optionIcon, { backgroundColor: theme.colors.primary + '15' }]}>
                  <Ionicons name="add-circle" size={32} color={theme.colors.primary} />
                </View>
                <Text style={styles.optionTitle}>New Project</Text>
                <Text style={styles.optionDescription}>Create a new project and upload photos</Text>
              </Pressable>

              <Pressable
                onPress={() => setMode('existing')}
                style={({ pressed }) => [styles.optionCard, pressed && styles.cardPressed]}
              >
                <View style={[styles.optionIcon, { backgroundColor: colors.success.main + '15' }]}>
                  <Ionicons name="folder-open" size={32} color={colors.success.main} />
                </View>
                <Text style={styles.optionTitle}>Existing Project</Text>
                <Text style={styles.optionDescription}>Add photos to an existing project</Text>
              </Pressable>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(300)} style={styles.tipsContainer}>
              <Text style={styles.tipsTitle}>Upload Tips</Text>
              {['Supports JPEG, PNG, HEIC, RAW', 'Uploads continue in background', 'Auto-organized by folder structure'].map((tip, i) => (
                <View key={i} style={styles.tipItem}>
                  <Ionicons name="checkmark-circle" size={18} color={colors.success.main} />
                  <Text style={styles.tipText}>{tip}</Text>
                </View>
              ))}
            </Animated.View>
          </ScrollView>
        </SafeAreaView>
      </>
    );
  }

  // Upload wizard
  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <SafeAreaView style={styles.container} edges={['top']}>
        <Animated.View entering={FadeIn} style={styles.header}>
          <Pressable onPress={resetWizard} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>
            {mode === 'new' ? 'New Project' : 'Add to Project'}
          </Text>
          <View style={{ width: 40 }} />
        </Animated.View>

        {/* Step indicator */}
        <View style={styles.stepIndicator}>
          {[1, 2, 3, 4, 5].map((s) => (
            <View key={s} style={styles.stepWrapper}>
              <View style={[styles.stepDot, step >= s && styles.stepDotActive]}>
                {step > s ? (
                  <Ionicons name="checkmark" size={14} color={colors.white} />
                ) : (
                  <Text style={[styles.stepNumber, step >= s && styles.stepNumberActive]}>{s}</Text>
                )}
              </View>
              {s < 5 && <View style={[styles.stepLine, step > s && styles.stepLineActive]} />}
            </View>
          ))}
        </View>

        <ScrollView style={styles.wizardContent} contentContainerStyle={styles.wizardContentContainer}>
          {/* Step 1: Project Selection / Creation */}
          {step === 1 && (
            <Animated.View entering={FadeInRight}>
              <Text style={styles.stepTitle}>
                {mode === 'new' ? 'Create New Project' : 'Select Project'}
              </Text>
              
              {mode === 'new' ? (
                <View style={styles.inputContainer}>
                  <Text style={styles.inputLabel}>Project Name</Text>
                  <TextInput
                    style={styles.input}
                    value={newProjectName}
                    onChangeText={setNewProjectName}
                    placeholder="Enter project name..."
                    placeholderTextColor={theme.colors.textSecondary}
                  />
                </View>
              ) : (
                <>
                  {isLoadingProjects ? (
                    <ActivityIndicator size="large" color={theme.colors.primary} />
                  ) : (
                    <FlatList
                      data={projects}
                      keyExtractor={(item) => item.id}
                      scrollEnabled={false}
                      renderItem={({ item }) => (
                        <Pressable
                          onPress={() => setSelectedProject(item)}
                          style={[
                            styles.projectItem,
                            selectedProject?.id === item.id && styles.projectItemSelected,
                          ]}
                        >
                          <Ionicons
                            name="folder"
                            size={24}
                            color={selectedProject?.id === item.id ? theme.colors.primary : theme.colors.textSecondary}
                          />
                          <View style={styles.projectInfo}>
                            <Text style={styles.projectName}>{item.title}</Text>
                            <Text style={styles.projectMeta}>{item.photo_count} photos</Text>
                          </View>
                          {selectedProject?.id === item.id && (
                            <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
                          )}
                        </Pressable>
                      )}
                      ListEmptyComponent={
                        <Text style={styles.emptyText}>No projects found</Text>
                      }
                    />
                  )}
                </>
              )}
            </Animated.View>
          )}

          {/* Step 2: Select Photos */}
          {step === 2 && (
            <Animated.View entering={FadeInRight}>
              <Text style={styles.stepTitle}>Select Photos</Text>
              
              <View style={styles.pickerButtons}>
                <Pressable onPress={pickImages} style={styles.pickerButton}>
                  <Ionicons name="images" size={28} color={theme.colors.primary} />
                  <Text style={styles.pickerButtonText}>Photo Library</Text>
                </Pressable>
                <Pressable onPress={takePhoto} style={styles.pickerButton}>
                  <Ionicons name="camera" size={28} color={theme.colors.primary} />
                  <Text style={styles.pickerButtonText}>Take Photo</Text>
                </Pressable>
              </View>

              {selectedFiles.length > 0 && (
                <View style={styles.selectedFilesContainer}>
                  <Text style={styles.selectedCount}>{selectedFiles.length} photos selected</Text>
                  <FlatList
                    data={selectedFiles}
                    keyExtractor={(item) => item.id}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item }) => (
                      <View style={styles.filePreview}>
                        <Image source={{ uri: item.uri }} style={styles.previewImage} contentFit="cover" />
                        <Pressable onPress={() => removeFile(item.id)} style={styles.removeButton}>
                          <Ionicons name="close" size={16} color={colors.white} />
                        </Pressable>
                      </View>
                    )}
                  />
                </View>
              )}
            </Animated.View>
          )}

          {/* Step 3: Upload Settings */}
          {step === 3 && (
            <Animated.View entering={FadeInRight}>
              <Text style={styles.stepTitle}>Upload Settings</Text>
              
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Preserve folder structure</Text>
                  <Text style={styles.settingDesc}>Keep original folder organization</Text>
                </View>
                <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
              </View>
              
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Auto-organize by date</Text>
                  <Text style={styles.settingDesc}>Group photos by capture date</Text>
                </View>
                <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
              </View>
              
              <View style={styles.settingItem}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingLabel}>Generate thumbnails</Text>
                  <Text style={styles.settingDesc}>Create optimized preview images</Text>
                </View>
                <Ionicons name="checkmark-circle" size={24} color={theme.colors.primary} />
              </View>
            </Animated.View>
          )}

          {/* Step 4: Review */}
          {step === 4 && (
            <Animated.View entering={FadeInRight}>
              <Text style={styles.stepTitle}>Review & Upload</Text>
              
              <View style={styles.reviewCard}>
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>Project</Text>
                  <Text style={styles.reviewValue}>
                    {mode === 'new' ? newProjectName : selectedProject?.title}
                  </Text>
                </View>
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>Photos</Text>
                  <Text style={styles.reviewValue}>{selectedFiles.length}</Text>
                </View>
                <View style={styles.reviewRow}>
                  <Text style={styles.reviewLabel}>Total Size</Text>
                  <Text style={styles.reviewValue}>
                    {(selectedFiles.reduce((sum, f) => sum + f.size, 0) / 1024 / 1024).toFixed(1)} MB
                  </Text>
                </View>
              </View>

              <Text style={styles.readyText}>Ready to upload!</Text>
            </Animated.View>
          )}

          {/* Step 5: Uploading */}
          {step === 5 && (
            <Animated.View entering={FadeIn} style={styles.uploadingContainer}>
              <View style={styles.progressCircle}>
                <Text style={styles.progressText}>{uploadProgress}%</Text>
              </View>
              <Text style={styles.uploadingTitle}>
                {isUploading ? 'Uploading...' : 'Upload Complete!'}
              </Text>
              <Text style={styles.uploadingSubtitle}>
                {selectedFiles.filter((f) => f.status === 'success').length} of {selectedFiles.length} photos uploaded
              </Text>
              
              {!isUploading && (
                <Pressable onPress={resetWizard} style={styles.doneButton}>
                  <Text style={styles.doneButtonText}>Done</Text>
                </Pressable>
              )}
            </Animated.View>
          )}
        </ScrollView>

        {/* Navigation buttons */}
        {step < 5 && (
          <View style={styles.navButtons}>
            {step > 1 && (
              <Pressable onPress={() => setStep((s) => (s - 1) as UploadStep)} style={styles.prevButton}>
                <Text style={styles.prevButtonText}>Back</Text>
              </Pressable>
            )}
            <Pressable
              onPress={() => step === 4 ? startUpload() : setStep((s) => (s + 1) as UploadStep)}
              disabled={!canProceed()}
              style={[styles.nextButton, !canProceed() && styles.buttonDisabled]}
            >
              <Text style={styles.nextButtonText}>
                {step === 4 ? 'Start Upload' : 'Continue'}
              </Text>
            </Pressable>
          </View>
        )}
      </SafeAreaView>
    </>
  );
}

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: theme.colors.background },
    header: {
      flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
      paddingHorizontal: spacing[4], paddingVertical: spacing[3],
      backgroundColor: theme.colors.surface, borderBottomWidth: 1, borderBottomColor: theme.colors.border,
    },
    headerTitle: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: theme.colors.text },
    backButton: {
      width: 40, height: 40, borderRadius: borderRadius.full,
      backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100], alignItems: 'center', justifyContent: 'center',
    },
    content: { padding: spacing[4], paddingBottom: 120 },
    sectionTitle: { fontSize: typography.fontSize.lg, fontWeight: typography.fontWeight.bold, color: theme.colors.text, marginBottom: spacing[4] },
    optionsContainer: { gap: spacing[3], marginBottom: spacing[6] },
    optionCard: {
      backgroundColor: isDark ? colors.neutral[800] : colors.white, borderRadius: borderRadius.lg,
      padding: spacing[4], ...shadows.sm,
    },
    cardPressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
    optionIcon: { width: 56, height: 56, borderRadius: borderRadius.lg, alignItems: 'center', justifyContent: 'center', marginBottom: spacing[3] },
    optionTitle: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, color: theme.colors.text, marginBottom: spacing[1] },
    optionDescription: { fontSize: typography.fontSize.sm, color: theme.colors.textSecondary },
    tipsContainer: { backgroundColor: isDark ? colors.neutral[800] : colors.white, borderRadius: borderRadius.lg, padding: spacing[4], ...shadows.sm },
    tipsTitle: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, color: theme.colors.text, marginBottom: spacing[2] },
    tipItem: { flexDirection: 'row', alignItems: 'center', gap: spacing[2], marginBottom: spacing[1] },
    tipText: { fontSize: typography.fontSize.sm, color: theme.colors.textSecondary },
    stepIndicator: { flexDirection: 'row', justifyContent: 'center', paddingHorizontal: spacing[4], paddingVertical: spacing[3] },
    stepWrapper: { flexDirection: 'row', alignItems: 'center' },
    stepDot: {
      width: 28, height: 28, borderRadius: 14, backgroundColor: theme.colors.border,
      alignItems: 'center', justifyContent: 'center',
    },
    stepDotActive: { backgroundColor: theme.colors.primary },
    stepNumber: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: theme.colors.textSecondary },
    stepNumberActive: { color: colors.white },
    stepLine: { width: 24, height: 2, backgroundColor: theme.colors.border },
    stepLineActive: { backgroundColor: theme.colors.primary },
    wizardContent: { flex: 1 },
    wizardContentContainer: { padding: spacing[4] },
    stepTitle: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: theme.colors.text, marginBottom: spacing[4] },
    inputContainer: { marginBottom: spacing[4] },
    inputLabel: { fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: theme.colors.text, marginBottom: spacing[2] },
    input: {
      backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100], borderRadius: borderRadius.lg,
      paddingHorizontal: spacing[4], paddingVertical: spacing[3], fontSize: typography.fontSize.base, color: theme.colors.text,
    },
    projectItem: {
      flexDirection: 'row', alignItems: 'center', padding: spacing[4],
      backgroundColor: isDark ? colors.neutral[800] : colors.white, borderRadius: borderRadius.lg, marginBottom: spacing[2], ...shadows.sm,
    },
    projectItemSelected: { borderWidth: 2, borderColor: theme.colors.primary, backgroundColor: theme.colors.primary + '10' },
    projectInfo: { flex: 1, marginLeft: spacing[3] },
    projectName: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.medium, color: theme.colors.text },
    projectMeta: { fontSize: typography.fontSize.sm, color: theme.colors.textSecondary },
    emptyText: { textAlign: 'center', color: theme.colors.textSecondary, paddingVertical: spacing[8] },
    pickerButtons: { flexDirection: 'row', gap: spacing[3], marginBottom: spacing[4] },
    pickerButton: {
      flex: 1, alignItems: 'center', padding: spacing[6],
      backgroundColor: isDark ? colors.neutral[800] : colors.white, borderRadius: borderRadius.lg,
      borderWidth: 2, borderColor: theme.colors.border, borderStyle: 'dashed',
    },
    pickerButtonText: { marginTop: spacing[2], fontSize: typography.fontSize.sm, fontWeight: typography.fontWeight.medium, color: theme.colors.text },
    selectedFilesContainer: { marginTop: spacing[4] },
    selectedCount: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, color: theme.colors.text, marginBottom: spacing[3] },
    filePreview: { width: 80, height: 80, marginRight: spacing[2], borderRadius: borderRadius.md, overflow: 'hidden' },
    previewImage: { width: '100%', height: '100%' },
    removeButton: {
      position: 'absolute', top: 4, right: 4, width: 24, height: 24, borderRadius: 12,
      backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center',
    },
    settingItem: {
      flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
      padding: spacing[4], backgroundColor: isDark ? colors.neutral[800] : colors.white,
      borderRadius: borderRadius.lg, marginBottom: spacing[2], ...shadows.sm,
    },
    settingInfo: { flex: 1 },
    settingLabel: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.medium, color: theme.colors.text },
    settingDesc: { fontSize: typography.fontSize.sm, color: theme.colors.textSecondary, marginTop: spacing[0.5] },
    reviewCard: { backgroundColor: isDark ? colors.neutral[800] : colors.white, borderRadius: borderRadius.lg, padding: spacing[4], marginBottom: spacing[4], ...shadows.sm },
    reviewRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: spacing[2], borderBottomWidth: 1, borderBottomColor: theme.colors.border },
    reviewLabel: { fontSize: typography.fontSize.base, color: theme.colors.textSecondary },
    reviewValue: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, color: theme.colors.text },
    readyText: { textAlign: 'center', fontSize: typography.fontSize.lg, color: colors.success.main, fontWeight: typography.fontWeight.semibold },
    uploadingContainer: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingVertical: spacing[8] },
    progressCircle: {
      width: 120, height: 120, borderRadius: 60, borderWidth: 8, borderColor: theme.colors.primary,
      alignItems: 'center', justifyContent: 'center', marginBottom: spacing[4],
    },
    progressText: { fontSize: typography.fontSize['2xl'], fontWeight: typography.fontWeight.bold, color: theme.colors.primary },
    uploadingTitle: { fontSize: typography.fontSize.xl, fontWeight: typography.fontWeight.bold, color: theme.colors.text },
    uploadingSubtitle: { fontSize: typography.fontSize.base, color: theme.colors.textSecondary, marginTop: spacing[1] },
    doneButton: { marginTop: spacing[6], backgroundColor: theme.colors.primary, paddingVertical: spacing[3], paddingHorizontal: spacing[8], borderRadius: borderRadius.full },
    doneButtonText: { color: colors.white, fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold },
    navButtons: { flexDirection: 'row', padding: spacing[4], gap: spacing[3], borderTopWidth: 1, borderTopColor: theme.colors.border },
    prevButton: { flex: 1, paddingVertical: spacing[3], borderRadius: borderRadius.full, borderWidth: 1, borderColor: theme.colors.border, alignItems: 'center' },
    prevButtonText: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.medium, color: theme.colors.text },
    nextButton: { flex: 2, paddingVertical: spacing[3], borderRadius: borderRadius.full, backgroundColor: theme.colors.primary, alignItems: 'center' },
    nextButtonText: { fontSize: typography.fontSize.base, fontWeight: typography.fontWeight.semibold, color: colors.white },
    buttonDisabled: { opacity: 0.5 },
  });

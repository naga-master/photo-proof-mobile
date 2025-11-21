import React from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import { Project } from '@/services/api/projects';
import { projectService } from '@/services/api/projects';
import * as Haptics from 'expo-haptics';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = SCREEN_WIDTH - 48;

interface GalleryCardProps {
  project: Project;
  index: number;
  onPress: (project: Project) => void;
}

export function GalleryCard({ project, index, onPress }: GalleryCardProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    onPress(project);
  };

  const coverUrl = projectService.getCoverPhotoUrl(project, 'medium');

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 50).springify()}
      style={styles.container}
    >
      <Pressable
        onPress={handlePress}
        style={({ pressed }) => [
          styles.card,
          pressed && styles.cardPressed,
        ]}
      >
        <Image
          source={{ uri: coverUrl }}
          style={styles.image}
          contentFit="cover"
          transition={300}
          placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
        />
        
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.gradient}
        >
          <View style={styles.content}>
            <Text style={styles.title} numberOfLines={2}>
              {project.title || 'Untitled Gallery'}
            </Text>
            
            <View style={styles.metadata}>
              <View style={styles.metaItem}>
                <Ionicons name="images-outline" size={14} color="white" />
                <Text style={styles.metaText}>{project.photo_count} photos</Text>
              </View>
              
              {project.client_name && (
                <View style={styles.metaItem}>
                  <Ionicons name="person-outline" size={14} color="white" />
                  <Text style={styles.metaText} numberOfLines={1}>
                    {project.client_name}
                  </Text>
                </View>
              )}
            </View>

            {project.has_folders && (
              <View style={styles.badge}>
                <Ionicons name="folder-outline" size={12} color="#667EEA" />
                <Text style={styles.badgeText}>Folders</Text>
              </View>
            )}

            {project.is_locked && (
              <View style={[styles.badge, styles.lockedBadge]}>
                <Ionicons name="lock-closed" size={12} color="#EF4444" />
                <Text style={[styles.badgeText, { color: '#EF4444' }]}>Locked</Text>
              </View>
            )}
          </View>
        </LinearGradient>

        {/* Status Indicator */}
        {project.status && (
          <View style={[
            styles.statusBadge,
            project.status === 'active' && styles.statusActive,
            project.status === 'draft' && styles.statusDraft,
          ]}>
            <Text style={styles.statusText}>
              {project.status.charAt(0).toUpperCase() + project.status.slice(1)}
            </Text>
          </View>
        )}
      </Pressable>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  card: {
    width: CARD_WIDTH,
    height: 240,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#F9FAFB',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  cardPressed: {
    opacity: 0.95,
    transform: [{ scale: 0.98 }],
  },
  image: {
    width: '100%',
    height: '100%',
  },
  gradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 140,
    justifyContent: 'flex-end',
    padding: 16,
  },
  content: {
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
    lineHeight: 24,
  },
  metadata: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flexWrap: 'wrap',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
  },
  badge: {
    position: 'absolute',
    top: -120,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  lockedBadge: {
    left: undefined,
    right: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#667EEA',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  statusActive: {
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
  },
  statusDraft: {
    backgroundColor: 'rgba(249, 115, 22, 0.9)',
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
    color: 'white',
  },
});

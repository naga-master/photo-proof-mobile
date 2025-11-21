import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { clientService, Client } from '@/services/api/clients';
import { projectService, Project } from '@/services/api/projects';
import { Image } from 'expo-image';
import Toast from 'react-native-toast-message';
import { haptics } from '@/utils/haptics';

export default function ClientDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchClientData();
    }
  }, [id]);

  const fetchClientData = async () => {
    try {
      setLoading(true);
      
      const [clientData, projectsData] = await Promise.all([
        clientService.getClient(parseInt(id)),
        clientService.getClientProjects(parseInt(id)),
      ]);
      
      setClient(clientData);
      setProjects(projectsData as Project[]);
    } catch (error) {
      console.error('Failed to fetch client:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load client details',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCall = () => {
    if (client?.phone) {
      haptics.impact('medium');
      Linking.openURL(`tel:${client.phone}`);
    }
  };

  const handleEmail = () => {
    if (client?.email) {
      haptics.impact('medium');
      Linking.openURL(`mailto:${client.email}`);
    }
  };

  const handleWhatsApp = () => {
    if (client?.phone) {
      haptics.impact('medium');
      const phoneNumber = client.phone.replace(/[^\d]/g, '');
      Linking.openURL(`https://wa.me/${phoneNumber}`);
    }
  };

  const handleEditClient = () => {
    haptics.impact('light');
    router.push(`/clients/edit/${client?.id}`);
  };

  const handleDeleteClient = () => {
    Alert.alert(
      'Delete Client',
      `Are you sure you want to delete ${client?.name}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await clientService.deleteClient(parseInt(id));
              Toast.show({
                type: 'success',
                text1: 'Client Deleted',
              });
              router.back();
            } catch (error) {
              Toast.show({
                type: 'error',
                text1: 'Delete Failed',
                text2: 'Could not delete client',
              });
            }
          },
        },
      ]
    );
  };

  const handleProjectPress = (project: Project) => {
    haptics.impact('light');
    router.push(`/gallery/${project.id}`);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667EEA" />
        <Text style={styles.loadingText}>Loading client...</Text>
      </View>
    );
  }

  if (!client) {
    return null;
  }

  const initials = client.name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);

  return (
    <>
      <StatusBar style="light" />
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="white" />
          </Pressable>
          
          <View style={styles.headerActions}>
            <Pressable onPress={handleEditClient} style={styles.headerButton}>
              <Ionicons name="create-outline" size={24} color="white" />
            </Pressable>
            <Pressable onPress={handleDeleteClient} style={styles.headerButton}>
              <Ionicons name="trash-outline" size={24} color="white" />
            </Pressable>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Client Profile */}
          <Animated.View entering={FadeIn} style={styles.profileSection}>
            <View style={styles.avatarContainer}>
              {client.avatar_url || client.profile_picture ? (
                <Image
                  source={{ uri: client.avatar_url || client.profile_picture }}
                  style={styles.avatar}
                  contentFit="cover"
                />
              ) : (
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>{initials}</Text>
                </View>
              )}
            </View>

            <Text style={styles.clientName}>{client.name}</Text>
            
            {!client.is_active && (
              <View style={styles.inactiveBadge}>
                <Text style={styles.inactiveBadgeText}>Inactive</Text>
              </View>
            )}

            {/* Quick Actions */}
            <View style={styles.quickActions}>
              {client.phone && (
                <Pressable onPress={handleCall} style={styles.actionButton}>
                  <View style={styles.actionIconContainer}>
                    <Ionicons name="call" size={24} color="#667EEA" />
                  </View>
                  <Text style={styles.actionLabel}>Call</Text>
                </Pressable>
              )}

              <Pressable onPress={handleEmail} style={styles.actionButton}>
                <View style={styles.actionIconContainer}>
                  <Ionicons name="mail" size={24} color="#667EEA" />
                </View>
                <Text style={styles.actionLabel}>Email</Text>
              </Pressable>

              {client.phone && client.whatsapp_opt_in && (
                <Pressable onPress={handleWhatsApp} style={styles.actionButton}>
                  <View style={styles.actionIconContainer}>
                    <Ionicons name="logo-whatsapp" size={24} color="#25D366" />
                  </View>
                  <Text style={styles.actionLabel}>WhatsApp</Text>
                </Pressable>
              )}
            </View>
          </Animated.View>

          {/* Client Info */}
          <Animated.View entering={FadeInDown.delay(100)} style={styles.section}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <Ionicons name="mail-outline" size={20} color="#6B7280" />
                <Text style={styles.infoLabel}>Email</Text>
                <Text style={styles.infoValue}>{client.email}</Text>
              </View>

              {client.phone && (
                <View style={styles.infoRow}>
                  <Ionicons name="call-outline" size={20} color="#6B7280" />
                  <Text style={styles.infoLabel}>Phone</Text>
                  <Text style={styles.infoValue}>{client.phone}</Text>
                </View>
              )}

              {client.address && (
                <View style={styles.infoRow}>
                  <Ionicons name="location-outline" size={20} color="#6B7280" />
                  <Text style={styles.infoLabel}>Address</Text>
                  <Text style={styles.infoValue}>{client.address}</Text>
                </View>
              )}

              <View style={styles.infoRow}>
                <Ionicons name="calendar-outline" size={20} color="#6B7280" />
                <Text style={styles.infoLabel}>Member Since</Text>
                <Text style={styles.infoValue}>
                  {new Date(client.created_at).toLocaleDateString()}
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Galleries */}
          <Animated.View entering={FadeInDown.delay(200)} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Galleries</Text>
              <Text style={styles.sectionCount}>{projects.length}</Text>
            </View>

            {projects.length === 0 ? (
              <View style={styles.emptyGalleries}>
                <Ionicons name="images-outline" size={48} color="#D1D5DB" />
                <Text style={styles.emptyText}>No galleries yet</Text>
              </View>
            ) : (
              <View style={styles.projectList}>
                {projects.map((project, index) => (
                  <Pressable
                    key={project.id}
                    onPress={() => handleProjectPress(project)}
                    style={styles.projectItem}
                  >
                    <View style={styles.projectInfo}>
                      <Text style={styles.projectTitle} numberOfLines={1}>
                        {project.title}
                      </Text>
                      <View style={styles.projectMeta}>
                        <Ionicons name="images-outline" size={14} color="#6B7280" />
                        <Text style={styles.projectMetaText}>
                          {project.photo_count} photos
                        </Text>
                      </View>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
                  </Pressable>
                ))}
              </View>
            )}
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#6B7280',
    marginTop: 16,
    fontSize: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#667EEA',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileSection: {
    backgroundColor: '#667EEA',
    paddingBottom: 32,
    alignItems: 'center',
  },
  avatarContainer: {
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  avatarText: {
    fontSize: 36,
    fontWeight: '700',
    color: 'white',
  },
  clientName: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 8,
  },
  inactiveBadge: {
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 24,
  },
  inactiveBadgeText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FEE2E2',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 20,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: 'white',
  },
  section: {
    padding: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  sectionCount: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667EEA',
  },
  infoCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
    marginLeft: 12,
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#111827',
    textAlign: 'right',
    flex: 1,
  },
  projectList: {
    backgroundColor: 'white',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  projectItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  projectInfo: {
    flex: 1,
  },
  projectTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  projectMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  projectMetaText: {
    fontSize: 13,
    color: '#6B7280',
  },
  emptyGalleries: {
    alignItems: 'center',
    padding: 48,
    backgroundColor: 'white',
    borderRadius: 12,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B7280',
    marginTop: 12,
  },
});

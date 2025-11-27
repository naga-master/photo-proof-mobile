import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  RefreshControl,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { router } from 'expo-router';
import { Image } from 'expo-image';
import { useAuthStore } from '@/stores/authStore';
import { StatusBar } from 'expo-status-bar';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - 48 - 16) / 2;

interface RecentGallery {
  id: string;
  title: string;
  photoCount: number;
  coverImage: string;
  date: string;
  clientName?: string;
}

interface Stats {
  totalGalleries: number;
  totalPhotos: number;
  activeClients: number;
  pendingUploads: number;
  totalViews: number;
  favoriteCount: number;
  storageUsed: string;
  thisMonthGalleries: number;
}

export default function HomeScreen() {
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [recentGalleries, setRecentGalleries] = useState<RecentGallery[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalGalleries: 0,
    totalPhotos: 0,
    activeClients: 0,
    pendingUploads: 0,
    totalViews: 0,
    favoriteCount: 0,
    storageUsed: '0 GB',
    thisMonthGalleries: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // Simulate API call - replace with actual API
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setRecentGalleries([
        {
          id: '1',
          title: 'Wedding - Sarah & John',
          photoCount: 256,
          coverImage: 'https://picsum.photos/400/600?random=1',
          date: '2024-01-15',
          clientName: 'Sarah Thompson',
        },
        {
          id: '2',
          title: 'Corporate Event 2024',
          photoCount: 128,
          coverImage: 'https://picsum.photos/400/600?random=2',
          date: '2024-01-14',
          clientName: 'Tech Corp Inc.',
        },
      ]);
      
      setStats({
        totalGalleries: 24,
        totalPhotos: 3456,
        activeClients: 18,
        pendingUploads: 2,
        totalViews: 12847,
        favoriteCount: 892,
        storageUsed: '4.2 GB',
        thisMonthGalleries: 7,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const StatCard = ({ icon, label, value, color }: any) => (
    <LinearGradient
      colors={[color, color + '99']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.statCard}
    >
      <View style={styles.statIconContainer}>
        <Ionicons name={icon} size={24} color="white" />
      </View>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </LinearGradient>
  );

  const GalleryCard = ({ gallery, index }: { gallery: RecentGallery; index: number }) => (
    <Animated.View
      entering={FadeInDown.delay(100 * index).springify()}
    >
      <Pressable
        onPress={() => router.push(`/gallery/${gallery.id}`)}
        style={({ pressed }) => [
          styles.galleryCard,
          pressed && styles.cardPressed,
        ]}
      >
        <Image
          source={{ uri: gallery.coverImage }}
          style={styles.galleryImage}
          contentFit="cover"
          transition={300}
        />
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.8)']}
          style={styles.galleryGradient}
        >
          <View style={styles.galleryInfo}>
            <Text style={styles.galleryTitle} numberOfLines={1}>
              {gallery.title}
            </Text>
            <View style={styles.galleryMeta}>
              <View style={styles.galleryMetaItem}>
                <Ionicons name="images-outline" size={12} color="white" />
                <Text style={styles.galleryMetaText}>{gallery.photoCount}</Text>
              </View>
              {gallery.clientName && (
                <Text style={styles.galleryClient} numberOfLines={1}>
                  {gallery.clientName}
                </Text>
              )}
            </View>
          </View>
        </LinearGradient>
      </Pressable>
    </Animated.View>
  );

  return (
    <>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <Animated.View entering={FadeIn} style={styles.header}>
          <View>
            <Text style={styles.greeting}>
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}
            </Text>
            <Text style={styles.userName}>{user?.name || 'User'} 👋</Text>
          </View>
          <Pressable
            onPress={() => router.push('/notifications' as any)}
            style={styles.notificationButton}
          >
            <Ionicons name="notifications-outline" size={24} color="#374151" />
            <View style={styles.notificationBadge} />
          </Pressable>
        </Animated.View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
          contentContainerStyle={styles.scrollContent}
        >
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#6B7C4A" />
            </View>
          ) : (
            <>
              {/* Quick Actions */}
              <Animated.View entering={FadeInDown.delay(100)}>
                <View style={styles.quickActions}>
                  <Pressable
                    onPress={() => router.push('/create')}
                    style={({ pressed }) => [
                      styles.quickActionButton,
                      styles.primaryAction,
                      pressed && styles.buttonPressed,
                    ]}
                  >
                    <Ionicons name="add-circle" size={28} color="white" />
                    <Text style={styles.quickActionTextPrimary}>New Gallery</Text>
                  </Pressable>
                  
                  <Pressable
                    onPress={() => router.push('/gallery')}
                    style={({ pressed }) => [
                      styles.quickActionButton,
                      styles.secondaryAction,
                      pressed && styles.buttonPressed,
                    ]}
                  >
                    <Ionicons name="folder-open-outline" size={28} color="#667EEA" />
                    <Text style={styles.quickActionText}>Browse</Text>
                  </Pressable>
                  
                  <Pressable
                    onPress={() => router.push('/contracts' as any)}
                    style={({ pressed }) => [
                      styles.quickActionButton,
                      styles.secondaryAction,
                      pressed && styles.buttonPressed,
                    ]}
                  >
                    <Ionicons name="document-text-outline" size={28} color="#667EEA" />
                    <Text style={styles.quickActionText}>Contracts</Text>
                  </Pressable>
                </View>
              </Animated.View>

              {/* Stats Grid */}
              <Animated.View entering={FadeInDown.delay(200)}>
                <Text style={styles.sectionTitle}>Overview</Text>
                <View style={styles.statsGrid}>
                  <StatCard
                    icon="albums-outline"
                    label="Galleries"
                    value={stats.totalGalleries}
                    color="#6B7C4A"
                  />
                  <StatCard
                    icon="images-outline"
                    label="Photos"
                    value={stats.totalPhotos.toLocaleString()}
                    color="#8A9D6B"
                  />
                  <StatCard
                    icon="people-outline"
                    label="Clients"
                    value={stats.activeClients}
                    color="#FF8C42"
                  />
                  <StatCard
                    icon="eye-outline"
                    label="Views"
                    value={stats.totalViews.toLocaleString()}
                    color="#D4A574"
                  />
                  <StatCard
                    icon="heart-outline"
                    label="Favorites"
                    value={stats.favoriteCount.toLocaleString()}
                    color="#F4A259"
                  />
                  <StatCard
                    icon="cloud-outline"
                    label="Storage"
                    value={stats.storageUsed}
                    color="#6B9C4A"
                  />
                </View>
              </Animated.View>

              {/* This Month */}
              {user?.role === 'studio' && (
                <Animated.View entering={FadeInDown.delay(250)}>
                  <Text style={styles.sectionTitle}>This Month</Text>
                  <View style={styles.monthCard}>
                    <View style={styles.monthStat}>
                      <View style={styles.monthIconContainer}>
                        <Ionicons name="add-circle" size={24} color="#6B9C4A" />
                      </View>
                      <View style={styles.monthInfo}>
                        <Text style={styles.monthValue}>{stats.thisMonthGalleries}</Text>
                        <Text style={styles.monthLabel}>New Galleries</Text>
                      </View>
                    </View>
                    
                    <View style={styles.monthStat}>
                      <View style={styles.monthIconContainer}>
                        <Ionicons name="trending-up" size={24} color="#6B7C4A" />
                      </View>
                      <View style={styles.monthInfo}>
                        <Text style={styles.monthValue}>+23%</Text>
                        <Text style={styles.monthLabel}>Growth</Text>
                      </View>
                    </View>
                  </View>
                </Animated.View>
              )}

              {/* Recent Galleries */}
              <Animated.View entering={FadeInDown.delay(300)}>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Recent Galleries</Text>
                  <Pressable onPress={() => router.push('/gallery')}>
                    <Text style={styles.seeAllText}>See all</Text>
                  </Pressable>
                </View>
                
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.galleriesContainer}
                >
                  {recentGalleries.map((gallery, index) => (
                    <GalleryCard key={gallery.id} gallery={gallery} index={index} />
                  ))}
                </ScrollView>
              </Animated.View>
            </>
          )}
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF5E8',
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
  greeting: {
    fontSize: 14,
    color: '#6B7C4A',
  },
  userName: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginTop: 4,
  },
  notificationButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#EF4444',
    borderWidth: 2,
    borderColor: 'white',
  },
  scrollContent: {
    paddingBottom: 100,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  quickActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  quickActionButton: {
    minWidth: '30%',
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
  },
  primaryAction: {
    backgroundColor: '#6B7C4A',
    shadowColor: '#6B7C4A',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  secondaryAction: {
    backgroundColor: 'white',
    borderWidth: 1.5,
    borderColor: '#6B7C4A',
  },
  quickActionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6B7C4A',
  },
  quickActionTextPrimary: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
  buttonPressed: {
    opacity: 0.9,
    transform: [{ scale: 0.98 }],
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    paddingHorizontal: 24,
    marginTop: 32,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginTop: 32,
    marginBottom: 16,
  },
  seeAllText: {
    fontSize: 14,
    color: '#6B7C4A',
    fontWeight: '600',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    paddingHorizontal: 24,
  },
  statCard: {
    width: (SCREEN_WIDTH - 48 - 12) / 2,
    padding: 20,
    borderRadius: 20,
    height: 100,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
  },
  statLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.9)',
    marginTop: 2,
  },
  galleriesContainer: {
    paddingHorizontal: 24,
    gap: 16,
  },
  galleryCard: {
    width: CARD_WIDTH,
    height: CARD_WIDTH * 1.5,
    borderRadius: 16,
    overflow: 'hidden',
    marginRight: 16,
    backgroundColor: 'white',
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
  galleryImage: {
    width: '100%',
    height: '100%',
  },
  galleryGradient: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    justifyContent: 'flex-end',
    padding: 12,
  },
  galleryInfo: {
    gap: 4,
  },
  galleryTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  galleryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  galleryMetaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  galleryMetaText: {
    fontSize: 12,
    color: 'white',
  },
  galleryClient: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.8)',
    flex: 1,
  },
  monthCard: {
    flexDirection: 'row',
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 24,
    gap: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  monthStat: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  monthIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  monthInfo: {
    flex: 1,
  },
  monthValue: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 2,
  },
  monthLabel: {
    fontSize: 13,
    color: '#6B7280',
  },
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Animated, { FadeInDown, FadeIn } from 'react-native-reanimated';
import { clientService, Client } from '@/services/api/clients';
import Toast from 'react-native-toast-message';
import { haptics } from '@/utils/haptics';

export default function ClientsScreen() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    fetchClients();
  }, [filter]);

  const fetchClients = async () => {
    try {
      setLoading(true);
      const params: any = {};
      
      if (filter !== 'all') {
        params.is_active = filter === 'active';
      }
      
      if (searchQuery) {
        params.search = searchQuery;
      }

      const data = await clientService.getClients(params);
      setClients(data);
    } catch (error) {
      console.error('Failed to fetch clients:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load clients',
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchClients();
    setRefreshing(false);
  };

  const handleSearch = () => {
    fetchClients();
  };

  const handleClientPress = (client: Client) => {
    haptics.impact('light');
    router.push(`/clients/${client.id}`);
  };

  const handleAddClient = () => {
    haptics.impact('light');
    router.push('/clients/add');
  };

  const FilterButton = ({ label, value }: { label: string; value: typeof filter }) => (
    <Pressable
      onPress={() => setFilter(value)}
      style={[
        styles.filterButton,
        filter === value && styles.filterButtonActive,
      ]}
    >
      <Text
        style={[
          styles.filterButtonText,
          filter === value && styles.filterButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );

  const ClientCard = ({ client, index }: { client: Client; index: number }) => {
    const initials = client.name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);

    return (
      <Animated.View entering={FadeInDown.delay(index * 30).springify()}>
        <Pressable
          onPress={() => handleClientPress(client)}
          style={({ pressed }) => [
            styles.clientCard,
            pressed && styles.cardPressed,
          ]}
        >
          <View style={styles.clientAvatar}>
            {client.avatar_url || client.profile_picture ? (
              <Animated.Image
                source={{ uri: client.avatar_url || client.profile_picture }}
                style={styles.avatarImage}
              />
            ) : (
              <Text style={styles.avatarText}>{initials}</Text>
            )}
          </View>

          <View style={styles.clientInfo}>
            <View style={styles.clientHeader}>
              <Text style={styles.clientName} numberOfLines={1}>
                {client.name}
              </Text>
              {!client.is_active && (
                <View style={styles.inactiveBadge}>
                  <Text style={styles.inactiveBadgeText}>Inactive</Text>
                </View>
              )}
            </View>

            <Text style={styles.clientEmail} numberOfLines={1}>
              {client.email}
            </Text>

            {client.phone && (
              <View style={styles.clientMeta}>
                <Ionicons name="call-outline" size={14} color="#6B7280" />
                <Text style={styles.clientMetaText}>{client.phone}</Text>
              </View>
            )}

            {client.total_projects !== undefined && (
              <View style={styles.clientStats}>
                <View style={styles.statItem}>
                  <Ionicons name="images-outline" size={16} color="#667EEA" />
                  <Text style={styles.statText}>
                    {client.total_projects} {client.total_projects === 1 ? 'gallery' : 'galleries'}
                  </Text>
                </View>
              </View>
            )}
          </View>

          <Ionicons name="chevron-forward" size={20} color="#9CA3AF" />
        </Pressable>
      </Animated.View>
    );
  };

  const EmptyState = () => (
    <Animated.View entering={FadeIn} style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
        <Ionicons name="people-outline" size={64} color="#D1D5DB" />
      </View>
      <Text style={styles.emptyTitle}>No Clients Yet</Text>
      <Text style={styles.emptySubtitle}>
        Add your first client to get started
      </Text>
      <Pressable style={styles.emptyButton} onPress={handleAddClient}>
        <Ionicons name="add-circle" size={24} color="white" />
        <Text style={styles.emptyButtonText}>Add Client</Text>
      </Pressable>
    </Animated.View>
  );

  return (
    <>
      <StatusBar style="dark" />
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Pressable onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#111827" />
            </Pressable>
            <Text style={styles.title}>Clients</Text>
            <Pressable onPress={handleAddClient} style={styles.addButton}>
              <Ionicons name="add" size={24} color="white" />
            </Pressable>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <Ionicons name="search" size={20} color="#9CA3AF" style={styles.searchIcon} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search clients..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {searchQuery.length > 0 && (
              <Pressable onPress={() => { setSearchQuery(''); fetchClients(); }}>
                <Ionicons name="close-circle" size={20} color="#9CA3AF" />
              </Pressable>
            )}
          </View>

          {/* Filters */}
          <View style={styles.filterContainer}>
            <FilterButton label="All" value="all" />
            <FilterButton label="Active" value="active" />
            <FilterButton label="Inactive" value="inactive" />
          </View>
        </View>

        {/* Client List */}
        {loading && !refreshing ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#667EEA" />
          </View>
        ) : clients.length === 0 ? (
          <EmptyState />
        ) : (
          <FlatList
            data={clients}
            renderItem={({ item, index }) => <ClientCard client={item} index={index} />}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
          />
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
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111827',
  },
  addButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#667EEA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#111827',
  },
  filterContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F9FAFB',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  filterButtonActive: {
    backgroundColor: '#667EEA',
    borderColor: '#667EEA',
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6B7280',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  clientCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  cardPressed: {
    opacity: 0.7,
    transform: [{ scale: 0.98 }],
  },
  clientAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#667EEA',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: 'white',
  },
  clientInfo: {
    flex: 1,
  },
  clientHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  clientName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    flex: 1,
  },
  inactiveBadge: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  inactiveBadgeText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#EF4444',
  },
  clientEmail: {
    fontSize: 14,
    color: '#6B7280',
    marginBottom: 6,
  },
  clientMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 8,
  },
  clientMetaText: {
    fontSize: 13,
    color: '#6B7280',
  },
  clientStats: {
    flexDirection: 'row',
    gap: 16,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#667EEA',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
    backgroundColor: '#F3F4F6',
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
  emptyButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#667EEA',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 30,
    shadowColor: '#667EEA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  emptyButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

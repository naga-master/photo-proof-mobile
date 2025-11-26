import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '@/stores/authStore';
import contractsAPI, { Contract, ContractStats } from '@/services/api/contracts';

export default function ContractsScreen() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [stats, setStats] = useState<ContractStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<string | undefined>();
  const { user } = useAuthStore();

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    try {
      setLoading(true);
      
      // Load contracts
      const contractsData = await contractsAPI.getContracts({
        status: filter,
        limit: 50,
      });
      setContracts(contractsData.contracts);
      
      // Load stats (only for studio users)
      if (user?.role && ['studio_owner', 'studio_admin', 'studio_photographer'].includes(user.role)) {
        const statsData = await contractsAPI.getContractStats();
        setStats(statsData);
      }
    } catch (error) {
      console.error('Failed to load contracts:', error);
      Alert.alert('Error', 'Failed to load contracts');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return '#6B7280';
      case 'sent':
      case 'viewed': return '#F59E0B';
      case 'signed': return '#10B981';
      case 'expired':
      case 'cancelled': return '#EF4444';
      default: return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft': return 'document-outline';
      case 'sent': return 'send-outline';
      case 'viewed': return 'eye-outline';
      case 'signed': return 'checkmark-circle-outline';
      case 'expired': return 'time-outline';
      case 'cancelled': return 'close-circle-outline';
      default: return 'document-outline';
    }
  };

  const StatCard = ({ icon, label, value, color }: any) => (
    <View style={[styles.statCard, { borderLeftColor: color, borderLeftWidth: 3 }]}>
      <View style={styles.statHeader}>
        <Ionicons name={icon as any} size={20} color={color} />
        <Text style={styles.statLabel}>{label}</Text>
      </View>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );

  const ContractItem = ({ contract }: { contract: Contract }) => (
    <TouchableOpacity
      style={styles.contractCard}
      onPress={() => router.push(`/contracts/${contract.id}` as any)}
    >
      <View style={styles.contractHeader}>
        <View style={{ flex: 1 }}>
          <Text style={styles.contractTitle}>{contract.title}</Text>
          <Text style={styles.contractNumber}>{contract.contract_number}</Text>
          {contract.client_name && (
            <Text style={styles.contractClient}>Client: {contract.client_name}</Text>
          )}
        </View>
        <View style={styles.contractStatus}>
          <View style={[styles.statusBadge, { backgroundColor: getStatusColor(contract.status) + '20' }]}>
            <Ionicons name={getStatusIcon(contract.status) as any} size={16} color={getStatusColor(contract.status)} />
            <Text style={[styles.statusText, { color: getStatusColor(contract.status) }]}>
              {contract.status}
            </Text>
          </View>
          <Text style={styles.contractDate}>
            {new Date(contract.created_at).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667EEA" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.headerTitle}>Contracts</Text>
          <TouchableOpacity
            style={styles.newButton}
            onPress={() => Alert.alert('Coming Soon', 'Contract creation UI coming soon!')}
          >
            <Ionicons name="add-circle-outline" size={20} color="white" />
            <Text style={styles.newButtonText}>New</Text>
          </TouchableOpacity>
        </View>
        
        {/* Stats Cards */}
        {stats && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.statsScroll}
            contentContainerStyle={styles.statsContent}
          >
            <StatCard icon="document-text-outline" label="Total" value={stats.total} color="#667EEA" />
            <StatCard icon="create-outline" label="Draft" value={stats.draft} color="#6B7280" />
            <StatCard icon="time-outline" label="Pending" value={stats.pending} color="#F59E0B" />
            <StatCard icon="checkmark-circle-outline" label="Signed" value={stats.signed} color="#10B981" />
            <StatCard icon="warning-outline" label="Expiring" value={stats.expiring} color="#EF4444" />
          </ScrollView>
        )}
      </View>

      {/* Filter Pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterScroll}>
        <View style={styles.filterContent}>
          {['all', 'draft', 'sent', 'viewed', 'signed'].map((status) => (
            <TouchableOpacity
              key={status}
              style={[styles.filterPill, (!filter && status === 'all') || filter === status ? styles.filterPillActive : null]}
              onPress={() => setFilter(status === 'all' ? undefined : status)}
            >
              <Text style={[styles.filterText, (!filter && status === 'all') || filter === status ? styles.filterTextActive : null]}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Contract List */}
      <ScrollView
        style={styles.contractList}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#667EEA']} tintColor="#667EEA" />}
      >
        {contracts.length > 0 ? (
          contracts.map((contract) => <ContractItem key={contract.id} contract={contract} />)
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color="#D1D5DB" />
            <Text style={styles.emptyTitle}>No contracts found</Text>
            <Text style={styles.emptySubtitle}>
              {filter ? `No ${filter} contracts` : 'Create your first contract to get started'}
            </Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
  header: { backgroundColor: 'white', paddingHorizontal: 16, paddingVertical: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#1F2937' },
  newButton: { backgroundColor: '#667EEA', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 4 },
  newButtonText: { color: 'white', fontWeight: '600' },
  statsScroll: { marginHorizontal: -16, paddingHorizontal: 12 },
  statsContent: { paddingVertical: 8, gap: 8 },
  statCard: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginHorizontal: 4, minWidth: 120, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  statHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  statLabel: { fontSize: 12, color: '#6B7280' },
  statValue: { fontSize: 24, fontWeight: 'bold', color: '#1F2937' },
  filterScroll: { paddingVertical: 12, maxHeight: 60 },
  filterContent: { flexDirection: 'row', paddingHorizontal: 16, gap: 8 },
  filterPill: { paddingHorizontal: 16, paddingVertical: 8, backgroundColor: '#E5E7EB', borderRadius: 20 },
  filterPillActive: { backgroundColor: '#667EEA' },
  filterText: { color: '#6B7280', fontWeight: '600' },
  filterTextActive: { color: 'white' },
  contractList: { flex: 1, paddingHorizontal: 16 },
  contractCard: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  contractHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  contractTitle: { fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 4 },
  contractNumber: { fontSize: 14, color: '#6B7280', marginBottom: 2 },
  contractClient: { fontSize: 14, color: '#6B7280' },
  contractStatus: { alignItems: 'flex-end' },
  statusBadge: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 4 },
  statusText: { fontSize: 12, fontWeight: '600', textTransform: 'capitalize' },
  contractDate: { fontSize: 12, color: '#9CA3AF', marginTop: 8 },
  emptyState: { alignItems: 'center', paddingVertical: 48 },
  emptyTitle: { fontSize: 18, color: '#6B7280', marginTop: 16, fontWeight: '500' },
  emptySubtitle: { fontSize: 14, color: '#9CA3AF', marginTop: 4, textAlign: 'center' },
});

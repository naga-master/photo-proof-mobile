import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../stores/authStore';
import contractsAPI, { Contract, ContractStats } from '../../services/api/contracts';

const ContractDashboard: React.FC = () => {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [stats, setStats] = useState<ContractStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<string | undefined>();
  const navigation = useNavigation();
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
      case 'draft':
        return '#6B7280';
      case 'sent':
      case 'viewed':
        return '#F59E0B';
      case 'signed':
        return '#10B981';
      case 'expired':
      case 'cancelled':
        return '#EF4444';
      default:
        return '#6B7280';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'draft':
        return 'document-outline';
      case 'sent':
        return 'send-outline';
      case 'viewed':
        return 'eye-outline';
      case 'signed':
        return 'checkmark-circle-outline';
      case 'expired':
        return 'time-outline';
      case 'cancelled':
        return 'close-circle-outline';
      default:
        return 'document-outline';
    }
  };

  const StatCard: React.FC<{
    icon: string;
    label: string;
    value: number;
    color: string;
    onPress?: () => void;
  }> = ({ icon, label, value, color, onPress }) => (
    <TouchableOpacity
      style={{
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
      onPress={onPress}
      disabled={!onPress}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
        <Ionicons name={icon as any} size={20} color={color} />
        <Text style={{ fontSize: 12, color: '#6B7280', marginLeft: 8 }}>{label}</Text>
      </View>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1F2937' }}>{value}</Text>
    </TouchableOpacity>
  );

  const ContractItem: React.FC<{ contract: Contract }> = ({ contract }) => (
    <TouchableOpacity
      style={{
        backgroundColor: 'white',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}
      onPress={() => navigation.navigate('ContractDetail' as any, { contractId: contract.id })}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 16, fontWeight: '600', color: '#1F2937', marginBottom: 4 }}>
            {contract.title}
          </Text>
          <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 2 }}>
            {contract.contract_number}
          </Text>
          {contract.client_name && (
            <Text style={{ fontSize: 14, color: '#6B7280' }}>
              Client: {contract.client_name}
            </Text>
          )}
          {contract.project_name && (
            <Text style={{ fontSize: 14, color: '#6B7280' }}>
              Project: {contract.project_name}
            </Text>
          )}
        </View>
        <View style={{ alignItems: 'center' }}>
          <View
            style={{
              backgroundColor: getStatusColor(contract.status) + '20',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
              flexDirection: 'row',
              alignItems: 'center',
            }}
          >
            <Ionicons
              name={getStatusIcon(contract.status) as any}
              size={16}
              color={getStatusColor(contract.status)}
            />
            <Text
              style={{
                fontSize: 12,
                fontWeight: '600',
                color: getStatusColor(contract.status),
                marginLeft: 4,
                textTransform: 'capitalize',
              }}
            >
              {contract.status}
            </Text>
          </View>
          <Text style={{ fontSize: 12, color: '#9CA3AF', marginTop: 8 }}>
            {new Date(contract.created_at).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      {/* Header */}
      <View style={{ backgroundColor: 'white', paddingTop: 44, paddingBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 }}>
        <View style={{ paddingHorizontal: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <Text style={{ fontSize: 28, fontWeight: 'bold', color: '#1F2937' }}>Contracts</Text>
            <TouchableOpacity
              style={{
                backgroundColor: '#3B82F6',
                paddingHorizontal: 16,
                paddingVertical: 8,
                borderRadius: 8,
                flexDirection: 'row',
                alignItems: 'center',
              }}
              onPress={() => navigation.navigate('CreateContract' as any)}
            >
              <Ionicons name="add-circle-outline" size={20} color="white" />
              <Text style={{ color: 'white', marginLeft: 4, fontWeight: '600' }}>New</Text>
            </TouchableOpacity>
          </View>
          
          {/* Stats Cards */}
          {stats && (
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={{ marginHorizontal: -16, paddingHorizontal: 12 }}
            >
              <View style={{ flexDirection: 'row', paddingVertical: 8 }}>
                <StatCard
                  icon="document-text-outline"
                  label="Total"
                  value={stats.total}
                  color="#3B82F6"
                />
                <StatCard
                  icon="create-outline"
                  label="Draft"
                  value={stats.draft}
                  color="#6B7280"
                  onPress={() => setFilter('draft')}
                />
                <StatCard
                  icon="time-outline"
                  label="Pending"
                  value={stats.pending}
                  color="#F59E0B"
                  onPress={() => setFilter('sent')}
                />
                <StatCard
                  icon="checkmark-circle-outline"
                  label="Signed"
                  value={stats.signed}
                  color="#10B981"
                  onPress={() => setFilter('signed')}
                />
                <StatCard
                  icon="warning-outline"
                  label="Expiring"
                  value={stats.expiring}
                  color="#EF4444"
                />
              </View>
            </ScrollView>
          )}
        </View>
      </View>

      {/* Filter Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ paddingVertical: 12, paddingHorizontal: 16, maxHeight: 60 }}
      >
        <TouchableOpacity
          style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            backgroundColor: !filter ? '#3B82F6' : '#E5E7EB',
            borderRadius: 20,
            marginRight: 8,
          }}
          onPress={() => setFilter(undefined)}
        >
          <Text style={{ color: !filter ? 'white' : '#6B7280', fontWeight: '600' }}>All</Text>
        </TouchableOpacity>
        {['draft', 'sent', 'viewed', 'signed'].map(status => (
          <TouchableOpacity
            key={status}
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              backgroundColor: filter === status ? '#3B82F6' : '#E5E7EB',
              borderRadius: 20,
              marginRight: 8,
            }}
            onPress={() => setFilter(status)}
          >
            <Text style={{ color: filter === status ? 'white' : '#6B7280', fontWeight: '600', textTransform: 'capitalize' }}>
              {status}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Contract List */}
      <ScrollView
        style={{ flex: 1, paddingHorizontal: 16 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#3B82F6']} />
        }
      >
        {contracts.length > 0 ? (
          contracts.map(contract => <ContractItem key={contract.id} contract={contract} />)
        ) : (
          <View style={{ alignItems: 'center', paddingVertical: 48 }}>
            <Ionicons name="document-text-outline" size={64} color="#D1D5DB" />
            <Text style={{ fontSize: 18, color: '#6B7280', marginTop: 16, fontWeight: '500' }}>
              No contracts found
            </Text>
            <Text style={{ fontSize: 14, color: '#9CA3AF', marginTop: 4, textAlign: 'center' }}>
              {filter ? `No ${filter} contracts` : 'Create your first contract to get started'}
            </Text>
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

export default ContractDashboard;

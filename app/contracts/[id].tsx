import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import ContractViewer from '@/screens/contracts/ContractViewer';
import { useLocalSearchParams } from 'expo-router';

export default function ContractDetailScreen() {
  const { id } = useLocalSearchParams();
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F9FAFB' }} edges={['top']}>
      <ContractViewer contractId={id as string} />
    </SafeAreaView>
  );
}

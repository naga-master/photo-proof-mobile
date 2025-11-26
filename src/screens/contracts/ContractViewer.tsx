import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Share,
  Linking,
  Dimensions,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Pdf from 'react-native-pdf';
import { WebView } from 'react-native-webview';
import contractsAPI, { Contract } from '@/services/api/contracts';
import SignaturePad from '@/components/contracts/SignaturePad';
import { useAuthStore } from '@/stores/authStore';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

interface ContractViewerProps {
  contractId: string;
}

const ContractViewer: React.FC<ContractViewerProps> = ({ contractId }) => {
  const { user, token } = useAuthStore();
  
  const [contract, setContract] = useState<Contract | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSignature, setShowSignature] = useState(false);
  const [viewMode, setViewMode] = useState<'pdf' | 'text'>('pdf');

  useEffect(() => {
    loadContract();
  }, [contractId]);

  const loadContract = async () => {
    try {
      setLoading(true);
      const data = await contractsAPI.getContract(contractId);
      setContract(data);
      
      // Check if should show signature pad immediately
      if (data.status === 'sent' || data.status === 'viewed') {
        // Optional: Auto-show signature pad for unsigned contracts
        // setShowSignature(true);
      }
    } catch (error) {
      console.error('Failed to load contract:', error);
      Alert.alert('Error', 'Failed to load contract');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleSign = async (signatureData: { signature: string; timestamp?: string; agreement: boolean }) => {
    if (!contract) return;
    
    try {
      const result = await contractsAPI.signContract(contract.id, signatureData);
      
      Alert.alert(
        'Success',
        'Contract signed successfully!',
        [
          { text: 'OK', onPress: () => {
            setShowSignature(false);
            loadContract(); // Reload to get updated contract
          }}
        ]
      );
    } catch (error) {
      console.error('Failed to sign contract:', error);
      Alert.alert('Error', 'Failed to sign contract. Please try again.');
    }
  };

  const handleShare = async () => {
    if (!contract) return;
    
    try {
      await Share.share({
        message: `Contract: ${contract.title}\nNumber: ${contract.contract_number}`,
        title: contract.title,
      });
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  const handleDownload = () => {
    if (!contract) return;
    
    const pdfUrl = contractsAPI.getPDFUrl(contract);
    if (pdfUrl) {
      Linking.openURL(pdfUrl);
    } else {
      Alert.alert('Error', 'PDF not available');
    }
  };

  const handleVerifySignature = async () => {
    if (!contract) return;
    
    try {
      const result = await contractsAPI.verifySignature(contract.id);
      Alert.alert(
        'Signature Verification',
        result.signature_valid 
          ? `✅ Signature is valid\n\nSigned: ${result.signed_at ? new Date(result.signed_at).toLocaleString() : 'N/A'}`
          : '❌ Signature verification failed',
      );
    } catch (error) {
      console.error('Failed to verify signature:', error);
      Alert.alert('Error', 'Failed to verify signature');
    }
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

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' }}>
        <ActivityIndicator size="large" color="#3B82F6" />
      </View>
    );
  }

  if (!contract) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' }}>
        <Text style={{ fontSize: 16, color: '#6B7280' }}>Contract not found</Text>
      </View>
    );
  }

  if (showSignature) {
    return (
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        {/* Header */}
        <View style={{
          backgroundColor: 'white',
          paddingTop: 44,
          paddingBottom: 16,
          paddingHorizontal: 16,
          borderBottomWidth: 1,
          borderBottomColor: '#E5E7EB',
        }}>
          <TouchableOpacity
            onPress={() => setShowSignature(false)}
            style={{ flexDirection: 'row', alignItems: 'center' }}
          >
            <Ionicons name="arrow-back" size={24} color="#1F2937" />
            <Text style={{ fontSize: 16, marginLeft: 8, color: '#1F2937' }}>Back to Contract</Text>
          </TouchableOpacity>
        </View>
        
        <SignaturePad
          contractId={contract.id}
          contractTitle={contract.title}
          onSign={handleSign}
          onCancel={() => setShowSignature(false)}
        />
      </View>
    );
  }

  const pdfUrl = contractsAPI.getPDFUrl(contract);

  return (
    <View style={{ flex: 1, backgroundColor: '#F9FAFB' }}>
      {/* Header */}
      <View style={{
        backgroundColor: 'white',
        paddingTop: 44,
        paddingBottom: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
      }}>
        <View style={{ paddingHorizontal: 16 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="arrow-back" size={24} color="#1F2937" />
            </TouchableOpacity>
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <TouchableOpacity onPress={handleShare}>
                <Ionicons name="share-outline" size={24} color="#1F2937" />
              </TouchableOpacity>
              {pdfUrl && (
                <TouchableOpacity onPress={handleDownload}>
                  <Ionicons name="download-outline" size={24} color="#1F2937" />
                </TouchableOpacity>
              )}
            </View>
          </View>
          
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1F2937', marginBottom: 4 }}>
            {contract.title}
          </Text>
          <Text style={{ fontSize: 14, color: '#6B7280', marginBottom: 8 }}>
            {contract.contract_number}
          </Text>
          
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <View style={{
              backgroundColor: getStatusColor(contract.status) + '20',
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 8,
              flexDirection: 'row',
              alignItems: 'center',
            }}>
              <Ionicons
                name={contract.status === 'signed' ? 'checkmark-circle' : 'time-outline'}
                size={16}
                color={getStatusColor(contract.status)}
              />
              <Text style={{
                fontSize: 12,
                fontWeight: '600',
                color: getStatusColor(contract.status),
                marginLeft: 4,
                textTransform: 'capitalize',
              }}>
                {contract.status}
              </Text>
            </View>
            
            {contract.status === 'signed' && (
              <TouchableOpacity
                onPress={handleVerifySignature}
                style={{ flexDirection: 'row', alignItems: 'center' }}
              >
                <Ionicons name="shield-checkmark-outline" size={16} color="#10B981" />
                <Text style={{ fontSize: 12, color: '#10B981', marginLeft: 4 }}>Verify</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>

      {/* View Mode Toggle */}
      <View style={{
        flexDirection: 'row',
        backgroundColor: 'white',
        padding: 8,
        marginHorizontal: 16,
        marginTop: 12,
        borderRadius: 8,
      }}>
        <TouchableOpacity
          style={{
            flex: 1,
            paddingVertical: 8,
            backgroundColor: viewMode === 'pdf' ? '#3B82F6' : 'transparent',
            borderRadius: 6,
            alignItems: 'center',
          }}
          onPress={() => setViewMode('pdf')}
        >
          <Text style={{ color: viewMode === 'pdf' ? 'white' : '#6B7280', fontWeight: '600' }}>
            PDF View
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            flex: 1,
            paddingVertical: 8,
            backgroundColor: viewMode === 'text' ? '#3B82F6' : 'transparent',
            borderRadius: 6,
            alignItems: 'center',
          }}
          onPress={() => setViewMode('text')}
        >
          <Text style={{ color: viewMode === 'text' ? 'white' : '#6B7280', fontWeight: '600' }}>
            Text View
          </Text>
        </TouchableOpacity>
      </View>

      {/* Contract Content */}
      <View style={{ flex: 1, marginTop: 12 }}>
        {viewMode === 'pdf' && pdfUrl ? (
          <View style={{ flex: 1, marginHorizontal: 16 }}>
            <Pdf
              source={{
                uri: pdfUrl,
                headers: token ? { Authorization: `Bearer ${token}` } : undefined,
              }}
              style={{
                flex: 1,
                width: screenWidth - 32,
                height: screenHeight - 300,
                backgroundColor: 'white',
                borderRadius: 8,
              }}
              onLoadComplete={(numberOfPages, filePath) => {
                console.log(`Number of pages: ${numberOfPages}`);
              }}
              onError={(error) => {
                console.error('PDF Error:', error);
                Alert.alert('Error', 'Failed to load PDF');
              }}
            />
          </View>
        ) : viewMode === 'text' ? (
          <ScrollView style={{ flex: 1, paddingHorizontal: 16 }}>
            <View style={{
              backgroundColor: 'white',
              borderRadius: 8,
              padding: 16,
              marginBottom: 100,
            }}>
              <WebView
                source={{ html: `
                  <html>
                    <head>
                      <meta name="viewport" content="width=device-width, initial-scale=1">
                      <style>
                        body {
                          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                          padding: 16px;
                          line-height: 1.6;
                          color: #1F2937;
                        }
                        h1, h2, h3 { color: #111827; margin-top: 20px; }
                        p { margin: 10px 0; }
                      </style>
                    </head>
                    <body>
                      ${contract.content.replace(/\n/g, '<br />')}
                    </body>
                  </html>
                ` }}
                style={{ height: screenHeight - 300 }}
                scrollEnabled={false}
              />
            </View>
          </ScrollView>
        ) : (
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <Ionicons name="document-text-outline" size={64} color="#D1D5DB" />
            <Text style={{ fontSize: 16, color: '#6B7280', marginTop: 16 }}>
              No PDF available
            </Text>
          </View>
        )}
      </View>

      {/* Action Button */}
      {(contract.status === 'sent' || contract.status === 'viewed') && (
        <View style={{
          position: 'absolute',
          bottom: 20,
          left: 16,
          right: 16,
        }}>
          <TouchableOpacity
            style={{
              backgroundColor: '#3B82F6',
              paddingVertical: 16,
              borderRadius: 12,
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.2,
              shadowRadius: 8,
              elevation: 5,
            }}
            onPress={() => setShowSignature(true)}
          >
            <Ionicons name="create-outline" size={24} color="white" />
            <Text style={{
              color: 'white',
              fontSize: 18,
              fontWeight: 'bold',
              marginLeft: 8,
            }}>
              Sign Contract
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default ContractViewer;

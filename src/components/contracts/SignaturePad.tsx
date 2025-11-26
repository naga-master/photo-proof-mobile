import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Alert,
  ScrollView,
  Switch,
  ActivityIndicator,
} from 'react-native';
import SignatureScreen from 'react-native-signature-canvas';
import { Ionicons } from '@expo/vector-icons';

interface SignaturePadProps {
  contractId: string;
  onSign: (signatureData: { signature: string; timestamp?: string; agreement: boolean }) => Promise<void>;
  onCancel?: () => void;
  contractTitle?: string;
}

const SignaturePad: React.FC<SignaturePadProps> = ({
  contractId,
  onSign,
  onCancel,
  contractTitle,
}) => {
  const signatureRef = useRef<any>(null);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [signing, setSigning] = useState(false);
  const [signatureEmpty, setSignatureEmpty] = useState(true);

  const handleSignature = async (signature: string) => {
    if (!agreedToTerms) {
      Alert.alert('Agreement Required', 'Please agree to the terms and conditions before signing.');
      return;
    }

    try {
      setSigning(true);
      const signatureData = {
        signature,
        timestamp: new Date().toISOString(),
        agreement: agreedToTerms,
      };
      
      await onSign(signatureData);
    } catch (error) {
      console.error('Failed to sign contract:', error);
      Alert.alert('Error', 'Failed to sign contract. Please try again.');
    } finally {
      setSigning(false);
    }
  };

  const handleClear = () => {
    signatureRef.current?.clearSignature();
    setSignatureEmpty(true);
  };

  const handleBegin = () => {
    setSignatureEmpty(false);
  };

  const handleEnd = () => {
    signatureRef.current?.readSignature();
  };

  const handleOK = (signature: string) => {
    handleSignature(signature);
  };

  const style = `.m-signature-pad {
    box-shadow: none;
    border: 2px dashed #E5E7EB;
    border-radius: 8px;
    background-color: #FFFFFF;
    margin: 10px;
  }
  .m-signature-pad--footer {
    display: none;
  }
  .m-signature-pad--body {
    border: none;
    min-height: 200px;
  }
  .m-signature-pad--body canvas {
    border-radius: 4px;
  }`;

  return (
    <ScrollView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ padding: 20 }}>
        {/* Header */}
        <View style={{ marginBottom: 24 }}>
          <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#1F2937', marginBottom: 8 }}>
            Sign Contract
          </Text>
          {contractTitle && (
            <Text style={{ fontSize: 16, color: '#6B7280' }}>
              {contractTitle}
            </Text>
          )}
        </View>

        {/* Instructions */}
        <View style={{
          backgroundColor: '#EFF6FF',
          padding: 16,
          borderRadius: 8,
          marginBottom: 20,
          flexDirection: 'row',
          alignItems: 'flex-start'
        }}>
          <Ionicons name="information-circle" size={20} color="#3B82F6" style={{ marginRight: 8, marginTop: 2 }} />
          <Text style={{ flex: 1, fontSize: 14, color: '#1E40AF', lineHeight: 20 }}>
            Please sign below using your finger or stylus. Your signature will be legally binding upon submission.
          </Text>
        </View>

        {/* Signature Canvas */}
        <View style={{ marginBottom: 20 }}>
          <Text style={{ fontSize: 14, fontWeight: '600', color: '#374151', marginBottom: 8 }}>
            Your Signature
          </Text>
          <View style={{
            borderWidth: 2,
            borderColor: '#E5E7EB',
            borderStyle: 'dashed',
            borderRadius: 8,
            overflow: 'hidden',
            height: 200,
            backgroundColor: '#FFFFFF',
          }}>
            <SignatureScreen
              ref={signatureRef}
              onOK={handleOK}
              onBegin={handleBegin}
              onEnd={handleEnd}
              onClear={() => setSignatureEmpty(true)}
              descriptionText=""
              clearText="Clear"
              confirmText="Save"
              webStyle={style}
              backgroundColor="#FFFFFF"
              penColor="#000000"
              minWidth={0.5}
              maxWidth={2.5}
              dotSize={2}
            />
          </View>
        </View>

        {/* Agreement Checkbox */}
        <View style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          marginBottom: 24,
          paddingHorizontal: 4,
        }}>
          <Switch
            value={agreedToTerms}
            onValueChange={setAgreedToTerms}
            trackColor={{ false: '#D1D5DB', true: '#93C5FD' }}
            thumbColor={agreedToTerms ? '#3B82F6' : '#F3F4F6'}
            style={{ marginRight: 12 }}
          />
          <Text style={{ flex: 1, fontSize: 14, color: '#4B5563', lineHeight: 20 }}>
            I agree to the terms and conditions outlined in this contract. I understand that this electronic signature is legally binding and has the same effect as a handwritten signature.
          </Text>
        </View>

        {/* Legal Notice */}
        <View style={{
          backgroundColor: '#FEF3C7',
          padding: 12,
          borderRadius: 6,
          marginBottom: 24,
        }}>
          <Text style={{ fontSize: 12, color: '#92400E', lineHeight: 18 }}>
            <Text style={{ fontWeight: '600' }}>Legal Notice:</Text> By signing this document electronically, you consent to be legally bound by the document's terms and conditions. You further agree that your electronic signature is the legal equivalent of your manual signature.
          </Text>
        </View>

        {/* Action Buttons */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          {onCancel && (
            <TouchableOpacity
              style={{
                flex: 1,
                paddingVertical: 14,
                paddingHorizontal: 20,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: '#D1D5DB',
                backgroundColor: 'white',
                alignItems: 'center',
              }}
              onPress={onCancel}
            >
              <Text style={{ fontSize: 16, fontWeight: '600', color: '#6B7280' }}>
                Cancel
              </Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            style={{
              paddingVertical: 14,
              paddingHorizontal: 20,
              borderRadius: 8,
              borderWidth: 1,
              borderColor: '#D1D5DB',
              backgroundColor: 'white',
              alignItems: 'center',
              marginRight: onCancel ? 0 : 12,
            }}
            onPress={handleClear}
          >
            <Text style={{ fontSize: 16, fontWeight: '600', color: '#6B7280' }}>
              Clear
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={{
              flex: 2,
              paddingVertical: 14,
              paddingHorizontal: 20,
              borderRadius: 8,
              backgroundColor: agreedToTerms && !signatureEmpty ? '#3B82F6' : '#E5E7EB',
              alignItems: 'center',
              flexDirection: 'row',
              justifyContent: 'center',
            }}
            onPress={() => signatureRef.current?.readSignature()}
            disabled={!agreedToTerms || signatureEmpty || signing}
          >
            {signing ? (
              <ActivityIndicator color="white" size="small" />
            ) : (
              <>
                <Ionicons 
                  name="create-outline" 
                  size={20} 
                  color={agreedToTerms && !signatureEmpty ? 'white' : '#9CA3AF'} 
                  style={{ marginRight: 8 }}
                />
                <Text style={{ 
                  fontSize: 16, 
                  fontWeight: '600', 
                  color: agreedToTerms && !signatureEmpty ? 'white' : '#9CA3AF' 
                }}>
                  Sign & Submit
                </Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Signature Info */}
        <View style={{ marginTop: 24, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#E5E7EB' }}>
          <Text style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', lineHeight: 18 }}>
            Signing as: {contractId}
          </Text>
          <Text style={{ fontSize: 12, color: '#9CA3AF', textAlign: 'center', lineHeight: 18 }}>
            Date: {new Date().toLocaleDateString()} {new Date().toLocaleTimeString()}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
};

export default SignaturePad;

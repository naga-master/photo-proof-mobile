/**
 * Contract Viewer Screen
 * View and sign contracts with signature pad
 */

import { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Alert,
  Modal,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import { WebView } from 'react-native-webview';
import SignatureScreen, { SignatureViewRef } from 'react-native-signature-canvas';
import Toast from 'react-native-toast-message';

import { useTheme } from '@/theme/ThemeProvider';
import { useAuthStore } from '@/stores/authStore';
import { apiClient } from '@/services/api/client';
import { colors, spacing, borderRadius, typography, shadows } from '@/theme';
import type { Contract } from '@/types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function ContractViewerScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme, isDark } = useTheme();
  const { user } = useAuthStore();

  const [contract, setContract] = useState<Contract | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showSignatureModal, setShowSignatureModal] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [agreementChecked, setAgreementChecked] = useState(false);

  const signatureRef = useRef<SignatureViewRef>(null);

  useEffect(() => {
    fetchContract();
  }, [id]);

  const fetchContract = async () => {
    try {
      const contractData = await apiClient.get<Contract>(`/api/contracts/${id}`);
      setContract(contractData);
      
      // Mark as viewed if not already
      if (contractData.status === 'sent') {
        await apiClient.post(`/api/contracts/${id}/view`);
      }
    } catch (error) {
      console.error('Failed to fetch contract:', error);
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to load contract',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSign = async (signature: string) => {
    if (!agreementChecked) {
      Toast.show({
        type: 'error',
        text1: 'Agreement Required',
        text2: 'Please check the agreement box before signing',
      });
      return;
    }

    setIsSigning(true);
    try {
      await apiClient.post(`/api/contracts/${id}/sign`, {
        signature,
        agreement: true,
        timestamp: new Date().toISOString(),
      });

      Toast.show({
        type: 'success',
        text1: 'Contract Signed',
        text2: 'The contract has been signed successfully',
      });

      setShowSignatureModal(false);
      await fetchContract(); // Refresh contract status
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Signing Failed',
        text2: error.detail || 'Could not sign the contract',
      });
    } finally {
      setIsSigning(false);
    }
  };

  const handleClearSignature = () => {
    signatureRef.current?.clearSignature();
  };

  const handleSaveSignature = () => {
    signatureRef.current?.readSignature();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'signed':
        return colors.success.main;
      case 'sent':
      case 'viewed':
      case 'pending':
        return colors.warning.main;
      case 'expired':
      case 'cancelled':
        return colors.error.main;
      default:
        return colors.neutral[400];
    }
  };

  const canSign = contract && ['sent', 'viewed', 'pending'].includes(contract.status);

  const styles = createStyles(theme, isDark);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  if (!contract) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="document-text-outline" size={64} color={theme.colors.textSecondary} />
          <Text style={styles.errorTitle}>Contract Not Found</Text>
          <Pressable onPress={() => router.back()} style={styles.backLink}>
            <Text style={styles.backLinkText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </Pressable>
          
          <View style={styles.headerTitle}>
            <Text style={styles.title} numberOfLines={1}>
              {contract.title}
            </Text>
            <View style={[styles.statusBadge, { backgroundColor: getStatusColor(contract.status) + '20' }]}>
              <Text style={[styles.statusText, { color: getStatusColor(contract.status) }]}>
                {contract.status}
              </Text>
            </View>
          </View>

          <Pressable style={styles.actionButton}>
            <Ionicons name="download-outline" size={22} color={theme.colors.text} />
          </Pressable>
        </View>

        {/* Contract Info */}
        <Animated.View entering={FadeInDown} style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Contract #</Text>
            <Text style={styles.infoValue}>{contract.contract_number}</Text>
          </View>
          {contract.project_title && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Project</Text>
              <Text style={styles.infoValue}>{contract.project_title}</Text>
            </View>
          )}
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Sent</Text>
            <Text style={styles.infoValue}>
              {contract.sent_at ? new Date(contract.sent_at).toLocaleDateString() : 'Not sent'}
            </Text>
          </View>
          {contract.signed_at && (
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Signed</Text>
              <Text style={styles.infoValue}>
                {new Date(contract.signed_at).toLocaleDateString()}
              </Text>
            </View>
          )}
        </Animated.View>

        {/* Contract Content */}
        <ScrollView style={styles.contentContainer} showsVerticalScrollIndicator={false}>
          <View style={styles.contractContent}>
            {contract.pdf_url ? (
              <WebView
                source={{ uri: contract.pdf_url }}
                style={styles.webview}
                startInLoadingState
                renderLoading={() => (
                  <ActivityIndicator
                    size="large"
                    color={theme.colors.primary}
                    style={styles.webviewLoading}
                  />
                )}
              />
            ) : (
              <Text style={styles.contentText}>{contract.content}</Text>
            )}
          </View>
        </ScrollView>

        {/* Sign Button */}
        {canSign && (
          <Animated.View entering={FadeIn} style={styles.signContainer}>
            <Pressable
              onPress={() => setShowSignatureModal(true)}
              style={({ pressed }) => [styles.signButton, pressed && styles.buttonPressed]}
            >
              <Ionicons name="create" size={20} color={colors.white} />
              <Text style={styles.signButtonText}>Sign Contract</Text>
            </Pressable>
          </Animated.View>
        )}

        {/* Signature Modal */}
        <Modal
          visible={showSignatureModal}
          animationType="slide"
          presentationStyle="pageSheet"
          onRequestClose={() => setShowSignatureModal(false)}
        >
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Pressable onPress={() => setShowSignatureModal(false)}>
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </Pressable>
              <Text style={styles.modalTitle}>Sign Contract</Text>
              <Pressable onPress={handleClearSignature}>
                <Text style={styles.clearText}>Clear</Text>
              </Pressable>
            </View>

            <View style={styles.signatureContainer}>
              <Text style={styles.signatureLabel}>Draw your signature below</Text>
              <View style={styles.signaturePad}>
                <SignatureScreen
                  ref={signatureRef}
                  onOK={handleSign}
                  onEmpty={() => {
                    Toast.show({
                      type: 'error',
                      text1: 'Signature Required',
                      text2: 'Please draw your signature',
                    });
                  }}
                  descriptionText=""
                  clearText="Clear"
                  confirmText="Save"
                  webStyle={`
                    .m-signature-pad {
                      box-shadow: none;
                      border: none;
                      margin: 0;
                    }
                    .m-signature-pad--body {
                      border: none;
                    }
                    .m-signature-pad--footer {
                      display: none;
                    }
                    body, html {
                      background-color: ${isDark ? colors.neutral[800] : colors.neutral[100]};
                    }
                  `}
                  backgroundColor={isDark ? colors.neutral[800] : colors.neutral[100]}
                  penColor={isDark ? colors.white : colors.neutral[900]}
                />
              </View>
            </View>

            <View style={styles.agreementContainer}>
              <Pressable
                onPress={() => setAgreementChecked(!agreementChecked)}
                style={styles.checkbox}
              >
                <View
                  style={[
                    styles.checkboxBox,
                    agreementChecked && styles.checkboxChecked,
                  ]}
                >
                  {agreementChecked && (
                    <Ionicons name="checkmark" size={16} color={colors.white} />
                  )}
                </View>
                <Text style={styles.agreementText}>
                  I have read and agree to the terms and conditions in this contract
                </Text>
              </Pressable>
            </View>

            <Pressable
              onPress={handleSaveSignature}
              disabled={isSigning || !agreementChecked}
              style={({ pressed }) => [
                styles.confirmButton,
                pressed && styles.buttonPressed,
                (isSigning || !agreementChecked) && styles.buttonDisabled,
              ]}
            >
              {isSigning ? (
                <ActivityIndicator color={colors.white} />
              ) : (
                <>
                  <Ionicons name="checkmark-circle" size={20} color={colors.white} />
                  <Text style={styles.confirmButtonText}>Confirm & Sign</Text>
                </>
              )}
            </Pressable>
          </SafeAreaView>
        </Modal>
      </SafeAreaView>
    </>
  );
}

const createStyles = (theme: any, isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.colors.background,
    },
    errorContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing[6],
    },
    errorTitle: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.semibold,
      color: theme.colors.text,
      marginTop: spacing[4],
    },
    backLink: {
      marginTop: spacing[4],
    },
    backLinkText: {
      fontSize: typography.fontSize.base,
      color: theme.colors.primary,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[3],
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: borderRadius.full,
      backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100],
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerTitle: {
      flex: 1,
      marginLeft: spacing[3],
    },
    title: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: theme.colors.text,
    },
    statusBadge: {
      alignSelf: 'flex-start',
      paddingHorizontal: spacing[2],
      paddingVertical: spacing[0.5],
      borderRadius: borderRadius.sm,
      marginTop: spacing[1],
    },
    statusText: {
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.medium,
      textTransform: 'capitalize',
    },
    actionButton: {
      width: 40,
      height: 40,
      borderRadius: borderRadius.full,
      backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100],
      alignItems: 'center',
      justifyContent: 'center',
    },
    infoCard: {
      margin: spacing[4],
      padding: spacing[4],
      backgroundColor: isDark ? colors.neutral[800] : colors.white,
      borderRadius: borderRadius.lg,
      ...shadows.sm,
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing[2],
    },
    infoLabel: {
      fontSize: typography.fontSize.sm,
      color: theme.colors.textSecondary,
    },
    infoValue: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      color: theme.colors.text,
    },
    contentContainer: {
      flex: 1,
    },
    contractContent: {
      padding: spacing[4],
    },
    contentText: {
      fontSize: typography.fontSize.base,
      color: theme.colors.text,
      lineHeight: 24,
    },
    webview: {
      height: SCREEN_HEIGHT * 0.5,
      backgroundColor: 'transparent',
    },
    webviewLoading: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      marginLeft: -20,
      marginTop: -20,
    },
    signContainer: {
      padding: spacing[4],
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      backgroundColor: theme.colors.surface,
    },
    signButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
      paddingVertical: spacing[4],
      borderRadius: borderRadius.full,
      gap: spacing[2],
      ...shadows.md,
    },
    signButtonText: {
      color: colors.white,
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
    },
    buttonPressed: {
      opacity: 0.9,
      transform: [{ scale: 0.98 }],
    },
    buttonDisabled: {
      opacity: 0.5,
    },
    // Modal
    modalContainer: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    modalHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[3],
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    modalTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: theme.colors.text,
    },
    clearText: {
      fontSize: typography.fontSize.base,
      color: theme.colors.primary,
    },
    signatureContainer: {
      flex: 1,
      padding: spacing[4],
    },
    signatureLabel: {
      fontSize: typography.fontSize.base,
      color: theme.colors.textSecondary,
      marginBottom: spacing[3],
      textAlign: 'center',
    },
    signaturePad: {
      flex: 1,
      borderRadius: borderRadius.lg,
      overflow: 'hidden',
      borderWidth: 2,
      borderColor: theme.colors.border,
      borderStyle: 'dashed',
    },
    agreementContainer: {
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[3],
    },
    checkbox: {
      flexDirection: 'row',
      alignItems: 'flex-start',
    },
    checkboxBox: {
      width: 24,
      height: 24,
      borderRadius: borderRadius.sm,
      borderWidth: 2,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: spacing[3],
    },
    checkboxChecked: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    agreementText: {
      flex: 1,
      fontSize: typography.fontSize.sm,
      color: theme.colors.text,
      lineHeight: 20,
    },
    confirmButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.success.main,
      marginHorizontal: spacing[4],
      marginBottom: spacing[4],
      paddingVertical: spacing[4],
      borderRadius: borderRadius.full,
      gap: spacing[2],
      ...shadows.md,
    },
    confirmButtonText: {
      color: colors.white,
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.semibold,
    },
  });

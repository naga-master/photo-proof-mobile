/**
 * Checkout Screen
 * Payment and order completion
 */

import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router, Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, { FadeInDown } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';

import { useTheme } from '@/theme/ThemeProvider';
import { apiClient } from '@/services/api/client';
import { colors, spacing, borderRadius, typography, shadows } from '@/theme';

export default function CheckoutScreen() {
  const { theme, isDark } = useTheme();

  const [shippingAddress, setShippingAddress] = useState({
    name: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    pincode: '',
  });
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'cod'>('card');
  const [isProcessing, setIsProcessing] = useState(false);

  const handlePlaceOrder = async () => {
    // Validate
    if (!shippingAddress.name || !shippingAddress.phone || !shippingAddress.address) {
      Toast.show({
        type: 'error',
        text1: 'Missing Information',
        text2: 'Please fill in all required fields',
      });
      return;
    }

    setIsProcessing(true);
    try {
      const response = await apiClient.post<{ order_id: string }>('/api/store/checkout', {
        shipping_address: shippingAddress,
        payment_method: paymentMethod,
      });

      Toast.show({
        type: 'success',
        text1: 'Order Placed!',
        text2: `Order #${response.order_id} confirmed`,
      });

      router.replace('/(common)/orders' as Href);
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Checkout Failed',
        text2: error.detail || 'Please try again',
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const styles = createStyles(theme, isDark);

  const PaymentOption = ({
    method,
    icon,
    title,
    subtitle,
  }: {
    method: 'card' | 'upi' | 'cod';
    icon: string;
    title: string;
    subtitle: string;
  }) => (
    <Pressable
      onPress={() => setPaymentMethod(method)}
      style={[styles.paymentOption, paymentMethod === method && styles.paymentOptionActive]}
    >
      <View style={styles.paymentIcon}>
        <Ionicons
          name={icon as any}
          size={24}
          color={paymentMethod === method ? theme.colors.primary : theme.colors.textSecondary}
        />
      </View>
      <View style={styles.paymentInfo}>
        <Text style={styles.paymentTitle}>{title}</Text>
        <Text style={styles.paymentSubtitle}>{subtitle}</Text>
      </View>
      <View
        style={[styles.radioButton, paymentMethod === method && styles.radioButtonActive]}
      >
        {paymentMethod === method && <View style={styles.radioButtonInner} />}
      </View>
    </Pressable>
  );

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </Pressable>
          <Text style={styles.headerTitle}>Checkout</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Shipping Address */}
          <Animated.View entering={FadeInDown.delay(100)} style={styles.section}>
            <Text style={styles.sectionTitle}>Shipping Address</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Full Name *</Text>
              <TextInput
                style={styles.input}
                value={shippingAddress.name}
                onChangeText={(text) => setShippingAddress({ ...shippingAddress, name: text })}
                placeholder="Enter your name"
                placeholderTextColor={theme.colors.textSecondary}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Phone Number *</Text>
              <TextInput
                style={styles.input}
                value={shippingAddress.phone}
                onChangeText={(text) => setShippingAddress({ ...shippingAddress, phone: text })}
                placeholder="Enter phone number"
                placeholderTextColor={theme.colors.textSecondary}
                keyboardType="phone-pad"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Address *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={shippingAddress.address}
                onChangeText={(text) => setShippingAddress({ ...shippingAddress, address: text })}
                placeholder="Enter your address"
                placeholderTextColor={theme.colors.textSecondary}
                multiline
                numberOfLines={3}
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.inputLabel}>City</Text>
                <TextInput
                  style={styles.input}
                  value={shippingAddress.city}
                  onChangeText={(text) => setShippingAddress({ ...shippingAddress, city: text })}
                  placeholder="City"
                  placeholderTextColor={theme.colors.textSecondary}
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1, marginLeft: spacing[3] }]}>
                <Text style={styles.inputLabel}>Pincode</Text>
                <TextInput
                  style={styles.input}
                  value={shippingAddress.pincode}
                  onChangeText={(text) => setShippingAddress({ ...shippingAddress, pincode: text })}
                  placeholder="Pincode"
                  placeholderTextColor={theme.colors.textSecondary}
                  keyboardType="numeric"
                />
              </View>
            </View>
          </Animated.View>

          {/* Payment Method */}
          <Animated.View entering={FadeInDown.delay(200)} style={styles.section}>
            <Text style={styles.sectionTitle}>Payment Method</Text>
            
            <PaymentOption
              method="card"
              icon="card"
              title="Credit / Debit Card"
              subtitle="Pay securely with your card"
            />
            <PaymentOption
              method="upi"
              icon="qr-code"
              title="UPI"
              subtitle="Pay using any UPI app"
            />
            <PaymentOption
              method="cod"
              icon="cash"
              title="Cash on Delivery"
              subtitle="Pay when you receive"
            />
          </Animated.View>

          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Place Order Button */}
        <View style={styles.bottomBar}>
          <Pressable
            onPress={handlePlaceOrder}
            disabled={isProcessing}
            style={({ pressed }) => [
              styles.placeOrderButton,
              pressed && styles.buttonPressed,
              isProcessing && styles.buttonDisabled,
            ]}
          >
            {isProcessing ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Ionicons name="checkmark-circle" size={20} color={colors.white} />
                <Text style={styles.placeOrderText}>Place Order</Text>
              </>
            )}
          </Pressable>
        </View>
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
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
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
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.bold,
      color: theme.colors.text,
    },
    section: {
      padding: spacing[4],
      backgroundColor: theme.colors.surface,
      marginTop: spacing[2],
    },
    sectionTitle: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: theme.colors.text,
      marginBottom: spacing[4],
    },
    inputGroup: {
      marginBottom: spacing[4],
    },
    inputLabel: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      color: theme.colors.text,
      marginBottom: spacing[2],
    },
    input: {
      backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100],
      borderRadius: borderRadius.lg,
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[3],
      fontSize: typography.fontSize.base,
      color: theme.colors.text,
    },
    textArea: {
      height: 80,
      textAlignVertical: 'top',
    },
    row: {
      flexDirection: 'row',
    },
    paymentOption: {
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing[4],
      backgroundColor: isDark ? colors.neutral[800] : colors.white,
      borderRadius: borderRadius.lg,
      marginBottom: spacing[3],
      borderWidth: 2,
      borderColor: 'transparent',
    },
    paymentOptionActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary + '10',
    },
    paymentIcon: {
      width: 48,
      height: 48,
      borderRadius: borderRadius.lg,
      backgroundColor: isDark ? colors.neutral[700] : colors.neutral[100],
      alignItems: 'center',
      justifyContent: 'center',
    },
    paymentInfo: {
      flex: 1,
      marginLeft: spacing[3],
    },
    paymentTitle: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      color: theme.colors.text,
    },
    paymentSubtitle: {
      fontSize: typography.fontSize.sm,
      color: theme.colors.textSecondary,
      marginTop: spacing[0.5],
    },
    radioButton: {
      width: 24,
      height: 24,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    radioButtonActive: {
      borderColor: theme.colors.primary,
    },
    radioButtonInner: {
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: theme.colors.primary,
    },
    bottomBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      padding: spacing[4],
      paddingBottom: spacing[8],
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    placeOrderButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: colors.success.main,
      paddingVertical: spacing[4],
      borderRadius: borderRadius.full,
      gap: spacing[2],
      ...shadows.md,
    },
    placeOrderText: {
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
  });

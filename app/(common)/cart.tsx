/**
 * Cart Screen
 * Shopping cart with checkout
 */

import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router, Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import Animated, { FadeIn, FadeInDown, FadeOutLeft } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';

import { useTheme } from '@/theme/ThemeProvider';
import { apiClient, API_BASE_URL } from '@/services/api/client';
import { colors, spacing, borderRadius, typography, shadows } from '@/theme';
import type { CartItem } from '@/types';

export default function CartScreen() {
  const { theme, isDark } = useTheme();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    try {
      const response = await apiClient.get<{ items: CartItem[] }>('/api/store/cart');
      setCartItems(response.items || []);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) {
      removeItem(itemId);
      return;
    }

    try {
      await apiClient.put(`/api/store/cart/${itemId}`, { quantity: newQuantity });
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  const removeItem = async (itemId: string) => {
    Alert.alert('Remove Item', 'Are you sure you want to remove this item?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await apiClient.delete(`/api/store/cart/${itemId}`);
            setCartItems((prev) => prev.filter((item) => item.id !== itemId));
            Toast.show({
              type: 'success',
              text1: 'Item Removed',
            });
          } catch (error) {
            console.error('Failed to remove item:', error);
          }
        },
      },
    ]);
  };

  const calculateSubtotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.selected_option.price * item.quantity,
      0
    );
  };

  const calculateTax = () => {
    return calculateSubtotal() * 0.18; // 18% GST
  };

  const calculateTotal = () => {
    return calculateSubtotal() + calculateTax();
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    router.push('/(common)/checkout' as Href);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const styles = createStyles(theme, isDark);

  const renderCartItem = useCallback(
    ({ item, index }: { item: CartItem; index: number }) => (
      <Animated.View
        entering={FadeInDown.delay(index * 100)}
        exiting={FadeOutLeft}
        style={styles.cartItem}
      >
        <Image
          source={{ uri: item.photo?.thumbnail_src || item.photo?.src || `${API_BASE_URL}/placeholder.jpg` }}
          style={styles.itemImage}
          contentFit="cover"
        />
        <View style={styles.itemInfo}>
          <Text style={styles.itemName} numberOfLines={1}>
            {item.product.name}
          </Text>
          <Text style={styles.itemSize}>{item.selected_option.size}</Text>
          <Text style={styles.itemPrice}>
            {formatPrice(item.selected_option.price)}
          </Text>
        </View>
        <View style={styles.itemActions}>
          <View style={styles.quantityControls}>
            <Pressable
              onPress={() => updateQuantity(item.id, item.quantity - 1)}
              style={styles.quantityButton}
            >
              <Ionicons name="remove" size={16} color={theme.colors.text} />
            </Pressable>
            <Text style={styles.quantityText}>{item.quantity}</Text>
            <Pressable
              onPress={() => updateQuantity(item.id, item.quantity + 1)}
              style={styles.quantityButton}
            >
              <Ionicons name="add" size={16} color={theme.colors.text} />
            </Pressable>
          </View>
          <Pressable onPress={() => removeItem(item.id)} style={styles.removeButton}>
            <Ionicons name="trash-outline" size={18} color={colors.error.main} />
          </Pressable>
        </View>
      </Animated.View>
    ),
    [theme]
  );

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
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
          <Text style={styles.headerTitle}>Cart</Text>
          <View style={{ width: 40 }} />
        </View>

        {cartItems.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="cart-outline" size={80} color={theme.colors.textSecondary} />
            <Text style={styles.emptyTitle}>Your Cart is Empty</Text>
            <Text style={styles.emptyText}>
              Add some products to get started
            </Text>
            <Pressable
              onPress={() => router.back()}
              style={({ pressed }) => [styles.shopButton, pressed && styles.buttonPressed]}
            >
              <Text style={styles.shopButtonText}>Continue Shopping</Text>
            </Pressable>
          </View>
        ) : (
          <>
            <FlatList
              data={cartItems}
              renderItem={renderCartItem}
              keyExtractor={(item) => item.id}
              contentContainerStyle={styles.listContent}
              showsVerticalScrollIndicator={false}
            />

            {/* Order Summary */}
            <Animated.View entering={FadeIn} style={styles.summaryContainer}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>{formatPrice(calculateSubtotal())}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tax (18% GST)</Text>
                <Text style={styles.summaryValue}>{formatPrice(calculateTax())}</Text>
              </View>
              <View style={[styles.summaryRow, styles.totalRow]}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalValue}>{formatPrice(calculateTotal())}</Text>
              </View>

              <Pressable
                onPress={handleCheckout}
                disabled={isCheckingOut}
                style={({ pressed }) => [
                  styles.checkoutButton,
                  pressed && styles.buttonPressed,
                  isCheckingOut && styles.buttonDisabled,
                ]}
              >
                {isCheckingOut ? (
                  <ActivityIndicator color={colors.white} />
                ) : (
                  <>
                    <Ionicons name="card" size={20} color={colors.white} />
                    <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
                  </>
                )}
              </Pressable>
            </Animated.View>
          </>
        )}
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
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing[6],
    },
    emptyTitle: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.semibold,
      color: theme.colors.text,
      marginTop: spacing[4],
    },
    emptyText: {
      fontSize: typography.fontSize.base,
      color: theme.colors.textSecondary,
      marginTop: spacing[2],
    },
    shopButton: {
      marginTop: spacing[6],
      paddingVertical: spacing[3],
      paddingHorizontal: spacing[6],
      backgroundColor: theme.colors.primary,
      borderRadius: borderRadius.full,
    },
    shopButtonText: {
      color: colors.white,
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
    },
    listContent: {
      padding: spacing[4],
    },
    cartItem: {
      flexDirection: 'row',
      backgroundColor: isDark ? colors.neutral[800] : colors.white,
      borderRadius: borderRadius.lg,
      padding: spacing[3],
      marginBottom: spacing[3],
      ...shadows.sm,
    },
    itemImage: {
      width: 80,
      height: 80,
      borderRadius: borderRadius.md,
    },
    itemInfo: {
      flex: 1,
      marginLeft: spacing[3],
      justifyContent: 'center',
    },
    itemName: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      color: theme.colors.text,
    },
    itemSize: {
      fontSize: typography.fontSize.sm,
      color: theme.colors.textSecondary,
      marginTop: spacing[0.5],
    },
    itemPrice: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.bold,
      color: theme.colors.primary,
      marginTop: spacing[1],
    },
    itemActions: {
      alignItems: 'flex-end',
      justifyContent: 'space-between',
    },
    quantityControls: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[2],
    },
    quantityButton: {
      width: 28,
      height: 28,
      borderRadius: borderRadius.sm,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    quantityText: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.medium,
      color: theme.colors.text,
      minWidth: 24,
      textAlign: 'center',
    },
    removeButton: {
      padding: spacing[2],
    },
    summaryContainer: {
      padding: spacing[4],
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing[2],
    },
    summaryLabel: {
      fontSize: typography.fontSize.base,
      color: theme.colors.textSecondary,
    },
    summaryValue: {
      fontSize: typography.fontSize.base,
      color: theme.colors.text,
    },
    totalRow: {
      marginTop: spacing[2],
      paddingTop: spacing[3],
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      marginBottom: spacing[4],
    },
    totalLabel: {
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: theme.colors.text,
    },
    totalValue: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.bold,
      color: theme.colors.primary,
    },
    checkoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
      paddingVertical: spacing[4],
      borderRadius: borderRadius.full,
      gap: spacing[2],
      ...shadows.md,
    },
    checkoutButtonText: {
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

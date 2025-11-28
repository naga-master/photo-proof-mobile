/**
 * Store Screen - Client's Product Store
 */

import { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Pressable,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { router, Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';

import { useTheme } from '@/theme/ThemeProvider';
import { apiClient, API_BASE_URL } from '@/services/api/client';
import { colors, spacing, borderRadius, typography, shadows } from '@/theme';
import type { Product } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const CARD_WIDTH = (SCREEN_WIDTH - spacing[6] * 2 - spacing[3]) / 2;

export default function StoreScreen() {
  const { theme, isDark } = useTheme();

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await apiClient.get<{ products: Product[]; total: number }>(
        '/api/store/products'
      );
      setProducts(response.products || []);
    } catch (error) {
      console.error('Failed to fetch products:', error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  const onRefresh = async () => {
    setIsRefreshing(true);
    await fetchProducts();
    setIsRefreshing(false);
  };

  const handleProductPress = (product: Product) => {
    router.push(`/(common)/product/${product.id}` as Href);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const styles = createStyles(theme, isDark);

  const renderProductCard = useCallback(
    ({ item, index }: { item: Product; index: number }) => (
      <Animated.View entering={FadeInDown.delay(index * 100)}>
        <Pressable
          onPress={() => handleProductPress(item)}
          style={({ pressed }) => [styles.productCard, pressed && styles.cardPressed]}
        >
          <View style={styles.imageContainer}>
            <Image
              source={{ uri: item.image_url || `${API_BASE_URL}/placeholder-product.jpg` }}
              style={styles.productImage}
              contentFit="cover"
              transition={200}
            />
            {item.category && (
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{item.category}</Text>
              </View>
            )}
          </View>
          <View style={styles.productInfo}>
            <Text style={styles.productName} numberOfLines={2}>
              {item.name}
            </Text>
            {item.description && (
              <Text style={styles.productDescription} numberOfLines={2}>
                {item.description}
              </Text>
            )}
            <View style={styles.priceRow}>
              <Text style={styles.productPrice}>{formatPrice(item.price)}</Text>
              {item.compare_price && item.compare_price > item.price && (
                <Text style={styles.comparePrice}>{formatPrice(item.compare_price)}</Text>
              )}
            </View>
          </View>
        </Pressable>
      </Animated.View>
    ),
    [theme, isDark]
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
        <Animated.View entering={FadeIn} style={styles.header}>
          <Text style={styles.headerTitle}>Store</Text>
          <Pressable
            style={styles.cartButton}
            onPress={() => router.push('/(common)/cart' as Href)}
          >
            <Ionicons name="cart-outline" size={24} color={theme.colors.text} />
            {cartCount > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            )}
          </Pressable>
        </Animated.View>

        {/* Products Grid */}
        <FlatList
          data={products}
          renderItem={renderProductCard}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <View style={styles.emptyIconContainer}>
                <Ionicons name="storefront-outline" size={64} color={theme.colors.textSecondary} />
              </View>
              <Text style={styles.emptyTitle}>No Products Available</Text>
              <Text style={styles.emptyText}>
                Products from your photographer will appear here
              </Text>
            </View>
          }
        />
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
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing[6],
      paddingVertical: spacing[4],
      backgroundColor: theme.colors.surface,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerTitle: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.bold,
      color: theme.colors.text,
    },
    cartButton: {
      width: 44,
      height: 44,
      borderRadius: borderRadius.full,
      backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100],
      alignItems: 'center',
      justifyContent: 'center',
    },
    cartBadge: {
      position: 'absolute',
      top: 6,
      right: 6,
      backgroundColor: theme.colors.primary,
      width: 18,
      height: 18,
      borderRadius: 9,
      alignItems: 'center',
      justifyContent: 'center',
    },
    cartBadgeText: {
      color: colors.white,
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.bold,
    },
    listContent: {
      padding: spacing[6],
      paddingBottom: 120,
    },
    columnWrapper: {
      gap: spacing[3],
    },
    productCard: {
      width: CARD_WIDTH,
      backgroundColor: isDark ? colors.neutral[800] : colors.white,
      borderRadius: borderRadius.lg,
      overflow: 'hidden',
      marginBottom: spacing[3],
      ...shadows.sm,
    },
    cardPressed: {
      opacity: 0.9,
      transform: [{ scale: 0.98 }],
    },
    imageContainer: {
      position: 'relative',
    },
    productImage: {
      width: '100%',
      height: CARD_WIDTH,
    },
    categoryBadge: {
      position: 'absolute',
      top: spacing[2],
      left: spacing[2],
      backgroundColor: 'rgba(0, 0, 0, 0.6)',
      paddingHorizontal: spacing[2],
      paddingVertical: spacing[1],
      borderRadius: borderRadius.sm,
    },
    categoryText: {
      fontSize: typography.fontSize.xs,
      color: colors.white,
      textTransform: 'uppercase',
    },
    productInfo: {
      padding: spacing[3],
    },
    productName: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: theme.colors.text,
      marginBottom: spacing[1],
    },
    productDescription: {
      fontSize: typography.fontSize.xs,
      color: theme.colors.textSecondary,
      marginBottom: spacing[2],
      lineHeight: 16,
    },
    priceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[2],
    },
    productPrice: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.bold,
      color: theme.colors.primary,
    },
    comparePrice: {
      fontSize: typography.fontSize.sm,
      color: theme.colors.textSecondary,
      textDecorationLine: 'line-through',
    },
    emptyContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: spacing[16],
    },
    emptyIconContainer: {
      width: 120,
      height: 120,
      borderRadius: borderRadius.full,
      backgroundColor: isDark ? colors.neutral[800] : colors.neutral[100],
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing[4],
    },
    emptyTitle: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.semibold,
      color: theme.colors.text,
    },
    emptyText: {
      fontSize: typography.fontSize.base,
      color: theme.colors.textSecondary,
      marginTop: spacing[2],
      textAlign: 'center',
    },
  });

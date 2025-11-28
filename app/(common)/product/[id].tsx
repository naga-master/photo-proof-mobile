/**
 * Product Detail Screen
 * View product details and add to cart
 */

import { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, router, Href } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import Animated, { FadeIn, FadeInDown } from 'react-native-reanimated';
import Toast from 'react-native-toast-message';

import { useTheme } from '@/theme/ThemeProvider';
import { apiClient, API_BASE_URL } from '@/services/api/client';
import { colors, spacing, borderRadius, typography, shadows } from '@/theme';
import type { Product, ProductSizeOption } from '@/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { theme, isDark } = useTheme();

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState<ProductSizeOption | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const productData = await apiClient.get<Product>(`/api/store/products/${id}`);
      setProduct(productData);
      if (productData.sizes && productData.sizes.length > 0) {
        setSelectedSize(productData.sizes[0]);
      }
    } catch (error) {
      console.error('Failed to fetch product:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!product || !selectedSize) return;

    setIsAddingToCart(true);
    try {
      await apiClient.post('/api/store/cart', {
        product_id: product.id,
        size: selectedSize.size,
        quantity,
      });

      Toast.show({
        type: 'success',
        text1: 'Added to Cart',
        text2: `${product.name} (${selectedSize.size}) added`,
      });
    } catch (error: any) {
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: error.detail || 'Failed to add to cart',
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(price);
  };

  const calculatePrice = () => {
    if (selectedSize) {
      return selectedSize.price * quantity;
    }
    return (product?.price || 0) * quantity;
  };

  const styles = createStyles(theme, isDark);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="cube-outline" size={64} color={theme.colors.textSecondary} />
          <Text style={styles.errorTitle}>Product Not Found</Text>
          <Pressable onPress={() => router.back()} style={styles.backLink}>
            <Text style={styles.backLinkText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const images = product.mockup_images?.length ? product.mockup_images : [product.image_url];

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <SafeAreaView style={styles.container} edges={['top']}>
        {/* Header */}
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </Pressable>
          <Pressable
            style={styles.cartButton}
            onPress={() => router.push('/(common)/cart' as Href)}
          >
            <Ionicons name="cart-outline" size={24} color={theme.colors.text} />
          </Pressable>
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Product Images */}
          <View style={styles.imageContainer}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(e) => {
                const index = Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH);
                setCurrentImageIndex(index);
              }}
            >
              {images.map((uri, index) => (
                <Image
                  key={index}
                  source={{ uri: uri || `${API_BASE_URL}/placeholder-product.jpg` }}
                  style={styles.productImage}
                  contentFit="cover"
                />
              ))}
            </ScrollView>
            {images.length > 1 && (
              <View style={styles.imageDots}>
                {images.map((_, index) => (
                  <View
                    key={index}
                    style={[
                      styles.dot,
                      currentImageIndex === index && styles.dotActive,
                    ]}
                  />
                ))}
              </View>
            )}
          </View>

          {/* Product Info */}
          <Animated.View entering={FadeInDown} style={styles.infoContainer}>
            {product.category && (
              <Text style={styles.category}>{product.category}</Text>
            )}
            <Text style={styles.productName}>{product.name}</Text>
            
            <View style={styles.priceRow}>
              <Text style={styles.price}>{formatPrice(calculatePrice())}</Text>
              {product.compare_price && product.compare_price > product.price && (
                <Text style={styles.comparePrice}>
                  {formatPrice(product.compare_price * quantity)}
                </Text>
              )}
            </View>

            {product.description && (
              <Text style={styles.description}>{product.description}</Text>
            )}

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Select Size</Text>
                <View style={styles.sizesContainer}>
                  {product.sizes.map((size) => (
                    <Pressable
                      key={size.size}
                      onPress={() => setSelectedSize(size)}
                      style={[
                        styles.sizeOption,
                        selectedSize?.size === size.size && styles.sizeOptionActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.sizeText,
                          selectedSize?.size === size.size && styles.sizeTextActive,
                        ]}
                      >
                        {size.size}
                      </Text>
                      <Text
                        style={[
                          styles.sizePriceText,
                          selectedSize?.size === size.size && styles.sizeTextActive,
                        ]}
                      >
                        {formatPrice(size.price)}
                      </Text>
                    </Pressable>
                  ))}
                </View>
              </View>
            )}

            {/* Quantity Selection */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Quantity</Text>
              <View style={styles.quantityContainer}>
                <Pressable
                  onPress={() => setQuantity(Math.max(1, quantity - 1))}
                  style={styles.quantityButton}
                >
                  <Ionicons name="remove" size={20} color={theme.colors.text} />
                </Pressable>
                <Text style={styles.quantityText}>{quantity}</Text>
                <Pressable
                  onPress={() => setQuantity(quantity + 1)}
                  style={styles.quantityButton}
                >
                  <Ionicons name="add" size={20} color={theme.colors.text} />
                </Pressable>
              </View>
            </View>

            {/* Specs */}
            {product.specs && Object.keys(product.specs).length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Specifications</Text>
                <View style={styles.specsContainer}>
                  {Object.entries(product.specs).map(([key, value]) => (
                    <View key={key} style={styles.specRow}>
                      <Text style={styles.specKey}>{key}</Text>
                      <Text style={styles.specValue}>{value}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </Animated.View>

          {/* Bottom spacing */}
          <View style={{ height: 120 }} />
        </ScrollView>

        {/* Add to Cart Button */}
        <Animated.View entering={FadeIn} style={styles.bottomBar}>
          <View style={styles.totalContainer}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalPrice}>{formatPrice(calculatePrice())}</Text>
          </View>
          <Pressable
            onPress={handleAddToCart}
            disabled={isAddingToCart}
            style={({ pressed }) => [
              styles.addToCartButton,
              pressed && styles.buttonPressed,
              isAddingToCart && styles.buttonDisabled,
            ]}
          >
            {isAddingToCart ? (
              <ActivityIndicator color={colors.white} />
            ) : (
              <>
                <Ionicons name="cart" size={20} color={colors.white} />
                <Text style={styles.addToCartText}>Add to Cart</Text>
              </>
            )}
          </Pressable>
        </Animated.View>
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
      position: 'absolute',
      top: 50,
      left: 0,
      right: 0,
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingHorizontal: spacing[4],
      zIndex: 10,
    },
    backButton: {
      width: 44,
      height: 44,
      borderRadius: borderRadius.full,
      backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.9)',
      alignItems: 'center',
      justifyContent: 'center',
      ...shadows.sm,
    },
    cartButton: {
      width: 44,
      height: 44,
      borderRadius: borderRadius.full,
      backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.9)',
      alignItems: 'center',
      justifyContent: 'center',
      ...shadows.sm,
    },
    imageContainer: {
      position: 'relative',
    },
    productImage: {
      width: SCREEN_WIDTH,
      height: SCREEN_WIDTH,
    },
    imageDots: {
      flexDirection: 'row',
      justifyContent: 'center',
      position: 'absolute',
      bottom: spacing[4],
      left: 0,
      right: 0,
      gap: spacing[2],
    },
    dot: {
      width: 8,
      height: 8,
      borderRadius: 4,
      backgroundColor: 'rgba(255,255,255,0.5)',
    },
    dotActive: {
      backgroundColor: colors.white,
      width: 24,
    },
    infoContainer: {
      padding: spacing[6],
    },
    category: {
      fontSize: typography.fontSize.sm,
      color: theme.colors.primary,
      fontWeight: typography.fontWeight.medium,
      textTransform: 'uppercase',
      marginBottom: spacing[2],
    },
    productName: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.bold,
      color: theme.colors.text,
      marginBottom: spacing[3],
    },
    priceRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[3],
      marginBottom: spacing[4],
    },
    price: {
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.bold,
      color: theme.colors.primary,
    },
    comparePrice: {
      fontSize: typography.fontSize.lg,
      color: theme.colors.textSecondary,
      textDecorationLine: 'line-through',
    },
    description: {
      fontSize: typography.fontSize.base,
      color: theme.colors.textSecondary,
      lineHeight: 24,
      marginBottom: spacing[6],
    },
    section: {
      marginBottom: spacing[6],
    },
    sectionTitle: {
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      color: theme.colors.text,
      marginBottom: spacing[3],
    },
    sizesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing[2],
    },
    sizeOption: {
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[3],
      borderRadius: borderRadius.lg,
      borderWidth: 2,
      borderColor: theme.colors.border,
      backgroundColor: isDark ? colors.neutral[800] : colors.white,
    },
    sizeOptionActive: {
      borderColor: theme.colors.primary,
      backgroundColor: theme.colors.primary + '10',
    },
    sizeText: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      color: theme.colors.text,
    },
    sizePriceText: {
      fontSize: typography.fontSize.xs,
      color: theme.colors.textSecondary,
      marginTop: spacing[0.5],
    },
    sizeTextActive: {
      color: theme.colors.primary,
    },
    quantityContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[4],
    },
    quantityButton: {
      width: 44,
      height: 44,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.colors.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    quantityText: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.semibold,
      color: theme.colors.text,
      minWidth: 40,
      textAlign: 'center',
    },
    specsContainer: {
      backgroundColor: isDark ? colors.neutral[800] : colors.neutral[50],
      borderRadius: borderRadius.lg,
      padding: spacing[4],
    },
    specRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: spacing[2],
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    specKey: {
      fontSize: typography.fontSize.sm,
      color: theme.colors.textSecondary,
    },
    specValue: {
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.medium,
      color: theme.colors.text,
    },
    bottomBar: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      flexDirection: 'row',
      alignItems: 'center',
      padding: spacing[4],
      paddingBottom: spacing[8],
      backgroundColor: theme.colors.surface,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
      gap: spacing[4],
    },
    totalContainer: {
      flex: 1,
    },
    totalLabel: {
      fontSize: typography.fontSize.sm,
      color: theme.colors.textSecondary,
    },
    totalPrice: {
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.bold,
      color: theme.colors.text,
    },
    addToCartButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.colors.primary,
      paddingVertical: spacing[4],
      paddingHorizontal: spacing[6],
      borderRadius: borderRadius.full,
      gap: spacing[2],
      ...shadows.md,
    },
    addToCartText: {
      color: colors.white,
      fontSize: typography.fontSize.base,
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

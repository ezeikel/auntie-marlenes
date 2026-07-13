import {
  faChevronLeft,
  faChevronRight,
  faHeart,
  faInfo,
  faShareNodes,
  faTruck,
} from '@fortawesome/pro-regular-svg-icons';
import { faHeart as faHeartSolid } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import * as Haptics from 'expo-haptics';
import { router, useLocalSearchParams } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  Share,
  Text,
  View,
} from 'react-native';
import { useSharedValue } from 'react-native-reanimated';
import Carousel from 'react-native-reanimated-carousel';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import BrandInfoSheet from '@/components/bottom-sheets/BrandInfoSheet';
import DeliveryInfoSheet from '@/components/bottom-sheets/DeliveryInfoSheet';
import ProductDetailsSheet from '@/components/bottom-sheets/ProductDetailsSheet';
import VariantSelectorSheet from '@/components/bottom-sheets/VariantSelectorSheet';
import PaginationDot from '@/components/ui/PaginationDot';
import { useCart } from '@/contexts/cart';
import { useSaved } from '@/contexts/saved';
import { useProduct } from '@/hooks/useProducts';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { handle } = useLocalSearchParams<{ handle: string }>();
  const { data: product, isLoading } = useProduct(handle);
  const { addToCart } = useCart();
  const { isSaved, toggleSave } = useSaved();
  const insets = useSafeAreaInsets();
  const progressValue = useSharedValue(0);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  // TODO: headerHeight is measured but not currently used in ScrollView marginTop calculation.
  // Consider either: 1) Using headerHeight in ScrollView marginTop for fully dynamic layout, or
  // 2) Removing this state if the current static calculation (Math.max(16, insets.top)) is sufficient.
  // The proper approach per react-native-sticky-header-footer-scroll-view pattern is to use the
  // measured headerHeight to ensure ScrollView content starts exactly where the fixed header ends.
  const [headerHeight, setHeaderHeight] = useState(0);
  const [footerHeight, setFooterHeight] = useState(0);

  // Bottom sheet refs
  const variantSheetRef = useRef<BottomSheetModal>(null);
  const detailsSheetRef = useRef<BottomSheetModal>(null);
  const deliverySheetRef = useRef<BottomSheetModal>(null);
  const brandSheetRef = useRef<BottomSheetModal>(null);

  const handleBack = () => {
    router.back();
  };

  const handleShare = async () => {
    if (!product) return;

    try {
      await Share.share({
        message: `Check out ${product.name} on Auntie Marlene's!`,
        url: `https://auntiemarlenes.com/product/${product.handle}`,
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('Share error:', error);
    }
  };

  const handleSaveToggle = async () => {
    if (!product) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await toggleSave(product.id);
  };

  const handleAddToBag = async (variant: {
    color?: string;
    size?: string;
    quantity: number;
  }) => {
    if (!product || !product.variantId) return;

    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Use the first variant ID from the product
    // TODO: In a full implementation, you'd need to map color/size to the correct variant ID
    // This would require fetching all variants and matching against selected options
    const variantId = product.variantId;

    await addToCart(variantId, variant.quantity);
    variantSheetRef.current?.dismiss();
  };

  const handleOpenVariantSheet = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    variantSheetRef.current?.present();
  };

  const handleOpenDetailsSheet = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    detailsSheetRef.current?.present();
  };

  const handleOpenDeliverySheet = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    deliverySheetRef.current?.present();
  };

  const handleOpenBrandSheet = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    brandSheetRef.current?.present();
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-warm-beige">
        <ActivityIndicator size="large" color="#5D4037" />
      </View>
    );
  }

  if (!product) {
    return (
      <View className="flex-1 items-center justify-center bg-warm-beige px-6">
        <Text className="text-base font-inter-semibold text-foreground text-center mb-2">
          Product not found
        </Text>
        <Pressable
          onPress={handleBack}
          className="mt-4 bg-cocoa rounded-xl px-6 py-3"
        >
          <Text className="text-white font-inter-semibold">Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const images = product.images || [product.image];
  const hasDiscount =
    product.compareAtPrice && product.compareAtPrice > product.price;
  const discountPercent = hasDiscount
    ? Math.round(
        ((product.compareAtPrice! - product.price) / product.compareAtPrice!) *
          100,
      )
    : 0;

  return (
    <>
      <View className="flex-1 bg-warm-beige">
        <StatusBar style="dark" />
        <SafeAreaView className="flex-1" edges={[]}>
          {/* Header - Fixed */}
          {/* TODO: Simplify header structure - remove extra nested Views.
            Current structure has redundant wrapper Views that could be consolidated.
            The outer View handles absolute positioning, but the inner wrapper for padding
            could be combined with the View containing the header content. */}
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 1,
            }}
            onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
          >
            <View style={{ paddingTop: Math.max(16, insets.top) }}>
              <View
                // style={{ paddingTop: Math.max(16, insets.top), }}
                className="flex-row items-center justify-between px-6 py-4 bg-warm-beige"
              >
                <Pressable
                  onPress={handleBack}
                  className="w-10 h-10 rounded-full bg-white items-center justify-center active:opacity-70"
                >
                  <FontAwesomeIcon
                    icon={faChevronLeft}
                    size={18}
                    color="#5D4037"
                  />
                </Pressable>
                <View className="flex-row gap-3">
                  <Pressable
                    onPress={handleShare}
                    className="w-10 h-10 rounded-full bg-white items-center justify-center active:opacity-70"
                  >
                    <FontAwesomeIcon
                      icon={faShareNodes}
                      size={18}
                      color="#5D4037"
                    />
                  </Pressable>
                  <Pressable
                    onPress={handleSaveToggle}
                    className="w-10 h-10 rounded-full bg-white items-center justify-center active:opacity-70"
                  >
                    <FontAwesomeIcon
                      icon={
                        product && isSaved(product.id) ? faHeartSolid : faHeart
                      }
                      size={18}
                      color={
                        product && isSaved(product.id) ? '#C5705D' : '#5D4037'
                      }
                    />
                  </Pressable>
                </View>
              </View>
            </View>
          </View>

          {/* Scrollable Content */}
          <ScrollView
            style={{
              marginTop: headerHeight,
              marginBottom: footerHeight,
            }}
            showsVerticalScrollIndicator={false}
          >
            {/* Image Carousel */}
            <View style={{ height: SCREEN_WIDTH, marginBottom: 24 }}>
              <Carousel
                loop={images.length > 1}
                width={SCREEN_WIDTH}
                height={SCREEN_WIDTH}
                autoPlay={false}
                data={images}
                onProgressChange={(_, absoluteProgress) => {
                  progressValue.value = absoluteProgress;
                  // Update state for image counter (can lag slightly)
                  const index = Math.round(absoluteProgress);
                  if (
                    index >= 0 &&
                    index < images.length &&
                    index !== activeImageIndex
                  ) {
                    setActiveImageIndex(index);
                  }
                }}
                renderItem={({ item }) => (
                  <View style={{ flex: 1, backgroundColor: '#fff' }}>
                    <Image
                      source={{ uri: item }}
                      style={{ width: SCREEN_WIDTH, height: SCREEN_WIDTH }}
                      resizeMode="cover"
                    />
                  </View>
                )}
              />

              {/* Animated Pagination Dots */}
              {images.length > 1 && (
                <View
                  style={{
                    position: 'absolute',
                    bottom: 16,
                    left: 0,
                    right: 0,
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                  pointerEvents="none"
                >
                  {images.map((_, index) => (
                    <PaginationDot
                      key={`dot-${index}`}
                      index={index}
                      activeIndex={progressValue}
                    />
                  ))}
                </View>
              )}

              {/* Image Counter */}
              {images.length > 1 && (
                <View
                  style={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    backgroundColor: 'rgba(0, 0, 0, 0.6)',
                    borderRadius: 12,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                  }}
                  pointerEvents="none"
                >
                  <Text
                    style={{
                      color: '#fff',
                      fontSize: 12,
                      fontFamily: 'Inter18pt-SemiBold',
                    }}
                  >
                    {activeImageIndex + 1} / {images.length}
                  </Text>
                </View>
              )}
            </View>

            {/* Product Info */}
            <View className="px-6 pb-6">
              {/* Brand */}
              <Pressable onPress={handleOpenBrandSheet} className="mb-2">
                <Text className="text-sm font-inter text-muted-foreground">
                  {product.brand}
                </Text>
              </Pressable>

              {/* Product Name */}
              <Text className="text-2xl font-playfair-bold text-foreground mb-3">
                {product.name}
              </Text>

              {/* Rating */}
              {product.rating && (
                <View className="flex-row items-center mb-4">
                  <Text className="text-base font-inter-medium text-foreground">
                    ⭐ {product.rating.toFixed(1)}
                  </Text>
                  {product.reviewCount && (
                    <Text className="text-sm font-inter text-muted-foreground ml-2">
                      ({product.reviewCount} reviews)
                    </Text>
                  )}
                </View>
              )}

              {/* Price */}
              <View className="flex-row items-center mb-6">
                <Text className="text-3xl font-playfair-bold text-cocoa">
                  £{product.price.toFixed(2)}
                </Text>
                {hasDiscount && (
                  <>
                    <Text className="text-xl font-inter text-muted-foreground line-through ml-3">
                      £{product.compareAtPrice!.toFixed(2)}
                    </Text>
                    <View className="ml-3 bg-terracotta rounded-lg px-2 py-1">
                      <Text className="text-white text-sm font-inter-bold">
                        {discountPercent}% OFF
                      </Text>
                    </View>
                  </>
                )}
              </View>

              {/* Info Cards */}
              <View className="mb-6 gap-y-3">
                {/* Product Details */}
                <Pressable
                  onPress={handleOpenDetailsSheet}
                  className="flex-row items-center justify-between p-4 bg-white rounded-xl border border-border active:bg-warm-beige"
                >
                  <View className="flex-row items-center flex-1">
                    <View className="w-10 h-10 bg-warm-beige rounded-full items-center justify-center mr-3">
                      <FontAwesomeIcon
                        icon={faInfo}
                        size={18}
                        color="#5D4037"
                      />
                    </View>
                    <Text className="text-base font-inter-semibold text-foreground">
                      Product Details
                    </Text>
                  </View>
                  <FontAwesomeIcon
                    icon={faChevronRight}
                    size={16}
                    color="#737373"
                  />
                </Pressable>

                {/* Delivery Info */}
                <Pressable
                  onPress={handleOpenDeliverySheet}
                  className="flex-row items-center justify-between p-4 bg-white rounded-xl border border-border active:bg-warm-beige"
                >
                  <View className="flex-row items-center flex-1">
                    <View className="w-10 h-10 bg-warm-beige rounded-full items-center justify-center mr-3">
                      <FontAwesomeIcon
                        icon={faTruck}
                        size={18}
                        color="#5D4037"
                      />
                    </View>
                    <View className="flex-1">
                      <Text className="text-base font-inter-semibold text-foreground">
                        Delivery & Returns
                      </Text>
                      <Text className="text-xs font-inter text-muted-foreground mt-0.5">
                        Free delivery on orders over £40
                      </Text>
                    </View>
                  </View>
                  <FontAwesomeIcon
                    icon={faChevronRight}
                    size={16}
                    color="#737373"
                  />
                </Pressable>
              </View>

              {/* Stock Status */}
              {product.inStock ? (
                <View className="flex-row items-center mb-6">
                  <View className="w-2 h-2 rounded-full bg-sage-green mr-2" />
                  <Text className="text-sm font-inter text-muted-foreground">
                    In Stock - Ready to ship
                  </Text>
                </View>
              ) : (
                <View className="flex-row items-center mb-6">
                  <View className="w-2 h-2 rounded-full bg-destructive mr-2" />
                  <Text className="text-sm font-inter text-muted-foreground">
                    Out of Stock
                  </Text>
                </View>
              )}

              {/* Seller Info */}
              <View className="mb-6 p-4 bg-white rounded-xl border border-border">
                <Text className="text-xs font-inter text-muted-foreground mb-1">
                  Sold by{' '}
                  <Text className="font-inter-semibold">{product.brand}</Text>
                </Text>
                <Text className="text-xs font-inter text-muted-foreground">
                  Shipped by{' '}
                  <Text className="font-inter-semibold">Auntie Marlene's</Text>
                </Text>
              </View>
            </View>
          </ScrollView>

          {/* Add to Bag Button - Fixed at bottom */}
          {/* TODO: Remove duplicate styling - consolidate inline styles and Tailwind classes.
            Currently mixing inline styles (backgroundColor, padding) with Tailwind classes on child View.
            The outer View uses inline styles for positioning and some styling, while the inner View
            uses Tailwind classes that duplicate some of these styles (bg-white, px-6, pt-4).
            Consider moving all styling to Tailwind classes on a single View where possible, or use
            inline styles only for positioning (position, bottom, left, right, zIndex). */}
          <View
            style={{
              position: 'absolute',
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 1,
              backgroundColor: '#fff',
              padding: 16,
            }}
            onLayout={(e) => setFooterHeight(e.nativeEvent.layout.height)}
          >
            <View
              className="px-6 pt-4 bg-white border-t border-border"
              style={{ paddingBottom: Math.max(16, insets.bottom) }}
            >
              <Pressable
                onPress={handleOpenVariantSheet}
                disabled={!product.inStock}
                className={`rounded-xl py-4 items-center ${
                  product.inStock
                    ? 'bg-sage-green active:bg-sage-green/90'
                    : 'bg-muted'
                }`}
              >
                <Text className="text-white text-base font-inter-bold">
                  {product.inStock ? 'ADD TO BAG' : 'OUT OF STOCK'}
                </Text>
              </Pressable>
            </View>
          </View>
        </SafeAreaView>
      </View>

      {/* Bottom Sheets */}
      <VariantSelectorSheet
        ref={variantSheetRef}
        product={product}
        onAddToBag={handleAddToBag}
      />
      <ProductDetailsSheet
        ref={detailsSheetRef}
        description={product.description}
      />
      <DeliveryInfoSheet ref={deliverySheetRef} />
      <BrandInfoSheet ref={brandSheetRef} brand={product.brand} />
    </>
  );
}

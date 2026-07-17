import { faMinus, faPlus, faTrash } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useBottomTabBarHeight } from '@/hooks/useBottomTabBarHeight';
import { useShopifyCheckoutSheet } from '@shopify/checkout-sheet-kit';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { toast } from 'sonner-native';
import BagCheckoutFooter from '@/components/BagCheckoutFooter';
import BagHeader from '@/components/BagHeader';
import EmptyBagState from '@/components/EmptyBagState';
import { useCart } from '@/contexts/cart';
import * as logger from '@/lib/logger';

export default function BagScreen() {
  const {
    cart,
    isLoading,
    totalQuantity,
    removeFromCart,
    updateQuantity,
    clearCart,
  } = useCart();
  const [headerHeight, setHeaderHeight] = useState(0);
  const [footerHeight, setFooterHeight] = useState(0);
  const [isCheckoutProcessing, setIsCheckoutProcessing] = useState(false);
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();
  const shopifyCheckout = useShopifyCheckoutSheet();

  const isEmpty = !cart || !cart.lines?.edges || cart.lines.edges.length === 0;

  const handleRemoveItem = async (lineId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await removeFromCart(lineId);
  };

  const handleUpdateQuantity = async (
    lineId: string,
    currentQuantity: number,
    delta: number,
  ) => {
    const newQuantity = currentQuantity + delta;
    if (newQuantity < 1) {
      await handleRemoveItem(lineId);
      return;
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await updateQuantity(lineId, newQuantity);
  };

  // Setup checkout event listeners
  useEffect(() => {
    // Handle successful checkout completion
    const completedListener = shopifyCheckout.addEventListener(
      'completed',
      (event) => {
        const orderId = event.orderDetails.id;
        // TODO: send this to analytics
        logger.info('Checkout completed! Order ID:', orderId);

        // Clear the cart after successful checkout
        clearCart();

        // Show success message
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        toast.success('Order placed successfully!');

        setIsCheckoutProcessing(false);

        // Navigate to home
        router.push('/');
      },
    );

    // Handle checkout cancellation
    const closeListener = shopifyCheckout.addEventListener('close', () => {
      // TODO: send this to analytics
      logger.info('Checkout closed');
      setIsCheckoutProcessing(false);
    });

    // Handle checkout errors
    const errorListener = shopifyCheckout.addEventListener('error', (error) => {
      console.error('Checkout error:', error.message);
      toast.error('Checkout failed. Please try again.');
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      setIsCheckoutProcessing(false);
    });

    // Cleanup listeners on unmount
    return () => {
      completedListener?.remove();
      closeListener?.remove();
      errorListener?.remove();
    };
  }, [shopifyCheckout, clearCart]);

  // Preload checkout when cart has items (improves performance)
  useEffect(() => {
    if (cart?.checkoutUrl && !isEmpty) {
      // Debounce preload calls to avoid excessive strain on Shopify servers
      // as per Shopify guidelines: don't call preload() on every cart change
      const timeoutId = setTimeout(() => {
        shopifyCheckout.invalidate();
        shopifyCheckout.preload(cart.checkoutUrl);
      }, 500); // Wait 500ms after last cart change before preloading

      return () => clearTimeout(timeoutId);
    }
  }, [cart, isEmpty, shopifyCheckout]);

  const handleCheckout = () => {
    if (!cart?.checkoutUrl) {
      toast.error('Unable to proceed to checkout');
      return;
    }

    setIsCheckoutProcessing(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    // Present the native checkout
    shopifyCheckout.present(cart.checkoutUrl);
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-warm-beige items-center justify-center">
        <ActivityIndicator size="large" color="#5D4037" />
      </View>
    );
  }

  return (
    <>
      {isEmpty ? (
        <SafeAreaView className="flex-1 bg-warm-beige" edges={['top']}>
          <View
            onLayout={(event) => {
              const { height } = event.nativeEvent.layout;
              setHeaderHeight(height);
            }}
          >
            <BagHeader isEmpty totalQuantity={0} />
          </View>
          <View
            style={{
              height:
                headerHeight > 0
                  ? Dimensions.get('window').height -
                    insets.top -
                    headerHeight -
                    tabBarHeight
                  : undefined,
            }}
          >
            <EmptyBagState />
          </View>
        </SafeAreaView>
      ) : (
        <View className="flex-1 bg-warm-beige">
          {/* Fixed Header for Non-Empty State */}
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              zIndex: 1,
            }}
            onLayout={(event) => {
              const { height } = event.nativeEvent.layout;
              setHeaderHeight(height);
            }}
          >
            <View
              style={{
                paddingTop: Math.max(16, insets.top),
              }}
            >
              <BagHeader isEmpty={false} totalQuantity={totalQuantity} />
            </View>
          </View>

          {/* Scrollable Content with Items */}
          <ScrollView
            style={{
              marginTop: headerHeight,
              marginBottom: footerHeight + tabBarHeight,
              paddingHorizontal: 24,
            }}
            showsVerticalScrollIndicator={false}
          >
            {cart?.lines?.edges?.map(({ node: line }) => {
              const product = line.merchandise.product;
              const price = line.merchandise.priceV2?.amount
                ? parseFloat(line.merchandise.priceV2.amount)
                : 0;
              const compareAtPrice = line.merchandise.compareAtPriceV2?.amount
                ? parseFloat(line.merchandise.compareAtPriceV2.amount)
                : null;
              const hasDiscount = compareAtPrice && compareAtPrice > price;
              const imageUrl =
                line.merchandise.image?.url ||
                product?.images?.edges?.[0]?.node.url;

              // Skip rendering if product data is missing
              if (!product) {
                console.warn('Missing product data for line:', line.id);
                return null;
              }

              return (
                <View
                  key={line.id}
                  className="flex-row bg-white rounded-xl p-4 mb-3 border border-border"
                >
                  {/* Product Image */}
                  <Pressable
                    onPress={() =>
                      product?.handle &&
                      router.push(`/product/${product.handle}`)
                    }
                    className="active:opacity-70"
                  >
                    <Image
                      source={{ uri: imageUrl }}
                      className="w-24 h-24 rounded-lg bg-warm-beige"
                      resizeMode="cover"
                    />
                  </Pressable>

                  {/* Product Info */}
                  <View className="flex-1 ml-4">
                    <Pressable
                      onPress={() => router.push(`/product/${product?.handle}`)}
                      className="active:opacity-70"
                    >
                      <Text className="text-xs font-inter text-muted-foreground mb-1">
                        {product?.vendor || 'Unknown'}
                      </Text>
                      <Text
                        className="text-sm font-inter-semibold text-foreground mb-2"
                        numberOfLines={2}
                      >
                        {line.merchandise.title}
                      </Text>
                    </Pressable>

                    {/* Price */}
                    <View className="flex-row items-center mb-3">
                      <Text className="text-lg font-playfair-bold text-cocoa">
                        £{price.toFixed(2)}
                      </Text>
                      {hasDiscount && (
                        <Text className="text-sm font-inter text-muted-foreground line-through ml-2">
                          £{compareAtPrice!.toFixed(2)}
                        </Text>
                      )}
                    </View>

                    {/* Quantity Controls and Remove */}
                    <View className="flex-row items-center justify-between">
                      <View className="flex-row items-center bg-warm-beige rounded-lg">
                        <Pressable
                          onPress={() =>
                            handleUpdateQuantity(line.id, line.quantity, -1)
                          }
                          className="w-8 h-8 items-center justify-center active:opacity-70"
                        >
                          <FontAwesomeIcon
                            icon={faMinus}
                            size={12}
                            color="#5D4037"
                          />
                        </Pressable>
                        <Text className="w-8 text-center font-inter-semibold text-foreground">
                          {line.quantity}
                        </Text>
                        <Pressable
                          onPress={() =>
                            handleUpdateQuantity(line.id, line.quantity, 1)
                          }
                          className="w-8 h-8 items-center justify-center active:opacity-70"
                        >
                          <FontAwesomeIcon
                            icon={faPlus}
                            size={12}
                            color="#5D4037"
                          />
                        </Pressable>
                      </View>

                      <Pressable
                        onPress={() => handleRemoveItem(line.id)}
                        className="w-8 h-8 items-center justify-center active:opacity-70"
                      >
                        <FontAwesomeIcon
                          icon={faTrash}
                          size={16}
                          color="#C5705D"
                        />
                      </Pressable>
                    </View>
                  </View>
                </View>
              );
            })}

            <View className="h-32" />
          </ScrollView>

          {/* Checkout Footer */}
          <BagCheckoutFooter
            cart={cart}
            onCheckout={handleCheckout}
            isProcessing={isCheckoutProcessing}
            onLayout={setFooterHeight}
          />
        </View>
      )}
    </>
  );
}

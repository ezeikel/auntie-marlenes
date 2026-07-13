import type { ShopifyCart } from '@auntie-marlenes/types';
import { ActivityIndicator, Pressable, Text, View } from 'react-native';

type BagCheckoutFooterProps = {
  cart: ShopifyCart | null;
  onCheckout: () => void;
  isProcessing: boolean;
  onLayout?: (height: number) => void;
};

export default function BagCheckoutFooter({
  cart,
  onCheckout,
  isProcessing,
  onLayout,
}: BagCheckoutFooterProps) {
  return (
    <View
      style={{
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1,
      }}
      onLayout={(event) => {
        if (onLayout) {
          const { height } = event.nativeEvent.layout;
          onLayout(height);
        }
      }}
    >
      <View
        style={{
          paddingBottom: 16,
          paddingHorizontal: 24,
          paddingTop: 16,
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#E5E5E5',
        }}
      >
        <View className="flex-row justify-between items-center mb-4">
          <Text className="text-base font-inter text-muted-foreground">
            Subtotal
          </Text>
          <Text className="text-2xl font-playfair-bold text-cocoa">
            £
            {cart?.cost?.subtotalAmount?.amount
              ? parseFloat(cart.cost.subtotalAmount.amount).toFixed(2)
              : '0.00'}
          </Text>
        </View>
        <Pressable
          onPress={onCheckout}
          disabled={isProcessing}
          className={`bg-sage-green rounded-xl py-4 items-center ${
            isProcessing ? 'opacity-50' : 'active:opacity-80'
          }`}
        >
          {isProcessing ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white text-base font-inter-bold uppercase">
              Proceed to Checkout
            </Text>
          )}
        </Pressable>
        <Text className="text-xs font-inter text-center text-muted-foreground mt-3">
          Shipping and taxes calculated at checkout
        </Text>
      </View>
    </View>
  );
}

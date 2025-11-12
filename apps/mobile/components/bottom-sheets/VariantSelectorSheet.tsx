import { forwardRef, useState, useMemo } from 'react';
import { View, Text, Pressable, Image } from 'react-native';
import {
  BottomSheetModal,
  BottomSheetScrollView,
  type BottomSheetModalProps,
} from '@gorhom/bottom-sheet';
import type { Product } from '@auntie-marlenes/types';
import * as Haptics from 'expo-haptics';
import BottomSheetHeader from '@/components/ui/BottomSheetHeader';
import ColorSwatch from '@/components/ui/ColorSwatch';
import SizeButton from '@/components/ui/SizeButton';
import QuantitySelector from '@/components/ui/QuantitySelector';

type VariantSelectorSheetProps = Omit<BottomSheetModalProps, 'children' | 'snapPoints'> & {
  product: Product;
  onAddToBag: (variant: {
    color?: string;
    size?: string;
    quantity: number;
  }) => void;
};

const VariantSelectorSheet = forwardRef<BottomSheetModal, VariantSelectorSheetProps>(
  ({ product, onAddToBag, ...props }, ref) => {
    const snapPoints = useMemo(() => ['65%', '90%'], []);

    const [selectedColor, setSelectedColor] = useState(product.colors?.[0]);
    const [selectedSize, setSelectedSize] = useState(product.sizes?.[0]);
    const [quantity, setQuantity] = useState(1);

    const handleAddToBag = () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      onAddToBag({
        color: selectedColor?.name,
        size: selectedSize,
        quantity,
      });

      // Reset selections
      setQuantity(1);
    };

    const totalPrice = product.price * quantity;
    const hasDiscount = product.compareAtPrice && product.compareAtPrice > product.price;
    const discountPercent = hasDiscount
      ? Math.round(((product.compareAtPrice! - product.price) / product.compareAtPrice!) * 100)
      : 0;

    return (
      <BottomSheetModal
        ref={ref}
        index={0}
        snapPoints={snapPoints}
        enablePanDownToClose
        {...props}
      >
        <BottomSheetHeader title="Select Options" />

        <BottomSheetScrollView
          className="flex-1"
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 32 }}
        >
          {/* Product Summary */}
          <View className="flex-row mb-6 pb-6 border-b border-border">
            <Image
              source={{ uri: product.image }}
              className="w-20 h-20 rounded-lg bg-warm-beige"
              resizeMode="cover"
            />
            <View className="ml-4 flex-1">
              <Text className="text-sm font-inter text-muted-foreground mb-1">
                {product.brand}
              </Text>
              <Text className="text-base font-inter-semibold text-foreground mb-2" numberOfLines={2}>
                {product.name}
              </Text>
              <View className="flex-row items-center gap-2">
                <Text className="text-2xl font-playfair-bold text-cocoa">
                  £{product.price.toFixed(2)}
                </Text>
                {hasDiscount && (
                  <>
                    <Text className="text-base font-inter text-muted-foreground line-through">
                      £{product.compareAtPrice!.toFixed(2)}
                    </Text>
                    <View className="bg-terracotta px-2 py-0.5 rounded">
                      <Text className="text-xs font-inter-bold text-white">
                        {discountPercent}% OFF
                      </Text>
                    </View>
                  </>
                )}
              </View>
            </View>
          </View>

          {/* Color Selection */}
          {product.colors && product.colors.length > 0 && (
            <View className="mb-6">
              <Text className="text-base font-inter-semibold text-foreground mb-3">
                Color: {selectedColor?.name}
              </Text>
              <View className="flex-row flex-wrap gap-3">
                {product.colors.map((color) => (
                  <ColorSwatch
                    key={color.name}
                    color={color}
                    selected={selectedColor?.name === color.name}
                    onSelect={() => setSelectedColor(color)}
                  />
                ))}
              </View>
            </View>
          )}

          {/* Size Selection */}
          {product.sizes && product.sizes.length > 0 && (
            <View className="mb-6">
              <Text className="text-base font-inter-semibold text-foreground mb-3">
                Size: {selectedSize}
              </Text>
              <View className="flex-row flex-wrap gap-3">
                {product.sizes.map((size) => (
                  <SizeButton
                    key={size}
                    size={size}
                    selected={selectedSize === size}
                    onSelect={() => setSelectedSize(size)}
                  />
                ))}
              </View>
            </View>
          )}

          {/* Quantity Selection */}
          <View className="mb-6">
            <Text className="text-base font-inter-semibold text-foreground mb-3">
              Quantity
            </Text>
            <QuantitySelector
              quantity={quantity}
              onIncrease={() => setQuantity((q) => q + 1)}
              onDecrease={() => setQuantity((q) => Math.max(1, q - 1))}
            />
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

          {/* Add to Bag Button */}
          <Pressable
            onPress={handleAddToBag}
            disabled={!product.inStock}
            className={`
              rounded-xl py-4 items-center mb-8
              ${product.inStock ? 'bg-cocoa' : 'bg-muted'}
            `}
          >
            <Text className="text-white text-base font-inter-bold">
              {product.inStock
                ? `Add to Bag - £${totalPrice.toFixed(2)}`
                : 'Out of Stock'}
            </Text>
          </Pressable>
        </BottomSheetScrollView>
      </BottomSheetModal>
    );
  }
);

VariantSelectorSheet.displayName = 'VariantSelectorSheet';

export default VariantSelectorSheet;

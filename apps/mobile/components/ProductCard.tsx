import type { Product } from '@auntie-marlenes/types';
import { faHeart } from '@fortawesome/pro-regular-svg-icons';
import { faHeart as faHeartSolid } from '@fortawesome/pro-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import * as Haptics from 'expo-haptics';
import { router } from 'expo-router';
import { Image, Pressable, Text, View } from 'react-native';

type ProductCardProps = {
  product: Product;
  onSaveToggle?: (productId: string) => void;
  isSaved?: boolean;
};

export default function ProductCard({
  product,
  onSaveToggle,
  isSaved = false,
}: ProductCardProps) {
  const handlePress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    router.push(`/product/${product.handle}`);
  };

  const handleSaveToggle = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    onSaveToggle?.(product.id);
  };

  const discountPercent = product.compareAtPrice
    ? Math.round(
        ((product.compareAtPrice - product.price) / product.compareAtPrice) *
          100,
      )
    : 0;

  return (
    <Pressable
      onPress={handlePress}
      className="bg-white rounded-2xl overflow-hidden border border-border active:opacity-70"
    >
      {/* Image */}
      <View className="relative aspect-square">
        <Image
          source={{ uri: product.image }}
          className="w-full h-full"
          resizeMode="cover"
        />

        {/* Save Button */}
        <Pressable
          onPress={handleSaveToggle}
          className="absolute top-3 right-3 bg-white/90 rounded-full p-2 active:opacity-70"
        >
          <FontAwesomeIcon
            icon={isSaved ? faHeartSolid : faHeart}
            size={18}
            color={isSaved ? '#C5705D' : '#5D4037'}
          />
        </Pressable>

        {/* Discount Badge */}
        {discountPercent > 0 && (
          <View className="absolute top-3 left-3 bg-terracotta rounded-lg px-2 py-1">
            <Text className="text-white text-xs font-inter-bold">
              -{discountPercent}%
            </Text>
          </View>
        )}

        {/* Out of Stock Badge */}
        {!product.inStock && (
          <View className="absolute bottom-3 left-3 bg-black/80 rounded-lg px-3 py-1.5">
            <Text className="text-white text-xs font-inter-semibold">
              Out of Stock
            </Text>
          </View>
        )}
      </View>

      {/* Details */}
      <View className="p-3">
        <Text className="text-xs font-inter text-muted-foreground mb-1">
          {product.brand}
        </Text>
        <Text
          className="text-sm font-inter-semibold text-foreground mb-2"
          numberOfLines={2}
        >
          {product.name}
        </Text>

        {/* Rating */}
        {product.rating && (
          <View className="flex-row items-center mb-2">
            <Text className="text-xs font-inter-medium text-foreground">
              ⭐ {product.rating.toFixed(1)}
            </Text>
            {product.reviewCount && (
              <Text className="text-xs font-inter text-muted-foreground ml-1">
                ({product.reviewCount})
              </Text>
            )}
          </View>
        )}

        {/* Price */}
        <View className="flex-row items-center">
          <Text className="text-base font-inter-bold text-cocoa">
            £{product.price.toFixed(2)}
          </Text>
          {product.compareAtPrice && (
            <Text className="text-sm font-inter text-muted-foreground line-through ml-2">
              £{product.compareAtPrice.toFixed(2)}
            </Text>
          )}
        </View>
      </View>
    </Pressable>
  );
}

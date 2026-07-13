import type { Product } from '@auntie-marlenes/types';
import { faHeart } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { router } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  Text,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import ProductCard from '@/components/ProductCard';
import { useSaved } from '@/contexts/saved';
import { useProducts } from '@/hooks/useProducts';

export default function SavedScreen() {
  const { savedItems, isLoading: isSavedLoading, toggleSave } = useSaved();
  const { data: allProducts, isLoading: isProductsLoading } = useProducts();
  const [headerHeight, setHeaderHeight] = useState(0);
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();

  // Filter products to only show saved ones
  const savedProducts =
    allProducts?.filter((product: Product) =>
      savedItems.includes(product.id),
    ) || [];

  const isLoading = isSavedLoading || isProductsLoading;

  const handleSaveToggle = async (productId: string) => {
    await toggleSave(productId);
  };

  if (isLoading) {
    return (
      <SafeAreaView
        className="flex-1 bg-warm-beige items-center justify-center"
        edges={['top']}
      >
        <ActivityIndicator size="large" color="#5D4037" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-warm-beige" edges={['top']}>
      {/* Header */}
      <View
        className="px-6 pt-6 pb-4"
        onLayout={(event) => {
          const { height } = event.nativeEvent.layout;
          setHeaderHeight(height);
        }}
      >
        <Text className="text-3xl font-playfair-bold text-deep-earth mb-1">
          Saved Items
        </Text>
        <Text className="text-sm font-inter text-cocoa">
          {savedProducts.length === 0
            ? 'No saved items yet'
            : `${savedProducts.length} item${savedProducts.length === 1 ? '' : 's'}`}
        </Text>
      </View>

      {savedProducts.length === 0 ? (
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
          <View className="flex-1 items-center justify-center">
            <View className="size-20 rounded-full bg-warm-beige items-center justify-center mb-6">
              <FontAwesomeIcon icon={faHeart} size={40} color="#5D4037" />
            </View>
            <Text className="text-lg font-inter-semibold text-center text-foreground mb-2">
              No Saved Items
            </Text>
            <Text className="text-sm font-inter text-center text-muted-foreground mb-6">
              Tap the heart icon on products you love to save them here
            </Text>
            <Pressable
              onPress={() => router.push('/(tabs)/')}
              className="bg-sage-green rounded-xl px-6 py-3 active:opacity-80"
            >
              <Text className="text-white font-inter-semibold">
                Browse Products
              </Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <FlatList
          data={savedProducts}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerClassName="px-6 pb-6"
          columnWrapperClassName="gap-3 mb-3"
          renderItem={({ item }) => (
            <View className="flex-1">
              <ProductCard
                product={item}
                onSaveToggle={handleSaveToggle}
                isSaved={true}
              />
            </View>
          )}
        />
      )}
    </SafeAreaView>
  );
}

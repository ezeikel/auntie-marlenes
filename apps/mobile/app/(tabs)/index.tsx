import { View, Text, ScrollView, FlatList, ActivityIndicator, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useProducts } from '@/hooks/useProducts';
import ProductCard from '@/components/ProductCard';
import { CATEGORIES } from '@auntie-marlenes/constants';
import { useSaved } from '@/contexts/saved';
import * as Haptics from 'expo-haptics';

export default function HomeScreen() {
  const { data: products, isLoading, error } = useProducts(20);
  const { isSaved, toggleSave } = useSaved();

  const handleSaveToggle = async (productId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    await toggleSave(productId);
  };

  if (isLoading) {
    return (
      <View className="flex-1 items-center justify-center bg-warm-beige">
        <ActivityIndicator size="large" color="#5D4037" />
      </View>
    );
  }

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-warm-beige px-6">
        <Text className="text-base font-inter-semibold text-foreground text-center mb-2">
          Failed to load products
        </Text>
        <Text className="text-sm font-inter text-muted-foreground text-center">
          Please try again later
        </Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-warm-beige" edges={['top']}>
      <ScrollView
        // className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerClassName="pb-6"
      >
        {/* Header */}
        <View className="px-6 pt-6 pb-4">
          <Text className="text-3xl font-playfair-bold text-deep-earth mb-1">
            Auntie Marlene's
          </Text>
          <Text className="text-sm font-inter text-cocoa">
            Authentic Beauty, Naturally Curated
          </Text>
        </View>

        {/* Hero Banner */}
        <View className="mx-6 mb-6 rounded-2xl overflow-hidden bg-terracotta h-48 justify-center items-center">
          <View className="absolute inset-0 bg-gradient-to-br from-terracotta to-warm-clay" />
          <View className="px-8">
            <Text className="text-3xl font-playfair-bold text-white text-center mb-2">
              20% Off New Arrivals
            </Text>
            <Text className="text-sm font-inter text-white/90 text-center">
              Discover our latest collection
            </Text>
          </View>
        </View>

        {/* Categories */}
        <View className="mb-6">
          <Text className="text-xl font-playfair-semibold text-foreground px-6 mb-4">
            Shop by Category
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="px-6 gap-3"
          >
            {CATEGORIES.map((category) => (
              <View
                key={category.id}
                className="w-28 h-32 rounded-xl overflow-hidden bg-white border border-border"
              >
                <View className="flex-1 items-center justify-center p-3">
                  <Text className="text-sm font-inter-semibold text-center text-foreground">
                    {category.name}
                  </Text>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>

        {/* New Arrivals */}
        <View className="mb-6">
          <View className="flex-row items-center justify-between px-6 mb-4">
            <Text className="text-xl font-playfair-semibold text-foreground">
              New Arrivals
            </Text>
            <Text className="text-sm font-inter-medium text-cocoa">See All</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerClassName="px-6 gap-4"
          >
            {products?.slice(0, 5).map((product) => (
              <View key={product.id} className="w-48">
                <ProductCard
                  product={product}
                  onSaveToggle={handleSaveToggle}
                  isSaved={isSaved(product.id)}
                />
              </View>
            ))}
          </ScrollView>
        </View>

        {/* Featured Products */}
        <View className="px-6">
          <Text className="text-xl font-playfair-semibold text-foreground mb-4">
            Featured Products
          </Text>
          <View className="flex-row flex-wrap gap-3">
            {products?.slice(5, 13).map((product) => (
              <View key={product.id} className="w-[48%]">
                <ProductCard
                  product={product}
                  onSaveToggle={handleSaveToggle}
                  isSaved={isSaved(product.id)}
                />
              </View>
            ))}
          </View>
        </View>

        {/* Trust Badges */}
        <View className="mx-6 mt-6 bg-white rounded-2xl p-6 border border-border">
          <View className="flex-row justify-around">
            <View className="items-center flex-1">
              <Text className="text-2xl mb-1">🚚</Text>
              <Text className="text-xs font-inter-semibold text-center text-foreground">
                Free Shipping
              </Text>
              <Text className="text-xs font-inter text-center text-muted-foreground">
                Over £50
              </Text>
            </View>
            <View className="items-center flex-1">
              <Text className="text-2xl mb-1">✨</Text>
              <Text className="text-xs font-inter-semibold text-center text-foreground">
                Authentic
              </Text>
              <Text className="text-xs font-inter text-center text-muted-foreground">
                Products
              </Text>
            </View>
            <View className="items-center flex-1">
              <Text className="text-2xl mb-1">💚</Text>
              <Text className="text-xs font-inter-semibold text-center text-foreground">
                Natural
              </Text>
              <Text className="text-xs font-inter text-center text-muted-foreground">
                Ingredients
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

import {
  faMagnifyingGlass,
  faMagnifyingGlassSlash,
  faXmark,
} from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  FlatList,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import {
  SafeAreaView,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { useDebouncedCallback } from 'use-debounce';
import ProductCard from '@/components/ProductCard';
import { useSearchProducts } from '@/hooks/useProducts';

export default function SearchScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [savedItems, setSavedItems] = useState<string[]>([]);
  const [headerHeight, setHeaderHeight] = useState(0);
  const [searchInputHeight, setSearchInputHeight] = useState(0);
  const tabBarHeight = useBottomTabBarHeight();
  const insets = useSafeAreaInsets();

  const debouncedSearch = useDebouncedCallback((value: string) => {
    setDebouncedQuery(value);
  }, 500);

  const { data: products, isLoading } = useSearchProducts(
    debouncedQuery,
    debouncedQuery.length > 0,
  );

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    debouncedSearch(text);
  };

  const handleClear = () => {
    setSearchQuery('');
    setDebouncedQuery('');
  };

  const handleSaveToggle = (productId: string) => {
    setSavedItems((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  };

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
          Search
        </Text>
        <Text className="text-sm font-inter text-cocoa">
          Find your perfect products
        </Text>
      </View>

      {/* Search Input */}
      <View
        className="px-6 mb-4"
        onLayout={(event) => {
          const { height } = event.nativeEvent.layout;
          setSearchInputHeight(height);
        }}
      >
        <View className="flex-row items-center bg-white border border-border rounded-xl px-4 py-3">
          <FontAwesomeIcon icon={faMagnifyingGlass} size={18} color="#A3A3A3" />
          <TextInput
            value={searchQuery}
            onChangeText={handleSearchChange}
            placeholder="Search products..."
            className="flex-1 ml-3 text-base font-inter text-foreground"
            placeholderTextColor="#A3A3A3"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={handleClear} className="p-1">
              <FontAwesomeIcon icon={faXmark} size={18} color="#A3A3A3" />
            </Pressable>
          )}
        </View>
      </View>

      {/* Results */}
      {isLoading ? (
        <View
          style={{
            height:
              headerHeight > 0 && searchInputHeight > 0
                ? Dimensions.get('window').height -
                  insets.top -
                  headerHeight -
                  searchInputHeight -
                  tabBarHeight
                : undefined,
          }}
        >
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#5D4037" />
          </View>
        </View>
      ) : debouncedQuery.length === 0 ? (
        <View
          style={{
            height:
              headerHeight > 0 && searchInputHeight > 0
                ? Dimensions.get('window').height -
                  insets.top -
                  headerHeight -
                  searchInputHeight -
                  tabBarHeight
                : undefined,
          }}
        >
          <View className="flex-1 items-center justify-center px-12">
            <View className="w-20 h-20 rounded-full bg-warm-beige items-center justify-center mb-6">
              <FontAwesomeIcon
                icon={faMagnifyingGlass}
                size={40}
                color="#5D4037"
              />
            </View>
            <Text className="text-lg font-inter-semibold text-center text-foreground mb-2">
              Search for Products
            </Text>
            <Text className="text-sm font-inter text-center text-muted-foreground">
              Start typing to find your favorite beauty products
            </Text>
          </View>
        </View>
      ) : products && products.length > 0 ? (
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerClassName="px-6 pb-6"
          columnWrapperClassName="gap-3 mb-3"
          renderItem={({ item }) => (
            <View className="flex-1">
              <ProductCard
                product={item}
                onSaveToggle={handleSaveToggle}
                isSaved={savedItems.includes(item.id)}
              />
            </View>
          )}
        />
      ) : (
        <View
          style={{
            height:
              headerHeight > 0 && searchInputHeight > 0
                ? Dimensions.get('window').height -
                  insets.top -
                  headerHeight -
                  searchInputHeight -
                  tabBarHeight
                : undefined,
          }}
        >
          <View className="flex-1 items-center justify-center px-12">
            <View className="w-20 h-20 rounded-full bg-warm-beige items-center justify-center mb-6">
              <FontAwesomeIcon
                icon={faMagnifyingGlassSlash}
                size={40}
                color="#5D4037"
              />
            </View>
            <Text className="text-lg font-inter-semibold text-center text-foreground mb-2">
              No Results Found
            </Text>
            <Text className="text-sm font-inter text-center text-muted-foreground">
              Try searching with different keywords
            </Text>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

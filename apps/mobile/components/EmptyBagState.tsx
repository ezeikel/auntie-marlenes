import { faShoppingBag } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { router } from 'expo-router';
import { Pressable, Text, View } from 'react-native';

export default function EmptyBagState() {
  return (
    <View className="flex-1 items-center justify-center px-6">
      <View className="size-20 rounded-full bg-warm-beige items-center justify-center mb-6">
        <FontAwesomeIcon icon={faShoppingBag} size={40} color="#5D4037" />
      </View>
      <Text className="text-lg font-inter-semibold text-center text-foreground mb-2">
        Your Bag is Empty
      </Text>
      <Text className="text-sm font-inter text-center text-muted-foreground mb-6">
        Add some products to get started
      </Text>
      <Pressable
        onPress={() => router.push('/(tabs)/')}
        className="bg-sage-green rounded-xl px-6 py-3 active:opacity-80"
      >
        <Text className="text-white font-inter-semibold">
          Continue Shopping
        </Text>
      </Pressable>
    </View>
  );
}

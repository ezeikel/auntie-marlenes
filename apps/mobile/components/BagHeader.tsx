import { View, Text } from 'react-native';

type BagHeaderProps = {
  isEmpty: boolean;
  totalQuantity: number;
};

export default function BagHeader({ isEmpty, totalQuantity }: BagHeaderProps) {
  return (
    <View className="px-6 pt-6 pb-4">
      <Text className="text-3xl font-playfair-bold text-deep-earth mb-1">
        Shopping Bag
      </Text>
      <Text className="text-sm font-inter text-cocoa">
        {isEmpty ? 'Your bag is empty' : `${totalQuantity} ${totalQuantity === 1 ? 'item' : 'items'}`}
      </Text>
    </View>
  );
}

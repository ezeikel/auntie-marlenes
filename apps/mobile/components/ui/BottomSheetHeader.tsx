import { View, Text } from 'react-native';

type BottomSheetHeaderProps = {
  title: string;
};

export default function BottomSheetHeader({ title }: BottomSheetHeaderProps) {
  return (
    <View className="px-6 pt-2 pb-4">
      <Text className="text-xl font-playfair-bold text-foreground">
        {title}
      </Text>
    </View>
  );
}

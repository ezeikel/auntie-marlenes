import { View, Pressable, Text } from 'react-native';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { faMinus, faPlus } from '@fortawesome/pro-regular-svg-icons';
import * as Haptics from 'expo-haptics';

type QuantitySelectorProps = {
  quantity: number;
  onIncrease: () => void;
  onDecrease: () => void;
  min?: number;
  max?: number;
};

export default function QuantitySelector({
  quantity,
  onIncrease,
  onDecrease,
  min = 1,
  max = 99,
}: QuantitySelectorProps) {
  const handleDecrease = () => {
    if (quantity > min) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onDecrease();
    }
  };

  const handleIncrease = () => {
    if (quantity < max) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onIncrease();
    }
  };

  return (
    <View className="flex-row items-center">
      <Pressable
        onPress={handleDecrease}
        disabled={quantity <= min}
        className={`
          w-10 h-10 rounded-lg border border-border items-center justify-center
          ${quantity <= min ? 'opacity-50' : 'opacity-100'}
        `}
      >
        <FontAwesomeIcon icon={faMinus} size={16} color="#5D4037" />
      </Pressable>

      <Text className="text-lg font-inter-semibold text-foreground mx-6 min-w-[40px] text-center">
        {quantity}
      </Text>

      <Pressable
        onPress={handleIncrease}
        disabled={quantity >= max}
        className={`
          w-10 h-10 rounded-lg border border-border items-center justify-center
          ${quantity >= max ? 'opacity-50' : 'opacity-100'}
        `}
      >
        <FontAwesomeIcon icon={faPlus} size={16} color="#5D4037" />
      </Pressable>
    </View>
  );
}

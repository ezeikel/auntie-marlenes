import * as Haptics from 'expo-haptics';
import { Pressable, Text } from 'react-native';

type SizeButtonProps = {
  size: string;
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
};

export default function SizeButton({
  size,
  selected,
  onSelect,
  disabled = false,
}: SizeButtonProps) {
  const handlePress = () => {
    if (!disabled) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onSelect();
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      className={`
        px-6 py-3 rounded-lg min-w-[60px] items-center justify-center
        ${selected ? 'bg-cocoa border-cocoa' : 'bg-white border-border'}
        ${disabled ? 'opacity-50' : 'opacity-100'}
        border
      `}
    >
      <Text
        className={`
          text-base font-inter-semibold
          ${selected ? 'text-white' : 'text-foreground'}
          ${disabled ? 'line-through' : ''}
        `}
      >
        {size}
      </Text>
    </Pressable>
  );
}

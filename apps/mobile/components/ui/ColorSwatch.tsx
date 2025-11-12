import { Pressable, View } from 'react-native';
import * as Haptics from 'expo-haptics';

type ColorSwatchProps = {
  color: {
    name: string;
    value: string;
    image?: string;
  };
  selected: boolean;
  onSelect: () => void;
  disabled?: boolean;
};

export default function ColorSwatch({
  color,
  selected,
  onSelect,
  disabled = false,
}: ColorSwatchProps) {
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
        w-12 h-12 rounded-full items-center justify-center
        ${selected ? 'border-2 border-cocoa' : 'border border-border'}
        ${disabled ? 'opacity-50' : 'opacity-100'}
      `}
    >
      <View
        className="w-10 h-10 rounded-full"
        style={{ backgroundColor: color.value }}
      />
      {disabled && (
        <View className="absolute w-full h-0.5 bg-muted-foreground rotate-45" />
      )}
    </Pressable>
  );
}

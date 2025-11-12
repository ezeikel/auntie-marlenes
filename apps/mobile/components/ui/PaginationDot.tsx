import Animated, {
  useAnimatedStyle,
  interpolate,
} from 'react-native-reanimated';

interface PaginationDotProps {
  index: number;
  activeIndex: Animated.SharedValue<number>;
}

const PaginationDot = ({ index, activeIndex }: PaginationDotProps) => {
  const animatedStyle = useAnimatedStyle(() => {
    const inputRange = [index - 1, index, index + 1];

    const width = interpolate(
      activeIndex.value,
      inputRange,
      [8, 32, 8],
      'clamp'
    );

    const opacity = interpolate(
      activeIndex.value,
      inputRange,
      [0.6, 1, 0.6],
      'clamp'
    );

    // Interpolate between white/60% and cocoa
    const backgroundColor = interpolate(
      activeIndex.value,
      inputRange,
      [0, 1, 0],
      'clamp'
    );

    // Convert interpolated value to color
    // Cocoa: #5D4037 (93, 64, 55)
    // White 60%: rgba(255, 255, 255, 0.6)
    const cocoaR = 93;
    const cocoaG = 64;
    const cocoaB = 55;
    const whiteR = 255;
    const whiteG = 255;
    const whiteB = 255;

    const r = Math.round(whiteR + (cocoaR - whiteR) * backgroundColor);
    const g = Math.round(whiteG + (cocoaG - whiteG) * backgroundColor);
    const b = Math.round(whiteB + (cocoaB - whiteB) * backgroundColor);

    // Calculate alpha (0.6 to 1.0 based on activation)
    const alpha = 0.6 + (0.4 * backgroundColor);

    return {
      width,
      opacity,
      backgroundColor: `rgba(${r}, ${g}, ${b}, ${alpha})`,
    };
  });

  return (
    <Animated.View
      style={[
        {
          height: 8,
          borderRadius: 4,
          marginHorizontal: 4,
        },
        animatedStyle,
      ]}
    />
  );
};

export default PaginationDot;

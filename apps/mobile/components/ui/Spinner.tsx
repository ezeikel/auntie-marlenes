import { faSpinnerThird } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-native-fontawesome';
import { useEffect } from 'react';
import { type StyleProp, View, type ViewStyle } from 'react-native';
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
} from 'react-native-reanimated';

/**
 * The only loading indicator the app uses: a spinning `faSpinnerThird`, never
 * React Native's ActivityIndicator (fleet rule, same component as Prayer Pew).
 * A linear 900ms rotation; easing a spinner makes it look like it is buffering.
 * `size` 20 matches ActivityIndicator's "small", 36 its "large".
 */
export function Spinner({
  size = 20,
  color = '#5D4037',
  style,
  accessibilityLabel,
  reducedMotion = false,
}: {
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  reducedMotion?: boolean;
}) {
  const rotation = useSharedValue(0);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.get()}deg` }],
  }));

  useEffect(() => {
    if (reducedMotion) {
      cancelAnimation(rotation);
      rotation.set(0);
    } else {
      rotation.set(
        withRepeat(
          withTiming(360, { duration: 900, easing: Easing.linear }),
          -1,
          false,
        ),
      );
    }
    return () => cancelAnimation(rotation);
  }, [rotation, reducedMotion]);

  return (
    <View
      style={[{ alignItems: 'center', justifyContent: 'center' }, style]}
      accessibilityRole="progressbar"
      accessibilityLabel={accessibilityLabel ?? 'Loading'}
    >
      <Animated.View style={animatedStyle}>
        <FontAwesomeIcon icon={faSpinnerThird} size={size} color={color} />
      </Animated.View>
    </View>
  );
}

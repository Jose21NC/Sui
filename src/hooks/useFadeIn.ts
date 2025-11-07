import { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

export function useFadeIn(duration: number = 220) {
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(opacity, { toValue: 1, duration, useNativeDriver: true }).start();
  }, [duration, opacity]);
  return opacity;
}

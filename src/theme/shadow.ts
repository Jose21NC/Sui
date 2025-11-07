import { Platform } from 'react-native';

export function elev(level: number = 3) {
  // Web: prefer CSS boxShadow to avoid RNW deprecations
  if (Platform.OS === 'web') {
    // simple mapping by level
    const map: Record<number, string> = {
      1: '0 1px 3px rgba(0,0,0,0.08)',
      2: '0 2px 6px rgba(0,0,0,0.08)',
      3: '0 4px 10px rgba(0,0,0,0.06)',
      4: '0 8px 16px rgba(0,0,0,0.08)',
      6: '0 12px 24px rgba(0,0,0,0.10)'
    };
    return { boxShadow: map[level] || map[3] } as any;
  }
  // Native
  const y = Math.min(level * 1.3, 8);
  const radius = Math.min(level * 3, 10);
  const opacity = 0.06 + level * 0.005;
  return {
    shadowColor: '#000',
    shadowOpacity: opacity,
    shadowRadius: radius,
    shadowOffset: { width: 0, height: y },
    elevation: level,
  } as any;
}

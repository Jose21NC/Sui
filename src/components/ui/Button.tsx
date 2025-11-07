import React from 'react';
import { Text, TouchableOpacity, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

type Props = {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary';
  block?: boolean;
  style?: ViewStyle | ViewStyle[];
};

const Button: React.FC<Props> = ({ title, onPress, variant = 'primary', block, style }) => {
  const t = useTheme();
  const bg = variant === 'primary' ? t.primary : t.card;
  const color = variant === 'primary' ? '#fff' : t.text;
  return (
    <TouchableOpacity onPress={onPress} style={[styles.btn, { backgroundColor: bg }, block && { width: '100%' }, style as any]}>
      <Text style={[styles.text, { color }]}>{title}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  btn: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { fontFamily: 'Inter_600SemiBold' },
});

export default Button;

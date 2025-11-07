import React from 'react';
import { View, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { elev } from '../../theme/shadow';

type Props = {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  onPress?: () => void;
};

const Card: React.FC<Props> = ({ children, style, onPress }) => {
  const t = useTheme();
  const base = [
    styles.card,
    {
      backgroundColor: t.card,
      borderColor: t.border,
    },
    elev(3) as any,
  ];
  if (onPress) {
    return (
      <Pressable style={[...base, style as any]} onPress={onPress}>
        {children}
      </Pressable>
    );
  }
  return <View style={[...base, style as any]}>{children}</View>;
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
  },
});

export default Card;

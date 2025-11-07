import React from 'react';
import { View, Text, StyleSheet, ViewStyle, Pressable, Animated } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import { elev } from '../theme/shadow';

interface Props {
  label: string;
  value: string | number;
  unit?: string;
  style?: ViewStyle | ViewStyle[];
  onPress?: () => void;
}

export const MetricCard: React.FC<Props> = ({ label, value, unit, style, onPress }) => {
  const t = useTheme();
  const scale = new Animated.Value(1);
  const onIn = () => Animated.spring(scale, { toValue: 0.98, useNativeDriver: true }).start();
  const onOut = () => Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
  const Container: any = onPress ? Pressable : View;
  return (
    <Container onPress={onPress} onPressIn={onIn} onPressOut={onOut} style={{ flex: style && (style as any).flex ? (style as any).flex : undefined }}>
      <Animated.View style={[{ transform: [{ scale }] }]}>
        <View style={[styles.card, { backgroundColor: t.card, borderWidth: 1, borderColor: t.border }, elev(3) as any, style as any ]}>
      <Text style={[styles.label, { color: t.textDim }]}>{label}</Text>
      <Text style={[styles.value, { color: t.text }]}>{value}{unit ? ` ${unit}` : ''}</Text>
        </View>
      </Animated.View>
    </Container>
  );
};

const styles = StyleSheet.create({
  card: { padding: 16, borderRadius: 16, marginBottom: 12 },
  label: { fontSize: 13, fontFamily: 'Inter_400Regular' },
  value: { fontSize: 22, fontFamily: 'Inter_600SemiBold' },
});

export default MetricCard;

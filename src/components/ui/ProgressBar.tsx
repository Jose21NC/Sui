import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

type Props = { value: number; color?: string };

const ProgressBar: React.FC<Props> = ({ value, color }) => {
  const t = useTheme();
  const v = Math.max(0, Math.min(1, value));
  return (
    <View style={[styles.track, { backgroundColor: t.cardAlt }]}> 
      <View style={[styles.fill, { width: `${v * 100}%`, backgroundColor: color || t.primary }]} />
    </View>
  );
};

const styles = StyleSheet.create({
  track: { height: 8, borderRadius: 999, overflow: 'hidden' },
  fill: { height: '100%' },
});

export default ProgressBar;

import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

type Props = {
  segments: string[];
  value: number;
  onChange: (index: number) => void;
};

const SegmentedControl: React.FC<Props> = ({ segments, value, onChange }) => {
  const t = useTheme();
  return (
    <View style={styles.row}>
      {segments.map((s, i) => (
        <TouchableOpacity key={s} onPress={() => onChange(i)} style={[styles.pill, { backgroundColor: i === value ? t.primary : t.card, borderColor: t.border }]}> 
          <Text style={{ color: i === value ? '#fff' : t.textDim, fontFamily: 'Inter_600SemiBold' }}>{s}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: 8 },
  pill: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1 },
});

export default SegmentedControl;

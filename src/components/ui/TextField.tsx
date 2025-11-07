import React from 'react';
import { View, Text, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

type Props = TextInputProps & { label?: string };

const TextField: React.FC<Props> = ({ label, style, ...props }) => {
  const t = useTheme();
  return (
    <View style={{ marginBottom: 12 }}>
      {label && <Text style={{ marginBottom: 6, color: t.text, fontFamily: 'Inter_600SemiBold' }}>{label}</Text>}
      <TextInput
        {...props}
        style={[styles.input, { backgroundColor: t.card, color: t.text, borderColor: t.border }, style as any]}
        placeholderTextColor={t.textDim}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  input: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 12,
  },
});

export default TextField;

import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
// Nota: Esta pantalla ya no se usa en el flujo, mantenida como opcional.
import { useMetrics } from '../../context/MetricsContext';
import { useTheme } from '../../theme/ThemeContext';

const GoalsSetupScreen: React.FC<any> = ({ navigation }) => {
  const { goals, updateGoals } = useMetrics();
  const [local, setLocal] = useState(goals);
  const t = useTheme();

  const save = () => {
    updateGoals(local);
    navigation.replace('Preferences');
  };

  const onChange = (k: 'steps'|'sleepHours'|'waterMl', v: string) => {
    const n = parseInt(v, 10); if (!isNaN(n)) setLocal(prev => ({ ...prev, [k]: n }));
  };

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>      
      <Text style={[styles.title, { color: t.text }]}>Configura tus metas</Text>
      <Row label="Pasos diarios" value={String(local.steps)} onChange={v=>onChange('steps', v)} />
      <Row label="Sueño (h)" value={String(local.sleepHours)} onChange={v=>onChange('sleepHours', v)} />
      <Row label="Agua (ml)" value={String(local.waterMl)} onChange={v=>onChange('waterMl', v)} />
      <TouchableOpacity style={[styles.btn, { backgroundColor: t.primary }]} onPress={save}><Text style={styles.btnText}>Continuar</Text></TouchableOpacity>
    </View>
  );
};

const Row: React.FC<{ label: string; value: string; onChange: (v: string)=>void }> = ({ label, value, onChange }) => {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <TextInput style={styles.input} keyboardType="numeric" value={value} onChangeText={onChange} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24 },
  title: { fontSize: 22, marginBottom: 16, fontFamily: 'Inter_600SemiBold' },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  label: { flex: 1, color: '#cfd3e6' },
  input: { width: 140, textAlign: 'center', backgroundColor: '#1d2030', color: '#fff', padding: 10, borderRadius: 10 },
  btn: { marginTop: 16, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700' }
});

export default GoalsSetupScreen;

import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { PREDEFINED_OBJECTIVES, Objective, useGoals } from '../../context/GoalsContext';
import { useTheme } from '../../theme/ThemeContext';
// @deprecated: Pantalla antigua, mantenida por compatibilidad. No usada en el nuevo flujo.
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingParamList } from '../../navigation/OnboardingStack';

type Props = any;

const DURATIONS = [14, 30, 60];

const ObjectivePickerScreen: React.FC<Props> = ({ navigation }) => {
  const t = useTheme();
  const { chooseObjective } = useGoals();
  const [selected, setSelected] = useState<Objective | null>(null);
  const [duration, setDuration] = useState<number>(30);

  const confirm = async () => {
  if (!selected) return;
  await chooseObjective(selected, duration);
  navigation.navigate('GoalIntro' as any);
  };

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}> 
      <Text style={[styles.title, { color: t.text }]}>Elige tu objetivo</Text>
      {PREDEFINED_OBJECTIVES.map(obj => {
        const active = selected?.id === obj.id;
        return (
          <TouchableOpacity key={obj.id} style={[styles.card, { backgroundColor: active ? t.primary : t.card, borderWidth: 1, borderColor: active ? t.primaryAlt : t.border }]} onPress={() => setSelected(obj)}>
            <Text style={[styles.cardTitle, { color: active ? '#fff' : t.text }]}>{obj.title}</Text>
            <Text style={{ color: active ? '#F0F4FF' : t.textDim }}>{obj.description}</Text>
          </TouchableOpacity>
        );
      })}
      <Text style={[styles.subtitle, { color: t.text }]}>Duración</Text>
      <View style={styles.row}>
        {DURATIONS.map(d => {
          const active = duration === d;
          return (
            <TouchableOpacity key={d} style={[styles.pill, { backgroundColor: active ? t.primary : t.card, borderWidth: 1, borderColor: active ? t.primaryAlt : t.border }]} onPress={() => setDuration(d)}>
              <Text style={{ color: active ? '#fff' : t.text }}>{d} días</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      <TouchableOpacity disabled={!selected} onPress={confirm} style={[styles.btn, { backgroundColor: selected ? t.primary : t.border }]}>
        <Text style={styles.btnText}>Continuar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 24, marginBottom: 12, fontFamily: 'Inter_600SemiBold' },
  subtitle: { fontSize: 18, marginTop: 12, marginBottom: 8 },
  card: { padding: 14, borderRadius: 12, marginBottom: 10 },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  row: { flexDirection: 'row', gap: 10 },
  pill: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 20 },
  btn: { marginTop: 16, padding: 14, borderRadius: 12, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700' },
});

export default ObjectivePickerScreen;

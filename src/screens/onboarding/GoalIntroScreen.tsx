import React, { useMemo, useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, Image, ScrollView } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingParamList } from '../../navigation/OnboardingStack';
import { useTheme } from '../../theme/ThemeContext';
import { LinearGradient } from 'expo-linear-gradient';

type Props = NativeStackScreenProps<OnboardingParamList, 'GoalIntro'>;

type Plazo = 'corto'|'mediano'|'largo';

const SUGGESTIONS = [
  'Mejorar en mis estudios',
  'Trabajar en mi expresión corporal',
  'Organizar mis finanzas personales',
  'Leer 20 min al día',
  'Hacer ejercicio suave a diario',
];

const PLAZO_DESC: Record<Plazo, { label: string; detail: string; days: number }> = {
  corto: { label: 'Corto', detail: '≈ 2 semanas (14 días). Ideal para objetivos muy concretos y enfoque intenso.', days: 14 },
  mediano: { label: 'Mediano', detail: '≈ 2-3 meses (60-90 días). Perfecto para proyectos con varias fases.', days: 60 },
  largo: { label: 'Largo', detail: '≈ 6+ meses (180 días). Cambios profundos o proyectos extensos.', days: 180 },
};

const GoalIntroScreen: React.FC<Props> = ({ navigation }) => {
  const t = useTheme();
  const [title, setTitle] = useState('');
  const [plazo, setPlazo] = useState<Plazo | null>(null);

  const canContinue = title.trim().length > 0 && plazo !== null;

  const filtered = useMemo(() => {
    const q = title.trim().toLowerCase();
    if (!q) return SUGGESTIONS;
    return SUGGESTIONS.filter(s => s.toLowerCase().includes(q));
  }, [title]);

  const onContinue = () => {
    if (!canContinue || !plazo) return;
    navigation.navigate('GoalProcessing', { title: title.trim(), plazo });
  };

  return (
    <ScrollView style={{ flex:1 }} contentContainerStyle={[styles.container, { backgroundColor: t.bg, minHeight:'100%', paddingBottom:48 }]}>      
      <View style={styles.centeredHeader}>
        <Image source={require('../../assets/plant/logo.png')} style={{ width: 72, height: 72, marginBottom: 8 }} />
        <Text style={[styles.title, { color: t.text }]}>Hola…</Text>
        <Text style={[styles.subtitle, { color: t.textDim }]}>Comencemos a fijar tu meta</Text>
      </View>

      <Text style={[styles.label, { color: t.textDim }]}>Escribe tu meta</Text>
      <TextInput
        style={[styles.input, { backgroundColor: t.card, color: t.text, borderColor: t.border }]}
        placeholder="Ej. Terminar mi tesis de marketing"
        placeholderTextColor={t.textDim}
        value={title}
        onChangeText={setTitle}
      />

      <View style={styles.suggestions}>
        {filtered.map(s => (
          <TouchableOpacity key={s} onPress={() => setTitle(s)} style={[styles.suggestion, { backgroundColor: t.card, borderColor: t.border }]}> 
            <Text style={{ color: t.text }}>{s}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={[styles.label, { color: t.textDim, marginTop: 12 }]}>Escoge el plazo</Text>
      <View style={styles.row}>
        {(Object.keys(PLAZO_DESC) as Plazo[]).map(p => {
          const active = plazo === p;
          return (
            <TouchableOpacity key={p} onPress={() => setPlazo(p)} style={[styles.pill, { backgroundColor: active ? t.primary : t.card, borderColor: active ? t.primaryAlt : t.border, borderWidth: 1 }]}> 
              <Text style={{ color: active ? '#fff' : t.text, fontWeight: '700' }}>{PLAZO_DESC[p].label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
      {plazo && (
        <View style={[styles.descBox, { backgroundColor: t.card, borderColor: t.border, borderWidth: 1 }]}> 
          <Text style={{ color: t.text }}>{PLAZO_DESC[plazo].detail}</Text>
        </View>
      )}

      <TouchableOpacity disabled={!canContinue} onPress={onContinue} style={[styles.btn, { backgroundColor: canContinue ? t.primary : t.border, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 12, shadowOffset: { width: 0, height: 6 }, elevation: 4 }]}>
        <Text style={styles.btnText}>Fijar objetivo</Text>
      </TouchableOpacity>

      {/* Efecto inferior decorativo */}
      <LinearGradient
        colors={[t.primary + '22', t.primary + '00']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.bottomEffect}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, justifyContent: 'center' },
  centeredHeader: { alignItems: 'center', marginBottom: 16 },
  title: { fontSize: 28, fontFamily: 'Inter_800ExtraBold' },
  subtitle: { fontSize: 16, marginBottom: 12, fontFamily: 'Inter_400Regular' },
  label: { fontSize: 14, marginBottom: 6 },
  input: { borderRadius: 16, paddingHorizontal: 16, paddingVertical: 14, borderWidth: 1, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 8, shadowOffset: { width: 0, height: 2 } },
  suggestions: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginTop: 8 },
  suggestion: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 999, borderWidth: 1 },
  row: { flexDirection: 'row', gap: 8, marginTop: 8, justifyContent: 'center' },
  pill: { paddingHorizontal: 16, paddingVertical: 12, borderRadius: 20 },
  descBox: { marginTop: 10, padding: 12, borderRadius: 14 },
  btn: { marginTop: 18, padding: 16, borderRadius: 14, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '700' }
  ,bottomEffect: { position: 'absolute', left: 0, right: 0, bottom: 0, height: 160, opacity: 0.7 }
});

export default GoalIntroScreen;

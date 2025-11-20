import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingParamList } from '../../navigation/OnboardingStack';
import { useTheme } from '../../theme/ThemeContext';
import { useAppFlow } from '../../context/AppFlowContext';

 type Props = NativeStackScreenProps<OnboardingParamList, 'GoalConfirm'>;

const PLAZO_DESC: Record<'corto'|'mediano'|'largo', string> = {
  corto: 'Plazo corto · enfoque intenso en las próximas 2 semanas.',
  mediano: 'Plazo mediano · progreso constante por 2-3 meses.',
  largo: 'Plazo largo · proyecto de largo aliento (6+ meses).',
};

const GoalConfirmScreen: React.FC<Props> = ({ route }) => {
  const t = useTheme();
  const { setOnboarded } = useAppFlow();
  const { title, plazo } = route.params;
  const goHome = async () => { await setOnboarded(true); };

  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>      
      <Text style={[styles.title, { color: t.text }]}>¡Tu nueva meta está lista!</Text>
      <Text style={[styles.desc, { color: t.textDim }]}>Tu meta "{title}" ha sido configurada. {PLAZO_DESC[plazo]}</Text>
      <TouchableOpacity onPress={goHome} style={[styles.btn, { backgroundColor: t.primary }]}>
        <Text style={styles.btnText}>Ir al Home</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 22, marginBottom: 8, fontFamily: 'Inter_800ExtraBold' },
  desc: { textAlign: 'center', marginBottom: 16 },
  btn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  btnText: { color: '#fff', fontWeight: '700' }
});

export default GoalConfirmScreen;

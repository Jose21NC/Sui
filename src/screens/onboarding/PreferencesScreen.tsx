import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
// @deprecated en nuevo flujo; se mantiene por compatibilidad
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingParamList } from '../../navigation/OnboardingStack';
import { useTheme } from '../../theme/ThemeContext';

type Props = any;

const PreferencesScreen: React.FC<Props> = ({ navigation }) => {
  const t = useTheme();
  const finish = async () => {
    // Marca como completo vía contexto para re-renderizar root
    const { setOnboarded } = (await import('../../context/AppFlowContext')).useAppFlow();
    // Nota: como hooks no pueden usarse dentro de callbacks asíncronos arbitrarios,
    // reescribimos usando un wrapper en componente (ver abajo)
  };
  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>      
      <Text style={[styles.title, { color: t.text }]}>Preferencias</Text>
      <Text style={[styles.desc, { color: t.textDim }]}>Puedes cambiar estas preferencias más adelante.</Text>
      <TouchableOpacity style={[styles.btn, { backgroundColor: t.primary }]} onPress={finish}><Text style={styles.btnText}>Finalizar</Text></TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 22, marginBottom: 8, fontFamily: 'Inter_600SemiBold' },
  desc: { textAlign: 'center', marginBottom: 16 },
  btn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  btnText: { color: '#fff', fontWeight: '700' }
});

import { useAppFlow } from '../../context/AppFlowContext';

const PreferencesScreenWithFlow: React.FC<Props> = (props) => {
  const t = useTheme();
  const { setOnboarded } = useAppFlow();
  const finish = async () => { await setOnboarded(true); };
  return <PreferencesScreenUI {...props} tColors={t} onFinish={finish} />;
};

const PreferencesScreenUI: React.FC<Props & { tColors: ReturnType<typeof useTheme>; onFinish: ()=>void }> = ({ tColors: t, onFinish }) => {
  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>      
      <Text style={[styles.title, { color: t.text }]}>Preferencias</Text>
      <Text style={[styles.desc, { color: t.textDim }]}>Puedes cambiar estas preferencias más adelante.</Text>
      <TouchableOpacity style={[styles.btn, { backgroundColor: t.primary }]} onPress={onFinish}><Text style={styles.btnText}>Finalizar</Text></TouchableOpacity>
    </View>
  );
};

export default PreferencesScreenWithFlow;

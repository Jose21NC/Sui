import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingParamList } from '../../navigation/OnboardingStack';
import { useTheme } from '../../theme/ThemeContext';

type Props = NativeStackScreenProps<OnboardingParamList, 'Welcome'>;

const WelcomeScreen: React.FC<Props> = ({ navigation }) => {
  const t = useTheme();
  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>      
      <Text style={[styles.title, { color: t.text }]}>Bienvenido a Sui</Text>
      <Text style={[styles.desc, { color: t.textDim }]}>Tu asistente para hábitos y salud. Configuraremos tus metas para ayudarte día a día.</Text>
      <TouchableOpacity style={[styles.btn, { backgroundColor: t.primary }]} onPress={() => navigation.replace('Objective')}>
        <Text style={styles.btnText}>Comenzar</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, marginBottom: 12, fontFamily: 'Inter_800ExtraBold' },
  desc: { fontSize: 16, textAlign: 'center', marginBottom: 24, fontFamily: 'Inter_400Regular' },
  btn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  btnText: { color: '#fff', fontWeight: '700' }
});

export default WelcomeScreen;

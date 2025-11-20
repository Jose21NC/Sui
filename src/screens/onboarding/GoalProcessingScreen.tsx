import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { OnboardingParamList } from '../../navigation/OnboardingStack';
import { useTheme } from '../../theme/ThemeContext';
import { useGoals } from '../../context/GoalsContext';
import { LinearGradient } from 'expo-linear-gradient';

 type Props = NativeStackScreenProps<OnboardingParamList, 'GoalProcessing'>;

const STEPS = (
  goal: string,
) => [
  `Comprendiendo tu meta: "${goal}"…`,
  'Adaptándola a tu perfil…',
  'Dividiéndola en pasos diarios…',
  'Ajustando el plan para mantenerte motivado…',
];

const mapPlazoToDays = (p: 'corto'|'mediano'|'largo') => p === 'corto' ? 14 : p === 'mediano' ? 60 : 180;

const GoalProcessingScreen: React.FC<Props> = ({ route, navigation }) => {
  const t = useTheme();
  const { chooseObjective } = useGoals();
  const { title, plazo } = route.params;
  const [progress, setProgress] = useState(0);
  const [step, setStep] = useState(0);
  const timerRef = useRef<any>(null);

  useEffect(() => {
    // Persistimos el objetivo mientras mostramos el progreso
    (async () => {
      await chooseObjective({ id: 'study', title: `Estudio: ${title}`, description: 'Plan personalizado de estudio orientado a tu meta.' }, mapPlazoToDays(plazo));
    })();

    const steps = STEPS(title);
    const totalMs = 5000;
    const tickMs = 100; // 50 ticks
    const totalTicks = totalMs / tickMs;
    let ticks = 0;
    timerRef.current = setInterval(() => {
      ticks++;
      const p = Math.min(1, ticks / totalTicks);
      setProgress(p);
      const idx = Math.min(steps.length - 1, Math.floor((ticks / totalTicks) * steps.length));
      setStep(idx);
      if (p >= 1) {
        clearInterval(timerRef.current);
        setTimeout(() => {
          navigation.replace('GoalConfirm', { title, plazo });
        }, 300);
      }
    }, tickMs);
    return () => timerRef.current && clearInterval(timerRef.current);
  }, [title, plazo]);

  const steps = STEPS(title);

  const gradientColors = ['#A78BFA', '#60A5FA', '#34D399'] as const;
  return (
    <View style={[styles.container, { backgroundColor: t.bg }]}>      
      <Text style={[styles.title, { color: t.text }]}>Preparando tu plan…</Text>
      <Text style={[styles.step, { color: t.textDim }]}>{steps[step]}</Text>
      <View style={{ marginTop: 16, width: '86%' }}>
        <View style={[styles.track, { backgroundColor: t.card }]}> 
          <View style={[styles.fill, { width: `${Math.round(progress*100)}%` }]}> 
            <LinearGradient colors={gradientColors} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={StyleSheet.absoluteFillObject as any} />
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  title: { fontSize: 22, marginBottom: 8, fontFamily: 'Inter_600SemiBold' },
  step: { fontSize: 16, textAlign: 'center' },
  track: { height: 14, borderRadius: 999, overflow: 'hidden' },
  fill: { height: '100%' }
});

export default GoalProcessingScreen;

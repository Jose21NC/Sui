import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Animated } from 'react-native';
import { useTheme } from '../theme/ThemeContext';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import ProgressBar from '../components/ui/ProgressBar';
import { useGoals } from '../context/GoalsContext';
import TopBar from '../components/ui/TopBar';
import { useAuth } from '../context/AuthContext';
import { generateAssistantReply } from '../services/gemini';
import PlantProgress from '../components/gamification/PlantProgress';
import SimpleMenu from '../components/ui/SimpleMenu';
import { useFadeIn } from '../hooks/useFadeIn';
import { useNavigation, useIsFocused } from '@react-navigation/native';

const GoalsScreen: React.FC = () => {
  const t = useTheme();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigation = useNavigation<any>();
  const goals = useGoals();

  const today = new Date();
  const todayStr = today.toISOString().slice(0,10);
  const startDate = goals.startDate ? new Date(goals.startDate) : undefined;
  const totalDays = goals.durationDays ?? 0;
  const completed = goals.tasks.filter(x => x.completed).length;
  const progress = totalDays > 0 ? completed / totalDays : 0;
  const todayTask = goals.tasks.find(x => x.date === todayStr);
  const upcoming = useMemo(() => goals.tasks.filter(x => x.date > todayStr).slice(0,3), [goals.tasks, todayStr]);

  const daysLeft = useMemo(() => {
    if (!startDate || !totalDays) return 0;
    const start = new Date(startDate.toISOString().slice(0,10)).getTime();
    const cur = new Date(todayStr).getTime();
    const dayNumber = Math.floor((cur - start) / (1000*60*60*24)) + 1;
    return Math.max(0, totalDays - dayNumber);
  }, [startDate, totalDays, todayStr]);

  const emoji = goals.selected?.id === 'study' ? '📚' : goals.selected?.id === 'exercise' ? '🏃‍♂️' : goals.selected?.id === 'digital_detox' ? '📵' : '🎯';

  const tips: string[] = useMemo(() => {
    switch (goals.selected?.id) {
      case 'study':
        return ['Prepara un bloque de 25 min (Pomodoro).','Anota 1 objetivo específico de la sesión.','Cierra notificaciones por 30 min.'];
      case 'exercise':
        return ['5 min de calentamiento y movilidad.','Mantén ritmo conversacional (zona 2).','Estiramiento suave al terminar.'];
      case 'digital_detox':
        return ['Activa “No molestar”.','Deja el móvil fuera de la habitación.','Define 2 ventanas para revisar redes.'];
      default:
        return ['Define un objetivo claro.','Divide en pasos diarios pequeños.','Revisa tu progreso al final del día.'];
    }
  }, [goals.selected?.id]);

  const onExplainTask = async (desc: string) => {
    try {
      const namePart = user?.name ? `Mi nombre es ${user.name}. ` : '';
      const prompt = `${namePart}Explícame esta tarea con pasos claros: ${desc}`;
      const res = await generateAssistantReply(prompt);
      Alert.alert('IA', res.text);
    } catch (e: any) {
      // Fallback local para que el botón siempre responda
      Alert.alert('IA', `Resumen rápido en 3 pasos:\n• Divide la tarea en 2-3 subpasos.\n• Reserva 20-30 min sin distracciones.\n• Al terminar, anota 1 aprendizaje.\n\nTarea: ${desc}`);
    }
  };

  const opacity = useFadeIn();
  const isFocused = useIsFocused();
  const focusAnim = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.timing(focusAnim, { toValue: isFocused ? 1 : 0, duration: isFocused ? 260 : 140, useNativeDriver: true }).start();
  }, [isFocused]);

  // Cronómetro hasta la próxima tarea (6:00 AM del día siguiente)
  const [countdown, setCountdown] = useState<string>('');
  const nextSixAM = () => {
    const n = new Date();
    const next = new Date(n);
    next.setDate(n.getDate() + 1);
    next.setHours(6, 0, 0, 0);
    return next;
  };
  useEffect(() => {
    let timer: any;
    if (todayTask?.completed) {
      const tick = () => {
        const now = new Date().getTime();
        const target = nextSixAM().getTime();
        const diff = Math.max(0, target - now);
        const h = Math.floor(diff / 3600000);
        const m = Math.floor((diff % 3600000) / 60000);
        const s = Math.floor((diff % 60000) / 1000);
        setCountdown(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`);
      };
      tick();
      timer = setInterval(tick, 1000);
    } else {
      setCountdown('');
    }
    return () => timer && clearInterval(timer);
  }, [todayTask?.completed]);
  return (
    <Animated.ScrollView style={[styles.container, { backgroundColor: t.bg }, { opacity }, { opacity: focusAnim, transform: [{ scale: focusAnim.interpolate({ inputRange: [0,1], outputRange: [0.97,1] }) }] } ] } contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ paddingBottom: 24 }}>
  <TopBar title={user?.name ? `Metas · ${user.name}` : 'Metas'} onMenuPress={() => setMenuOpen(true)} />

      <Card>
        <Text style={{ color: t.text, fontFamily: 'Inter_800ExtraBold', fontSize: 18 }}>
          {emoji} {goals.selected?.title ?? 'Sin objetivo definido'}
        </Text>
        {goals.selected && (
          <Text style={{ color: t.textDim, marginTop: 4 }}>{goals.selected.description}</Text>
        )}
        <View style={{ height: 12 }} />
        <ProgressBar value={progress} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 8 }}>
          <Text style={{ color: t.textDim }}>Completado: {Math.round(progress*100)}%</Text>
          <Text style={{ color: t.textDim }}>Quedan {daysLeft} días</Text>
        </View>
        <View style={{ height: 14 }} />
  <PlantProgress todayCompleted={!!todayTask?.completed} userId={user?.email || user?.name} onTripleTap={goals.resetToday} />
      </Card>
      <SimpleMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        items={[
          { label: 'Mi perfil', onPress: () => navigation.navigate('Profile') },
          { label: 'Fuentes de datos', onPress: () => navigation.navigate('DataSources') },
          { label: 'Cerrar sesión', onPress: async () => { await logout(); } },
        ]}
      />

      <View style={{ height: 12 }} />

      <Card>
        <Text style={{ color: t.text, fontFamily: 'Inter_600SemiBold', marginBottom: 8 }}>Tarea de hoy</Text>
        {todayTask ? (
          !todayTask.completed ? (
            <>
              <Text style={{ color: t.textDim, marginBottom: 10 }}>{todayTask.description}</Text>
              <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
                <Button title={'Marcar como hecha'} onPress={goals.completeToday} variant={'primary'} />
                <TouchableOpacity onPress={() => onExplainTask(todayTask.description)} style={{ paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10, borderWidth: 1, borderColor: t.border }}>
                  <Text style={{ color: t.text }}>¿Cómo lo hago?</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : (
            <>
              <Text style={{ color: t.textDim, marginBottom: 10 }}>{todayTask.description}</Text>
              <View style={{ padding: 12, borderRadius: 12, backgroundColor: t.card, borderWidth: 1, borderColor: t.border }}>
                <Text style={{ color: t.text, fontFamily: 'Inter_600SemiBold' }}>¡Vuelve mañana a las 6:00!</Text>
                <Text style={{ color: t.textDim, marginTop: 4 }}>Próxima tarea en {countdown}</Text>
              </View>
            </>
          )
        ) : (
          <Text style={{ color: t.textDim }}>No hay tarea generada para hoy.</Text>
        )}
      </Card>

      <View style={{ height: 12 }} />

      <Card>
        <Text style={{ color: t.text, fontFamily: 'Inter_600SemiBold', marginBottom: 8 }}>Próximas</Text>
        {upcoming.length === 0 && <Text style={{ color: t.textDim }}>Sin tareas próximas.</Text>}
        {upcoming.map((tItem) => {
          const d = new Date(tItem.date);
          const label = d.toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });
          return (
            <View key={tItem.date} style={{ paddingVertical: 8, borderTopWidth: 1, borderTopColor: t.border }}>
              <Text style={{ color: t.text, fontFamily: 'Inter_600SemiBold' }}>{label}</Text>
              <Text style={{ color: t.textDim, marginBottom: 6 }}>{tItem.description}</Text>
              <TouchableOpacity onPress={() => onExplainTask(tItem.description)} style={{ alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: t.border }}>
                <Text style={{ color: t.text }}>Saber más</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </Card>

      <View style={{ height: 12 }} />

      <Card>
        <Text style={{ color: t.text, fontFamily: 'Inter_600SemiBold', marginBottom: 8 }}>Consejos para hoy</Text>
        {tips.map((tip, i) => (
          <Text key={i} style={{ color: t.textDim, marginBottom: 4 }}>• {tip}</Text>
        ))}
      </Card>
    </Animated.ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 26, fontFamily: 'Inter_800ExtraBold', marginBottom: 12 },
  goalRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  label: { flex: 1 },
  input: { padding: 8, borderRadius: 8, width: 120, textAlign: 'center' },
});

export default GoalsScreen;

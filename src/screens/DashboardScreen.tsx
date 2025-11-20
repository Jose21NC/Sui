import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Animated } from 'react-native';
import { useMetrics } from '../context/MetricsContext';
import MetricCard from '../components/MetricCard';
import TrendChart from '../components/TrendChart';
import ErrorBoundary from '../components/ErrorBoundary';
import { useTheme } from '../theme/ThemeContext';
import { useGoals } from '../context/GoalsContext';
// Reemplazado por botones Hoy/Histórico con selector de fecha
import Card from '../components/ui/Card';
import ProgressBar from '../components/ui/ProgressBar';
import TopBar from '../components/ui/TopBar';
import { useAuth } from '../context/AuthContext';
import { generateAssistantReply } from '../services/gemini';
import { elev } from '../theme/shadow';
import SimpleMenu from '../components/ui/SimpleMenu';
import { useFadeIn } from '../hooks/useFadeIn';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import WidgetsModal, { WidgetsState, loadWidgets, getDefaultWidgetsForObjective, WIDGETS_META } from '../components/ui/WidgetsModal';
import { buildMetricsContext } from '../services/promptContext';
import { generateSnapshotForDate, generateSeriesForKey } from '../services/metricsSimulation';
import CalendarPickerModal from '../components/ui/CalendarPickerModal';

const DashboardScreen: React.FC = () => {
  const { current, history, suggestions, goals: healthGoals } = useMetrics();
  const goals = useGoals();
  const tasks = goals.tasks || [];
  // Modo de visualización
  const [mode, setMode] = React.useState<'today' | 'history'>('today');
  const [datePickerOpen, setDatePickerOpen] = React.useState(false);
  const [selectedDate, setSelectedDate] = React.useState<string | undefined>(undefined);
  const [historicalSnapshot, setHistoricalSnapshot] = React.useState<any | undefined>(undefined);

  const t = useTheme();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = React.useState(false);
  const opacity = useFadeIn();
  const isFocused = useIsFocused();
  const focusAnim = React.useRef(new Animated.Value(0)).current;
  React.useEffect(() => {
    Animated.timing(focusAnim, { toValue: isFocused ? 1 : 0, duration: isFocused ? 260 : 140, useNativeDriver: true }).start();
  }, [isFocused]);
  const navigation = useNavigation<any>();
  const [widgets, setWidgets] = React.useState<WidgetsState>({
    steps: true,
    heartRate: true,
    calories: true,
    waterMl: true,
    distanceKm: false,
    uvIndex: false,
    calorieIntake: false,
    screenTimeMin: false,
    sleepHours: false,
    stressLevel: false,
    bloodPressure: false,
    glucose: false,
    activityMinutes: false,
    sleepQuality: false
  });
  const [widgetsOpen, setWidgetsOpen] = React.useState(false);
  React.useEffect(() => { (async () => {
    // Selección automática según objetivo
    if (goals.selected?.id) {
      setWidgets(getDefaultWidgetsForObjective(goals.selected.id));
    } else {
      setWidgets(await loadWidgets());
    }
  })(); }, [goals.selected?.id]);

  // Datos de vista según modo
  const viewCurrent: any = mode === 'history' && historicalSnapshot ? historicalSnapshot : current;
  const getSeries = (key: string) => {
    if (mode === 'history' && selectedDate) return generateSeriesForKey(selectedDate, key as any, 20);
    return history.map(h => {
      const v: any = (h as any)[key];
      if (typeof v === 'number') return v; if (v && typeof v === 'object' && 'value' in v) return v.value; return 0;
    }).reverse();
  };
  const stepsTrend = getSeries('steps');
  const hrTrend = getSeries('heartRate');
  const onExplainTask = async (desc: string) => {
    // Prompt enriquecido con perfil y objetivo
    const datos = [
      user?.name ? `Nombre: ${user.name}` : '',
      user?.age ? `Edad: ${user.age}` : '',
      user?.heightCm ? `Estatura: ${user.heightCm} cm` : '',
      user?.weightKg ? `Peso: ${user.weightKg} kg` : '',
      goals.selected ? `Objetivo: ${goals.selected.title} - ${goals.selected.description}` : '',
    ].filter(Boolean).join('. ');
  const metricsCtx = buildMetricsContext(mode==='history' && historicalSnapshot ? historicalSnapshot : current);
  const prompt = `Actúa como un coach amable y muy conciso. Reglas: máximo 3-4 oraciones, sin resúmenes extra ni información no solicitada. Usa métricas solo si añaden claridad a la tarea.\nContexto privado (no listar explícitamente): ${metricsCtx}.\nPerfil: ${datos}.\nTarea: ${desc}.\nDa pasos claros y breves para realizarla.`;
    const res = await generateAssistantReply(prompt);
    Alert.alert('IA', res.text);
  };
  return (
  <Animated.ScrollView style={[styles.container, { backgroundColor: t.bg }, { opacity: opacity }, { opacity: focusAnim, transform: [{ scale: focusAnim.interpolate({ inputRange: [0,1], outputRange: [0.97,1] }) }] }]} contentInsetAdjustmentBehavior="automatic" contentContainerStyle={{ paddingBottom: 24 }}>
  <TopBar title={user?.name ? `Hola, ${user.name}` : 'Resumen'} onMenuPress={() => setMenuOpen(true)} />
    <View style={{ height: 8 }} />
      <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center', justifyContent: 'center', marginBottom: 4 }}>
        <TouchableOpacity onPress={() => { setMode('today'); setSelectedDate(undefined); setHistoricalSnapshot(undefined); }} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: mode==='today'? t.primary : t.border, backgroundColor: mode==='today'? t.primary : 'transparent' }}>
          <Text style={{ color: mode==='today'? '#fff' : t.text }}>Hoy</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { setMode('history'); setDatePickerOpen(true); }} style={{ paddingHorizontal: 12, paddingVertical: 8, borderRadius: 999, borderWidth: 1, borderColor: mode==='history'? t.primary : t.border, backgroundColor: mode==='history'? t.primary : 'transparent' }}>
          <Text style={{ color: mode==='history'? '#fff' : t.text }}>Histórico</Text>
        </TouchableOpacity>
      </View>
      {mode==='history' && selectedDate && (
        <Text style={{ textAlign: 'center', color: t.textDim, marginBottom: 8 }}>
          {new Date(selectedDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
        </Text>
      )}
      <View style={{ height: 12 }} />
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'flex-start' }}>
        {WIDGETS_META.filter(w => widgets[w.key]).map(w => {
          const value = viewCurrent[w.key];
          // Unidades
          const units: Record<string, string> = {
            steps: '', heartRate: 'bpm', calories: 'kcal', waterMl: 'ml', distanceKm: 'km', uvIndex: '', calorieIntake: 'kcal', screenTimeMin: 'h', sleepHours: 'h', stressLevel: '', bloodPressure: 'mmHg', glucose: 'mg/dL', activityMinutes: 'min', sleepQuality: '%'
          };
          if (w.type === 'card') {
            if (w.key === 'stressLevel' && value && typeof value === 'object' && 'word' in value) {
              return (
                <Card key={w.key} style={{ flexBasis: '47%', marginBottom: 12, alignItems: 'center', paddingVertical: 18 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                    <Text style={{ fontSize: 18, fontFamily: 'Inter_600SemiBold', color: t.text }}>{w.label}</Text>
                  </View>
                  <View style={{ backgroundColor: value.color, borderRadius: 8, paddingHorizontal: 16, paddingVertical: 8, marginTop: 8 }}>
                    <Text style={{ fontSize: 20, fontFamily: 'Inter_800ExtraBold', color: '#fff' }}>{value.word}</Text>
                  </View>
                </Card>
              );
            }
            if (w.key === 'bloodPressure' && value && typeof value === 'object' && 'sys' in value) {
              return (
                <Card key={w.key} style={{ flexBasis: '47%', marginBottom: 12, alignItems: 'center', paddingVertical: 18 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                    <Text style={{ fontSize: 18, fontFamily: 'Inter_600SemiBold', color: t.text }}>{w.label}</Text>
                    <Text style={{ fontSize: 16, color: t.textDim, marginLeft: 8 }}>{units[w.key]}</Text>
                  </View>
                  <Text style={{ fontSize: 32, fontFamily: 'Inter_800ExtraBold', color: t.primary }}>{value.sys}/{value.dia}</Text>
                </Card>
              );
            }
            // Formateo especial para decimales y valores
            let displayValue = '-';
            if (typeof value === 'number') {
              if (w.key === 'distanceKm') displayValue = value.toFixed(2);
              else if (w.key === 'sleepQuality') displayValue = Math.round(value) + '%';
              else if (w.key === 'screenTimeMin') displayValue = Math.round(value) + ' min';
              else if (w.key === 'calorieIntake') displayValue = Math.round(value) + ' kcal';
              else displayValue = Math.round(value).toString();
            }
            // Etiqueta para índice UV
            let uvPill: React.ReactNode = null;
            if (w.key === 'uvIndex' && typeof value === 'number') {
              const uv = value;
              const uvInfo = uv <= 2 ? { text: 'Bajo', color: '#22C55E' }
                : uv <= 5 ? { text: 'Moderado', color: '#FACC15' }
                : uv <= 7 ? { text: 'Alto', color: '#F59E0B' }
                : uv <= 10 ? { text: 'Muy alto', color: '#EF4444' }
                : { text: 'Extremo', color: '#7C3AED' };
              uvPill = (
                <View style={{ backgroundColor: uvInfo.color + '22', borderColor: uvInfo.color, borderWidth: 1, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999, marginTop: 8 }}>
                  <Text style={{ color: uvInfo.color, fontWeight: '700' }}>{uvInfo.text}</Text>
                </View>
              );
            }
            return (
              <Card key={w.key} style={{ flexBasis: '47%', marginBottom: 12, alignItems: 'center', paddingVertical: 18 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 6 }}>
                  <Text style={{ fontSize: 18, fontFamily: 'Inter_600SemiBold', color: t.text }}>{w.label}</Text>
                  <View style={{ marginLeft: 8 }} />
                  <Text style={{ fontSize: 16, color: t.textDim }}>{units[w.key]}</Text>
                </View>
                <Text style={{ fontSize: 32, fontFamily: 'Inter_800ExtraBold', color: t.primary }}>{displayValue}</Text>
                {uvPill}
              </Card>
            );
          }
          if (w.type === 'chart') {
            // Solo números para gráficos
            const hist = getSeries(w.key);
            const chartHeight = w.key === 'sleepQuality' ? 120 : 160;
            return (
              <Card key={w.key} style={{ flexBasis: '100%', marginBottom: 12, padding: 12 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <Text style={{ fontSize: 18, fontFamily: 'Inter_600SemiBold', color: t.text }}>{w.label}</Text>
                  <Text style={{ fontSize: 16, color: t.textDim, marginLeft: 8 }}>{units[w.key]}</Text>
                </View>
                <TrendChart data={hist} label={w.label} height={chartHeight} hideTitle embedded />
                <Text style={{ fontSize: 20, color: t.primary, fontFamily: 'Inter_800ExtraBold', marginTop: 4 }}>
                  {typeof hist[hist.length - 1] === 'number' ? (w.key === 'distanceKm' ? (hist[hist.length - 1] as number).toFixed(2) : hist[hist.length - 1]) : '-'}
                </Text>
              </Card>
            );
          }
          if (w.type === 'histogram') {
            // Solo números para barras y escalar a la altura del contenedor
            const series = getSeries(w.key).slice(-10);
            const containerH = 60;
            const maxVal = Math.max(1, ...series.map(v => (typeof v === 'number' ? v : 0)));
            // Compactar algunas tarjetas de histograma para que quepan junto a otras
            const compact = w.key === 'sleepQuality' || w.key === 'calorieIntake';
            // Utilidad simple para aclarar/oscurecer el color primario en la misma gama
            const shade = (hex: string, f: number) => {
              // f en [0..1], 0 = muy claro, 1 = color base
              const c = hex.replace('#','');
              const r = parseInt(c.substring(0,2),16);
              const g = parseInt(c.substring(2,4),16);
              const b = parseInt(c.substring(4,6),16);
              const mix = (ch: number) => Math.round((255*(1-f)) + (ch*f));
              const rr = mix(r).toString(16).padStart(2,'0');
              const gg = mix(g).toString(16).padStart(2,'0');
              const bb = mix(b).toString(16).padStart(2,'0');
              return `#${rr}${gg}${bb}`;
            };
            return (
              <Card key={w.key} style={{ flexBasis: compact ? '47%' : '100%', marginBottom: 12, padding: 12, alignItems: 'center', alignSelf: 'center', width: compact ? undefined : '92%' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 4 }}>
                  <Text style={{ fontSize: 18, fontFamily: 'Inter_600SemiBold', color: t.text }}>{w.label}</Text>
                  <Text style={{ fontSize: 16, color: t.textDim, marginLeft: 8 }}>{units[w.key]}</Text>
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', height: containerH, marginTop: 8, overflow: 'hidden', width: '100%', paddingHorizontal: 4 }}>
                  {series.map((v, i) => {
                    const n = typeof v === 'number' ? v : 0;
                    const h = Math.max(6, Math.round((n / maxVal) * (containerH - 6)));
                    const f = maxVal === 0 ? 0.5 : Math.min(1, Math.max(0.25, n / maxVal));
                    const barColor = shade(t.primary, f);
                    return <View key={i} style={{ width: 10, height: h, backgroundColor: barColor, marginHorizontal: 2, borderRadius: 6 }} />;
                  })}
                </View>
                <Text style={{ fontSize: 20, color: t.primary, fontFamily: 'Inter_800ExtraBold', marginTop: 6, textAlign: 'center' }}>
                  {(() => {
                    const last = typeof series[series.length - 1] === 'number' ? (series[series.length - 1] as number) : undefined;
                    if (last == null) return '-';
                    if (w.key === 'screenTimeMin') return (last / 60).toFixed(1) + ' h';
                    if (w.key === 'sleepQuality') return Math.round(last) + ' %';
                    return Math.round(last).toString();
                  })()}
                </Text>
              </Card>
            );
          }
          return null;
        })}
      </View>

      {/* Progreso hacia metas */}
      <Card style={{ marginTop: 12 }}>
        <Text style={{ color: t.text, fontFamily: 'Inter_600SemiBold', marginBottom: 8 }}>Progreso de hoy</Text>
        <Text style={{ color: t.textDim, marginBottom: 6 }}>Pasos</Text>
  <ProgressBar value={current.steps / Math.max(1, healthGoals.steps)} />
        <View style={{ height: 8 }} />
        <Text style={{ color: t.textDim, marginBottom: 6 }}>Agua</Text>
  <ProgressBar value={current.waterMl / Math.max(1, healthGoals.waterMl)} color="#22C55E" />
      </Card>

      <ErrorBoundary fallbackText="No se pudo mostrar la gráfica de pasos.">
        <TrendChart data={stepsTrend} label={mode==='history' ? 'Tendencia (día seleccionado)' : 'Tendencia Pasos'} />
      </ErrorBoundary>
      <ErrorBoundary fallbackText="No se pudo mostrar la gráfica de ritmo.">
        <TrendChart data={hrTrend} label={mode==='history' ? 'Ritmo (día seleccionado)' : 'Tendencia Ritmo'} />
      </ErrorBoundary>

      {/* Tarea del día resumen */}
      {tasks.length > 0 && tasks.find(t => t.date === new Date().toISOString().slice(0,10)) && (
        <View style={[styles.suggestions, { backgroundColor: t.card }]}> 
          <Text style={[styles.subTitle, { color: t.text }]}>Tarea de hoy</Text>
          <Text style={{ color: t.textDim, marginBottom: 8 }}>
            {tasks.find(t => t.date === new Date().toISOString().slice(0,10))?.description}
          </Text>
          <TouchableOpacity onPress={() => onExplainTask(tasks.find(t => t.date === new Date().toISOString().slice(0,10))!.description)} style={{ alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 8, borderWidth: 1, borderColor: t.border }}>
            <Text style={{ color: t.text }}>¿Cómo lo hago?</Text>
          </TouchableOpacity>
        </View>
      )}

  <View style={[styles.suggestions, { backgroundColor: t.card, borderWidth: 1, borderColor: t.border }, elev(3) as any]}> 
        <Text style={[styles.subTitle, { color: t.text }]}>Sugerencias IA</Text>
        {suggestions.map((s,i) => <Text key={i} style={[styles.suggestion, { color: t.textDim }]}>• {s}</Text>)}
        {suggestions.length === 0 && <Text style={styles.placeholder}>Generando sugerencias...</Text>}
      </View>
      <SimpleMenu
        visible={menuOpen}
        onClose={() => setMenuOpen(false)}
        items={[ 
          { label: 'Mi perfil', onPress: () => navigation.navigate('Profile') },
          { label: 'Editar widgets', onPress: () => setWidgetsOpen(true) },
          { label: 'Fuentes de datos', onPress: () => navigation.navigate('DataSources') },
          { label: 'Cerrar sesión', onPress: async () => { await logout(); } },
        ]}
      />
      <WidgetsModal visible={widgetsOpen} onClose={() => setWidgetsOpen(false)} onApply={setWidgets} current={widgets} />
      <CalendarPickerModal
        visible={datePickerOpen}
        onClose={() => setDatePickerOpen(false)}
        onSelect={(iso) => { setSelectedDate(iso); setHistoricalSnapshot(generateSnapshotForDate(iso)); setDatePickerOpen(false); }}
        maxDays={90}
      />
    </Animated.ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  title: { fontSize: 26, marginBottom: 12, fontFamily: 'Inter_800ExtraBold' },
  segmentRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  segment: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1 },
  subTitle: { fontSize: 18, marginBottom: 8, fontFamily: 'Inter_600SemiBold' },
  suggestions: { marginTop: 20, padding: 16, borderRadius: 16 },
  suggestion: { marginBottom: 4 },
  placeholder: { color: '#666', fontStyle: 'italic' },
});

export default DashboardScreen;

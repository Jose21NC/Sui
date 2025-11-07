import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, Switch, StyleSheet, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../../theme/ThemeContext';

export type WidgetKey =
  | 'steps'
  | 'heartRate'
  | 'calories'
  | 'waterMl'
  | 'distanceKm'
  | 'uvIndex'
  | 'calorieIntake'
  | 'screenTimeMin'
  | 'sleepHours'
  | 'stressLevel'
  | 'bloodPressure'
  | 'glucose'
  | 'activityMinutes'
  | 'sleepQuality';

export type WidgetsState = Record<WidgetKey, boolean>;

export const DEFAULTS: WidgetsState = {
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
  sleepQuality: false,
};

export async function loadWidgets(): Promise<WidgetsState> {
  const raw = await AsyncStorage.getItem('sui:dashboard:widgets');
  if (!raw) return DEFAULTS;
  try { const parsed = JSON.parse(raw); return { ...DEFAULTS, ...parsed }; } catch { return DEFAULTS; }
}
export async function saveWidgets(state: WidgetsState) {
  await AsyncStorage.setItem('sui:dashboard:widgets', JSON.stringify(state));
}

import Ionicons from '@expo/vector-icons/Ionicons';

export const WIDGETS_META: Array<{ key: WidgetKey; label: string; icon: string; desc: string; type: 'card'|'chart'|'histogram' }>= [
  { key: 'steps', label: 'Pasos', icon: 'walk-outline', desc: 'Cantidad de pasos diarios.', type: 'card' },
  { key: 'heartRate', label: 'Ritmo cardiaco', icon: 'heart-outline', desc: 'Latidos por minuto.', type: 'card' },
  { key: 'calories', label: 'Calorías', icon: 'flame-outline', desc: 'Calorías quemadas hoy.', type: 'card' },
  { key: 'waterMl', label: 'Agua', icon: 'water-outline', desc: 'Mililitros de agua ingeridos.', type: 'card' },
  { key: 'distanceKm', label: 'Distancia', icon: 'map-outline', desc: 'Kilómetros recorridos.', type: 'chart' },
  { key: 'uvIndex', label: 'Índice UV', icon: 'sunny-outline', desc: 'Exposición solar (UV).', type: 'card' },
  { key: 'calorieIntake', label: 'Ingesta calórica', icon: 'nutrition-outline', desc: 'Calorías ingeridas hoy.', type: 'histogram' },
  { key: 'screenTimeMin', label: 'Tiempo de pantalla', icon: 'phone-portrait-outline', desc: 'Minutos de uso de pantalla.', type: 'histogram' },
  { key: 'sleepHours', label: 'Horas de sueño', icon: 'moon-outline', desc: 'Total de horas dormidas.', type: 'card' },
  { key: 'stressLevel', label: 'Estrés', icon: 'alert-outline', desc: 'Nivel de estrés reportado.', type: 'card' },
  { key: 'bloodPressure', label: 'Presión arterial', icon: 'pulse-outline', desc: 'Presión sistólica/diastólica.', type: 'card' },
  { key: 'glucose', label: 'Glucosa', icon: 'medkit-outline', desc: 'Nivel de glucosa en sangre.', type: 'card' },
  { key: 'activityMinutes', label: 'Minutos de actividad', icon: 'timer-outline', desc: 'Minutos de actividad física.', type: 'chart' },
  { key: 'sleepQuality', label: 'Calidad de sueño', icon: 'cloudy-night-outline', desc: 'Calidad del descanso nocturno.', type: 'histogram' },
];
// Selección automática según objetivo
export function getDefaultWidgetsForObjective(objId?: string): WidgetsState {
  if (objId === 'study') {
    return { ...DEFAULTS, screenTimeMin: true, sleepHours: true, sleepQuality: true };
  }
  if (objId === 'exercise') {
    return { ...DEFAULTS, steps: true, heartRate: true, calories: true, distanceKm: true, activityMinutes: true, waterMl: true };
  }
  if (objId === 'digital_detox') {
    return { ...DEFAULTS, screenTimeMin: true, stressLevel: true, sleepQuality: true };
  }
  return DEFAULTS;
}

const WidgetsModal: React.FC<{ visible: boolean; onClose: () => void; onApply: (state: WidgetsState) => void; current?: WidgetsState }>
= ({ visible, onClose, onApply, current }) => {
  const t = useTheme();
  const [state, setState] = useState<WidgetsState>(current || DEFAULTS);
  useEffect(() => { if (current) setState(current); }, [current]);

  const toggle = (k: WidgetKey) => setState(s => { const n = { ...s, [k]: !s[k] }; return n; });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.backdrop}>
        <View style={[styles.sheet, { backgroundColor: t.card, borderColor: t.border }]}> 
          <Text style={{ color: t.text, fontFamily: 'Inter_600SemiBold', fontSize: 18, marginBottom: 12 }}>Personaliza tu Dashboard</Text>
          <ScrollView style={{ maxHeight: 380 }} contentContainerStyle={{ paddingBottom: 8 }}>
            {WIDGETS_META.map(it => (
              <TouchableOpacity key={it.key} style={[styles.widgetRow, { borderColor: t.border, backgroundColor: state[it.key] ? t.primary + '11' : t.card }]} onPress={() => toggle(it.key)} activeOpacity={0.8}>
                <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                  <Ionicons name={it.icon as any} size={24} color={state[it.key] ? t.primary : t.textDim} style={{ marginRight: 12 }} />
                  <View style={{ flex: 1 }}>
                    <Text style={{ color: t.text, fontFamily: 'Inter_600SemiBold', fontSize: 15 }}>{it.label}</Text>
                    <Text style={{ color: t.textDim, fontSize: 13 }}>{it.desc}</Text>
                  </View>
                </View>
                <View style={[styles.switchWrap, { borderColor: state[it.key] ? t.primary : t.border }] }>
                  <Ionicons name={state[it.key] ? 'checkmark-circle' : 'ellipse-outline'} size={22} color={state[it.key] ? t.primary : t.border} />
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={{ height: 8 }} />
          <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 8 }}>
            <TouchableOpacity onPress={onClose} style={[styles.btn, { borderColor: t.border }]}><Text style={{ color: t.text }}>Cancelar</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => { onApply(state); saveWidgets(state); onClose(); }} style={[styles.btn, { backgroundColor: t.primary }]}><Text style={{ color: '#fff' }}>Aplicar</Text></TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.2)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  sheet: { width: '100%', maxWidth: 420, borderRadius: 14, borderWidth: 1, padding: 14 },
  widgetRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, padding: 12, marginBottom: 10 },
  switchWrap: { borderWidth: 2, borderRadius: 999, padding: 2, marginLeft: 10 },
  btn: { paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, borderWidth: 1 },
});

export default WidgetsModal;

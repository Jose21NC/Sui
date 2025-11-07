import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated, Easing, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ProgressBar from '../ui/ProgressBar';
import { useTheme } from '../../theme/ThemeContext';

function hash(s: string) { let h = 0; for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0; return h; }

const flowerPalette = ['🌸','🌼','🌻','🌺'];

// Stages: 0=semilla,1=brote,2=plantita,3=capullo,4=flor
export type PlantState = { stage: number; water: number; creditedDates: Record<string, boolean> };

const STORAGE_KEY = 'sui:plant';

export const PlantProgress: React.FC<{ todayCompleted?: boolean; userId?: string; onTripleTap?: () => void }>
= ({ todayCompleted, userId, onTripleTap }) => {
  const t = useTheme();
  const [state, setState] = useState<PlantState>({ stage: 0, water: 0, creditedDates: {} });
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const waterAnim = useRef(new Animated.Value(0)).current; // 0..1 para gota
  const today = new Date().toISOString().slice(0,10);

  useEffect(() => { (async () => {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) setState(JSON.parse(raw));
  })(); }, []);

  useEffect(() => { (async () => {
    if (todayCompleted && !state.creditedDates[today]) {
      const next = { ...state, water: Math.min(100, state.water + 25), creditedDates: { ...state.creditedDates, [today]: true } };
      setState(next);
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    }
  })(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [todayCompleted]);

  const flower = useMemo(() => {
    const idx = userId ? hash(userId) % flowerPalette.length : 0;
    return flowerPalette[idx];
  }, [userId]);

  const stageEmoji = state.stage >= 4 ? flower : state.stage === 3 ? '🌿' : state.stage === 2 ? '🌱' : state.stage === 1 ? '🫘' : '🟤';
  const canWater = state.water >= 100;

  // Imágenes reales desde assets (si falta alguna etapa, reusamos la más cercana)
  const stageImages: Record<number, any> = {
    0: require('../../assets/plant/seed.png'),
    1: require('../../assets/plant/sprout.png'),
    2: require('../../assets/plant/small.png'),
    3: require('../../assets/plant/small.png'),
    4: require('../../assets/plant/small.png'),
  };

  const runWaterAnimation = () => {
    waterAnim.setValue(0);
    Animated.timing(waterAnim, { toValue: 1, duration: 900, easing: Easing.out(Easing.quad), useNativeDriver: true }).start();
  };

  const runGrowthAnimation = () => {
    scaleAnim.setValue(0.9);
    Animated.sequence([
      Animated.spring(scaleAnim, { toValue: 1.15, friction: 4, useNativeDriver: true }),
      Animated.spring(scaleAnim, { toValue: 1, friction: 5, useNativeDriver: true })
    ]).start();
  };

  const onWater = async () => {
    if (!canWater) return;
    runWaterAnimation();
    const nextStage = Math.min(4, state.stage + 1);
    const next = { ...state, stage: nextStage, water: 0 };
    setState(next);
    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    // Retrasar la animación de crecimiento hasta casi terminar la gota
    setTimeout(runGrowthAnimation, 650);
  };

  return (
    <View style={[styles.container]}> 
      {/* Canvas animado con imagen por etapa */}
      <View style={styles.canvas}>
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
          <TouchableOpacity activeOpacity={0.8} onPress={() => {
            // Detección simple de triple toque en 500ms
            const now = Date.now();
            // @ts-ignore
            if (!state.__tap) (state as any).__tap = { count: 1, ts: now };
            else {
              const info = (state as any).__tap;
              if (now - info.ts < 500) info.count += 1; else info.count = 1;
              info.ts = now;
              if (info.count >= 3) {
                (state as any).__tap = { count: 0, ts: 0 };
                onTripleTap && onTripleTap();
              }
            }
          }}>
            <Image source={stageImages[state.stage] || stageImages[0]} style={styles.stageImage} resizeMode="contain" />
          </TouchableOpacity>
          {state.stage >= 4 && (
            <View style={styles.flowerEmojiWrapper}>
              <Text style={{ fontSize: 24 }}>{flower}</Text>
            </View>
          )}
        </Animated.View>
        {/* Gota de agua animada cuando se riega */}
        <Animated.View style={[styles.drop, {
          opacity: waterAnim.interpolate({ inputRange: [0, 0.1, 0.9, 1], outputRange: [0, 1, 1, 0] }),
          transform: [{ translateY: waterAnim.interpolate({ inputRange: [0, 1], outputRange: [-40, 60] }) }]
        }]}>
          <Text style={{ fontSize: 18 }}>💧</Text>
        </Animated.View>
      </View>
      <Text style={{ color: t.text, textAlign: 'center', marginBottom: 6 }}>Mi planta</Text>
      <ProgressBar value={state.water / 100} color="#3B82F6" />
      <View style={{ height: 8 }} />
      <TouchableOpacity onPress={onWater} disabled={!canWater} style={[styles.btn, { backgroundColor: canWater ? t.primary : t.border }]}>
        <Text style={{ color: canWater ? '#fff' : t.textDim, fontWeight: '700' }}>{canWater ? 'Regar planta' : 'Sigue completando tareas'}</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { alignItems: 'center' },
  canvas: { width: 140, height: 140, alignItems: 'center', justifyContent: 'center', marginBottom: 8, position: 'relative' },
  stageImage: { width: 120, height: 120 },
  flowerEmojiWrapper: { position: 'absolute', top: 8, right: 8 },
  drop: { position: 'absolute', top: 10, left: '50%', marginLeft: -10 },
  btn: { paddingHorizontal: 12, paddingVertical: 10, borderRadius: 12 }
});

export default PlantProgress;

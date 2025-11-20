import { MetricSnapshot } from '../context/MetricsContext';

export function generateMetrics(previous?: MetricSnapshot): MetricSnapshot {
  const base = previous ?? {
    timestamp: Date.now(),
    steps: 0,
    heartRate: 70,
    sleepHours: 0,
    calories: 0,
    waterMl: 0,
    distanceKm: 0,
    uvIndex: 0,
    calorieIntake: 1800, // valor base realista
    screenTimeMin: 60, // valor base realista
    sleepQuality: 80,
    stressLevel: 3,
    bloodPressure: { sys: 120, dia: 80 },
    glucose: 90,
    activityMinutes: 0,
  };

  // Simulaciones simples incrementales
  // Variaciones más sutiles para simular smartwatch en tiempo real
  const stepsInc = randRange(5, 10);
  const caloriesInc = randRange(1, 6);
  const waterInc = Math.random() < 0.05 ? randRange(20, 60) : 0; // ocasional y sutil
  const heartRateVar = clamp(base.heartRate + randRange(-1, 1), 55, 110);
  const distanceIncKm = stepsInc / 1300; // ~1300 pasos por km aprox.
  const uvIndexNow = clamp(Math.round((base.uvIndex ?? 0) + randRange(-1, 1)), 0, 11);
  // Ingesta calórica: incrementos realistas en desayuno, comida, cena
  const hour = new Date().getHours();
  let intakeInc = 0;
  if (hour === 8) intakeInc = randRange(250, 400); // desayuno
  else if (hour === 14) intakeInc = randRange(500, 800); // comida
  else if (hour === 20) intakeInc = randRange(400, 700); // cena
  else if (Math.random() < 0.05) intakeInc = randRange(50, 200); // snack ocasional

  // Simulación realista de tiempo de pantalla: más en tardes/noches, menos en mañanas
  let screenTimeInc = 0;
  if (hour >= 18 && hour <= 23) screenTimeInc = randRange(6, 12);
  else if (hour >= 8 && hour < 18) screenTimeInc = randRange(2, 6);
  else screenTimeInc = randRange(0, 3);

  // Simulación de nuevos datos
  // Simulación de sueño: solo sumar al despertar (7am), calidad variable
  const sleepInc = hour === 7 ? randRange(6, 9) : 0;
  const sleepQualityVar = hour === 7 ? clamp(randRange(70, 95), 60, 100) : (base.sleepQuality ?? 80);
  // Estrés: palabras y colores
  // Si stressLevel es objeto, usar su value; si es número, usar directamente
  const prevStress = typeof base.stressLevel === 'object' ? base.stressLevel.value : base.stressLevel ?? 3;
  const stressNum = clamp(prevStress + randRange(-1, 1), 0, 10);
  const stressLevels = [
    { word: 'Muy bajo', color: '#22C55E' },
    { word: 'Bajo', color: '#4ADE80' },
    { word: 'Normal', color: '#FACC15' },
    { word: 'Alto', color: '#F59E42' },
    { word: 'Muy alto', color: '#EF4444' },
  ];
  let stressIdx = 2;
  if (stressNum <= 2) stressIdx = 0;
  else if (stressNum <= 4) stressIdx = 1;
  else if (stressNum <= 6) stressIdx = 2;
  else if (stressNum <= 8) stressIdx = 3;
  else stressIdx = 4;
  const stressObj = { value: stressNum, word: stressLevels[stressIdx].word, color: stressLevels[stressIdx].color };
  const bpSys = clamp((base.bloodPressure?.sys ?? 120) + randRange(-2, 2), 110, 140);
  const bpDia = clamp((base.bloodPressure?.dia ?? 80) + randRange(-2, 2), 70, 90);
  const glucoseVar = clamp((base.glucose ?? 90) + randRange(-3, 3), 70, 130);
  const activityInc = Math.random() < 0.5 ? randRange(1, 5) : 0;

  const result: MetricSnapshot = {
    timestamp: Date.now(),
    steps: base.steps + stepsInc,
    heartRate: heartRateVar,
    sleepHours: (base.sleepHours ?? 0) + sleepInc,
    calories: base.calories + caloriesInc,
    waterMl: base.waterMl + waterInc,
    distanceKm: +(base.distanceKm ?? 0) + distanceIncKm,
    uvIndex: uvIndexNow,
    calorieIntake: clamp((base.calorieIntake ?? 1800) + intakeInc, 1200, 3500),
    screenTimeMin: clamp((base.screenTimeMin ?? 60) + screenTimeInc, 0, 600),
    sleepQuality: sleepQualityVar,
    stressLevel: stressObj,
    bloodPressure: { sys: bpSys, dia: bpDia },
    glucose: glucoseVar,
    activityMinutes: (base.activityMinutes ?? 0) + activityInc,
  };
  // Override de sueño para el día actual solicitado (20 Nov 2025) para mantener 4.2h constantes
  const todayISO = new Date().toISOString().slice(0, 10);
  if (todayISO === '2025-11-20') {
    result.sleepHours = 4.2; // valor fijo
  }
  return result;
}

function randRange(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
function clamp(v: number, min: number, max: number) { return Math.min(Math.max(v, min), max); }

// ===================
// Semilla por fecha: para datos históricos reproducibles por día
function hash32(s: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
function mulberry32(a: number) {
  return function() {
    a |= 0; a = a + 0x6D2B79F5 | 0;
    let t = Math.imul(a ^ a >>> 15, 1 | a);
    t ^= t + Math.imul(t ^ t >>> 7, 61 | t);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

function seeded(min: number, max: number, rng: () => number) {
  return Math.floor(rng() * (max - min + 1)) + min;
}

export function generateSnapshotForDate(dateISO: string): MetricSnapshot {
  const rng = mulberry32(hash32(dateISO));
  const steps = seeded(2000, 12000, rng);
  const heart = seeded(55, 105, rng);
  let sleepH = seeded(4, 9, rng);
  const burned = seeded(200, 900, rng);
  const water = seeded(500, 3500, rng);
  const dist = +(steps / 1300);
  const uv = seeded(0, 11, rng);
  const intake = seeded(1200, 3200, rng);
  const screenMin = seeded(30, 420, rng);
  const quality = seeded(55, 95, rng);
  const stressVal = seeded(0, 10, rng);
  const stressLevels = [
    { word: 'Muy bajo', color: '#22C55E' },
    { word: 'Bajo', color: '#4ADE80' },
    { word: 'Normal', color: '#FACC15' },
    { word: 'Alto', color: '#F59E42' },
    { word: 'Muy alto', color: '#EF4444' },
  ];
  const idx = stressVal <= 2 ? 0 : stressVal <= 4 ? 1 : stressVal <= 6 ? 2 : stressVal <= 8 ? 3 : 4;
  const bpSys = seeded(110, 140, rng);
  const bpDia = seeded(70, 90, rng);
  const gluc = seeded(70, 130, rng);
  const actMin = seeded(0, 90, rng);
  // Override específico pedido: 2025-11-20 dormir 4.2 horas
  if (dateISO === '2025-11-20') sleepH = 4.2;
  return {
    timestamp: new Date(dateISO + 'T12:00:00').getTime(),
    steps,
    heartRate: heart,
    sleepHours: sleepH,
    calories: burned,
    waterMl: water,
    distanceKm: dist,
    uvIndex: uv,
    calorieIntake: intake,
    screenTimeMin: screenMin,
    sleepQuality: quality,
    stressLevel: { value: stressVal, word: stressLevels[idx].word, color: stressLevels[idx].color },
    bloodPressure: { sys: bpSys, dia: bpDia },
    glucose: gluc,
    activityMinutes: actMin,
  };
}

export function generateSeriesForKey(dateISO: string, key: keyof MetricSnapshot, points = 20): number[] {
  const rng = mulberry32(hash32(dateISO + ':' + String(key)));
  // base según clave
  const snap = generateSnapshotForDate(dateISO);
  const baseVal = ((): number => {
    const v = snap[key as keyof MetricSnapshot] as any;
    if (typeof v === 'number') return v;
    if (v && typeof v === 'object' && 'value' in v) return v.value as number;
    return 0;
  })();
  const series: number[] = [];
  let acc = Math.max(0, baseVal * 0.2);
  for (let i = 0; i < points; i++) {
    // tendencia suave con ruido
    const noise = (rng() - 0.5) * (baseVal * 0.1);
    acc = clamp(acc + noise, 0, Math.max(1, baseVal * 1.2));
    series.push(Math.round(acc));
  }
  return series;
}

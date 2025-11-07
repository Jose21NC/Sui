import { MetricSnapshot } from '../context/MetricsContext';

function uvLabel(uv?: number) {
  if (uv == null) return 'sin dato';
  if (uv <= 2) return 'bajo';
  if (uv <= 5) return 'moderado';
  if (uv <= 7) return 'alto';
  if (uv <= 10) return 'muy alto';
  return 'extremo';
}

export function buildMetricsContext(s: MetricSnapshot): string {
  const parts: string[] = [];
  parts.push(`pasos: ${Math.round(s.steps)} pasos`);
  if (s.distanceKm != null) parts.push(`distancia: ${s.distanceKm.toFixed(2)} km`);
  parts.push(`ritmo cardiaco: ${Math.round(s.heartRate)} bpm`);
  parts.push(`calorías quemadas: ${Math.round(s.calories)} kcal`);
  parts.push(`agua: ${Math.round(s.waterMl)} ml`);
  if (s.calorieIntake != null) parts.push(`ingesta calórica: ${Math.round(s.calorieIntake)} kcal`);
  if (s.screenTimeMin != null) parts.push(`tiempo de pantalla: ${(s.screenTimeMin/60).toFixed(1)} h`);
  if (s.sleepHours != null) parts.push(`sueño: ${s.sleepHours} h`);
  if (s.sleepQuality != null) parts.push(`calidad de sueño: ${Math.round(s.sleepQuality)}%`);
  if (s.stressLevel) parts.push(`estrés: ${s.stressLevel.word} (nivel ${s.stressLevel.value})`);
  if (s.bloodPressure) parts.push(`presión arterial: ${s.bloodPressure.sys}/${s.bloodPressure.dia} mmHg`);
  if (s.glucose != null) parts.push(`glucosa: ${Math.round(s.glucose)} mg/dL`);
  if (s.activityMinutes != null) parts.push(`minutos de actividad: ${Math.round(s.activityMinutes)} min`);
  if (s.uvIndex != null) parts.push(`índice UV: ${s.uvIndex} (${uvLabel(s.uvIndex)})`);
  return parts.join('; ');
}

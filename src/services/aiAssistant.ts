import { MetricSnapshot, Goals } from '../context/MetricsContext';

export interface AISuggestion {
  message: string;
  category: 'steps' | 'water' | 'heart' | 'calories' | 'sleep';
}

export function getSuggestions(current: MetricSnapshot, goals: Goals): string[] {
  const ideas: AISuggestion[] = [];
  // Pasos
  const stepsPct = current.steps / goals.steps;
  if (stepsPct < 0.25) ideas.push({ message: 'Levántate y camina 5 minutos para activar tu circulación.', category: 'steps' });
  else if (stepsPct < 0.6) ideas.push({ message: 'Buen avance en pasos, programa un paseo corto en la tarde.', category: 'steps' });
  else if (stepsPct < 1) ideas.push({ message: 'Estás cerca de tu meta de pasos, ¿una caminata ligera ahora?', category: 'steps' });
  else ideas.push({ message: 'Meta de pasos lograda, considera estiramientos suaves.', category: 'steps' });

  // Agua
  const waterPct = current.waterMl / goals.waterMl;
  if (waterPct < 0.3) ideas.push({ message: 'Hidratación baja: toma un vaso de agua ahora.', category: 'water' });
  else if (waterPct < 0.7) ideas.push({ message: 'Mantén el ritmo, añade otro vaso antes de seguir trabajando.', category: 'water' });
  else if (waterPct < 1) ideas.push({ message: 'Casi llegas a tu objetivo de agua, un vaso más lo completa.', category: 'water' });
  else ideas.push({ message: 'Excelente hidratación hoy.', category: 'water' });

  // Ritmo cardíaco simple
  if (current.heartRate > 95) ideas.push({ message: 'Ritmo algo elevado: respira profundo 1 minuto.', category: 'heart' });
  if (current.heartRate < 60) ideas.push({ message: 'Ritmo bajo: quizá una activación ligera (caminar).', category: 'heart' });

  // Calorías (heurística simple)
  if (current.calories < 300) ideas.push({ message: 'Aún puedes realizar una sesión corta de ejercicio para mejorar el gasto calórico.', category: 'calories' });

  // Meta sueño (solo evalúa si > 19h del día aprox.)
  const hour = new Date(current.timestamp).getHours();
  if (hour >= 19 && current.sleepHours < goals.sleepHours) {
  ideas.push({ message: 'Planifica tu hora de dormir para alcanzar tu objetivo de sueño.', category: 'sleep' });
  }

  // Filtra duplicados por categoría, preservando prioridad
  const uniqueByCategory: Record<string, AISuggestion> = {};
  for (const s of ideas) {
    if (!uniqueByCategory[s.category]) uniqueByCategory[s.category] = s;
  }
  return Object.values(uniqueByCategory).slice(0, 5).map(x => x.message);
}

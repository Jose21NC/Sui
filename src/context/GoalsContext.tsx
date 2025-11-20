import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

export type ObjectiveId = 'study' | 'exercise' | 'digital_detox';

export type Objective = {
  id: ObjectiveId;
  title: string;
  description: string;
};

export type Task = {
  date: string; // ISO date (YYYY-MM-DD)
  description: string;
  completed: boolean;
};

type GoalsState = {
  selected?: Objective;
  durationDays?: number;
  startDate?: string; // ISO date
  tasks: Task[];
  hydrated: boolean;
  chooseObjective: (objective: Objective, durationDays: number, startDate?: Date) => Promise<void>;
  completeToday: () => Promise<void>;
  resetToday: () => Promise<void>;
  regenerateTasks: () => Promise<void>;
};

const GoalsContext = createContext<GoalsState | undefined>(undefined);

const todayStr = (d = new Date()) => d.toISOString().slice(0, 10);

function addDays(date: Date, days: number) { const d = new Date(date); d.setDate(d.getDate() + days); return d; }

const OBJECTIVES: Objective[] = [
  { id: 'study', title: 'Estudio', description: 'Mejora tu hábito de estudio con sesiones diarias.' },
  { id: 'exercise', title: 'Ejercicio', description: 'Construye resistencia con cardio suave y fuerza.' },
  { id: 'digital_detox', title: 'Menos móvil', description: 'Reduce la adicción al teléfono y mejora tu sueño.' },
];

export const PREDEFINED_OBJECTIVES = OBJECTIVES;

function seededIndex(seed: string, mod: number) { let h = 0; for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0; return h % mod; }

function generateTasks(objective: Objective, durationDays: number, start: Date): Task[] {
  const tasks: Task[] = [];
  const lowerTitle = (objective.title || '').toLowerCase();
  const isThesis = lowerTitle.includes('tesis');
  const studyPool = [
    (i:number)=>`Estudia ${Math.min(20 + Math.floor(i/2)*5, 60)} min con Pomodoro (25/5).`,
    ()=>`Resume un capítulo en 5 bullets y 1 ejemplo práctico.`,
    ()=>`Haz 10 preguntas tipo test sobre lo que estudiaste ayer.`,
    ()=>`Enseña el tema a alguien en 10 min (método Feynman).`,
  ];
  const thesisPool = [
    ()=>`Abre un documento nuevo y nómbralo "Tesis Marketing". Escribe 3 ideas de qué quieres lograr. (10-15 min)`,
    ()=>`Define tu pregunta central en una sola frase clara y simple. (10 min)`,
    ()=>`Crea una lista de 3 entregables mínimos (ej.: índice básico, 2 fuentes, 150 palabras). (10-15 min)`,
    ()=>`Encuentra 2 fuentes confiables (libro o paper) y anota 1 idea de cada una. (20 min)`,
    ()=>`Escribe 150 palabras de la introducción: por qué es importante tu tema. (20 min)`,
    ()=>`Dibuja un esquema simple (bullets) de capítulos: Intro, Marco, Método, Resultados. (10 min)`,
    ()=>`Anota 3 preguntas que te haría un lector sobre tu tesis y cómo las responderías. (10-15 min)`,
  ];
  const exercisePool = [
    (i:number)=>`Camina ${Math.min(20+i,45)} min a ritmo conversacional.`,
    ()=>`Circuito movilidad: 3 rondas de 5 min (hombros, cadera, tobillos).`,
    ()=>`Fuerza: 3x10 sentadillas, 3x8 flexiones inclinadas, 3x20" plancha.`,
    ()=>`Respiración nasal + paseo corto (zona 2) 15-25 min.`,
  ];
  const detoxPool = [
    (i:number)=>`Bloquea el móvil ${Math.min(20 + i*2, 60)} min antes de dormir.`,
    ()=>`Coloca el móvil fuera de la habitación y usa alarma analógica.`,
    ()=>`Define 2 ventanas (15 min) para revisar redes; desactiva notificaciones.`,
    ()=>`Crea lista de actividades sin pantalla para la noche (leer, estirar).`,
  ];

  for (let i = 0; i < durationDays; i++) {
    const date = addDays(start, i);
    const seed = todayStr(date) + ':' + objective.id;
  const pool = objective.id === 'study' ? (isThesis ? thesisPool : studyPool) : objective.id === 'exercise' ? exercisePool : detoxPool;
    const idx = seededIndex(seed, pool.length);
    const pick = pool[idx];
    const base = typeof pick === 'function' ? pick(i) : pick;
    const isReviewDay = (i+1) % 7 === 0;
    const description = isReviewDay ? base + ' (Revisión semanal: escribe 3 aprendizajes).' : base;
    tasks.push({ date: todayStr(date), description, completed: false });
  }
  return tasks;
}

export const GoalsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<{ selected?: Objective; durationDays?: number; startDate?: string; tasks: Task[] }>({ tasks: [] });
  const [hydrated, setHydrated] = useState(false);
  const { user } = useAuth();
  const storageKey = `sui:goals:${user?.email?.toLowerCase() || 'guest'}`;

  useEffect(() => {
    setHydrated(false);
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(storageKey);
        if (raw) {
          const parsed = JSON.parse(raw);
          const next = { tasks: [], ...parsed } as { selected?: Objective; durationDays?: number; startDate?: string; tasks: Task[] };
          if (!Array.isArray(next.tasks)) next.tasks = [];
          setState(next);
        } else {
          setState({ tasks: [] });
        }
      } finally {
        setHydrated(true);
      }
    })();
  }, [storageKey]);

  const persist = async (s: typeof state) => {
    setState(s);
    await AsyncStorage.setItem(storageKey, JSON.stringify(s));
  };

  const chooseObjective = async (objective: Objective, durationDays: number, startDate?: Date) => {
    const start = startDate ?? new Date();
    const tasks = generateTasks(objective, durationDays, start);
    await persist({ selected: objective, durationDays, startDate: todayStr(start), tasks });
  };

  const regenerateTasks = async () => {
    if (!state.selected || !state.durationDays) return;
    const start = state.startDate ? new Date(state.startDate) : new Date();
    const tasks = generateTasks(state.selected, state.durationDays, start);
    await persist({ ...state, tasks });
  };

  const completeToday = async () => {
    const today = todayStr();
    const tasks = state.tasks.map(t => (t.date === today ? { ...t, completed: true } : t));
    await persist({ ...state, tasks });
  };
  const resetToday = async () => {
    const today = todayStr();
    const tasks = state.tasks.map(t => (t.date === today ? { ...t, completed: false } : t));
    await persist({ ...state, tasks });
  };

  const value = useMemo<GoalsState>(() => ({
    selected: state.selected,
    durationDays: state.durationDays,
    startDate: state.startDate,
    tasks: state.tasks,
    hydrated,
    chooseObjective,
    completeToday,
    resetToday,
    regenerateTasks,
  }), [state, hydrated]);

  // Si hay objetivo/duración y no hay tasks tras hidratar, regenera automáticamente
  useEffect(() => {
    if (hydrated && state.selected && state.durationDays && state.tasks.length === 0) {
      regenerateTasks();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  return <GoalsContext.Provider value={value}>{children}</GoalsContext.Provider>;
};

export const useGoals = () => {
  const ctx = useContext(GoalsContext);
  if (!ctx) throw new Error('useGoals debe usarse dentro de GoalsProvider');
  return ctx;
};

import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { generateMetrics } from '../services/metricsSimulation';
import { getSuggestions } from '../services/aiAssistant';

export type MetricSnapshot = {
  timestamp: number;
  steps: number;
  heartRate: number;
  sleepHours: number;
  calories: number;
  waterMl: number;
  distanceKm?: number;
  uvIndex?: number;
  calorieIntake?: number;
  screenTimeMin?: number;
  sleepQuality?: number; // 0-100
  stressLevel?: { value: number; word: string; color: string }; // visualización
  bloodPressure?: { sys: number; dia: number };
  glucose?: number; // mg/dL
  activityMinutes?: number;
};

export type Goals = {
  steps: number;
  sleepHours: number;
  waterMl: number;
};

interface MetricsContextValue {
  current: MetricSnapshot;
  history: MetricSnapshot[];
  goals: Goals;
  suggestions: string[];
  updateGoals: (partial: Partial<Goals>) => void;
}

const MetricsContext = createContext<MetricsContextValue | undefined>(undefined);

export const MetricsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [current, setCurrent] = useState<MetricSnapshot>(() => generateMetrics());
  const [history, setHistory] = useState<MetricSnapshot[]>([current]);
  const [goals, setGoals] = useState<Goals>({ steps: 8000, sleepHours: 7, waterMl: 2000 });
  const [suggestions, setSuggestions] = useState<string[]>([]);

  // Cargar estado persistido
  useEffect(() => {
    (async () => {
      try {
        const [rawGoals, rawHistory] = await Promise.all([
          AsyncStorage.getItem('sui:goals'),
          AsyncStorage.getItem('sui:history'),
        ]);
        if (rawGoals) {
          const parsed: Goals = JSON.parse(rawGoals);
          setGoals(g => ({ ...g, ...parsed }));
        }
        if (rawHistory) {
          const parsed: MetricSnapshot[] = JSON.parse(rawHistory);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setHistory(parsed);
            setCurrent(parsed[0]);
          }
        }
      } catch (e) {
        // si hay error, continuar con valores por defecto
        console.warn('No se pudo cargar persistencia', e);
      }
    })();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent(prev => {
        const next = generateMetrics(prev);
        setHistory(h => [next, ...h.slice(0, 199)]); // mantener último ~200
        return next;
      });
    }, 60000); // cada minuto nueva muestra simulada
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setSuggestions(getSuggestions(current, goals));
  }, [current, goals]);

  const updateGoals = (partial: Partial<Goals>) => {
    setGoals(g => ({ ...g, ...partial }));
  };

  // Guardar persistencia cuando cambien goals o history
  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem('sui:goals', JSON.stringify(goals));
      } catch (e) {
        console.warn('Error guardando goals', e);
      }
    })();
  }, [goals]);

  useEffect(() => {
    (async () => {
      try {
        await AsyncStorage.setItem('sui:history', JSON.stringify(history.slice(0, 200)));
      } catch (e) {
        console.warn('Error guardando history', e);
      }
    })();
  }, [history]);

  const value: MetricsContextValue = { current, history, goals, suggestions, updateGoals };
  return <MetricsContext.Provider value={value}>{children}</MetricsContext.Provider>;  
};

export const useMetrics = () => {
  const ctx = useContext(MetricsContext);
  if (!ctx) throw new Error('useMetrics debe usarse dentro de MetricsProvider');
  return ctx;
};

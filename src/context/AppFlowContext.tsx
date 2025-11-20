import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from './AuthContext';

type AppFlowState = {
  onboarded: boolean;
  setOnboarded: (v: boolean) => void;
};

const AppFlowContext = createContext<AppFlowState | undefined>(undefined);

export const AppFlowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [onboarded, setOnboardedState] = useState(false);
  const { user } = useAuth();
  useEffect(() => {
    (async () => {
      const key = `sui:onboarded:${user?.email?.toLowerCase() || 'guest'}`;
      const flag = await AsyncStorage.getItem(key);
      setOnboardedState(flag === '1');
    })();
  }, [user?.email]);
  const setOnboarded = async (v: boolean) => {
    setOnboardedState(v);
    const key = `sui:onboarded:${user?.email?.toLowerCase() || 'guest'}`;
    await AsyncStorage.setItem(key, v ? '1' : '0');
  };
  return <AppFlowContext.Provider value={{ onboarded, setOnboarded }}>{children}</AppFlowContext.Provider>;
};

export const useAppFlow = () => {
  const ctx = useContext(AppFlowContext);
  if (!ctx) throw new Error('useAppFlow debe usarse dentro de AppFlowProvider');
  return ctx;
};

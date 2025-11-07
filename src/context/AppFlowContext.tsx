import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

type AppFlowState = {
  onboarded: boolean;
  setOnboarded: (v: boolean) => void;
};

const AppFlowContext = createContext<AppFlowState | undefined>(undefined);

export const AppFlowProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [onboarded, setOnboardedState] = useState(false);
  useEffect(() => {
    (async () => {
      const flag = await AsyncStorage.getItem('sui:onboarded');
      setOnboardedState(flag === '1');
    })();
  }, []);
  const setOnboarded = async (v: boolean) => {
    setOnboardedState(v);
    await AsyncStorage.setItem('sui:onboarded', v ? '1' : '0');
  };
  return <AppFlowContext.Provider value={{ onboarded, setOnboarded }}>{children}</AppFlowContext.Provider>;
};

export const useAppFlow = () => {
  const ctx = useContext(AppFlowContext);
  if (!ctx) throw new Error('useAppFlow debe usarse dentro de AppFlowProvider');
  return ctx;
};

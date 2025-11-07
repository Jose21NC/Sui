import React, { createContext, useContext } from 'react';
import { theme, Theme } from './colors';

const ThemeContext = createContext<Theme>(theme);
export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
};
export const useTheme = () => useContext(ThemeContext);

import 'react-native-gesture-handler';
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { MetricsProvider } from './src/context/MetricsContext';
import RootNavigator from './src/navigation';
import { ThemeProvider } from './src/theme/ThemeContext';
import { useFonts } from 'expo-font';
import { Inter_400Regular, Inter_600SemiBold, Inter_800ExtraBold } from '@expo-google-fonts/inter';
import { AppFlowProvider } from './src/context/AppFlowContext';
import { View, Text } from 'react-native';
import { AuthProvider } from './src/context/AuthContext';
import { GoalsProvider } from './src/context/GoalsContext';

const MissingKeyBanner = () => {
  const hasKey = !!(typeof process !== 'undefined' && (process as any).env && (process as any).env.EXPO_PUBLIC_GEMINI_API_KEY);
  if (hasKey) return null;
  return (
    <View style={{
      position: 'absolute', top: 0, left: 0, right: 0,
      paddingVertical: 8, paddingHorizontal: 12,
      backgroundColor: '#ffcc00', zIndex: 999,
      borderBottomWidth: 1, borderBottomColor: '#e0b800'
    }}>
      <Text style={{ color: '#000', fontFamily: 'Inter_600SemiBold', fontSize: 12 }}>
        Sin API key de Gemini (EXPO_PUBLIC_GEMINI_API_KEY). Modo demo activo.
      </Text>
    </View>
  );
};

export default function App() {
  const [loaded] = useFonts({ Inter_400Regular, Inter_600SemiBold, Inter_800ExtraBold });

  if (!loaded) {
    return <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}><Text>Cargando…</Text></View>;
  }

  return (
    <ThemeProvider>
      <MetricsProvider>
        <AuthProvider>
          <GoalsProvider>
            <AppFlowProvider>
              <NavigationContainer>
                <View style={{ flex: 1 }}>
                  <MissingKeyBanner />
                  <RootNavigator />
                </View>
                <StatusBar style="light" />
              </NavigationContainer>
            </AppFlowProvider>
          </GoalsProvider>
        </AuthProvider>
      </MetricsProvider>
    </ThemeProvider>
  );
}

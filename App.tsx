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

// Badge de API key eliminado a petición. Si no existe la clave simplemente se usará modo demo sin aviso visual.
const MissingKeyBanner = () => null;

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
                  {/* Banner eliminado */}
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

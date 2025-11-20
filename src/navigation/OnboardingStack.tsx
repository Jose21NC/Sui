import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '../screens/onboarding/WelcomeScreen';
// Carga perezosa para evitar problemas de resolución durante el build

export type OnboardingParamList = {
  Welcome: undefined;
  GoalIntro: undefined;
  GoalProcessing: { title: string; plazo: 'corto'|'mediano'|'largo' };
  GoalConfirm: { title: string; plazo: 'corto'|'mediano'|'largo' };
};

const Stack = createNativeStackNavigator<OnboardingParamList>();

export default function OnboardingStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Welcome" component={WelcomeScreen} />
      <Stack.Screen name="GoalIntro" getComponent={() => require('../screens/onboarding/GoalIntroScreen').default} />
      <Stack.Screen name="GoalProcessing" getComponent={() => require('../screens/onboarding/GoalProcessingScreen').default} />
      <Stack.Screen name="GoalConfirm" getComponent={() => require('../screens/onboarding/GoalConfirmScreen').default} />
    </Stack.Navigator>
  );
}

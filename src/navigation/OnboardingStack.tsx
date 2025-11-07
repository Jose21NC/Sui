import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import WelcomeScreen from '../screens/onboarding/WelcomeScreen';
import ObjectivePickerScreen from '../screens/onboarding/ObjectivePickerScreen';
import PreferencesScreen from '../screens/onboarding/PreferencesScreen';

export type OnboardingParamList = {
  Welcome: undefined;
  Objective: undefined;
  Preferences: undefined;
};

const Stack = createNativeStackNavigator<OnboardingParamList>();

export default function OnboardingStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
  <Stack.Screen name="Welcome" component={WelcomeScreen} />
  <Stack.Screen name="Objective" component={ObjectivePickerScreen} />
      <Stack.Screen name="Preferences" component={PreferencesScreen} />
    </Stack.Navigator>
  );
}

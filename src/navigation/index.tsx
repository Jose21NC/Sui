import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import DashboardScreen from '../screens/DashboardScreen';
import GoalsScreen from '../screens/GoalsScreen';
import AssistantScreen from '../screens/AssistantScreen';
import OnboardingStack from './OnboardingStack';
import AuthStack from './AuthStack';
import { View, ActivityIndicator } from 'react-native';
import { useAppFlow } from '../context/AppFlowContext';
import { useAuth } from '../context/AuthContext';
import { useGoals } from '../context/GoalsContext';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useTheme } from '../theme/ThemeContext';

const Tab = createBottomTabNavigator();
const RootStack = createNativeStackNavigator();

function MainTabs() {
  const theme = useTheme();
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: theme.card, borderTopColor: theme.border },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.textDim,
        tabBarIcon: ({ color, size }) => {
          const map: any = { Dashboard: 'home', Metas: 'trophy', Asistente: 'chatbubbles' };
          const name = map[route.name] || 'ellipse';
          return <Ionicons name={name as any} color={color} size={size} />;
        },
        // Transición custom entre tabs (fade + scale ligera)
        tabBarHideOnKeyboard: true,
      })}
      sceneContainerStyle={{ backgroundColor: theme.bg }}
    >
  <Tab.Screen name="Dashboard" component={DashboardScreen} />
  <Tab.Screen name="Metas" component={GoalsScreen} />
  <Tab.Screen name="Asistente" component={AssistantScreen} />
    </Tab.Navigator>
  );
}

export default function RootNavigator() {
  const { onboarded } = useAppFlow();
  const { hydrated: authHydrated, user } = useAuth();
  const { hydrated: goalsHydrated } = useGoals();
  const theme = useTheme();
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true); }, []);

  if (!hydrated || !authHydrated || !goalsHydrated) return <View style={{ flex:1, alignItems:'center', justifyContent:'center' }}><ActivityIndicator /></View>;

  if (!user) return <AuthStack />;
  if (!onboarded) return <OnboardingStack />;

  return (
    <RootStack.Navigator screenOptions={{ headerShown: false, animation: 'fade_from_bottom' }}>
      <RootStack.Screen name="MainTabs" component={MainTabs} />
      <RootStack.Screen name="Profile" getComponent={() => require('../screens/ProfileScreen').default} />
      <RootStack.Screen name="DataSources" getComponent={() => require('../screens/DataSourcesScreen').default} />
    </RootStack.Navigator>
  );
}

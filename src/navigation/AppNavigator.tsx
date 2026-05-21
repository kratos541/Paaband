import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View } from 'react-native';
import { RootStackParamList, TabParamList } from './types';
import { useTheme } from '../context/ThemeContext';
import { useLang } from '../context/LanguageContext';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import TutorialScreen from '../screens/TutorialScreen';
import DashboardScreen from '../screens/DashboardScreen';
import LawsScreen from '../screens/LawsScreen';
import LawDetailScreen from '../screens/LawDetailScreen';
import NewsFeedScreen from '../screens/NewsFeedScreen';
import ProfileScreen from '../screens/ProfileScreen';
import FineCalculatorScreen from '../screens/FineCalculatorScreen';
import ComplianceCalendarScreen from '../screens/ComplianceCalendarScreen';
import PaywallScreen from '../screens/PaywallScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

const TAB_ICONS: Record<string, string> = {
  Dashboard: '🏠', News: '📰', Laws: '⚖️', Profile: '👤',
};

function TabIcon({ name, focused }: { name: string; focused: boolean; color: string }) {
  const { colors } = useTheme();
  return (
    <View style={{ alignItems: 'center', paddingBottom: 2 }}>
      <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.45 }}>{TAB_ICONS[name]}</Text>
      <View style={{
        height: 3,
        width: focused ? 24 : 0,
        backgroundColor: colors.goldDark,
        borderRadius: 2,
        marginTop: 3,
      }} />
    </View>
  );
}

function MainTabs() {
  const { colors } = useTheme();
  const { t } = useLang();

  const tabLabels: Record<string, string> = {
    Dashboard: t.tabHome,
    News: t.tabNews,
    Laws: t.tabLaws,
    Profile: t.tabProfile,
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color }) => (
          <TabIcon name={route.name} focused={focused} color={color} />
        ),
        tabBarActiveTintColor: colors.goldDark,
        tabBarInactiveTintColor: colors.text3,
        tabBarStyle: {
          backgroundColor: colors.bg,
          borderTopColor: colors.border,
          borderTopWidth: 0.5,
          paddingBottom: 12,
          paddingTop: 8,
          height: 64,
          elevation: 8,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '700', marginTop: 0 },
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: tabLabels.Dashboard }} />
      <Tab.Screen name="News" component={NewsFeedScreen} options={{ title: tabLabels.News }} />
      <Tab.Screen name="Laws" component={LawsScreen} options={{ title: tabLabels.Laws }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ title: tabLabels.Profile }} />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { colors, isDark } = useTheme();
  return (
    <NavigationContainer
      theme={{
        dark: isDark,
        colors: {
          primary: colors.gold,
          background: colors.bg,
          card: colors.bg2,
          text: colors.text,
          border: colors.border,
          notification: colors.red,
        },
      }}
    >
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Tutorial" component={TutorialScreen} />
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="LawDetail" component={LawDetailScreen} />
        <Stack.Screen name="FineCalculator" component={FineCalculatorScreen} />
        <Stack.Screen name="ComplianceCalendar" component={ComplianceCalendarScreen} />
        <Stack.Screen name="Paywall" component={PaywallScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

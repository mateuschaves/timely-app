import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { IntroScreen, WorkModelSelectionScreen, OnboardingStackParamList } from '@/features/onboarding';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export function OnboardingNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Intro" component={IntroScreen} />
      <Stack.Screen name="WorkModelSelection" component={WorkModelSelectionScreen} />
    </Stack.Navigator>
  );
}

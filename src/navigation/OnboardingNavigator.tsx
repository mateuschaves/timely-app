import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform } from 'react-native';
import { IntroScreen, WorkModelSelectionScreen, WorkLocationScreen, OnboardingStackParamList } from '@/features/onboarding';

const Stack = createNativeStackNavigator<OnboardingStackParamList>();

export function OnboardingNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen 
        name="Intro" 
        component={IntroScreen}
      />
      <Stack.Screen 
        name="WorkModelSelection" 
        component={WorkModelSelectionScreen}
      />
      <Stack.Screen 
        name="WorkLocation" 
        component={WorkLocationScreen}
      />
    </Stack.Navigator>
  );
}

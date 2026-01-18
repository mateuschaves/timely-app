import React, { useEffect } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { AppNavigator } from './AppNavigator';
import { AuthNavigator } from './AuthNavigator';
import { OnboardingNavigator } from './OnboardingNavigator';
import { useAuthContext } from '@/features/auth';
import { useOnboarding } from '@/features/onboarding';

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
  Onboarding: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuthContext();
  const { isOnboardingCompleted, isLoading: isOnboardingLoading } = useOnboarding();
  const navigation = useNavigation<any>();

  useEffect(() => {
    if (isLoading || isOnboardingLoading) return;

    if (isAuthenticated && !isOnboardingCompleted) {
      navigation.navigate('Onboarding');
    } else if (isAuthenticated) {
      navigation.navigate('App');
    } else {
      navigation.navigate('Auth');
    }
  }, [isAuthenticated, isOnboardingCompleted, isLoading, isOnboardingLoading, navigation]);

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName="Auth"
    >
      <Stack.Screen name="Auth" component={AuthNavigator} />
      <Stack.Screen name="App" component={AppNavigator} />
      <Stack.Screen
        name="Onboarding"
        component={OnboardingNavigator}
        options={{
          presentation: 'modal',
          animation: Platform.OS === 'ios' ? 'default' : 'slide_from_bottom',
          contentStyle: {
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
          },
          gestureEnabled: true,
        }}
      />
    </Stack.Navigator>
  );
}

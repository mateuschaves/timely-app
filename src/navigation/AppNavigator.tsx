import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { BottomTabNavigator } from './BottomTabNavigator';
import { LanguageScreen, EditNameScreen, WorkSettingsScreen, PrivacyAndSecurityScreen, DeleteAccountScreen } from '@/features/profile';
import { EditEventScreen } from '@/features/history';

export type AppStackParamList = {
  Main: undefined;
  Language: undefined;
  EditName: undefined;
  WorkSettings: undefined;
  PrivacyAndSecurity: undefined;
  DeleteAccount: undefined;
  EditEvent: { event: any };
};

const Stack = createNativeStackNavigator<AppStackParamList>();

export function AppNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <Stack.Screen name="Main" component={BottomTabNavigator} />
      <Stack.Screen 
        name="Language" 
        component={LanguageScreen}
        options={{
          presentation: 'card',
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen 
        name="EditName" 
        component={EditNameScreen}
        options={{
          presentation: 'card',
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen 
        name="WorkSettings" 
        component={WorkSettingsScreen}
        options={{
          presentation: 'card',
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen 
        name="PrivacyAndSecurity" 
        component={PrivacyAndSecurityScreen}
        options={{
          presentation: 'card',
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen 
        name="DeleteAccount" 
        component={DeleteAccountScreen}
        options={{
          presentation: 'card',
          animation: 'slide_from_right',
        }}
      />
      <Stack.Screen 
        name="EditEvent" 
        component={EditEventScreen}
        options={{
          presentation: 'card',
          animation: 'slide_from_right',
        }}
      />
    </Stack.Navigator>
  );
}


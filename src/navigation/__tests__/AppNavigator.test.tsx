import React from 'react';
import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AppNavigator } from '../AppNavigator';
import { createTestWrapper } from '@/utils/test-helpers';

jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  NotificationFeedbackType: {
    Success: 'success',
  },
}));
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: 'SafeAreaView',
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Screen: () => null,
  }),
}));
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    select: jest.fn(),
  },
  useColorScheme: jest.fn(() => 'light'),
  View: 'View',
  Text: 'Text',
  StyleSheet: {
    create: (styles: any) => styles,
    flatten: (style: any) => {
      if (!style) return {};
      if (Array.isArray(style)) {
        return Object.assign({}, ...style.filter(Boolean));
      }
      return style;
    },
  },
}));
jest.mock('@/features/profile', () => ({
  LanguageScreen: () => null,
  AppearanceScreen: () => null,
  EditNameScreen: () => null,
  WorkSettingsScreen: () => null,
  PrivacyAndSecurityScreen: () => null,
  DeleteAccountScreen: () => null,
}));

jest.mock('@/features/history', () => ({
  EditEventScreen: () => null,
}));

jest.mock('../BottomTabNavigator', () => ({
  BottomTabNavigator: () => null,
}));

describe('AppNavigator', () => {
  it('should render app navigator', () => {
    const TestWrapper = createTestWrapper();
    const { UNSAFE_root } = render(
      <TestWrapper>
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </TestWrapper>
    );

    expect(UNSAFE_root).toBeTruthy();
  });
}, 10000);


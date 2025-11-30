import React from 'react';
import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AppNavigator } from '../AppNavigator';
import { createTestWrapper } from '@/utils/test-helpers';

jest.mock('react-native', () => ({
  useColorScheme: jest.fn(() => 'light'),
}));
jest.mock('@/features/profile', () => ({
  LanguageScreen: () => null,
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
});


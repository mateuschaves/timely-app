import React from 'react';
import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AppNavigator } from '../AppNavigator';

jest.mock('@/features/profile', () => ({
  LanguageScreen: () => null,
  EditNameScreen: () => null,
  WorkSettingsScreen: () => null,
}));

jest.mock('@/features/history', () => ({
  EditEventScreen: () => null,
}));

jest.mock('../BottomTabNavigator', () => ({
  BottomTabNavigator: () => null,
}));

describe('AppNavigator', () => {
  it('should render app navigator', () => {
    const { UNSAFE_root } = render(
      <NavigationContainer>
        <AppNavigator />
      </NavigationContainer>
    );

    expect(UNSAFE_root).toBeTruthy();
  });
});

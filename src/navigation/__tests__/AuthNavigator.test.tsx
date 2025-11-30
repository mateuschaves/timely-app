import React from 'react';
import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { AuthNavigator } from '../AuthNavigator';

jest.mock('@/features/auth', () => ({
  LoginScreen: () => null,
  TermsScreen: () => null,
}));

describe('AuthNavigator', () => {
  it('should render auth navigator', () => {
    const { UNSAFE_root } = render(
      <NavigationContainer>
        <AuthNavigator />
      </NavigationContainer>
    );

    expect(UNSAFE_root).toBeTruthy();
  });
});


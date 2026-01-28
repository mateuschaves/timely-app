import React from 'react';
import { render } from '@testing-library/react-native';
import { OnboardingNavigator } from '../OnboardingNavigator';
import { createTestWrapper } from '@/utils/test-helpers';

jest.mock('@react-navigation/native', () => {
  const React = require('react');
  return {
    NavigationContainer: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
    }),
  };
});

jest.mock('@react-navigation/native-stack', () => ({
  createNativeStackNavigator: () => ({
    Navigator: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    Screen: () => null,
  }),
}));

jest.mock('@/features/onboarding', () => ({
  IntroScreen: () => null,
  WorkModelSelectionScreen: () => null,
}));

describe('OnboardingNavigator', () => {
  it('should render onboarding navigator', () => {
    const TestWrapper = createTestWrapper();
    const { UNSAFE_root } = render(
      <TestWrapper>
        <OnboardingNavigator />
      </TestWrapper>
    );

    expect(UNSAFE_root).toBeTruthy();
  });
});

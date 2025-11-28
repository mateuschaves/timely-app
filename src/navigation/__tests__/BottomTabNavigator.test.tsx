import React from 'react';
import { render } from '@testing-library/react-native';
import { NavigationContainer } from '@react-navigation/native';
import { BottomTabNavigator } from '../BottomTabNavigator';
import { useTranslation } from '@/i18n';

jest.mock('@/i18n');
jest.mock('@/features/home', () => ({
  HomeScreen: () => null,
}));
jest.mock('@/features/history', () => ({
  HistoryScreen: () => null,
}));
jest.mock('@/features/profile', () => ({
  ProfileScreen: () => null,
}));

const mockUseTranslation = useTranslation as jest.MockedFunction<typeof useTranslation>;

describe('BottomTabNavigator', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTranslation.mockReturnValue({
      t: jest.fn((key: string) => key),
      i18n: {
        language: 'pt-BR',
        changeLanguage: jest.fn(),
      },
    } as any);
  });

  it('should render bottom tab navigator', () => {
    const { UNSAFE_root } = render(
      <NavigationContainer>
        <BottomTabNavigator />
      </NavigationContainer>
    );

    expect(UNSAFE_root).toBeTruthy();
  });
});


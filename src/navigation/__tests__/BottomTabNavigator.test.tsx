import React from 'react';
import { render } from '@testing-library/react-native';
import { useTranslation } from '@/i18n';
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
jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  NotificationFeedbackType: {
    Success: 'success',
  },
}));
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const mockContextValue = { top: 0, bottom: 0, left: 0, right: 0 };
  const mockFrameValue = { x: 0, y: 0, width: 375, height: 812 };
  const mockContext = React.createContext ? React.createContext(mockContextValue) : {
    Provider: ({ children }: { children: React.ReactNode }) => children,
    Consumer: ({ children }: { children: (value: any) => React.ReactNode }) => children(mockContextValue),
  };
  return {
    SafeAreaView: ({ children }: { children: React.ReactNode }) => children,
    SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
    useSafeAreaInsets: () => mockContextValue,
    useSafeAreaFrame: () => mockFrameValue,
    SafeAreaContext: mockContext,
    SafeAreaInsetsContext: mockContext,
  };
});
jest.mock('@react-navigation/bottom-tabs', () => {
  const React = require('react');
  return {
    createBottomTabNavigator: () => ({
      Navigator: ({ children }: { children: React.ReactNode }) => <>{children}</>,
      Screen: () => null,
    }),
  };
});
jest.mock('@/i18n');
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));
jest.mock('react-native', () => ({
  useColorScheme: jest.fn(() => 'light'),
  Platform: {
    OS: 'ios',
    select: jest.fn(),
  },
  BackHandler: {
    addEventListener: jest.fn(() => ({ remove: jest.fn() })),
    removeEventListener: jest.fn(),
  },
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
  Animated: {
    Value: jest.fn((value: number) => ({
      _value: value,
      setValue: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      stopAnimation: jest.fn(),
    })),
    timing: jest.fn(() => ({
      start: jest.fn((callback?: () => void) => {
        if (callback) callback();
      }),
    })),
    spring: jest.fn(() => ({
      start: jest.fn((callback?: () => void) => {
        if (callback) callback();
      }),
    })),
    parallel: jest.fn(() => ({
      start: jest.fn((callback?: () => void) => {
        if (callback) callback();
      }),
    })),
  },
}));
jest.mock('@/features/home', () => ({
  HomeScreen: () => null,
}));
jest.mock('@/features/history', () => ({
  HistoryScreen: () => null,
}));
jest.mock('@/features/profile', () => ({
  ProfileScreen: () => null,
}));

import { BottomTabNavigator } from '../BottomTabNavigator';

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
    const TestWrapper = createTestWrapper();
    const { UNSAFE_root } = render(
      <TestWrapper>
        <BottomTabNavigator />
      </TestWrapper>
    );

    expect(UNSAFE_root).toBeTruthy();
  });
});


import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Platform, Alert } from 'react-native';
import { useNavigation, NavigationContainer } from '@react-navigation/native';
import { LoginScreen } from '../index';
import { useAuthContext } from '../../context/AuthContext';
import { useTranslation } from '@/i18n';
import { createTestWrapper } from '@/utils/test-helpers';

jest.mock('../../context/AuthContext');
jest.mock('@/i18n');
jest.mock('expo-apple-authentication', () => ({
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
  signInAsync: jest.fn(() => Promise.resolve({})),
}));
jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  NotificationFeedbackType: {
    Success: 'success',
  },
}));

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => {
  const React = require('react');
  return {
    NavigationContainer: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    useNavigation: jest.fn(() => ({
      navigate: mockNavigate,
      goBack: mockGoBack,
    })),
  };
});
jest.mock('react-native', () => {
  return {
    Platform: {
      OS: 'ios',
      select: jest.fn(),
    },
    Alert: {
      alert: jest.fn(),
    },
    useColorScheme: jest.fn(() => 'light'),
    BackHandler: {
      addEventListener: jest.fn(() => ({ remove: jest.fn() })),
      removeEventListener: jest.fn(),
    },
    View: 'View',
    Text: 'Text',
    TouchableOpacity: 'TouchableOpacity',
    ActivityIndicator: 'ActivityIndicator',
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
      View: 'View',
    },
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
  };
});

const mockUseAuthContext = useAuthContext as jest.MockedFunction<typeof useAuthContext>;
const mockUseTranslation = useTranslation as jest.MockedFunction<typeof useTranslation>;

const createWrapper = () => {
  return ({ children }: { children: React.ReactNode }) => {
    const TestWrapper = createTestWrapper();
    return (
      <TestWrapper>
        <NavigationContainer>
          {children}
        </NavigationContainer>
      </TestWrapper>
    );
  };
};

describe('LoginScreen', () => {
  const mockSignInWithApple = jest.fn();
  const mockT = jest.fn((key: string) => key);

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuthContext.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      signInWithApple: mockSignInWithApple,
      signOut: jest.fn(),
      fetchUserMe: jest.fn(),
    });
    mockUseTranslation.mockReturnValue({
      t: mockT,
      i18n: {
        language: 'pt-BR',
        changeLanguage: jest.fn(),
      },
    } as any);
  });

  it('should render login screen correctly', () => {
    const { getByText } = render(<LoginScreen />, { wrapper: createWrapper() });

    expect(getByText('auth.title')).toBeTruthy();
    expect(getByText('auth.subtitle')).toBeTruthy();
  });

  it('should call signInWithApple when button is pressed', async () => {
    Platform.OS = 'ios';
    mockSignInWithApple.mockResolvedValue({});

    const { getByText } = render(<LoginScreen />, { wrapper: createWrapper() });
    const button = getByText('auth.continueWithApple');

    fireEvent.press(button);

    await waitFor(() => {
      expect(mockSignInWithApple).toHaveBeenCalled();
    });
  });

  it('should show error message when sign in fails', async () => {
    Platform.OS = 'ios';
    const error = new Error('Login failed');
    mockSignInWithApple.mockRejectedValue(error);

    const { getByText, queryByText } = render(<LoginScreen />, { wrapper: createWrapper() });
    const button = getByText('auth.continueWithApple');

    fireEvent.press(button);

    await waitFor(() => {
      expect(queryByText('Login failed')).toBeTruthy();
    });
  });

  it('should show alert on non-iOS platforms', () => {
    Platform.OS = 'android';

    render(<LoginScreen />, { wrapper: createWrapper() });

    // The component should show a message for non-iOS platforms
    expect(mockT).toHaveBeenCalledWith('auth.appleNotAvailable');
  });
});

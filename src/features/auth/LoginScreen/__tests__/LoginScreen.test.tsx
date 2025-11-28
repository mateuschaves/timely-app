import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Platform, Alert } from 'react-native';
import { LoginScreen } from '../index';
import { useAuthContext } from '../../context/AuthContext';
import { useTranslation } from '@/i18n';

jest.mock('../../context/AuthContext');
jest.mock('@/i18n');
jest.mock('react-native', () => {
  const RN = jest.requireActual('react-native');
  return {
    ...RN,
    Platform: {
      OS: 'ios',
      select: jest.fn(),
    },
    Alert: {
      alert: jest.fn(),
    },
    StyleSheet: {
      ...RN.StyleSheet,
      create: (styles: any) => styles,
      flatten: (style: any) => style,
    },
  };
});

const mockUseAuthContext = useAuthContext as jest.MockedFunction<typeof useAuthContext>;
const mockUseTranslation = useTranslation as jest.MockedFunction<typeof useTranslation>;

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
    const { getByText } = render(<LoginScreen />);

    expect(getByText('auth.title')).toBeTruthy();
    expect(getByText('auth.subtitle')).toBeTruthy();
  });

  it('should call signInWithApple when button is pressed', async () => {
    Platform.OS = 'ios';
    mockSignInWithApple.mockResolvedValue({});

    const { getByText } = render(<LoginScreen />);
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

    const { getByText, queryByText } = render(<LoginScreen />);
    const button = getByText('auth.continueWithApple');

    fireEvent.press(button);

    await waitFor(() => {
      expect(queryByText('Login failed')).toBeTruthy();
    });
  });

  it('should show alert on non-iOS platforms', () => {
    Platform.OS = 'android';

    render(<LoginScreen />);

    // The component should show a message for non-iOS platforms
    expect(mockT).toHaveBeenCalledWith('auth.appleNotAvailable');
  });
});

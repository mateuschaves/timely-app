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

const mockNavigate = jest.fn();
const mockGoBack = jest.fn();

jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
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
    View: 'View',
    Text: 'Text',
    TouchableOpacity: 'TouchableOpacity',
    ActivityIndicator: 'ActivityIndicator',
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

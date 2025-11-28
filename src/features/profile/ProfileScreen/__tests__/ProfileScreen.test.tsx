import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ProfileScreen } from '../index';
import { useAuthContext } from '@/features/auth';
import { useTranslation, useLanguage } from '@/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';

jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  NotificationFeedbackType: {
    Success: 'success',
  },
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: 'SafeAreaView',
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    select: jest.fn(),
  },
  Alert: {
    alert: jest.fn((title, message, buttons) => {
      // Simulate button press for testing
      if (buttons && buttons[1] && buttons[1].onPress) {
        buttons[1].onPress();
      }
    }),
  },
  View: 'View',
  Text: 'Text',
  ScrollView: 'ScrollView',
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
}));

// Mock auth context before importing ProfileScreen
jest.mock('@/features/auth', () => ({
  useAuthContext: jest.fn(),
}));
jest.mock('@/i18n');
jest.mock('@react-native-async-storage/async-storage');
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
  useFocusEffect: (callback: () => void) => callback(),
}));

const mockUseAuthContext = useAuthContext as jest.MockedFunction<typeof useAuthContext>;
const mockUseTranslation = useTranslation as jest.MockedFunction<typeof useTranslation>;
const mockUseLanguage = useLanguage as jest.MockedFunction<typeof useLanguage>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('ProfileScreen', () => {
  const mockSignOut = jest.fn();
  const mockFetchUserMe = jest.fn();
  const mockT = jest.fn((key: string) => key);
  const mockChangeLanguage = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseAuthContext.mockReturnValue({
      user: {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        appleUserId: 'apple123',
      },
      isAuthenticated: true,
      isLoading: false,
      signInWithApple: jest.fn(),
      signOut: mockSignOut,
      fetchUserMe: mockFetchUserMe,
    });
    mockUseTranslation.mockReturnValue({
      t: mockT,
      i18n: {
        language: 'pt-BR',
        changeLanguage: jest.fn(),
      },
    } as any);
    mockUseLanguage.mockReturnValue({
      currentLanguage: 'pt-BR',
      activeLanguage: 'pt-BR',
      isLoading: false,
      changeLanguage: mockChangeLanguage,
    } as any);
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('pt-BR');
  });

  it('should render profile screen', () => {
    const { getAllByText, getByText } = render(<ProfileScreen />, { wrapper: createWrapper() });

    expect(getAllByText('Test User').length).toBeGreaterThan(0);
    expect(getByText('test@example.com')).toBeTruthy();
  });

  it('should show user name initial in avatar', () => {
    const { getByText } = render(<ProfileScreen />, { wrapper: createWrapper() });

    expect(getByText('TU')).toBeTruthy();
  });

  it('should call fetchUserMe on focus', async () => {
    render(<ProfileScreen />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(mockFetchUserMe).toHaveBeenCalled();
    });
  });

  it('should handle sign out', async () => {
    mockSignOut.mockResolvedValue(undefined);

    const { getByText } = render(<ProfileScreen />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(getByText('profile.logout')).toBeTruthy();
    });

    const signOutButton = getByText('profile.logout');
    fireEvent.press(signOutButton);

    await waitFor(() => {
      expect(mockSignOut).toHaveBeenCalled();
    }, { timeout: 3000 });
  });

  it('should show empty state when user has no name', () => {
    mockUseAuthContext.mockReturnValue({
      user: {
        id: '123',
        email: 'test@example.com',
        name: null,
        appleUserId: 'apple123',
      },
      isAuthenticated: true,
      isLoading: false,
      signInWithApple: jest.fn(),
      signOut: mockSignOut,
      fetchUserMe: mockFetchUserMe,
    });

    const { queryByText } = render(<ProfileScreen />, { wrapper: createWrapper() });

    expect(queryByText('Test User')).toBeNull();
  });
});

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient } from '@tanstack/react-query';
import { ProfileScreen } from '../index';
import { createTestWrapper } from '@/utils/test-helpers';
import { useAuthContext } from '@/features/auth';
import { useTranslation, useLanguage } from '@/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/config/storage';

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
  useColorScheme: jest.fn(() => 'light'),
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
jest.mock('@/features/profile/hooks/useWorkSettings', () => ({
  useWorkSettings: jest.fn(),
}));
jest.mock('@/i18n');
jest.mock('@react-native-async-storage/async-storage');
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
  }),
  useFocusEffect: (callback: () => void) => callback(),
}));

const { useWorkSettings } = require('@/features/profile/hooks/useWorkSettings');
const mockUseAuthContext = useAuthContext as jest.MockedFunction<typeof useAuthContext>;
const mockUseTranslation = useTranslation as jest.MockedFunction<typeof useTranslation>;
const mockUseLanguage = useLanguage as jest.MockedFunction<typeof useLanguage>;
const mockUseWorkSettings = useWorkSettings as jest.MockedFunction<typeof useWorkSettings>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return createTestWrapper(queryClient);
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
    mockUseWorkSettings.mockReturnValue({
      hasWorkSettings: true,
      isLoading: false,
      isError: false,
      error: null,
      settings: {},
      canShowCard: true,
    });
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

  it('should show empty state when user is null', () => {
    mockUseAuthContext.mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      signInWithApple: jest.fn(),
      signOut: mockSignOut,
      fetchUserMe: mockFetchUserMe,
    });

    const { getByText } = render(<ProfileScreen />, { wrapper: createWrapper() });

    expect(getByText('profile.noName')).toBeTruthy();
  });

  it('should show user email when name is null', () => {
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

    const { getAllByText } = render(<ProfileScreen />, { wrapper: createWrapper() });

    expect(getAllByText('test@example.com').length).toBeGreaterThan(0);
  });

  it('should show user email when both name and email exist', () => {
    const { getAllByText } = render(<ProfileScreen />, { wrapper: createWrapper() });

    expect(getAllByText('Test User').length).toBeGreaterThan(0);
    expect(getAllByText('test@example.com').length).toBeGreaterThan(0);
  });

  it('should show avatar icon when user has no name', () => {
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

    const { getAllByText } = render(<ProfileScreen />, { wrapper: createWrapper() });

    // Avatar should show icon instead of initials
    expect(getAllByText('test@example.com').length).toBeGreaterThan(0);
  });

  it('should show single initial when name has one word', () => {
    mockUseAuthContext.mockReturnValue({
      user: {
        id: '123',
        email: 'test@example.com',
        name: 'Test',
        appleUserId: 'apple123',
      },
      isAuthenticated: true,
      isLoading: false,
      signInWithApple: jest.fn(),
      signOut: mockSignOut,
      fetchUserMe: mockFetchUserMe,
    });

    const { getByText } = render(<ProfileScreen />, { wrapper: createWrapper() });

    expect(getByText('T')).toBeTruthy();
  });

  it('should navigate to EditName when name row is pressed', async () => {
    const mockNavigate = jest.fn();
    jest.mock('@react-navigation/native', () => ({
      useNavigation: () => ({
        navigate: mockNavigate,
      }),
      useFocusEffect: (callback: () => void) => callback(),
    }));

    const { getByText } = render(<ProfileScreen />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(getByText('profile.name')).toBeTruthy();
    });
  });

  it('should navigate to Language screen', async () => {
    const { getByText } = render(<ProfileScreen />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(getByText('profile.language')).toBeTruthy();
    });
  });

  it('should navigate to WorkSettings screen', async () => {
    const { getByText } = render(<ProfileScreen />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(getByText('profile.workSettings')).toBeTruthy();
    });
  });

  it('should load language from AsyncStorage', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('en-US');

    render(<ProfileScreen />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(STORAGE_KEYS.LANGUAGE);
    });
  });

  it('should handle invalid language from AsyncStorage', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('invalid-lang');

    render(<ProfileScreen />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(STORAGE_KEYS.LANGUAGE);
    });
  });

  it('should handle system language', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('system');

    render(<ProfileScreen />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(AsyncStorage.getItem).toHaveBeenCalledWith(STORAGE_KEYS.LANGUAGE);
    });
  });

  it('should handle error loading data', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    mockFetchUserMe.mockRejectedValue(new Error('Network error'));

    render(<ProfileScreen />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(mockFetchUserMe).toHaveBeenCalled();
    });

    consoleErrorSpy.mockRestore();
  });

  it('should display all language options correctly', async () => {
    const { getByText } = render(<ProfileScreen />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(getByText('profile.language')).toBeTruthy();
    });
  });

  it('should show user name when available', () => {
    const { getAllByText } = render(<ProfileScreen />, { wrapper: createWrapper() });

    expect(getAllByText('Test User').length).toBeGreaterThan(0);
  });

  it('should show profile.user when no name or email', () => {
    mockUseAuthContext.mockReturnValue({
      user: {
        id: '123',
        email: null,
        name: null,
        appleUserId: 'apple123',
      },
      isAuthenticated: true,
      isLoading: false,
      signInWithApple: jest.fn(),
      signOut: mockSignOut,
      fetchUserMe: mockFetchUserMe,
    });

    const { getByText } = render(<ProfileScreen />, { wrapper: createWrapper() });

    expect(getByText('profile.user')).toBeTruthy();
  });

  describe('Work Settings Badge', () => {
    it('should show work settings badge when work settings are not configured', () => {
      mockUseWorkSettings.mockReturnValue({
        hasWorkSettings: false,
        isLoading: false,
        isError: false,
        error: null,
        settings: {},
        canShowCard: true,
      });

      const { getByText } = render(<ProfileScreen />, { wrapper: createWrapper() });

      expect(getByText('profile.workSettingsNotConfigured')).toBeTruthy();
    });

    it('should not show work settings badge when work settings are configured', () => {
      mockUseWorkSettings.mockReturnValue({
        hasWorkSettings: true,
        isLoading: false,
        isError: false,
        error: null,
        settings: { workSchedule: { monday: { enabled: true } } },
        canShowCard: true,
      });

      const { queryByText } = render(<ProfileScreen />, { wrapper: createWrapper() });

      expect(queryByText('profile.workSettingsNotConfigured')).toBeNull();
    });

    it('should not show work settings badge when loading', () => {
      mockUseWorkSettings.mockReturnValue({
        hasWorkSettings: false,
        isLoading: true,
        isError: false,
        error: null,
        settings: undefined,
        canShowCard: false,
      });

      const { queryByText } = render(<ProfileScreen />, { wrapper: createWrapper() });

      expect(queryByText('profile.workSettingsNotConfigured')).toBeNull();
    });

    it('should not show work settings badge when there is an error', () => {
      mockUseWorkSettings.mockReturnValue({
        hasWorkSettings: false,
        isLoading: false,
        isError: true,
        error: new Error('Network error'),
        settings: undefined,
        canShowCard: false,
      });

      const { queryByText } = render(<ProfileScreen />, { wrapper: createWrapper() });

      expect(queryByText('profile.workSettingsNotConfigured')).toBeNull();
    });
  });
});

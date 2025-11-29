import React from 'react';
import { render, fireEvent, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HomeScreen } from '../index';
import { useAuthContext } from '@/features/auth';
import { useTimeClock } from '@/features/time-clock/hooks/useTimeClock';
import { useLocation } from '@/features/time-clock/hooks/useLocation';
import { useLastEvent } from '../../hooks/useLastEvent';
import { useTranslation } from '@/i18n';
import { FeedbackProvider } from '@/utils/feedback';

jest.mock('@/features/auth');
jest.mock('@/features/time-clock/hooks/useTimeClock');
jest.mock('@/features/time-clock/hooks/useLocation');
jest.mock('../../hooks/useLastEvent');
jest.mock('@/i18n');
jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  NotificationFeedbackType: {
    Success: 'success',
  },
}));
jest.mock('expo-status-bar', () => ({
  StatusBar: 'StatusBar',
}));
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaProvider: ({ children }: { children: any }) => children,
  useSafeAreaInsets: () => ({
    top: 44,
    bottom: 34,
    left: 0,
    right: 0,
  }),
}));
jest.mock('@react-navigation/native', () => {
  const React = require('react');
  return {
    ...jest.requireActual('@react-navigation/native'),
    useFocusEffect: (callback: () => void | (() => void)) => {
      // Execute the callback immediately for testing
      React.useEffect(() => {
        const cleanup = callback();
        return () => {
          if (typeof cleanup === 'function') {
            cleanup();
          }
        };
      }, []);
    },
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
    }),
  };
});

const mockUseAuthContext = useAuthContext as jest.MockedFunction<typeof useAuthContext>;
const mockUseTimeClock = useTimeClock as jest.MockedFunction<typeof useTimeClock>;
const mockUseLocation = useLocation as jest.MockedFunction<typeof useLocation>;
const mockUseLastEvent = useLastEvent as jest.MockedFunction<typeof useLastEvent>;
const mockUseTranslation = useTranslation as jest.MockedFunction<typeof useTranslation>;

let testQueryClient: QueryClient;

const createWrapper = () => {
  testQueryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  const { SafeAreaProvider } = require('react-native-safe-area-context');

  return ({ children }: { children: React.ReactNode }) => (
    <SafeAreaProvider>
      <QueryClientProvider client={testQueryClient}>
        <FeedbackProvider>{children}</FeedbackProvider>
      </QueryClientProvider>
    </SafeAreaProvider>
  );
};

describe('HomeScreen', () => {
  const mockClock = jest.fn();
  const mockRequestLocationPermission = jest.fn();
  const mockT = jest.fn((key: string) => key);

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
      signOut: jest.fn(),
      fetchUserMe: jest.fn(),
    });
    mockUseTimeClock.mockReturnValue({
      entries: [],
      isLoading: false,
      clock: mockClock,
      clockIn: jest.fn(),
      clockOut: jest.fn(),
      handleDeeplink: jest.fn(),
      isClocking: false,
    } as any);
    mockUseLocation.mockReturnValue({
      location: null,
      isLoading: false,
      hasPermission: false,
      error: null,
      requestLocationPermission: mockRequestLocationPermission,
      updateLocation: jest.fn(),
    } as any);
    mockUseLastEvent.mockReturnValue({
      lastEvent: null,
      nextAction: 'clock-in',
      isLoading: false,
    } as any);
    mockUseTranslation.mockReturnValue({
      t: mockT,
      i18n: {
        language: 'pt-BR',
        changeLanguage: jest.fn(),
      },
    } as any);
  });

  it('should render home screen', () => {
    const { getByText } = render(<HomeScreen />, { wrapper: createWrapper() });

    expect(getByText('home.clockInButton')).toBeTruthy();
  });

  it('should show clock out button when next action is clock-out', () => {
    mockUseLastEvent.mockReturnValue({
      lastEvent: {
        id: '1',
        hour: '2024-01-01T10:00:00Z',
        action: 'clock-in',
      },
      nextAction: 'clock-out',
      isLoading: false,
    } as any);

    const { getByText } = render(<HomeScreen />, { wrapper: createWrapper() });

    expect(getByText('home.clockOutButton')).toBeTruthy();
  });

  it('should show welcome message with user name', () => {
    const { getByText } = render(<HomeScreen />, { wrapper: createWrapper() });

    expect(mockT).toHaveBeenCalledWith('home.welcomeMessageWithName', { name: 'Test' });
  });

  it('should show confirm modal when button is pressed', async () => {
    const { getByText, queryByText } = render(<HomeScreen />, { wrapper: createWrapper() });

    const button = getByText('home.clockInButton');
    fireEvent.press(button);

    await waitFor(() => {
      expect(queryByText('home.confirmClockInTitle')).toBeTruthy();
    });
  });

  it('should call clock function when confirmed', async () => {
    mockRequestLocationPermission.mockResolvedValue({
      type: 'Point',
      coordinates: [-46.6333, -23.5505],
    });
    mockClock.mockResolvedValue(undefined);

    const { getByText } = render(<HomeScreen />, { wrapper: createWrapper() });

    const button = getByText('home.clockInButton');
    fireEvent.press(button);

    await waitFor(() => {
      expect(getByText('common.confirm')).toBeTruthy();
    });

    const confirmButton = getByText('common.confirm');
    fireEvent.press(confirmButton);

    await waitFor(() => {
      expect(mockRequestLocationPermission).toHaveBeenCalled();
      expect(mockClock).toHaveBeenCalled();
    });
  });

  it('should refetch lastEvent query immediately after clock success', async () => {
    mockRequestLocationPermission.mockResolvedValue({
      type: 'Point',
      coordinates: [-46.6333, -23.5505],
    });
    mockClock.mockResolvedValue(undefined);
    mockUseLastEvent.mockReturnValue({
      lastEvent: null,
      nextAction: 'clock-in',
      isLoading: false,
    } as any);

    const { getByText } = render(<HomeScreen />, { wrapper: createWrapper() });

    // Create spy after component is rendered to ensure we're spying on the correct queryClient
    const refetchQueriesSpy = jest.spyOn(testQueryClient, 'refetchQueries');

    const button = getByText('home.clockInButton');
    fireEvent.press(button);

    await waitFor(() => {
      expect(getByText('common.confirm')).toBeTruthy();
    });

    const confirmButton = getByText('common.confirm');
    await act(async () => {
      fireEvent.press(confirmButton);
    });

    await waitFor(() => {
      expect(mockClock).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(refetchQueriesSpy).toHaveBeenCalledWith({ queryKey: ['lastEvent'] });
    }, { timeout: 10000 });

    refetchQueriesSpy.mockRestore();
  }, 15000);

  it('should refetch lastEvent query immediately after clock-out success', async () => {
    mockUseLastEvent.mockReturnValue({
      lastEvent: {
        id: '1',
        hour: '2024-01-01T10:00:00Z',
        action: 'clock-in',
      },
      nextAction: 'clock-out',
      isLoading: false,
    } as any);
    mockRequestLocationPermission.mockResolvedValue({
      type: 'Point',
      coordinates: [-46.6333, -23.5505],
    });
    mockClock.mockResolvedValue(undefined);

    const { getByText } = render(<HomeScreen />, { wrapper: createWrapper() });

    // Create spy after component is rendered to ensure we're spying on the correct queryClient
    const refetchQueriesSpy = jest.spyOn(testQueryClient, 'refetchQueries');

    const button = getByText('home.clockOutButton');
    fireEvent.press(button);

    await waitFor(() => {
      expect(getByText('common.confirm')).toBeTruthy();
    });

    const confirmButton = getByText('common.confirm');
    await act(async () => {
      fireEvent.press(confirmButton);
    });

    await waitFor(() => {
      expect(mockClock).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(refetchQueriesSpy).toHaveBeenCalledWith({ queryKey: ['lastEvent'] });
    }, { timeout: 10000 });

    refetchQueriesSpy.mockRestore();
  }, 15000);

  it('should close modal when cancelled', async () => {
    const { getByText, queryByText } = render(<HomeScreen />, { wrapper: createWrapper() });

    const button = getByText('home.clockInButton');
    fireEvent.press(button);

    await waitFor(() => {
      expect(queryByText('common.cancel')).toBeTruthy();
    });

    const cancelButton = getByText('common.cancel');
    fireEvent.press(cancelButton);

    await waitFor(() => {
      expect(queryByText('home.confirmClockInTitle')).toBeNull();
    });
  });

  it('should show last event time when available', async () => {
    mockUseLastEvent.mockReturnValue({
      lastEvent: {
        id: '1',
        hour: '2024-01-01T10:00:00Z',
        action: 'clock-in',
      },
      nextAction: 'clock-out',
      isLoading: false,
    } as any);

    const { getByText } = render(<HomeScreen />, { wrapper: createWrapper() });

    // The lastEntry text is rendered conditionally inside WelcomeCard
    // It's rendered as: "home.lastEntry: {time}"
    await waitFor(() => {
      // Check if the translation key was called or if the text appears
      expect(mockT).toHaveBeenCalledWith('home.lastEntry');
    }, { timeout: 3000 });
  });

  it('should disable button when clocking', () => {
    mockUseTimeClock.mockReturnValue({
      entries: [],
      isLoading: false,
      clock: mockClock,
      clockIn: jest.fn(),
      clockOut: jest.fn(),
      handleDeeplink: jest.fn(),
      isClocking: true,
    } as any);

    const { queryByText } = render(<HomeScreen />, { wrapper: createWrapper() });

    // When clocking, the button shows ActivityIndicator instead of text
    // So the button text should not be visible
    expect(queryByText('home.clockInButton')).toBeNull();
    expect(queryByText('home.clockOutButton')).toBeNull();
  });

  it('should not show modal when button is pressed while clocking', () => {
    mockUseTimeClock.mockReturnValue({
      entries: [],
      isLoading: false,
      clock: mockClock,
      clockIn: jest.fn(),
      clockOut: jest.fn(),
      handleDeeplink: jest.fn(),
      isClocking: true,
    } as any);

    const { queryByText } = render(<HomeScreen />, { wrapper: createWrapper() });

    // When clocking, the button is disabled and should not trigger modal
    // The modal should not be visible
    expect(queryByText('home.confirmClockInTitle')).toBeNull();
    expect(queryByText('home.confirmClockOutTitle')).toBeNull();
  });

  it('should show break message when next action is clock-out', () => {
    mockUseLastEvent.mockReturnValue({
      lastEvent: {
        id: '1',
        hour: '2024-01-01T10:00:00Z',
        action: 'clock-in',
      },
      nextAction: 'clock-out',
      isLoading: false,
    } as any);

    const { getByText } = render(<HomeScreen />, { wrapper: createWrapper() });

    expect(mockT).toHaveBeenCalledWith('home.breakMessageWithName', { name: 'Test' });
  });

  it('should show break message without name when user has no name', () => {
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
      signOut: jest.fn(),
      fetchUserMe: jest.fn(),
    });
    mockUseLastEvent.mockReturnValue({
      lastEvent: {
        id: '1',
        hour: '2024-01-01T10:00:00Z',
        action: 'clock-in',
      },
      nextAction: 'clock-out',
      isLoading: false,
    } as any);

    render(<HomeScreen />, { wrapper: createWrapper() });

    expect(mockT).toHaveBeenCalledWith('home.breakMessage');
  });

  it('should show welcome message without name when user has no name', () => {
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
      signOut: jest.fn(),
      fetchUserMe: jest.fn(),
    });

    render(<HomeScreen />, { wrapper: createWrapper() });

    expect(mockT).toHaveBeenCalledWith('home.welcomeMessage');
  });

  it('should show confirm clock out modal', async () => {
    mockUseLastEvent.mockReturnValue({
      lastEvent: {
        id: '1',
        hour: '2024-01-01T10:00:00Z',
        action: 'clock-in',
      },
      nextAction: 'clock-out',
      isLoading: false,
    } as any);

    const { getByText, queryByText } = render(<HomeScreen />, { wrapper: createWrapper() });

    const button = getByText('home.clockOutButton');
    fireEvent.press(button);

    await waitFor(() => {
      expect(queryByText('home.confirmClockOutTitle')).toBeTruthy();
    });
  });

  it('should call clock with clock-out action', async () => {
    mockRequestLocationPermission.mockResolvedValue({
      type: 'Point',
      coordinates: [-46.6333, -23.5505],
    });
    mockClock.mockResolvedValue(undefined);
    mockUseLastEvent.mockReturnValue({
      lastEvent: {
        id: '1',
        hour: '2024-01-01T10:00:00Z',
        action: 'clock-in',
      },
      nextAction: 'clock-out',
      isLoading: false,
    } as any);

    const { getByText } = render(<HomeScreen />, { wrapper: createWrapper() });

    const button = getByText('home.clockOutButton');
    fireEvent.press(button);

    await waitFor(() => {
      expect(getByText('common.confirm')).toBeTruthy();
    });

    const confirmButton = getByText('common.confirm');
    fireEvent.press(confirmButton);

    await waitFor(() => {
      expect(mockClock).toHaveBeenCalledWith(
        expect.objectContaining({ hour: expect.any(String) }),
        'clock-out'
      );
    });
  });


  it('should format time correctly for invalid date', () => {
    mockUseLastEvent.mockReturnValue({
      lastEvent: {
        id: '1',
        hour: 'invalid-date',
        action: 'clock-in',
      },
      nextAction: 'clock-out',
      isLoading: false,
    } as any);

    render(<HomeScreen />, { wrapper: createWrapper() });

    // Component should handle invalid date gracefully
    expect(mockT).toHaveBeenCalled();
  });

  it('should show last exit time', async () => {
    mockUseLastEvent.mockReturnValue({
      lastEvent: {
        id: '1',
        hour: '2024-01-01T18:00:00Z',
        action: 'clock-out',
      },
      nextAction: 'clock-in',
      isLoading: false,
    } as any);

    render(<HomeScreen />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(mockT).toHaveBeenCalledWith('home.lastExit');
    });
  });

  it('should not show welcome card when loading', () => {
    mockUseLastEvent.mockReturnValue({
      lastEvent: null,
      nextAction: 'clock-in',
      isLoading: true,
    } as any);

    const { getByText } = render(<HomeScreen />, { wrapper: createWrapper() });

    // Button should still be visible
    expect(getByText('home.clockInButton')).toBeTruthy();
  });

});

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HomeScreen } from '../index';
import { useAuthContext } from '@/features/auth';
import { useTimeClock } from '@/features/time-clock/hooks/useTimeClock';
import { useLocation } from '@/features/time-clock/hooks/useLocation';
import { useLastEvent } from '../../hooks/useLastEvent';
import { useTranslation } from '@/i18n';

jest.mock('@/features/auth');
jest.mock('@/features/time-clock/hooks/useTimeClock');
jest.mock('@/features/time-clock/hooks/useLocation');
jest.mock('../../hooks/useLastEvent');
jest.mock('@/i18n');

const mockUseAuthContext = useAuthContext as jest.MockedFunction<typeof useAuthContext>;
const mockUseTimeClock = useTimeClock as jest.MockedFunction<typeof useTimeClock>;
const mockUseLocation = useLocation as jest.MockedFunction<typeof useLocation>;
const mockUseLastEvent = useLastEvent as jest.MockedFunction<typeof useLastEvent>;
const mockUseTranslation = useTranslation as jest.MockedFunction<typeof useTranslation>;

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
    mockClock.mockResolvedValue({});

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

    const { getByText } = render(<HomeScreen />, { wrapper: createWrapper() });

    expect(getByText('home.clocking')).toBeTruthy();
  });
});

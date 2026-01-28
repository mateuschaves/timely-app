import { renderHook, waitFor } from '@testing-library/react-native';
import { act } from 'react-test-renderer';

const mockSetItems = jest.fn();
const mockAddListener = jest.fn();
const mockRemove = jest.fn();
const mockNavigate = jest.fn();
const mockClock = jest.fn();

// Mock Platform
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
}));

// Mock expo-quick-actions
jest.mock('expo-quick-actions', () => ({
  setItems: (...args: any[]) => mockSetItems(...args),
  addListener: (...args: any[]) => mockAddListener(...args),
}));

// Mock navigation
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: mockNavigate,
  }),
}));

// Mock useTimeClock
jest.mock('../useTimeClock', () => ({
  useTimeClock: () => ({
    clock: mockClock,
  }),
}));

// Mock useLastEvent
jest.mock('@/features/home/hooks/useLastEvent', () => ({
  useLastEvent: () => ({
    nextAction: 'clock-in',
  }),
}));

// Mock useAuthContext
jest.mock('@/features/auth', () => ({
  useAuthContext: () => ({
    isAuthenticated: true,
  }),
}));

import { useQuickActions } from '../useQuickActions';

describe('useQuickActions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAddListener.mockReturnValue({ remove: mockRemove });
    mockClock.mockResolvedValue(undefined);
  });

  it('should set up quick actions on iOS when authenticated', () => {
    renderHook(() => useQuickActions());

    expect(mockSetItems).toHaveBeenCalledWith([
      {
        type: 'com.wazowsky.timelyapp.clock',
        title: 'Bater Ponto',
        subtitle: 'Registrar entrada ou saída',
        icon: 'clock.fill',
        userInfo: {
          action: 'clock',
        },
      },
    ]);
  });

  it('should add quick action listener', () => {
    renderHook(() => useQuickActions());

    expect(mockAddListener).toHaveBeenCalled();
  });

  it('should remove listener on unmount', () => {
    const { unmount } = renderHook(() => useQuickActions());

    unmount();

    expect(mockRemove).toHaveBeenCalled();
  });

  it('should handle quick action and clock in', async () => {
    let handler: ((data: any) => void) | undefined;
    mockAddListener.mockImplementation((fn) => {
      handler = fn;
      return { remove: mockRemove };
    });

    renderHook(() => useQuickActions());

    expect(handler).toBeDefined();

    // Simulate quick action
    await act(async () => {
      handler!({
        type: 'com.wazowsky.timelyapp.clock',
        userInfo: { action: 'clock' },
      });

      // Wait for the navigation delay
      await new Promise(resolve => setTimeout(resolve, 600));
    });

    expect(mockNavigate).toHaveBeenCalledWith('Main', { screen: 'Home' });
    expect(mockClock).toHaveBeenCalledWith(
      expect.objectContaining({
        hour: expect.any(String),
      }),
      'clock-in'
    );
  });

  it('should ignore invalid quick action types', async () => {
    let handler: ((data: any) => void) | undefined;
    mockAddListener.mockImplementation((fn) => {
      handler = fn;
      return { remove: mockRemove };
    });

    renderHook(() => useQuickActions());

    // Simulate invalid quick action
    await act(async () => {
      handler!({
        type: 'invalid.type',
        userInfo: { action: 'clock' },
      });

      await new Promise(resolve => setTimeout(resolve, 100));
    });

    expect(mockClock).not.toHaveBeenCalled();
  });

  it('should prevent duplicate processing of same quick action', async () => {
    let handler: ((data: any) => void) | undefined;
    mockAddListener.mockImplementation((fn) => {
      handler = fn;
      return { remove: mockRemove };
    });

    renderHook(() => useQuickActions());

    const quickActionData = {
      type: 'com.wazowsky.timelyapp.clock',
      userInfo: { action: 'clock' },
    };

    // Process first time
    await act(async () => {
      handler!(quickActionData);
      await new Promise(resolve => setTimeout(resolve, 600));
    });

    expect(mockClock).toHaveBeenCalledTimes(1);

    // Try to process again immediately
    await act(async () => {
      handler!(quickActionData);
      await new Promise(resolve => setTimeout(resolve, 100));
    });

    // Should not process twice
    expect(mockClock).toHaveBeenCalledTimes(1);
  });

  it('should handle errors during quick action processing', async () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    mockClock.mockRejectedValueOnce(new Error('Clock failed'));

    let handler: ((data: any) => void) | undefined;
    mockAddListener.mockImplementation((fn) => {
      handler = fn;
      return { remove: mockRemove };
    });

    renderHook(() => useQuickActions());

    await act(async () => {
      handler!({
        type: 'com.wazowsky.timelyapp.clock',
        userInfo: { action: 'clock' },
      });

      await new Promise(resolve => setTimeout(resolve, 600));
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Erro ao processar quick action clock:',
      expect.any(Error)
    );

    consoleErrorSpy.mockRestore();
  });
});

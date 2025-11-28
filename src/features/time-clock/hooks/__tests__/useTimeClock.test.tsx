import { renderHook, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as Linking from 'expo-linking';
import { useTimeClock } from '../useTimeClock';
import { getTimeClockEntries } from '@/api/get-time-clock-entries';
import { clockIn } from '@/api/clock-in';
import { clockOut } from '@/api/clock-out';
import { clock } from '@/api/clock';
import { useLocation } from '../useLocation';

jest.mock('@/api/get-time-clock-entries');
jest.mock('@/api/clock-in');
jest.mock('@/api/clock-out');
jest.mock('@/api/clock');
jest.mock('../useLocation');
jest.mock('expo-linking', () => ({
  parse: jest.fn(),
}));

const mockGetTimeClockEntries = getTimeClockEntries as jest.MockedFunction<typeof getTimeClockEntries>;
const mockClockIn = clockIn as jest.MockedFunction<typeof clockIn>;
const mockClockOut = clockOut as jest.MockedFunction<typeof clockOut>;
const mockClock = clock as jest.MockedFunction<typeof clock>;
const mockUseLocation = useLocation as jest.MockedFunction<typeof useLocation>;
const mockLinkingParse = Linking.parse as jest.MockedFunction<typeof Linking.parse>;

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

describe('useTimeClock', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseLocation.mockReturnValue({
      location: {
        type: 'Point',
        coordinates: [-46.6333, -23.5505],
      },
      isLoading: false,
      hasPermission: true,
      error: null,
      requestLocationPermission: jest.fn().mockResolvedValue({
        type: 'Point',
        coordinates: [-46.6333, -23.5505],
      }),
      updateLocation: jest.fn().mockResolvedValue({
        type: 'Point',
        coordinates: [-46.6333, -23.5505],
      }),
    } as any);
  });

  it('should initialize with empty entries', () => {
    const { result } = renderHook(() => useTimeClock(), { wrapper: createWrapper() });

    expect(result.current.entries).toEqual([]);
    expect(result.current.isLoading).toBe(false);
    expect(result.current.isClocking).toBe(false);
  });

  it('should handle deeplink with clock-in action', async () => {
    const url = 'timely://?time=2024-01-01T10:00:00Z&type=entry';
    mockLinkingParse.mockReturnValue({
      path: 'timely://',
      queryParams: {
        time: '2024-01-01T10:00:00Z',
        type: 'entry',
      },
    } as any);

    mockClockIn.mockResolvedValue({} as any);

    const { result } = renderHook(() => useTimeClock(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.handleDeeplink(url);
    });

    await waitFor(() => {
      expect(mockClockIn).toHaveBeenCalled();
      const callArgs = (mockClockIn as jest.Mock).mock.calls[0][0];
      expect(callArgs.hour).toBe('2024-01-01T10:00:00Z');
    });
  });

  it('should handle deeplink with clock-out action', async () => {
    const url = 'timely://?time=2024-01-01T18:00:00Z&type=exit';
    mockLinkingParse.mockReturnValue({
      path: 'timely://',
      queryParams: {
        time: '2024-01-01T18:00:00Z',
        type: 'exit',
      },
    } as any);

    mockClockOut.mockResolvedValue({} as any);

    const { result } = renderHook(() => useTimeClock(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.handleDeeplink(url);
    });

    await waitFor(() => {
      expect(mockClockOut).toHaveBeenCalled();
    });

    const callArgs = (mockClockOut as jest.Mock).mock.calls[0][0];
    expect(callArgs.hour).toBe('2024-01-01T18:00:00Z');
    // handleDeeplink doesn't add location automatically if not in params
    expect(callArgs.location).toBeUndefined();
  });

  it('should handle deeplink with location', async () => {
    const url = 'timely://?time=2024-01-01T10:00:00Z&type=entry';
    const location = {
      type: 'Point',
      coordinates: [-46.6333, -23.5505],
    };

    mockLinkingParse.mockReturnValue({
      path: 'timely://',
      queryParams: {
        time: '2024-01-01T10:00:00Z',
        type: 'entry',
        location,
      },
    } as any);

    mockClockIn.mockResolvedValue({} as any);

    const { result } = renderHook(() => useTimeClock(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.handleDeeplink(url);
    });

    await waitFor(() => {
      expect(mockClockIn).toHaveBeenCalled();
      const callArgs = (mockClockIn as jest.Mock).mock.calls[0][0];
      expect(callArgs.hour).toBe('2024-01-01T10:00:00Z');
      expect(callArgs.location).toEqual(location);
    });
  });

  it('should handle deeplink without time parameter', async () => {
    const url = 'timely://?type=entry';
    mockLinkingParse.mockReturnValue({
      path: 'timely://',
      queryParams: {
        type: 'entry',
      },
    } as any);

    const { result } = renderHook(() => useTimeClock(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.handleDeeplink(url);
    });

    expect(mockClockIn).not.toHaveBeenCalled();
    expect(mockClockOut).not.toHaveBeenCalled();
  });

  it('should call onSuccess callback after deeplink', async () => {
    const url = 'timely://?time=2024-01-01T10:00:00Z&type=entry';
    const onSuccess = jest.fn();

    mockLinkingParse.mockReturnValue({
      path: 'timely://',
      queryParams: {
        time: '2024-01-01T10:00:00Z',
        type: 'entry',
      },
    } as any);

    mockClockIn.mockResolvedValue({} as any);

    const { result } = renderHook(() => useTimeClock(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.handleDeeplink(url, onSuccess);
    });

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('should clock in with location', async () => {
    mockClockIn.mockResolvedValue({} as any);

    const { result } = renderHook(() => useTimeClock(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.clockIn({
        hour: '2024-01-01T10:00:00Z',
      });
    });

    await waitFor(() => {
      expect(mockClockIn).toHaveBeenCalled();
    });

    const callArgs = (mockClockIn as jest.Mock).mock.calls[0][0];
    expect(callArgs.hour).toBe('2024-01-01T10:00:00Z');
    expect(callArgs.location).toEqual({
      type: 'Point',
      coordinates: [-46.6333, -23.5505],
    });
  });

  it('should clock out with location', async () => {
    mockClockOut.mockResolvedValue({} as any);

    const { result } = renderHook(() => useTimeClock(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.clockOut({
        hour: '2024-01-01T18:00:00Z',
      });
    });

    await waitFor(() => {
      expect(mockClockOut).toHaveBeenCalled();
    });

    const callArgs = (mockClockOut as jest.Mock).mock.calls[0][0];
    expect(callArgs.hour).toBe('2024-01-01T18:00:00Z');
    expect(callArgs.location).toEqual({
      type: 'Point',
      coordinates: [-46.6333, -23.5505],
    });
  });

  it('should clock with action and location', async () => {
    mockClock.mockResolvedValue({} as any);

    const { result } = renderHook(() => useTimeClock(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.clock(
        {
          hour: '2024-01-01T10:00:00Z',
        },
        'clock-in'
      );
    });

    await waitFor(() => {
      expect(mockClock).toHaveBeenCalled();
    });

    const callArgs = (mockClock as jest.Mock).mock.calls[0][0];
    expect(callArgs.hour).toBe('2024-01-01T10:00:00Z');
    expect(callArgs.location).toEqual({
      type: 'Point',
      coordinates: [-46.6333, -23.5505],
    });
  });

  it('should handle deeplink error gracefully', async () => {
    const url = 'timely://?time=2024-01-01T10:00:00Z&type=entry';
    mockLinkingParse.mockReturnValue({
      path: 'timely://',
      queryParams: {
        time: '2024-01-01T10:00:00Z',
        type: 'entry',
      },
    } as any);

    mockClockIn.mockRejectedValue(new Error('API error'));

    const { result } = renderHook(() => useTimeClock(), { wrapper: createWrapper() });

    await act(async () => {
      await result.current.handleDeeplink(url);
    });

    // Should not throw
    expect(result.current).toBeDefined();
  });

  it('should show isClocking when mutation is pending', async () => {
    mockClockIn.mockImplementation(() => new Promise(() => { })); // Never resolves

    const { result } = renderHook(() => useTimeClock(), { wrapper: createWrapper() });

    act(() => {
      result.current.clockIn({
        hour: '2024-01-01T10:00:00Z',
      });
    });

    await waitFor(() => {
      expect(result.current.isClocking).toBe(true);
    });
  });
});

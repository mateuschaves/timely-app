import { renderHook, waitFor, act } from '@testing-library/react-native';

const mockGetForegroundPermissionsAsync = jest.fn();
const mockRequestForegroundPermissionsAsync = jest.fn();
const mockGetCurrentPositionAsync = jest.fn();

// Mock Platform to ensure Location module is loaded
jest.mock('react-native', () => {
  return {
    Platform: {
      OS: 'ios',
      select: jest.fn(),
    },
    View: 'View',
    Text: 'Text',
    StyleSheet: {
      create: (styles: any) => styles,
      flatten: (style: any) => style,
    },
  };
});

// Mock expo-location - must be before importing useLocation
jest.mock('expo-location', () => ({
  getForegroundPermissionsAsync: mockGetForegroundPermissionsAsync,
  requestForegroundPermissionsAsync: mockRequestForegroundPermissionsAsync,
  getCurrentPositionAsync: mockGetCurrentPositionAsync,
  Accuracy: {
    Balanced: 6,
  },
}));

// Import the hook AFTER mocks are set up
import { useLocation } from '../useLocation';

describe('useLocation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetForegroundPermissionsAsync.mockReset();
    mockRequestForegroundPermissionsAsync.mockReset();
    mockGetCurrentPositionAsync.mockReset();
  });

  it('should request location permission and get location successfully', async () => {
    mockGetForegroundPermissionsAsync.mockResolvedValue({
      status: 'granted',
    });

    mockGetCurrentPositionAsync.mockResolvedValue({
      coords: {
        latitude: -23.5505,
        longitude: -46.6333,
        altitude: null,
        accuracy: 10,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: Date.now(),
    });

    const { result } = renderHook(() => useLocation());

    let location: any;
    await act(async () => {
      location = await result.current.requestLocationPermission();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(location).not.toBeNull();
    expect(location?.type).toBe('Point');
    expect(location?.coordinates).toEqual([-46.6333, -23.5505]);
    
    await waitFor(() => {
      expect(result.current.hasPermission).toBe(true);
    });
    
    expect(result.current.error).toBeNull();
  });

  it('should request permission when not granted', async () => {
    mockGetForegroundPermissionsAsync
      .mockResolvedValueOnce({ status: 'undetermined' })
      .mockResolvedValueOnce({ status: 'granted' });

    mockRequestForegroundPermissionsAsync.mockResolvedValue({
      status: 'granted',
    });

    mockGetCurrentPositionAsync.mockResolvedValue({
      coords: {
        latitude: -23.5505,
        longitude: -46.6333,
        altitude: null,
        accuracy: 10,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: Date.now(),
    });

    const { result } = renderHook(() => useLocation());

    let location: any;
    await act(async () => {
      location = await result.current.requestLocationPermission();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(mockRequestForegroundPermissionsAsync).toHaveBeenCalled();
    expect(location).not.toBeNull();
  });

  it('should handle permission denied', async () => {
    mockGetForegroundPermissionsAsync.mockResolvedValue({
      status: 'denied',
    });

    mockRequestForegroundPermissionsAsync.mockResolvedValue({
      status: 'denied',
    });

    const { result } = renderHook(() => useLocation());

    let location: any;
    await act(async () => {
      location = await result.current.requestLocationPermission();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(location).toBeNull();
    
    await waitFor(() => {
      expect(result.current.hasPermission).toBe(false);
      expect(result.current.error).not.toBeNull();
    });
  });

  it('should update location successfully', async () => {
    mockGetForegroundPermissionsAsync.mockResolvedValue({
      status: 'granted',
    });

    mockGetCurrentPositionAsync.mockResolvedValue({
      coords: {
        latitude: -23.5505,
        longitude: -46.6333,
        altitude: null,
        accuracy: 10,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: Date.now(),
    });

    const { result } = renderHook(() => useLocation());

    let location: any;
    await act(async () => {
      location = await result.current.updateLocation();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(location).not.toBeNull();
    expect(location?.type).toBe('Point');
    
    await waitFor(() => {
      expect(result.current.location).not.toBeNull();
    });
  });

  it('should handle location error', async () => {
    mockGetForegroundPermissionsAsync.mockResolvedValue({
      status: 'granted',
    });

    mockGetCurrentPositionAsync.mockRejectedValue(
      new Error('Location error')
    );

    const { result } = renderHook(() => useLocation());

    let location: any;
    await act(async () => {
      location = await result.current.updateLocation();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(location).toBeNull();
    
    await waitFor(() => {
      expect(result.current.error).not.toBeNull();
    });
  });
});

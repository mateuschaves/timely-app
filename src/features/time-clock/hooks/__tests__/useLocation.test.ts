import { renderHook, waitFor } from '@testing-library/react-native';
import * as ExpoLocation from 'expo-location';
import { useLocation } from '../useLocation';

jest.mock('expo-location', () => ({
  getForegroundPermissionsAsync: jest.fn(),
  requestForegroundPermissionsAsync: jest.fn(),
  getCurrentPositionAsync: jest.fn(),
  Accuracy: {
    Balanced: 6,
  },
}));

describe('useLocation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should request location permission and get location successfully', async () => {
    (ExpoLocation.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted',
    });

    (ExpoLocation.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
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

    const location = await result.current.requestLocationPermission();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(location).not.toBeNull();
    expect(location?.type).toBe('Point');
    expect(location?.coordinates).toEqual([-46.6333, -23.5505]);
    expect(result.current.hasPermission).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('should request permission when not granted', async () => {
    (ExpoLocation.getForegroundPermissionsAsync as jest.Mock)
      .mockResolvedValueOnce({ status: 'undetermined' })
      .mockResolvedValueOnce({ status: 'granted' });

    (ExpoLocation.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted',
    });

    (ExpoLocation.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
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

    const location = await result.current.requestLocationPermission();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(ExpoLocation.requestForegroundPermissionsAsync).toHaveBeenCalled();
    expect(location).not.toBeNull();
  });

  it('should handle permission denied', async () => {
    (ExpoLocation.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'denied',
    });

    (ExpoLocation.requestForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'denied',
    });

    const { result } = renderHook(() => useLocation());

    const location = await result.current.requestLocationPermission();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(location).toBeNull();
    expect(result.current.hasPermission).toBe(false);
    expect(result.current.error).not.toBeNull();
  });

  it('should update location successfully', async () => {
    (ExpoLocation.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted',
    });

    (ExpoLocation.getCurrentPositionAsync as jest.Mock).mockResolvedValue({
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

    const location = await result.current.updateLocation();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(location).not.toBeNull();
    expect(location?.type).toBe('Point');
    expect(result.current.location).not.toBeNull();
  });

  it('should handle location error', async () => {
    (ExpoLocation.getForegroundPermissionsAsync as jest.Mock).mockResolvedValue({
      status: 'granted',
    });

    (ExpoLocation.getCurrentPositionAsync as jest.Mock).mockRejectedValue(
      new Error('Location error')
    );

    const { result } = renderHook(() => useLocation());

    const location = await result.current.updateLocation();

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(location).toBeNull();
    expect(result.current.error).not.toBeNull();
  });
});

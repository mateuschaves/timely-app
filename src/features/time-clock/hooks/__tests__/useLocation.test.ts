import { renderHook, waitFor, act } from '@testing-library/react-native';

const mockGetForegroundPermissionsAsync = jest.fn();
const mockRequestForegroundPermissionsAsync = jest.fn();
const mockGetCurrentPositionAsync = jest.fn();
const mockGetLastKnownPositionAsync = jest.fn();

// Mock Platform FIRST - before any imports
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    select: jest.fn(),
  },
  View: 'View',
  Text: 'Text',
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

// Mock expo-location BEFORE importing useLocation
// This ensures the mock is in place when the module is required
jest.mock('expo-location', () => ({
  getForegroundPermissionsAsync: (...args: any[]) => mockGetForegroundPermissionsAsync(...args),
  requestForegroundPermissionsAsync: (...args: any[]) => mockRequestForegroundPermissionsAsync(...args),
  getCurrentPositionAsync: (...args: any[]) => mockGetCurrentPositionAsync(...args),
  getLastKnownPositionAsync: (...args: any[]) => mockGetLastKnownPositionAsync(...args),
  Accuracy: {
    Lowest: 1,
    Low: 2,
    Balanced: 6,
    High: 4,
    Highest: 5,
    Navigation: 6,
  },
}));

// Now import the hook - the mocks are already in place
import { useLocation } from '../useLocation';

describe('useLocation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetForegroundPermissionsAsync.mockReset();
    mockRequestForegroundPermissionsAsync.mockReset();
    mockGetCurrentPositionAsync.mockReset();
    mockGetLastKnownPositionAsync.mockReset();
    
    // Reset mocks to return resolved values by default
    mockGetForegroundPermissionsAsync.mockResolvedValue({ status: 'granted' });
    mockGetLastKnownPositionAsync.mockRejectedValue(new Error('No last known position')); // Default to no last known position
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
    // Platform.OS is already mocked in jest.mock('react-native')
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


  it('should handle location error with custom message', async () => {
    mockGetForegroundPermissionsAsync.mockResolvedValue({
      status: 'granted',
    });

    const customError = { message: 'Custom location error' };
    mockGetCurrentPositionAsync.mockRejectedValue(customError);

    const { result } = renderHook(() => useLocation());

    let location: any;
    await act(async () => {
      location = await result.current.requestLocationPermission();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(location).toBeNull();
    expect(result.current.error).toBe('Custom location error');
  });

  it('should handle location error without message', async () => {
    mockGetForegroundPermissionsAsync.mockResolvedValue({
      status: 'granted',
    });

    mockGetCurrentPositionAsync.mockRejectedValue({});

    const { result } = renderHook(() => useLocation());

    let location: any;
    await act(async () => {
      location = await result.current.requestLocationPermission();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(location).toBeNull();
    expect(result.current.error).toBe('Erro ao obter localização. Tente novamente.');
  });

  it('should handle updateLocation when permission not granted', async () => {
    mockGetForegroundPermissionsAsync.mockResolvedValue({
      status: 'denied',
    });

    const { result } = renderHook(() => useLocation());

    let location: any;
    await act(async () => {
      location = await result.current.updateLocation();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(location).toBeNull();
    expect(result.current.error).toBe('Permissão de localização não concedida.');
  });

  it('should handle updateLocation error with custom message', async () => {
    mockGetForegroundPermissionsAsync.mockResolvedValue({
      status: 'granted',
    });

    const customError = { message: 'Update location error' };
    mockGetCurrentPositionAsync.mockRejectedValue(customError);

    const { result } = renderHook(() => useLocation());

    let location: any;
    await act(async () => {
      location = await result.current.updateLocation();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(location).toBeNull();
    expect(result.current.error).toBe('Update location error');
  });

  it('should handle updateLocation error without message', async () => {
    mockGetForegroundPermissionsAsync.mockResolvedValue({
      status: 'granted',
    });

    mockGetCurrentPositionAsync.mockRejectedValue({});

    const { result } = renderHook(() => useLocation());

    let location: any;
    await act(async () => {
      location = await result.current.updateLocation();
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(location).toBeNull();
    expect(result.current.error).toBe('Erro ao atualizar localização. Tente novamente.');
  });

});

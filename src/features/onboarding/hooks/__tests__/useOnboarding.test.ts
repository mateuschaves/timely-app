import { renderHook, act, waitFor } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useOnboarding } from '../useOnboarding';
import { STORAGE_KEYS } from '@/config/storage';

jest.mock('@react-native-async-storage/async-storage');

describe('useOnboarding', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
  });

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useOnboarding());
    
    expect(result.current.isLoading).toBe(true);
  });

  it('should mark user as new when no work settings exist', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

    const { result } = renderHook(() => useOnboarding());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isExistingUser).toBe(false);
    expect(result.current.isOnboardingCompleted).toBe(false);
  });

  it('should mark user as existing when work settings exist', async () => {
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
      if (key === STORAGE_KEYS.WORK_SETTINGS) {
        return Promise.resolve(JSON.stringify({ someSettings: true }));
      }
      return Promise.resolve(null);
    });

    const { result } = renderHook(() => useOnboarding());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isExistingUser).toBe(true);
    expect(result.current.isOnboardingCompleted).toBe(false);
  });

  it('should mark onboarding as completed when flag is set', async () => {
    (AsyncStorage.getItem as jest.Mock).mockImplementation((key) => {
      if (key === STORAGE_KEYS.ONBOARDING_COMPLETED) {
        return Promise.resolve('true');
      }
      if (key === STORAGE_KEYS.ONBOARDING_VERSION) {
        return Promise.resolve('1.0.0');
      }
      return Promise.resolve(null);
    });

    const { result } = renderHook(() => useOnboarding());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isOnboardingCompleted).toBe(true);
  });

  it('should complete onboarding and set storage keys', async () => {
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useOnboarding());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.completeOnboarding();
    });

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      STORAGE_KEYS.ONBOARDING_COMPLETED,
      'true'
    );
    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      STORAGE_KEYS.ONBOARDING_VERSION,
      '1.0.0'
    );
    expect(result.current.isOnboardingCompleted).toBe(true);
  });

  it('should skip onboarding by completing it', async () => {
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

    const { result } = renderHook(() => useOnboarding());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.skipOnboarding();
    });

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(
      STORAGE_KEYS.ONBOARDING_COMPLETED,
      'true'
    );
    expect(result.current.isOnboardingCompleted).toBe(true);
  });
});

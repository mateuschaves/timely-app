import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useOnboarding } from '../useOnboarding';
import { updateUserMe } from '@/api/update-user-me';

// Mock the auth context
const mockFetchUserMe = jest.fn();
const mockUseAuthContext = jest.fn();

jest.mock('@/features/auth', () => ({
  useAuthContext: () => mockUseAuthContext(),
}));

jest.mock('@/api/update-user-me');

describe('useOnboarding', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchUserMe.mockResolvedValue(undefined);
    (updateUserMe as jest.Mock).mockResolvedValue({
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
      appleUserId: '123',
      appleId: null,
      onboardingCompleted: true,
      lastLogin: '2024-01-01T00:00:00Z',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    });
  });

  it('should initialize with loading state', () => {
    mockUseAuthContext.mockReturnValue({
      user: null,
      fetchUserMe: mockFetchUserMe,
    });

    const { result } = renderHook(() => useOnboarding());
    
    expect(result.current.isLoading).toBe(true);
  });

  it('should get onboarding status from user object when not completed', async () => {
    mockUseAuthContext.mockReturnValue({
      user: {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        appleUserId: '123',
        onboardingCompleted: false,
      },
      fetchUserMe: mockFetchUserMe,
    });

    const { result } = renderHook(() => useOnboarding());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isOnboardingCompleted).toBe(false);
  });

  it('should get onboarding status from user object when completed', async () => {
    mockUseAuthContext.mockReturnValue({
      user: {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        appleUserId: '123',
        onboardingCompleted: true,
      },
      fetchUserMe: mockFetchUserMe,
    });

    const { result } = renderHook(() => useOnboarding());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isOnboardingCompleted).toBe(true);
  });

  it('should complete onboarding via API', async () => {
    mockUseAuthContext.mockReturnValue({
      user: {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        appleUserId: '123',
        onboardingCompleted: false,
      },
      fetchUserMe: mockFetchUserMe,
    });

    const { result } = renderHook(() => useOnboarding());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.completeOnboarding();
    });

    expect(updateUserMe).toHaveBeenCalledWith({ onboardingCompleted: true });
    expect(mockFetchUserMe).toHaveBeenCalled();
    expect(result.current.isOnboardingCompleted).toBe(true);
  });

  it('should skip onboarding by completing it', async () => {
    mockUseAuthContext.mockReturnValue({
      user: {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        appleUserId: '123',
        onboardingCompleted: false,
      },
      fetchUserMe: mockFetchUserMe,
    });

    const { result } = renderHook(() => useOnboarding());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.skipOnboarding();
    });

    expect(updateUserMe).toHaveBeenCalledWith({ onboardingCompleted: true });
    expect(mockFetchUserMe).toHaveBeenCalled();
    expect(result.current.isOnboardingCompleted).toBe(true);
  });

  it('should handle errors when completing onboarding', async () => {
    mockUseAuthContext.mockReturnValue({
      user: {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        appleUserId: '123',
        onboardingCompleted: false,
      },
      fetchUserMe: mockFetchUserMe,
    });

    const error = new Error('API Error');
    (updateUserMe as jest.Mock).mockRejectedValueOnce(error);

    const { result } = renderHook(() => useOnboarding());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await expect(
      act(async () => {
        await result.current.completeOnboarding();
      })
    ).rejects.toThrow('API Error');

    expect(updateUserMe).toHaveBeenCalledWith({ onboardingCompleted: true });
  });
});


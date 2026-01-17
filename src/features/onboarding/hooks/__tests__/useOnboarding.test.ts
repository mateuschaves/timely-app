import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useOnboarding } from '../useOnboarding';
import { updateUserMe } from '@/api/update-user-me';

// Mock the auth context
const mockFetchUserMe = jest.fn();
let mockUser = {
  id: '123',
  email: 'test@example.com',
  name: 'Test User',
  appleUserId: '123',
  onboardingCompleted: false,
};

jest.mock('@/features/auth', () => ({
  useAuthContext: () => ({
    user: mockUser,
    fetchUserMe: mockFetchUserMe,
  }),
}));

jest.mock('@/api/update-user-me');

describe('useOnboarding', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFetchUserMe.mockResolvedValue(undefined);
    (updateUserMe as jest.Mock).mockResolvedValue({
      ...mockUser,
      onboardingCompleted: true,
    });
    // Reset mockUser to default state
    mockUser = {
      id: '123',
      email: 'test@example.com',
      name: 'Test User',
      appleUserId: '123',
      onboardingCompleted: false,
    };
  });

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useOnboarding());
    
    expect(result.current.isLoading).toBe(true);
  });

  it('should get onboarding status from user object', async () => {
    const { result } = renderHook(() => useOnboarding());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.isOnboardingCompleted).toBe(false);
  });

  it('should complete onboarding via API', async () => {
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
});



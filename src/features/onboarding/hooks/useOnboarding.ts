import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from '@/features/auth';
import { updateUserMe } from '@/api/update-user-me';

export interface OnboardingState {
  isOnboardingCompleted: boolean;
  isLoading: boolean;
}

export function useOnboarding() {
  const { user, fetchUserMe } = useAuthContext();
  const [state, setState] = useState<OnboardingState>({
    isOnboardingCompleted: true,
    isLoading: true,
  });

  useEffect(() => {
    // Get onboarding status from user object (from API)
    const isOnboardingCompleted = user?.onboardingCompleted ?? true;

    setState({
      isOnboardingCompleted,
      isLoading: false,
    });
  }, [user]);

  const completeOnboarding = useCallback(async () => {
    try {
      // Update onboarding status via API
      await updateUserMe({ onboardingCompleted: true });

      // Refresh user data to get updated onboarding status
      await fetchUserMe();

      setState((prev) => ({
        ...prev,
        isOnboardingCompleted: true,
      }));
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  }, [fetchUserMe]);

  const skipOnboarding = useCallback(async () => {
    await completeOnboarding();
  }, [completeOnboarding]);

  return {
    ...state,
    completeOnboarding,
    skipOnboarding,
  };
}


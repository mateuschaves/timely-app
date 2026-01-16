import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/config/storage';

// Increment this version to force onboarding to show again for all users
// This allows showing updated onboarding flows to existing users
const CURRENT_ONBOARDING_VERSION = '1.0.0';

export interface OnboardingState {
  isOnboardingCompleted: boolean;
  isLoading: boolean;
  isExistingUser: boolean;
}

export function useOnboarding() {
  const [state, setState] = useState<OnboardingState>({
    isOnboardingCompleted: true,
    isLoading: true,
    isExistingUser: false,
  });

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      const [onboardingCompleted, onboardingVersion] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_COMPLETED),
        AsyncStorage.getItem(STORAGE_KEYS.ONBOARDING_VERSION),
      ]);

      // User is existing if they have completed onboarding before
      // This flag determines which intro screen copy to show
      const isExistingUser = onboardingCompleted === 'true';

      // Check if onboarding needs to be shown
      const shouldShowOnboarding = 
        !onboardingCompleted || 
        onboardingVersion !== CURRENT_ONBOARDING_VERSION;

      setState({
        isOnboardingCompleted: !shouldShowOnboarding,
        isLoading: false,
        isExistingUser,
      });
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
      }));
    }
  };

  const completeOnboarding = useCallback(async () => {
    try {
      await Promise.all([
        AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_COMPLETED, 'true'),
        AsyncStorage.setItem(STORAGE_KEYS.ONBOARDING_VERSION, CURRENT_ONBOARDING_VERSION),
      ]);

      setState((prev) => ({
        ...prev,
        isOnboardingCompleted: true,
      }));
    } catch (error) {
      console.error('Error completing onboarding:', error);
      throw error;
    }
  }, []);

  const skipOnboarding = useCallback(async () => {
    await completeOnboarding();
  }, [completeOnboarding]);

  return {
    ...state,
    completeOnboarding,
    skipOnboarding,
    checkOnboardingStatus,
  };
}

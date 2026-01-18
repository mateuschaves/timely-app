import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from 'react';
import { useAuthContext } from '@/features/auth';
import { updateUserMe } from '@/api/update-user-me';
import { updateUserSettings } from '@/api/update-user-settings';
import { LocationCoordinates } from '@/api/types';
import { WorkModel } from '../types';

export interface OnboardingState {
  isOnboardingCompleted: boolean;
  isLoading: boolean;
}

interface OnboardingContextValue extends OnboardingState {
  completeOnboarding: (workModel?: WorkModel, workLocation?: LocationCoordinates) => Promise<void>;
  skipOnboarding: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextValue | undefined>(undefined);

interface OnboardingProviderProps {
  children: ReactNode;
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const { user, fetchUserMe } = useAuthContext();
  const [state, setState] = useState<OnboardingState>({
    isOnboardingCompleted: true,
    isLoading: true,
  });
  
  // Track if user manually skipped to prevent useEffect from resetting it
  const hasSkippedRef = useRef(false);

  useEffect(() => {
    // Don't update if user manually skipped
    if (hasSkippedRef.current) {
      return;
    }

    // Get onboarding status from user object (from API)
    const isOnboardingCompleted = user?.onboardingCompleted ?? true;

    setState({
      isOnboardingCompleted,
      isLoading: false,
    });
  }, [user]);

  const completeOnboarding = useCallback(async (workModel?: WorkModel, workLocation?: LocationCoordinates) => {
    try {
      // Update onboarding status via API
      await updateUserMe({ 
        onboardingCompleted: true,
      });

      // Save workMode and workLocation to worksettings
      if (workModel || workLocation) {
        await updateUserSettings({
          workMode: workModel,
          workLocation,
        });
      }

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
    // When skipping, we don't mark onboarding as completed
    // User will see onboarding again next time they open the app
    // Just update local state to hide the onboarding for current session
    hasSkippedRef.current = true;
    setState((prev) => ({
      ...prev,
      isOnboardingCompleted: true, // Local state only
    }));
  }, []);

  const value: OnboardingContextValue = {
    ...state,
    completeOnboarding,
    skipOnboarding,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
}

export function useOnboarding() {
  const context = useContext(OnboardingContext);
  
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  
  return context;
}

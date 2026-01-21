import React, { useEffect } from 'react';
import { useAuthContext } from '@/features/auth';
import { useSubscriptionUser } from '../hooks/useSubscriptions';

/**
 * SubscriptionAuthSync Component
 * 
 * Automatically syncs the authenticated user with RevenueCat.
 * This ensures that subscriptions are properly attributed to users.
 * 
 * Usage:
 * Add this component inside both SubscriptionProvider and AuthProvider:
 * 
 * ```tsx
 * <SubscriptionProvider apiKey={API_KEY}>
 *   <AuthProvider>
 *     <SubscriptionAuthSync />
 *     <App />
 *   </AuthProvider>
 * </SubscriptionProvider>
 * ```
 */
export const SubscriptionAuthSync: React.FC = () => {
  const { user } = useAuthContext();
  const { loginUser, logoutUser } = useSubscriptionUser();

  useEffect(() => {
    const syncUser = async () => {
      try {
        if (user?.id) {
          // Login user to RevenueCat with their user ID
          await loginUser(user.id);
          console.log('[SubscriptionAuthSync] User logged in to RevenueCat:', user.id);
        } else {
          // Logout from RevenueCat when user logs out
          await logoutUser();
          console.log('[SubscriptionAuthSync] User logged out from RevenueCat');
        }
      } catch (error) {
        console.error('[SubscriptionAuthSync] Failed to sync user with RevenueCat:', error);
      }
    };

    syncUser();
  }, [user?.id, loginUser, logoutUser]);

  // This component doesn't render anything
  return null;
};

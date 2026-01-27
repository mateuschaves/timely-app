import { useMemo } from 'react';
import { useSubscriptionContext } from '../context/SubscriptionContext';

/**
 * Entitlement identifiers for premium features
 * These should match the entitlement identifiers configured in RevenueCat
 */
export const ENTITLEMENTS = {
  PREMIUM: 'premium',
  GEOFENCING: 'geofencing',
  JUSTIFIED_ABSENCES: 'justified_absences',
} as const;

/**
 * Hook to check premium feature access
 * Provides methods to check if user has access to specific premium features
 */
export const usePremiumFeatures = () => {
  const { customerInfo, hasActiveSubscription } = useSubscriptionContext();

  /**
   * Check if user has a specific entitlement
   */
  const hasEntitlement = useMemo(() => {
    return (entitlementId: string): boolean => {
      if (!customerInfo?.entitlements?.active) {
        return false;
      }
      return entitlementId in customerInfo.entitlements.active;
    };
  }, [customerInfo]);

  /**
   * Check if user has premium subscription (general access)
   * This checks for the "premium" entitlement or any active subscription
   */
  const hasPremium = useMemo(() => {
    return hasActiveSubscription() || hasEntitlement(ENTITLEMENTS.PREMIUM);
  }, [hasActiveSubscription, hasEntitlement]);

  /**
   * Check if user has access to geofencing (automatic detection)
   * Checks for specific geofencing entitlement or general premium access
   */
  const hasGeofencing = useMemo(() => {
    return hasPremium || hasEntitlement(ENTITLEMENTS.GEOFENCING);
  }, [hasPremium, hasEntitlement]);

  /**
   * Check if user has access to justified absences
   * Checks for specific justified absences entitlement or general premium access
   */
  const hasJustifiedAbsences = useMemo(() => {
    return hasPremium || hasEntitlement(ENTITLEMENTS.JUSTIFIED_ABSENCES);
  }, [hasPremium, hasEntitlement]);

  return {
    hasPremium,
    hasGeofencing,
    hasJustifiedAbsences,
    hasEntitlement,
    customerInfo,
  };
};

import { useCallback } from 'react';
import { useSubscriptionContext } from '../context/SubscriptionContext';
import type { PurchasesPackage, CustomerInfo } from 'react-native-purchases';
import type { PurchaseResult } from '../types';

/**
 * Hook for subscription operations
 */
export const useSubscriptions = () => {
  const context = useSubscriptionContext();

  const {
    customerInfo,
    packages,
    offerings,
    currentOffering,
    isLoading,
    error,
    loadOfferings,
    refreshCustomerInfo,
    hasActiveSubscription,
  } = context;

  return {
    // State
    customerInfo,
    packages,
    offerings,
    currentOffering,
    isLoading,
    error,
    // Actions
    loadOfferings,
    refreshCustomerInfo,
    hasActiveSubscription,
  };
};

/**
 * Hook for purchase operations
 */
export const usePurchase = () => {
  const context = useSubscriptionContext();

  const { purchasePackage, restorePurchases, isLoading, error } = context;

  /**
   * Purchase a subscription package
   */
  const purchase = useCallback(
    async (pkg: PurchasesPackage): Promise<PurchaseResult> => {
      return await purchasePackage(pkg);
    },
    [purchasePackage]
  );

  /**
   * Restore previous purchases
   */
  const restore = useCallback(async (): Promise<CustomerInfo> => {
    return await restorePurchases();
  }, [restorePurchases]);

  return {
    purchase,
    restore,
    isLoading,
    error,
  };
};

/**
 * Hook for user subscription management
 */
export const useSubscriptionUser = () => {
  const context = useSubscriptionContext();

  const { login, logout, customerInfo, isLoading, error } = context;

  /**
   * Login user to RevenueCat
   */
  const loginUser = useCallback(
    async (userId: string): Promise<CustomerInfo> => {
      return await login(userId);
    },
    [login]
  );

  /**
   * Logout user from RevenueCat
   */
  const logoutUser = useCallback(async (): Promise<CustomerInfo> => {
    return await logout();
  }, [logout]);

  return {
    loginUser,
    logoutUser,
    customerInfo,
    isLoading,
    error,
  };
};

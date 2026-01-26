import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from 'react';
import type {
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage,
} from 'react-native-purchases';
import { revenueCatService } from '../services/RevenueCatService';
import type { SubscriptionState, PurchaseResult } from '../types';

interface SubscriptionContextValue extends SubscriptionState {
  initialize: (apiKey: string, appUserId?: string) => Promise<void>;
  loadOfferings: () => Promise<void>;
  purchasePackage: (pkg: PurchasesPackage) => Promise<PurchaseResult>;
  restorePurchases: () => Promise<CustomerInfo>;
  login: (appUserId: string) => Promise<CustomerInfo>;
  logout: () => Promise<CustomerInfo>;
  refreshCustomerInfo: () => Promise<void>;
  hasActiveSubscription: () => boolean;
}

const SubscriptionContext = createContext<SubscriptionContextValue | undefined>(
  undefined
);

interface SubscriptionProviderProps {
  children: ReactNode;
  apiKey?: string;
  appUserId?: string;
}

/**
 * Subscription Provider
 * Manages subscription state and provides subscription-related functionality
 */
export const SubscriptionProvider: React.FC<SubscriptionProviderProps> = ({
  children,
  apiKey,
  appUserId,
}) => {
  const [state, setState] = useState<SubscriptionState>({
    customerInfo: null,
    packages: [],
    offerings: [],
    currentOffering: null,
    isLoading: false,
    error: null,
  });

  /**
   * Initialize RevenueCat SDK
   */
  const initialize = useCallback(
    async (key: string, userId?: string) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        await revenueCatService.configure(key, userId);
        await loadOfferings();
        await refreshCustomerInfo();
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error as Error,
          isLoading: false,
        }));
        throw error;
      }
    },
    []
  );

  /**
   * Load available offerings
   */
  const loadOfferings = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const offering = await revenueCatService.getOfferings();
      setState((prev) => ({
        ...prev,
        currentOffering: offering,
        offerings: offering ? [offering] : [],
        packages: offering?.availablePackages || [],
        isLoading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error as Error,
        isLoading: false,
      }));
      throw error;
    }
  }, []);

  /**
   * Refresh customer info
   */
  const refreshCustomerInfo = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const customerInfo = await revenueCatService.getCustomerInfo();
      setState((prev) => ({
        ...prev,
        customerInfo,
        isLoading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error as Error,
        isLoading: false,
      }));
      throw error;
    }
  }, []);

  /**
   * Purchase a package
   */
  const purchasePackage = useCallback(
    async (pkg: PurchasesPackage): Promise<PurchaseResult> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const result = await revenueCatService.purchasePackage(pkg);
        setState((prev) => ({
          ...prev,
          customerInfo: result.customerInfo,
          isLoading: false,
        }));
        return result;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error as Error,
          isLoading: false,
        }));
        throw error;
      }
    },
    []
  );

  /**
   * Restore purchases
   */
  const restorePurchases = useCallback(async (): Promise<CustomerInfo> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const customerInfo = await revenueCatService.restorePurchases();
      setState((prev) => ({
        ...prev,
        customerInfo,
        isLoading: false,
      }));
      return customerInfo;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error as Error,
        isLoading: false,
      }));
      throw error;
    }
  }, []);

  /**
   * Login user
   */
  const login = useCallback(
    async (userId: string): Promise<CustomerInfo> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const customerInfo = await revenueCatService.login(userId);
        setState((prev) => ({
          ...prev,
          customerInfo,
          isLoading: false,
        }));
        return customerInfo;
      } catch (error) {
        setState((prev) => ({
          ...prev,
          error: error as Error,
          isLoading: false,
        }));
        throw error;
      }
    },
    []
  );

  /**
   * Logout user
   */
  const logout = useCallback(async (): Promise<CustomerInfo> => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const customerInfo = await revenueCatService.logout();
      setState((prev) => ({
        ...prev,
        customerInfo,
        isLoading: false,
      }));
      return customerInfo;
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error as Error,
        isLoading: false,
      }));
      throw error;
    }
  }, []);

  /**
   * Check if user has active subscription
   */
  const hasActiveSubscription = useCallback((): boolean => {
    if (!state.customerInfo) return false;
    return (
      typeof state.customerInfo.entitlements.active !== 'undefined' &&
      Object.keys(state.customerInfo.entitlements.active).length > 0
    );
  }, [state.customerInfo]);

  /**
   * Auto-initialize if apiKey is provided
   */
  useEffect(() => {
    if (apiKey && !revenueCatService.isSDKConfigured()) {
      initialize(apiKey, appUserId);
    }
  }, [apiKey, appUserId, initialize]);

  /**
   * Set up listener for customer info updates
   * This ensures the context stays in sync with subscription changes
   */
  useEffect(() => {
    if (!revenueCatService.isSDKConfigured()) {
      return;
    }

    const removeListener = revenueCatService.addCustomerInfoUpdateListener(
      (customerInfo) => {
        console.log('Customer info updated:', customerInfo);
        setState((prev) => ({
          ...prev,
          customerInfo,
        }));
      }
    );

    return () => {
      removeListener();
    };
  }, []);

  const value: SubscriptionContextValue = {
    ...state,
    initialize,
    loadOfferings,
    purchasePackage,
    restorePurchases,
    login,
    logout,
    refreshCustomerInfo,
    hasActiveSubscription,
  };

  return (
    <SubscriptionContext.Provider value={value}>
      {children}
    </SubscriptionContext.Provider>
  );
};

/**
 * Hook to use subscription context
 */
export const useSubscriptionContext = (): SubscriptionContextValue => {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error(
      'useSubscriptionContext must be used within a SubscriptionProvider'
    );
  }
  return context;
};

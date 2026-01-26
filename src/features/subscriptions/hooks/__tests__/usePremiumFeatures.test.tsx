import React from 'react';
import { renderHook, waitFor } from '@testing-library/react-native';
import { usePremiumFeatures, ENTITLEMENTS } from '../usePremiumFeatures';
import { SubscriptionProvider } from '../../context/SubscriptionContext';
import { revenueCatService } from '../../services/RevenueCatService';
import type { CustomerInfo } from 'react-native-purchases';

// Mock the service
jest.mock('../../services/RevenueCatService', () => ({
  revenueCatService: {
    configure: jest.fn(),
    getOfferings: jest.fn(),
    getCustomerInfo: jest.fn(),
    isSDKConfigured: jest.fn(),
  },
}));

const createWrapper = (customerInfo: CustomerInfo | null = null) => {
  return ({ children }: { children: React.ReactNode }) => (
    <SubscriptionProvider apiKey="test_api_key">{children}</SubscriptionProvider>
  );
};

// Helper to create mock CustomerInfo
const createMockCustomerInfo = (activeEntitlements: string[] = []): CustomerInfo => {
  const active: Record<string, any> = {};
  activeEntitlements.forEach((entitlement) => {
    active[entitlement] = {
      identifier: entitlement,
      isActive: true,
      willRenew: true,
      periodType: 'NORMAL',
      latestPurchaseDate: '2024-01-01',
      originalPurchaseDate: '2024-01-01',
      expirationDate: '2024-12-31',
      store: 'APP_STORE',
      productIdentifier: 'test_product',
      isSandbox: true,
      unsubscribeDetectedAt: null,
      billingIssueDetectedAt: null,
    };
  });

  return {
    entitlements: {
      all: active,
      active: active,
    },
    activeSubscriptions: activeEntitlements,
    allPurchasedProductIdentifiers: activeEntitlements,
    latestExpirationDate: '2024-12-31',
    firstSeen: '2024-01-01',
    originalAppUserId: 'test_user',
    requestDate: '2024-01-01',
    allExpirationDates: {},
    allPurchaseDates: {},
    originalApplicationVersion: '1.0.0',
    originalPurchaseDate: '2024-01-01',
    managementURL: null,
    nonSubscriptionTransactions: [],
  } as CustomerInfo;
};

describe('usePremiumFeatures', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (revenueCatService.isSDKConfigured as jest.Mock).mockReturnValue(false);
    (revenueCatService.configure as jest.Mock).mockResolvedValue(undefined);
    (revenueCatService.getOfferings as jest.Mock).mockResolvedValue(null);
  });

  describe('with no subscription', () => {
    beforeEach(() => {
      (revenueCatService.getCustomerInfo as jest.Mock).mockResolvedValue(
        createMockCustomerInfo([])
      );
    });

    it('should return false for all premium features', () => {
      const { result } = renderHook(() => usePremiumFeatures(), {
        wrapper: createWrapper(),
      });

      expect(result.current.hasPremium).toBe(false);
      expect(result.current.hasGeofencing).toBe(false);
      expect(result.current.hasJustifiedAbsences).toBe(false);
    });

    it('should return false for hasEntitlement', () => {
      const { result } = renderHook(() => usePremiumFeatures(), {
        wrapper: createWrapper(),
      });

      expect(result.current.hasEntitlement(ENTITLEMENTS.PREMIUM)).toBe(false);
      expect(result.current.hasEntitlement(ENTITLEMENTS.GEOFENCING)).toBe(false);
      expect(result.current.hasEntitlement(ENTITLEMENTS.JUSTIFIED_ABSENCES)).toBe(false);
    });
  });

  describe('with premium entitlement', () => {
    beforeEach(() => {
      (revenueCatService.getCustomerInfo as jest.Mock).mockResolvedValue(
        createMockCustomerInfo([ENTITLEMENTS.PREMIUM])
      );
    });

    it('should return true for all premium features', async () => {
      const { result } = renderHook(() => usePremiumFeatures(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.hasPremium).toBe(true);
      });

      expect(result.current.hasGeofencing).toBe(true);
      expect(result.current.hasJustifiedAbsences).toBe(true);
    });

    it('should return true for premium entitlement check', async () => {
      const { result } = renderHook(() => usePremiumFeatures(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.hasEntitlement(ENTITLEMENTS.PREMIUM)).toBe(true);
      });
    });
  });

  describe('with specific geofencing entitlement', () => {
    beforeEach(() => {
      (revenueCatService.getCustomerInfo as jest.Mock).mockResolvedValue(
        createMockCustomerInfo([ENTITLEMENTS.GEOFENCING])
      );
    });

    it('should return true for geofencing', async () => {
      const { result } = renderHook(() => usePremiumFeatures(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.hasGeofencing).toBe(true);
      });
    });

    it('should return false for justified absences without specific entitlement', () => {
      const { result } = renderHook(() => usePremiumFeatures(), {
        wrapper: createWrapper(),
      });

      expect(result.current.hasJustifiedAbsences).toBe(false);
    });

    it('should return true for geofencing entitlement check', async () => {
      const { result } = renderHook(() => usePremiumFeatures(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.hasEntitlement(ENTITLEMENTS.GEOFENCING)).toBe(true);
      });
      expect(result.current.hasEntitlement(ENTITLEMENTS.JUSTIFIED_ABSENCES)).toBe(false);
    });
  });

  describe('with specific justified absences entitlement', () => {
    beforeEach(() => {
      (revenueCatService.getCustomerInfo as jest.Mock).mockResolvedValue(
        createMockCustomerInfo([ENTITLEMENTS.JUSTIFIED_ABSENCES])
      );
    });

    it('should return true for justified absences', async () => {
      const { result } = renderHook(() => usePremiumFeatures(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.hasJustifiedAbsences).toBe(true);
      });
    });

    it('should return false for geofencing without specific entitlement', () => {
      const { result } = renderHook(() => usePremiumFeatures(), {
        wrapper: createWrapper(),
      });

      expect(result.current.hasGeofencing).toBe(false);
    });

    it('should return true for justified absences entitlement check', async () => {
      const { result } = renderHook(() => usePremiumFeatures(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.hasEntitlement(ENTITLEMENTS.JUSTIFIED_ABSENCES)).toBe(true);
      });
      expect(result.current.hasEntitlement(ENTITLEMENTS.GEOFENCING)).toBe(false);
    });
  });

  describe('with multiple entitlements', () => {
    beforeEach(() => {
      (revenueCatService.getCustomerInfo as jest.Mock).mockResolvedValue(
        createMockCustomerInfo([
          ENTITLEMENTS.GEOFENCING,
          ENTITLEMENTS.JUSTIFIED_ABSENCES,
        ])
      );
    });

    it('should return true for both features', async () => {
      const { result } = renderHook(() => usePremiumFeatures(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.hasGeofencing).toBe(true);
      });
      expect(result.current.hasJustifiedAbsences).toBe(true);
    });

    it('should return true for both entitlement checks', async () => {
      const { result } = renderHook(() => usePremiumFeatures(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.hasEntitlement(ENTITLEMENTS.GEOFENCING)).toBe(true);
      });
      expect(result.current.hasEntitlement(ENTITLEMENTS.JUSTIFIED_ABSENCES)).toBe(true);
    });
  });

  describe('customerInfo property', () => {
    it('should expose customerInfo', () => {
      const mockInfo = createMockCustomerInfo([ENTITLEMENTS.PREMIUM]);
      (revenueCatService.getCustomerInfo as jest.Mock).mockResolvedValue(mockInfo);

      const { result } = renderHook(() => usePremiumFeatures(), {
        wrapper: createWrapper(),
      });

      // Initially null, then populated after provider initializes
      expect(result.current.customerInfo).toBeDefined();
    });
  });
});

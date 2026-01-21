import React from 'react';
import { renderHook, waitFor, act } from '@testing-library/react-native';
import { useSubscriptions, usePurchase, useSubscriptionUser } from '../useSubscriptions';
import { SubscriptionProvider } from '../../context/SubscriptionContext';
import { revenueCatService } from '../../services/RevenueCatService';

// Mock the service
jest.mock('../../services/RevenueCatService', () => ({
  revenueCatService: {
    configure: jest.fn(),
    getOfferings: jest.fn(),
    getCustomerInfo: jest.fn(),
    purchasePackage: jest.fn(),
    restorePurchases: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    isSDKConfigured: jest.fn(),
  },
}));

const createWrapper = () => {
  return ({ children }: { children: React.ReactNode }) => (
    <SubscriptionProvider>{children}</SubscriptionProvider>
  );
};

describe('useSubscriptions', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (revenueCatService.isSDKConfigured as jest.Mock).mockReturnValue(false);
  });

  it('should initialize with default state', () => {
    const { result } = renderHook(() => useSubscriptions(), {
      wrapper: createWrapper(),
    });

    expect(result.current.customerInfo).toBeNull();
    expect(result.current.packages).toEqual([]);
    expect(result.current.offerings).toEqual([]);
    expect(result.current.currentOffering).toBeNull();
    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it('should load offerings successfully', async () => {
    const mockOffering = {
      identifier: 'default',
      availablePackages: [
        {
          identifier: 'monthly',
          packageType: 'MONTHLY',
          product: {
            identifier: 'monthly_sub',
            title: 'Monthly Subscription',
            priceString: '$9.99',
          },
        },
      ],
    };

    (revenueCatService.getOfferings as jest.Mock).mockResolvedValue(mockOffering);
    (revenueCatService.getCustomerInfo as jest.Mock).mockResolvedValue({
      entitlements: { active: {} },
    });

    const { result } = renderHook(() => useSubscriptions(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.loadOfferings();
    });

    await waitFor(() => {
      expect(result.current.currentOffering).toEqual(mockOffering);
    });

    expect(result.current.packages).toEqual(mockOffering.availablePackages);
    expect(result.current.isLoading).toBe(false);
  });

  it('should refresh customer info', async () => {
    const mockCustomerInfo = {
      entitlements: {
        active: {
          premium: { identifier: 'premium' },
        },
      },
    };

    (revenueCatService.getCustomerInfo as jest.Mock).mockResolvedValue(mockCustomerInfo);

    const { result } = renderHook(() => useSubscriptions(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.refreshCustomerInfo();
    });

    await waitFor(() => {
      expect(result.current.customerInfo).toEqual(mockCustomerInfo);
    });
  });

  it('should check if has active subscription', async () => {
    const mockCustomerInfo = {
      entitlements: {
        active: {
          premium: { identifier: 'premium' },
        },
      },
    };

    (revenueCatService.getCustomerInfo as jest.Mock).mockResolvedValue(mockCustomerInfo);

    const { result } = renderHook(() => useSubscriptions(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      await result.current.refreshCustomerInfo();
    });

    await waitFor(() => {
      expect(result.current.hasActiveSubscription()).toBe(true);
    });
  });
});

describe('usePurchase', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (revenueCatService.isSDKConfigured as jest.Mock).mockReturnValue(false);
  });

  it('should purchase package successfully', async () => {
    const mockPackage = {
      identifier: 'monthly',
      packageType: 'MONTHLY',
      product: {
        identifier: 'monthly_sub',
      },
    } as any;

    const mockResult = {
      customerInfo: {
        entitlements: { active: { premium: {} } },
      },
      productIdentifier: 'monthly_sub',
    };

    (revenueCatService.purchasePackage as jest.Mock).mockResolvedValue(mockResult);

    const { result } = renderHook(() => usePurchase(), {
      wrapper: createWrapper(),
    });

    let purchaseResult: any;
    await act(async () => {
      purchaseResult = await result.current.purchase(mockPackage);
    });

    expect(purchaseResult).toEqual(mockResult);
    expect(revenueCatService.purchasePackage).toHaveBeenCalledWith(mockPackage);
  });

  it('should restore purchases successfully', async () => {
    const mockCustomerInfo = {
      entitlements: { active: {} },
    };

    (revenueCatService.restorePurchases as jest.Mock).mockResolvedValue(mockCustomerInfo);

    const { result } = renderHook(() => usePurchase(), {
      wrapper: createWrapper(),
    });

    let restoreResult: any;
    await act(async () => {
      restoreResult = await result.current.restore();
    });

    expect(restoreResult).toEqual(mockCustomerInfo);
    expect(revenueCatService.restorePurchases).toHaveBeenCalled();
  });

  it('should handle purchase error', async () => {
    const mockPackage = {
      identifier: 'monthly',
    } as any;

    const error = new Error('Purchase failed');
    (revenueCatService.purchasePackage as jest.Mock).mockRejectedValue(error);

    const { result } = renderHook(() => usePurchase(), {
      wrapper: createWrapper(),
    });

    await expect(async () => {
      await act(async () => {
        await result.current.purchase(mockPackage);
      });
    }).rejects.toThrow('Purchase failed');
  });
});

describe('useSubscriptionUser', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (revenueCatService.isSDKConfigured as jest.Mock).mockReturnValue(false);
  });

  it('should login user successfully', async () => {
    const mockCustomerInfo = {
      entitlements: { active: {} },
    };

    (revenueCatService.login as jest.Mock).mockResolvedValue(mockCustomerInfo);

    const { result } = renderHook(() => useSubscriptionUser(), {
      wrapper: createWrapper(),
    });

    let loginResult: any;
    await act(async () => {
      loginResult = await result.current.loginUser('user123');
    });

    expect(loginResult).toEqual(mockCustomerInfo);
    expect(revenueCatService.login).toHaveBeenCalledWith('user123');
  });

  it('should logout user successfully', async () => {
    const mockCustomerInfo = {
      entitlements: { active: {} },
    };

    (revenueCatService.logout as jest.Mock).mockResolvedValue(mockCustomerInfo);

    const { result } = renderHook(() => useSubscriptionUser(), {
      wrapper: createWrapper(),
    });

    let logoutResult: any;
    await act(async () => {
      logoutResult = await result.current.logoutUser();
    });

    expect(logoutResult).toEqual(mockCustomerInfo);
    expect(revenueCatService.logout).toHaveBeenCalled();
  });

  it('should handle login error', async () => {
    const error = new Error('Login failed');
    (revenueCatService.login as jest.Mock).mockRejectedValue(error);

    const { result } = renderHook(() => useSubscriptionUser(), {
      wrapper: createWrapper(),
    });

    await expect(async () => {
      await act(async () => {
        await result.current.loginUser('user123');
      });
    }).rejects.toThrow('Login failed');
  });
});

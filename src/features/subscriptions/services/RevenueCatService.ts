import Purchases, { LOG_LEVEL } from 'react-native-purchases';
import type {
  CustomerInfo,
  PurchasesOffering,
  PurchasesPackage,
} from 'react-native-purchases';

/**
 * RevenueCat Service
 * Handles all RevenueCat SDK operations
 */
class RevenueCatService {
  private static instance: RevenueCatService;
  private isConfigured = false;

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): RevenueCatService {
    if (!RevenueCatService.instance) {
      RevenueCatService.instance = new RevenueCatService();
    }
    return RevenueCatService.instance;
  }

  /**
   * Initialize RevenueCat SDK
   * @param apiKey - RevenueCat API key (iOS or Android depending on platform)
   * @param appUserId - Optional user ID to identify the user
   */
  public async configure(apiKey: string, appUserId?: string): Promise<void> {
    if (this.isConfigured) {
      console.log('RevenueCat already configured');
      return;
    }

    try {
      // Configure SDK
      if (__DEV__) {
        Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      }

      await Purchases.configure({
        apiKey,
        appUserID: appUserId,
      });

      this.isConfigured = true;
      console.log('RevenueCat configured successfully');
    } catch (error) {
      console.error('Failed to configure RevenueCat:', error);
      throw error;
    }
  }

  /**
   * Get current offerings (subscription packages)
   * @returns The current offering or null if no offering is available
   */
  public async getOfferings(): Promise<PurchasesOffering | null> {
    try {
      const offerings = await Purchases.getOfferings();
      return offerings.current;
    } catch (error) {
      console.error('Failed to get offerings:', error);
      throw error;
    }
  }

  /**
   * Get customer info
   */
  public async getCustomerInfo(): Promise<CustomerInfo> {
    try {
      return await Purchases.getCustomerInfo();
    } catch (error) {
      console.error('Failed to get customer info:', error);
      throw error;
    }
  }

  /**
   * Purchase a package
   */
  public async purchasePackage(
    pkg: PurchasesPackage
  ): Promise<{ customerInfo: CustomerInfo; productIdentifier: string }> {
    try {
      const { customerInfo, productIdentifier } =
        await Purchases.purchasePackage(pkg);
      return { customerInfo, productIdentifier };
    } catch (error) {
      console.error('Failed to purchase package:', error);
      throw error;
    }
  }

  /**
   * Restore purchases
   */
  public async restorePurchases(): Promise<CustomerInfo> {
    try {
      return await Purchases.restorePurchases();
    } catch (error) {
      console.error('Failed to restore purchases:', error);
      throw error;
    }
  }

  /**
   * Login user (identify)
   */
  public async login(appUserId: string): Promise<CustomerInfo> {
    try {
      const { customerInfo } = await Purchases.logIn(appUserId);
      return customerInfo;
    } catch (error) {
      console.error('Failed to login user:', error);
      throw error;
    }
  }

  /**
   * Logout user
   */
  public async logout(): Promise<CustomerInfo> {
    try {
      const { customerInfo } = await Purchases.logOut();
      return customerInfo;
    } catch (error) {
      console.error('Failed to logout user:', error);
      throw error;
    }
  }

  /**
   * Check if user has active subscription
   */
  public async hasActiveSubscription(): Promise<boolean> {
    try {
      const customerInfo = await this.getCustomerInfo();
      return (
        typeof customerInfo.entitlements.active !== 'undefined' &&
        Object.keys(customerInfo.entitlements.active).length > 0
      );
    } catch (error) {
      console.error('Failed to check active subscription:', error);
      return false;
    }
  }

  /**
   * Get active entitlements
   */
  public async getActiveEntitlements(): Promise<string[]> {
    try {
      const customerInfo = await this.getCustomerInfo();
      return Object.keys(customerInfo.entitlements.active);
    } catch (error) {
      console.error('Failed to get active entitlements:', error);
      return [];
    }
  }

  /**
   * Check if configured
   */
  public isSDKConfigured(): boolean {
    return this.isConfigured;
  }
}

export const revenueCatService = RevenueCatService.getInstance();

import type {
  PurchasesPackage,
  CustomerInfo,
  PurchasesOffering,
  PurchasesStoreProduct,
} from 'react-native-purchases';

/**
 * Subscription package information
 */
export interface SubscriptionPackage {
  identifier: string;
  packageType: string;
  product: SubscriptionProduct;
  offering?: PurchasesOffering;
}

/**
 * Subscription product information
 */
export interface SubscriptionProduct {
  identifier: string;
  description: string;
  title: string;
  price: number;
  priceString: string;
  currencyCode: string;
  introPrice?: {
    price: number;
    priceString: string;
    period: string;
  };
}

/**
 * Customer subscription information
 */
export interface SubscriptionInfo {
  isActive: boolean;
  willRenew: boolean;
  periodType: string;
  expirationDate?: Date;
  productIdentifier?: string;
  originalPurchaseDate?: Date;
}

/**
 * Subscription state
 */
export interface SubscriptionState {
  customerInfo: CustomerInfo | null;
  packages: SubscriptionPackage[];
  offerings: PurchasesOffering[];
  currentOffering: PurchasesOffering | null;
  isLoading: boolean;
  error: Error | null;
}

/**
 * Purchase result
 */
export interface PurchaseResult {
  customerInfo: CustomerInfo;
  productIdentifier: string;
  transaction?: any;
}

/**
 * Re-export types from react-native-purchases
 */
export type {
  PurchasesPackage,
  CustomerInfo,
  PurchasesOffering,
  PurchasesStoreProduct,
};

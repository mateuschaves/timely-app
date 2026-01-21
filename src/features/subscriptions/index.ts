/**
 * Subscriptions Module
 * 
 * This module provides RevenueCat integration for subscription management.
 * 
 * Features:
 * - Initialize RevenueCat SDK
 * - Fetch available subscription offerings
 * - Purchase subscriptions
 * - Restore purchases
 * - Manage user subscriptions
 * - Check subscription status
 * 
 * Usage:
 * 
 * 1. Wrap your app with SubscriptionProvider:
 * 
 * ```tsx
 * import { SubscriptionProvider } from '@features/subscriptions';
 * 
 * function App() {
 *   return (
 *     <SubscriptionProvider apiKey="your_revenuecat_api_key">
 *       <YourApp />
 *     </SubscriptionProvider>
 *   );
 * }
 * ```
 * 
 * 2. Use hooks in your components:
 * 
 * ```tsx
 * import { useSubscriptions, usePurchase } from '@features/subscriptions';
 * 
 * function SubscriptionScreen() {
 *   const { packages, currentOffering, hasActiveSubscription } = useSubscriptions();
 *   const { purchase, restore } = usePurchase();
 *   
 *   const handlePurchase = async (pkg) => {
 *     try {
 *       await purchase(pkg);
 *       alert('Purchase successful!');
 *     } catch (error) {
 *       alert('Purchase failed');
 *     }
 *   };
 *   
 *   return (
 *     <View>
 *       {packages.map(pkg => (
 *         <Button key={pkg.identifier} onPress={() => handlePurchase(pkg)}>
 *           {pkg.product.title}
 *         </Button>
 *       ))}
 *     </View>
 *   );
 * }
 * ```
 */

// Context
export {
  SubscriptionProvider,
  useSubscriptionContext,
} from './context/SubscriptionContext';

// Hooks
export {
  useSubscriptions,
  usePurchase,
  useSubscriptionUser,
} from './hooks/useSubscriptions';

// Services
export { revenueCatService } from './services/RevenueCatService';

// Types
export type {
  SubscriptionPackage,
  SubscriptionProduct,
  SubscriptionInfo,
  SubscriptionState,
  PurchaseResult,
  CustomerInfo,
  PurchasesPackage,
  PurchasesOffering,
  PurchasesStoreProduct,
} from './types';

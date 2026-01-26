import '@testing-library/jest-native/extend-expect';
import { jest } from '@jest/globals';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () => {
  const storage: Record<string, string> = {};
  return {
    __esModule: true,
    default: {
      getItem: jest.fn((key: string) => Promise.resolve(storage[key] || null)),
      setItem: jest.fn((key: string, value: string) => {
        storage[key] = value;
        return Promise.resolve();
      }),
      removeItem: jest.fn((key: string) => {
        delete storage[key];
        return Promise.resolve();
      }),
      clear: jest.fn(() => {
        Object.keys(storage).forEach(key => delete storage[key]);
        return Promise.resolve();
      }),
      getAllKeys: jest.fn(() => Promise.resolve(Object.keys(storage))),
      multiGet: jest.fn((keys: string[]) =>
        Promise.resolve(keys.map(key => [key, storage[key] || null]))
      ),
      multiSet: jest.fn((pairs: [string, string][]) => {
        pairs.forEach(([key, value]) => {
          storage[key] = value;
        });
        return Promise.resolve();
      }),
      multiRemove: jest.fn((keys: string[]) => {
        keys.forEach(key => delete storage[key]);
        return Promise.resolve();
      }),
    },
  };
});

// Mock expo modules
jest.mock('expo-apple-authentication', () => ({
  signInAsync: jest.fn(),
  AppleAuthenticationScope: {
    FULL_NAME: 'FULL_NAME',
    EMAIL: 'EMAIL',
  },
}));

jest.mock('expo-location', () => ({
  requestForegroundPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted' })
  ),
  getForegroundPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted' })
  ),
  getCurrentPositionAsync: jest.fn(() =>
    Promise.resolve({
      coords: {
        latitude: -23.5505,
        longitude: -46.6333,
        altitude: null,
        accuracy: 10,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: Date.now(),
    })
  ),
  getLastKnownPositionAsync: jest.fn(() =>
    Promise.reject(new Error('No last known position'))
  ),
  Accuracy: {
    Lowest: 1,
    Low: 2,
    Balanced: 6,
    High: 4,
    Highest: 5,
    Navigation: 6,
  },
}));

jest.mock('expo-linking', () => ({
  createURL: jest.fn((path) => `timely://${path}`),
  parse: jest.fn((url) => {
    const urlObj = new URL(url);
    const params: Record<string, string> = {};
    urlObj.searchParams.forEach((value, key) => {
      params[key] = value;
    });
    return {
      path: urlObj.pathname,
      queryParams: params,
    };
  }),
  addEventListener: jest.fn(() => ({ remove: jest.fn() })),
  removeEventListener: jest.fn(),
  getInitialURL: jest.fn(() => Promise.resolve(null)),
  canOpenURL: jest.fn(() => Promise.resolve(true)),
  openURL: jest.fn(() => Promise.resolve(true)),
}));

jest.mock('expo-notifications', () => ({
  requestPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted' })
  ),
  scheduleNotificationAsync: jest.fn(() => Promise.resolve('notification-id')),
  cancelAllScheduledNotificationsAsync: jest.fn(() => Promise.resolve()),
  setNotificationHandler: jest.fn(),
  getPermissionsAsync: jest.fn(() =>
    Promise.resolve({ status: 'granted' })
  ),
}));

jest.mock('expo-constants', () => ({
  default: {
    expoConfig: {
      extra: {},
    },
  },
}));

jest.mock('expo-localization', () => ({
  getLocales: jest.fn(() => [{ languageCode: 'pt', languageTag: 'pt-BR' }]),
  locale: 'pt-BR',
}));

jest.mock('expo-sharing', () => ({
  shareAsync: jest.fn(() => Promise.resolve()),
  isAvailableAsync: jest.fn(() => Promise.resolve(true)),
}));

jest.mock('expo-live-activity', () => ({
  startActivity: jest.fn(() => Promise.resolve('activity-id-123')),
  endActivity: jest.fn(() => Promise.resolve()),
  updateActivity: jest.fn(() => Promise.resolve()),
  areActivitiesEnabled: jest.fn(() => Promise.resolve(true)),
  defineActivityAttributes: jest.fn((name, attributes, contentState) => ({
    name,
    attributes,
    contentState,
  })),
  defineActivityAttributesModule: jest.fn((activities) => activities),
}));

// Mock react-native-safe-area-context globally
jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const mockInsets = { top: 0, bottom: 0, left: 0, right: 0 };
  const mockFrame = { x: 0, y: 0, width: 375, height: 812 };
  const mockContext = React.createContext ? React.createContext(mockInsets) : {
    Provider: ({ children }) => children,
    Consumer: ({ children }) => children(mockInsets),
  };
  // SafeAreaView needs to be a string 'View' for styled-components to work
  // styled-components will treat it as a View component
  return {
    SafeAreaProvider: ({ children }) => children,
    SafeAreaView: 'View',
    useSafeAreaInsets: () => mockInsets,
    useSafeAreaFrame: () => mockFrame,
    SafeAreaContext: mockContext,
    SafeAreaInsetsContext: mockContext,
    initialWindowMetrics: {
      insets: mockInsets,
      frame: mockFrame,
    },
  };
});

// Mock React Native modules
// Note: NativeAnimatedHelper is not needed for testing
// Note: useColorScheme should be mocked in individual test files if needed
// Note: BackHandler should be mocked in individual test files that use NavigationContainer

// Mock @react-navigation/native
jest.mock('@react-navigation/native', () => {
  const actualNav = jest.requireActual('@react-navigation/native');
  return {
    ...actualNav,
    useNavigation: jest.fn(() => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      reset: jest.fn(),
      setOptions: jest.fn(),
    })),
    useFocusEffect: jest.fn((callback) => {
      // Execute the callback immediately in tests
      if (typeof callback === 'function') {
        callback();
      }
    }),
    useRoute: jest.fn(() => ({
      params: {},
    })),
    useIsFocused: jest.fn(() => true),
  };
});

// Mock console.tron for Reactotron
global.console.tron = {
  log: jest.fn(),
  display: jest.fn(),
  error: jest.fn(),
};

// Mock RevenueCat service
jest.mock('@/features/subscriptions/services/RevenueCatService', () => ({
  revenueCatService: {
    configure: jest.fn(() => Promise.resolve()),
    getOfferings: jest.fn(() => Promise.resolve(null)),
    getCustomerInfo: jest.fn(() => Promise.resolve({
      entitlements: { active: {} },
      activeSubscriptions: [],
      allPurchasedProductIdentifiers: [],
      latestExpirationDate: null,
      firstSeen: new Date().toISOString(),
      originalAppUserId: 'test_user',
      requestDate: new Date().toISOString(),
      allExpirationDates: {},
      allPurchaseDates: {},
      originalApplicationVersion: '1.0.0',
      originalPurchaseDate: null,
      managementURL: null,
      nonSubscriptionTransactions: [],
    })),
    purchasePackage: jest.fn(),
    restorePurchases: jest.fn(),
    login: jest.fn(),
    logout: jest.fn(),
    isSDKConfigured: jest.fn(() => false),
    hasActiveSubscription: jest.fn(() => Promise.resolve(false)),
    getActiveEntitlements: jest.fn(() => Promise.resolve([])),
    addCustomerInfoUpdateListener: jest.fn(() => jest.fn()),
  },
}));

// Mock __DEV__
global.__DEV__ = true;

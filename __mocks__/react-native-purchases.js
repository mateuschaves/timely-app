export const LOG_LEVEL = {
  VERBOSE: 'VERBOSE',
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
};

const Purchases = {
  configure: jest.fn().mockResolvedValue(undefined),
  setLogLevel: jest.fn(),
  getOfferings: jest.fn().mockResolvedValue({ current: null }),
  getCustomerInfo: jest.fn().mockResolvedValue({ entitlements: { active: {} } }),
  purchasePackage: jest.fn().mockResolvedValue({
    customerInfo: { entitlements: { active: {} } },
    productIdentifier: 'test_product',
  }),
  restorePurchases: jest.fn().mockResolvedValue({ entitlements: { active: {} } }),
  logIn: jest.fn().mockResolvedValue({ customerInfo: { entitlements: { active: {} } } }),
  logOut: jest.fn().mockResolvedValue({ customerInfo: { entitlements: { active: {} } } }),
};

export default Purchases;

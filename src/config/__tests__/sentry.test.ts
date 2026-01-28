// Mock Sentry before importing
let mockSentryInit = jest.fn();
jest.mock('@sentry/react-native', () => ({
  init: mockSentryInit,
  wrap: jest.fn((component) => component),
}));

// Mock expo-constants
let mockExpoConfig = {
  extra: {
    sentryDsn: '',
  },
  version: '1.0.0',
};

jest.mock('expo-constants', () => ({
  __esModule: true,
  default: {
    get expoConfig() {
      return mockExpoConfig;
    },
  },
}));

describe('sentry', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockSentryInit.mockClear();
    global.__DEV__ = false;
    mockExpoConfig = {
      extra: {
        sentryDsn: '',
      },
      version: '1.0.0',
    };
  });

  it('should not initialize Sentry when DSN is not configured', () => {
    mockExpoConfig.extra.sentryDsn = '';
    
    const { initSentry } = require('../sentry');
    const consoleSpy = jest.spyOn(console, 'log');
    
    initSentry();
    
    expect(mockSentryInit).not.toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith('Sentry DSN não configurado. Sentry não será inicializado.');
    
    consoleSpy.mockRestore();
  });

  it('should initialize Sentry when DSN is configured in production', () => {
    mockExpoConfig.extra.sentryDsn = 'https://test@sentry.io/123';
    global.__DEV__ = false;
    
    const { initSentry } = require('../sentry');
    const consoleSpy = jest.spyOn(console, 'log');
    
    initSentry();
    
    expect(mockSentryInit).toHaveBeenCalledWith({
      dsn: 'https://test@sentry.io/123',
      enabled: true,
      environment: 'production',
      release: 'timely-app@1.0.0',
      tracesSampleRate: 1.0,
      enableAutoSessionTracking: true,
      sessionTrackingIntervalMillis: 30000,
    });
    expect(consoleSpy).toHaveBeenCalledWith('Sentry inicializado com sucesso');
    
    consoleSpy.mockRestore();
  });

  it('should disable Sentry in development mode', () => {
    mockExpoConfig.extra.sentryDsn = 'https://test@sentry.io/123';
    global.__DEV__ = true;
    
    const { initSentry } = require('../sentry');
    
    initSentry();
    
    expect(mockSentryInit).toHaveBeenCalledWith(
      expect.objectContaining({
        enabled: false,
        environment: 'development',
      })
    );
  });

  it('should use default version when version is not available', () => {
    mockExpoConfig.extra.sentryDsn = 'https://test@sentry.io/123';
    mockExpoConfig.version = undefined;
    
    const { initSentry } = require('../sentry');
    
    initSentry();
    
    expect(mockSentryInit).toHaveBeenCalledWith(
      expect.objectContaining({
        release: 'timely-app@1.0.0',
      })
    );
  });

  it('should export Sentry instance', () => {
    const sentryModule = require('../sentry');
    
    expect(sentryModule.Sentry).toBeDefined();
    expect(sentryModule.initSentry).toBeDefined();
    expect(typeof sentryModule.initSentry).toBe('function');
  });
});

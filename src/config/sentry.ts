import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';

// Inicializa o Sentry imediatamente
Sentry.init({
  dsn: 'https://962833b3da0d202e4dde32bb2ac9f11b@o4510802246565888.ingest.us.sentry.io/4510802249711616',

  // Adds more context data to events (IP address, cookies, user, etc.)
  // For more information, visit: https://docs.sentry.io/platforms/react-native/data-management/data-collected/
  sendDefaultPii: true,

  // Enable Logs
  enableLogs: true,

  // Habilita o Sentry apenas em produção
  enabled: !__DEV__,

  // Define o ambiente
  environment: __DEV__ ? 'development' : 'production',

  // Define a versão da release
  release: `timely-app@${Constants.expoConfig?.version || '1.0.0'}`,

  // Configure Session Replay
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1,
  integrations: [Sentry.mobileReplayIntegration(), Sentry.feedbackIntegration()],

  // Define o percentual de transações para performance monitoring (10%)
  tracesSampleRate: __DEV__ ? 1.0 : 0.1,

  // Habilita auto session tracking
  enableAutoSessionTracking: true,

  // Session tracking interval (30000ms = 30 segundos)
  sessionTrackingIntervalMillis: 30000,

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: __DEV__,
});

if (__DEV__) {
  console.log('Sentry inicializado com sucesso');
}

// Exporta o Sentry para uso em outros lugares da aplicação
export { Sentry };

import * as Sentry from '@sentry/react-native';
import Constants from 'expo-constants';

// Sentry DSN - Em produção, deve ser configurado via variável de ambiente
const SENTRY_DSN = Constants.expoConfig?.extra?.sentryDsn || '';

export const initSentry = () => {
  // Só inicializa o Sentry se tiver um DSN configurado
  if (!SENTRY_DSN) {
    console.log('Sentry DSN não configurado. Sentry não será inicializado.');
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    // Habilita o Sentry apenas em produção
    enabled: !__DEV__,
    // Define o ambiente
    environment: __DEV__ ? 'development' : 'production',
    // Define a versão da release
    release: `timely-app@${Constants.expoConfig?.version || '1.0.0'}`,
    // Define o percentual de transações para performance monitoring
    tracesSampleRate: 1.0,
    // Habilita auto session tracking
    enableAutoSessionTracking: true,
    // Session tracking timeout (em segundos)
    sessionTrackingIntervalMillis: 30000,
  });

  console.log('Sentry inicializado com sucesso');
};

// Exporta o Sentry para uso em outros lugares da aplicação
export { Sentry };

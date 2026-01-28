import * as Sentry from 'sentry-expo';
import Constants from 'expo-constants';

export const initSentry = () => {
  // Lê o DSN do Sentry da configuração
  const SENTRY_DSN = Constants.expoConfig?.extra?.sentryDsn || '';
  
  // Só inicializa o Sentry se tiver um DSN configurado
  if (!SENTRY_DSN) {
    if (__DEV__) {
      console.log('Sentry DSN não configurado. Sentry não será inicializado.');
    }
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
    // Define o percentual de transações para performance monitoring (10%)
    // Ajuste conforme necessário para balancear visibilidade e custos
    tracesSampleRate: __DEV__ ? 1.0 : 0.1,
    // Habilita auto session tracking
    enableAutoSessionTracking: true,
    // Session tracking interval (30000ms = 30 segundos)
    sessionTrackingIntervalMillis: 30000,
  });

  if (__DEV__) {
    console.log('Sentry inicializado com sucesso');
  }
};

// Exporta o Sentry para uso em outros lugares da aplicação
export { Sentry };

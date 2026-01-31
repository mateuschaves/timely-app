import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider, useAuthContext } from './src/features/auth';
import { SubscriptionProvider, SubscriptionAuthSync } from './src/features/subscriptions';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AuthNavigator } from './src/navigation/AuthNavigator';
import { OnboardingNavigator } from './src/navigation/OnboardingNavigator';
import { useOnboarding } from './src/features/onboarding';
import { FeedbackProvider } from './src/utils/feedback';
import { ThemeProvider, ThemeWrapper } from './src/theme';
import { useGeofencing } from './src/features/time-clock/hooks/useGeofencing';
import { useNotifications } from './src/hooks/useNotifications';
import { setupReactotron } from './src/config/reactotron';
import { Sentry } from './src/config/sentry'; // Inicializa o Sentry
import './src/config/reactotron.d';
import './src/i18n/config';
import { Platform } from 'react-native';

// Previne que a splash screen seja escondida automaticamente
SplashScreen.preventAutoHideAsync();

const REVENUECAT_API_KEY = Platform.select({
  ios: 'appl_QNrzMhLQHcdNJWeOXnMJPmtoQdz',
  android: 'test_YVLYOxJIIWXPufinNXuknZzCrbk',
});

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

if (__DEV__) {
  setupReactotron();
  console.tron?.log('Reactotron configurado');
}

function NavigationContent() {
  const { isAuthenticated, isLoading } = useAuthContext();
  const { isOnboardingCompleted, isLoading: isOnboardingLoading } = useOnboarding();
  const { isMonitoring, startMonitoring } = useGeofencing();
  useNotifications();

  const geofencingInitialized = useRef(false);


  // Re-initialize geofencing if it was previously active
  // This ensures monitoring resumes when app reopens if user had it enabled
  // Note: The native module may still be monitoring in background, but we need to
  // re-establish event listeners and app-side state when the app launches
  useEffect(() => {
    if (!isAuthenticated || geofencingInitialized.current) return;

    // Only re-start monitoring if it was already active in the native module
    // isMonitoring is retrieved from the native module by useGeofencing hook
    if (isMonitoring) {
      geofencingInitialized.current = true;
      
      const initGeofencing = async () => {
        try {
          await startMonitoring();
          console.log('✅ Resumed geofencing monitoring on app start');
        } catch (error) {
          console.error('Error resuming geofencing:', error);
        }
      };

      // Delay initialization slightly to allow app to fully load
      const timeoutId = setTimeout(() => {
        initGeofencing();
      }, 2000);

      return () => clearTimeout(timeoutId);
    }
  }, [isAuthenticated, isMonitoring, startMonitoring]);


  // Não renderiza nada durante o loading - a splash screen fica visível
  if (isLoading || isOnboardingLoading) {
    return null;
  }

  // Show onboarding if user is authenticated but hasn't completed onboarding
  if (isAuthenticated && !isOnboardingCompleted) {
    return <OnboardingNavigator />;
  }

  return (
    <>
      {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
    </>
  );
}

function Navigation() {
  const { isLoading } = useAuthContext();
  const { isLoading: isOnboardingLoading } = useOnboarding();

  useEffect(() => {
    // Esconde a splash screen quando os dados do usuário e onboarding estiverem carregados
    if (!isLoading && !isOnboardingLoading) {
      SplashScreen.hideAsync().catch((error) => {
        console.warn('Erro ao esconder splash screen:', error);
      });
    }
  }, [isLoading, isOnboardingLoading]);

  if (isLoading || isOnboardingLoading) {
    // Durante o carregamento, retorna null para manter a splash screen visível
    return null;
  }

  return (
    <NavigationContainer>
      <NavigationContent />
    </NavigationContainer>
  );
}

function AppContent() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ThemeWrapper>
          <AuthProvider>
            <SubscriptionProvider apiKey={REVENUECAT_API_KEY}>
              <SubscriptionAuthSync />
              <FeedbackProvider>
                <Navigation />
              </FeedbackProvider>
            </SubscriptionProvider>
          </AuthProvider>
        </ThemeWrapper>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default Sentry.wrap(AppContent);
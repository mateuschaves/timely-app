import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider, useAuthContext } from './src/features/auth';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AuthNavigator } from './src/navigation/AuthNavigator';
import { OnboardingNavigator } from './src/navigation/OnboardingNavigator';
import { useOnboarding } from './src/features/onboarding';
import { FeedbackProvider } from './src/utils/feedback';
import { ThemeProvider, ThemeWrapper } from './src/theme';
import { useGeofencing } from './src/features/time-clock/hooks/useGeofencing';
import { useNotifications } from './src/hooks/useNotifications';
import { setupReactotron } from './src/config/reactotron';
import './src/config/reactotron.d';
import './src/i18n/config';
import { SubscriptionProvider } from '@/features/subscriptions';
import { Platform } from 'react-native';

// Previne que a splash screen seja escondida automaticamente
SplashScreen.preventAutoHideAsync();

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
  const { startMonitoring } = useGeofencing();
  useNotifications();

  // Initialize geofencing when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    const initGeofencing = async () => {
      try {
        await startMonitoring();
      } catch (error) {
        console.error('Error initializing geofencing:', error);
      }
    };

    // Delay initialization slightly to allow app to fully load
    setTimeout(() => {
      //initGeofencing();
    }, 2000);
  }, [isAuthenticated]);


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


const REVENUECAT_API_KEY = Platform.select({
  ios: 'test_YVLYOxJIIWXPufinNXuknZzCrbk',
  android: 'test_YVLYOxJIIWXPufinNXuknZzCrbk',
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ThemeWrapper>
        <SubscriptionProvider apiKey={REVENUECAT_API_KEY}>
          <AuthProvider>
            <FeedbackProvider>
              <Navigation />
            </FeedbackProvider>
          </AuthProvider>
          </SubscriptionProvider>
        </ThemeWrapper>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

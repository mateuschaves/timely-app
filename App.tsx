import React, { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Linking as RNLinking } from 'react-native';
import * as ExpoLinking from 'expo-linking';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider, useAuthContext } from './src/features/auth';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AuthNavigator } from './src/navigation/AuthNavigator';
import { OnboardingNavigator } from './src/navigation/OnboardingNavigator';
import { useOnboarding } from './src/features/onboarding';
import { FeedbackProvider } from './src/utils/feedback';
import { ThemeProvider, ThemeWrapper } from './src/theme';
import { useTimeClock } from './src/features/time-clock/hooks/useTimeClock';
import { useGeofencing } from './src/features/time-clock/hooks/useGeofencing';
import { useLastEvent } from './src/features/home/hooks/useLastEvent';
import { useNotifications } from './src/hooks/useNotifications';
import * as Notifications from 'expo-notifications';
import { setupReactotron } from './src/config/reactotron';
import { STORAGE_KEYS } from './src/config/storage';
import './src/config/reactotron.d';
import './src/i18n/config';

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

// Configuração de linking para navegação (não processa deeplinks de clock)
const linking = {
  prefixes: ['timely://', 'https://timely.app'],
  config: {
    screens: {
      Home: '',
      History: 'history',
    },
  },
  // Filtra apenas URLs de navegação, não deeplinks de clock
  filter: (url: string) => {
    // Se for um deeplink de clock (tem parâmetro time, hour ou é timely://clock), não processa aqui
    if (url.includes('time=') || url.includes('hour=') || url === 'timely://clock' || url.startsWith('timely://clock?')) {
      return false;
    }
    return true;
  },
};

function NavigationContent() {
  const { isAuthenticated, isLoading } = useAuthContext();
  const { isOnboardingCompleted, isLoading: isOnboardingLoading } = useOnboarding();
  const { handleDeeplink, clock } = useTimeClock();
  const { nextAction } = useLastEvent();
  const navigation = useNavigation<any>();
  const { isMonitoring, startMonitoring } = useGeofencing();
  useNotifications();

  const lastProcessedUrl = useRef<string | null>(null);
  const isProcessingRef = useRef(false);
  const initialUrlChecked = useRef(false);

  // Define processDeeplink as a useCallback so it can be used in multiple effects
  const processDeeplink = useCallback(async (url: string) => {
    // Verifica se a URL é válida
    if (!url) {
      console.log('URL inválida, ignorando:', url);
      return;
    }

    // Se for timely://clock (sem parâmetros), adiciona o horário atual do dispositivo
    let processedUrl = url;
    if (url === 'timely://clock' || url.startsWith('timely://clock?')) {
      const currentTime = new Date().toISOString();
      // Se já tiver query params, adiciona time=, senão cria novo
      if (url.includes('?')) {
        processedUrl = `${url}&time=${encodeURIComponent(currentTime)}`;
      } else {
        processedUrl = `timely://clock?time=${encodeURIComponent(currentTime)}`;
      }
      console.log('Deeplink timely://clock detectado, usando horário atual:', processedUrl);
    } else if (!url.includes('time=') && !url.includes('hour=')) {
      // Se não for timely://clock e não tiver time/hour, ignora
      console.log('URL não contém parâmetro time ou hour, ignorando:', url);
      return;
    }

    // Evita processar a mesma URL múltiplas vezes
    if (lastProcessedUrl.current === processedUrl) {
      console.log('Deeplink já foi processado, ignorando:', processedUrl);
      return;
    }

    if (isProcessingRef.current) {
      console.log('Deeplink já está sendo processado, ignorando:', processedUrl);
      return;
    }

    isProcessingRef.current = true;
    lastProcessedUrl.current = processedUrl;
    console.log('Deeplink recebido:', processedUrl);

    try {
      // Determina a ação baseada no nextAction se não tiver type no deeplink
      const parsedUrl = ExpoLinking.parse(processedUrl);
      const params = parsedUrl.queryParams as { type?: string };
      
      // Se não tiver type no deeplink, usa nextAction para determinar a ação automaticamente
      // nextAction já vem no formato 'clock-in' ou 'clock-out' do enum ClockAction
      const actionToUse = params.type ? undefined : (nextAction as 'clock-in' | 'clock-out' | undefined);
      
      // Processa o deeplink e navega para History após sucesso
      await handleDeeplink(processedUrl, () => {
        // Navega para a tab History após bater o ponto
        navigation.navigate('Main', { screen: 'History' });
      }, actionToUse);
    } catch (error) {
      console.error('Erro ao processar deeplink:', error);
    } finally {
      // Reset após um tempo para permitir novos deeplinks
      setTimeout(() => {
        isProcessingRef.current = false;
        // Limpa a URL após 5 segundos para permitir o mesmo deeplink novamente
        setTimeout(() => {
          lastProcessedUrl.current = null;
        }, 5000);
      }, 1000);
    }
  }, [handleDeeplink, navigation, nextAction]);

  // Handle notification responses from geofencing
  useEffect(() => {
    if (!isAuthenticated) return;

    const subscription = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      
      if (data.type === 'geofence_enter' || data.type === 'geofence_exit') {
        console.log('Geofence notification tapped:', data);
        
        // Create a deeplink URL to trigger clock in/out
        const action = data.action || 'clock-in';
        const currentTime = new Date().toISOString();
        const deeplink = `timely://clock?time=${encodeURIComponent(currentTime)}&type=${action === 'clock-in' ? 'entry' : 'exit'}`;
        
        // Process the deeplink
        processDeeplink(deeplink);
      }
    });

    return () => subscription.remove();
  }, [isAuthenticated, processDeeplink]);

  // Re-initialize geofencing if it was previously active
  // This ensures monitoring resumes when app reopens if user had it enabled
  useEffect(() => {
    if (!isAuthenticated) return;

    // Only re-start monitoring if it was already active in the native module
    // isMonitoring is retrieved from the native module by useGeofencing hook
    if (isMonitoring) {
      const initGeofencing = async () => {
        try {
          await startMonitoring();
          console.log('✅ Resumed geofencing monitoring on app start');
        } catch (error) {
          console.error('Error resuming geofencing:', error);
        }
      };

      // Delay initialization slightly to allow app to fully load
      setTimeout(() => {
        initGeofencing();
      }, 2000);
    }
  }, [isAuthenticated, isMonitoring, startMonitoring]);

  useEffect(() => {
    if (!isAuthenticated) return;

    // Tenta usar expo-linking, se não disponível usa React Native Linking
    let Linking: any;
    try {
      // Verifica se expo-linking está disponível e funcional
      if (ExpoLinking && typeof ExpoLinking.addEventListener === 'function') {
        Linking = ExpoLinking;
      } else {
        Linking = RNLinking;
      }
    } catch (error) {
      Linking = RNLinking;
    }

    // Listener para deeplinks recebidos enquanto o app está rodando
    // Este listener só é acionado quando o app recebe um deeplink enquanto está aberto
    const subscription = Linking.addEventListener('url', async (event: { url: string }) => {
      // Verifica se é um deeplink válido de clock (com time ou timely://clock)
      if (event.url && (event.url.includes('time=') || event.url.includes('hour=') || event.url === 'timely://clock' || event.url.startsWith('timely://clock?'))) {
        // Só processa se não for a mesma URL que já foi processada
        if (event.url !== lastProcessedUrl.current) {
          // Limpa o AsyncStorage para permitir processar este novo deeplink
          await AsyncStorage.removeItem(STORAGE_KEYS.LAST_PROCESSED_DEEPLINK);
          processDeeplink(event.url);
        }
      }
    });

    // Para quando o app é aberto via deeplink (app estava fechado)
    // getInitialURL só retorna uma URL se o app foi aberto via deeplink
    // Usamos AsyncStorage para evitar processar em reloads
    if (!initialUrlChecked.current) {
      initialUrlChecked.current = true;

      const checkInitialUrl = async () => {
        try {
          const initialUrl = await Linking.getInitialURL();

          // Valida se a URL existe
          if (!initialUrl) {
            return; // Não foi aberto via deeplink
          }

          // Se for timely://clock, será processado e terá time adicionado
          // Se não for timely://clock e não tiver time/hour, ignora
          if (initialUrl !== 'timely://clock' && !initialUrl.startsWith('timely://clock?') && !initialUrl.includes('time=') && !initialUrl.includes('hour=')) {
            console.log('Initial URL não é um deeplink de clock válido, ignorando:', initialUrl);
            return;
          }

          // Verifica no AsyncStorage se esta URL já foi processada
          const lastProcessed = await AsyncStorage.getItem(STORAGE_KEYS.LAST_PROCESSED_DEEPLINK);

          if (lastProcessed === initialUrl) {
            console.log('Initial URL já foi processada anteriormente (reload), ignorando:', initialUrl);
            return;
          }

          // Se for timely://clock, não precisa validar time aqui (será adicionado no processDeeplink)
          const isClockDeeplink = initialUrl === 'timely://clock' || initialUrl.startsWith('timely://clock?');
          
          if (!isClockDeeplink) {
            // Valida se o parâmetro time tem um valor válido apenas para URLs que não são timely://clock
            try {
              const parsed = ExpoLinking.parse(initialUrl);
              const params = parsed.queryParams as { time?: string };

              if (!params.time || params.time.trim() === '') {
                console.log('Parâmetro time está vazio ou inválido, ignorando:', initialUrl);
                return;
              }

              // Valida se é uma data válida
              const timeDate = new Date(params.time);
              if (isNaN(timeDate.getTime())) {
                console.log('Parâmetro time não é uma data válida, ignorando:', initialUrl);
                return;
              }
            } catch (parseError) {
              console.error('Erro ao parsear URL do deeplink:', parseError);
              return;
            }
          }

          console.log('App aberto via deeplink:', initialUrl);

          // Salva a URL processada no AsyncStorage antes de processar
          await AsyncStorage.setItem(STORAGE_KEYS.LAST_PROCESSED_DEEPLINK, initialUrl);

          // Pequeno delay para garantir que o app está totalmente inicializado
          setTimeout(() => {
            processDeeplink(initialUrl);
          }, 500);
        } catch (error) {
          console.error('Erro ao verificar initial URL:', error);
        }
      };

      // Verifica initial URL apenas uma vez quando autenticado
      checkInitialUrl();
    }

    return () => {
      if (subscription?.remove) {
        subscription.remove();
      }
    };
  }, [isAuthenticated, processDeeplink]);

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
    <NavigationContainer linking={linking}>
      <NavigationContent />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <ThemeWrapper>
          <AuthProvider>
            <FeedbackProvider>
              <Navigation />
            </FeedbackProvider>
          </AuthProvider>
        </ThemeWrapper>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

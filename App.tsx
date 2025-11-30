import React, { useEffect, useRef } from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Linking as RNLinking } from 'react-native';
import * as ExpoLinking from 'expo-linking';
import * as SplashScreen from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AuthProvider, useAuthContext } from './src/features/auth';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AuthNavigator } from './src/navigation/AuthNavigator';
import { FeedbackProvider } from './src/utils/feedback';
import { ThemeProvider, ThemeWrapper } from './src/theme';
import { useTimeClock } from './src/features/time-clock/hooks/useTimeClock';
import { useNotifications } from './src/hooks/useNotifications';
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
    // Se for um deeplink de clock (tem parâmetro time ou hour), não processa aqui
    if (url.includes('time=') || url.includes('hour=')) {
      return false;
    }
    return true;
  },
};

function NavigationContent() {
  const { isAuthenticated, isLoading } = useAuthContext();
  const { handleDeeplink } = useTimeClock();
  const navigation = useNavigation<any>();
  useNotifications();

  const lastProcessedUrl = useRef<string | null>(null);
  const isProcessingRef = useRef(false);
  const initialUrlChecked = useRef(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    const processDeeplink = async (url: string) => {
      // Verifica se a URL é válida e contém parâmetro time
      if (!url || !url.includes('time=')) {
        console.log('URL não contém parâmetro time, ignorando:', url);
        return;
      }

      // Evita processar a mesma URL múltiplas vezes
      if (lastProcessedUrl.current === url) {
        console.log('Deeplink já foi processado, ignorando:', url);
        return;
      }

      if (isProcessingRef.current) {
        console.log('Deeplink já está sendo processado, ignorando:', url);
        return;
      }

      isProcessingRef.current = true;
      lastProcessedUrl.current = url;
      console.log('Deeplink recebido com parâmetro time:', url);

      try {
        // Processa o deeplink e navega para History após sucesso
        await handleDeeplink(url, () => {
          // Navega para a tab History após bater o ponto
          navigation.navigate('Main', { screen: 'History' });
        });
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
    };

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
      // Verifica se é um deeplink válido de clock com parâmetro time
      if (event.url && event.url.includes('time=')) {
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

          // Valida se a URL existe e contém o parâmetro time
          if (!initialUrl) {
            return; // Não foi aberto via deeplink
          }

          // Verifica se contém o parâmetro time
          if (!initialUrl.includes('time=')) {
            console.log('Initial URL não contém parâmetro time, ignorando:', initialUrl);
            return;
          }

          // Verifica no AsyncStorage se esta URL já foi processada
          const lastProcessed = await AsyncStorage.getItem(STORAGE_KEYS.LAST_PROCESSED_DEEPLINK);

          if (lastProcessed === initialUrl) {
            console.log('Initial URL já foi processada anteriormente (reload), ignorando:', initialUrl);
            return;
          }

          // Valida se o parâmetro time tem um valor válido
          try {
            const parsed = Linking.parse(initialUrl);
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

            console.log('App aberto via deeplink com time válido:', initialUrl);

            // Salva a URL processada no AsyncStorage antes de processar
            await AsyncStorage.setItem(STORAGE_KEYS.LAST_PROCESSED_DEEPLINK, initialUrl);

            // Pequeno delay para garantir que o app está totalmente inicializado
            setTimeout(() => {
              processDeeplink(initialUrl);
            }, 500);
          } catch (parseError) {
            console.error('Erro ao parsear URL do deeplink:', parseError);
            return;
          }
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
  }, [isAuthenticated, handleDeeplink, navigation]);

  // Não renderiza nada durante o loading - a splash screen fica visível
  if (isLoading) {
    return null;
  }

  return (
    <>
      {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
    </>
  );
}

function Navigation() {
  const { isLoading } = useAuthContext();

  useEffect(() => {
    // Esconde a splash screen quando os dados do usuário estiverem carregados
    if (!isLoading) {
      SplashScreen.hideAsync().catch((error) => {
        console.warn('Erro ao esconder splash screen:', error);
      });
    }
  }, [isLoading]);

  if (isLoading) {
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

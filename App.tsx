import React, { useEffect, useRef } from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { View, ActivityIndicator, StyleSheet, Linking as RNLinking } from 'react-native';
import * as ExpoLinking from 'expo-linking';
import { AuthProvider, useAuthContext } from './src/features/auth';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AuthNavigator } from './src/navigation/AuthNavigator';
import { FeedbackProvider } from './src/utils/feedback';
import { useTimeClock } from './src/features/time-clock/hooks/useTimeClock';
import { useNotifications } from './src/hooks/useNotifications';
import { setupReactotron } from './src/config/reactotron';
import './src/config/reactotron.d';
import './src/i18n/config';

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

  queryClient.getQueryCache().subscribe((event) => {
    if (event?.type === 'updated' && console.tron) {
      console.tron.display({
        name: 'React Query',
        value: {
          queryKey: event.query.queryKey,
          state: event.query.state,
        },
        preview: `Query: ${JSON.stringify(event.query.queryKey)}`,
      });
    }
  });
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

  useEffect(() => {
    if (!isAuthenticated) return;

    const processDeeplink = (url: string) => {
      // Verifica se a URL é válida e contém parâmetros de clock
      if (!url || (!url.includes('time=') && !url.includes('hour='))) {
        console.log('URL não contém parâmetros de clock, ignorando:', url);
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
      console.log('Deeplink recebido:', url);

      // Navega para History após sucesso
      handleDeeplink(url, () => {
        // Navega para a tab History após bater o ponto
        navigation.navigate('Main', { screen: 'History' });
      });

      // Reset após um tempo para permitir novos deeplinks
      setTimeout(() => {
        isProcessingRef.current = false;
        // Limpa a URL após 5 segundos para permitir o mesmo deeplink novamente
        setTimeout(() => {
          lastProcessedUrl.current = null;
        }, 5000);
      }, 1000);
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
    const subscription = Linking.addEventListener('url', (event: { url: string }) => {
      // Verifica se é um deeplink válido de clock antes de processar
      if (event.url && (event.url.includes('time=') || event.url.includes('hour='))) {
        // Só processa se não for a mesma URL que já foi processada
        if (event.url !== lastProcessedUrl.current) {
          processDeeplink(event.url);
        }
      }
    });

    // NÃO processa getInitialURL - isso causa problemas em reload
    // Quando o app é aberto via deeplink, o listener acima captura o evento
    // Isso evita processar URLs antigas após reload

    return () => {
      if (subscription?.remove) {
        subscription.remove();
      }
    };
  }, [isAuthenticated, handleDeeplink, navigation]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <>
      {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
    </>
  );
}

function Navigation() {
  const { isAuthenticated, isLoading } = useAuthContext();

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
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
      <AuthProvider>
        <FeedbackProvider>
          <Navigation />
        </FeedbackProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});


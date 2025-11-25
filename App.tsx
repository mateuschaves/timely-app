import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import * as Linking from 'expo-linking';
import { AuthProvider, useAuthContext } from './src/features/auth';
import { AppNavigator } from './src/navigation/AppNavigator';
import { AuthNavigator } from './src/navigation/AuthNavigator';
import { setupReactotron } from './src/config/reactotron';
import './src/i18n/config';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// Inicializa Reactotron em desenvolvimento
if (__DEV__) {
  setupReactotron();
  console.tron?.log('Reactotron configurado');

  // Log customizado para monitorar React Query manualmente
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

const linking = {
  prefixes: ['timely://', 'https://timely.app'],
  config: {
    screens: {
      Home: '',
      History: 'history',
    },
  },
};

function Navigation() {
  const { isAuthenticated, isLoading } = useAuthContext();

  useEffect(() => {
    // Listener para deeplinks quando o app já está aberto
    const subscription = Linking.addEventListener('url', (event) => {
      const { url } = event;
      console.log('Deeplink recebido:', url);
    });

    // Verifica se o app foi aberto via deeplink
    Linking.getInitialURL().then((url) => {
      if (url) {

      }
    });

    return () => {
      subscription.remove();
    };
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007bff" />
      </View>
    );
  }

  return (
    <NavigationContainer linking={linking}>
      {isAuthenticated ? <AppNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Navigation />
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


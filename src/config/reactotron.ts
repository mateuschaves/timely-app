/**
 * Configuração do Reactotron
 * 
 * Reactotron é uma ferramenta de debugging para React Native
 * que permite inspecionar estado, logs, requisições HTTP, etc.
 * 
 * IMPORTANTE: Esta configuração só funciona em desenvolvimento.
 * Em produção, o Reactotron não será incluído no bundle.
 */

import Reactotron from 'reactotron-react-native';
import { Platform } from 'react-native';
import { scheduleTestNotification } from '@/utils/notifications';

// Verifica se está em desenvolvimento
const isDevelopment = __DEV__;

let reactotron: typeof Reactotron | null = null;

/**
 * Configura o Reactotron
 * 
 * NOTA: O plugin reactotron-react-query não é compatível com React Query v5.
 * O Reactotron funcionará normalmente para logs, networking e AsyncStorage.
 * Para monitorar React Query, use os logs customizados ou o React Query DevTools.
 */
export const setupReactotron = () => {
  if (!isDevelopment) {
    // Em produção, cria um objeto vazio para evitar erros
    console.tron = {
      log: () => {},
      warn: () => {},
      error: () => {},
      display: () => {},
      image: () => {},
    };
    return null;
  }

  reactotron = Reactotron.configure({
    name: 'Timely App',
    host: Platform.OS === 'ios' ? 'localhost' : '10.0.2.2', // Android emulator usa 10.0.2.2 para localhost
  })
    .useReactNative({
      asyncStorage: true, // Monitora AsyncStorage
      networking: {
        ignoreUrls: /symbolicate/, // Ignora URLs de symbolicate
      },
      editor: true,
      errors: { veto: () => false },
      overlay: false
    })
    .connect();

  // Limpa o console do Reactotron ao iniciar
  reactotron.clear?.();

  // Adiciona comandos customizados
  reactotron.onCustomCommand?.({
    command: 'schedule-test-notification',
    handler: async () => {
      try {
        await scheduleTestNotification();
        reactotron.log?.('✅ Notificação de teste agendada para daqui a 1 minuto!');
      } catch (error) {
        reactotron.error?.('❌ Erro ao agendar notificação de teste:', error);
      }
    },
    title: 'Agendar Notificação de Teste',
    description: 'Agenda uma notificação push para daqui a 1 minuto',
  });

  // Adiciona um helper para logar objetos
  console.tron = reactotron;

  // Expõe função globalmente para uso no console do Reactotron
  if (typeof global !== 'undefined') {
    (global as any).scheduleTestNotification = async () => {
      try {
        await scheduleTestNotification();
        reactotron.log?.('✅ Notificação de teste agendada para daqui a 1 minuto!');
      } catch (error) {
        reactotron.error?.('❌ Erro ao agendar notificação de teste:', error);
      }
    };
  }

  return reactotron;
};

// Inicializa o Reactotron
if (isDevelopment) {
  setupReactotron();
} else {
  console.tron = {
    log: () => {},
    warn: () => {},
    error: () => {},
    display: () => {},
    image: () => {},
  };
}

export default reactotron;


import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as QuickActions from 'expo-quick-actions';
import { useNavigation } from '@react-navigation/native';
import { useTimeClock } from './useTimeClock';
import { useLastEvent } from '@/features/home/hooks/useLastEvent';
import { useAuthContext } from '@/features/auth';

/**
 * Hook para processar Quick Actions e Siri Shortcuts do iOS
 * Quando um shortcut é acionado, registra o ponto com a hora atual do dispositivo
 * Usa a ação determinada pelo último evento (clock-in ou clock-out)
 */
export function useQuickActions() {
  const navigation = useNavigation<any>();
  const { isAuthenticated } = useAuthContext();
  const { clock } = useTimeClock();
  const { nextAction } = useLastEvent();
  const hasProcessedQuickAction = useRef(false);

  useEffect(() => {
    if (Platform.OS !== 'ios' || !isAuthenticated) return;

    // Configura os shortcuts quando o usuário está autenticado
    QuickActions.setItems([
      {
        type: 'com.wazowsky.timelyapp.clock',
        title: 'Bater Ponto',
        subtitle: 'Registrar entrada ou saída',
        icon: 'clock.fill',
        userInfo: {
          action: 'clock',
        },
      },
    ]);

    const handleQuickAction = async (data: QuickActions.QuickAction) => {
      if (!data || data.type !== 'com.wazowsky.timelyapp.clock') return;
      
      // Evita processar múltiplas vezes
      if (hasProcessedQuickAction.current) {
        return;
      }
      
      hasProcessedQuickAction.current = true;
      
      try {
        // Navega para a Home screen primeiro
        navigation.navigate('Main', { screen: 'Home' });
        
        // Pequeno delay para garantir que a navegação aconteceu
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Pega a hora atual do dispositivo
        const now = new Date().toISOString();
        
        console.log('Quick Action/Siri Shortcut: Bater ponto com hora atual:', now);
        console.log('Quick Action/Siri Shortcut: Ação determinada pelo último evento:', nextAction);
        
        // Faz o clock usando a hora atual e a ação determinada pelo último evento
        await clock({
          hour: now,
        }, nextAction);
        
        console.log('Quick Action/Siri Shortcut: Ponto batido com sucesso');
      } catch (error) {
        console.error('Erro ao processar quick action clock:', error);
      } finally {
        // Reset após 3 segundos para permitir nova quick action
        setTimeout(() => {
          hasProcessedQuickAction.current = false;
        }, 3000);
      }
    };

    // Listener para quando um shortcut é acionado
    const subscription = QuickActions.addListener(handleQuickAction);

    return () => {
      subscription.remove();
    };
  }, [isAuthenticated, navigation, clock, nextAction]);
}


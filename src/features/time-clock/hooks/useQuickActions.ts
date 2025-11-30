import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as ExpoLinking from 'expo-linking';
import { useNavigation } from '@react-navigation/native';
import { useTimeClock } from './useTimeClock';
import { useLastEvent } from '@/features/home/hooks/useLastEvent';
import { useAuthContext } from '@/features/auth';

/**
 * Hook para processar Quick Actions do iOS
 * Quando uma quick action é acionada, ela dispara um deeplink com a hora atual
 * Esse deeplink é processado e usa a ação determinada pelo último evento (clock-in ou clock-out)
 */
export function useQuickActions() {
  const navigation = useNavigation<any>();
  const { isAuthenticated } = useAuthContext();
  const { clock } = useTimeClock();
  const { nextAction } = useLastEvent();
  const hasProcessedQuickAction = useRef(false);
  const quickActionUrlRef = useRef<string | null>(null);

  useEffect(() => {
    if (Platform.OS !== 'ios' || !isAuthenticated) return;

    const handleQuickActionClock = async (url: string) => {
      if (!url || !url.includes('quick-action=true')) return;
      
      // Evita processar múltiplas vezes
      if (quickActionUrlRef.current === url && hasProcessedQuickAction.current) {
        return;
      }
      
      hasProcessedQuickAction.current = true;
      quickActionUrlRef.current = url;
      
      try {
        // Navega para a Home screen primeiro
        navigation.navigate('Main', { screen: 'Home' });
        
        // Pequeno delay para garantir que a navegação aconteceu
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Extrai a hora do deeplink
        const parsed = ExpoLinking.parse(url);
        const params = parsed.queryParams as { time?: string };
        
        // Usa a hora do deeplink (que já foi definida no plugin nativo com a hora atual)
        // ou usa a hora atual como fallback
        const now = params.time || new Date().toISOString();
        
        console.log('Quick Action: Bater ponto com hora atual:', now);
        console.log('Quick Action: Ação determinada pelo último evento:', nextAction);
        
        // Faz o clock usando a hora atual e a ação determinada pelo último evento
        await clock({
          hour: now,
        }, nextAction);
        
        console.log('Quick Action: Ponto batido com sucesso');
      } catch (error) {
        console.error('Erro ao processar quick action clock:', error);
      } finally {
        // Reset após 3 segundos para permitir nova quick action
        setTimeout(() => {
          hasProcessedQuickAction.current = false;
          quickActionUrlRef.current = null;
        }, 3000);
      }
    };

    // Listener para deeplinks de quick action
    const subscription = ExpoLinking.addEventListener('url', async (event: { url: string }) => {
      if (event.url && event.url.includes('quick-action=true')) {
        await handleQuickActionClock(event.url);
      }
    });

    // Verifica se o app foi aberto via quick action
    ExpoLinking.getInitialURL().then((url) => {
      if (url && url.includes('quick-action=true')) {
        // Delay para garantir que o app está inicializado
        setTimeout(() => {
          handleQuickActionClock(url);
        }, 800);
      }
    });

    return () => {
      if (subscription?.remove) {
        subscription.remove();
      }
    };
  }, [isAuthenticated, navigation, clock, nextAction]);
}


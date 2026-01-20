import { useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react-native';
import { startActivity, stopActivity, updateActivity } from 'expo-live-activity';

export function useLiveActivity() {
  const activityIdRef = useRef<string | null>(null);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check if Live Activities are supported and enabled
  const isSupported = async (): Promise<boolean> => {
    if (Platform.OS !== 'ios') {
      return false;
    }
    
    // Check if functions are available
    if (typeof startActivity !== 'function' || typeof stopActivity !== 'function') {
      console.log('expo-live-activity functions not available');
      return false;
    }
    
    // Live Activities require iOS 16.1+
    return true;
  };

  // Stop the Live Activity (helper function used internally)
  const stopActivityInternal = async (): Promise<boolean> => {
    try {
      const hadActivity = !!activityIdRef.current;
      
      // Clear update interval
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
        updateIntervalRef.current = null;
      }

      if (activityIdRef.current) {
        await stopActivity(activityIdRef.current, {
          title: 'Ponto registrado',
          subtitle: 'Sessão de trabalho finalizada'
        });
        console.log('Live Activity ended:', activityIdRef.current);
        activityIdRef.current = null;
      }
      
      return hadActivity;
    } catch (error) {
      console.error('Error stopping Live Activity:', error);
      return false;
    }
  };

  // Stop the Live Activity (public API)
  const stopWorkSessionActivity = useCallback(async (): Promise<boolean> => {
    return stopActivityInternal();
  }, []);

  // Start a new Live Activity for work session
  const startWorkSessionActivity = useCallback(async (entryTime: Date): Promise<string | null> => {
    try {
      console.log('🚀 Tentando criar Live Activity...');
      
      if (!(await isSupported())) {
        console.log('❌ Live Activities not supported or enabled');
        return null;
      }

      console.log('✅ Live Activities suportado');

      // Stop any existing activity first (using internal helper)
      await stopActivityInternal();
      console.log('🧹 Atividades antigas limpas');

      console.log('📝 Criando nova Live Activity...');
      const activityId = await startActivity({
        title: 'Trabalho em Andamento',
        subtitle: `Entrada: ${entryTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
      });

      if (activityId) {
        activityIdRef.current = activityId;
        console.log('✅ Live Activity criado:', activityId);
        console.log('🔔 BLOQUEIE O IPHONE AGORA!');
        console.log('📱 Versão iOS: Precisa ser 16.2+');
        console.log('⚙️  Verifique: Ajustes → Notificações → Atividades ao Vivo = ATIVADO');

        // Start updating the elapsed time every minute
        startUpdatingElapsedTime(entryTime);
        
        return activityId;
      }

      console.log('❌ startActivity retornou null/undefined');
      return null;
    } catch (error) {
      console.error('❌ Error starting Live Activity:', error);
      return null;
    }
  }, []);

  // Update elapsed time periodically
  const startUpdatingElapsedTime = (entryTime: Date) => {
    // Clear any existing interval
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
    }

    // Update immediately
    updateElapsedTime(entryTime);

    // Then update every minute
    updateIntervalRef.current = setInterval(() => {
      updateElapsedTime(entryTime);
    }, 60000); // Update every 1 minute
  };

  // Calculate and update elapsed time
  const updateElapsedTime = async (entryTime: Date) => {
    if (!activityIdRef.current) {
      console.log('⚠️ Tentou atualizar mas não há activity ID');
      return;
    }

    try {
      const now = new Date();
      const elapsed = now.getTime() - entryTime.getTime();
      
      const hours = Math.floor(elapsed / (1000 * 60 * 60));
      const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
      
      const elapsedTime = `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}min`;

      console.log(`🔄 Atualizando Live Activity ${activityIdRef.current.substring(0, 8)}...`);
      await updateActivity(activityIdRef.current, {
        title: 'Trabalho em Andamento',
        subtitle: `Tempo: ${elapsedTime}`
      });

      console.log('✅ Live Activity atualizado:', elapsedTime);
    } catch (error) {
      console.error('❌ Error updating Live Activity:', error);
      console.error('ID que tentou usar:', activityIdRef.current);
    }
  };


  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, []);

  return {
    startWorkSessionActivity,
    stopWorkSessionActivity,
    isSupported,
  };
}

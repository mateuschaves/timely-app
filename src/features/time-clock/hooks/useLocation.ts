import { useState, useCallback } from 'react';
import { LocationCoordinates } from '@/api/types';
import {
  getCurrentPositionAsync,
  getForegroundPermissionsAsync,
  requestForegroundPermissionsAsync,
  getLastKnownPositionAsync,
  Accuracy,
} from 'expo-location';


export function useLocation() {
  const [location, setLocation] = useState<LocationCoordinates | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const requestLocationPermission = useCallback(async (): Promise<LocationCoordinates | null> => {
    try {
      setIsLoading(true);
      setError(null);

      console.log('Verificando permissão de localização...');
      let { status } = await getForegroundPermissionsAsync();
      console.log('Status da permissão:', status);
      
      if (status !== 'granted') {
        console.log('Solicitando permissão de localização...');
        const { status: newStatus } = await requestForegroundPermissionsAsync();
        status = newStatus;
        console.log('Novo status da permissão:', status);
      }

      if (status !== 'granted') {
        setHasPermission(false);
        setError('Permissão de localização negada. Você pode habilitar nas configurações do dispositivo.');
        console.log('Permissão negada');
        return null;
      }

      setHasPermission(true);
      console.log('Permissão concedida, obtendo localização...');

      // Tentar obter última localização conhecida primeiro (muito mais rápido)
      try {
        const lastLocation = await Promise.race([
          getLastKnownPositionAsync({
            maxAge: 60000, // Aceitar se tiver menos de 1 minuto
            requiredAccuracy: 100, // Aceitar se precisão for até 100 metros
          }),
          new Promise<null>((resolve) => setTimeout(() => resolve(null), 500)), // Timeout de 500ms
        ]);
        
        if (lastLocation && lastLocation.coords) {
          console.log('Usando última localização conhecida (rápido)');
          const locationData: LocationCoordinates = {
            type: 'Point',
            coordinates: [
              lastLocation.coords.longitude,
              lastLocation.coords.latitude,
            ],
          };
          setLocation(locationData);
          return locationData;
        }
      } catch (err) {
        console.log('Não há última localização conhecida, obtendo nova...');
      }

      // Se não houver última localização, obter nova (mais lento)
      // Usar precisão mais baixa para ser mais rápido
      // Accuracy.Lowest (1) = mais rápido, menos preciso
      // Accuracy.Low (2) = rápido, precisão razoável
      // Accuracy.Balanced (6) = mais lento, mais preciso
      const accuracy = Accuracy.Low ?? Accuracy.Lowest ?? 2;
      
      // Criar uma promise de timeout primeiro (reduzido para 3 segundos)
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Timeout ao obter localização'));
        }, 3000); // 3 segundos de timeout (mais agressivo)
      });

      // Promise para obter localização com opções otimizadas
      const locationPromise = getCurrentPositionAsync({
        accuracy,
        mayShowUserSettingsDialog: false,
      });

      // Race entre localização e timeout
      const currentLocation = await Promise.race([locationPromise, timeoutPromise]) as any;
      console.log('Nova localização obtida:', currentLocation?.coords);

      const locationData: LocationCoordinates = {
        type: 'Point',
        coordinates: [
          currentLocation.coords.longitude,
          currentLocation.coords.latitude,
        ],
      };

      setLocation(locationData);
      return locationData;
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao obter localização. Tente novamente.';
      setError(errorMessage);
      console.error('Erro ao obter localização:', err);
      // Não retornar null aqui - permitir que o clock continue sem localização
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const updateLocation = useCallback(async (): Promise<LocationCoordinates | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const { status } = await getForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setError('Permissão de localização não concedida.');
        return null;
      }

      // Usar precisão mais baixa para ser mais rápido
      const accuracy = Accuracy.Low ?? Accuracy.Lowest ?? 2;
      const currentLocation = await getCurrentPositionAsync({
        accuracy,
        mayShowUserSettingsDialog: false,
      });

      const locationData: LocationCoordinates = {
        type: 'Point',
        coordinates: [
          currentLocation.coords.longitude,
          currentLocation.coords.latitude,
        ],
      };

      setLocation(locationData);
      return locationData;
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao atualizar localização. Tente novamente.';
      setError(errorMessage);
      console.error('Erro ao atualizar localização:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    location,
    isLoading,
    error,
    hasPermission,
    requestLocationPermission,
    updateLocation,
  };
}


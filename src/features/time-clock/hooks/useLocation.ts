import { useState, useCallback } from 'react';
import { Platform } from 'react-native';
import { LocationCoordinates } from '@/api/types';

// Import condicional do expo-location para evitar erros se não estiver disponível
let Location: any = null;

// Só tenta carregar o módulo em plataformas nativas (iOS/Android)
if (Platform.OS === 'ios' || Platform.OS === 'android') {
  try {
    const locationModule = require('expo-location');
    // Verifica se o módulo foi carregado corretamente
    if (locationModule && typeof locationModule.getForegroundPermissionsAsync === 'function') {
      Location = locationModule;
    }
  } catch (e: any) {
    // Módulo nativo não disponível - pode precisar de rebuild
    // Não logamos o erro para evitar warnings desnecessários
    Location = null;
  }
}

/**
 * Hook para gerenciar permissões e localização atual
 */
export function useLocation() {
  const [location, setLocation] = useState<LocationCoordinates | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  /**
   * Solicita permissão de localização e obtém a localização atual
   */
  const requestLocationPermission = useCallback(async (): Promise<LocationCoordinates | null> => {
    try {
      setIsLoading(true);
      setError(null);

      // Verifica se expo-location está disponível
      if (!Location) {
        setError('Serviço de localização não disponível nesta plataforma.');
        return null;
      }

      // Verifica se já temos permissão
      let { status } = await Location.getForegroundPermissionsAsync();
      
      // Se não tiver permissão, solicita
      if (status !== 'granted') {
        const { status: newStatus } = await Location.requestForegroundPermissionsAsync();
        status = newStatus;
      }

      if (status !== 'granted') {
        setHasPermission(false);
        setError('Permissão de localização negada. Você pode habilitar nas configurações do dispositivo.');
        return null;
      }

      setHasPermission(true);

      // Obtém a localização atual
      const accuracy = Location.Accuracy?.Balanced ?? 6;
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy,
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
      const errorMessage = err.message || 'Erro ao obter localização. Tente novamente.';
      setError(errorMessage);
      console.error('Erro ao obter localização:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Atualiza a localização atual sem solicitar permissão novamente
   */
  const updateLocation = useCallback(async (): Promise<LocationCoordinates | null> => {
    try {
      setIsLoading(true);
      setError(null);

      // Verifica se expo-location está disponível
      if (!Location) {
        setError('Serviço de localização não disponível nesta plataforma.');
        return null;
      }

      // Verifica se já temos permissão
      const { status } = await Location.getForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setError('Permissão de localização não concedida.');
        return null;
      }

      // Obtém a localização atual
      const accuracy = Location.Accuracy?.Balanced ?? 6;
      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy,
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


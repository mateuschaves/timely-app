import { useState, useCallback } from 'react';
import { Platform } from 'react-native';
import { LocationCoordinates } from '@/api/types';

let Location: any = null;

if (Platform.OS === 'ios' || Platform.OS === 'android') {
  try {
    const locationModule = require('expo-location');
    if (locationModule && typeof locationModule.getForegroundPermissionsAsync === 'function') {
      Location = locationModule;
    }
  } catch (e: any) {
    Location = null;
  }
}

export function useLocation() {
  const [location, setLocation] = useState<LocationCoordinates | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  const requestLocationPermission = useCallback(async (): Promise<LocationCoordinates | null> => {
    try {
      setIsLoading(true);
      setError(null);

      if (!Location) {
        setError('Serviço de localização não disponível nesta plataforma.');
        return null;
      }

      let { status } = await Location.getForegroundPermissionsAsync();
      
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

  const updateLocation = useCallback(async (): Promise<LocationCoordinates | null> => {
    try {
      setIsLoading(true);
      setError(null);

      if (!Location) {
        setError('Serviço de localização não disponível nesta plataforma.');
        return null;
      }

      const { status } = await Location.getForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        setError('Permissão de localização não concedida.');
        return null;
      }

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


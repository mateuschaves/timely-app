import { useState, useCallback } from 'react';
import { LocationCoordinates } from '@/api/types';

export interface AddressSuggestion {
  display_name: string;
  formatted_address: string; // Endereço formatado de forma mais concisa
  lat: string;
  lon: string;
  place_id: number;
  address?: any; // Objeto address completo para referência
}

export interface GeocodingResult {
  address: string;
  coordinates: LocationCoordinates;
}

const NOMINATIM_BASE_URL = 'https://nominatim.openstreetmap.org';

// Função para formatar endereço de forma concisa usando campos específicos
function formatAddressFromDetails(address: any): string {
  const parts: string[] = [];
  
  // Adicionar número e rua
  if (address.house_number) {
    parts.push(address.house_number);
  }
  if (address.road) {
    parts.push(address.road);
  }
  
  // Se não tiver rua, tentar outros campos de localização
  if (!address.road) {
    if (address.pedestrian) parts.push(address.pedestrian);
    else if (address.path) parts.push(address.path);
    else if (address.footway) parts.push(address.footway);
  }
  
  // Adicionar bairro ou subúrbio
  if (address.suburb) {
    parts.push(address.suburb);
  } else if (address.neighbourhood) {
    parts.push(address.neighbourhood);
  } else if (address.city_district) {
    parts.push(address.city_district);
  }
  
  // Adicionar cidade
  if (address.city) {
    parts.push(address.city);
  } else if (address.town) {
    parts.push(address.town);
  } else if (address.village) {
    parts.push(address.village);
  }
  
  // Adicionar estado (opcional, apenas se não for muito longo)
  if (address.state && parts.length < 3) {
    parts.push(address.state);
  }
  
  // Se ainda estiver vazio, usar display_name como fallback
  if (parts.length === 0) {
    return '';
  }
  
  return parts.join(', ');
}

export function useGeocoding() {
  const [isSearching, setIsSearching] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Buscar sugestões de endereço (autocomplete)
  const searchAddresses = useCallback(async (query: string): Promise<AddressSuggestion[]> => {
    if (!query || query.length < 3) {
      return [];
    }

    setIsSearching(true);
    setError(null);

    try {
      const response = await fetch(
        `${NOMINATIM_BASE_URL}/search?` +
        `q=${encodeURIComponent(query)}&` +
        `format=json&` +
        `limit=5&` +
        `addressdetails=1&` +
        `countrycodes=br,us,gb,fr,de&` + // Limitar a países comuns
        `accept-language=pt-BR,en`
      );

      if (!response.ok) {
        throw new Error('Erro ao buscar endereços');
      }

      const data = await response.json();
      return data.map((item: any) => {
        // Montar endereço formatado usando campos específicos do address
        const formattedAddress = formatAddressFromDetails(item.address || {});
        
        return {
          display_name: item.display_name,
          formatted_address: formattedAddress,
          lat: item.lat,
          lon: item.lon,
          place_id: item.place_id,
          address: item.address,
        };
      });
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao buscar endereços. Tente novamente.';
      setError(errorMessage);
      console.error('Erro ao buscar endereços:', err);
      return [];
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Converter coordenadas em endereço (reverse geocoding)
  const reverseGeocode = useCallback(async (
    coordinates: LocationCoordinates
  ): Promise<string | null> => {
    setIsGeocoding(true);
    setError(null);

    try {
      const [longitude, latitude] = coordinates.coordinates;
      const response = await fetch(
        `${NOMINATIM_BASE_URL}/reverse?` +
        `lat=${latitude}&` +
        `lon=${longitude}&` +
        `format=json&` +
        `addressdetails=1&` +
        `accept-language=pt-BR,en`
      );

      if (!response.ok) {
        throw new Error('Erro ao obter endereço');
      }

      const data = await response.json();
      // Usar endereço formatado se disponível, senão usar display_name
      if (data.address) {
        const formatted = formatAddressFromDetails(data.address);
        return formatted || data.display_name || null;
      }
      return data.display_name || null;
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao obter endereço. Tente novamente.';
      setError(errorMessage);
      console.error('Erro ao fazer reverse geocoding:', err);
      return null;
    } finally {
      setIsGeocoding(false);
    }
  }, []);

  // Converter endereço em coordenadas (forward geocoding)
  const geocodeAddress = useCallback(async (address: string): Promise<GeocodingResult | null> => {
    setIsGeocoding(true);
    setError(null);

    try {
      const response = await fetch(
        `${NOMINATIM_BASE_URL}/search?` +
        `q=${encodeURIComponent(address)}&` +
        `format=json&` +
        `limit=1&` +
        `addressdetails=1`
      );

      if (!response.ok) {
        throw new Error('Erro ao converter endereço');
      }

      const data = await response.json();
      if (data.length === 0) {
        return null;
      }

      const result = data[0];
      return {
        address: result.display_name,
        coordinates: {
          type: 'Point',
          coordinates: [parseFloat(result.lon), parseFloat(result.lat)],
        },
      };
    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao converter endereço. Tente novamente.';
      setError(errorMessage);
      console.error('Erro ao fazer geocoding:', err);
      return null;
    } finally {
      setIsGeocoding(false);
    }
  }, []);

  return {
    searchAddresses,
    reverseGeocode,
    geocodeAddress,
    isSearching,
    isGeocoding,
    error,
  };
}

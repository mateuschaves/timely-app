import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as Linking from 'expo-linking';
import { TimeClockDeeplinkParams } from '../types';
import { getTimeClockEntries } from '@/api/get-time-clock-entries';
import { clockIn, ClockInRequest } from '@/api/clock-in';
import { clockOut, ClockOutRequest } from '@/api/clock-out';
import { useLocation } from './useLocation';

export function useTimeClock() {
  const queryClient = useQueryClient();
  const { location, updateLocation } = useLocation();

  // Query para buscar registros de ponto
  const { data: entries, isLoading } = useQuery({
    queryKey: ['timeClockEntries'],
    queryFn: async () => {
      try {
        return await getTimeClockEntries();
      } catch (error) {
        // Retorna array vazio enquanto a API não está disponível
        console.warn('API não disponível, retornando dados vazios:', error);
        return [];
      }
    },
    enabled: false, // Desabilitado até a API estar pronta
  });

  // Mutation para registrar entrada
  const clockInMutation = useMutation({
    mutationFn: clockIn,
    onSuccess: () => {
      // Invalida a query para refetch dos dados
      queryClient.invalidateQueries({ queryKey: ['timeClockEntries'] });
    },
  });

  // Mutation para registrar saída
  const clockOutMutation = useMutation({
    mutationFn: clockOut,
    onSuccess: () => {
      // Invalida a query para refetch dos dados
      queryClient.invalidateQueries({ queryKey: ['timeClockEntries'] });
    },
  });

  // Função para processar deeplink
  const handleDeeplink = (url: string) => {
    try {
      const parsed = Linking.parse(url);
      const params = parsed.queryParams as TimeClockDeeplinkParams;

      if (params.hour) {
        // Converte o tipo do deeplink para o formato da API
        const action = params.type === 'exit' ? 'clock-out' : 'clock-in';
        const hour = params.hour;

        const requestData: ClockInRequest | ClockOutRequest = {
          action: action as 'clock-in' | 'clock-out',
          hour,
          ...(params.location && { location: params.location }),
          ...(params.photoUrl && { photoUrl: params.photoUrl }),
          ...(params.notes && { notes: params.notes }),
        };

        if (action === 'clock-in') {
          clockInMutation.mutate(requestData as ClockInRequest);
        } else {
          clockOutMutation.mutate(requestData as ClockOutRequest);
        }
      }
    } catch (error) {
      console.error('Erro ao processar deeplink:', error);
    }
  };

  // Função auxiliar para obter localização atual antes de registrar ponto
  const getCurrentLocation = async () => {
    // Tenta atualizar a localização primeiro
    const currentLocation = await updateLocation();
    // Se não conseguir atualizar, usa a última localização conhecida
    return currentLocation || location;
  };

  return {
    entries: entries || [],
    isLoading,
    clockIn: async (data: Omit<ClockInRequest, 'action'>) => {
      // Obtém localização atual antes de registrar
      const currentLocation = await getCurrentLocation();
      
      clockInMutation.mutate({
        ...data,
        action: 'clock-in',
        ...(currentLocation && { location: currentLocation }),
      });
    },
    clockOut: async (data: Omit<ClockOutRequest, 'action'>) => {
      // Obtém localização atual antes de registrar
      const currentLocation = await getCurrentLocation();
      
      clockOutMutation.mutate({
        ...data,
        action: 'clock-out',
        ...(currentLocation && { location: currentLocation }),
      });
    },
    handleDeeplink,
    isClocking: clockInMutation.isPending || clockOutMutation.isPending,
  };
}


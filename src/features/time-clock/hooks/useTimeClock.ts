import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as Linking from 'expo-linking';
import { TimeClockDeeplinkParams } from '../types';
import { getTimeClockEntries } from '@/api/get-time-clock-entries';
import { clockIn, ClockInRequest } from '@/api/clock-in';
import { clockOut, ClockOutRequest } from '@/api/clock-out';
import { clock as clockApi, ClockRequest } from '@/api/clock';
import { useLocation } from './useLocation';

export function useTimeClock() {
  const queryClient = useQueryClient();
  const { location, updateLocation } = useLocation();

  const { data: entries, isLoading } = useQuery({
    queryKey: ['timeClockEntries'],
    queryFn: async () => {
      try {
        return await getTimeClockEntries();
      } catch (error) {
        console.warn('API não disponível, retornando dados vazios:', error);
        return [];
      }
    },
    enabled: false,
  });

  const clockInMutation = useMutation({
    mutationFn: clockIn,
    onSuccess: async () => {
      // Invalidar todas as queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['timeClockEntries'] });
      queryClient.invalidateQueries({ queryKey: ['clockHistory'] });
      queryClient.invalidateQueries({ queryKey: ['lastEvent'] });
      // Refazer queries ativas imediatamente
      await queryClient.refetchQueries({ queryKey: ['lastEvent'] });
      await queryClient.refetchQueries({ queryKey: ['clockHistory'] });
    },
  });

  const clockOutMutation = useMutation({
    mutationFn: clockOut,
    onSuccess: async () => {
      // Invalidar todas as queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['timeClockEntries'] });
      queryClient.invalidateQueries({ queryKey: ['clockHistory'] });
      queryClient.invalidateQueries({ queryKey: ['lastEvent'] });
      // Refazer queries ativas imediatamente
      await queryClient.refetchQueries({ queryKey: ['lastEvent'] });
      await queryClient.refetchQueries({ queryKey: ['clockHistory'] });
    },
  });

  const handleDeeplink = async (url: string, onSuccess?: () => void, nextAction?: 'clock-in' | 'clock-out') => {
    try {
      const parsed = Linking.parse(url);
      const params = parsed.queryParams as TimeClockDeeplinkParams;

      // Usa 'time' como parâmetro principal, com fallback para 'hour' (compatibilidade)
      // Se não tiver time nem hour, usa o horário atual do dispositivo
      let timeParam = params.time || params.hour;
      
      if (!timeParam) {
        // Se não tiver parâmetro time, usa o horário atual do dispositivo
        timeParam = new Date().toISOString();
        console.log('Deeplink sem parâmetro time, usando horário atual do dispositivo:', timeParam);
      }

      // Determina a ação: se tiver type no deeplink, usa; senão usa nextAction passado; senão usa clock-in como padrão
      let action: 'clock-in' | 'clock-out';
      if (params.type === 'exit') {
        action = 'clock-out';
      } else if (params.type === 'entry') {
        action = 'clock-in';
      } else if (nextAction) {
        action = nextAction;
      } else {
        // Se não tiver type nem nextAction, usa clock-in como padrão
        action = 'clock-in';
      }

      // Prepara os dados da requisição
      const requestData = {
        hour: timeParam,
        ...(params.location && { location: params.location }),
        ...(params.photoUrl && { photoUrl: params.photoUrl }),
        ...(params.notes && { notes: params.notes }),
      };

      // Usa a função clock com a ação determinada
      // As funções clockInFn e clockOutFn já gerenciam a localização automaticamente
      await clock(requestData as ClockRequest, action);

      // Chama callback de sucesso se fornecido
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error('Erro ao processar deeplink:', error);
    }
  };

  const getCurrentLocation = async () => {
    const currentLocation = await updateLocation();
    return currentLocation || location;
  };

  const clockInFn = async (data: ClockInRequest) => {
    const currentLocation = await getCurrentLocation();
    
    return clockInMutation.mutateAsync({
      ...data,
      ...(currentLocation && { location: currentLocation }),
    });
  };

  const clockOutFn = async (data: ClockOutRequest) => {
    const currentLocation = await getCurrentLocation();
    
    return clockOutMutation.mutateAsync({
      ...data,
      ...(currentLocation && { location: currentLocation }),
    });
  };

  const clockMutation = useMutation({
    mutationFn: clockApi,
    onSuccess: async () => {
      // Invalidar todas as queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['timeClockEntries'] });
      queryClient.invalidateQueries({ queryKey: ['clockHistory'] });
      queryClient.invalidateQueries({ queryKey: ['lastEvent'] });
      // Refazer queries ativas imediatamente
      await queryClient.refetchQueries({ queryKey: ['lastEvent'] });
      await queryClient.refetchQueries({ queryKey: ['clockHistory'] });
    },
  });

  const clock = async (data: ClockRequest, action?: 'clock-in' | 'clock-out') => {
    // Se não tiver ação especificada, usa clock-in como padrão
    if (action === 'clock-out') {
      return clockOutFn(data as ClockOutRequest);
    } else {
      return clockInFn(data as ClockInRequest);
    }
  };

  return {
    entries: entries || [],
    isLoading,
    clock,
    clockIn: clockInFn,
    clockOut: clockOutFn,
    handleDeeplink,
    isClocking: clockInMutation.isPending || clockOutMutation.isPending || clockMutation.isPending,
  };
}


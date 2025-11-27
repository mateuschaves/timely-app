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
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeClockEntries'] });
    },
  });

  const clockOutMutation = useMutation({
    mutationFn: clockOut,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeClockEntries'] });
    },
  });

  const handleDeeplink = (url: string) => {
    try {
      const parsed = Linking.parse(url);
      const params = parsed.queryParams as TimeClockDeeplinkParams;

      if (params.hour) {
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

  const getCurrentLocation = async () => {
    const currentLocation = await updateLocation();
    return currentLocation || location;
  };

  return {
    entries: entries || [],
    isLoading,
    clockIn: async (data: Omit<ClockInRequest, 'action'>) => {
      const currentLocation = await getCurrentLocation();
      
      clockInMutation.mutate({
        ...data,
        action: 'clock-in',
        ...(currentLocation && { location: currentLocation }),
      });
    },
    clockOut: async (data: Omit<ClockOutRequest, 'action'>) => {
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


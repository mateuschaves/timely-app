import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as Linking from 'expo-linking';
import { TimeClockDeeplinkParams } from '../types';
import { getTimeClockEntries } from '@/api/get-time-clock-entries';
import { clock, ClockRequest } from '@/api/clock';
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

  const clockMutation = useMutation({
    mutationFn: clock,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timeClockEntries'] });
      queryClient.invalidateQueries({ queryKey: ['clockHistory'] });
      queryClient.invalidateQueries({ queryKey: ['lastEvent'] });
    },
  });

  const handleDeeplink = (url: string) => {
    try {
      const parsed = Linking.parse(url);
      const params = parsed.queryParams as TimeClockDeeplinkParams;

      if (params.hour) {
        const requestData: ClockRequest = {
          hour: params.hour,
          ...(params.location && { location: params.location }),
          ...(params.photoUrl && { photoUrl: params.photoUrl }),
          ...(params.notes && { notes: params.notes }),
        };

        clockMutation.mutate(requestData);
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
    clock: async (data: ClockRequest) => {
      let locationToUse = data.location;
      
      if (!locationToUse) {
        const currentLocation = await getCurrentLocation();
        locationToUse = currentLocation || undefined;
      }
      
      clockMutation.mutate({
        ...data,
        ...(locationToUse && { location: locationToUse }),
      });
    },
    handleDeeplink,
    isClocking: clockMutation.isPending,
  };
}


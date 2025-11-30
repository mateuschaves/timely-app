import { useQuery } from '@tanstack/react-query';
import { getUserSettings } from '@/api/get-user-settings';

/**
 * Hook para verificar se o usuário tem hourlyRate configurado
 * @returns boolean - true se tiver hourlyRate configurado, false caso contrário
 */
export function useHourlyRate() {
  const { data: settings, isLoading, error, isError } = useQuery({
    queryKey: ['userSettings'],
    queryFn: getUserSettings,
    retry: 1,
    retryDelay: 1000,
    refetchOnWindowFocus: true,
  });

  const hasHourlyRate = settings?.hourlyRate !== undefined && settings?.hourlyRate !== null && settings.hourlyRate > 0;

  const canShowCard = !isLoading && !isError && settings !== undefined;

  return {
    hasHourlyRate,
    isLoading,
    isError,
    error,
    settings,
    canShowCard,
  };
}


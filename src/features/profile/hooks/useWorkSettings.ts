import { useQuery } from '@tanstack/react-query';
import { getUserSettings } from '@/api/get-user-settings';

/**
 * Hook para verificar se o usuário tem work settings configurado
 * @returns boolean - true se tiver pelo menos um dia configurado, false caso contrário
 */
export function useWorkSettings() {
  const { data: settings, isLoading, error, isError } = useQuery({
    queryKey: ['userSettings'],
    queryFn: getUserSettings,
    retry: 1,
    retryDelay: 1000,
  });

  const hasWorkSettings = settings?.workSchedule 
    ? Object.values(settings.workSchedule).some(Boolean)
    : false;

  const canShowCard = !isLoading && !isError && settings !== undefined;

  return {
    hasWorkSettings,
    isLoading,
    isError,
    error,
    settings,
    canShowCard
  };
}


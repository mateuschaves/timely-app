import { useQuery } from '@tanstack/react-query';
import { getClockHistory, GetClockHistoryParams, ClockHistoryDay, ClockHistorySummary, CLOCK_HISTORY_STALE_TIME } from '@/api/get-clock-history';

export function useHistory(params: GetClockHistoryParams) {
  const { data, isLoading, error, refetch, isRefetching } = useQuery({
    queryKey: ['clockHistory', params],
    queryFn: () => getClockHistory(params),
    staleTime: CLOCK_HISTORY_STALE_TIME,
  });

  return {
    days: (data?.data || []) as ClockHistoryDay[],
    summary: data?.summary as ClockHistorySummary | undefined,
    isLoading,
    error,
    refetch,
    isRefetching,
  };
}


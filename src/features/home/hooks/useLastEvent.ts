import { useQuery } from '@tanstack/react-query';
import { startOfMonth, endOfMonth } from 'date-fns';
import { getClockHistory, ClockHistoryEvent, CLOCK_HISTORY_STALE_TIME } from '@/api/get-clock-history';
import { ClockAction } from '@/api/types';

const getLastMonthRange = () => {
  const today = new Date();
  const start = startOfMonth(today);
  const end = endOfMonth(today);
  
  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
  };
};

export function useLastEvent() {
  const { startDate, endDate } = getLastMonthRange();
  
  const { data, isLoading } = useQuery({
    queryKey: ['lastEvent', startDate, endDate],
    queryFn: () => getClockHistory({ startDate, endDate }),
    staleTime: CLOCK_HISTORY_STALE_TIME,
    refetchOnWindowFocus: true,
  });

  const getLastEvent = (): ClockHistoryEvent | null => {
    if (!data?.data || data.data.length === 0) return null;
    
    const allEvents: ClockHistoryEvent[] = [];
    data.data.forEach(day => {
      if (day.events && day.events.length > 0) {
        allEvents.push(...day.events);
      }
    });
    
    if (allEvents.length === 0) return null;
    
    const sortedEvents = [...allEvents].sort((a, b) => 
      new Date(b.hour).getTime() - new Date(a.hour).getTime()
    );
    
    return sortedEvents[0] || null;
  };

  const lastEvent = getLastEvent();
  const nextAction = lastEvent?.action === ClockAction.CLOCK_IN 
    ? ClockAction.CLOCK_OUT 
    : ClockAction.CLOCK_IN;

  return {
    lastEvent,
    nextAction,
    isLoading,
  };
}


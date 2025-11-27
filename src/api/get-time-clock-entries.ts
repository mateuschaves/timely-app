import { apiClient } from '@/config/api';
import { TimeClockEntry } from '@/features/time-clock/types';

export type GetTimeClockEntriesResponse = TimeClockEntry[];
export const getTimeClockEntries = async (): Promise<GetTimeClockEntriesResponse> => {
  const response = await apiClient.get<GetTimeClockEntriesResponse>(
    '/time-clock'
  );
  return response.data;
};


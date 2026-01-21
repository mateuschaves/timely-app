import { apiClient } from '@/config/api';
import { TimeClockEntry } from '@/features/time-clock/types';
import { LocationCoordinates } from './types';

export interface ClockInDraftRequest {
  hour: string;
  location?: LocationCoordinates;
}

export interface ClockInDraftResponse extends TimeClockEntry {
  isDraft?: boolean;
}

export const clockInDraft = async (
  data: ClockInDraftRequest
): Promise<ClockInDraftResponse> => {
  const response = await apiClient.post<ClockInDraftResponse>(
    '/clockin/draft',
    data
  );
  return response.data;
};

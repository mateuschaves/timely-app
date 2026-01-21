import { apiClient } from '@/config/api';
import { TimeClockEntry } from '@/features/time-clock/types';
import { LocationCoordinates } from './types';

export interface ClockOutDraftRequest {
  hour: string;
  location?: LocationCoordinates;
}

export interface ClockOutDraftResponse extends TimeClockEntry {
  isDraft?: boolean;
}

export const clockOutDraft = async (
  data: ClockOutDraftRequest
): Promise<ClockOutDraftResponse> => {
  const response = await apiClient.post<ClockOutDraftResponse>(
    '/clockin/draft',
    data
  );
  return response.data;
};

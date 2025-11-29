import { apiClient } from '@/config/api';
import { TimeClockEntry } from '@/features/time-clock/types';
import { LocationCoordinates } from './types';

export interface ClockInRequest {
  hour: string;
  location?: LocationCoordinates;
  photoUrl?: string;
  notes?: string;
}

export interface ClockInResponse extends TimeClockEntry {}
export const clockIn = async (
  data: ClockInRequest
): Promise<ClockInResponse> => {
  const response = await apiClient.post<ClockInResponse>(
    '/clockin',
    data
  );
  return response.data;
};

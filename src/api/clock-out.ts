import { apiClient } from '@/config/api';
import { TimeClockEntry } from '@/features/time-clock/types';
import { LocationCoordinates, ClockAction } from './types';

export interface ClockOutRequest {
  hour: string;
  location?: LocationCoordinates;
  photoUrl?: string;
  notes?: string;
}

export interface ClockOutResponse extends TimeClockEntry {}
export const clockOut = async (
  data: ClockOutRequest
): Promise<ClockOutResponse> => {
  const response = await apiClient.post<ClockOutResponse>(
    '/clockin',
    data
  );
  return response.data;
};


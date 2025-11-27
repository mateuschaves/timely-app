import { apiClient } from '@/config/api';
import { TimeClockEntry } from '@/features/time-clock/types';
import { LocationCoordinates } from './types';

export interface ClockRequest {
  hour: string;
  location?: LocationCoordinates;
  photoUrl?: string;
  notes?: string;
}

export interface ClockResponse extends TimeClockEntry {}

export const clock = async (data: ClockRequest): Promise<ClockResponse> => {
  const response = await apiClient.post<ClockResponse>('/clockin', data);
  return response.data;
};


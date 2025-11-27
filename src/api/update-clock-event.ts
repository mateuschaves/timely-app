import { apiClient } from '@/config/api';
import { ClockHistoryEvent } from './get-clock-history';

export interface UpdateClockEventRequest {
  hour: string;
  notes?: string;
}

export interface UpdateClockEventResponse extends ClockHistoryEvent {}

export const updateClockEvent = async (
  eventId: string,
  data: UpdateClockEventRequest
): Promise<UpdateClockEventResponse> => {
  const response = await apiClient.put<UpdateClockEventResponse>(
    `/clockin/${eventId}`,
    data
  );
  return response.data;
};


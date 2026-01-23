import { apiClient } from '@/config/api';

export interface ConfirmClockEventResponse {
  id: string;
  userId: string;
  hour: string;
  action: string;
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
  photoUrl?: string | null;
  notes?: string | null;
  isDraft?: boolean;
  createdAt: string;
  updatedAt: string;
}

export const confirmClockEvent = async (
  eventId: string
): Promise<ConfirmClockEventResponse> => {
  const response = await apiClient.post<ConfirmClockEventResponse>(
    `/clockin/${eventId}/confirm`,
    {}
  );
  return response.data;
};

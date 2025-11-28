import { apiClient } from '@/config/api';

export interface UpdateClockEventRequest {
  hour: string;
  photoUrl?: string;
  notes?: string;
}

export interface UpdateClockEventResponse {
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
  createdAt: string;
  updatedAt: string;
}

export const updateClockEvent = async (
  eventId: string,
  data: UpdateClockEventRequest
): Promise<UpdateClockEventResponse> => {
  const response = await apiClient.put<UpdateClockEventResponse>(`/clockin/${eventId}`, data);
  return response.data;
};


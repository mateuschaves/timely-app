import { apiClient } from '@/config/api';

export const deleteClockEvent = async (eventId: string): Promise<void> => {
  await apiClient.delete(`/clockin/${eventId}`);
};


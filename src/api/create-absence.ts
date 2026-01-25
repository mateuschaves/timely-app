import { apiClient } from '@/config/api';

export interface CreateAbsenceRequest {
  date: string;
  reason: string;
  description?: string;
}

export interface CreateAbsenceResponse {
  id: string;
  userId: string;
  date: string;
  reason: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export const createAbsence = async (
  data: CreateAbsenceRequest
): Promise<CreateAbsenceResponse> => {
  const response = await apiClient.post<CreateAbsenceResponse>(
    '/absences',
    data
  );
  return response.data;
};

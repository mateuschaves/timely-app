import { apiClient } from '@/config/api';

export interface GetAbsencesParams {
  startDate: string;
  endDate: string;
}

export interface AbsenceEntry {
  id: string;
  userId: string;
  date: string;
  reason: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AbsenceDay {
  date: string;
  absences: AbsenceEntry[];
}

export interface GetAbsencesResponse {
  data: AbsenceDay[];
}

export const getAbsences = async (
  params: GetAbsencesParams
): Promise<GetAbsencesResponse> => {
  const { startDate, endDate } = params;
  
  const response = await apiClient.get<GetAbsencesResponse>(
    '/absences',
    {
      params: {
        startDate,
        endDate,
      },
    }
  );
  
  return response.data;
};

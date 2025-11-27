import { apiClient } from '@/config/api';
import { WorkSchedule, CustomHoliday, WorkLocation } from './update-user-settings';

export interface GetUserSettingsResponse {
  id: string;
  workSchedule: WorkSchedule;
  customHolidays: CustomHoliday[];
  workLocation?: WorkLocation;
}

export const getUserSettings = async (): Promise<GetUserSettingsResponse> => {
  const response = await apiClient.get<GetUserSettingsResponse>('/users/settings');
  return response.data;
};


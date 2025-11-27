import { apiClient } from '@/config/api';
import type { WorkSchedule, CustomHoliday, WorkLocation } from './update-user-settings';

export interface UserSettingsResponse {
  id: string;
  workSchedule?: WorkSchedule;
  customHolidays?: CustomHoliday[];
  workLocation?: WorkLocation;
}

export const getUserSettings = async (): Promise<UserSettingsResponse> => {
  const response = await apiClient.get<UserSettingsResponse>('/users/settings');
  return response.data;
};

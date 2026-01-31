import { apiClient } from '@/config/api';
import type { WorkSchedule, CustomHoliday, WorkLocation, HourMultipliers } from './update-user-settings';

export interface UserSettingsResponse {
  userId?: string;
  id?: string;
  workSchedule?: WorkSchedule;
  customHolidays?: CustomHoliday[];
  workLocation?: WorkLocation;
  hourlyRate?: number;
  lunchBreakMinutes?: number;
  hourMultipliers?: HourMultipliers;
  timeFormat12h?: boolean;
  autoDetectArrival?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export const getUserSettings = async (): Promise<UserSettingsResponse> => {
  const response = await apiClient.get<UserSettingsResponse>('/users/settings');
  return response.data;
};

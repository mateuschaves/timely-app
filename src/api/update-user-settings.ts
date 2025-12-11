import { apiClient } from '@/config/api';

export interface WorkScheduleDay {
  start: string;
  end: string;
}

export interface WorkSchedule {
  monday?: WorkScheduleDay;
  tuesday?: WorkScheduleDay;
  wednesday?: WorkScheduleDay;
  thursday?: WorkScheduleDay;
  friday?: WorkScheduleDay;
  saturday?: WorkScheduleDay;
  sunday?: WorkScheduleDay;
}

export interface CustomHoliday {
  date: string;
  name: string;
}

export interface WorkLocation {
  type: 'Point';
  coordinates: [number, number];
}

export interface HourMultipliers {
  night?: number;
  weekend?: number;
  holiday?: number;
}

export interface UpdateUserSettingsRequest {
  workSchedule?: WorkSchedule;
  customHolidays?: CustomHoliday[];
  workLocation?: WorkLocation;
  hourlyRate?: number;
  lunchBreakMinutes?: number;
  hourMultipliers?: HourMultipliers;
}

export interface UpdateUserSettingsResponse {
  id: string;
  workSchedule: WorkSchedule;
  customHolidays: CustomHoliday[];
  workLocation: WorkLocation;
  hourlyRate?: number;
  lunchBreakMinutes?: number;
  hourMultipliers?: HourMultipliers;
}

export const updateUserSettings = async (
  data: UpdateUserSettingsRequest
): Promise<UpdateUserSettingsResponse> => {
  const response = await apiClient.put<UpdateUserSettingsResponse>('/users/settings', data);
  return response.data;
};


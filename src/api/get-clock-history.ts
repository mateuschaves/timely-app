import { apiClient } from '@/config/api';
import { ClockAction } from './types';

export const CLOCK_HISTORY_STALE_TIME = 30000;

export interface GetClockHistoryParams {
  startDate: string;
  endDate: string;
}

export interface ClockHistoryEvent {
  id: string;
  userId: string;
  hour: string;
  action: ClockAction;
  workedTime?: string;
  location?: {
    type: 'Point';
    coordinates: [number, number];
  };
  photoUrl?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClockHistoryDay {
  date: string;
  totalHours: number;
  totalWorkedTime: string;
  expectedHours?: number;
  expectedHoursFormatted?: string;
  hoursDifference?: number;
  hoursDifferenceFormatted?: string;
  status?: 'over' | 'under' | 'exact';
  events: ClockHistoryEvent[];
}

export interface ClockHistorySummary {
  totalWorkedHours: number;
  totalWorkedHoursFormatted: string;
  totalExpectedHours: number;
  totalExpectedHoursFormatted: string;
  hoursDifference: number;
  hoursDifferenceFormatted: string;
  status: 'over' | 'under' | 'exact';
  daysWorked: number;
  daysWithSchedule: number;
  averageHoursPerDay: number;
  averageHoursPerDayFormatted: string;
  totalDays: number;
}

export interface GetClockHistoryResponse {
  data: ClockHistoryDay[];
  summary: ClockHistorySummary;
}

export const getClockHistory = async (
  params: GetClockHistoryParams
): Promise<GetClockHistoryResponse> => {
  const { startDate, endDate } = params;
  
  const response = await apiClient.get<GetClockHistoryResponse>(
    '/clockin/history',
    {
      params: {
        startDate,
        endDate,
      },
    }
  );
  
  return response.data;
};


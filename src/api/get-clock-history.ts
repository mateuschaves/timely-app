import { apiClient } from '@/config/api';
import { ClockAction } from './types';

export const CLOCK_HISTORY_STALE_TIME = 30000;

export interface GetClockHistoryParams {
  startDate: string;
  endDate: string;
  timezone?: string;
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
  isHoliday?: boolean;
  isDraft?: boolean;
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

export interface ClockHistoryMonthSummary {
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
  totalEarnings?: number;
}

export interface GetClockHistoryResponse {
  data: ClockHistoryDay[];
  summary: ClockHistoryMonthSummary;
}

export const getClockHistory = async (
  params: GetClockHistoryParams
): Promise<GetClockHistoryResponse> => {
  const { startDate, endDate, timezone } = params;
  
  const response = await apiClient.get<any>(
    '/clockin/history',
    {
      params: {
        startDate,
        endDate,
        ...(timezone && { timezone }),
      },
    }
  );
  
  // Debug: verificar estrutura da resposta
  if (__DEV__) {
    console.log('getClockHistory - response.data:', JSON.stringify(response.data, null, 2));
  }
  
  // A resposta pode ter diferentes estruturas:
  // 1. { status, url, data: { data: [...], summary: {...} } }
  // 2. { data: [...], summary: {...} }
  // Vamos verificar qual estrutura está vindo
  if (response.data?.data && Array.isArray(response.data.data) && response.data.summary) {
    // Estrutura: { data: [...], summary: {...} }
    return response.data as GetClockHistoryResponse;
  } else if (response.data?.data?.data && Array.isArray(response.data.data.data) && response.data.data.summary) {
    // Estrutura: { status, url, data: { data: [...], summary: {...} } }
    return response.data.data as GetClockHistoryResponse;
  }
  
  // Fallback: retornar response.data diretamente
  return response.data as GetClockHistoryResponse;
};


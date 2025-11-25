/**
 * API - Registrar Entrada (Clock In)
 * 
 * POST /clockin
 */

import { apiClient } from '@/config/api';
import { TimeClockEntry } from '@/features/time-clock/types';
import { LocationCoordinates } from './types';

// ==================== Types ====================

/**
 * Request para registrar entrada
 */
export interface ClockInRequest {
  action: 'clock-in';
  hour: string; // ISO 8601 format
  location?: LocationCoordinates;
  photoUrl?: string;
  notes?: string;
}

/**
 * Response ao registrar entrada
 */
export interface ClockInResponse extends TimeClockEntry {}

// ==================== API Functions ====================

/**
 * Registra uma entrada de ponto
 * POST /clockin
 */
export const clockIn = async (
  data: ClockInRequest
): Promise<ClockInResponse> => {
  const response = await apiClient.post<ClockInResponse>(
    '/clockin',
    data
  );
  return response.data;
};

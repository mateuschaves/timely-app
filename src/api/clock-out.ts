/**
 * API - Registrar Saída (Clock Out)
 * 
 * POST /clockin
 */

import { apiClient } from '@/config/api';
import { TimeClockEntry } from '@/features/time-clock/types';
import { LocationCoordinates } from './types';

// ==================== Types ====================

/**
 * Request para registrar saída
 */
export interface ClockOutRequest {
  action: 'clock-out';
  hour: string; // ISO 8601 format
  location?: LocationCoordinates;
  photoUrl?: string;
  notes?: string;
}

/**
 * Response ao registrar saída
 */
export interface ClockOutResponse extends TimeClockEntry {}

// ==================== API Functions ====================

/**
 * Registra uma saída de ponto
 * POST /clockin
 */
export const clockOut = async (
  data: ClockOutRequest
): Promise<ClockOutResponse> => {
  const response = await apiClient.post<ClockOutResponse>(
    '/clockin',
    data
  );
  return response.data;
};


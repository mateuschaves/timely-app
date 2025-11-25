/**
 * API - Buscar Registros de Ponto
 * 
 * GET /time-clock
 */

import { apiClient } from '@/config/api';
import { TimeClockEntry } from '@/features/time-clock/types';

// ==================== Types ====================

/**
 * Response ao buscar registros
 */
export type GetTimeClockEntriesResponse = TimeClockEntry[];

// ==================== API Functions ====================

/**
 * Busca todos os registros de ponto
 * GET /time-clock
 */
export const getTimeClockEntries = async (): Promise<GetTimeClockEntriesResponse> => {
  const response = await apiClient.get<GetTimeClockEntriesResponse>(
    '/time-clock'
  );
  return response.data;
};


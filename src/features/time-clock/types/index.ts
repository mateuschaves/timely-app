export interface TimeClockEntry {
  id: string;
  time: string;
  date: string;
  type: 'entry' | 'exit';
  createdAt: string;
}

/**
 * Parâmetros recebidos via deeplink para registrar ponto
 */
export interface TimeClockDeeplinkParams {
  time?: string; // ISO 8601 format - parâmetro do deeplink
  hour?: string; // ISO 8601 format - mantido para compatibilidade
  type?: 'entry' | 'exit'; // 'entry' para clock-in, 'exit' para clock-out
  location?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  photoUrl?: string;
  notes?: string;
}


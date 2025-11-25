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
  hour?: string; // ISO 8601 format
  type?: 'entry' | 'exit'; // 'entry' para clock-in, 'exit' para clock-out
  location?: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  photoUrl?: string;
  notes?: string;
}


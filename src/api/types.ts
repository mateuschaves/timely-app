/**
 * Tipos compartilhados entre diferentes chamadas de API
 */

/**
 * Coordenadas de localização (formato GeoJSON Point)
 */
export interface LocationCoordinates {
  type: 'Point';
  coordinates: [number, number]; // [longitude, latitude]
}


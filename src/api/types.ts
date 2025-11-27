export enum ClockAction {
  CLOCK_IN = 'clock-in',
  CLOCK_OUT = 'clock-out',
}

export interface LocationCoordinates {
  type: 'Point';
  coordinates: [number, number];
}


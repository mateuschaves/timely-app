export enum ClockAction {
  CLOCK_IN = 'clock-in',
  CLOCK_OUT = 'clock-out',
}

export enum ClockActionLabel {
  CLOCKIN = 'clockin',
  CLOCKOUT = 'clockout',
}

export interface LocationCoordinates {
  type: 'Point';
  coordinates: [number, number];
}


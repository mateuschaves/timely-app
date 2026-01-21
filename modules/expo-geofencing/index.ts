export {
  default as ExpoGeofencing,
  addGeofenceEnterListener,
  addGeofenceExitListener,
  addGeofenceErrorListener,
} from './src/ExpoGeofencingModule';

export type {
  GeofenceEvent,
  GeofenceErrorEvent,
  GeofencePermissionResult,
} from './src/ExpoGeofencingModule';

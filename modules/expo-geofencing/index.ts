// Export the default module instance
export { default } from './src/ExpoGeofencingModule';

// Export named functions for event listeners
export {
  addGeofenceEnterListener,
  addGeofenceExitListener,
  addGeofenceErrorListener,
} from './src/ExpoGeofencingModule';

// Export types
export type {
  GeofenceEvent,
  GeofenceErrorEvent,
  GeofencePermissionResult,
} from './src/ExpoGeofencingModule';

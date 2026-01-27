import { EventEmitter, NativeModule, requireNativeModule } from 'expo-modules-core';

export interface GeofenceEvent {
  identifier: string;
  latitude: number;
  longitude: number;
  radius: number;
  timestamp: number;
}

export interface GeofenceErrorEvent {
  identifier: string;
  error: string;
}

export interface GeofencePermissionResult {
  status: 'granted' | 'denied' | 'restricted' | 'notDetermined' | 'whenInUse' | 'unknown';
}

class ExpoGeofencingModule extends NativeModule {
  /**
   * Start monitoring a geofence region
   * @param identifier Unique identifier for the region
   * @param latitude Latitude of the region center
   * @param longitude Longitude of the region center
   * @param radius Radius in meters (max 100-200m recommended for accuracy)
   * @returns true if monitoring started successfully
   */
  startMonitoring(identifier: string, latitude: number, longitude: number, radius: number): boolean {
    return this.nativeModule.startMonitoring(identifier, latitude, longitude, radius);
  }

  /**
   * Stop monitoring a specific geofence region
   * @param identifier Identifier of the region to stop monitoring
   * @returns true if monitoring stopped successfully
   */
  stopMonitoring(identifier: string): boolean {
    return this.nativeModule.stopMonitoring(identifier);
  }

  /**
   * Stop monitoring all geofence regions
   * @returns true if all monitoring stopped successfully
   */
  stopAllMonitoring(): boolean {
    return this.nativeModule.stopAllMonitoring();
  }

  /**
   * Get list of currently monitored region identifiers
   * @returns array of region identifiers
   */
  getMonitoredRegions(): string[] {
    return this.nativeModule.getMonitoredRegions();
  }

  /**
   * Request "Always" location permission (required for background geofencing)
   * @returns permission status
   */
  async requestAlwaysAuthorization(): Promise<GeofencePermissionResult> {
    return await this.nativeModule.requestAlwaysAuthorization();
  }

  /**
   * Check if app has "Always" location permission
   * @returns true if always authorization granted
   */
  hasAlwaysAuthorization(): boolean {
    return this.nativeModule.hasAlwaysAuthorization();
  }
}

// Create module instance with error handling
let ExpoGeofencing: ExpoGeofencingModule;
let geofencingFallbackWarned = false;
let isNativeModuleAvailable = false;

function warnFallback() {
  if (!geofencingFallbackWarned) {
    geofencingFallbackWarned = true;
    console.warn(
      '[ExpoGeofencing] Native module not available (e.g. Expo Go). Use a development build for geofencing.'
    );
  }
}

try {
  ExpoGeofencing = requireNativeModule<ExpoGeofencingModule>('ExpoGeofencing');
  if (!ExpoGeofencing || typeof ExpoGeofencing.hasAlwaysAuthorization !== 'function') {
    throw new Error('ExpoGeofencing module methods not available');
  }
  isNativeModuleAvailable = true;
} catch {
  ExpoGeofencing = {
    startMonitoring: () => {
      warnFallback();
      return false;
    },
    stopMonitoring: () => {
      warnFallback();
      return false;
    },
    stopAllMonitoring: () => {
      warnFallback();
      return false;
    },
    getMonitoredRegions: () => {
      warnFallback();
      return [];
    },
    requestAlwaysAuthorization: async () => {
      warnFallback();
      return { status: 'notDetermined' as const };
    },
    hasAlwaysAuthorization: () => {
      warnFallback();
      return false;
    },
  } as ExpoGeofencingModule;
}

// Create event emitter for geofence events (only when native module is available)
let emitter: EventEmitter | null = null;
if (isNativeModuleAvailable) {
  try {
    emitter = new EventEmitter(ExpoGeofencing);
  } catch (error) {
    console.warn('[ExpoGeofencing] Failed to create event emitter:', error);
    emitter = null;
  }
}

export default ExpoGeofencing;

/**
 * Add listener for geofence entry events
 * @param listener Callback function that receives geofence event
 * @returns Subscription object with remove() method
 */
export function addGeofenceEnterListener(listener: (event: GeofenceEvent) => void) {
  if (!emitter) {
    console.warn('ExpoGeofencing event emitter is not available');
    return { remove: () => {} };
  }
  try {
    return emitter.addListener('onGeofenceEnter', listener);
  } catch (error) {
    console.error('Failed to add geofence enter listener:', error);
    return { remove: () => {} };
  }
}

/**
 * Add listener for geofence exit events
 * @param listener Callback function that receives geofence event
 * @returns Subscription object with remove() method
 */
export function addGeofenceExitListener(listener: (event: GeofenceEvent) => void) {
  if (!emitter) {
    console.warn('ExpoGeofencing event emitter is not available');
    return { remove: () => {} };
  }
  try {
    return emitter.addListener('onGeofenceExit', listener);
  } catch (error) {
    console.error('Failed to add geofence exit listener:', error);
    return { remove: () => {} };
  }
}

/**
 * Add listener for geofence errors
 * @param listener Callback function that receives error event
 * @returns Subscription object with remove() method
 */
export function addGeofenceErrorListener(listener: (event: GeofenceErrorEvent) => void) {
  if (!emitter) {
    console.warn('ExpoGeofencing event emitter is not available');
    return { remove: () => {} };
  }
  try {
    return emitter.addListener('onGeofenceError', listener);
  } catch (error) {
    console.error('Failed to add geofence error listener:', error);
    return { remove: () => {} };
  }
}

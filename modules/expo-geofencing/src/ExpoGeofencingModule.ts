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

// Create module instance
const ExpoGeofencing = requireNativeModule<ExpoGeofencingModule>('ExpoGeofencing');

// Create event emitter for geofence events
const emitter = new EventEmitter(ExpoGeofencing);

export default ExpoGeofencing;

/**
 * Add listener for geofence entry events
 * @param listener Callback function that receives geofence event
 * @returns Subscription object with remove() method
 */
export function addGeofenceEnterListener(listener: (event: GeofenceEvent) => void) {
  return emitter.addListener('onGeofenceEnter', listener);
}

/**
 * Add listener for geofence exit events
 * @param listener Callback function that receives geofence event
 * @returns Subscription object with remove() method
 */
export function addGeofenceExitListener(listener: (event: GeofenceEvent) => void) {
  return emitter.addListener('onGeofenceExit', listener);
}

/**
 * Add listener for geofence errors
 * @param listener Callback function that receives error event
 * @returns Subscription object with remove() method
 */
export function addGeofenceErrorListener(listener: (event: GeofenceErrorEvent) => void) {
  return emitter.addListener('onGeofenceError', listener);
}

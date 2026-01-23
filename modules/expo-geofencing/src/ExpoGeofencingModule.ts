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

try {
  console.log('🔍 Attempting to load ExpoGeofencing native module...');
  ExpoGeofencing = requireNativeModule<ExpoGeofencingModule>('ExpoGeofencing');
  console.log('✅ ExpoGeofencing module loaded:', !!ExpoGeofencing);
  console.log('🔍 Module type:', typeof ExpoGeofencing);
  console.log('🔍 Module keys:', ExpoGeofencing ? Object.keys(ExpoGeofencing) : 'null');
  
  // Verify the module has the expected methods
  if (!ExpoGeofencing || typeof ExpoGeofencing.hasAlwaysAuthorization !== 'function') {
    console.error('❌ ExpoGeofencing module loaded but methods are not available');
    console.error('❌ hasAlwaysAuthorization type:', typeof ExpoGeofencing?.hasAlwaysAuthorization);
    throw new Error('ExpoGeofencing module methods not available');
  }
  console.log('✅ ExpoGeofencing module methods verified');
} catch (error) {
  console.error('❌ Failed to load ExpoGeofencing native module:', error);
  console.error('❌ Error details:', error instanceof Error ? error.message : String(error));
  if (error instanceof Error) {
    console.error('❌ Stack trace:', error.stack);
  }
  // Create a fallback module that returns safe defaults
  ExpoGeofencing = {
    startMonitoring: () => {
      console.warn('ExpoGeofencing native module is not available');
      return false;
    },
    stopMonitoring: () => {
      console.warn('ExpoGeofencing native module is not available');
      return false;
    },
    stopAllMonitoring: () => {
      console.warn('ExpoGeofencing native module is not available');
      return false;
    },
    getMonitoredRegions: () => {
      console.warn('ExpoGeofencing native module is not available');
      return [];
    },
    requestAlwaysAuthorization: async () => {
      console.warn('ExpoGeofencing native module is not available');
      return { status: 'notDetermined' as const };
    },
    hasAlwaysAuthorization: () => {
      console.warn('ExpoGeofencing native module is not available');
      return false;
    },
  } as ExpoGeofencingModule;
}

// Create event emitter for geofence events
let emitter: EventEmitter | null = null;
try {
  emitter = new EventEmitter(ExpoGeofencing);
} catch (error) {
  console.error('Failed to create EventEmitter for ExpoGeofencing:', error);
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

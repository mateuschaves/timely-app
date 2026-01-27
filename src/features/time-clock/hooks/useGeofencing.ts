import { useEffect, useCallback, useState, useRef } from 'react';
import { Platform } from 'react-native';
import ExpoGeofencing, {
  addGeofenceEnterListener,
  addGeofenceExitListener,
  addGeofenceErrorListener,
  type GeofenceEvent,
} from 'expo-geofencing';
import { useAuthContext } from '@/features/auth';
import { getUserSettings } from '@/api/get-user-settings';
import { clockInDraft } from '@/api/clock-in-draft';
import { clockOutDraft } from '@/api/clock-out-draft';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import { useTranslation } from '@/i18n';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/config/storage';
import { usePremiumFeatures } from '@/features/subscriptions';

const WORKPLACE_GEOFENCE_ID = 'workplace';
const DEFAULT_GEOFENCE_RADIUS = 100; // 100 meters (fallback)

export function useGeofencing() {
  const { user } = useAuthContext();
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const { hasGeofencing } = usePremiumFeatures();
  
  // Track last processed events to prevent duplicates
  const lastProcessedEventsRef = useRef<{
    enter: number | null;
    exit: number | null;
  }>({ enter: null, exit: null });

  // Get user settings to check for workplace location
  const { data: settings } = useQuery({
    queryKey: ['userSettings', user?.id],
    queryFn: getUserSettings,
    enabled: !!user?.id,
  });

  // Mutations for creating draft entries
  const clockInDraftMutation = useMutation({
    mutationFn: clockInDraft,
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['timeClockEntries'] });
      queryClient.invalidateQueries({ queryKey: ['clockHistory'] });
      queryClient.invalidateQueries({ queryKey: ['lastEvent'] });
    },
  });

  const clockOutDraftMutation = useMutation({
    mutationFn: clockOutDraft,
    onSuccess: () => {
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['timeClockEntries'] });
      queryClient.invalidateQueries({ queryKey: ['clockHistory'] });
      queryClient.invalidateQueries({ queryKey: ['lastEvent'] });
    },
  });

  // Check if geofencing is available (iOS only for now)
  const isAvailable = Platform.OS === 'ios';

  /**
   * Request "Always" location permission needed for background geofencing
   */
  const requestPermission = useCallback(async () => {
    if (!isAvailable) {
      console.log('Geofencing not available on this platform');
      return false;
    }

    if (!ExpoGeofencing) {
      console.warn('⚠️ ExpoGeofencing module is not available yet');
      return false;
    }
    
    if (typeof ExpoGeofencing.requestAlwaysAuthorization !== 'function') {
      console.warn('⚠️ ExpoGeofencing.requestAlwaysAuthorization is not a function yet');
      return false;
    }

    try {
      const result = await ExpoGeofencing.requestAlwaysAuthorization();
      const granted = result.status === 'granted';
      setHasPermission(granted);
      
      if (!granted) {
        console.log('Always location permission not granted:', result.status);
      }
      
      return granted;
    } catch (error) {
      console.error('Error requesting geofencing permission:', error);
      return false;
    }
  }, [isAvailable]);

  /**
   * Start monitoring workplace geofence
   */
  const startMonitoring = useCallback(async () => {
    if (!isAvailable) {
      console.log('Geofencing not available on this platform');
      return false;
    }

    // Check premium access
    if (!hasGeofencing) {
      console.log('Geofencing requires premium subscription');
      return false;
    }

    if (!settings?.workLocation) {
      console.log('No workplace location configured');
      return false;
    }

    try {
      // Check if module is available
      if (!ExpoGeofencing) {
        console.warn('⚠️ ExpoGeofencing module is not available yet');
        return false;
      }
      
      if (typeof ExpoGeofencing.hasAlwaysAuthorization !== 'function') {
        console.warn('⚠️ ExpoGeofencing.hasAlwaysAuthorization is not a function yet');
        return false;
      }

      // Check permission first
      const hasAuth = ExpoGeofencing.hasAlwaysAuthorization();
      if (!hasAuth) {
        console.log('No always location permission, requesting...');
        const granted = await requestPermission();
        if (!granted) {
          return false;
        }
      }

      // Get workplace coordinates
      const [longitude, latitude] = settings.workLocation.coordinates;

      // Start monitoring
      if (!ExpoGeofencing) {
        console.warn('⚠️ ExpoGeofencing module is not available yet');
        return false;
      }
      
      if (typeof ExpoGeofencing.startMonitoring !== 'function') {
        console.warn('⚠️ ExpoGeofencing.startMonitoring is not a function yet');
        return false;
      }

      // Get radius from local storage (not from API)
      let radius = DEFAULT_GEOFENCE_RADIUS;
      try {
        const storedRadius = await AsyncStorage.getItem(STORAGE_KEYS.WORKPLACE_RADIUS);
        if (storedRadius) {
          radius = parseInt(storedRadius, 10) || DEFAULT_GEOFENCE_RADIUS;
        }
      } catch (error) {
        console.warn('Error reading radius from storage, using default:', error);
      }

      const success = ExpoGeofencing.startMonitoring(
        WORKPLACE_GEOFENCE_ID,
        latitude,
        longitude,
        radius
      );

      if (success) {
        setIsMonitoring(true);
        console.log(`✅ Started monitoring workplace geofence at (${latitude}, ${longitude})`);
      } else {
        console.log('❌ Failed to start monitoring workplace geofence');
      }

      return success;
    } catch (error) {
      console.error('Error starting geofence monitoring:', error);
      return false;
    }
  }, [isAvailable, hasGeofencing, settings?.workLocation, requestPermission]);

  /**
   * Stop monitoring workplace geofence
   */
  const stopMonitoring = useCallback(() => {
    if (!isAvailable) {
      return false;
    }

    if (!ExpoGeofencing) {
      console.warn('⚠️ ExpoGeofencing module is not available yet');
      return false;
    }
    
    if (typeof ExpoGeofencing.stopMonitoring !== 'function') {
      console.warn('⚠️ ExpoGeofencing.stopMonitoring is not a function yet');
      return false;
    }

    try {
      const success = ExpoGeofencing.stopMonitoring(WORKPLACE_GEOFENCE_ID);
      if (success) {
        setIsMonitoring(false);
        console.log('✅ Stopped monitoring workplace geofence');
      }
      return success;
    } catch (error) {
      console.error('Error stopping geofence monitoring:', error);
      return false;
    }
  }, [isAvailable]);

  /**
   * Handle geofence entry (arriving at work)
   */
  const handleGeofenceEnter = useCallback(async (event: GeofenceEvent) => {
    console.log('📍 Entered workplace geofence:', event);

    // Prevent duplicate events within 60 seconds
    const now = Date.now();
    const eventTime = event.timestamp * 1000; // Convert to milliseconds
    const timeSinceLastEvent = lastProcessedEventsRef.current.enter 
      ? eventTime - lastProcessedEventsRef.current.enter 
      : Infinity;
    
    if (timeSinceLastEvent < 60000) {
      console.log('⚠️ Ignoring duplicate enter event (last processed', Math.round(timeSinceLastEvent / 1000), 'seconds ago)');
      return;
    }

    // Update last processed timestamp
    lastProcessedEventsRef.current.enter = eventTime;

    try {
      // Create draft clock-in entry automatically
      const currentTime = new Date().toISOString();
      await clockInDraftMutation.mutateAsync({
        hour: currentTime,
        location: {
          type: 'Point',
          coordinates: [event.longitude, event.latitude],
        },
      });

      console.log('✅ Draft clock-in entry created');

      // Send notification to inform user
      await Notifications.scheduleNotificationAsync({
        content: {
          title: t('notifications.geofenceEntryTitle'),
          body: t('notifications.geofenceEntryBody'),
          data: {
            type: 'geofence_enter',
            identifier: event.identifier,
            latitude: event.latitude,
            longitude: event.longitude,
            action: 'clock-in',
            isDraft: true,
          },
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Error handling geofence entry:', error);
    }
  }, [t, clockInDraftMutation]);

  /**
   * Handle geofence exit (leaving work)
   */
  const handleGeofenceExit = useCallback(async (event: GeofenceEvent) => {
    console.log('📍 Exited workplace geofence:', event);

    // Prevent duplicate events within 60 seconds
    const now = Date.now();
    const eventTime = event.timestamp * 1000; // Convert to milliseconds
    const timeSinceLastEvent = lastProcessedEventsRef.current.exit 
      ? eventTime - lastProcessedEventsRef.current.exit 
      : Infinity;
    
    if (timeSinceLastEvent < 60000) {
      console.log('⚠️ Ignoring duplicate exit event (last processed', Math.round(timeSinceLastEvent / 1000), 'seconds ago)');
      return;
    }

    // Update last processed timestamp
    lastProcessedEventsRef.current.exit = eventTime;

    try {
      // Create draft clock-out entry automatically
      const currentTime = new Date().toISOString();
      await clockOutDraftMutation.mutateAsync({
        hour: currentTime,
        location: {
          type: 'Point',
          coordinates: [event.longitude, event.latitude],
        },
      });

      console.log('✅ Draft clock-out entry created');

      // Send notification to inform user
      await Notifications.scheduleNotificationAsync({
        content: {
          title: t('notifications.geofenceExitTitle'),
          body: t('notifications.geofenceExitBody'),
          data: {
            type: 'geofence_exit',
            identifier: event.identifier,
            latitude: event.latitude,
            longitude: event.longitude,
            action: 'clock-out',
            isDraft: true,
          },
        },
        trigger: null, // Send immediately
      });
    } catch (error) {
      console.error('Error handling geofence exit:', error);
    }
  }, [t, clockOutDraftMutation]);

  /**
   * Handle geofence errors
   */
  const handleGeofenceError = useCallback((event: { identifier: string; error: string }) => {
    console.error('❌ Geofence error:', event);
  }, []);

  // Set up event listeners
  useEffect(() => {
    if (!isAvailable) {
      return;
    }

    const enterSubscription = addGeofenceEnterListener(handleGeofenceEnter);
    const exitSubscription = addGeofenceExitListener(handleGeofenceExit);
    const errorSubscription = addGeofenceErrorListener(handleGeofenceError);

    return () => {
      enterSubscription.remove();
      exitSubscription.remove();
      errorSubscription.remove();
    };
  }, [isAvailable, handleGeofenceEnter, handleGeofenceExit, handleGeofenceError]);

  // Check current monitoring status on mount
  useEffect(() => {
    if (!isAvailable) {
      return;
    }

    // Add a delay to ensure module is fully initialized
    const checkStatus = () => {
      // Check if module exists and has required methods
      if (!ExpoGeofencing) {
        // Silently return - module may not be loaded yet
        return;
      }
      
      if (typeof ExpoGeofencing.getMonitoredRegions !== 'function' || typeof ExpoGeofencing.hasAlwaysAuthorization !== 'function') {
        // Silently return - methods may not be available yet
        return;
      }

      try {
        const regions = ExpoGeofencing.getMonitoredRegions();
        const monitoring = regions.includes(WORKPLACE_GEOFENCE_ID);
        setIsMonitoring(monitoring);

        const hasAuth = ExpoGeofencing.hasAlwaysAuthorization();
        setHasPermission(hasAuth);
        console.log('✅ Geofence status checked - monitoring:', monitoring, 'hasPermission:', hasAuth);
      } catch (error) {
        console.error('❌ Error checking geofence status:', error);
      }
    };

    // Check after a delay to ensure module is fully initialized
    // Use multiple timeouts to handle different initialization speeds
    const timeout1 = setTimeout(checkStatus, 200);
    const timeout2 = setTimeout(checkStatus, 500);
    const timeout3 = setTimeout(checkStatus, 1000);
    
    return () => {
      clearTimeout(timeout1);
      clearTimeout(timeout2);
      clearTimeout(timeout3);
    };
  }, [isAvailable]);

  return {
    isAvailable,
    isMonitoring,
    hasPermission,
    hasPremiumAccess: hasGeofencing,
    startMonitoring,
    stopMonitoring,
    requestPermission,
    workplaceLocation: settings?.workLocation,
  };
}

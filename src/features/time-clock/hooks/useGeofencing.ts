import { useEffect, useCallback, useState } from 'react';
import { Platform } from 'react-native';
import ExpoGeofencing, {
  addGeofenceEnterListener,
  addGeofenceExitListener,
  addGeofenceErrorListener,
  GeofenceEvent,
} from '@/../modules/expo-geofencing';
import { useAuthContext } from '@/features/auth';
import { getUserSettings } from '@/api/get-user-settings';
import { clockInDraft } from '@/api/clock-in-draft';
import { clockOutDraft } from '@/api/clock-out-draft';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import { useTranslation } from '@/i18n';

const WORKPLACE_GEOFENCE_ID = 'workplace';
const GEOFENCE_RADIUS = 100; // 100 meters

export function useGeofencing() {
  const { user } = useAuthContext();
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const { t } = useTranslation();
  const queryClient = useQueryClient();

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

    if (!settings?.workLocation) {
      console.log('No workplace location configured');
      return false;
    }

    try {
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
      const success = ExpoGeofencing.startMonitoring(
        WORKPLACE_GEOFENCE_ID,
        latitude,
        longitude,
        GEOFENCE_RADIUS
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
  }, [isAvailable, settings?.workLocation, requestPermission]);

  /**
   * Stop monitoring workplace geofence
   */
  const stopMonitoring = useCallback(() => {
    if (!isAvailable) {
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

    try {
      const regions = ExpoGeofencing.getMonitoredRegions();
      const monitoring = regions.includes(WORKPLACE_GEOFENCE_ID);
      setIsMonitoring(monitoring);

      const hasAuth = ExpoGeofencing.hasAlwaysAuthorization();
      setHasPermission(hasAuth);
    } catch (error) {
      console.error('Error checking geofence status:', error);
    }
  }, [isAvailable]);

  return {
    isAvailable,
    isMonitoring,
    hasPermission,
    startMonitoring,
    stopMonitoring,
    requestPermission,
    workplaceLocation: settings?.workLocation,
  };
}

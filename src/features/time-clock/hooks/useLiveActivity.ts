import { useEffect, useRef, useCallback } from 'react';
import { Platform } from 'react-native';
import { 
  startActivity, 
  endActivity, 
  updateActivity,
  ActivityState
} from 'expo-live-activity';

export interface LiveActivityData {
  entryTime: string;
  elapsedTime: string;
}

export interface LiveActivityAttributes {
  appName: string;
}

const ACTIVITY_NAME = 'TimelyWorkSession';

export function useLiveActivity() {
  const activityIdRef = useRef<string | null>(null);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Check if Live Activities are supported and enabled
  const isSupported = async (): Promise<boolean> => {
    if (Platform.OS !== 'ios') return false;
    
    // Check if the functions are available (they may not be in Expo Go or if module isn't linked)
    if (typeof startActivity !== 'function' || typeof endActivity !== 'function') {
      return false;
    }
    
    // Live Activities require iOS 16.2+, but we can't check version here
    // Just return true if we're on iOS and the functions are available
    // The actual startActivity call will fail gracefully if not supported
    return true;
  };

  // Stop the Live Activity (helper function used internally)
  const stopActivityInternal = async (): Promise<boolean> => {
    try {
      const hadActivity = !!activityIdRef.current;
      
      // Clear update interval
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
        updateIntervalRef.current = null;
      }

      if (activityIdRef.current) {
        await endActivity(activityIdRef.current);
        console.log('Live Activity ended:', activityIdRef.current);
        activityIdRef.current = null;
      }
      
      return hadActivity;
    } catch (error) {
      console.error('Error stopping Live Activity:', error);
      return false;
    }
  };

  // Stop the Live Activity (public API)
  const stopWorkSessionActivity = useCallback(async (): Promise<boolean> => {
    return stopActivityInternal();
  }, []);

  // Start a new Live Activity for work session
  const startWorkSessionActivity = useCallback(async (entryTime: Date): Promise<string | null> => {
    try {
      if (!(await isSupported())) {
        console.log('Live Activities not supported or enabled');
        return null;
      }

      // Stop any existing activity first (using internal helper)
      await stopActivityInternal();

      const attributes: LiveActivityAttributes = {
        appName: 'Timely',
      };

      const contentState: LiveActivityData = {
        entryTime: entryTime.toISOString(),
        elapsedTime: '00:00:00',
      };

      const activityId = await startActivity<LiveActivityAttributes, LiveActivityData>(
        ACTIVITY_NAME,
        attributes,
        contentState
      );

      if (activityId) {
        activityIdRef.current = activityId;
        console.log('Live Activity started:', activityId);

        // Start updating the elapsed time every minute
        startUpdatingElapsedTime(entryTime);
      }

      return activityId;
    } catch (error) {
      console.error('Error starting Live Activity:', error);
      return null;
    }
  }, []);

  // Update elapsed time periodically
  const startUpdatingElapsedTime = (entryTime: Date) => {
    // Clear any existing interval
    if (updateIntervalRef.current) {
      clearInterval(updateIntervalRef.current);
    }

    // Update immediately
    updateElapsedTime(entryTime);

    // Then update every minute
    updateIntervalRef.current = setInterval(() => {
      updateElapsedTime(entryTime);
    }, 60000); // Update every 1 minute
  };

  // Calculate and update elapsed time
  const updateElapsedTime = async (entryTime: Date) => {
    if (!activityIdRef.current) return;

    try {
      const now = new Date();
      const elapsed = now.getTime() - entryTime.getTime();
      
      const hours = Math.floor(elapsed / (1000 * 60 * 60));
      const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((elapsed % (1000 * 60)) / 1000);
      
      const elapsedTime = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

      const contentState: LiveActivityData = {
        entryTime: entryTime.toISOString(),
        elapsedTime,
      };

      await updateActivity<LiveActivityData>(
        activityIdRef.current,
        contentState
      );

      console.log('Live Activity updated:', elapsedTime);
    } catch (error) {
      console.error('Error updating Live Activity:', error);
    }
  };


  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, []);

  return {
    startWorkSessionActivity,
    stopWorkSessionActivity,
    isSupported,
  };
}

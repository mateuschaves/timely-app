import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { 
  startActivity, 
  endActivity, 
  updateActivity,
  areActivitiesEnabled,
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
    
    try {
      const enabled = await areActivitiesEnabled();
      return enabled;
    } catch (error) {
      console.warn('Error checking Live Activity support:', error);
      return false;
    }
  };

  // Start a new Live Activity for work session
  const startWorkSessionActivity = async (entryTime: Date): Promise<string | null> => {
    try {
      if (!(await isSupported())) {
        console.log('Live Activities not supported or enabled');
        return null;
      }

      // Stop any existing activity first
      await stopWorkSessionActivity();

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
  };

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

  // Stop the Live Activity
  const stopWorkSessionActivity = async (): Promise<void> => {
    try {
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
    } catch (error) {
      console.error('Error stopping Live Activity:', error);
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

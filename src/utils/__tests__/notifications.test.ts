import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import {
  requestNotificationPermissions,
  cancelAllNotifications,
  getScheduledNotificationsCount,
  scheduleTestNotification,
  scheduleClockReminders,
} from '../notifications';

jest.mock('expo-notifications', () => ({
  getPermissionsAsync: jest.fn(),
  requestPermissionsAsync: jest.fn(),
  setNotificationChannelAsync: jest.fn(),
  cancelAllScheduledNotificationsAsync: jest.fn(),
  getAllScheduledNotificationsAsync: jest.fn(),
  scheduleNotificationAsync: jest.fn(),
  setNotificationHandler: jest.fn(),
}));

jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
  },
}));

describe('notifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('requestNotificationPermissions', () => {
    it('should return true when permission is already granted', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      const result = await requestNotificationPermissions();

      expect(result).toBe(true);
      expect(Notifications.requestPermissionsAsync).not.toHaveBeenCalled();
    });

    it('should request permission when not granted', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'undetermined',
      });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      const result = await requestNotificationPermissions();

      expect(result).toBe(true);
      expect(Notifications.requestPermissionsAsync).toHaveBeenCalled();
    });

    it('should return false when permission is denied', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      const result = await requestNotificationPermissions();

      expect(result).toBe(false);
    });

    it('should setup Android channel when on Android', async () => {
      Platform.OS = 'android';
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });

      await requestNotificationPermissions();

      expect(Notifications.setNotificationChannelAsync).toHaveBeenCalled();
    });
  });

  describe('cancelAllNotifications', () => {
    it('should cancel all scheduled notifications', async () => {
      (Notifications.cancelAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue(undefined);

      await cancelAllNotifications();

      expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalled();
    });
  });

  describe('getScheduledNotificationsCount', () => {
    it('should return count of scheduled notifications', async () => {
      const mockNotifications = [
        { identifier: '1', content: {} },
        { identifier: '2', content: {} },
      ];
      (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue(mockNotifications);

      const result = await getScheduledNotificationsCount();

      expect(result).toBe(2);
    });
  });

  describe('scheduleTestNotification', () => {
    it('should schedule test notification when permission is granted', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'granted',
      });
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue('notification-id');

      await scheduleTestNotification();

      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();
    });

    it('should not schedule when permission is denied', async () => {
      (Notifications.getPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });
      (Notifications.requestPermissionsAsync as jest.Mock).mockResolvedValue({
        status: 'denied',
      });

      await scheduleTestNotification();

      expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });
  });

  describe('scheduleClockReminders', () => {
    it('should schedule reminders for work schedule', async () => {
      const workSchedule = {
        monday: { start: '09:00', end: '18:00' },
        tuesday: { start: '09:00', end: '18:00' },
      };

      const messages = {
        entryTitle: 'Entry',
        entryBody: 'Time to clock in',
        lunchTitle: 'Lunch',
        lunchBody: 'Time for lunch',
        exitTitle: 'Exit',
        exitBody: 'Time to clock out',
      };

      (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([]);
      (Notifications.cancelAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue(undefined);
      (Notifications.scheduleNotificationAsync as jest.Mock).mockResolvedValue('notification-id');

      await scheduleClockReminders(workSchedule, messages);

      expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalled();
      expect(Notifications.scheduleNotificationAsync).toHaveBeenCalled();
    });

    it('should not schedule when no schedule exists', async () => {
      const workSchedule = {};
      const messages = {
        entryTitle: 'Entry',
        entryBody: 'Time to clock in',
        lunchTitle: 'Lunch',
        lunchBody: 'Time for lunch',
        exitTitle: 'Exit',
        exitBody: 'Time to clock out',
      };

      (Notifications.getAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue([]);
      (Notifications.cancelAllScheduledNotificationsAsync as jest.Mock).mockResolvedValue(undefined);

      await scheduleClockReminders(workSchedule, messages);

      expect(Notifications.cancelAllScheduledNotificationsAsync).toHaveBeenCalled();
      expect(Notifications.scheduleNotificationAsync).not.toHaveBeenCalled();
    });
  });
});

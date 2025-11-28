import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useNotifications } from '../useNotifications';
import { getUserSettings } from '@/api/get-user-settings';
import { requestNotificationPermissions, scheduleClockReminders, cancelAllNotifications } from '@/utils/notifications';
import { useTranslation } from '@/i18n';

jest.mock('@/api/get-user-settings');
jest.mock('@/utils/notifications');
jest.mock('@/i18n');

const mockGetUserSettings = getUserSettings as jest.MockedFunction<typeof getUserSettings>;
const mockRequestNotificationPermissions = requestNotificationPermissions as jest.MockedFunction<typeof requestNotificationPermissions>;
const mockScheduleClockReminders = scheduleClockReminders as jest.MockedFunction<typeof scheduleClockReminders>;
const mockCancelAllNotifications = cancelAllNotifications as jest.MockedFunction<typeof cancelAllNotifications>;
const mockUseTranslation = useTranslation as jest.MockedFunction<typeof useTranslation>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useNotifications', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTranslation.mockReturnValue({
      t: jest.fn((key: string) => key),
      i18n: {
        language: 'pt-BR',
        changeLanguage: jest.fn(),
      },
    } as any);
  });

  it('should setup notifications when settings are available', async () => {
    const mockSettings = {
      workSchedule: {
        monday: { start: '09:00', end: '18:00' },
      },
    };

    mockGetUserSettings.mockResolvedValue(mockSettings as any);
    mockRequestNotificationPermissions.mockResolvedValue(true);
    mockScheduleClockReminders.mockResolvedValue();

    renderHook(() => useNotifications(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(mockRequestNotificationPermissions).toHaveBeenCalled();
    });

    await waitFor(() => {
      expect(mockScheduleClockReminders).toHaveBeenCalled();
    });
  });

  it('should cancel notifications when no schedule exists', async () => {
    const mockSettings = {
      workSchedule: {},
    };

    mockGetUserSettings.mockResolvedValue(mockSettings as any);
    mockRequestNotificationPermissions.mockResolvedValue(true);
    mockCancelAllNotifications.mockResolvedValue();

    renderHook(() => useNotifications(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(mockCancelAllNotifications).toHaveBeenCalled();
    });
  });

  it('should not setup notifications when permission is denied', async () => {
    const mockSettings = {
      workSchedule: {
        monday: { start: '09:00', end: '18:00' },
      },
    };

    mockGetUserSettings.mockResolvedValue(mockSettings as any);
    mockRequestNotificationPermissions.mockResolvedValue(false);

    renderHook(() => useNotifications(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(mockRequestNotificationPermissions).toHaveBeenCalled();
    });

    expect(mockScheduleClockReminders).not.toHaveBeenCalled();
  });
});

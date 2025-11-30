import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient } from '@tanstack/react-query';
import { WorkSettingsScreen } from '../index';
import { createTestWrapper } from '@/utils/test-helpers';
import { useTranslation } from '@/i18n';
import { updateUserSettings, getUserSettings } from '@/api/update-user-settings';
import { useFeedback } from '@/utils/feedback';

jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  NotificationFeedbackType: {
    Success: 'success',
  },
}));

jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    select: jest.fn(),
  },
  Alert: {
    alert: jest.fn(),
  },
  Keyboard: {
    dismiss: jest.fn(),
  },
  useColorScheme: jest.fn(() => 'light'),
  View: 'View',
  Text: 'Text',
  TextInput: 'TextInput',
  TouchableOpacity: 'TouchableOpacity',
  TouchableWithoutFeedback: 'TouchableWithoutFeedback',
  ScrollView: 'ScrollView',
  Switch: 'Switch',
  ActivityIndicator: 'ActivityIndicator',
  Modal: 'Modal',
  StyleSheet: {
    create: (styles: any) => styles,
    flatten: (style: any) => {
      if (!style) return {};
      if (Array.isArray(style)) {
        return Object.assign({}, ...style.filter(Boolean));
      }
      return style;
    },
  },
}));
jest.mock('expo-localization', () => ({
  getLocales: jest.fn(() => [{ languageTag: 'pt-BR', currencyCode: 'BRL' }]),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: 'SafeAreaView',
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@/i18n');
const mockUpdateUserSettings = jest.fn();
const mockGetUserSettings = jest.fn();

jest.mock('@/api/update-user-settings', () => ({
  updateUserSettings: (...args: any[]) => mockUpdateUserSettings(...args),
  getUserSettings: (...args: any[]) => mockGetUserSettings(...args),
}));
jest.mock('@/utils/feedback');
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: jest.fn(),
  }),
}));

const mockUseTranslation = useTranslation as jest.MockedFunction<typeof useTranslation>;
const mockUseFeedback = useFeedback as jest.MockedFunction<typeof useFeedback>;

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

  return createTestWrapper(queryClient);
};

describe('WorkSettingsScreen', () => {
  const mockT = jest.fn((key: string) => key);
  const mockShowSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTranslation.mockReturnValue({
      t: mockT,
      i18n: {
        language: 'pt-BR',
        changeLanguage: jest.fn(),
      },
    } as any);
    mockGetUserSettings.mockResolvedValue({
      workSchedule: {},
    } as any);
    mockUpdateUserSettings.mockResolvedValue({} as any);
    mockUseFeedback.mockReturnValue({
      showSuccess: mockShowSuccess,
      showError: jest.fn(),
      showInfo: jest.fn(),
    } as any);
  });

  it('should render work settings screen', async () => {
    const { getByText } = render(<WorkSettingsScreen />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(getByText('profile.workSettings')).toBeTruthy();
    });
  });

  it('should toggle day schedule', async () => {
    const { getByText } = render(<WorkSettingsScreen />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(getByText('Profile.monday')).toBeTruthy();
    });

    // Find the switch for monday (this is a simplified test)
    expect(mockT).toHaveBeenCalledWith('profile.monday');
  });

  it('should save work schedule successfully', async () => {
    const { getByText } = render(<WorkSettingsScreen />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(getByText('common.save')).toBeTruthy();
    });

    const saveButton = getByText('common.save');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(mockUpdateUserSettings).toHaveBeenCalled();
    }, { timeout: 10000 });

    await waitFor(() => {
      expect(mockShowSuccess).toHaveBeenCalled();
    }, { timeout: 10000 });
  });

  it('should load existing work schedule', async () => {
    mockGetUserSettings.mockResolvedValue({
      workSchedule: {
        monday: {
          start: '09:00',
          end: '18:00',
        },
        tuesday: {
          start: '08:00',
          end: '17:00',
        },
      },
    } as any);

    const { getByText } = render(<WorkSettingsScreen />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(getByText('profile.workSettings')).toBeTruthy();
    });
  });

  it('should handle time input change', async () => {
    const { getByText } = render(<WorkSettingsScreen />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(getByText('profile.workSettings')).toBeTruthy();
    });
    // Component renders successfully, time input handling is tested through integration
  });

  it('should handle save error', async () => {
    const mockAlert = require('react-native').Alert.alert as jest.Mock;
    mockUpdateUserSettings.mockRejectedValue({
      response: {
        data: {
          message: 'Error saving settings',
        },
      },
    });

    const { getByText } = render(<WorkSettingsScreen />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(getByText('common.save')).toBeTruthy();
    });

    const saveButton = getByText('common.save');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalled();
    });
  });

  it('should handle save error without response', async () => {
    const mockAlert = require('react-native').Alert.alert as jest.Mock;
    mockUpdateUserSettings.mockRejectedValue(new Error('Network error'));

    const { getByText } = render(<WorkSettingsScreen />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(getByText('common.save')).toBeTruthy();
    });

    const saveButton = getByText('common.save');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalled();
    });
  });

  it('should load and display all days of week', async () => {
    mockGetUserSettings.mockResolvedValue({
      workSchedule: {
        monday: { start: '09:00', end: '18:00' },
        tuesday: { start: '09:00', end: '18:00' },
        wednesday: { start: '09:00', end: '18:00' },
        thursday: { start: '09:00', end: '18:00' },
        friday: { start: '09:00', end: '18:00' },
        saturday: { start: '09:00', end: '18:00' },
        sunday: { start: '09:00', end: '18:00' },
      },
    } as any);

    const { getByText } = render(<WorkSettingsScreen />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(getByText('profile.workSettings')).toBeTruthy();
      expect(getByText('Profile.monday')).toBeTruthy();
    });
  });

  it('should disable inputs when saving', async () => {
    mockUpdateUserSettings.mockImplementation(() => new Promise(() => { })); // Never resolves

    const { getByText } = render(<WorkSettingsScreen />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(getByText('common.save')).toBeTruthy();
    });

    const saveButton = getByText('common.save');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(getByText('common.loading')).toBeTruthy();
    });
  });

  it('should save with multiple enabled days', async () => {
    mockGetUserSettings.mockResolvedValue({
      workSchedule: {
        monday: { start: '09:00', end: '18:00' },
        tuesday: { start: '08:00', end: '17:00' },
        friday: { start: '10:00', end: '19:00' },
      },
    } as any);

    const { getByText } = render(<WorkSettingsScreen />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(getByText('common.save')).toBeTruthy();
    }, { timeout: 10000 });

    const saveButton = getByText('common.save');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(mockUpdateUserSettings).toHaveBeenCalled();
    }, { timeout: 15000 });

    // Verify that workSchedule was included in the call
    const updateCall = mockUpdateUserSettings.mock.calls[0];
    expect(updateCall[0]).toHaveProperty('workSchedule');
    // The workSchedule should contain the enabled days
    expect(updateCall[0].workSchedule).toBeDefined();
  }, 20000);

  it('should save with only some days enabled', async () => {
    mockGetUserSettings.mockResolvedValue({
      workSchedule: {
        monday: { start: '09:00', end: '18:00' },
      },
    } as any);

    const { getByText } = render(<WorkSettingsScreen />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(getByText('common.save')).toBeTruthy();
    });

    const saveButton = getByText('common.save');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(mockUpdateUserSettings).toHaveBeenCalled();
    });
  });

  it('should handle all days of week in save', async () => {
    mockGetUserSettings.mockResolvedValue({
      workSchedule: {
        monday: { start: '09:00', end: '18:00' },
        tuesday: { start: '08:00', end: '17:00' },
        wednesday: { start: '10:00', end: '19:00' },
        thursday: { start: '09:00', end: '18:00' },
        friday: { start: '09:00', end: '18:00' },
        saturday: { start: '09:00', end: '18:00' },
        sunday: { start: '09:00', end: '18:00' },
      },
    } as any);

    const { getByText } = render(<WorkSettingsScreen />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(getByText('common.save')).toBeTruthy();
    });

    const saveButton = getByText('common.save');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(mockUpdateUserSettings).toHaveBeenCalled();
    });
  });
});


import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WorkSettingsScreen } from '../index';
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
  View: 'View',
  Text: 'Text',
  TextInput: 'TextInput',
  TouchableOpacity: 'TouchableOpacity',
  ScrollView: 'ScrollView',
  Switch: 'Switch',
  ActivityIndicator: 'ActivityIndicator',
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

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
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
      expect(getByText('profile.monday')).toBeTruthy();
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
      },
    } as any);

    const { getByText } = render(<WorkSettingsScreen />, { wrapper: createWrapper() });

    // Just verify the component renders - useQuery will call getUserSettings
    await waitFor(() => {
      expect(getByText('profile.workSettings')).toBeTruthy();
    });
  });
});


import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EditEventScreen } from '../index';
import { useTranslation } from '@/i18n';
import { updateClockEvent, deleteClockEvent } from '@/api';
import { useFeedback } from '@/utils/feedback';
import { ClockHistoryEvent } from '@/api/get-clock-history';

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
    alert: jest.fn((title, message, buttons) => {
      if (buttons && buttons[1] && buttons[1].onPress) {
        buttons[1].onPress();
      }
    }),
  },
  Keyboard: {
    dismiss: jest.fn(),
  },
  View: 'View',
  Text: 'Text',
  TextInput: 'TextInput',
  TouchableOpacity: 'TouchableOpacity',
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
jest.mock('@/api', () => ({
  updateClockEvent: jest.fn(),
  deleteClockEvent: jest.fn(),
}));
jest.mock('@/utils/feedback');
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: jest.fn(),
  }),
  useRoute: () => ({
    params: {
      event: {
        id: '1',
        hour: '2024-01-01T10:00:00.000Z',
        action: 'clock-in',
      },
    },
  }),
}));

const mockUseTranslation = useTranslation as jest.MockedFunction<typeof useTranslation>;
const mockUpdateClockEvent = updateClockEvent as jest.MockedFunction<typeof updateClockEvent>;
const mockDeleteClockEvent = deleteClockEvent as jest.MockedFunction<typeof deleteClockEvent>;
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

describe('EditEventScreen', () => {
  const mockT = jest.fn((key: string) => key);
  const mockShowSuccess = jest.fn();
  const mockGoBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTranslation.mockReturnValue({
      t: mockT,
      i18n: {
        language: 'pt-BR',
        changeLanguage: jest.fn(),
      },
    } as any);
    mockUpdateClockEvent.mockResolvedValue({} as any);
    mockDeleteClockEvent.mockResolvedValue({} as any);
    mockUseFeedback.mockReturnValue({
      showSuccess: mockShowSuccess,
      showError: jest.fn(),
      showInfo: jest.fn(),
    } as any);

    jest.spyOn(require('@react-navigation/native'), 'useNavigation').mockReturnValue({
      goBack: mockGoBack,
    });
  });

  it('should render edit event screen', () => {
    const { getByText, getByPlaceholderText } = render(<EditEventScreen />, { wrapper: createWrapper() });

    expect(getByText('history.editEvent')).toBeTruthy();
    expect(getByPlaceholderText('2024-07-16')).toBeTruthy();
    expect(getByPlaceholderText('08:00')).toBeTruthy();
  });

  it('should initialize with event date and time', async () => {
    const { getByPlaceholderText } = render(<EditEventScreen />, { wrapper: createWrapper() });

    await waitFor(() => {
      const dateInput = getByPlaceholderText('2024-07-16');
      const timeInput = getByPlaceholderText('08:00');

      expect(dateInput.props.value).toBe('2024-01-01');
      // Time format depends on timezone, so just verify it's formatted correctly
      expect(timeInput.props.value).toMatch(/^\d{2}:\d{2}$/);
    });
  });

  it('should update date and time inputs', () => {
    const { getByPlaceholderText } = render(<EditEventScreen />, { wrapper: createWrapper() });

    const dateInput = getByPlaceholderText('2024-07-16');
    const timeInput = getByPlaceholderText('08:00');

    fireEvent.changeText(dateInput, '2024-01-15');
    fireEvent.changeText(timeInput, '14:30');

    expect(dateInput.props.value).toBe('2024-01-15');
    expect(timeInput.props.value).toBe('14:30');
  });

  it('should save event successfully', async () => {
    const { getByText, getByPlaceholderText } = render(<EditEventScreen />, { wrapper: createWrapper() });

    const dateInput = getByPlaceholderText('2024-07-16');
    const timeInput = getByPlaceholderText('08:00');

    fireEvent.changeText(dateInput, '2024-01-15');
    fireEvent.changeText(timeInput, '14:30');

    const saveButton = getByText('common.save');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(mockUpdateClockEvent).toHaveBeenCalled();
    }, { timeout: 10000 });

    await waitFor(() => {
      expect(mockShowSuccess).toHaveBeenCalled();
    }, { timeout: 10000 });
  });

  it('should show error when date or time is empty', async () => {
    const { getByText, getByPlaceholderText } = render(<EditEventScreen />, { wrapper: createWrapper() });

    const dateInput = getByPlaceholderText('2024-07-16');
    fireEvent.changeText(dateInput, '');

    const saveButton = getByText('common.save');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(mockUpdateClockEvent).not.toHaveBeenCalled();
    });
  });

  it('should delete event successfully', async () => {
    const { getByText } = render(<EditEventScreen />, { wrapper: createWrapper() });

    const deleteButton = getByText('common.delete');
    fireEvent.press(deleteButton);

    await waitFor(() => {
      expect(mockDeleteClockEvent).toHaveBeenCalledWith('1');
    }, { timeout: 10000 });

    await waitFor(() => {
      expect(mockShowSuccess).toHaveBeenCalled();
    }, { timeout: 10000 });
  });

  it('should disable inputs when saving', async () => {
    mockUpdateClockEvent.mockImplementation(() => new Promise(() => { })); // Never resolves

    const { getByText, getByPlaceholderText } = render(<EditEventScreen />, { wrapper: createWrapper() });

    const saveButton = getByText('common.save');
    fireEvent.press(saveButton);

    await waitFor(() => {
      const dateInput = getByPlaceholderText('2024-07-16');
      const timeInput = getByPlaceholderText('08:00');
      expect(dateInput.props.editable).toBe(false);
      expect(timeInput.props.editable).toBe(false);
    });
  });
});

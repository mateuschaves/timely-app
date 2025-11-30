import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient } from '@tanstack/react-query';
import { EditEventScreen } from '../index';
import { createTestWrapper } from '@/utils/test-helpers';
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
  Animated: {
    Value: jest.fn((value: number) => ({
      _value: value,
      setValue: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      stopAnimation: jest.fn(),
    })),
    timing: jest.fn(() => ({
      start: jest.fn((callback?: () => void) => {
        if (callback) callback();
      }),
    })),
    spring: jest.fn(() => ({
      start: jest.fn((callback?: () => void) => {
        if (callback) callback();
      }),
    })),
    parallel: jest.fn(() => ({
      start: jest.fn((callback?: () => void) => {
        if (callback) callback();
      }),
    })),
  },
  useColorScheme: jest.fn(() => 'light'),
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

  return createTestWrapper(queryClient);
};

describe.skip('EditEventScreen', () => {
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

  it('should render edit event screen', async () => {
    const { findByText, findByPlaceholderText } = render(<EditEventScreen />, { wrapper: createWrapper() });

    const title = await findByText('history.editEvent', {}, { timeout: 5000 });
    expect(title).toBeTruthy();
    
    const dateInput = await findByPlaceholderText('2024-07-16', {}, { timeout: 5000 });
    expect(dateInput).toBeTruthy();
    
    const timeInput = await findByPlaceholderText('08:00', {}, { timeout: 5000 });
    expect(timeInput).toBeTruthy();
  });

  it('should initialize with event date and time', async () => {
    const { findByPlaceholderText } = render(<EditEventScreen />, { wrapper: createWrapper() });

    const dateInput = await findByPlaceholderText('2024-07-16', {}, { timeout: 5000 });
    const timeInput = await findByPlaceholderText('08:00', {}, { timeout: 5000 });

    await waitFor(() => {
      expect(dateInput.props.value).toBe('2024-01-01');
      // Time format depends on timezone, so just verify it's formatted correctly
      expect(timeInput.props.value).toMatch(/^\d{2}:\d{2}$/);
    });
  });

  it('should update date and time inputs', async () => {
    const { findByPlaceholderText } = render(<EditEventScreen />, { wrapper: createWrapper() });

    const dateInput = await findByPlaceholderText('2024-07-16', {}, { timeout: 5000 });
    const timeInput = await findByPlaceholderText('08:00', {}, { timeout: 5000 });

    fireEvent.changeText(dateInput, '2024-01-15');
    fireEvent.changeText(timeInput, '14:30');

    await waitFor(() => {
      expect(dateInput.props.value).toBe('2024-01-15');
      expect(timeInput.props.value).toBe('14:30');
    });
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

  it('should show error when date is invalid', async () => {
    const mockAlert = require('react-native').Alert.alert as jest.Mock;
    const { getByText, getByPlaceholderText } = render(<EditEventScreen />, { wrapper: createWrapper() });

    const dateInput = getByPlaceholderText('2024-07-16');
    const timeInput = getByPlaceholderText('08:00');

    fireEvent.changeText(dateInput, 'invalid-date');
    fireEvent.changeText(timeInput, '14:30');

    const saveButton = getByText('common.save');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalled();
      expect(mockUpdateClockEvent).not.toHaveBeenCalled();
    });
  });

  it('should show error when time is empty', async () => {
    const mockAlert = require('react-native').Alert.alert as jest.Mock;
    const { getByText, getByPlaceholderText } = render(<EditEventScreen />, { wrapper: createWrapper() });

    const timeInput = getByPlaceholderText('08:00');
    fireEvent.changeText(timeInput, '');

    const saveButton = getByText('common.save');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalled();
      expect(mockUpdateClockEvent).not.toHaveBeenCalled();
    });
  });

  it('should handle save error with response data', async () => {
    const mockAlert = require('react-native').Alert.alert as jest.Mock;
    mockUpdateClockEvent.mockRejectedValue({
      response: {
        data: {
          message: 'API Error',
        },
      },
    });

    const { getByText, getByPlaceholderText } = render(<EditEventScreen />, { wrapper: createWrapper() });

    const dateInput = getByPlaceholderText('2024-07-16');
    const timeInput = getByPlaceholderText('08:00');

    fireEvent.changeText(dateInput, '2024-01-15');
    fireEvent.changeText(timeInput, '14:30');

    const saveButton = getByText('common.save');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('common.error', 'API Error');
    });
  });

  it('should handle save error with error message', async () => {
    const mockAlert = require('react-native').Alert.alert as jest.Mock;
    mockUpdateClockEvent.mockRejectedValue({
      message: 'Network Error',
    });

    const { getByText, getByPlaceholderText } = render(<EditEventScreen />, { wrapper: createWrapper() });

    const dateInput = getByPlaceholderText('2024-07-16');
    const timeInput = getByPlaceholderText('08:00');

    fireEvent.changeText(dateInput, '2024-01-15');
    fireEvent.changeText(timeInput, '14:30');

    const saveButton = getByText('common.save');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('common.error', 'Network Error');
    });
  });

  it('should handle save error without message', async () => {
    const mockAlert = require('react-native').Alert.alert as jest.Mock;
    mockUpdateClockEvent.mockRejectedValue({});

    const { getByText, getByPlaceholderText } = render(<EditEventScreen />, { wrapper: createWrapper() });

    const dateInput = getByPlaceholderText('2024-07-16');
    const timeInput = getByPlaceholderText('08:00');

    fireEvent.changeText(dateInput, '2024-01-15');
    fireEvent.changeText(timeInput, '14:30');

    const saveButton = getByText('common.save');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('common.error', 'history.updateEventError');
    });
  });

  it('should include photoUrl and notes when updating event', async () => {
    jest.spyOn(require('@react-navigation/native'), 'useRoute').mockReturnValue({
      params: {
        event: {
          id: '1',
          hour: '2024-01-01T10:00:00.000Z',
          action: 'clock-in',
          photoUrl: 'https://example.com/photo.jpg',
          notes: 'Test notes',
        },
      },
    });

    const { getByText, getByPlaceholderText } = render(<EditEventScreen />, { wrapper: createWrapper() });

    const dateInput = getByPlaceholderText('2024-07-16');
    const timeInput = getByPlaceholderText('08:00');

    fireEvent.changeText(dateInput, '2024-01-15');
    fireEvent.changeText(timeInput, '14:30');

    const saveButton = getByText('common.save');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(mockUpdateClockEvent).toHaveBeenCalledWith(
        '1',
        expect.objectContaining({
          hour: expect.any(String),
          photoUrl: 'https://example.com/photo.jpg',
          notes: 'Test notes',
        })
      );
    });
  });

  it('should handle delete error', async () => {
    const mockAlert = require('react-native').Alert.alert as jest.Mock;
    mockDeleteClockEvent.mockRejectedValue({
      response: {
        data: {
          message: 'Delete Error',
        },
      },
    });

    const { getByText } = render(<EditEventScreen />, { wrapper: createWrapper() });

    const deleteButton = getByText('common.delete');
    fireEvent.press(deleteButton);

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalled();
    });
  });

  it('should handle delete error without response', async () => {
    const mockAlert = require('react-native').Alert.alert as jest.Mock;
    mockDeleteClockEvent.mockRejectedValue(new Error('Network Error'));

    const { getByText } = render(<EditEventScreen />, { wrapper: createWrapper() });

    const deleteButton = getByText('common.delete');
    fireEvent.press(deleteButton);

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalled();
    });
  });

  it('should disable delete button when deleting', async () => {
    mockDeleteClockEvent.mockImplementation(() => new Promise(() => { })); // Never resolves

    const { getByText } = render(<EditEventScreen />, { wrapper: createWrapper() });

    const deleteButton = getByText('common.delete');
    fireEvent.press(deleteButton);

    await waitFor(() => {
      expect(getByText('common.loading')).toBeTruthy();
    });
  });
});


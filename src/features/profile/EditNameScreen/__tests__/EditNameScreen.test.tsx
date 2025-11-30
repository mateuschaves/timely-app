import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient } from '@tanstack/react-query';
import { EditNameScreen } from '../index';
import { useTranslation } from '@/i18n';
import { useAuthContext } from '@/features/auth';
import { updateUserMe } from '@/api/update-user-me';
import { useFeedback } from '@/utils/feedback';
import { createTestWrapper } from '@/utils/test-helpers';

jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  NotificationFeedbackType: {
    Success: 'success',
  },
}));

// Mock auth context first to avoid importing LoginScreen which needs ActivityIndicator
jest.mock('@/features/auth', () => ({
  useAuthContext: jest.fn(),
}));


jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: 'SafeAreaView',
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
}));

jest.mock('@/i18n');
jest.mock('@/api/update-user-me');
jest.mock('@/utils/feedback');
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
    addListener: jest.fn(),
    removeListener: jest.fn(),
  }),
  useFocusEffect: (callback: () => void | (() => void)) => {
    const React = require('react');
    React.useEffect(() => {
      const cleanup = callback();
      return () => {
        if (typeof cleanup === 'function') {
          cleanup();
        }
      };
    }, []);
  },
}));
// Mock react-native - must include ActivityIndicator for styled-components
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
  ScrollView: 'ScrollView',
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
jest.mock('@react-native-async-storage/async-storage');
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

const mockUseTranslation = useTranslation as jest.MockedFunction<typeof useTranslation>;
const mockUseAuthContext = useAuthContext as jest.MockedFunction<typeof useAuthContext>;
const mockUpdateUserMe = updateUserMe as jest.MockedFunction<typeof updateUserMe>;
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

describe('EditNameScreen', () => {
  const mockT = jest.fn((key: string) => key);
  const mockFetchUserMe = jest.fn();
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
    mockUseAuthContext.mockReturnValue({
      user: {
        id: '123',
        email: 'test@example.com',
        name: 'Test User',
        appleUserId: 'apple123',
      },
      isAuthenticated: true,
      isLoading: false,
      signInWithApple: jest.fn(),
      signOut: jest.fn(),
      fetchUserMe: mockFetchUserMe,
    });
    mockUpdateUserMe.mockResolvedValue({} as any);
    mockUseFeedback.mockReturnValue({
      showSuccess: mockShowSuccess,
      showError: jest.fn(),
      showInfo: jest.fn(),
    } as any);
  });

  it('should render edit name screen', async () => {
    const { getByText, getByPlaceholderText } = render(<EditNameScreen />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(getByText('profile.editName')).toBeTruthy();
    });
    expect(getByPlaceholderText('profile.name')).toBeTruthy();
  });

  it('should update name input', () => {
    const { getByPlaceholderText } = render(<EditNameScreen />, { wrapper: createWrapper() });

    const input = getByPlaceholderText('profile.name');
    fireEvent.changeText(input, 'New Name');

    expect(input.props.value).toBe('New Name');
  });

  it('should save name successfully', async () => {
    const { getByText, getByPlaceholderText } = render(<EditNameScreen />, { wrapper: createWrapper() });

    const input = getByPlaceholderText('profile.name');
    fireEvent.changeText(input, 'New Name');

    const saveButton = getByText('common.save');
    fireEvent.press(saveButton);

    // Wait for the async operations to complete
    await waitFor(() => {
      expect(mockUpdateUserMe).toHaveBeenCalledWith({ name: 'New Name' });
    }, { timeout: 10000 });

    await waitFor(() => {
      expect(mockFetchUserMe).toHaveBeenCalled();
    }, { timeout: 10000 });

    await waitFor(() => {
      expect(mockShowSuccess).toHaveBeenCalled();
    }, { timeout: 10000 });
  }, 15000);

  it('should show error when name is empty', async () => {
    const mockAlert = require('react-native').Alert.alert as jest.Mock;
    const { getByText, getByPlaceholderText } = render(<EditNameScreen />, { wrapper: createWrapper() });

    const input = getByPlaceholderText('profile.name');
    fireEvent.changeText(input, '   ');

    const saveButton = getByText('common.save');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalled();
      expect(mockUpdateUserMe).not.toHaveBeenCalled();
    });
  });

  it('should navigate back when name has not changed', async () => {
    const mockGoBack = jest.fn();
    jest.spyOn(require('@react-navigation/native'), 'useNavigation').mockReturnValue({
      goBack: mockGoBack,
    });

    const { getByText } = render(<EditNameScreen />, { wrapper: createWrapper() });

    const saveButton = getByText('common.save');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(mockUpdateUserMe).not.toHaveBeenCalled();
      expect(mockGoBack).toHaveBeenCalled();
    });
  });

  it('should handle save error with response data', async () => {
    const mockAlert = require('react-native').Alert.alert as jest.Mock;
    mockUpdateUserMe.mockRejectedValue({
      response: {
        data: {
          message: 'API Error',
        },
      },
    });

    const { getByText, getByPlaceholderText } = render(<EditNameScreen />, { wrapper: createWrapper() });

    const input = getByPlaceholderText('profile.name');
    fireEvent.changeText(input, 'New Name');

    const saveButton = getByText('common.save');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('common.error', 'API Error');
    });
  });

  it('should handle save error with error message', async () => {
    const mockAlert = require('react-native').Alert.alert as jest.Mock;
    mockUpdateUserMe.mockRejectedValue({
      message: 'Network Error',
    });

    const { getByText, getByPlaceholderText } = render(<EditNameScreen />, { wrapper: createWrapper() });

    const input = getByPlaceholderText('profile.name');
    fireEvent.changeText(input, 'New Name');

    const saveButton = getByText('common.save');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('common.error', 'Network Error');
    });
  });

  it('should handle save error without message', async () => {
    const mockAlert = require('react-native').Alert.alert as jest.Mock;
    mockUpdateUserMe.mockRejectedValue({});

    const { getByText, getByPlaceholderText } = render(<EditNameScreen />, { wrapper: createWrapper() });

    const input = getByPlaceholderText('profile.name');
    fireEvent.changeText(input, 'New Name');

    const saveButton = getByText('common.save');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(mockAlert).toHaveBeenCalledWith('common.error', 'profile.updateNameError');
    });
  });

  it('should update name when user changes', async () => {
    const { getByPlaceholderText, rerender } = render(<EditNameScreen />, { wrapper: createWrapper() });

    const input = getByPlaceholderText('profile.name');
    expect(input.props.value).toBe('Test User');

    mockUseAuthContext.mockReturnValue({
      user: {
        id: '123',
        email: 'test@example.com',
        name: 'Updated Name',
        appleUserId: 'apple123',
      },
      isAuthenticated: true,
      isLoading: false,
      signInWithApple: jest.fn(),
      signOut: jest.fn(),
      fetchUserMe: mockFetchUserMe,
    });

    rerender(<EditNameScreen />);

    await waitFor(() => {
      const updatedInput = getByPlaceholderText('profile.name');
      expect(updatedInput.props.value).toBe('Updated Name');
    });
  });

  it('should handle back button press', async () => {
    const mockGoBack = jest.fn();
    jest.spyOn(require('@react-navigation/native'), 'useNavigation').mockReturnValue({
      goBack: mockGoBack,
    });

    const { UNSAFE_getAllByType } = render(<EditNameScreen />, { wrapper: createWrapper() });

    const touchables = UNSAFE_getAllByType('TouchableOpacity');
    const backButton = touchables.find((btn: any) => 
      btn.props.onPress && btn.props.children?.props?.name === 'arrow-back'
    );
    
    if (backButton) {
      fireEvent.press(backButton);
      expect(mockGoBack).toHaveBeenCalled();
    }
  });

  it('should disable input when saving', async () => {
    mockUpdateUserMe.mockImplementation(() => new Promise(() => {})); // Never resolves

    const { getByText, getByPlaceholderText } = render(<EditNameScreen />, { wrapper: createWrapper() });

    const input = getByPlaceholderText('profile.name');
    fireEvent.changeText(input, 'New Name');

    const saveButton = getByText('common.save');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(getByText('common.loading')).toBeTruthy();
      expect(input.props.editable).toBe(false);
    });
  });
});

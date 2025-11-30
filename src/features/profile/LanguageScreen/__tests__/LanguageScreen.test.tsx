import React from 'react';
import { render, fireEvent } from '@testing-library/react-native';
import { QueryClient } from '@tanstack/react-query';
import { LanguageScreen } from '../index';
import { createTestWrapper } from '@/utils/test-helpers';
import { useTranslation, useLanguage } from '@/i18n';
import { useFeedback } from '@/utils/feedback';

jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  NotificationFeedbackType: {
    Success: 'success',
  },
}));

jest.mock('@/i18n');
jest.mock('@/utils/feedback');
jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));
jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: 'SafeAreaView',
  SafeAreaProvider: ({ children }: { children: React.ReactNode }) => children,
}));
jest.mock('react-native', () => ({
  Platform: {
    OS: 'ios',
    select: jest.fn(),
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
  TouchableOpacity: 'TouchableOpacity',
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
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: jest.fn(),
  }),
}));

const mockUseTranslation = useTranslation as jest.MockedFunction<typeof useTranslation>;
const mockUseLanguage = useLanguage as jest.MockedFunction<typeof useLanguage>;
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

describe('LanguageScreen', () => {
  const mockT = jest.fn((key: string) => key);
  const mockChangeLanguage = jest.fn();
  const mockShowSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock AsyncStorage to resolve immediately for theme initialization
    (require('@react-native-async-storage/async-storage').default.getItem as jest.Mock).mockResolvedValue(null);
    mockUseTranslation.mockReturnValue({
      t: mockT,
      i18n: {
        language: 'pt-BR',
        changeLanguage: jest.fn(),
      },
    } as any);
    mockUseLanguage.mockReturnValue({
      currentLanguage: 'pt-BR',
      activeLanguage: 'pt-BR',
      isLoading: false,
      changeLanguage: mockChangeLanguage,
    } as any);
    mockUseFeedback.mockReturnValue({
      showSuccess: mockShowSuccess,
      showError: jest.fn(),
      showInfo: jest.fn(),
    } as any);
  });

  it('should render language screen', () => {
    const { getByText } = render(<LanguageScreen />, { wrapper: createWrapper() });

    expect(getByText('profile.language')).toBeTruthy();
  });

  it('should change language when option is selected', () => {
    const { getByText } = render(<LanguageScreen />, { wrapper: createWrapper() });

    const englishOption = getByText('profile.languageEnglish');
    fireEvent.press(englishOption);

    expect(mockChangeLanguage).toHaveBeenCalledWith('en-US');
    expect(mockShowSuccess).toHaveBeenCalled();
  });

  it('should not change language if same option is selected', () => {
    const { getByText } = render(<LanguageScreen />, { wrapper: createWrapper() });

    const portugueseOption = getByText('profile.languagePortuguese');
    fireEvent.press(portugueseOption);

    expect(mockChangeLanguage).not.toHaveBeenCalled();
  });
});

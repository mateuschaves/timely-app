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
jest.mock('react-native', () => ({
  useColorScheme: jest.fn(() => 'light'),
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

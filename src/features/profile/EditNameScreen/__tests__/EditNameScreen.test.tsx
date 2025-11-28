import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { EditNameScreen } from '../index';
import { useTranslation } from '@/i18n';
import { useAuthContext } from '@/features/auth';
import { updateUserMe } from '@/api/update-user-me';
import { useFeedback } from '@/utils/feedback';

jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  NotificationFeedbackType: {
    Success: 'success',
  },
}));

jest.mock('@/i18n');
jest.mock('@/features/auth');
jest.mock('@/api/update-user-me');
jest.mock('@/utils/feedback');
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    goBack: jest.fn(),
  }),
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

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
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

  it('should render edit name screen', () => {
    const { getByText, getByPlaceholderText } = render(<EditNameScreen />, { wrapper: createWrapper() });

    expect(getByText('profile.editName')).toBeTruthy();
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

    await waitFor(() => {
      expect(mockUpdateUserMe).toHaveBeenCalledWith({ name: 'New Name' });
      expect(mockFetchUserMe).toHaveBeenCalled();
      expect(mockShowSuccess).toHaveBeenCalled();
    });
  });

  it('should show error when name is empty', async () => {
    const { getByText, getByPlaceholderText } = render(<EditNameScreen />, { wrapper: createWrapper() });

    const input = getByPlaceholderText('profile.name');
    fireEvent.changeText(input, '   ');

    const saveButton = getByText('common.save');
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(mockUpdateUserMe).not.toHaveBeenCalled();
    });
  });
});

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { Alert } from 'react-native';
import { AddAbsenceScreen } from '../index';
import { useCreateAbsence } from '@/features/absences/hooks/useAbsences';
import { createTestWrapper } from '@/utils/test-helpers';

jest.mock('@/features/absences/hooks/useAbsences');
jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  NotificationFeedbackType: {
    Success: 'success',
  },
}));
jest.mock('@react-navigation/native', () => ({
  useNavigation: () => ({
    navigate: jest.fn(),
    goBack: jest.fn(),
  }),
  useRoute: () => ({
    params: {
      date: '2024-07-16',
    },
  }),
}));

const mockUseCreateAbsence = useCreateAbsence as jest.MockedFunction<typeof useCreateAbsence>;

describe('AddAbsenceScreen', () => {
  const mockMutate = jest.fn();
  const mockGoBack = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(Alert, 'alert');
    
    mockUseCreateAbsence.mockReturnValue({
      mutate: mockMutate,
      isPending: false,
      isSuccess: false,
      isError: false,
      data: undefined,
      error: null,
      reset: jest.fn(),
      mutateAsync: jest.fn(),
      variables: undefined,
      context: undefined,
      failureCount: 0,
      failureReason: null,
      status: 'idle',
      submittedAt: 0,
    } as any);

    require('@react-navigation/native').useNavigation = jest.fn(() => ({
      navigate: jest.fn(),
      goBack: mockGoBack,
    }));
  });

  it('should render absence form', () => {
    const TestWrapper = createTestWrapper();
    const { getByText } = render(
      <TestWrapper>
        <AddAbsenceScreen />
      </TestWrapper>
    );

    expect(getByText(/justificativa|absence/i)).toBeTruthy();
  });

  it('should show error when reason is empty', async () => {
    const TestWrapper = createTestWrapper();
    const { getByText } = render(
      <TestWrapper>
        <AddAbsenceScreen />
      </TestWrapper>
    );

    const saveButton = getByText(/salvar|save/i);
    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(Alert.alert).toHaveBeenCalled();
    });

    expect(mockMutate).not.toHaveBeenCalled();
  });

  it('should show loading state during submission', () => {
    mockUseCreateAbsence.mockReturnValue({
      mutate: mockMutate,
      isPending: true,
      isSuccess: false,
      isError: false,
      data: undefined,
      error: null,
      reset: jest.fn(),
      mutateAsync: jest.fn(),
      variables: undefined,
      context: undefined,
      failureCount: 0,
      failureReason: null,
      status: 'pending',
      submittedAt: Date.now(),
    } as any);

    const TestWrapper = createTestWrapper();
    const { getByText } = render(
      <TestWrapper>
        <AddAbsenceScreen />
      </TestWrapper>
    );

    expect(getByText(/carregando|loading/i)).toBeTruthy();
  });

  it('should have date pre-filled from route params', () => {
    require('@react-navigation/native').useRoute = jest.fn(() => ({
      params: {
        date: '2024-07-16',
      },
    }));

    const TestWrapper = createTestWrapper();
    const { getByText } = render(
      <TestWrapper>
        <AddAbsenceScreen />
      </TestWrapper>
    );

    // The date should be displayed somewhere in the component
    expect(getByText(/16|julho|july/i)).toBeTruthy();
  });
});

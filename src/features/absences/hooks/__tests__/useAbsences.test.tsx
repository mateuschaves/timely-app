import { renderHook, waitFor, act } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useAbsences, useCreateAbsence } from '../useAbsences';
import { getAbsences } from '@/api/get-absences';
import { createAbsence } from '@/api/create-absence';

jest.mock('@/api/get-absences');
jest.mock('@/api/create-absence');

const mockGetAbsences = getAbsences as jest.MockedFunction<typeof getAbsences>;
const mockCreateAbsence = createAbsence as jest.MockedFunction<typeof createAbsence>;

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

describe('useAbsences', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch absences successfully', async () => {
    const mockParams = {
      startDate: '2024-07-01',
      endDate: '2024-07-31',
    };

    const mockResponse = {
      data: [
        {
          date: '2024-07-16',
          absences: [
            {
              id: 'abc123',
              userId: 'user123',
              reason: 'Consulta médica',
              description: 'Consulta agendada',
              createdAt: '2024-07-16T10:00:00Z',
              updatedAt: '2024-07-16T10:00:00Z',
            },
          ],
        },
      ],
    };

    mockGetAbsences.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAbsences(mockParams), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockResponse);
    });

    expect(mockGetAbsences).toHaveBeenCalledWith(mockParams);
  });

  it('should handle empty absences', async () => {
    const mockParams = {
      startDate: '2024-08-01',
      endDate: '2024-08-31',
    };

    const mockResponse = {
      data: [],
    };

    mockGetAbsences.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useAbsences(mockParams), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(mockResponse);
      expect(result.current.data?.data).toHaveLength(0);
    });
  });

  it('should handle fetch errors', async () => {
    const mockParams = {
      startDate: '2024-07-01',
      endDate: '2024-07-31',
    };

    mockGetAbsences.mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useAbsences(mockParams), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await waitFor(() => {
      expect(result.current.error).toBeTruthy();
    });
  });
});

describe('useCreateAbsence', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create absence successfully', async () => {
    const mockRequest = {
      date: '2024-07-16',
      reason: 'Consulta médica',
      description: 'Consulta agendada',
    };

    const mockResponse = {
      id: 'abc123',
      userId: 'user123',
      date: '2024-07-16',
      reason: 'Consulta médica',
      description: 'Consulta agendada',
      createdAt: '2024-07-16T10:00:00Z',
      updatedAt: '2024-07-16T10:00:00Z',
    };

    mockCreateAbsence.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useCreateAbsence(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate(mockRequest);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockCreateAbsence).toHaveBeenCalled();
    const callArgs = (mockCreateAbsence as jest.Mock).mock.calls[0][0];
    expect(callArgs).toMatchObject(mockRequest);
    expect(result.current.data).toEqual(mockResponse);
  });

  it('should create absence without description', async () => {
    const mockRequest = {
      date: '2024-07-16',
      reason: 'Consulta médica',
    };

    const mockResponse = {
      id: 'abc123',
      userId: 'user123',
      date: '2024-07-16',
      reason: 'Consulta médica',
      createdAt: '2024-07-16T10:00:00Z',
      updatedAt: '2024-07-16T10:00:00Z',
    };

    mockCreateAbsence.mockResolvedValue(mockResponse);

    const { result } = renderHook(() => useCreateAbsence(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate(mockRequest);
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    expect(mockCreateAbsence).toHaveBeenCalled();
    const callArgs = (mockCreateAbsence as jest.Mock).mock.calls[0][0];
    expect(callArgs).toMatchObject(mockRequest);
  });

  it('should handle creation errors', async () => {
    const mockRequest = {
      date: '2024-07-16',
      reason: 'Consulta médica',
    };

    mockCreateAbsence.mockRejectedValue(
      new Error('Clock records already exist for this date')
    );

    const { result } = renderHook(() => useCreateAbsence(), {
      wrapper: createWrapper(),
    });

    await act(async () => {
      result.current.mutate(mockRequest);
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });

    expect(result.current.error).toBeTruthy();
  });

  it('should have isPending state during mutation', async () => {
    const mockRequest = {
      date: '2024-07-16',
      reason: 'Consulta médica',
    };

    let resolvePromise: (value: any) => void;
    const promise = new Promise((resolve) => {
      resolvePromise = resolve;
    });

    mockCreateAbsence.mockReturnValue(promise as any);

    const { result } = renderHook(() => useCreateAbsence(), {
      wrapper: createWrapper(),
    });

    act(() => {
      result.current.mutate(mockRequest);
    });

    // Wait for the mutation to start
    await waitFor(() => {
      expect(result.current.isPending).toBe(true);
    });

    // Resolve the promise
    act(() => {
      resolvePromise!({
        id: 'abc123',
        userId: 'user123',
        date: '2024-07-16',
        reason: 'Consulta médica',
        createdAt: '2024-07-16T10:00:00Z',
        updatedAt: '2024-07-16T10:00:00Z',
      });
    });

    await waitFor(() => {
      expect(result.current.isSuccess).toBe(true);
    });

    // Check isPending is false after completion
    expect(result.current.isPending).toBe(false);
  });
});

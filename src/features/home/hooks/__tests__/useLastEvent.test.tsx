import { renderHook, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import { useLastEvent } from '../useLastEvent';
import { getClockHistory } from '@/api/get-clock-history';
import { ClockAction } from '@/api/types';

jest.mock('@/api/get-clock-history');

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useLastEvent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return null when no events exist', async () => {
    (getClockHistory as jest.Mock).mockResolvedValue({
      data: [],
      summary: {
        totalWorkedHours: 0,
        totalWorkedHoursFormatted: '00:00',
        totalExpectedHours: 0,
        totalExpectedHoursFormatted: '00:00',
        hoursDifference: 0,
        hoursDifferenceFormatted: '00:00',
        status: 'exact',
        daysWorked: 0,
        daysWithSchedule: 0,
        averageHoursPerDay: 0,
        averageHoursPerDayFormatted: '00:00',
        totalDays: 0,
      },
    });

    const { result } = renderHook(() => useLastEvent(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.lastEvent).toBeNull();
    expect(result.current.nextAction).toBe(ClockAction.CLOCK_IN);
  });

  it('should return last event and next action as clock-out when last was clock-in', async () => {
    const mockData = {
      data: [
        {
          date: '2024-01-01',
          totalHours: 8,
          totalWorkedTime: '08:00',
          events: [
            {
              id: '1',
              userId: 'user123',
              hour: '2024-01-01T08:00:00Z',
              action: ClockAction.CLOCK_IN,
              createdAt: '2024-01-01T08:00:00Z',
              updatedAt: '2024-01-01T08:00:00Z',
            },
          ],
        },
      ],
      summary: {
        totalWorkedHours: 8,
        totalWorkedHoursFormatted: '08:00',
        totalExpectedHours: 8,
        totalExpectedHoursFormatted: '08:00',
        hoursDifference: 0,
        hoursDifferenceFormatted: '00:00',
        status: 'exact',
        daysWorked: 1,
        daysWithSchedule: 1,
        averageHoursPerDay: 8,
        averageHoursPerDayFormatted: '08:00',
        totalDays: 1,
      },
    };

    (getClockHistory as jest.Mock).mockResolvedValue(mockData);

    const { result } = renderHook(() => useLastEvent(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.lastEvent).not.toBeNull();
    expect(result.current.lastEvent?.action).toBe(ClockAction.CLOCK_IN);
    expect(result.current.nextAction).toBe(ClockAction.CLOCK_OUT);
  });

  it('should return next action as clock-in when last was clock-out', async () => {
    const mockData = {
      data: [
        {
          date: '2024-01-01',
          totalHours: 8,
          totalWorkedTime: '08:00',
          events: [
            {
              id: '1',
              userId: 'user123',
              hour: '2024-01-01T18:00:00Z',
              action: ClockAction.CLOCK_OUT,
              createdAt: '2024-01-01T18:00:00Z',
              updatedAt: '2024-01-01T18:00:00Z',
            },
          ],
        },
      ],
      summary: {
        totalWorkedHours: 8,
        totalWorkedHoursFormatted: '08:00',
        totalExpectedHours: 8,
        totalExpectedHoursFormatted: '08:00',
        hoursDifference: 0,
        hoursDifferenceFormatted: '00:00',
        status: 'exact',
        daysWorked: 1,
        daysWithSchedule: 1,
        averageHoursPerDay: 8,
        averageHoursPerDayFormatted: '08:00',
        totalDays: 1,
      },
    };

    (getClockHistory as jest.Mock).mockResolvedValue(mockData);

    const { result } = renderHook(() => useLastEvent(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.lastEvent).not.toBeNull();
    expect(result.current.lastEvent?.action).toBe(ClockAction.CLOCK_OUT);
    expect(result.current.nextAction).toBe(ClockAction.CLOCK_IN);
  });

  it('should sort events by date and return the most recent', async () => {
    const mockData = {
      data: [
        {
          date: '2024-01-01',
          totalHours: 8,
          totalWorkedTime: '08:00',
          events: [
            {
              id: '1',
              userId: 'user123',
              hour: '2024-01-01T08:00:00Z',
              action: ClockAction.CLOCK_IN,
              createdAt: '2024-01-01T08:00:00Z',
              updatedAt: '2024-01-01T08:00:00Z',
            },
          ],
        },
        {
          date: '2024-01-02',
          totalHours: 8,
          totalWorkedTime: '08:00',
          events: [
            {
              id: '2',
              userId: 'user123',
              hour: '2024-01-02T18:00:00Z',
              action: ClockAction.CLOCK_OUT,
              createdAt: '2024-01-02T18:00:00Z',
              updatedAt: '2024-01-02T18:00:00Z',
            },
          ],
        },
      ],
      summary: {
        totalWorkedHours: 16,
        totalWorkedHoursFormatted: '16:00',
        totalExpectedHours: 16,
        totalExpectedHoursFormatted: '16:00',
        hoursDifference: 0,
        hoursDifferenceFormatted: '00:00',
        status: 'exact',
        daysWorked: 2,
        daysWithSchedule: 2,
        averageHoursPerDay: 8,
        averageHoursPerDayFormatted: '08:00',
        totalDays: 2,
      },
    };

    (getClockHistory as jest.Mock).mockResolvedValue(mockData);

    const { result } = renderHook(() => useLastEvent(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.lastEvent).not.toBeNull();
    expect(result.current.lastEvent?.id).toBe('2');
    expect(result.current.lastEvent?.action).toBe(ClockAction.CLOCK_OUT);
  });
});

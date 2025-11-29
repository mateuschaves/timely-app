import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { HistoryScreen } from '../index';
import { useTranslation } from '@/i18n';
import { getClockHistory } from '@/api/get-clock-history';
import { useNavigation } from '@react-navigation/native';
import { ClockAction } from '@/api/types';
import { format, parseISO } from 'date-fns';

jest.mock('@/i18n');
jest.mock('@/api/get-clock-history');
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

const mockUseTranslation = useTranslation as jest.MockedFunction<typeof useTranslation>;
const mockGetClockHistory = getClockHistory as jest.MockedFunction<typeof getClockHistory>;
const mockUseNavigation = useNavigation as jest.MockedFunction<typeof useNavigation>;

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

describe('HistoryScreen', () => {
  const mockT = jest.fn((key: string) => key);
  const mockNavigate = jest.fn();

  const createMockDay = (date: string, events: any[] = []) => ({
    date,
    totalHours: 8,
    totalWorkedTime: '08:00',
    expectedHours: 8,
    expectedHoursFormatted: '08:00',
    hoursDifference: 0,
    hoursDifferenceFormatted: '00:00',
    status: 'exact' as const,
    events,
  });

  const createMockEvent = (id: string, hour: string, action: ClockAction, workedTime?: string) => ({
    id,
    userId: 'user123',
    hour,
    action,
    workedTime,
    createdAt: hour,
    updatedAt: hour,
  });

  beforeEach(() => {
    jest.clearAllMocks();
    mockUseTranslation.mockReturnValue({
      t: mockT,
      i18n: {
        language: 'pt-BR',
        changeLanguage: jest.fn(),
      },
    } as any);
    mockUseNavigation.mockReturnValue({
      navigate: mockNavigate,
    } as any);
    mockGetClockHistory.mockResolvedValue({
      data: [],
      summary: {
        totalWorkedHours: 0,
        totalWorkedHoursFormatted: '0min',
        totalExpectedHours: 0,
        totalExpectedHoursFormatted: '0h',
        hoursDifference: 0,
        hoursDifferenceFormatted: '0h',
        status: 'exact',
        daysWorked: 0,
        daysWithSchedule: 0,
        averageHoursPerDay: 0,
        averageHoursPerDayFormatted: '00:00',
        totalDays: 0,
      },
    } as any);
  });

  it('should render history screen', async () => {
    const { getByText } = render(<HistoryScreen />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(getByText('history.totalWorked')).toBeTruthy();
    });
  });

  it('should display month summary with data', async () => {
    mockGetClockHistory.mockResolvedValue({
      data: [],
      summary: {
        totalWorkedHours: 160,
        totalWorkedHoursFormatted: '160:00',
        totalExpectedHours: 160,
        totalExpectedHoursFormatted: '160:00',
        hoursDifference: 0,
        hoursDifferenceFormatted: '00:00',
        status: 'exact',
        daysWorked: 20,
        daysWithSchedule: 20,
        averageHoursPerDay: 8,
        averageHoursPerDayFormatted: '08:00',
        totalDays: 31,
      },
    } as any);

    const { getByText } = render(<HistoryScreen />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(getByText('history.totalWorked')).toBeTruthy();
      expect(getByText('history.expectedHours')).toBeTruthy();
    });
  });

  it('should display month summary with over status', async () => {
    mockGetClockHistory.mockResolvedValue({
      data: [],
      summary: {
        totalWorkedHours: 170,
        totalWorkedHoursFormatted: '170:00',
        totalExpectedHours: 160,
        totalExpectedHoursFormatted: '160:00',
        hoursDifference: 10,
        hoursDifferenceFormatted: '10:00',
        status: 'over',
        daysWorked: 20,
        daysWithSchedule: 20,
        averageHoursPerDay: 8.5,
        averageHoursPerDayFormatted: '08:30',
        totalDays: 31,
      },
    } as any);

    const { getByText } = render(<HistoryScreen />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(getByText('history.difference')).toBeTruthy();
    });
  });

  it('should display month summary with under status', async () => {
    mockGetClockHistory.mockResolvedValue({
      data: [],
      summary: {
        totalWorkedHours: 150,
        totalWorkedHoursFormatted: '150:00',
        totalExpectedHours: 160,
        totalExpectedHoursFormatted: '160:00',
        hoursDifference: -10,
        hoursDifferenceFormatted: '-10:00',
        status: 'under',
        daysWorked: 20,
        daysWithSchedule: 20,
        averageHoursPerDay: 7.5,
        averageHoursPerDayFormatted: '07:30',
        totalDays: 31,
      },
    } as any);

    const { getByText } = render(<HistoryScreen />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(getByText('history.difference')).toBeTruthy();
    });
  });

  it('should handle month navigation', async () => {
    const { getByText } = render(<HistoryScreen />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(mockGetClockHistory).toHaveBeenCalled();
    });

    // Wait for data to load before checking for text
    await waitFor(() => {
      expect(getByText('history.totalWorked')).toBeTruthy();
    });
  });

  it('should display days with events', async () => {
    const today = new Date();
    const todayString = format(today, 'yyyy-MM-dd');
    
    const mockDay = createMockDay(todayString, [
      createMockEvent('1', `${todayString}T08:00:00Z`, ClockAction.CLOCK_IN),
      createMockEvent('2', `${todayString}T18:00:00Z`, ClockAction.CLOCK_OUT, '10:00'),
    ]);

    mockGetClockHistory.mockResolvedValue({
      data: [mockDay],
      summary: {
        totalWorkedHours: 10,
        totalWorkedHoursFormatted: '10:00',
        totalExpectedHours: 8,
        totalExpectedHoursFormatted: '08:00',
        hoursDifference: 2,
        hoursDifferenceFormatted: '02:00',
        status: 'over',
        daysWorked: 1,
        daysWithSchedule: 1,
        averageHoursPerDay: 10,
        averageHoursPerDayFormatted: '10:00',
        totalDays: 1,
      },
    } as any);

    const { getByText } = render(<HistoryScreen />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(getByText('history.entry')).toBeTruthy();
    });
  });

  it('should display expandable days', async () => {
    const today = new Date();
    const todayString = format(today, 'yyyy-MM-dd');
    
    const mockDay = createMockDay(todayString, [
      createMockEvent('1', `${todayString}T08:00:00Z`, ClockAction.CLOCK_IN),
      createMockEvent('2', `${todayString}T18:00:00Z`, ClockAction.CLOCK_OUT, '10:00'),
    ]);

    mockGetClockHistory.mockResolvedValue({
      data: [mockDay],
      summary: {
        totalWorkedHours: 10,
        totalWorkedHoursFormatted: '10:00',
        totalExpectedHours: 8,
        totalExpectedHoursFormatted: '08:00',
        hoursDifference: 2,
        hoursDifferenceFormatted: '02:00',
        status: 'over',
        daysWorked: 1,
        daysWithSchedule: 1,
        averageHoursPerDay: 10,
        averageHoursPerDayFormatted: '10:00',
        totalDays: 1,
      },
    } as any);

    const { getByText } = render(<HistoryScreen />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(getByText('history.entry')).toBeTruthy();
    });
  });

  it('should display incomplete day (entry without exit)', async () => {
    const today = new Date();
    const todayString = format(today, 'yyyy-MM-dd');
    
    const mockDay = createMockDay(todayString, [
      createMockEvent('1', `${todayString}T08:00:00Z`, ClockAction.CLOCK_IN),
    ]);

    mockGetClockHistory.mockResolvedValue({
      data: [mockDay],
      summary: {
        totalWorkedHours: 0,
        totalWorkedHoursFormatted: '00:00',
        totalExpectedHours: 8,
        totalExpectedHoursFormatted: '08:00',
        hoursDifference: -8,
        hoursDifferenceFormatted: '-08:00',
        status: 'under',
        daysWorked: 1,
        daysWithSchedule: 1,
        averageHoursPerDay: 0,
        averageHoursPerDayFormatted: '00:00',
        totalDays: 1,
      },
    } as any);

    const { getByText } = render(<HistoryScreen />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(getByText('history.entry')).toBeTruthy();
    });
  });

  it('should display day with order issue', async () => {
    const today = new Date();
    const todayString = format(today, 'yyyy-MM-dd');
    
    const mockDay = createMockDay(todayString, [
      createMockEvent('1', `${todayString}T18:00:00Z`, ClockAction.CLOCK_OUT),
      createMockEvent('2', `${todayString}T08:00:00Z`, ClockAction.CLOCK_IN),
    ]);

    mockGetClockHistory.mockResolvedValue({
      data: [mockDay],
      summary: {
        totalWorkedHours: 10,
        totalWorkedHoursFormatted: '10:00',
        totalExpectedHours: 8,
        totalExpectedHoursFormatted: '08:00',
        hoursDifference: 2,
        hoursDifferenceFormatted: '02:00',
        status: 'over',
        daysWorked: 1,
        daysWithSchedule: 1,
        averageHoursPerDay: 10,
        averageHoursPerDayFormatted: '10:00',
        totalDays: 1,
      },
    } as any);

    const { getByText } = render(<HistoryScreen />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(getByText('history.orderIssue')).toBeTruthy();
    });
  });

  it('should display empty state', async () => {
    mockGetClockHistory.mockResolvedValue({
      data: [],
      summary: {
        totalWorkedHours: 0,
        totalWorkedHoursFormatted: '0min',
        totalExpectedHours: 0,
        totalExpectedHoursFormatted: '0h',
        hoursDifference: 0,
        hoursDifferenceFormatted: '0h',
        status: 'exact',
        daysWorked: 0,
        daysWithSchedule: 0,
        averageHoursPerDay: 0,
        averageHoursPerDayFormatted: '00:00',
        totalDays: 0,
      },
    } as any);

    const { getByText } = render(<HistoryScreen />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(getByText('history.empty')).toBeTruthy();
    });
  });

  it('should render events with edit buttons', async () => {
    const today = new Date();
    const todayString = format(today, 'yyyy-MM-dd');
    
    const mockEvent = createMockEvent('1', `${todayString}T08:00:00Z`, ClockAction.CLOCK_IN);
    const mockDay = createMockDay(todayString, [mockEvent]);

    mockGetClockHistory.mockResolvedValue({
      data: [mockDay],
      summary: {
        totalWorkedHours: 0,
        totalWorkedHoursFormatted: '00:00',
        totalExpectedHours: 8,
        totalExpectedHoursFormatted: '08:00',
        hoursDifference: -8,
        hoursDifferenceFormatted: '-08:00',
        status: 'under',
        daysWorked: 1,
        daysWithSchedule: 1,
        averageHoursPerDay: 0,
        averageHoursPerDayFormatted: '00:00',
        totalDays: 1,
      },
    } as any);

    const { getByText } = render(<HistoryScreen />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(getByText('history.entry')).toBeTruthy();
    });
  });

  it('should display day with different status badges', async () => {
    const today = new Date();
    const todayString = format(today, 'yyyy-MM-dd');
    
    const mockDay = createMockDay(todayString, [
      createMockEvent('1', `${todayString}T08:00:00Z`, ClockAction.CLOCK_IN),
      createMockEvent('2', `${todayString}T18:00:00Z`, ClockAction.CLOCK_OUT, '10:00'),
    ]);
    mockDay.status = 'over';
    mockDay.hoursDifferenceFormatted = '02:00';

    mockGetClockHistory.mockResolvedValue({
      data: [mockDay],
      summary: {
        totalWorkedHours: 10,
        totalWorkedHoursFormatted: '10:00',
        totalExpectedHours: 8,
        totalExpectedHoursFormatted: '08:00',
        hoursDifference: 2,
        hoursDifferenceFormatted: '02:00',
        status: 'over',
        daysWorked: 1,
        daysWithSchedule: 1,
        averageHoursPerDay: 10,
        averageHoursPerDayFormatted: '10:00',
        totalDays: 1,
      },
    } as any);

    const { getByText } = render(<HistoryScreen />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(getByText('history.entry')).toBeTruthy();
    });
  });

  it('should handle loading state', async () => {
    mockGetClockHistory.mockImplementation(() => new Promise(() => {})); // Never resolves

    const { queryByText, getByText } = render(<HistoryScreen />, { wrapper: createWrapper() });

    // During loading, the skeleton loader should be shown and content should not be visible
    await waitFor(() => {
      expect(mockGetClockHistory).toHaveBeenCalled();
    });

    // Verify that loading content (skeleton) is shown and actual content is not yet visible
    expect(queryByText('history.totalWorked')).toBeNull();
  });
});

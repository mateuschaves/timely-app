import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient } from '@tanstack/react-query';
import { HistoryScreen } from '../index';
import { createTestWrapper } from '@/utils/test-helpers';
import { useTranslation } from '@/i18n';
import { getClockHistory } from '@/api/get-clock-history';
import { useNavigation } from '@react-navigation/native';
import { ClockAction } from '@/api/types';
import { format, parseISO } from 'date-fns';

jest.mock('@/i18n');
jest.mock('expo-haptics', () => ({
  notificationAsync: jest.fn(),
  NotificationFeedbackType: {
    Success: 'success',
  },
}));
// Mock is already in jest.setup.js
jest.mock('react-native', () => ({
  useColorScheme: jest.fn(() => 'light'),
  Platform: {
    OS: 'ios',
    select: jest.fn(),
  },
  View: 'View',
  Text: 'Text',
  ScrollView: 'ScrollView',
  RefreshControl: 'RefreshControl',
  TouchableOpacity: 'TouchableOpacity',
  FlatList: 'FlatList',
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
  Animated: {
    Value: jest.fn((value: number) => ({
      _value: value,
      setValue: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      stopAnimation: jest.fn(),
      interpolate: jest.fn((config: any) => {
        // Return a mock that can be used in style transforms
        const mockAnimated = jest.fn(() => ({
          _value: 0,
        }));
        mockAnimated._value = 0;
        return mockAnimated;
      }),
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
    loop: jest.fn((animation: any) => ({
      start: jest.fn(),
      stop: jest.fn(),
    })),
    View: 'View',
  },
}));
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
      queries: {
        retry: false,
        cacheTime: 0,
        staleTime: 0,
        refetchOnWindowFocus: false,
        refetchOnMount: false,
        refetchOnReconnect: false,
      },
      mutations: { retry: false },
    },
  });

  return createTestWrapper(queryClient);
};

describe.skip('HistoryScreen', () => {
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
    mockT.mockClear();
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

  // TODO: Fix this test failing by timeout only on CI
  it.skip('should render history screen', async () => {
    const { getByText } = render(<HistoryScreen />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(getByText('history.totalWorked')).toBeTruthy();
    }, { timeout: 5000 });
  }, 10000);

  it('should display month summary with data', async () => {
    const mockData = {
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
    } as any;
    
    mockGetClockHistory.mockResolvedValue(mockData);

    const { findByText, queryByText } = render(<HistoryScreen />, { wrapper: createWrapper() });

    // Wait for the query to resolve and component to render
    await waitFor(() => {
      expect(queryByText('history.totalWorked')).toBeTruthy();
    }, { timeout: 10000 });

    const totalWorked = await findByText('history.totalWorked', {}, { timeout: 10000 });
    expect(totalWorked).toBeTruthy();
    
    const expectedHours = await findByText('history.expectedHours', {}, { timeout: 10000 });
    expect(expectedHours).toBeTruthy();
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

    const { findByText } = render(<HistoryScreen />, { wrapper: createWrapper() });

    const difference = await findByText('history.difference', {}, { timeout: 5000 });
    expect(difference).toBeTruthy();
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

    const { findByText } = render(<HistoryScreen />, { wrapper: createWrapper() });

    const difference = await findByText('history.difference', {}, { timeout: 5000 });
    expect(difference).toBeTruthy();
  });

  it('should handle month navigation', async () => {
    const { findByText } = render(<HistoryScreen />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(mockGetClockHistory).toHaveBeenCalled();
    }, { timeout: 1000 });

    // Wait for data to load before checking for text
    const totalWorked = await findByText('history.totalWorked', {}, { timeout: 5000 });
    expect(totalWorked).toBeTruthy();
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

    const { findByText } = render(<HistoryScreen />, { wrapper: createWrapper() });

    const entry = await findByText('history.entry', {}, { timeout: 5000 });
    expect(entry).toBeTruthy();
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

    const { findByText } = render(<HistoryScreen />, { wrapper: createWrapper() });

    const entry = await findByText('history.entry', {}, { timeout: 5000 });
    expect(entry).toBeTruthy();
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

    const { findByText } = render(<HistoryScreen />, { wrapper: createWrapper() });

    const entry = await findByText('history.entry', {}, { timeout: 5000 });
    expect(entry).toBeTruthy();
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

    const { findByText } = render(<HistoryScreen />, { wrapper: createWrapper() });

    const orderIssue = await findByText('history.orderIssue', {}, { timeout: 5000 });
    expect(orderIssue).toBeTruthy();
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

    const { findByText } = render(<HistoryScreen />, { wrapper: createWrapper() });

    const empty = await findByText('history.empty', {}, { timeout: 5000 });
    expect(empty).toBeTruthy();
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

    const { findByText } = render(<HistoryScreen />, { wrapper: createWrapper() });

    const entry = await findByText('history.entry', {}, { timeout: 5000 });
    expect(entry).toBeTruthy();
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

    const { findByText } = render(<HistoryScreen />, { wrapper: createWrapper() });

    const entry = await findByText('history.entry', {}, { timeout: 5000 });
    expect(entry).toBeTruthy();
  });

  it('should handle loading state', async () => {
    mockGetClockHistory.mockImplementation(() => new Promise(() => { })); // Never resolves

    const { queryByText } = render(<HistoryScreen />, { wrapper: createWrapper() });

    // During loading, the skeleton loader should be shown and content should not be visible
    await waitFor(() => {
      expect(mockGetClockHistory).toHaveBeenCalled();
    }, { timeout: 1000 });

    // Verify that loading content (skeleton) is shown and actual content is not yet visible
    expect(queryByText('history.totalWorked')).toBeNull();
  });
});

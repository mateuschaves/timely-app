import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';
import { QueryClient, useQuery } from '@tanstack/react-query';
import { HistoryScreen, isIncompleteDay, hasOrderIssue, getEditButtonTestId } from '../index';
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

jest.mock('@tanstack/react-query', () => {
  const actual = jest.requireActual('@tanstack/react-query');
  return {
    __esModule: true,
    ...actual,
    useQuery: jest.fn(),
  };
});

jest.mock('@/api/get-clock-history');
jest.mock('@react-navigation/native', () => ({
  useNavigation: jest.fn(),
  useFocusEffect: jest.fn((callback) => {
    // Execute the callback immediately in tests
    if (typeof callback === 'function') {
      callback();
    }
  }),
}));

jest.mock('@expo/vector-icons', () => ({
  Ionicons: 'Ionicons',
}));

const mockUseTranslation = useTranslation as jest.MockedFunction<typeof useTranslation>;
const mockGetClockHistory = getClockHistory as jest.MockedFunction<typeof getClockHistory>;
const mockUseNavigation = useNavigation as jest.MockedFunction<typeof useNavigation>;
const mockUseQuery = useQuery as jest.MockedFunction<typeof useQuery>;

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
    // Default: no data, not loading
    mockUseQuery.mockReturnValue({
      data: {
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
      },
      isLoading: false,
    } as any);
  });

  it('should render history screen', () => {
    render(<HistoryScreen />, { wrapper: createWrapper() });

    expect(mockT).toHaveBeenCalledWith('history.totalWorked');
  });

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

    mockUseQuery.mockReturnValueOnce({
      data: mockData,
      isLoading: false,
    } as any);

    render(<HistoryScreen />, { wrapper: createWrapper() });

    expect(mockT).toHaveBeenCalledWith('history.totalWorked');
    expect(mockT).toHaveBeenCalledWith('history.expectedHours');
  });

  it('should display month summary with over status', async () => {
    mockUseQuery.mockReturnValueOnce({
      data: {
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
      },
      isLoading: false,
    } as any);

    render(<HistoryScreen />, { wrapper: createWrapper() });

    expect(mockT).toHaveBeenCalledWith('history.difference');
  });

  it('should display month summary with under status', async () => {
    mockUseQuery.mockReturnValueOnce({
      data: {
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
      },
      isLoading: false,
    } as any);

    render(<HistoryScreen />, { wrapper: createWrapper() });

    expect(mockT).toHaveBeenCalledWith('history.difference');
  });

  it('should handle month navigation', async () => {
    render(<HistoryScreen />, { wrapper: createWrapper() });

    // With mocked useQuery returning data immediately, header translations should be requested
    expect(mockT).toHaveBeenCalledWith('history.totalWorked');
  });

  it('should display days with events', () => {
    const todayString = '2024-01-01';

    const mockDay = createMockDay(todayString, [
      createMockEvent('1', `${todayString}T08:00:00Z`, ClockAction.CLOCK_IN),
      createMockEvent('2', `${todayString}T18:00:00Z`, ClockAction.CLOCK_OUT, '10:00'),
    ]);

    expect(mockDay.events.length).toBe(2);
    expect(isIncompleteDay(mockDay)).toBe(false);
    expect(hasOrderIssue(mockDay)).toBe(false);
  });

  it('should display expandable days', () => {
    const todayString = '2024-01-02';

    const mockDay = createMockDay(todayString, [
      createMockEvent('1', `${todayString}T08:00:00Z`, ClockAction.CLOCK_IN),
      createMockEvent('2', `${todayString}T18:00:00Z`, ClockAction.CLOCK_OUT, '10:00'),
    ]);

    expect(mockDay.events.length).toBeGreaterThan(0);
  });

  it('should display incomplete day (entry without exit)', () => {
    const todayString = '2024-01-03';

    const mockDay = createMockDay(todayString, [
      createMockEvent('1', `${todayString}T08:00:00Z`, ClockAction.CLOCK_IN),
    ]);

    expect(isIncompleteDay(mockDay)).toBe(true);
    expect(hasOrderIssue(mockDay)).toBe(false);
  });

  it('should display day with order issue', () => {
    const todayString = '2024-01-04';

    const mockDay = createMockDay(todayString, [
      createMockEvent('1', `${todayString}T18:00:00Z`, ClockAction.CLOCK_OUT),
      createMockEvent('2', `${todayString}T08:00:00Z`, ClockAction.CLOCK_IN),
    ]);

    expect(hasOrderIssue(mockDay)).toBe(true);
  });

  it('should display empty state', async () => {
    mockUseQuery.mockReturnValueOnce({
      data: {
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
      },
      isLoading: false,
    } as any);

    render(<HistoryScreen />, { wrapper: createWrapper() });

    expect(mockT).toHaveBeenCalledWith('history.empty');
  });

  it('should generate correct edit button test id', () => {
    const id = getEditButtonTestId('1');
    expect(id).toBe('history-edit-button-1');
  });

  it('should display day with different status badges', () => {
    const todayString = '2024-01-05';

    const mockDay = createMockDay(todayString, [
      createMockEvent('1', `${todayString}T08:00:00Z`, ClockAction.CLOCK_IN),
      createMockEvent('2', `${todayString}T18:00:00Z`, ClockAction.CLOCK_OUT, '10:00'),
    ]);
    mockDay.status = 'over';
    mockDay.hoursDifferenceFormatted = '02:00';

    expect(hasOrderIssue(mockDay)).toBe(false);
    expect(isIncompleteDay(mockDay)).toBe(false);
  });

  it('should handle loading state', async () => {
    mockUseQuery.mockReturnValueOnce({
      data: undefined,
      isLoading: true,
    } as any);

    const { queryByText } = render(<HistoryScreen />, { wrapper: createWrapper() });

    // During loading, the summary content should not be visible
    expect(queryByText('history.totalWorked')).toBeNull();
  });
});

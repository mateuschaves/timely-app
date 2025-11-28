import { getClockHistory } from '../get-clock-history';
import { apiClient } from '@/config/api';

jest.mock('@/config/api', () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

describe('getClockHistory', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch clock history successfully with direct structure', async () => {
    const mockParams = {
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    };

    const mockResponse = {
      data: [
        {
          date: '2024-01-01',
          totalHours: 8,
          totalWorkedTime: '08:00',
          events: [],
        },
      ],
      summary: {
        totalWorkedHours: 160,
        totalWorkedHoursFormatted: '160:00',
        totalExpectedHours: 160,
        totalExpectedHoursFormatted: '160:00',
        hoursDifference: 0,
        hoursDifferenceFormatted: '00:00',
        status: 'exact' as const,
        daysWorked: 20,
        daysWithSchedule: 20,
        averageHoursPerDay: 8,
        averageHoursPerDayFormatted: '08:00',
        totalDays: 31,
      },
    };

    (apiClient.get as jest.Mock).mockResolvedValue({
      data: mockResponse,
    });

    const result = await getClockHistory(mockParams);

    expect(apiClient.get).toHaveBeenCalledWith('/clockin/history', {
      params: mockParams,
    });
    expect(result).toEqual(mockResponse);
  });

  it('should handle nested data structure', async () => {
    const mockParams = {
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    };

    const mockResponse = {
      status: 200,
      url: '/clockin/history',
      data: {
        data: [
          {
            date: '2024-01-01',
            totalHours: 8,
            totalWorkedTime: '08:00',
            events: [],
          },
        ],
        summary: {
          totalWorkedHours: 160,
          totalWorkedHoursFormatted: '160:00',
          totalExpectedHours: 160,
          totalExpectedHoursFormatted: '160:00',
          hoursDifference: 0,
          hoursDifferenceFormatted: '00:00',
          status: 'exact' as const,
          daysWorked: 20,
          daysWithSchedule: 20,
          averageHoursPerDay: 8,
          averageHoursPerDayFormatted: '08:00',
          totalDays: 31,
        },
      },
    };

    (apiClient.get as jest.Mock).mockResolvedValue({
      data: mockResponse,
    });

    const result = await getClockHistory(mockParams);

    expect(apiClient.get).toHaveBeenCalledWith('/clockin/history', {
      params: mockParams,
    });
    expect(result).toEqual(mockResponse.data);
  });

  it('should handle API errors', async () => {
    const mockParams = {
      startDate: '2024-01-01',
      endDate: '2024-01-31',
    };

    const error = new Error('Network error');
    (apiClient.get as jest.Mock).mockRejectedValue(error);

    await expect(getClockHistory(mockParams)).rejects.toThrow('Network error');
    expect(apiClient.get).toHaveBeenCalledWith('/clockin/history', {
      params: mockParams,
    });
  });
});

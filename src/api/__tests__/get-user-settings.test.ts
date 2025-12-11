import { getUserSettings } from '../get-user-settings';
import { apiClient } from '@/config/api';

jest.mock('@/config/api', () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

describe('getUserSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch user settings successfully', async () => {
    const mockSettings = {
      userId: '123',
      workSchedule: {
        monday: { start: '09:00', end: '18:00' },
        tuesday: { start: '09:00', end: '18:00' },
      },
      customHolidays: [],
      workLocation: {
        latitude: -23.5505,
        longitude: -46.6333,
      },
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    (apiClient.get as jest.Mock).mockResolvedValue({
      data: mockSettings,
    });

    const result = await getUserSettings();

    expect(apiClient.get).toHaveBeenCalledWith('/users/settings');
    expect(result).toEqual(mockSettings);
  });

  it('should handle API errors', async () => {
    const error = new Error('Network error');
    (apiClient.get as jest.Mock).mockRejectedValue(error);

    await expect(getUserSettings()).rejects.toThrow('Network error');
    expect(apiClient.get).toHaveBeenCalledWith('/users/settings');
  });

  it('should fetch user settings with hour multipliers', async () => {
    const mockSettings = {
      userId: '123',
      workSchedule: {
        monday: { start: '09:00', end: '18:00' },
      },
      customHolidays: [],
      hourlyRate: 50,
      lunchBreakMinutes: 60,
      hourMultipliers: {
        night: 1.2,
        weekend: 1.5,
        holiday: 2.0,
      },
      timeFormat12h: false,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    (apiClient.get as jest.Mock).mockResolvedValue({
      data: mockSettings,
    });

    const result = await getUserSettings();

    expect(apiClient.get).toHaveBeenCalledWith('/users/settings');
    expect(result).toEqual(mockSettings);
    expect(result.hourMultipliers).toBeDefined();
    expect(result.hourMultipliers?.night).toBe(1.2);
    expect(result.hourMultipliers?.weekend).toBe(1.5);
    expect(result.hourMultipliers?.holiday).toBe(2.0);
  });
});

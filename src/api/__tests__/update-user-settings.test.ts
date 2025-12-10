import { updateUserSettings } from '../update-user-settings';
import { apiClient } from '@/config/api';

jest.mock('@/config/api', () => ({
  apiClient: {
    put: jest.fn(),
  },
}));

describe('updateUserSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update user settings successfully', async () => {
    const mockRequest = {
      workSchedule: {
        monday: { start: '09:00', end: '18:00' },
        tuesday: { start: '09:00', end: '18:00' },
      },
      customHolidays: [
        { date: '2024-12-25', name: 'Christmas' },
      ],
      workLocation: {
        type: 'Point' as const,
        coordinates: [-23.5505, -46.6333],
      },
    };

    const mockResponse = {
      id: '123',
      workSchedule: mockRequest.workSchedule,
      customHolidays: mockRequest.customHolidays,
      workLocation: mockRequest.workLocation,
    };

    (apiClient.put as jest.Mock).mockResolvedValue({
      data: mockResponse,
    });

    const result = await updateUserSettings(mockRequest);

    expect(apiClient.put).toHaveBeenCalledWith('/users/settings', mockRequest);
    expect(result).toEqual(mockResponse);
  });

  it('should update only work schedule', async () => {
    const mockRequest = {
      workSchedule: {
        monday: { start: '09:00', end: '18:00' },
      },
    };

    const mockResponse = {
      id: '123',
      workSchedule: mockRequest.workSchedule,
      customHolidays: [],
      workLocation: {
        type: 'Point' as const,
        coordinates: [0, 0],
      },
    };

    (apiClient.put as jest.Mock).mockResolvedValue({
      data: mockResponse,
    });

    const result = await updateUserSettings(mockRequest);

    expect(apiClient.put).toHaveBeenCalledWith('/users/settings', mockRequest);
    expect(result).toEqual(mockResponse);
  });

  it('should handle API errors', async () => {
    const mockRequest = {
      workSchedule: {
        monday: { start: '09:00', end: '18:00' },
      },
    };

    const error = new Error('Network error');
    (apiClient.put as jest.Mock).mockRejectedValue(error);

    await expect(updateUserSettings(mockRequest)).rejects.toThrow('Network error');
    expect(apiClient.put).toHaveBeenCalledWith('/users/settings', mockRequest);
  });
});

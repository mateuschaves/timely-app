import { getTimeClockEntries } from '../get-time-clock-entries';
import { apiClient } from '@/config/api';

jest.mock('@/config/api', () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

describe('getTimeClockEntries', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch time clock entries successfully', async () => {
    const mockEntries = [
      {
        id: '1',
        userId: 'user123',
        hour: '2024-01-01T08:00:00Z',
        action: 'clock-in' as const,
        createdAt: '2024-01-01T08:00:00Z',
        updatedAt: '2024-01-01T08:00:00Z',
      },
      {
        id: '2',
        userId: 'user123',
        hour: '2024-01-01T18:00:00Z',
        action: 'clock-out' as const,
        createdAt: '2024-01-01T18:00:00Z',
        updatedAt: '2024-01-01T18:00:00Z',
      },
    ];

    (apiClient.get as jest.Mock).mockResolvedValue({
      data: mockEntries,
    });

    const result = await getTimeClockEntries();

    expect(apiClient.get).toHaveBeenCalledWith('/time-clock');
    expect(result).toEqual(mockEntries);
  });

  it('should return empty array when no entries', async () => {
    (apiClient.get as jest.Mock).mockResolvedValue({
      data: [],
    });

    const result = await getTimeClockEntries();

    expect(apiClient.get).toHaveBeenCalledWith('/time-clock');
    expect(result).toEqual([]);
  });

  it('should handle API errors', async () => {
    const error = new Error('Network error');
    (apiClient.get as jest.Mock).mockRejectedValue(error);

    await expect(getTimeClockEntries()).rejects.toThrow('Network error');
    expect(apiClient.get).toHaveBeenCalledWith('/time-clock');
  });
});

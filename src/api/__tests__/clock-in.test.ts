import { clockIn } from '../clock-in';
import { apiClient } from '@/config/api';

jest.mock('@/config/api', () => ({
  apiClient: {
    post: jest.fn(),
  },
}));

describe('clockIn', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should clock in successfully', async () => {
    const mockRequest = {
      hour: '2024-01-01T08:00:00Z',
      location: {
        latitude: -23.5505,
        longitude: -46.6333,
      },
    };

    const mockResponse = {
      id: '123',
      userId: 'user123',
      hour: '2024-01-01T08:00:00Z',
      action: 'clock-in' as const,
      createdAt: '2024-01-01T08:00:00Z',
      updatedAt: '2024-01-01T08:00:00Z',
    };

    (apiClient.post as jest.Mock).mockResolvedValue({
      data: mockResponse,
    });

    const result = await clockIn(mockRequest);

    expect(apiClient.post).toHaveBeenCalledWith('/clockin', mockRequest);
    expect(result).toEqual(mockResponse);
  });

  it('should clock in without location', async () => {
    const mockRequest = {
      hour: '2024-01-01T08:00:00Z',
    };

    const mockResponse = {
      id: '123',
      userId: 'user123',
      hour: '2024-01-01T08:00:00Z',
      action: 'clock-in' as const,
      createdAt: '2024-01-01T08:00:00Z',
      updatedAt: '2024-01-01T08:00:00Z',
    };

    (apiClient.post as jest.Mock).mockResolvedValue({
      data: mockResponse,
    });

    const result = await clockIn(mockRequest);

    expect(apiClient.post).toHaveBeenCalledWith('/clockin', mockRequest);
    expect(result).toEqual(mockResponse);
  });

  it('should handle API errors', async () => {
    const mockRequest = {
      hour: '2024-01-01T08:00:00Z',
    };

    const error = new Error('Network error');
    (apiClient.post as jest.Mock).mockRejectedValue(error);

    await expect(clockIn(mockRequest)).rejects.toThrow('Network error');
    expect(apiClient.post).toHaveBeenCalledWith('/clockin', mockRequest);
  });
});

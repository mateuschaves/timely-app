import { clock } from '../clock';
import { apiClient } from '@/config/api';

jest.mock('@/config/api', () => ({
  apiClient: {
    post: jest.fn(),
  },
}));

describe('clock', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should clock successfully with all data', async () => {
    const mockRequest = {
      hour: '2024-01-01T08:00:00Z',
      location: {
        latitude: -23.5505,
        longitude: -46.6333,
      },
      photoUrl: 'https://example.com/photo.jpg',
      notes: 'Test notes',
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

    const result = await clock(mockRequest);

    expect(apiClient.post).toHaveBeenCalledWith('/clockin', mockRequest);
    expect(result).toEqual(mockResponse);
  });

  it('should clock with minimal data', async () => {
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

    const result = await clock(mockRequest);

    expect(apiClient.post).toHaveBeenCalledWith('/clockin', mockRequest);
    expect(result).toEqual(mockResponse);
  });

  it('should handle API errors', async () => {
    const mockRequest = {
      hour: '2024-01-01T08:00:00Z',
    };

    const error = new Error('Network error');
    (apiClient.post as jest.Mock).mockRejectedValue(error);

    await expect(clock(mockRequest)).rejects.toThrow('Network error');
    expect(apiClient.post).toHaveBeenCalledWith('/clockin', mockRequest);
  });
});

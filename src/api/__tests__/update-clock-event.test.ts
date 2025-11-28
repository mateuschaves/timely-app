import { updateClockEvent, UpdateClockEventRequest, UpdateClockEventResponse } from '../update-clock-event';
import { apiClient } from '@/config/api';

jest.mock('@/config/api', () => ({
  apiClient: {
    put: jest.fn(),
  },
}));

describe('updateClockEvent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update clock event successfully', async () => {
    const eventId = '123';
    const mockRequest: UpdateClockEventRequest = {
      hour: '2024-01-01T08:00:00Z',
      photoUrl: 'https://example.com/photo.jpg',
      notes: 'Test notes',
    };

    const mockResponse: UpdateClockEventResponse = {
      id: '123',
      userId: 'user123',
      hour: '2024-01-01T08:00:00Z',
      action: 'clock-in',
      location: {
        type: 'Point',
        coordinates: [-46.6333, -23.5505],
      },
      photoUrl: 'https://example.com/photo.jpg',
      notes: 'Test notes',
      createdAt: '2024-01-01T08:00:00Z',
      updatedAt: '2024-01-01T08:00:00Z',
    };

    (apiClient.put as jest.Mock).mockResolvedValue({
      data: mockResponse,
    });

    const result = await updateClockEvent(eventId, mockRequest);

    expect(apiClient.put).toHaveBeenCalledWith(`/clockin/${eventId}`, mockRequest);
    expect(result).toEqual(mockResponse);
  });

  it('should update clock event without optional fields', async () => {
    const eventId = '123';
    const mockRequest: UpdateClockEventRequest = {
      hour: '2024-01-01T08:00:00Z',
    };

    const mockResponse: UpdateClockEventResponse = {
      id: '123',
      userId: 'user123',
      hour: '2024-01-01T08:00:00Z',
      action: 'clock-in',
      photoUrl: null,
      notes: null,
      createdAt: '2024-01-01T08:00:00Z',
      updatedAt: '2024-01-01T08:00:00Z',
    };

    (apiClient.put as jest.Mock).mockResolvedValue({
      data: mockResponse,
    });

    const result = await updateClockEvent(eventId, mockRequest);

    expect(apiClient.put).toHaveBeenCalledWith(`/clockin/${eventId}`, mockRequest);
    expect(result).toEqual(mockResponse);
  });

  it('should handle API errors', async () => {
    const eventId = '123';
    const mockRequest: UpdateClockEventRequest = {
      hour: '2024-01-01T08:00:00Z',
    };

    const error = new Error('Network error');
    (apiClient.put as jest.Mock).mockRejectedValue(error);

    await expect(updateClockEvent(eventId, mockRequest)).rejects.toThrow('Network error');
    expect(apiClient.put).toHaveBeenCalledWith(`/clockin/${eventId}`, mockRequest);
  });
});


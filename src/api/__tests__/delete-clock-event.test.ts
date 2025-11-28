import { deleteClockEvent } from '../delete-clock-event';
import { apiClient } from '@/config/api';

jest.mock('@/config/api', () => ({
  apiClient: {
    delete: jest.fn(),
  },
}));

describe('deleteClockEvent', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should delete clock event successfully', async () => {
    const eventId = '123';

    (apiClient.delete as jest.Mock).mockResolvedValue({});

    await deleteClockEvent(eventId);

    expect(apiClient.delete).toHaveBeenCalledWith(`/clockin/${eventId}`);
  });

  it('should handle API errors', async () => {
    const eventId = '123';

    const error = new Error('Network error');
    (apiClient.delete as jest.Mock).mockRejectedValue(error);

    await expect(deleteClockEvent(eventId)).rejects.toThrow('Network error');
    expect(apiClient.delete).toHaveBeenCalledWith(`/clockin/${eventId}`);
  });
});


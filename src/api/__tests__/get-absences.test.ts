import { getAbsences } from '../get-absences';
import { apiClient } from '@/config/api';

jest.mock('@/config/api', () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

describe('getAbsences', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch absences successfully', async () => {
    const mockParams = {
      startDate: '2024-07-01',
      endDate: '2024-07-31',
    };

    const mockResponse = {
      data: [
        {
          date: '2024-07-16',
          absences: [
            {
              id: 'abc123',
              userId: 'user123',
              reason: 'Consulta médica',
              description: 'Consulta agendada com antecedência',
              createdAt: '2024-07-16T10:00:00Z',
              updatedAt: '2024-07-16T10:00:00Z',
            },
          ],
        },
        {
          date: '2024-07-20',
          absences: [
            {
              id: 'def456',
              userId: 'user123',
              reason: 'Assuntos pessoais',
              createdAt: '2024-07-20T09:00:00Z',
              updatedAt: '2024-07-20T09:00:00Z',
            },
          ],
        },
      ],
    };

    (apiClient.get as jest.Mock).mockResolvedValue({
      data: mockResponse,
    });

    const result = await getAbsences(mockParams);

    expect(apiClient.get).toHaveBeenCalledWith('/absences', {
      params: mockParams,
    });
    expect(result).toEqual(mockResponse);
  });

  it('should handle empty absences list', async () => {
    const mockParams = {
      startDate: '2024-08-01',
      endDate: '2024-08-31',
    };

    const mockResponse = {
      data: [],
    };

    (apiClient.get as jest.Mock).mockResolvedValue({
      data: mockResponse,
    });

    const result = await getAbsences(mockParams);

    expect(apiClient.get).toHaveBeenCalledWith('/absences', {
      params: mockParams,
    });
    expect(result).toEqual(mockResponse);
    expect(result.data).toHaveLength(0);
  });

  it('should handle API errors', async () => {
    const mockParams = {
      startDate: '2024-07-01',
      endDate: '2024-07-31',
    };

    const error = new Error('Network error');
    (apiClient.get as jest.Mock).mockRejectedValue(error);

    await expect(getAbsences(mockParams)).rejects.toThrow('Network error');
    expect(apiClient.get).toHaveBeenCalledWith('/absences', {
      params: mockParams,
    });
  });

  it('should handle unauthorized errors', async () => {
    const mockParams = {
      startDate: '2024-07-01',
      endDate: '2024-07-31',
    };

    const error = new Error('Unauthorized');
    (apiClient.get as jest.Mock).mockRejectedValue(error);

    await expect(getAbsences(mockParams)).rejects.toThrow('Unauthorized');
    expect(apiClient.get).toHaveBeenCalledWith('/absences', {
      params: mockParams,
    });
  });
});

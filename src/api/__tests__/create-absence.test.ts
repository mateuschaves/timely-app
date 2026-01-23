import { createAbsence } from '../create-absence';
import { apiClient } from '@/config/api';

jest.mock('@/config/api', () => ({
  apiClient: {
    post: jest.fn(),
  },
}));

describe('createAbsence', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should create absence successfully', async () => {
    const mockRequest = {
      date: '2024-07-16',
      reason: 'Consulta médica',
      description: 'Consulta agendada com antecedência',
    };

    const mockResponse = {
      id: '123',
      userId: 'user123',
      date: '2024-07-16',
      reason: 'Consulta médica',
      description: 'Consulta agendada com antecedência',
      createdAt: '2024-07-16T10:00:00Z',
      updatedAt: '2024-07-16T10:00:00Z',
    };

    (apiClient.post as jest.Mock).mockResolvedValue({
      data: mockResponse,
    });

    const result = await createAbsence(mockRequest);

    expect(apiClient.post).toHaveBeenCalledWith('/absences', mockRequest);
    expect(result).toEqual(mockResponse);
  });

  it('should create absence without description', async () => {
    const mockRequest = {
      date: '2024-07-16',
      reason: 'Consulta médica',
    };

    const mockResponse = {
      id: '123',
      userId: 'user123',
      date: '2024-07-16',
      reason: 'Consulta médica',
      createdAt: '2024-07-16T10:00:00Z',
      updatedAt: '2024-07-16T10:00:00Z',
    };

    (apiClient.post as jest.Mock).mockResolvedValue({
      data: mockResponse,
    });

    const result = await createAbsence(mockRequest);

    expect(apiClient.post).toHaveBeenCalledWith('/absences', mockRequest);
    expect(result).toEqual(mockResponse);
  });

  it('should handle API errors', async () => {
    const mockRequest = {
      date: '2024-07-16',
      reason: 'Consulta médica',
    };

    const error = new Error('Clock records already exist for this date');
    (apiClient.post as jest.Mock).mockRejectedValue(error);

    await expect(createAbsence(mockRequest)).rejects.toThrow(
      'Clock records already exist for this date'
    );
    expect(apiClient.post).toHaveBeenCalledWith('/absences', mockRequest);
  });
});

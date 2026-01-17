import { updateUserMe } from '../update-user-me';
import { apiClient } from '@/config/api';

jest.mock('@/config/api', () => ({
  apiClient: {
    put: jest.fn(),
  },
}));

describe('updateUserMe', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should update user data successfully', async () => {
    const mockRequest = {
      name: 'John Doe Updated',
    };

    const mockResponse = {
      id: '123',
      name: 'John Doe Updated',
      email: 'john@example.com',
      appleId: null,
      onboardingCompleted: false,
      lastLogin: '2024-01-01T00:00:00Z',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    };

    (apiClient.put as jest.Mock).mockResolvedValue({
      data: mockResponse,
    });

    const result = await updateUserMe(mockRequest);

    expect(apiClient.put).toHaveBeenCalledWith('/users/me', mockRequest);
    expect(result).toEqual(mockResponse);
  });

  it('should update onboarding completion status', async () => {
    const mockRequest = {
      onboardingCompleted: true,
    };

    const mockResponse = {
      id: '123',
      name: 'John Doe',
      email: 'john@example.com',
      appleId: null,
      onboardingCompleted: true,
      lastLogin: '2024-01-01T00:00:00Z',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
    };

    (apiClient.put as jest.Mock).mockResolvedValue({
      data: mockResponse,
    });

    const result = await updateUserMe(mockRequest);

    expect(apiClient.put).toHaveBeenCalledWith('/users/me', mockRequest);
    expect(result).toEqual(mockResponse);
  });

  it('should handle API errors', async () => {
    const mockRequest = {
      name: 'John Doe Updated',
    };

    const error = new Error('Network error');
    (apiClient.put as jest.Mock).mockRejectedValue(error);

    await expect(updateUserMe(mockRequest)).rejects.toThrow('Network error');
    expect(apiClient.put).toHaveBeenCalledWith('/users/me', mockRequest);
  });
});

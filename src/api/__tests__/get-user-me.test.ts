import { getUserMe } from '../get-user-me';
import { apiClient } from '@/config/api';

jest.mock('@/config/api', () => ({
  apiClient: {
    get: jest.fn(),
  },
}));

describe('getUserMe', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should fetch user data successfully', async () => {
    const mockUserData = {
      id: '123',
      name: 'John Doe',
      email: 'john@example.com',
      appleId: null,
      onboardingCompleted: false,
      lastLogin: '2024-01-01T00:00:00Z',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    };

    (apiClient.get as jest.Mock).mockResolvedValue({
      data: mockUserData,
    });

    const result = await getUserMe();

    expect(apiClient.get).toHaveBeenCalledWith('/users/me');
    expect(result).toEqual(mockUserData);
  });

  it('should handle API errors', async () => {
    const error = new Error('Network error');
    (apiClient.get as jest.Mock).mockRejectedValue(error);

    await expect(getUserMe()).rejects.toThrow('Network error');
    expect(apiClient.get).toHaveBeenCalledWith('/users/me');
  });
});

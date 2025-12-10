import { signInWithApple } from '../signin-with-apple';
import { apiClient } from '@/config/api';

jest.mock('@/config/api', () => ({
  apiClient: {
    post: jest.fn(),
  },
}));

describe('signInWithApple', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should sign in with Apple successfully', async () => {
    const mockRequest = {
      token: 'apple-identity-token',
      email: 'user@example.com',
      name: 'John Doe',
    };

    const mockResponse = {
      access_token: 'access-token-123',
      expired_at: 1234567890,
    };

    (apiClient.post as jest.Mock).mockResolvedValue({
      data: mockResponse,
    });

    const result = await signInWithApple(mockRequest);

    expect(apiClient.post).toHaveBeenCalledWith('/auth/login/apple', mockRequest);
    expect(result).toEqual(mockResponse);
  });

  it('should sign in with Apple without email and name', async () => {
    const mockRequest = {
      token: 'apple-identity-token',
      email: null,
      name: null,
    };

    const mockResponse = {
      access_token: 'access-token-123',
      expired_at: 1234567890,
    };

    (apiClient.post as jest.Mock).mockResolvedValue({
      data: mockResponse,
    });

    const result = await signInWithApple(mockRequest);

    expect(apiClient.post).toHaveBeenCalledWith('/auth/login/apple', mockRequest);
    expect(result).toEqual(mockResponse);
  });

  it('should handle API errors', async () => {
    const mockRequest = {
      token: 'apple-identity-token',
      email: 'user@example.com',
      name: 'John Doe',
    };

    const error = new Error('Network error');
    (apiClient.post as jest.Mock).mockRejectedValue(error);

    await expect(signInWithApple(mockRequest)).rejects.toThrow('Network error');
    expect(apiClient.post).toHaveBeenCalledWith('/auth/login/apple', mockRequest);
  });
});

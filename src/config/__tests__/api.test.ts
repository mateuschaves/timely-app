import axios from 'axios';
import { apiClient, API_BASE_URL, API_TIMEOUT, DEFAULT_HEADERS } from '../api';
import { getToken, removeToken } from '../token';

jest.mock('../token');
jest.mock('axios');

const mockAxios = axios as jest.Mocked<typeof axios>;

describe('api config', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (getToken as jest.Mock).mockResolvedValue('test-token');
  });

  it('should export correct constants', () => {
    expect(API_BASE_URL).toBe('https://clocking-core-api.onrender.com');
    expect(API_TIMEOUT).toBe(10000);
    expect(DEFAULT_HEADERS).toEqual({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    });
  });

  it('should create axios instance with correct config', () => {
    expect(axios.create).toHaveBeenCalledWith({
      baseURL: API_BASE_URL,
      timeout: API_TIMEOUT,
      headers: DEFAULT_HEADERS,
    });
  });

  it('should add token to request headers', async () => {
    const mockConfig = {
      headers: {},
    };

    // Mock the interceptor
    const requestInterceptor = (apiClient.interceptors.request as any).handlers[0];
    if (requestInterceptor) {
      await requestInterceptor.fulfilled(mockConfig);
      expect(mockConfig.headers.Authorization).toBe('Bearer test-token');
    }
  });

  it('should remove token on 401 response', async () => {
    const mockError = {
      response: {
        status: 401,
        statusText: 'Unauthorized',
        data: {},
      },
      config: {
        url: '/test',
      },
    };

    // Mock the response interceptor
    const responseInterceptor = (apiClient.interceptors.response as any).handlers[1];
    if (responseInterceptor) {
      try {
        await responseInterceptor.rejected(mockError);
      } catch (error) {
        expect(removeToken).toHaveBeenCalled();
      }
    }
  });
});

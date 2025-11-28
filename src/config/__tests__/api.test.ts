import { API_BASE_URL, API_TIMEOUT, DEFAULT_HEADERS, apiClient } from '../api';
import { getToken, removeToken } from '../token';
import axios from 'axios';

jest.mock('../token', () => ({
  getToken: jest.fn(),
  removeToken: jest.fn(),
}));

describe('api config', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    global.__DEV__ = true;
    (console as any).tron = {
      display: jest.fn(),
      error: jest.fn(),
    };
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should export correct constants', () => {
    expect(API_BASE_URL).toBe('https://clocking-core-api.onrender.com');
    expect(API_TIMEOUT).toBe(10000);
    expect(DEFAULT_HEADERS).toEqual({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    });
  });

  it('should create apiClient with correct configuration', () => {
    expect(apiClient).toBeDefined();
    expect(apiClient.defaults.baseURL).toBe(API_BASE_URL);
    expect(apiClient.defaults.timeout).toBe(API_TIMEOUT);
    expect(apiClient.defaults.headers['Content-Type']).toBe('application/json');
    expect(apiClient.defaults.headers['Accept']).toBe('application/json');
  });

  it('should have request interceptors configured', () => {
    expect(apiClient.interceptors.request).toBeDefined();
  });

  it('should have response interceptors configured', () => {
    expect(apiClient.interceptors.response).toBeDefined();
  });

  describe('request interceptor', () => {
    it('should add Authorization header when token exists', async () => {
      const token = 'test-token';
      (getToken as jest.Mock).mockResolvedValue(token);

      const config = {
        method: 'get',
        url: '/test',
        headers: {},
      };

      const interceptor = apiClient.interceptors.request.handlers[0];
      const result = await interceptor.fulfilled(config as any);

      expect(getToken).toHaveBeenCalled();
      expect(result.headers.Authorization).toBe(`Bearer ${token}`);
    });

    it('should not add Authorization header when token is null', async () => {
      (getToken as jest.Mock).mockResolvedValue(null);

      const config = {
        method: 'get',
        url: '/test',
        headers: {},
      };

      const interceptor = apiClient.interceptors.request.handlers[0];
      const result = await interceptor.fulfilled(config as any);

      expect(getToken).toHaveBeenCalled();
      expect(result.headers.Authorization).toBeUndefined();
    });

    it('should log request to Reactotron in development', async () => {
      (getToken as jest.Mock).mockResolvedValue(null);

      const config = {
        method: 'post',
        url: '/test',
        baseURL: API_BASE_URL,
        headers: {},
      };

      const interceptor = apiClient.interceptors.request.handlers[0];
      await interceptor.fulfilled(config as any);

      expect((console as any).tron.display).toHaveBeenCalledWith({
        name: 'API Request',
        value: {
          method: 'POST',
          url: '/test',
          baseURL: API_BASE_URL,
          headers: config.headers,
        },
        preview: 'POST /test',
        important: true,
      });
    });

    it('should not log to Reactotron in production', async () => {
      global.__DEV__ = false;
      (getToken as jest.Mock).mockResolvedValue(null);

      const config = {
        method: 'get',
        url: '/test',
        headers: {},
      };

      const interceptor = apiClient.interceptors.request.handlers[0];
      await interceptor.fulfilled(config as any);

      expect((console as any).tron?.display).not.toHaveBeenCalled();
    });

    it('should handle request interceptor error', async () => {
      const error = new Error('Request error');
      const interceptor = apiClient.interceptors.request.handlers[0];
      
      await expect(interceptor.rejected(error)).rejects.toThrow('Request error');
    });
  });

  describe('response interceptor', () => {
    it('should log successful response to Reactotron', async () => {
      const response = {
        status: 200,
        statusText: 'OK',
        config: {
          url: '/test',
        },
        data: { success: true },
      };

      const interceptor = apiClient.interceptors.response.handlers[0];
      const result = await interceptor.fulfilled(response as any);

      expect((console as any).tron.display).toHaveBeenCalledWith({
        name: 'API Response',
        value: {
          status: 200,
          statusText: 'OK',
          url: '/test',
          data: { success: true },
        },
        preview: '200 /test',
        important: false,
      });
      expect(result).toEqual(response);
    });

    it('should mark error responses as important in Reactotron', async () => {
      const response = {
        status: 500,
        statusText: 'Internal Server Error',
        config: {
          url: '/test',
        },
        data: { error: 'Server error' },
      };

      const interceptor = apiClient.interceptors.response.handlers[0];
      await interceptor.fulfilled(response as any);

      expect((console as any).tron.display).toHaveBeenCalledWith(
        expect.objectContaining({
          important: true,
        })
      );
    });

    it('should remove token on 401 error', async () => {
      const error = {
        response: {
          status: 401,
          statusText: 'Unauthorized',
          data: { message: 'Invalid token' },
        },
        config: {
          url: '/test',
        },
      };

      const interceptor = apiClient.interceptors.response.handlers[0];
      
      await expect(interceptor.rejected(error as any)).rejects.toEqual(error);
      expect(removeToken).toHaveBeenCalled();
      expect((console as any).tron.error).toHaveBeenCalled();
    });

    it('should log API error to Reactotron', async () => {
      const error = {
        response: {
          status: 404,
          statusText: 'Not Found',
          data: { message: 'Not found' },
        },
        config: {
          url: '/test',
        },
      };

      const interceptor = apiClient.interceptors.response.handlers[0];
      
      await expect(interceptor.rejected(error as any)).rejects.toEqual(error);
      expect((console as any).tron.error).toHaveBeenCalledWith({
        name: 'API Error',
        value: {
          status: 404,
          statusText: 'Not Found',
          url: '/test',
          data: { message: 'Not found' },
        },
        preview: 'Error 404: /test',
        important: true,
      });
    });

    it('should handle network error', async () => {
      const error = {
        request: { status: 0 },
        message: 'Network Error',
      };

      const interceptor = apiClient.interceptors.response.handlers[0];
      
      await expect(interceptor.rejected(error as any)).rejects.toEqual(error);
      expect((console as any).tron.error).toHaveBeenCalledWith({
        name: 'Network Error',
        value: { status: 0 },
        preview: 'Network request failed',
        important: true,
      });
    });

    it('should handle request setup error', async () => {
      const error = {
        message: 'Request setup error',
      };

      const interceptor = apiClient.interceptors.response.handlers[0];
      
      await expect(interceptor.rejected(error as any)).rejects.toEqual(error);
      expect((console as any).tron.error).toHaveBeenCalledWith({
        name: 'Request Error',
        value: 'Request setup error',
        preview: 'Request setup error',
        important: true,
      });
    });
  });
});

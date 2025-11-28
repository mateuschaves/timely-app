import { API_BASE_URL, API_TIMEOUT, DEFAULT_HEADERS, apiClient } from '../api';

describe('api config', () => {
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
});

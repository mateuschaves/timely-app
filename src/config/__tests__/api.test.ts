import { API_BASE_URL, API_TIMEOUT, DEFAULT_HEADERS } from '../api';

describe('api config', () => {
  it('should export correct constants', () => {
    expect(API_BASE_URL).toBe('https://clocking-core-api.onrender.com');
    expect(API_TIMEOUT).toBe(10000);
    expect(DEFAULT_HEADERS).toEqual({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    });
  });
});

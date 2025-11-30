import { STORAGE_KEYS, StorageKey } from '../storage';

describe('storage', () => {
  it('should export STORAGE_KEYS', () => {
    expect(STORAGE_KEYS).toBeDefined();
    expect(STORAGE_KEYS.USER).toBe('@timely:user');
    expect(STORAGE_KEYS.TOKEN).toBe('@timely:token');
    expect(STORAGE_KEYS.LANGUAGE).toBe('@timely:language');
    expect(STORAGE_KEYS.WORK_SETTINGS).toBe('@timely:workSettings');
    expect(STORAGE_KEYS.LAST_PROCESSED_DEEPLINK).toBe('@timely:lastProcessedDeeplink');
  });

  it('should have correct StorageKey type', () => {
    const key: StorageKey = STORAGE_KEYS.USER;
    expect(key).toBe('@timely:user');
  });
});



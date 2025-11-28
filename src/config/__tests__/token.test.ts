import AsyncStorage from '@react-native-async-storage/async-storage';
import { saveToken, getToken, removeToken } from '../token';
import { STORAGE_KEYS } from '../storage';

jest.mock('@react-native-async-storage/async-storage', () => ({
  __esModule: true,
  default: {
    setItem: jest.fn(),
    getItem: jest.fn(),
    removeItem: jest.fn(),
  },
}));

describe('token', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveToken', () => {
    it('should save token successfully', async () => {
      const token = 'test-token-123';
      (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);

      await saveToken(token);

      expect(AsyncStorage.setItem).toHaveBeenCalledWith(STORAGE_KEYS.TOKEN, token);
    });

    it('should handle errors when saving token', async () => {
      const token = 'test-token-123';
      const error = new Error('Storage error');
      (AsyncStorage.setItem as jest.Mock).mockRejectedValue(error);

      await expect(saveToken(token)).rejects.toThrow('Storage error');
      expect(AsyncStorage.setItem).toHaveBeenCalledWith(STORAGE_KEYS.TOKEN, token);
    });
  });

  describe('getToken', () => {
    it('should retrieve token successfully', async () => {
      const token = 'test-token-123';
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(token);

      const result = await getToken();

      expect(AsyncStorage.getItem).toHaveBeenCalledWith(STORAGE_KEYS.TOKEN);
      expect(result).toBe(token);
    });

    it('should return null when token does not exist', async () => {
      (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);

      const result = await getToken();

      expect(AsyncStorage.getItem).toHaveBeenCalledWith(STORAGE_KEYS.TOKEN);
      expect(result).toBeNull();
    });

    it('should return null on error', async () => {
      const error = new Error('Storage error');
      (AsyncStorage.getItem as jest.Mock).mockRejectedValue(error);

      const result = await getToken();

      expect(AsyncStorage.getItem).toHaveBeenCalledWith(STORAGE_KEYS.TOKEN);
      expect(result).toBeNull();
    });
  });

  describe('removeToken', () => {
    it('should remove token successfully', async () => {
      (AsyncStorage.removeItem as jest.Mock).mockResolvedValue(undefined);

      await removeToken();

      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.TOKEN);
    });

    it('should handle errors when removing token', async () => {
      const error = new Error('Storage error');
      (AsyncStorage.removeItem as jest.Mock).mockRejectedValue(error);

      await expect(removeToken()).rejects.toThrow('Storage error');
      expect(AsyncStorage.removeItem).toHaveBeenCalledWith(STORAGE_KEYS.TOKEN);
    });
  });
});

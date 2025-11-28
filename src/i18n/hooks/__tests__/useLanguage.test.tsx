import { renderHook, waitFor, act } from '@testing-library/react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { useLanguage } from '../useLanguage';
import { STORAGE_KEYS } from '@/config/storage';
import { i18n } from '@/i18n/config';

jest.mock('@react-native-async-storage/async-storage');
jest.mock('expo-localization');
jest.mock('@/i18n/config', () => ({
  i18n: {
    changeLanguage: jest.fn(),
  },
  SUPPORTED_LANGUAGES: ['pt-BR', 'en-US', 'fr-FR', 'de-DE'],
  LANGUAGE_MAP: {
    pt: 'pt-BR',
    en: 'en-US',
    fr: 'fr-FR',
    de: 'de-DE',
  },
  DEFAULT_LANGUAGE: 'pt-BR',
}));

const mockChangeLanguage = i18n.changeLanguage as jest.MockedFunction<typeof i18n.changeLanguage>;
const mockGetLocales = Localization.getLocales as jest.MockedFunction<typeof Localization.getLocales>;

describe('useLanguage', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    (AsyncStorage.setItem as jest.Mock).mockResolvedValue(undefined);
    mockGetLocales.mockReturnValue([
      {
        languageCode: 'pt',
        languageTag: 'pt-BR',
      },
    ] as any);
  });

  it('should initialize with loading state', () => {
    const { result } = renderHook(() => useLanguage());

    expect(result.current.isLoading).toBe(true);
  });

  it('should load saved language on mount', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('en-US');

    const { result } = renderHook(() => useLanguage());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.currentLanguage).toBe('en-US');
    expect(mockChangeLanguage).toHaveBeenCalledWith('en-US');
  });

  it('should use system language when no saved language', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(null);
    mockGetLocales.mockReturnValue([
      {
        languageCode: 'pt',
        languageTag: 'pt-BR',
      },
    ] as any);

    const { result } = renderHook(() => useLanguage());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.currentLanguage).toBe('system');
    expect(mockChangeLanguage).toHaveBeenCalledWith('pt-BR');
  });

  it('should change language successfully', async () => {
    const { result } = renderHook(() => useLanguage());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.changeLanguage('en-US');
    });

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(STORAGE_KEYS.LANGUAGE, 'en-US');
    expect(result.current.currentLanguage).toBe('en-US');
    expect(mockChangeLanguage).toHaveBeenCalledWith('en-US');
  });

  it('should handle system language change', async () => {
    mockGetLocales.mockReturnValue([
      {
        languageCode: 'en',
        languageTag: 'en-US',
      },
    ] as any);

    const { result } = renderHook(() => useLanguage());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.changeLanguage('system');
    });

    expect(AsyncStorage.setItem).toHaveBeenCalledWith(STORAGE_KEYS.LANGUAGE, 'system');
    expect(result.current.currentLanguage).toBe('system');
    expect(mockChangeLanguage).toHaveBeenCalledWith('en-US');
  });

  it('should get active language for system setting', async () => {
    mockGetLocales.mockReturnValue([
      {
        languageCode: 'fr',
        languageTag: 'fr-FR',
      },
    ] as any);

    const { result } = renderHook(() => useLanguage());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.activeLanguage).toBe('fr-FR');
  });

  it('should get active language for explicit setting', async () => {
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue('de-DE');

    const { result } = renderHook(() => useLanguage());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.activeLanguage).toBe('de-DE');
  });

  it('should handle error loading saved language', async () => {
    (AsyncStorage.getItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

    const { result } = renderHook(() => useLanguage());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.currentLanguage).toBe('system');
  });

  it('should handle error saving language', async () => {
    (AsyncStorage.setItem as jest.Mock).mockRejectedValue(new Error('Storage error'));

    const { result } = renderHook(() => useLanguage());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.changeLanguage('en-US');
    });

    // Should not throw, but language might not be saved
    expect(result.current).toBeDefined();
  });

  it('should use default language when device language is not supported', async () => {
    mockGetLocales.mockReturnValue([
      {
        languageCode: 'es',
        languageTag: 'es-ES',
      },
    ] as any);

    const { result } = renderHook(() => useLanguage());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.activeLanguage).toBe('pt-BR');
  });

  it('should apply language when currentLanguage changes', async () => {
    const { result } = renderHook(() => useLanguage());

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    await act(async () => {
      await result.current.changeLanguage('fr-FR');
    });

    expect(mockChangeLanguage).toHaveBeenCalledWith('fr-FR');
  });
});

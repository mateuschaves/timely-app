import { SUPPORTED_LANGUAGES, LANGUAGE_MAP, DEFAULT_LANGUAGE, i18n } from '../config';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/config/storage';

jest.mock('expo-localization');
jest.mock('@react-native-async-storage/async-storage');

describe('i18n config', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (i18n.changeLanguage as jest.Mock) = jest.fn();
  });

  it('should export SUPPORTED_LANGUAGES', () => {
    expect(SUPPORTED_LANGUAGES).toContain('pt-BR');
    expect(SUPPORTED_LANGUAGES).toContain('en-US');
    expect(SUPPORTED_LANGUAGES).toContain('fr-FR');
    expect(SUPPORTED_LANGUAGES).toContain('de-DE');
    expect(SUPPORTED_LANGUAGES).toContain('es-ES');
  });

  it('should export LANGUAGE_MAP', () => {
    expect(LANGUAGE_MAP.pt).toBe('pt-BR');
    expect(LANGUAGE_MAP.en).toBe('en-US');
    expect(LANGUAGE_MAP.fr).toBe('fr-FR');
    expect(LANGUAGE_MAP.de).toBe('de-DE');
    expect(LANGUAGE_MAP.es).toBe('es-ES');
  });

  it('should export DEFAULT_LANGUAGE', () => {
    expect(DEFAULT_LANGUAGE).toBe('en-US');
  });

  describe('getInitialLanguage', () => {
    it('should map language codes correctly', () => {
      expect(LANGUAGE_MAP['pt']).toBe('pt-BR');
      expect(LANGUAGE_MAP['en']).toBe('en-US');
      expect(LANGUAGE_MAP['fr']).toBe('fr-FR');
      expect(LANGUAGE_MAP['de']).toBe('de-DE');
      expect(LANGUAGE_MAP['es']).toBe('es-ES');
    });

    it('should have default language', () => {
      expect(DEFAULT_LANGUAGE).toBe('en-US');
    });
  });

  describe('language initialization', () => {
    it('should verify i18n is initialized', () => {
      expect(i18n).toBeDefined();
      expect(i18n.isInitialized).toBe(true);
    });
  });
});


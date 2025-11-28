import { SUPPORTED_LANGUAGES, LANGUAGE_MAP, DEFAULT_LANGUAGE } from '../config';
import * as Localization from 'expo-localization';

jest.mock('expo-localization');

describe('i18n config', () => {
  it('should export SUPPORTED_LANGUAGES', () => {
    expect(SUPPORTED_LANGUAGES).toContain('pt-BR');
    expect(SUPPORTED_LANGUAGES).toContain('en-US');
    expect(SUPPORTED_LANGUAGES).toContain('fr-FR');
    expect(SUPPORTED_LANGUAGES).toContain('de-DE');
  });

  it('should export LANGUAGE_MAP', () => {
    expect(LANGUAGE_MAP.pt).toBe('pt-BR');
    expect(LANGUAGE_MAP.en).toBe('en-US');
    expect(LANGUAGE_MAP.fr).toBe('fr-FR');
    expect(LANGUAGE_MAP.de).toBe('de-DE');
  });

  it('should export DEFAULT_LANGUAGE', () => {
    expect(DEFAULT_LANGUAGE).toBe('en-US');
  });
});

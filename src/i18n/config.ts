import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, NativeModules } from 'react-native';

import ptBR from './locales/pt-BR.json';
import enUS from './locales/en-US.json';
import frFR from './locales/fr-FR.json';
import deDE from './locales/de-DE.json';

import { STORAGE_KEYS } from '@/config/storage';

export const SUPPORTED_LANGUAGES = ['pt-BR', 'en-US', 'fr-FR', 'de-DE'] as const;
export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[number];

export const LANGUAGE_MAP: Record<string, SupportedLanguage> = {
  'pt': 'pt-BR',
  'fr': 'fr-FR',
  'de': 'de-DE',
  'en': 'en-US',
};

export const DEFAULT_LANGUAGE: SupportedLanguage = 'en-US';

const getInitialLanguage = (): SupportedLanguage => {
  const deviceLanguage = Localization.getLocales()[0]?.languageCode;
  const deviceLocale = Localization.getLocales()[0]?.languageTag;
  
  if (deviceLanguage && LANGUAGE_MAP[deviceLanguage]) {
    return LANGUAGE_MAP[deviceLanguage];
  }
  
  if (deviceLocale) {
    const localeCode = deviceLocale.split('-')[0];
    if (LANGUAGE_MAP[localeCode]) {
      return LANGUAGE_MAP[localeCode];
    }
  }
  
  return DEFAULT_LANGUAGE;
};

i18n
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v4',
    resources: {
      'pt-BR': {
        translation: ptBR,
      },
      'en-US': {
        translation: enUS,
      },
      'fr-FR': {
        translation: frFR,
      },
      'de-DE': {
        translation: deDE,
      },
    },
    lng: getInitialLanguage(),
    fallbackLng: 'pt-BR',
    interpolation: {
      escapeValue: false
    },
  });

(async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE);
    
    let effectiveLanguage: SupportedLanguage;
    
    if (savedLanguage === 'system') {
      effectiveLanguage = getInitialLanguage();
      i18n.changeLanguage(effectiveLanguage);
    } else if (savedLanguage && SUPPORTED_LANGUAGES.includes(savedLanguage as SupportedLanguage)) {
      effectiveLanguage = savedLanguage as SupportedLanguage;
      i18n.changeLanguage(savedLanguage);
    } else {
      effectiveLanguage = getInitialLanguage();
    }
    
    // No iOS, salva o idioma efetivo no App Group UserDefaults
    if (Platform.OS === 'ios') {
      try {
        if (NativeModules.TokenStorage && typeof NativeModules.TokenStorage.saveLanguage === 'function') {
          await NativeModules.TokenStorage.saveLanguage(effectiveLanguage);
          console.log('✅ Idioma inicial salvo no App Group UserDefaults:', effectiveLanguage);
        }
      } catch (e) {
        console.warn('⚠️ Não foi possível salvar idioma no App Group UserDefaults:', e);
      }
    }
  } catch (error) {
    console.error('Erro ao carregar idioma salvo:', error);
  }
})();

export { i18n };
export default i18n;

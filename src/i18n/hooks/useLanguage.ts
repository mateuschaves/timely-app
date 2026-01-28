import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { Platform, NativeModules } from 'react-native';
import { i18n, SUPPORTED_LANGUAGES, LANGUAGE_MAP, DEFAULT_LANGUAGE, SupportedLanguage } from '@/i18n/config';
import { STORAGE_KEYS } from '@/config/storage';

export type LanguageOption = 'pt-BR' | 'en-US' | 'fr-FR' | 'de-DE' | 'es-ES' | 'system';

export function useLanguage() {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageOption>('system');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSavedLanguage();
  }, []);

  useEffect(() => {
    applyLanguage(currentLanguage);
  }, [currentLanguage]);

  const loadSavedLanguage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem(STORAGE_KEYS.LANGUAGE);
      if (savedLanguage === 'system' || (savedLanguage && SUPPORTED_LANGUAGES.includes(savedLanguage as SupportedLanguage))) {
        setCurrentLanguage(savedLanguage as LanguageOption);
      }
    } catch (error) {
      console.error('Erro ao carregar idioma salvo:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const applyLanguage = (language: LanguageOption) => {
    if (language === 'system') {
      const deviceLanguage = Localization.getLocales()[0]?.languageCode;
      const deviceLocale = Localization.getLocales()[0]?.languageTag;
      
      const systemLanguage = 
        (deviceLanguage && LANGUAGE_MAP[deviceLanguage]) ||
        (deviceLocale && LANGUAGE_MAP[deviceLocale.split('-')[0]]) ||
        DEFAULT_LANGUAGE;
      
      i18n.changeLanguage(systemLanguage);
    } else {
      i18n.changeLanguage(language);
    }
  };

  const changeLanguage = async (language: LanguageOption) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LANGUAGE, language);
      setCurrentLanguage(language);
      
      // No iOS, também salva no App Group UserDefaults para que o App Intent possa acessar
      if (Platform.OS === 'ios') {
        try {
          if (NativeModules.TokenStorage && typeof NativeModules.TokenStorage.saveLanguage === 'function') {
            // Determina o idioma efetivo (se for 'system', obtém o idioma do dispositivo)
            const effectiveLanguage = language === 'system' ? getEffectiveLanguage(language) : language;
            await NativeModules.TokenStorage.saveLanguage(effectiveLanguage);
            console.log('✅ Idioma salvo no App Group UserDefaults:', effectiveLanguage);
          }
        } catch (e) {
          console.warn('⚠️ Não foi possível salvar idioma no App Group UserDefaults:', e);
        }
      }
    } catch (error) {
      console.error('Erro ao salvar idioma:', error);
    }
  };

  const getEffectiveLanguage = (language: LanguageOption): SupportedLanguage => {
    if (language === 'system') {
      const deviceLanguage = Localization.getLocales()[0]?.languageCode;
      const deviceLocale = Localization.getLocales()[0]?.languageTag;
      
      return (
        (deviceLanguage && LANGUAGE_MAP[deviceLanguage]) ||
        (deviceLocale && LANGUAGE_MAP[deviceLocale.split('-')[0]]) ||
        DEFAULT_LANGUAGE
      );
    }
    return language;
  };

  const getActiveLanguage = (): SupportedLanguage => {
    if (currentLanguage === 'system') {
      const deviceLanguage = Localization.getLocales()[0]?.languageCode;
      const deviceLocale = Localization.getLocales()[0]?.languageTag;
      
      return (
        (deviceLanguage && LANGUAGE_MAP[deviceLanguage]) ||
        (deviceLocale && LANGUAGE_MAP[deviceLocale.split('-')[0]]) ||
        DEFAULT_LANGUAGE
      );
    }
    return currentLanguage;
  };

  return {
    currentLanguage,
    activeLanguage: getActiveLanguage(),
    isLoading,
    changeLanguage,
  };
}


import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Localization from 'expo-localization';
import { i18n } from '@/i18n/config';
import { STORAGE_KEYS } from '@/config/storage';

export type LanguageOption = 'pt-BR' | 'en-US' | 'fr-FR' | 'de-DE' | 'system';

/**
 * Hook para gerenciar o idioma do aplicativo
 */
export function useLanguage() {
  const [currentLanguage, setCurrentLanguage] = useState<LanguageOption>('system');
  const [isLoading, setIsLoading] = useState(true);

  // Carrega o idioma salvo ao montar
  useEffect(() => {
    loadSavedLanguage();
  }, []);

  // Aplica o idioma quando ele muda
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
      // Detecta o idioma do sistema
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
    } catch (error) {
      console.error('Erro ao salvar idioma:', error);
    }
  };

  // Retorna o idioma atual sendo usado (não a preferência)
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


import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/config/storage';
import { lightColors, darkColors, ColorScheme } from '../colors';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextData {
  theme: typeof lightColors;
  themeMode: ThemeMode;
  colorScheme: ColorScheme;
  setThemeMode: (mode: ThemeMode) => Promise<void>;
}

const ThemeContext = createContext<ThemeContextData | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useColorScheme(); // This hook is safe to call here
  const [themeMode, setThemeModeState] = useState<ThemeMode>('system');
  const [isInitialized, setIsInitialized] = useState(false);

  // Determine the effective theme based on user preference and system setting
  const getCurrentColorScheme = useCallback((): ColorScheme => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark' ? 'dark' : 'light';
    }
    return themeMode;
  }, [themeMode, systemColorScheme]);

  // Initialize colorScheme based on system, with fallback to 'light'
  const [colorScheme, setColorScheme] = useState<ColorScheme>(() => {
    return systemColorScheme || 'light';
  });

  // Load saved theme preference on app start
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(STORAGE_KEYS.THEME);
        if (savedTheme && ['light', 'dark', 'system'].includes(savedTheme)) {
          setThemeModeState(savedTheme as ThemeMode);
        }
        setIsInitialized(true);
      } catch (error) {
        console.error('Erro ao carregar tema:', error);
        setIsInitialized(true);
      }
    };
    loadTheme();
  }, []);

  // Update color scheme when theme or system changes
  useEffect(() => {
    if (isInitialized) {
      setColorScheme(getCurrentColorScheme());
    }
  }, [getCurrentColorScheme, isInitialized]);

  // Function to change theme mode and save to storage
  const setThemeMode = useCallback(async (mode: ThemeMode) => {
    try {
      setThemeModeState(mode);
      await AsyncStorage.setItem(STORAGE_KEYS.THEME, mode);
    } catch (error) {
      console.error('Erro ao salvar tema:', error);
    }
  }, []);

  const theme = useMemo(() => {
    const currentScheme = isInitialized ? getCurrentColorScheme() : colorScheme;
    return currentScheme === 'dark' ? darkColors : lightColors;
  }, [colorScheme, isInitialized, getCurrentColorScheme]);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        themeMode,
        colorScheme,
        setThemeMode,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}

import React, { useMemo } from 'react';
import { ThemeProvider as StyledThemeProvider } from 'styled-components/native';
import { useTheme } from './context/ThemeContext';
import { spacing, borderRadius, typography, shadows as shadowConstants } from './constants'; // Import constants
import { lightColors } from './colors';

interface ThemeWrapperProps {
  children: React.ReactNode;
}

/**
 * Wrapper que injeta o tema do contexto no ThemeProvider do styled-components
 * Isso permite que todos os styled components recebam o tema automaticamente
 */
export function ThemeWrapper({ children }: ThemeWrapperProps) {
  const { theme, colorScheme } = useTheme();

  // Cria um objeto de tema completo para o styled-components usando useMemo para evitar recriações
  const styledTheme = useMemo(() => {
    // Sempre garanta que temos um tema válido
    const baseTheme = theme && theme.primary ? theme : lightColors;
    const themePrimary = (theme && theme.primary) ? theme.primary : lightColors.primary;
    
    return {
      ...baseTheme,
      colorScheme: colorScheme || 'light',
      spacing,
      borderRadius,
      typography,
      shadows: {
        sm: {
          ...shadowConstants.sm,
          shadowColor: themePrimary,
        },
        md: {
          ...shadowConstants.md,
          shadowColor: themePrimary,
        },
        lg: {
          ...shadowConstants.lg,
          shadowColor: themePrimary,
        },
      },
    };
  }, [theme, colorScheme]);

  return (
    <StyledThemeProvider theme={styledTheme}>
      {children}
    </StyledThemeProvider>
  );
}

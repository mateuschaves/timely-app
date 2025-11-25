/**
 * Tema de cores centralizado
 * 
 * Define todas as cores usadas no aplicativo
 */

export const colors = {
  // Cores primárias
  primary: '#000000',
  primaryLight: '#1a1a1a',
  primaryDark: '#000000',
  
  // Cores secundárias
  secondary: '#ffffff',
  secondaryLight: '#f5f5f5',
  secondaryDark: '#e0e0e0',
  
  // Cores de texto
  text: {
    primary: '#000000',
    secondary: '#666666',
    tertiary: '#999999',
    inverse: '#ffffff',
  },
  
  // Cores de fundo
  background: {
    primary: '#ffffff',
    secondary: '#f5f5f5',
    tertiary: '#000000',
  },
  
  // Cores de borda
  border: {
    light: '#e0e0e0',
    medium: '#cccccc',
    dark: '#000000',
  },
  
  // Cores de ação
  action: {
    primary: '#000000',
    secondary: '#ffffff',
    danger: '#dc3545',
    success: '#28a745',
  },
  
  // Cores de estado
  status: {
    success: '#28a745',
    error: '#dc3545',
    warning: '#ffc107',
    info: '#007AFF',
  },
} as const;

export type ColorKey = keyof typeof colors;
export type TextColorKey = keyof typeof colors.text;
export type BackgroundColorKey = keyof typeof colors.background;
export type BorderColorKey = keyof typeof colors.border;
export type ActionColorKey = keyof typeof colors.action;
export type StatusColorKey = keyof typeof colors.status;


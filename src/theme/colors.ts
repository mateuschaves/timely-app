export const lightColors = {
  primary: '#000000',
  secondary: '#ffffff',
  
  text: {
    primary: '#000000',
    secondary: '#666666',
    tertiary: '#999999',
    inverse: '#ffffff',
  },
  
  background: {
    primary: '#ffffff',
    secondary: '#f5f5f5',
    tertiary: '#000000',
  },
  
  border: {
    light: '#e0e0e0',
    medium: '#cccccc',
    dark: '#000000',
  },
  
  action: {
    primary: '#000000',
    secondary: '#ffffff',
    danger: '#dc3545',
    success: '#28a745',
  },
  
  status: {
    success: '#28a745',
    error: '#dc3545',
    warning: '#ffc107',
    info: '#007AFF',
    warningDark: '#8B6914',
  },
  
  tabBar: {
    background: '#ffffff',
    activeTint: '#000000',
    inactiveTint: '#8e8e93',
  },
} as const;

export const darkColors = {
  primary: '#ffffff',
  secondary: '#000000',
  
  text: {
    primary: '#ffffff',
    secondary: '#cccccc',
    tertiary: '#999999',
    inverse: '#000000',
  },
  
  background: {
    primary: '#121212',
    secondary: '#1e1e1e',
    tertiary: '#ffffff',
  },
  
  border: {
    light: '#333333',
    medium: '#666666',
    dark: '#ffffff',
  },
  
  action: {
    primary: '#ffffff',
    secondary: '#000000',
    danger: '#dc3545',
    success: '#28a745',
  },
  
  status: {
    success: '#28a745',
    error: '#dc3545',
    warning: '#ffc107',
    info: '#007AFF',
    warningDark: '#FFD700',
  },
  
  tabBar: {
    background: '#121212',
    activeTint: '#ffffff',
    inactiveTint: '#8e8e93',
  },
} as const;

// Export colors para compatibilidade com código existente
export const colors = lightColors;

export type ColorScheme = 'light' | 'dark';
export type ColorKey = keyof typeof lightColors;
export type TextColorKey = keyof typeof lightColors.text;
export type BackgroundColorKey = keyof typeof lightColors.background;
export type BorderColorKey = keyof typeof lightColors.border;
export type ActionColorKey = keyof typeof lightColors.action;
export type StatusColorKey = keyof typeof lightColors.status;
export type TabBarColorKey = keyof typeof lightColors.tabBar;


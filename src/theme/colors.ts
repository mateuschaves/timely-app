export const colors = {
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
  },
  
  tabBar: {
    background: '#ffffff',
    activeTint: '#000000',
    inactiveTint: '#8e8e93',
  },
} as const;

export type ColorKey = keyof typeof colors;
export type TextColorKey = keyof typeof colors.text;
export type BackgroundColorKey = keyof typeof colors.background;
export type BorderColorKey = keyof typeof colors.border;
export type ActionColorKey = keyof typeof colors.action;
export type StatusColorKey = keyof typeof colors.status;
export type TabBarColorKey = keyof typeof colors.tabBar;


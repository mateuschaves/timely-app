import React from 'react';
import { TouchableOpacityProps } from 'react-native';

export interface ButtonProps extends TouchableOpacityProps {
  /**
   * The title text to display in the button
   */
  title: string;
  
  /**
   * Optional icon to show to the left of the title
   */
  leftIcon?: React.ReactNode;
  
  /**
   * When true, uses smaller height and auto width (sizes to content)
   */
  compact?: boolean;
  
  /**
   * Whether the button is in a loading state
   * When true, shows an ActivityIndicator, hides text, and disables interaction
   */
  isLoading?: boolean;
  
  /**
   * Whether the button represents a destructive action (e.g., delete)
   * When true, applies red styling using theme.action.danger
   */
  destructive?: boolean;
  
  /**
   * The visual variant of the button
   * - 'primary': Filled button with primary color (default)
   * - 'secondary': Transparent button with secondary text color
   * - 'outline': Button with border and no background
   */
  variant?: 'primary' | 'secondary' | 'outline';
}

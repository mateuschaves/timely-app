import { TouchableOpacityProps } from 'react-native';

export interface ButtonProps extends TouchableOpacityProps {
  /**
   * The title text to display in the button
   */
  title: string;
  
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
}

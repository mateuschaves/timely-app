import React from 'react';
import { TouchableOpacityProps } from 'react-native';
import { StyledButton, ButtonText, LoadingIndicator } from './styles';

export interface ButtonProps extends TouchableOpacityProps {
  /**
   * Text to display on the button
   */
  children: string;
  
  /**
   * Shows loading indicator and disables the button
   * Prevents double clicks
   */
  isLoading?: boolean;
  
  /**
   * Variant for destructive actions (delete, remove, etc.)
   * Changes button to red color
   */
  destructive?: boolean;
}

export function Button({ 
  children, 
  isLoading = false, 
  destructive = false,
  disabled,
  ...rest 
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <StyledButton
      disabled={isDisabled}
      destructive={destructive}
      {...rest}
    >
      {isLoading ? (
        <LoadingIndicator destructive={destructive} testID="button-loading-indicator" />
      ) : (
        <ButtonText destructive={destructive}>{children}</ButtonText>
      )}
    </StyledButton>
  );
}

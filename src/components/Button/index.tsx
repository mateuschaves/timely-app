import React from 'react';
import { ButtonProps } from './types';
import { StyledButton, ButtonText, LoadingIndicator } from './styles';

/**
 * Reusable Button component with theme-aware styling, loading states, and destructive action support
 * 
 * @example
 * ```tsx
 * // Basic button
 * <Button title="Submit" onPress={handleSubmit} />
 * 
 * // Loading state
 * <Button title="Saving..." isLoading={true} />
 * 
 * // Destructive action
 * <Button title="Delete" destructive onPress={handleDelete} />
 * ```
 */
export const Button: React.FC<ButtonProps> = ({
  title,
  isLoading = false,
  destructive = false,
  disabled,
  ...touchableOpacityProps
}) => {
  // Prevent interaction when loading or disabled
  const isDisabled = disabled || isLoading;

  return (
    <StyledButton
      {...touchableOpacityProps}
      disabled={isDisabled}
      destructive={destructive}
      activeOpacity={0.7}
    >
      {isLoading ? (
        <LoadingIndicator />
      ) : (
        <ButtonText>{title}</ButtonText>
      )}
    </StyledButton>
  );
};

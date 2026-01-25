import React from 'react';
import { ButtonProps } from './types';
import { StyledButton, ButtonText, LoadingIndicator } from './styles';
import { useTheme } from '@/theme/context/ThemeContext';

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
 * 
 * // Secondary variant
 * <Button title="Skip" variant="secondary" onPress={handleSkip} />
 * 
 * // Outline variant
 * <Button title="Cancel" variant="outline" onPress={handleCancel} />
 * ```
 */
export const Button: React.FC<ButtonProps> = ({
  title,
  leftIcon,
  compact = false,
  isLoading = false,
  destructive = false,
  variant = 'primary',
  disabled,
  ...touchableOpacityProps
}) => {
  const { theme } = useTheme();
  
  // Prevent interaction when loading or disabled
  const isDisabled = disabled || isLoading;

  return (
    <StyledButton
      {...touchableOpacityProps}
      disabled={isDisabled}
      destructive={destructive}
      variant={variant}
      compact={compact}
      activeOpacity={0.7}
    >
      {isLoading ? (
        <LoadingIndicator variant={variant} theme={theme} />
      ) : (
        <>
          {leftIcon}
          <ButtonText variant={variant} destructive={destructive}>{title}</ButtonText>
        </>
      )}
    </StyledButton>
  );
};

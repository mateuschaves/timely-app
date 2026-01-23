import styled from 'styled-components/native';
import { ActivityIndicator } from 'react-native';
import { spacing, borderRadius, typography } from '@/theme';

export const StyledButton = styled.TouchableOpacity<{
  theme: any;
  disabled?: boolean;
  destructive?: boolean;
  variant?: 'primary' | 'secondary' | 'outline';
}>`
  width: 100%;
  height: 50px;
  background-color: ${({ theme, destructive, variant }) => {
    if (variant === 'outline' || variant === 'secondary') return 'transparent';
    return destructive ? theme.action.danger : theme.action.primary;
  }};
  border-radius: ${borderRadius.md}px;
  justify-content: center;
  align-items: center;
  opacity: ${props => (props.disabled ? 0.6 : 1)};
  border-width: ${props => (props.variant === 'outline' ? '2px' : '0px')};
  border-color: ${props => {
    if (props.variant === 'outline') {
      return props.destructive ? props.theme.action.danger : props.theme.primary;
    }
    return 'transparent';
  }};
`;

export const ButtonText = styled.Text<{ 
  theme: any;
  variant?: 'primary' | 'secondary' | 'outline';
  destructive?: boolean;
}>`
  color: ${({ theme, variant, destructive }) => {
    if (variant === 'secondary') return theme.text.secondary;
    if (variant === 'outline') {
      return destructive ? theme.action.danger : theme.primary;
    }
    return theme.text.inverse;
  }};
  font-size: ${typography.sizes.lg}px;
  font-weight: ${({ variant }) => 
    variant === 'secondary' ? typography.weights.medium : typography.weights.semibold};
`;

export const LoadingIndicator = styled(ActivityIndicator).attrs<{ 
  theme: any;
  variant?: 'primary' | 'secondary' | 'outline';
}>(({ theme, variant }) => ({
  color: variant === 'secondary' ? theme.text.secondary : 
         variant === 'outline' ? theme.primary : theme.text.inverse,
  size: 'small',
}))``;

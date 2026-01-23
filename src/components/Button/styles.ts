import styled from 'styled-components/native';
import { ActivityIndicator } from 'react-native';
import { spacing, borderRadius, typography } from '@/theme';

interface StyledButtonProps {
  disabled?: boolean;
  destructive?: boolean;
  theme: any;
}

interface ButtonTextProps {
  destructive?: boolean;
  theme: any;
}

interface LoadingIndicatorProps {
  destructive?: boolean;
  theme: any;
}

export const StyledButton = styled.TouchableOpacity<StyledButtonProps>`
  width: 100%;
  height: 50px;
  background-color: ${({ theme, destructive }) => 
    destructive ? theme.action.danger : theme.action.primary};
  border-radius: ${borderRadius.md}px;
  justify-content: center;
  align-items: center;
  opacity: ${props => (props.disabled ? 0.6 : 1)};
`;

export const ButtonText = styled.Text<ButtonTextProps>`
  color: ${({ theme, destructive }) => 
    destructive ? theme.text.inverse : theme.text.inverse};
  font-size: ${typography.sizes.lg}px;
  font-weight: ${typography.weights.semibold};
`;

export const LoadingIndicator = styled(ActivityIndicator).attrs<LoadingIndicatorProps>(({ theme, destructive }) => ({
  color: theme.text.inverse,
  size: 'small',
}))``;

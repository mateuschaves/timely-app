import styled from 'styled-components/native';
import { ActivityIndicator } from 'react-native';
import { spacing, borderRadius, typography } from '@/theme';

export const StyledButton = styled.TouchableOpacity<{
  theme: any;
  disabled?: boolean;
  destructive?: boolean;
}>`
  width: 100%;
  height: 50px;
  background-color: ${({ theme, destructive, disabled }) => {
    if (disabled) {
      return destructive ? theme.action.danger : theme.action.primary;
    }
    return destructive ? theme.action.danger : theme.action.primary;
  }};
  border-radius: ${borderRadius.md}px;
  justify-content: center;
  align-items: center;
  opacity: ${props => (props.disabled ? 0.6 : 1)};
`;

export const ButtonText = styled.Text<{ theme: any }>`
  color: ${({ theme }) => theme.text.inverse};
  font-size: ${typography.sizes.lg}px;
  font-weight: ${typography.weights.semibold};
`;

export const LoadingIndicator = styled(ActivityIndicator).attrs<{ theme: any }>(
  ({ theme }) => ({
    color: theme.text.inverse,
    size: 'small',
  })
)``;

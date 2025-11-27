import styled from 'styled-components/native';
import { colors, spacing, borderRadius, typography } from '@/theme';

export const Container = styled.SafeAreaView`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: ${spacing.lg}px;
  padding-bottom: 100px;
  background-color: ${colors.background.primary};
`;

export const Title = styled.Text`
  font-size: ${typography.sizes.xxl}px;
  font-weight: ${typography.weights.bold};
  margin-bottom: ${spacing.sm}px;
  color: ${colors.text.primary};
`;

export const Subtitle = styled.Text`
  font-size: ${typography.sizes.md}px;
  color: ${colors.text.secondary};
  margin-bottom: ${spacing.xxl}px;
`;

interface ButtonProps {
  variant?: 'primary' | 'outline' | 'secondary';
  disabled?: boolean;
}

export const Button = styled.TouchableOpacity<ButtonProps>`
  width: 100%;
  padding: ${spacing.md}px;
  border-radius: ${borderRadius.md}px;
  margin-bottom: ${spacing.sm}px;
  background-color: ${props => {
    if (props.variant === 'outline') return 'transparent';
    if (props.variant === 'secondary') return colors.text.tertiary;
    return colors.primary;
  }};
  border-width: ${props => (props.variant === 'outline' ? '2px' : '0px')};
  border-color: ${props => (props.variant === 'outline' ? colors.primary : 'transparent')};
  opacity: ${props => (props.disabled ? 0.6 : 1)};
`;

interface ButtonTextProps {
  variant?: 'primary' | 'outline' | 'secondary';
}

export const ButtonText = styled.Text<ButtonTextProps>`
  color: ${props => {
    if (props.variant === 'outline') return colors.primary;
    return colors.text.inverse;
  }};
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.semibold};
  text-align: center;
`;

export const DeeplinkMessage = styled.Text`
  background-color: ${colors.status.success}20;
  color: ${colors.status.success};
  padding: ${spacing.sm}px;
  border-radius: ${borderRadius.md}px;
  margin-bottom: ${spacing.lg}px;
  font-size: ${typography.sizes.xs}px;
  text-align: center;
  width: 100%;
  border-width: 1px;
  border-color: ${colors.status.success}40;
`;


import styled from 'styled-components/native';
import { colors, spacing, borderRadius, typography } from '@/theme';

export const Container = styled.SafeAreaView`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: ${spacing.lg}px;
  padding-bottom: 100px;
  padding-top: ${spacing.md}px;
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

export const WelcomeCard = styled.View`
  background-color: ${colors.background.secondary};
  border-radius: ${borderRadius.lg}px;
  padding: ${spacing.lg}px;
  margin-bottom: ${spacing.xl}px;
  width: 100%;
  align-items: center;
`;

export const WelcomeMessage = styled.Text`
  font-size: ${typography.sizes.xl}px;
  font-weight: ${typography.weights.semibold};
  color: ${colors.text.primary};
  text-align: center;
  margin-bottom: ${spacing.sm}px;
`;

export const StatusCard = styled.View`
  background-color: ${colors.background.secondary};
  border-radius: ${borderRadius.lg}px;
  padding: ${spacing.lg}px;
  margin-bottom: ${spacing.xl}px;
  width: 100%;
  align-items: center;
`;

export const StatusMessage = styled.Text`
  font-size: ${typography.sizes.lg}px;
  font-weight: ${typography.weights.medium};
  color: ${colors.text.primary};
  text-align: center;
  margin-bottom: ${spacing.sm}px;
`;

export const LastEventInfo = styled.Text`
  font-size: ${typography.sizes.sm}px;
  color: ${colors.text.secondary};
  text-align: center;
`;

export const LastEventTime = styled.Text`
  font-weight: ${typography.weights.semibold};
  color: ${colors.text.primary};
`;

export const ButtonContainer = styled.View`
  width: 100%;
  align-items: center;
  justify-content: center;
  flex: 1;
`;

export const ClockButton = styled.TouchableOpacity`
  width: 200px;
  height: 200px;
  border-radius: ${borderRadius.round}px;
  background-color: ${colors.primary};
  align-items: center;
  justify-content: center;
  position: relative;
`;

export const ClockButtonInner = styled.View`
  align-items: center;
  justify-content: center;
  z-index: 1;
`;

export const ClockButtonText = styled.Text`
  color: ${colors.text.inverse};
  font-size: ${typography.sizes.xl}px;
  font-weight: ${typography.weights.bold};
`;

export const ConfirmModal = styled.View`
  flex: 1;
  background-color: ${colors.background.tertiary}80;
  justify-content: center;
  align-items: center;
  padding: ${spacing.lg}px;
`;

export const ConfirmModalContent = styled.View`
  background-color: ${colors.background.primary};
  border-radius: ${borderRadius.lg}px;
  padding: ${spacing.xl}px;
  width: 100%;
  max-width: 400px;
`;

export const ConfirmModalTitle = styled.Text`
  font-size: ${typography.sizes.xl}px;
  font-weight: ${typography.weights.bold};
  color: ${colors.text.primary};
  margin-bottom: ${spacing.md}px;
  text-align: center;
`;

export const ConfirmModalMessage = styled.Text`
  font-size: ${typography.sizes.md}px;
  color: ${colors.text.secondary};
  margin-bottom: ${spacing.xl}px;
  text-align: center;
`;

export const ConfirmModalActions = styled.View`
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

export const ConfirmButton = styled.TouchableOpacity`
  background-color: ${colors.primary};
  padding: ${spacing.md}px ${spacing.xl}px;
  border-radius: ${borderRadius.md}px;
  opacity: ${props => (props.disabled ? 0.6 : 1)};
`;

export const CancelButton = styled.TouchableOpacity`
  background-color: ${colors.background.secondary};
  padding: ${spacing.md}px ${spacing.xl}px;
  border-radius: ${borderRadius.md}px;
`;

export const ConfirmButtonText = styled.Text`
  color: ${colors.text.inverse};
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.semibold};
  text-align: center;
`;

export const CancelButtonText = styled.Text`
  color: ${colors.text.primary};
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.semibold};
  text-align: center;
`;


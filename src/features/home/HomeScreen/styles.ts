import styled from 'styled-components/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing, borderRadius, typography } from '@/theme';

export const Container = styled(SafeAreaView)<{ theme: any }>`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding-top: ${spacing.md}px;
  padding-bottom: 200px;
  padding-left: 0px;
  padding-right: 0px;
  background-color: ${({ theme }) => theme.background.primary};
`;

export const Title = styled.Text<{ theme: any }>`
  font-size: ${typography.sizes.xxl}px;
  font-weight: ${typography.weights.bold};
  margin-bottom: ${spacing.sm}px;
  color: ${({ theme }) => theme.text.primary};
`;

export const Subtitle = styled.Text<{ theme: any }>`
  font-size: ${typography.sizes.md}px;
  color: ${({ theme }) => theme.text.secondary};
  margin-bottom: ${spacing.xxl}px;
`;

interface ButtonProps {
  variant?: 'primary' | 'outline' | 'secondary';
  disabled?: boolean;
}

export const Button = styled.TouchableOpacity<ButtonProps & { theme: any }>`
  width: 100%;
  padding: ${spacing.md}px;
  border-radius: ${borderRadius.md}px;
  margin-bottom: ${spacing.sm}px;
  background-color: ${props => {
    if (props.variant === 'outline') return 'transparent';
    if (props.variant === 'secondary') return props.theme.text.tertiary;
    return props.theme.primary;
  }};
  border-width: ${props => (props.variant === 'outline' ? '2px' : '0px')};
  border-color: ${props => (props.variant === 'outline' ? props.theme.primary : 'transparent')};
  opacity: ${props => (props.disabled ? 0.6 : 1)};
`;

interface ButtonTextProps {
  variant?: 'primary' | 'outline' | 'secondary';
}

export const ButtonText = styled.Text<ButtonTextProps & { theme: any }>`
  color: ${props => {
    if (props.variant === 'outline') return props.theme.primary;
    return props.theme.text.inverse;
  }};
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.semibold};
  text-align: center;
`;

export const DeeplinkMessage = styled.Text<{ theme: any }>`
  background-color: ${({ theme }) => theme.status.success}20;
  color: ${({ theme }) => theme.status.success};
  padding: ${spacing.sm}px;
  border-radius: ${borderRadius.md}px;
  margin-bottom: ${spacing.lg}px;
  font-size: ${typography.sizes.xs}px;
  text-align: center;
  width: 100%;
  border-width: 1px;
  border-color: ${({ theme }) => theme.status.success}40;
`;

export const WelcomeCard = styled.View<{ theme: any }>`
  background-color: ${({ theme }) => theme.background.secondary};
  border-radius: ${borderRadius.lg}px;
  padding: ${spacing.lg}px;
  margin-bottom: ${spacing.xl}px;
  width: 100%;
  align-items: center;
`;

export const WelcomeMessage = styled.Text<{ theme: any }>`
  font-size: ${typography.sizes.xl}px;
  font-weight: ${typography.weights.semibold};
  color: ${({ theme }) => theme.text.primary};
  text-align: center;
  margin-bottom: ${spacing.sm}px;
`;

export const StatusCard = styled.View<{ theme: any }>`
  background-color: ${({ theme }) => theme.background.secondary};
  border-radius: ${borderRadius.lg}px;
  padding: ${spacing.lg}px;
  margin-bottom: ${spacing.xl}px;
  width: 100%;
  align-items: center;
`;

export const StatusMessage = styled.Text<{ theme: any }>`
  font-size: ${typography.sizes.lg}px;
  font-weight: ${typography.weights.medium};
  color: ${({ theme }) => theme.text.primary};
  text-align: center;
  margin-bottom: ${spacing.sm}px;
`;

export const LastEventInfo = styled.Text<{ theme: any }>`
  font-size: ${typography.sizes.sm}px;
  color: ${({ theme }) => theme.text.secondary};
  text-align: center;
`;

export const LastEventTime = styled.Text<{ theme: any }>`
  font-weight: ${typography.weights.semibold};
  color: ${({ theme }) => theme.text.primary};
`;

export const ButtonContainer = styled.View`
  width: 100%;
  align-items: center;
  justify-content: center;
  flex: 1;
`;

export const ClockButton = styled.TouchableOpacity<{ theme: any }>`
  width: 240px;
  height: 240px;
  border-radius: ${borderRadius.round}px;
  background-color: ${({ theme }) => theme.colorScheme === 'dark' ? '#1a1a1a' : theme.primary};
  align-items: center;
  justify-content: center;
  position: relative;
  padding-horizontal: ${spacing.md}px;
`;

export const ClockButtonInner = styled.View`
  align-items: center;
  justify-content: center;
  z-index: 1;
  width: 100%;
`;

export const ClockButtonText = styled.Text<{ theme: any }>`
  color: ${({ theme }) => theme.colorScheme === 'dark' ? theme.text.primary : theme.text.inverse};
  font-size: ${typography.sizes.xl}px;
  font-weight: ${typography.weights.bold};
  text-align: center;
  flex-wrap: wrap;
  padding-horizontal: ${spacing.md}px;
`;

export const ClockButtonLoadingContainer = styled.View`
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
`;

export const ConfirmModal = styled.View<{ theme: any }>`
  flex: 1;
  background-color: ${({ theme }) => theme.background.tertiary}80;
  justify-content: center;
  align-items: center;
  padding: ${spacing.lg}px;
`;

export const ConfirmModalContent = styled.View<{ theme: any }>`
  background-color: ${({ theme }) => theme.background.primary};
  border-radius: ${borderRadius.lg}px;
  padding: ${spacing.xl}px;
  width: 100%;
  max-width: 400px;
`;

export const ConfirmModalTitle = styled.Text<{ theme: any }>`
  font-size: ${typography.sizes.xl}px;
  font-weight: ${typography.weights.bold};
  color: ${({ theme }) => theme.text.primary};
  margin-bottom: ${spacing.md}px;
  text-align: center;
`;

export const ConfirmModalMessage = styled.Text<{ theme: any }>`
  font-size: ${typography.sizes.md}px;
  color: ${({ theme }) => theme.text.secondary};
  margin-bottom: ${spacing.xl}px;
  text-align: center;
`;

export const ConfirmModalActions = styled.View`
  flex-direction: row;
  justify-content: center;
  align-items: center;
`;

export const ConfirmButton = styled.TouchableOpacity<{ theme: any }>`
  background-color: ${({ theme }) => theme.primary};
  padding: ${spacing.md}px ${spacing.xl}px;
  border-radius: ${borderRadius.md}px;
  opacity: ${props => (props.disabled ? 0.6 : 1)};
`;

export const CancelButton = styled.TouchableOpacity<{ theme: any }>`
  background-color: ${({ theme }) => theme.background.secondary};
  padding: ${spacing.md}px ${spacing.xl}px;
  border-radius: ${borderRadius.md}px;
`;

export const ConfirmButtonText = styled.Text<{ theme: any }>`
  color: ${({ theme }) => theme.text.inverse};
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.semibold};
  text-align: center;
`;

export const CancelButtonText = styled.Text<{ theme: any }>`
  color: ${({ theme }) => theme.text.primary};
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.semibold};
  text-align: center;
`;

export const WorkSettingsCard = styled.TouchableOpacity<{ theme: any }>`
  background-color: ${({ theme }) => theme.colorScheme === 'dark' ? '#2A2415' : '#FFF8DC'};
  border-radius: ${borderRadius.lg}px;
  padding: ${spacing.md}px ${spacing.lg}px;
  border-width: 1.5px;
  border-color: ${({ theme }) => theme.status.warning}60;
  shadow-color: ${({ theme }) => theme.status.warning}30;
  shadow-offset: 0px 2px;
  shadow-opacity: 0.2;
  shadow-radius: 4px;
  elevation: 3;
  width: 100%;
`;

export const WorkSettingsCardContent = styled.View`
  flex-direction: row;
  align-items: center;
  width: 100%;
  flex-wrap: wrap;
`;

export const WorkSettingsCardIcon = styled.View`
  margin-right: ${spacing.sm}px;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

export const WorkSettingsCardMessage = styled.Text<{ theme: any }>`
  font-size: ${typography.sizes.sm}px;
  color: ${({ theme }) => theme.status.warningDark || '#8B6914'};
  flex: 1;
  line-height: 18px;
  font-weight: ${typography.weights.semibold};
`;

export const WorkSettingsCardCloseButton = styled.TouchableOpacity`
  margin-left: ${spacing.sm}px;
  padding: ${spacing.xs}px;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

import styled from 'styled-components/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography } from '@/theme';

export const Container = styled(SafeAreaView)`
  flex: 1;
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
  margin-bottom: ${spacing.lg}px;
`;

export const StatusCard = styled.View`
  background-color: ${colors.background.secondary};
  border-radius: ${borderRadius.lg}px;
  padding: ${spacing.md}px ${spacing.lg}px;
  margin-bottom: ${spacing.xxl}px;
  align-items: center;
  width: 100%;
  margin-top: ${spacing.md}px;
`;

export const ButtonContainer = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

export const StatusMessage = styled.Text`
  font-size: ${typography.sizes.lg}px;
  font-weight: ${typography.weights.semibold};
  color: ${colors.text.primary};
  text-align: center;
  margin-bottom: ${spacing.xs}px;
`;

export const LastEventInfo = styled.Text`
  font-size: ${typography.sizes.sm}px;
  color: ${colors.text.secondary};
  text-align: center;
`;

export const LastEventTime = styled.Text`
  font-size: ${typography.sizes.sm}px;
  font-weight: ${typography.weights.semibold};
  color: ${colors.text.primary};
`;

export const ClockButton = styled.TouchableOpacity<{ disabled?: boolean }>`
  width: 200px;
  height: 200px;
  border-radius: 100px;
  background-color: ${colors.primary};
  align-items: center;
  justify-content: center;
  opacity: ${props => (props.disabled ? 0.6 : 1)};
  position: relative;
  overflow: visible;
`;

export const ClockButtonInner = styled.View`
  width: 100%;
  height: 100%;
  border-radius: 100px;
  background-color: ${colors.primary};
  align-items: center;
  justify-content: center;
  z-index: 1;
`;

export const ClockButtonText = styled.Text`
  color: ${colors.text.inverse};
  font-size: ${typography.sizes.lg}px;
  font-weight: ${typography.weights.bold};
  text-align: center;
`;

export const ConfirmModal = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
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
  align-items: center;
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
  text-align: center;
  margin-bottom: ${spacing.xl}px;
  line-height: 24px;
`;

export const ConfirmModalActions = styled.View`
  flex-direction: row;
  width: 100%;
`;

export const ConfirmButton = styled.TouchableOpacity<{ disabled?: boolean }>`
  flex: 1;
  background-color: ${colors.primary};
  border-radius: ${borderRadius.md}px;
  padding: ${spacing.md}px;
  align-items: center;
  justify-content: center;
  opacity: ${props => (props.disabled ? 0.6 : 1)};
`;

export const ConfirmButtonText = styled.Text`
  color: ${colors.text.inverse};
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.semibold};
`;

export const CancelButton = styled.TouchableOpacity`
  flex: 1;
  background-color: ${colors.background.secondary};
  border-radius: ${borderRadius.md}px;
  padding: ${spacing.md}px;
  align-items: center;
  justify-content: center;
  border-width: 1px;
  border-color: ${colors.border.medium};
`;

export const CancelButtonText = styled.Text`
  color: ${colors.text.primary};
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.semibold};
`;


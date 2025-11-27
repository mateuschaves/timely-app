import styled from 'styled-components/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography, shadows } from '@/theme';

export const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: ${colors.background.secondary};
`;

export const Header = styled.View`
  flex-direction: row;
  align-items: center;
  padding: ${spacing.md}px ${spacing.lg}px;
  background-color: transparent;
  position: relative;
`;

export const BackButton = styled.TouchableOpacity`
  padding: ${spacing.sm}px;
  position: absolute;
  left: ${spacing.sm}px;
  z-index: 1;
`;

export const HeaderTitle = styled.Text`
  font-size: ${typography.sizes.lg}px;
  font-weight: ${typography.weights.semibold};
  color: ${colors.text.primary};
  flex: 1;
  text-align: center;
`;

export const Content = styled.View`
  flex: 1;
  padding: ${spacing.lg}px;
`;

export const InputCard = styled.View`
  background-color: ${colors.background.primary};
  border-radius: ${borderRadius.lg}px;
  padding: ${spacing.md}px;
  margin-bottom: ${spacing.lg}px;
  shadow-color: ${shadows.sm.shadowColor};
  shadow-offset: ${shadows.sm.shadowOffset.width}px ${shadows.sm.shadowOffset.height}px;
  shadow-opacity: ${shadows.sm.shadowOpacity};
  shadow-radius: ${shadows.sm.shadowRadius}px;
  elevation: ${shadows.sm.elevation};
`;

export const InputLabel = styled.Text`
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.semibold};
  color: ${colors.text.primary};
  margin-bottom: ${spacing.sm}px;
`;

export const TimeInput = styled.TextInput`
  background-color: ${colors.background.secondary};
  border-radius: ${borderRadius.md}px;
  padding: ${spacing.md}px ${spacing.lg}px;
  min-height: 56px;
  font-size: ${typography.sizes.xl}px;
  color: ${colors.text.primary};
  font-weight: ${typography.weights.semibold};
  text-align: center;
`;

export const ActionsContainer = styled.View`
  gap: ${spacing.md}px;
`;

export const SaveButton = styled.TouchableOpacity<{ disabled?: boolean }>`
  background-color: ${colors.primary};
  border-radius: ${borderRadius.lg}px;
  padding: ${spacing.md}px ${spacing.lg}px;
  align-items: center;
  justify-content: center;
  opacity: ${(props: { disabled?: boolean }) => (props.disabled ? 0.6 : 1)};
`;

export const SaveButtonText = styled.Text`
  color: ${colors.text.inverse};
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.semibold};
`;

export const DeleteButton = styled.TouchableOpacity<{ disabled?: boolean }>`
  background-color: ${colors.background.primary};
  border-radius: ${borderRadius.lg}px;
  padding: ${spacing.md}px ${spacing.lg}px;
  align-items: center;
  justify-content: center;
  border-width: 1px;
  border-color: ${colors.status.error};
  opacity: ${(props: { disabled?: boolean }) => (props.disabled ? 0.6 : 1)};
`;

export const DeleteButtonText = styled.Text`
  color: ${colors.status.error};
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.semibold};
`;


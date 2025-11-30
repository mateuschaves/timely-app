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

export const BackButton = styled.TouchableOpacity<{ disabled?: boolean }>`
  padding: ${spacing.sm}px;
  position: absolute;
  left: ${spacing.sm}px;
  z-index: 1;
  opacity: ${props => (props.disabled ? 0.5 : 1)};
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
`;

export const ScrollContent = styled.ScrollView`
  flex: 1;
  padding: ${spacing.lg}px;
`;

export const Section = styled.View`
  margin-bottom: ${spacing.xl}px;
`;

export const SectionTitle = styled.Text`
  font-size: ${typography.sizes.lg}px;
  font-weight: ${typography.weights.semibold};
  color: ${colors.text.primary};
  margin-bottom: ${spacing.sm}px;
`;

export const SectionDescription = styled.Text`
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.regular};
  color: ${colors.text.secondary};
  line-height: ${typography.sizes.md * 1.5}px;
  margin-bottom: ${spacing.md}px;
`;

export const ReasonOption = styled.TouchableOpacity<{ disabled?: boolean }>`
  background-color: ${colors.background.primary};
  border-radius: ${borderRadius.md}px;
  padding: ${spacing.md}px;
  margin-bottom: ${spacing.sm}px;
  shadow-color: ${shadows.sm.shadowColor};
  shadow-offset: ${shadows.sm.shadowOffset.width}px ${shadows.sm.shadowOffset.height}px;
  shadow-opacity: ${shadows.sm.shadowOpacity};
  shadow-radius: ${shadows.sm.shadowRadius}px;
  elevation: ${shadows.sm.elevation};
  opacity: ${props => (props.disabled ? 0.6 : 1)};
`;

export const ReasonOptionContent = styled.View`
  flex-direction: row;
  align-items: center;
`;

export const RadioButton = styled.View`
  width: 24px;
  height: 24px;
  border-radius: 12px;
  border-width: 2px;
  border-color: ${colors.primary};
  margin-right: ${spacing.md}px;
  align-items: center;
  justify-content: center;
`;

export const RadioButtonSelected = styled.View`
  width: 12px;
  height: 12px;
  border-radius: 6px;
  background-color: ${colors.primary};
`;

export const ReasonOptionText = styled.Text`
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.regular};
  color: ${colors.text.primary};
  flex: 1;
`;

export const CustomReasonContainer = styled.View`
  margin-top: ${spacing.md}px;
  margin-left: ${spacing.xl + spacing.md}px;
`;

export const CustomReasonInput = styled.TextInput`
  background-color: ${colors.background.primary};
  border-radius: ${borderRadius.md}px;
  padding: ${spacing.md}px ${spacing.lg}px;
  font-size: ${typography.sizes.md}px;
  color: ${colors.text.primary};
  font-weight: ${typography.weights.regular};
  min-height: 100px;
  border-width: 1px;
  border-color: ${colors.border.light};
`;

export const WarningText = styled.Text`
  font-size: ${typography.sizes.sm}px;
  font-weight: ${typography.weights.medium};
  color: ${colors.status.error};
  text-align: center;
  margin-bottom: ${spacing.lg}px;
  line-height: ${typography.sizes.sm * 1.5}px;
`;

export const DeleteButton = styled.TouchableOpacity<{ disabled?: boolean }>`
  background-color: ${colors.status.error};
  border-radius: ${borderRadius.lg}px;
  padding: ${spacing.md}px ${spacing.lg}px;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  opacity: ${props => (props.disabled ? 0.6 : 1)};
  margin-bottom: ${spacing.xl}px;
`;

export const DeleteButtonText = styled.Text`
  color: ${colors.text.inverse};
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.semibold};
  letter-spacing: 0.1px;
`;


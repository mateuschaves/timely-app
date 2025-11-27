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

export const SettingsCard = styled.View`
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

export const SettingSection = styled.View`
  margin-bottom: ${spacing.sm}px;
`;

export const SettingLabel = styled.Text`
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.semibold};
  color: ${colors.text.primary};
  margin-bottom: ${spacing.sm}px;
`;

export const InputContainer = styled.View`
  background-color: ${colors.background.secondary};
  border-radius: ${borderRadius.md}px;
  overflow: hidden;
`;

export const Input = styled.TextInput`
  padding: ${spacing.sm}px ${spacing.md}px;
  min-height: 80px;
  font-size: ${typography.sizes.md}px;
  color: ${colors.text.primary};
  font-weight: ${typography.weights.regular};
  line-height: 22px;
  text-align-vertical: top;
`;

export const DayRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: ${spacing.sm}px 0;
  min-height: 48px;
`;

export const DayInfo = styled.View`
  flex: 1;
`;

export const DayName = styled.Text`
  font-size: ${typography.sizes.md}px;
  color: ${colors.text.primary};
  font-weight: ${typography.weights.regular};
  line-height: 22px;
`;


export const TimeRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: ${spacing.md}px;
  margin-top: ${spacing.xs}px;
  margin-bottom: ${spacing.sm}px;
  margin-left: ${spacing.md}px;
`;

export const TimeInput = styled.TextInput`
  flex: 1;
  background-color: ${colors.background.secondary};
  border-radius: ${borderRadius.md}px;
  padding: ${spacing.sm}px ${spacing.md}px;
  min-height: 48px;
  font-size: ${typography.sizes.lg}px;
  color: ${colors.text.primary};
  font-weight: ${typography.weights.semibold};
  text-align: center;
`;

export const TimeSeparator = styled.Text`
  font-size: ${typography.sizes.lg}px;
  color: ${colors.text.secondary};
  font-weight: ${typography.weights.medium};
`;

export const SaveButton = styled.TouchableOpacity<{ disabled?: boolean }>`
  background-color: ${colors.primary};
  border-radius: ${borderRadius.lg}px;
  padding: ${spacing.md}px ${spacing.lg}px;
  align-items: center;
  justify-content: center;
  margin-top: ${spacing.sm}px;
  opacity: ${(props: { disabled?: boolean }) => (props.disabled ? 0.6 : 1)};
`;

export const SaveButtonText = styled.Text`
  color: ${colors.text.inverse};
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.semibold};
`;


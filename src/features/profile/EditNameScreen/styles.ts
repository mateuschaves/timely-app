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

export const InputContainer = styled.View`
  background-color: ${colors.background.primary};
  border-radius: ${borderRadius.lg}px;
  overflow: hidden;
  margin-bottom: ${spacing.lg}px;
  shadow-color: ${shadows.sm.shadowColor};
  shadow-offset: ${shadows.sm.shadowOffset.width}px ${shadows.sm.shadowOffset.height}px;
  shadow-opacity: ${shadows.sm.shadowOpacity};
  shadow-radius: ${shadows.sm.shadowRadius}px;
  elevation: ${shadows.sm.elevation};
`;

export const Input = styled.TextInput`
  padding: ${spacing.sm}px ${spacing.md}px;
  min-height: 48px;
  font-size: ${typography.sizes.md}px;
  color: ${colors.text.primary};
  font-weight: ${typography.weights.regular};
  line-height: 22px;
`;

export const SaveButton = styled.TouchableOpacity<{ disabled?: boolean }>`
  background-color: ${colors.primary};
  border-radius: ${borderRadius.lg}px;
  padding: ${spacing.md}px ${spacing.lg}px;
  align-items: center;
  justify-content: center;
  opacity: ${props => (props.disabled ? 0.6 : 1)};
`;

export const SaveButtonText = styled.Text`
  color: ${colors.text.inverse};
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.semibold};
`;


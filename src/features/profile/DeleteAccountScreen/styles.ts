import styled from 'styled-components/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing, borderRadius, typography } from '@/theme';

export const Container = styled(SafeAreaView)<{ theme: any }>`
  flex: 1;
  background-color: ${({ theme }) => theme.background.primary};
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

export const HeaderTitle = styled.Text<{ theme: any }>`
  font-size: ${typography.sizes.lg}px;
  font-weight: ${typography.weights.semibold};
  color: ${({ theme }) => theme.text.primary};
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

export const SectionTitle = styled.Text<{ theme: any }>`
  font-size: ${typography.sizes.lg}px;
  font-weight: ${typography.weights.semibold};
  color: ${({ theme }) => theme.text.primary};
  margin-bottom: ${spacing.sm}px;
`;

export const SectionDescription = styled.Text<{ theme: any }>`
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.regular};
  color: ${({ theme }) => theme.text.secondary};
  line-height: ${typography.sizes.md * 1.5}px;
  margin-bottom: ${spacing.md}px;
`;

export const ReasonOption = styled.TouchableOpacity<{ disabled?: boolean; theme: any }>`
  background-color: ${({ theme }) => (theme.colorScheme === 'dark' ? '#1a1a1a' : theme.background.primary)};
  border-radius: ${borderRadius.md}px;
  padding: ${spacing.md}px;
  margin-bottom: ${spacing.sm}px;
  shadow-color: ${({ theme }) => theme.shadows.sm.shadowColor};
  shadow-offset: ${({ theme }) => theme.shadows.sm.shadowOffset.width}px ${({ theme }) => theme.shadows.sm.shadowOffset.height}px;
  shadow-opacity: ${({ theme }) => theme.shadows.sm.shadowOpacity};
  shadow-radius: ${({ theme }) => theme.shadows.sm.shadowRadius}px;
  elevation: ${({ theme }) => theme.shadows.sm.elevation};
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
  border-color: ${({ theme }) => theme.primary};
  margin-right: ${spacing.md}px;
  align-items: center;
  justify-content: center;
`;

export const RadioButtonSelected = styled.View`
  width: 12px;
  height: 12px;
  border-radius: 6px;
  background-color: ${({ theme }) => theme.primary};
`;

export const ReasonOptionText = styled.Text<{ theme: any }>`
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.regular};
  color: ${({ theme }) => theme.text.primary};
  flex: 1;
`;

export const CustomReasonContainer = styled.View`
  margin-top: ${spacing.md}px;
  margin-left: ${spacing.xl + spacing.md}px;
`;

export const CustomReasonInput = styled.TextInput<{ theme: any }>`
  background-color: ${({ theme }) => (theme.colorScheme === 'dark' ? '#1a1a1a' : theme.background.primary)};
  border-radius: ${borderRadius.md}px;
  padding: ${spacing.md}px ${spacing.lg}px;
  font-size: ${typography.sizes.md}px;
  color: ${({ theme }) => theme.text.primary};
  font-weight: ${typography.weights.regular};
  min-height: 100px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.border.light};
`;

export const WarningText = styled.Text<{ theme: any }>`
  font-size: ${typography.sizes.sm}px;
  font-weight: ${typography.weights.medium};
  color: ${({ theme }) => theme.status.error};
  text-align: center;
  margin-bottom: ${spacing.lg}px;
  line-height: ${typography.sizes.sm * 1.5}px;
`;


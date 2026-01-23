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

export const BackButton = styled.TouchableOpacity`
  padding: ${spacing.sm}px;
  position: absolute;
  left: ${spacing.sm}px;
  z-index: 1;
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
  padding: ${spacing.lg}px;
`;

export const InputContainer = styled.View`
  margin-bottom: ${spacing.lg}px;
`;

export const InputLabel = styled.Text<{ theme: any }>`
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.medium};
  color: ${({ theme }) => theme.text.primary};
  margin-bottom: ${spacing.sm}px;
`;

export const Input = styled.TextInput<{ theme: any }>`
  background-color: ${({ theme }) => (theme.colorScheme === 'dark' ? '#1a1a1a' : theme.background.primary)};
  border-radius: ${borderRadius.lg}px;
  padding: ${spacing.md}px ${spacing.lg}px;
  font-size: ${typography.sizes.md}px;
  color: ${({ theme }) => theme.text.primary};
  font-weight: ${typography.weights.regular};
  min-height: 48px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.border.light};
  shadow-color: ${({ theme }) => theme.shadows.sm.shadowColor};
  shadow-offset: ${({ theme }) => theme.shadows.sm.shadowOffset.width}px ${({ theme }) => theme.shadows.sm.shadowOffset.height}px;
  shadow-opacity: ${({ theme }) => theme.shadows.sm.shadowOpacity};
  shadow-radius: ${({ theme }) => theme.shadows.sm.shadowRadius}px;
  elevation: ${({ theme }) => theme.shadows.sm.elevation};
`;

export const PickerButton = styled.TouchableOpacity<{ disabled?: boolean; theme: any }>`
  background-color: ${({ theme }) => (theme.colorScheme === 'dark' ? '#1a1a1a' : theme.background.primary)};
  border-radius: ${borderRadius.lg}px;
  padding: ${spacing.md}px ${spacing.lg}px;
  min-height: 48px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.border.light};
  shadow-color: ${({ theme }) => theme.shadows.sm.shadowColor};
  shadow-offset: ${({ theme }) => theme.shadows.sm.shadowOffset.width}px ${({ theme }) => theme.shadows.sm.shadowOffset.height}px;
  shadow-opacity: ${({ theme }) => theme.shadows.sm.shadowOpacity};
  shadow-radius: ${({ theme }) => theme.shadows.sm.shadowRadius}px;
  elevation: ${({ theme }) => theme.shadows.sm.elevation};
  justify-content: center;
  opacity: ${props => (props.disabled ? 0.6 : 1)};
`;

export const PickerValue = styled.Text<{ placeholder?: boolean; theme: any }>`
  font-size: ${typography.sizes.md}px;
  color: ${(props: { placeholder?: boolean; theme: any }) => (props.placeholder ? props.theme.text.tertiary : props.theme.text.primary)};
  font-weight: ${typography.weights.regular};
`;

export const ButtonContainer = styled.View`
  gap: ${spacing.md}px;
  margin-top: ${spacing.xl}px;
`;

export const ModalOverlay = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.4);
  justify-content: center;
  align-items: center;
  padding: ${spacing.lg}px;
`;

export const PickerModal = styled.View<{ theme: any }>`
  background-color: ${({ theme }) => (theme.colorScheme === 'dark' ? '#1a1a1a' : theme.background.primary)};
  border-radius: ${borderRadius.lg}px;
  padding: ${spacing.xl}px ${spacing.lg}px;
  width: 100%;
  max-width: 340px;
  align-items: center;
  border-width: 1px;
  border-color: ${({ theme }) => (theme.colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.08)' : theme.border.light)};
  shadow-color: ${({ theme }) => theme.shadows.md.shadowColor};
  shadow-offset: 0px 4px;
  shadow-opacity: ${({ theme }) => theme.shadows.md.shadowOpacity};
  shadow-radius: ${({ theme }) => theme.shadows.md.shadowRadius}px;
  elevation: ${({ theme }) => theme.shadows.md.elevation};
`;

export const PickerTitle = styled.Text<{ theme: any }>`
  font-size: ${typography.sizes.lg}px;
  font-weight: ${typography.weights.semibold};
  color: ${({ theme }) => theme.text.primary};
  margin-bottom: ${spacing.md}px;
  text-align: center;
`;

export const PickerActions = styled.View`
  width: 100%;
  margin-top: ${spacing.md}px;
`;

export const PickerActionButton = styled.TouchableOpacity<{ theme: any }>`
  background-color: ${({ theme }) => (theme.colorScheme === 'dark' ? '#2a2a2a' : theme.primary)};
  padding: ${spacing.md}px;
  border-radius: ${borderRadius.md}px;
  align-items: center;
  justify-content: center;
`;

export const PickerActionText = styled.Text<{ theme: any }>`
  color: ${({ theme }) => (theme.colorScheme === 'dark' ? theme.text.primary : theme.text.inverse)};
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.semibold};
`;


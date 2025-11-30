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
`;

export const SaveButton = styled.TouchableOpacity<{ disabled?: boolean; theme: any }>`
  background-color: ${({ theme }) => (theme.colorScheme === 'dark' ? '#1a1a1a' : theme.primary)};
  border-radius: ${borderRadius.lg}px;
  padding: ${spacing.md}px ${spacing.lg}px;
  align-items: center;
  justify-content: center;
  min-height: 48px;
  opacity: ${props => (props.disabled ? 0.6 : 1)};
`;

export const SaveButtonText = styled.Text<{ theme: any }>`
  color: ${({ theme }) => (theme.colorScheme === 'dark' ? theme.text.primary : theme.text.inverse)};
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.semibold};
  letter-spacing: 0.1px;
`;



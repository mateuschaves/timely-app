import styled from 'styled-components/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing, borderRadius, typography } from '@/theme';

export const Container = styled(SafeAreaView)<{ theme: any }>`
  flex: 1;
  background-color: ${({ theme }) => theme.background.primary};
`;

export const Header = styled.View`
  padding: ${spacing.md}px ${spacing.lg}px;
  align-items: flex-end;
`;

export const SkipButton = styled.TouchableOpacity`
  padding: ${spacing.sm}px ${spacing.md}px;
`;

export const SkipButtonText = styled.Text`
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.medium};
  color: ${({ theme }) => theme.text.secondary};
`;

export const Content = styled.ScrollView.attrs({
  contentContainerStyle: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.xxl,
  },
})`
  flex: 1;
`;

export const Title = styled.Text`
  font-size: ${typography.sizes.xxl}px;
  font-weight: ${typography.weights.bold};
  color: ${({ theme }) => theme.text.primary};
  margin-bottom: ${spacing.sm}px;
`;

export const Subtitle = styled.Text`
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.regular};
  color: ${({ theme }) => theme.text.secondary};
  margin-bottom: ${spacing.xl}px;
  line-height: 22px;
`;

export const OptionsContainer = styled.View`
  gap: ${spacing.md}px;
  margin-bottom: ${spacing.xl}px;
`;

export const OptionCard = styled.TouchableOpacity<{ theme: any; selected: boolean }>`
  background-color: ${({ theme, selected }) =>
    selected ? theme.primary + '15' : theme.colorScheme === 'dark' ? '#1a1a1a' : theme.background.secondary};
  border: 2px solid ${({ theme, selected }) => (selected ? theme.primary : 'transparent')};
  border-radius: ${borderRadius.lg}px;
  padding: ${spacing.lg}px;
  shadow-color: ${({ theme }) => theme.shadows.sm.shadowColor};
  shadow-offset: ${({ theme }) => theme.shadows.sm.shadowOffset.width}px ${({ theme }) => theme.shadows.sm.shadowOffset.height}px;
  shadow-opacity: ${({ theme }) => theme.shadows.sm.shadowOpacity};
  shadow-radius: ${({ theme }) => theme.shadows.sm.shadowRadius}px;
  elevation: ${({ theme }) => theme.shadows.sm.elevation};
`;

export const OptionTitle = styled.Text<{ theme: any; selected: boolean }>`
  font-size: ${typography.sizes.lg}px;
  font-weight: ${typography.weights.semibold};
  color: ${({ theme, selected }) => (selected ? theme.primary : theme.text.primary)};
  margin-bottom: ${spacing.xs}px;
`;

export const OptionDescription = styled.Text`
  font-size: ${typography.sizes.sm}px;
  font-weight: ${typography.weights.regular};
  color: ${({ theme }) => theme.text.secondary};
  line-height: 20px;
`;

export const ButtonContainer = styled.View`
  padding: ${spacing.lg}px;
`;

export const ContinueButton = styled.TouchableOpacity<{ theme: any; disabled?: boolean }>`
  background-color: ${({ theme, disabled }) => (disabled ? theme.text.tertiary : theme.primary)};
  padding: ${spacing.md}px ${spacing.lg}px;
  border-radius: ${borderRadius.lg}px;
  align-items: center;
  justify-content: center;
  min-height: 50px;
`;

export const ContinueButtonText = styled.Text<{ disabled?: boolean }>`
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.semibold};
  color: ${({ disabled }) => (disabled ? '#999' : '#ffffff')};
`;

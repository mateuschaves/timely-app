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

export const CloseButton = styled.TouchableOpacity`
  width: 40px;
  height: 40px;
  align-items: center;
  justify-content: center;
  border-radius: ${borderRadius.round}px;
  background-color: ${({ theme }) => theme.colorScheme === 'dark' ? '#2a2a2a' : theme.background.secondary};
`;

export const CloseButtonText = styled.Text<{ theme: any }>`
  font-size: 24px;
  font-weight: ${typography.weights.semibold};
  color: ${({ theme }) => theme.text.primary};
  line-height: 24px;
`;

export const Content = styled.View`
  flex: 1;
  padding: ${spacing.xl}px;
  justify-content: center;
  align-items: center;
`;

export const IconContainer = styled.View`
  margin-bottom: ${spacing.xl}px;
`;

export const Icon = styled.Text`
  font-size: 80px;
`;

export const Title = styled.Text`
  font-size: ${typography.sizes.xxl}px;
  font-weight: ${typography.weights.bold};
  color: ${({ theme }) => theme.text.primary};
  text-align: center;
  margin-bottom: ${spacing.lg}px;
  padding: 0 ${spacing.md}px;
`;

export const Body = styled.Text`
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.regular};
  color: ${({ theme }) => theme.text.secondary};
  text-align: center;
  line-height: 24px;
  margin-bottom: ${spacing.xl}px;
  padding: 0 ${spacing.md}px;
`;

export const ButtonContainer = styled.View`
  width: 100%;
  gap: ${spacing.md}px;
  margin-top: ${spacing.xl}px;
`;

export const PrimaryButton = styled.TouchableOpacity<{ theme: any }>`
  background-color: ${({ theme }) => theme.primary};
  padding: ${spacing.md}px ${spacing.lg}px;
  border-radius: ${borderRadius.lg}px;
  align-items: center;
  justify-content: center;
  min-height: 50px;
`;

export const PrimaryButtonText = styled.Text<{ theme: any }>`
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.semibold};
  color: ${({ theme }) => theme.text.inverse};
`;

export const SecondaryButton = styled.TouchableOpacity`
  padding: ${spacing.md}px ${spacing.lg}px;
  align-items: center;
  justify-content: center;
  min-height: 50px;
`;

export const SecondaryButtonText = styled.Text`
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.medium};
  color: ${({ theme }) => theme.text.secondary};
`;

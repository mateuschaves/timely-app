import styled from 'styled-components/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing, borderRadius, typography } from '@/theme';

export const Container = styled(SafeAreaView)<{ theme: any }>`
  flex: 1;
  background-color: ${({ theme }) => theme.background.primary};
  margin: ${spacing.xl}px;
  border-radius: ${borderRadius.xl}px;
  overflow: hidden;
  max-width: 480px;
  width: 100%;
  align-self: center;
  shadow-color: #000;
  shadow-offset: 0px 20px;
  shadow-opacity: 0.3;
  shadow-radius: 25px;
  elevation: 10;
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

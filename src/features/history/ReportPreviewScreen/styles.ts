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
  padding: 0 ${spacing.md}px ${spacing.lg}px ${spacing.md}px;
`;

export const PreviewContainer = styled.View`
  flex: 1;
  border-radius: ${borderRadius.md}px;
  overflow: hidden;
  border-width: 1px;
  border-color: ${({ theme }: any) => theme.border.light};
  background-color: ${({ theme }: any) => theme.background.secondary};
`;

export const LoadingContainer = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

export const ErrorBox = styled.View`
  padding: ${spacing.md}px;
  border-radius: ${borderRadius.md}px;
  background-color: ${({ theme }: any) => theme.status.error}15;
  border-width: 1px;
  border-color: ${({ theme }: any) => theme.status.error}40;
`;

export const ErrorText = styled.Text<{ theme: any }>`
  color: ${({ theme }) => theme.status.error};
  font-size: ${typography.sizes.sm}px;
  font-weight: ${typography.weights.medium};
`;

export const ButtonRow = styled.View`
  flex-direction: row;
  gap: ${spacing.sm}px;
  margin-top: ${spacing.md}px;
`;

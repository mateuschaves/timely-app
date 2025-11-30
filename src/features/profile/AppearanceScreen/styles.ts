import styled from 'styled-components/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing, borderRadius, typography, shadows } from '@/theme';

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

export const Section = styled.View`
  margin-bottom: ${spacing.lg}px;
`;

export const InfoCard = styled.View<{ theme: any }>`
  background-color: ${({ theme }) => theme.colorScheme === 'dark' ? '#1a1a1a' : theme.background.secondary};
  border-radius: ${borderRadius.lg}px;
  overflow: hidden;
  shadow-color: ${({ theme }) => theme.shadows.sm.shadowColor};
  shadow-offset: ${({ theme }) => theme.shadows.sm.shadowOffset.width}px ${({ theme }) => theme.shadows.sm.shadowOffset.height}px;
  shadow-opacity: ${({ theme }) => theme.shadows.sm.shadowOpacity};
  shadow-radius: ${({ theme }) => theme.shadows.sm.shadowRadius}px;
  elevation: ${({ theme }) => theme.shadows.sm.elevation};
`;

export const SettingsRow = styled.TouchableOpacity`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: ${spacing.sm}px ${spacing.md}px;
  min-height: 48px;
`;

export const InfoLeft = styled.View`
  flex: 1;
  margin-right: ${spacing.md}px;
`;

export const InfoLabel = styled.Text<{ theme: any }>`
  font-size: ${typography.sizes.md}px;
  color: ${({ theme }) => theme.text.primary};
  font-weight: ${typography.weights.regular};
  line-height: 22px;
`;

export const InfoValueContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
`;

export const InfoValue = styled.Text<{ theme: any }>`
  font-size: ${typography.sizes.md}px;
  color: ${({ theme }) => theme.text.secondary};
  font-weight: ${typography.weights.regular};
  flex-shrink: 1;
  line-height: 22px;
`;

export const CheckIcon = styled.View`
  align-items: center;
  justify-content: center;
`;

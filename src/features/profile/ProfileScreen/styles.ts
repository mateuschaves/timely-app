import styled from 'styled-components/native';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing, borderRadius, typography } from '@/theme';

export const Container = styled(SafeAreaView)<{ theme: any }>`
  flex: 1;
  background-color: ${({ theme }) => theme.background.primary};
`;

export const ScrollContent = styled(ScrollView)`
  flex: 1;
  showsVerticalScrollIndicator: false;
`;

export const Content = styled.View`
  flex: 1;
  padding: ${spacing.lg}px;
  padding-bottom: 120px;
`;

export const ProfileHeader = styled.View`
  align-items: center;
  margin-bottom: ${spacing.xxl}px;
  padding-top: ${spacing.sm}px;
`;

export const AvatarContainer = styled.View`
  margin-bottom: ${spacing.lg}px;
`;

export const Avatar = styled.View<{ theme: any }>`
  width: 120px;
  height: 120px;
  border-radius: ${borderRadius.round}px;
  background-color: ${({ theme }) => theme.primary};
  align-items: center;
  justify-content: center;
`;

export const AvatarText = styled.Text<{ theme: any }>`
  font-size: 42px;
  font-weight: ${typography.weights.semibold};
  color: ${({ theme }) => theme.text.inverse};
  letter-spacing: 1.5px;
`;

export const AvatarIcon = styled.View`
  align-items: center;
  justify-content: center;
`;

export const UserName = styled.Text<{ theme: any }>`
  font-size: ${typography.sizes.lg}px;
  font-weight: ${typography.weights.semibold};
  color: ${({ theme }) => theme.text.primary};
  margin-bottom: ${spacing.xs}px;
  text-align: center;
  letter-spacing: -0.3px;
`;

export const UserEmail = styled.Text<{ theme: any }>`
  font-size: ${typography.sizes.sm}px;
  color: ${({ theme }) => theme.text.secondary};
  text-align: center;
  letter-spacing: 0.1px;
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

export const InfoRow = styled.View<{ isLast?: boolean; theme: any }>`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: ${spacing.sm}px ${spacing.md}px;
  min-height: 48px;
  border-bottom-width: ${(props: { isLast?: boolean }) => (props.isLast ? '0px' : '1px')};
  border-bottom-color: ${({ theme }) => theme.colorScheme === 'dark' ? '#2a2a2a' : theme.border.light};
  background-color: ${({ theme }) => theme.colorScheme === 'dark' ? '#1a1a1a' : theme.background.secondary};
`;

export const InfoLeft = styled.View`
  flex: 1;
  margin-right: ${spacing.md}px;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
`;

export const InfoLabel = styled.Text<{ theme: any }>`
  font-size: ${typography.sizes.md}px;
  color: ${({ theme }) => theme.text.primary};
  font-weight: ${typography.weights.regular};
  line-height: 22px;
`;

export const InfoValue = styled.Text<{ theme: any }>`
  font-size: ${typography.sizes.md}px;
  color: ${({ theme }) => theme.text.secondary};
  font-weight: ${typography.weights.regular};
  flex-shrink: 1;
  line-height: 22px;
`;

export const InfoValueContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
  flex-shrink: 0;
`;

export const EmptyState = styled.View`
  align-items: center;
  justify-content: center;
  padding: 80px ${spacing.lg}px;
`;

export const EmptyStateText = styled.Text<{ theme: any }>`
  font-size: ${typography.sizes.md}px;
  color: ${({ theme }) => theme.text.tertiary};
  text-align: center;
  line-height: 24px;
`;

export const SettingsRow = styled.TouchableOpacity`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: ${spacing.sm}px ${spacing.md}px;
  min-height: 48px;
`;

export const ChevronIcon = styled.View`
  margin-left: ${spacing.xs}px;
  align-items: center;
  justify-content: center;
`;

export const Badge = styled.View<{ theme: any }>`
  background-color: ${({ theme }) => theme.status.warning}1A;
  border-radius: ${borderRadius.md}px;
  padding-horizontal: ${spacing.sm}px;
  padding-vertical: 4px;
  margin-right: ${spacing.sm}px;
  flex-direction: row;
  align-items: center;
  border-width: 1px;
  border-color: ${({ theme }) => theme.status.warning}40;
`;

export const BadgeIcon = styled.View`
  margin-right: 4px;
  align-items: center;
  justify-content: center;
`;

export const BadgeText = styled.Text<{ theme: any }>`
  color: ${({ theme }) => theme.status.warningDark || '#B8860B'};
  font-size: ${typography.sizes.xs}px;
  font-weight: ${typography.weights.semibold};
  letter-spacing: 0.3px;
`;


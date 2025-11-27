import styled from 'styled-components/native';
import { ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography, shadows } from '@/theme';

export const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: ${colors.background.secondary};
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

export const Avatar = styled.View`
  width: 120px;
  height: 120px;
  border-radius: ${borderRadius.round}px;
  background-color: ${colors.primary};
  align-items: center;
  justify-content: center;
`;

export const AvatarText = styled.Text`
  font-size: 42px;
  font-weight: ${typography.weights.semibold};
  color: ${colors.text.inverse};
  letter-spacing: 1.5px;
`;

export const AvatarIcon = styled.View`
  align-items: center;
  justify-content: center;
`;

export const UserName = styled.Text`
  font-size: ${typography.sizes.lg}px;
  font-weight: ${typography.weights.semibold};
  color: ${colors.text.primary};
  margin-bottom: ${spacing.xs}px;
  text-align: center;
  letter-spacing: -0.3px;
`;

export const UserEmail = styled.Text`
  font-size: ${typography.sizes.sm}px;
  color: ${colors.text.secondary};
  text-align: center;
  letter-spacing: 0.1px;
`;

export const Section = styled.View`
  margin-bottom: ${spacing.lg}px;
`;

export const InfoCard = styled.View`
  background-color: ${colors.background.primary};
  border-radius: ${borderRadius.lg}px;
  overflow: hidden;
  shadow-color: ${shadows.sm.shadowColor};
  shadow-offset: ${shadows.sm.shadowOffset.width}px ${shadows.sm.shadowOffset.height}px;
  shadow-opacity: ${shadows.sm.shadowOpacity};
  shadow-radius: ${shadows.sm.shadowRadius}px;
  elevation: ${shadows.sm.elevation};
`;

export const InfoRow = styled.View<{ isLast?: boolean }>`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: ${spacing.sm}px ${spacing.md}px;
  min-height: 48px;
  border-bottom-width: ${props => (props.isLast ? '0px' : '1px')};
  border-bottom-color: ${colors.border.light};
  background-color: ${colors.background.primary};
`;

export const InfoLeft = styled.View`
  flex: 1;
  margin-right: ${spacing.md}px;
`;

export const InfoLabel = styled.Text`
  font-size: ${typography.sizes.md}px;
  color: ${colors.text.primary};
  font-weight: ${typography.weights.regular};
  line-height: 22px;
`;

export const InfoValue = styled.Text`
  font-size: ${typography.sizes.md}px;
  color: ${colors.text.secondary};
  font-weight: ${typography.weights.regular};
  flex-shrink: 1;
  line-height: 22px;
`;

export const InfoValueContainer = styled.View`
  flex: 1.2;
  flex-direction: row;
  align-items: center;
  justify-content: flex-end;
`;

export const Button = styled.TouchableOpacity`
  background-color: ${colors.background.primary};
  border-radius: ${borderRadius.lg}px;
  padding: ${spacing.md}px ${spacing.lg}px;
  align-items: center;
  justify-content: center;
  margin-top: ${spacing.sm}px;
  shadow-color: ${shadows.sm.shadowColor};
  shadow-offset: ${shadows.sm.shadowOffset.width}px ${shadows.sm.shadowOffset.height}px;
  shadow-opacity: ${shadows.sm.shadowOpacity};
  shadow-radius: ${shadows.sm.shadowRadius}px;
  elevation: ${shadows.sm.elevation};
`;

export const ButtonText = styled.Text`
  color: ${colors.status.error};
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.medium};
  letter-spacing: 0.1px;
`;

export const EmptyState = styled.View`
  align-items: center;
  justify-content: center;
  padding: 80px ${spacing.lg}px;
`;

export const EmptyStateText = styled.Text`
  font-size: ${typography.sizes.md}px;
  color: ${colors.text.tertiary};
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


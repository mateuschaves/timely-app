import styled from 'styled-components/native';
import { ScrollView } from 'react-native';
import { colors } from '@/theme/colors';

export const Container = styled.SafeAreaView`
  flex: 1;
  background-color: ${colors.background.secondary};
`;

export const ScrollContent = styled(ScrollView)`
  flex: 1;
  showsVerticalScrollIndicator: false;
`;

export const Content = styled.View`
  flex: 1;
  padding: 24px;
  padding-bottom: 120px;
`;

export const ProfileHeader = styled.View`
  align-items: center;
  margin-bottom: 40px;
  padding-top: 8px;
`;

export const AvatarContainer = styled.View`
  margin-bottom: 24px;
`;

export const Avatar = styled.View`
  width: 120px;
  height: 120px;
  border-radius: 60px;
  background-color: ${colors.primary};
  align-items: center;
  justify-content: center;
`;

export const AvatarText = styled.Text`
  font-size: 42px;
  font-weight: 600;
  color: ${colors.text.inverse};
  letter-spacing: 1.5px;
`;

export const AvatarIcon = styled.View`
  align-items: center;
  justify-content: center;
`;

export const UserName = styled.Text`
  font-size: 28px;
  font-weight: 600;
  color: ${colors.text.primary};
  margin-bottom: 8px;
  text-align: center;
  letter-spacing: -0.5px;
`;

export const UserEmail = styled.Text`
  font-size: 17px;
  color: ${colors.text.secondary};
  text-align: center;
  letter-spacing: 0.1px;
`;

export const Section = styled.View`
  margin-bottom: 32px;
`;

export const InfoCard = styled.View`
  background-color: ${colors.background.primary};
  border-radius: 12px;
  overflow: hidden;
  shadow-color: #000;
  shadow-offset: 0px 1px;
  shadow-opacity: 0.05;
  shadow-radius: 2px;
  elevation: 1;
`;

export const InfoRow = styled.View<{ isLast?: boolean }>`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  min-height: 64px;
  border-bottom-width: ${props => (props.isLast ? '0px' : '1px')};
  border-bottom-color: ${colors.border.light};
  background-color: ${colors.background.primary};
`;

export const InfoLeft = styled.View`
  flex: 1;
  margin-right: 16px;
`;

export const InfoLabel = styled.Text`
  font-size: 16px;
  color: ${colors.text.primary};
  font-weight: 400;
  line-height: 22px;
`;

export const InfoValue = styled.Text`
  font-size: 16px;
  color: ${colors.text.secondary};
  font-weight: 400;
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
  border-radius: 12px;
  padding: 20px 24px;
  align-items: center;
  justify-content: center;
  margin-top: 8px;
  shadow-color: #000;
  shadow-offset: 0px 1px;
  shadow-opacity: 0.05;
  shadow-radius: 2px;
  elevation: 1;
`;

export const ButtonText = styled.Text`
  color: ${colors.status.error};
  font-size: 17px;
  font-weight: 500;
  letter-spacing: 0.1px;
`;

export const EmptyState = styled.View`
  align-items: center;
  justify-content: center;
  padding: 80px 24px;
`;

export const EmptyStateText = styled.Text`
  font-size: 16px;
  color: ${colors.text.tertiary};
  text-align: center;
  line-height: 24px;
`;

export const SettingsRow = styled.TouchableOpacity`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  min-height: 64px;
`;

export const ChevronIcon = styled.View`
  margin-left: 6px;
  align-items: center;
  justify-content: center;
`;


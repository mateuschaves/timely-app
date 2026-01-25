import styled from 'styled-components/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing } from '@/theme';

export const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const Content = styled.ScrollView.attrs({
  contentContainerStyle: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
})``;

export const Header = styled.View`
  flex-direction: row;
  align-items: center;
  padding: ${spacing.md}px;
  background-color: ${({ theme }) => theme.colors.background};
`;

export const BackButton = styled.TouchableOpacity`
  padding: ${spacing.sm}px;
  margin-right: ${spacing.md}px;
`;

export const HeaderTitle = styled.Text`
  font-size: 20px;
  font-weight: bold;
  color: ${({ theme }) => theme.colors.text};
`;

export const Section = styled.View`
  margin-top: ${spacing.lg}px;
`;

export const SectionTitle = styled.Text`
  font-size: 16px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  margin-bottom: ${spacing.sm}px;
`;

export const SectionDescription = styled.Text`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: ${spacing.md}px;
  line-height: 20px;
`;

export const Card = styled.View`
  background-color: ${({ theme }) => theme.colors.surface};
  border-radius: 12px;
  padding: ${spacing.md}px;
  margin-bottom: ${spacing.md}px;
`;

export const Row = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  margin-bottom: ${spacing.sm}px;
`;

export const Label = styled.Text`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const Value = styled.Text`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => theme.colors.text};
`;

export const StatusBadge = styled.View<{ active?: boolean }>`
  background-color: ${({ theme, active }) => 
    active ? theme.colors.success + '20' : theme.colors.error + '20'};
  padding: ${spacing.xs}px ${spacing.sm}px;
  border-radius: 8px;
`;

export const StatusText = styled.Text<{ active?: boolean }>`
  color: ${({ theme, active }) => 
    active ? theme.colors.success : theme.colors.error};
  font-size: 12px;
  font-weight: 600;
`;

export const WarningBox = styled.View`
  background-color: ${({ theme }) => theme.colors.warning + '20'};
  padding: ${spacing.md}px;
  border-radius: 12px;
  margin-bottom: ${spacing.md}px;
  flex-direction: row;
  align-items: flex-start;
`;

export const WarningText = styled.Text`
  color: ${({ theme }) => theme.colors.warning};
  font-size: 14px;
  flex: 1;
  margin-left: ${spacing.sm}px;
  line-height: 20px;
`;

export const LocationInfo = styled.View`
  margin-top: ${spacing.md}px;
`;

export const CoordinatesText = styled.Text`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-family: monospace;
`;

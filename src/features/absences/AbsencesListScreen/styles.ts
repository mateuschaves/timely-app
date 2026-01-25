import styled from 'styled-components/native';
import { FlatList, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing, borderRadius, typography } from '@/theme';

export const Container = styled(SafeAreaView)<{ theme: any }>`
  flex: 1;
  background-color: ${({ theme }) => theme.background.primary};
`;

export const Header = styled.View`
  flex-direction: row;
  align-items: center;
  padding: ${spacing.md}px;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.border.light};
`;

export const BackButton = styled.TouchableOpacity`
  padding: ${spacing.sm}px;
  margin-right: ${spacing.md}px;
`;

export const HeaderTitle = styled.Text<{ theme: any }>`
  font-size: 20px;
  font-weight: bold;
  color: ${({ theme }) => theme.text.primary};
  flex: 1;
`;

export const ListHeaderWrapper = styled.View`
  padding-top: ${spacing.lg}px;
  padding-bottom: ${spacing.sm}px;
  gap: ${spacing.md}px;
`;

export const MonthChip = styled.TouchableOpacity<{ theme: any }>`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: ${spacing.md}px ${spacing.lg}px;
  background-color: ${({ theme }) => (theme.colorScheme === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)')};
  border-radius: ${borderRadius.lg}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.border.light};
`;

export const MonthChipLeft = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${spacing.sm}px;
`;

export const MonthChipText = styled.Text<{ theme: any }>`
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.semibold};
  color: ${({ theme }) => theme.text.primary};
  text-transform: capitalize;
`;

export const MonthPickerModalWrapper = styled.View`
  flex: 1;
  justify-content: flex-end;
`;

export const MonthPickerModalOverlay = styled.TouchableOpacity`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.5);
`;

export const MonthPickerModalContent = styled.View<{ theme: any }>`
  background-color: ${({ theme }) => theme.background.primary};
  border-top-left-radius: ${borderRadius.xl}px;
  border-top-right-radius: ${borderRadius.xl}px;
  max-height: 70%;
  padding-bottom: ${spacing.xl}px;
`;

export const MonthPickerModalHeader = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: ${spacing.md}px ${spacing.lg}px;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.border.light};
`;

export const MonthPickerModalTitle = styled.Text<{ theme: any }>`
  font-size: ${typography.sizes.lg}px;
  font-weight: ${typography.weights.semibold};
  color: ${({ theme }) => theme.text.primary};
`;

export const MonthPickerCloseButton = styled.TouchableOpacity`
  padding: ${spacing.sm}px;
`;

export const MonthPickerList = styled(ScrollView)`
  max-height: 360px;
  padding: ${spacing.sm}px;
`;

export const MonthOption = styled.TouchableOpacity<{ theme: any; selected?: boolean }>`
  flex-direction: row;
  align-items: center;
  padding: ${spacing.md}px ${spacing.lg}px;
  border-radius: ${borderRadius.md}px;
  background-color: ${({ theme, selected }) =>
    selected ? (theme.colorScheme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)') : 'transparent'};
`;

export const MonthOptionText = styled.Text<{ theme: any; selected?: boolean }>`
  flex: 1;
  font-size: ${typography.sizes.md}px;
  font-weight: ${({ selected }) => (selected ? typography.weights.semibold : typography.weights.regular)};
  color: ${({ theme }) => theme.text.primary};
  text-transform: capitalize;
`;

export const DaysList = styled(FlatList as new () => FlatList<any>)`
  flex: 1;
  padding: ${spacing.md}px;
`;

export const DayCard = styled.View<{ theme: any }>`
  background-color: ${({ theme }) => (theme.colorScheme === 'dark' ? '#1a1a1a' : theme.background.primary)};
  border-radius: ${borderRadius.lg}px;
  margin-bottom: ${spacing.md}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.border.light};
  overflow: hidden;
  shadow-color: ${({ theme }) => theme.shadows.sm.shadowColor};
  shadow-offset: ${({ theme }) => theme.shadows.sm.shadowOffset.width}px ${({ theme }) => theme.shadows.sm.shadowOffset.height}px;
  shadow-opacity: ${({ theme }) => theme.shadows.sm.shadowOpacity};
  shadow-radius: ${({ theme }) => theme.shadows.sm.shadowRadius}px;
  elevation: ${({ theme }) => theme.shadows.sm.elevation};
`;

export const DayHeader = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: ${spacing.md}px ${spacing.lg}px;
`;

export const DayDate = styled.Text<{ theme: any }>`
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.semibold};
  color: ${({ theme }) => theme.text.primary};
  text-transform: capitalize;
`;

export const AbsencesList = styled.View`
  padding: 0 ${spacing.lg}px ${spacing.md}px;
  gap: ${spacing.sm}px;
`;

export const AbsenceCard = styled.View<{ theme: any }>`
  background-color: ${({ theme }) => (theme.colorScheme === 'dark' ? '#2a2a2a' : theme.background.secondary)};
  border-radius: ${borderRadius.md}px;
  padding: ${spacing.md}px;
  border-left-width: 3px;
  border-left-color: ${({ theme }) => theme.primary};
`;

export const AbsenceReason = styled.Text<{ theme: any }>`
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.semibold};
  color: ${({ theme }) => theme.text.primary};
  margin-bottom: ${spacing.xs}px;
`;

export const AbsenceDescription = styled.Text<{ theme: any }>`
  font-size: ${typography.sizes.sm}px;
  color: ${({ theme }) => theme.text.secondary};
  line-height: 20px;
`;

export const EmptyState = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: ${spacing.xl}px;
  margin-top: ${spacing.xl}px;
`;

export const EmptyStateText = styled.Text<{ theme: any }>`
  font-size: ${typography.sizes.md}px;
  color: ${({ theme }) => theme.text.secondary};
  text-align: center;
`;

export const LoadingContainer = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

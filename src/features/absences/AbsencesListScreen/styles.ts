import styled from 'styled-components/native';
import { FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing, borderRadius, typography } from '@/theme';

export const Container = styled(SafeAreaView)<{ theme: any }>`
  flex: 1;
  background-color: ${({ theme }) => theme.background.primary};
`;

export const MonthNavigation = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: ${spacing.md}px ${spacing.lg}px;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.border.light};
`;

export const MonthNavigationButton = styled.TouchableOpacity<{ disabled?: boolean }>`
  padding: ${spacing.sm}px;
  opacity: ${props => (props.disabled ? 0.3 : 1)};
`;

export const MonthNavigationText = styled.Text<{ theme: any }>`
  font-size: ${typography.sizes.lg}px;
  font-weight: ${typography.weights.semibold};
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

import styled from 'styled-components/native';
import { FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { spacing, borderRadius, typography } from '@/theme';

export const Container = styled(SafeAreaView)<{ theme: any }>`
  flex: 1;
  background-color: ${({ theme }) => theme.background.primary};
`;

export const FilterContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: ${spacing.md}px;
  background-color: ${({ theme }) => theme.background.primary};
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.border.light};
`;

export const FilterButton = styled.TouchableOpacity`
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
  border-radius: ${borderRadius.md}px;
  background-color: ${({ theme }) => theme.background.secondary};
`;

export const FilterButtonText = styled.Text`
  font-size: ${typography.sizes.xl}px;
  font-weight: ${typography.weights.bold};
  color: ${({ theme }) => theme.text.primary};
`;

export const DatePickerButton = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  margin-horizontal: ${spacing.md}px;
  padding: ${spacing.sm}px;
`;

export const DatePickerText = styled.Text`
  font-size: ${typography.sizes.lg}px;
  font-weight: ${typography.weights.semibold};
  color: ${({ theme }) => theme.text.primary};
  text-transform: capitalize;
`;

export const List = styled(FlatList)`
  flex: 1;
  padding: ${spacing.md}px;
`;

export const EntryCard = styled.View`
  background-color: ${({ theme }) => theme.background.primary};
  border-radius: ${borderRadius.md}px;
  padding: ${spacing.md}px;
  margin-bottom: ${spacing.sm}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.border.light};
`;

interface EntryTypeProps {
  type: 'entry' | 'exit';
}

export const EntryType = styled.Text<EntryTypeProps>`
  font-size: ${typography.sizes.sm}px;
  font-weight: ${typography.weights.semibold};
  color: ${(props: EntryTypeProps) => (props.type === 'entry' ? props.theme.status.success : props.theme.status.error)};
  margin-bottom: ${spacing.sm}px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const EntryDate = styled.Text`
  font-size: ${typography.sizes.sm}px;
  color: ${({ theme }) => theme.text.secondary};
`;

export const EmptyState = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: ${spacing.xxl}px;
`;

export const EmptyStateText = styled.Text`
  font-size: ${typography.sizes.md}px;
  color: ${({ theme }) => theme.text.tertiary};
  text-align: center;
`;

export const LoadingContainer = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
`;

export const PaginationContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: ${spacing.md}px;
  background-color: ${({ theme }) => theme.background.primary};
  border-top-width: 1px;
  border-top-color: ${({ theme }) => theme.border.light};
`;

export const PaginationButton = styled.TouchableOpacity`
  padding: ${spacing.sm}px ${spacing.md}px;
  border-radius: ${borderRadius.md}px;
  background-color: ${({ theme }) => theme.background.secondary};
`;

export const PaginationButtonText = styled.Text`
  font-size: ${typography.sizes.sm}px;
  font-weight: ${typography.weights.medium};
  color: ${({ theme }) => theme.text.primary};
`;

export const PaginationInfo = styled.Text`
  font-size: ${typography.sizes.sm}px;
  font-weight: ${typography.weights.medium};
  color: ${({ theme }) => theme.text.secondary};
`;

interface DayGroupCardProps {
  incomplete?: boolean;
}

export const DayGroupCard = styled.View<DayGroupCardProps>`
  background-color: ${({ theme }) => theme.background.primary};
  border-radius: ${borderRadius.lg}px;
  padding: ${spacing.md}px;
  margin-bottom: ${spacing.md}px;
  border-width: 1px;
  border-color: ${(props: DayGroupCardProps) => props.incomplete ? props.theme.status.warning : props.theme.border.light};
  border-style: ${(props: DayGroupCardProps) => props.incomplete ? 'dashed' : 'solid'};
  opacity: ${(props: DayGroupCardProps) => props.incomplete ? 0.9 : 1};
`;

interface DurationBadgeProps {
  incomplete?: boolean;
}

export const DurationBadge = styled.View<DurationBadgeProps>`
  background-color: ${(props: DurationBadgeProps) => props.incomplete ? props.theme.status.warning + '20' : props.theme.background.secondary};
  padding: ${spacing.xs}px ${spacing.sm}px;
  border-radius: ${borderRadius.sm}px;
  border-width: ${(props: DurationBadgeProps) => props.incomplete ? '1px' : '0px'};
  border-color: ${(props: DurationBadgeProps) => props.incomplete ? props.theme.status.warning : 'transparent'};
`;

export const DurationText = styled.Text<DurationBadgeProps>`
  font-size: ${typography.sizes.xs}px;
  font-weight: ${typography.weights.medium};
  color: ${(props: DurationBadgeProps) => props.incomplete ? props.theme.status.warning : props.theme.text.primary};
`;

export const DayEntriesContainer = styled.View`
  gap: ${spacing.xs}px;
`;

export const EntryRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${spacing.sm}px;
`;

interface EntryIndicatorProps {
  type: 'entry' | 'exit';
}

export const EntryIndicator = styled.View<EntryIndicatorProps>`
  width: 12px;
  height: 12px;
  border-radius: 6px;
  background-color: ${(props: EntryIndicatorProps) => 
    props.type === 'entry' ? props.theme.status.success : props.theme.status.error
  };
`;

export const EntryContent = styled.View`
  flex: 1;
`;

export const EntryLabel = styled.Text`
  font-size: ${typography.sizes.xs}px;
  font-weight: ${typography.weights.medium};
  color: ${({ theme }) => theme.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: ${spacing.xs / 2}px;
`;

export const EntryTime = styled.Text`
  font-size: ${typography.sizes.lg}px;
  font-weight: ${typography.weights.bold};
  color: ${({ theme }) => theme.text.primary};
`;

export const NotesContainer = styled.View`
  margin-top: ${spacing.xs}px;
  align-self: stretch;
  margin-bottom: ${spacing.sm}px;
`;

export const NotesBubble = styled.View`
  background-color: ${({ theme }) => theme.background.secondary};
  border-radius: ${borderRadius.lg}px;
  padding: ${spacing.sm}px ${spacing.md}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.border.light};
`;

export const NotesText = styled.Text`
  font-size: ${typography.sizes.sm}px;
  color: ${({ theme }) => theme.text.secondary};
`;

export const NotesShowMore = styled(TouchableOpacity)`
  margin-top: ${spacing.xs}px;
  align-self: flex-start;
`;

export const NotesShowMoreText = styled.Text`
  font-size: ${typography.sizes.xs}px;
  font-weight: ${typography.weights.medium};
  color: ${({ theme }) => theme.primary};
`;

export const HoursWorkedBadge = styled.View`
  margin-top: ${spacing.xs}px;
  align-self: flex-start;
  background-color: ${({ theme }) => theme.background.secondary};
  padding: ${spacing.xs / 2}px ${spacing.sm}px;
  border-radius: ${borderRadius.sm}px;
`;

export const HoursWorkedText = styled.Text`
  font-size: ${typography.sizes.xs}px;
  font-weight: ${typography.weights.medium};
  color: ${({ theme }) => theme.text.secondary};
`;

export const MonthNavigation = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: ${spacing.md}px;
  background-color: ${({ theme }) => theme.background.primary};
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.border.light};
`;

export const MonthNavigationButton = styled.TouchableOpacity`
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
  border-radius: ${borderRadius.md}px;
  background-color: ${({ theme }) => theme.background.secondary};
`;

export const MonthNavigationText = styled.Text`
  font-size: ${typography.sizes.lg}px;
  font-weight: ${typography.weights.semibold};
  color: ${({ theme }) => theme.text.primary};
  text-transform: capitalize;
  flex: 1;
  text-align: center;
`;

export const ScrollContent = styled.ScrollView`
  flex: 1;
  padding-horizontal: ${spacing.lg}px;
  padding-top: ${spacing.md}px;
  padding-bottom: ${spacing.md}px;
`;

export const ListHeaderContainer = styled.View`
  padding-top: ${spacing.md}px;
  padding-bottom: 0px;
`;

export const MonthSummaryCard = styled.View`
  background-color: ${({ theme }) => theme.background.primary};
  border-radius: ${borderRadius.lg}px;
  padding: ${spacing.lg}px;
  margin-bottom: ${spacing.lg}px;
  margin-top: 0px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.border.light};
`;

export const SummaryMainRow = styled.View`
  flex-direction: row;
  justify-content: space-around;
  align-items: flex-start;
  margin-bottom: ${spacing.md}px;
`;

export const SummaryMainItem = styled.View`
  flex: 1;
  align-items: center;
`;

export const SummaryDivider = styled.View`
  width: 1px;
  height: 40px;
  background-color: ${({ theme }) => theme.border.light};
  margin: 0 ${spacing.md}px;
`;

export const SummaryItemLabel = styled.Text`
  font-size: ${typography.sizes.xs}px;
  font-weight: ${typography.weights.medium};
  color: ${({ theme }) => theme.text.secondary};
  margin-top: ${spacing.xs}px;
  text-align: center;
`;

export const SummaryItemValue = styled.Text`
  font-size: ${typography.sizes.xxl}px;
  font-weight: ${typography.weights.bold};
  color: ${({ theme }) => theme.text.primary};
  text-align: center;
`;

export const SummaryItemValueSmall = styled.Text`
  font-size: ${typography.sizes.xl}px;
  font-weight: ${typography.weights.bold};
  color: ${({ theme }) => theme.text.primary};
  text-align: center;
`;

export const SummaryDifferenceRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  padding-top: ${spacing.md}px;
  margin-top: ${spacing.md}px;
  border-top-width: 1px;
  border-top-color: ${({ theme }) => theme.border.light};
`;

export const SummaryDifferenceLabel = styled.Text`
  font-size: ${typography.sizes.sm}px;
  font-weight: ${typography.weights.medium};
  color: ${({ theme }) => theme.text.secondary};
  flex: 1;
`;

interface SummaryDifferenceValueProps {
  status?: 'over' | 'under' | 'exact';
}

export const SummaryDifferenceValue = styled.Text<SummaryDifferenceValueProps>`
  font-size: ${typography.sizes.lg}px;
  font-weight: ${typography.weights.bold};
  color: ${(props: SummaryDifferenceValueProps) => {
    if (props.status === 'over') return props.theme.status.success;
    if (props.status === 'under') return props.theme.status.error;
    return props.theme.text.primary;
  }};
  text-align: right;
  min-width: 100px;
`;

export const DaysList = styled(FlatList)`
  flex: 1;
  padding-horizontal: ${spacing.md}px;
  padding-top: 0px;
  padding-bottom: 0px;
`;

interface DayCardProps {
  incomplete?: boolean;
  hasOrderIssue?: boolean;
}

export const DayCard = styled.View<DayCardProps>`
  background-color: ${({ theme }) => theme.background.primary};
  border-radius: ${borderRadius.lg}px;
  padding: ${spacing.lg}px;
  margin-bottom: ${spacing.lg}px;
  margin-top: 0px;
  border-width: 1px;
  border-color: ${(props: DayCardProps) => {
    if (props.hasOrderIssue) return props.theme.status.error;
    if (props.incomplete) return props.theme.status.warning;
    return props.theme.border.light;
  }};
  border-style: ${(props: DayCardProps) => (props.incomplete || props.hasOrderIssue) ? 'dashed' : 'solid'};
`;

export const DayHeader = styled.TouchableOpacity`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${spacing.sm}px;
  padding-bottom: ${spacing.sm}px;
  border-bottom-width: 1px;
  border-bottom-color: ${({ theme }) => theme.border.light};
`;

export const DayDateContainer = styled.View`
  flex: 1;
  flex-direction: row;
  align-items: center;
  flex-wrap: wrap;
`;

export const DayDate = styled.Text`
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.semibold};
  color: ${({ theme }) => theme.text.primary};
`;

export const DayHeaderRight = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${spacing.sm}px;
`;

export const DayTotalHoursBadge = styled.View`
  background-color: ${({ theme }) => theme.background.secondary};
  padding: ${spacing.xs}px ${spacing.sm}px;
  border-radius: ${borderRadius.sm}px;
`;

export const DayTotalHours = styled.Text`
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.medium};
  color: ${({ theme }) => theme.text.primary};
`;

interface DayStatusBadgeProps {
  status: 'over' | 'under' | 'exact';
}

export const DayStatusBadge = styled.View<DayStatusBadgeProps>`
  background-color: ${(props: DayStatusBadgeProps) => {
    if (props.status === 'over') return props.theme.status.success + '20';
    if (props.status === 'under') return props.theme.status.error + '20';
    return props.theme.background.secondary;
  }};
  padding: ${spacing.xs}px ${spacing.sm}px;
  border-radius: ${borderRadius.sm}px;
`;

export const DayStatusText = styled.Text<DayStatusBadgeProps>`
  font-size: ${typography.sizes.xs}px;
  font-weight: ${typography.weights.semibold};
  color: ${(props: DayStatusBadgeProps) => {
    if (props.status === 'over') return props.theme.status.success;
    if (props.status === 'under') return props.theme.status.error;
    return props.theme.text.secondary;
  }};
`;

export const DayExpandIcon = styled.View`
  margin-left: ${spacing.xs}px;
`;

export const EventsList = styled.View`
  margin-top: ${spacing.md}px;
  padding-top: ${spacing.md}px;
  gap: ${spacing.md}px;
`;

export const EventGroup = styled.View`
  gap: ${spacing.xs}px;
`;

export const EventRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${spacing.sm}px;
`;

export const EventEditButton = styled.TouchableOpacity`
  padding: ${spacing.xs}px;
  margin-left: ${spacing.xs}px;
`;

export const EventIndicator = styled.View<EntryIndicatorProps>`
  width: 10px;
  height: 10px;
  border-radius: 5px;
  background-color: ${(props: EntryIndicatorProps) => 
    props.type === 'entry' ? props.theme.status.success : props.theme.status.error
  };
`;

export const EventContent = styled.View`
  flex: 1;
`;

export const EventType = styled.Text<EntryTypeProps>`
  font-size: ${typography.sizes.xs}px;
  font-weight: ${typography.weights.medium};
  color: ${(props: EntryTypeProps) => (props.type === 'entry' ? props.theme.status.success : props.theme.status.error)};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: ${spacing.xs / 2}px;
`;

export const EventTime = styled.Text`
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.semibold};
  color: ${({ theme }) => theme.text.primary};
`;

export const ConnectionLine = styled.View`
  width: 2px;
  height: ${spacing.sm}px;
  background-color: ${({ theme }) => theme.border.medium};
  margin-left: 5px;
  margin-vertical: ${spacing.xs / 2}px;
`;

export const EventDuration = styled.View`
  margin-left: 19px;
  margin-top: ${spacing.xs}px;
  align-self: flex-start;
`;

export const EventDurationText = styled.Text`
  font-size: ${typography.sizes.sm}px;
  font-weight: ${typography.weights.medium};
  color: ${({ theme }) => theme.text.secondary};
`;

export const DurationDivider = styled.View`
  flex-direction: row;
  align-items: center;
  margin-vertical: ${spacing.sm}px;
  margin-left: 19px;
  margin-right: ${spacing.md}px;
`;

export const DurationDividerLine = styled.View`
  flex: 1;
  height: 1px;
  background-color: ${({ theme }) => theme.border.light};
`;

export const DurationDividerText = styled.Text`
  font-size: ${typography.sizes.sm}px;
  font-weight: ${typography.weights.medium};
  color: ${({ theme }) => theme.text.secondary};
  margin-horizontal: ${spacing.sm}px;
`;

export const PeriodSeparator = styled.View`
  flex-direction: row;
  align-items: center;
  margin-vertical: ${spacing.md}px;
  margin-horizontal: ${spacing.md}px;
`;

export const PeriodSeparatorLine = styled.View`
  flex: 1;
  height: 1px;
  background-color: ${({ theme }) => theme.border.medium};
`;

export const PeriodSeparatorText = styled.Text`
  font-size: ${typography.sizes.xs}px;
  font-weight: ${typography.weights.medium};
  color: ${({ theme }) => theme.text.tertiary};
  margin-horizontal: ${spacing.md}px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const OrderIssueWarning = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme }) => theme.status.error}15;
  padding: ${spacing.sm}px ${spacing.md}px;
  border-radius: ${borderRadius.sm}px;
  margin-bottom: ${spacing.sm}px;
  gap: ${spacing.xs}px;
`;

export const OrderIssueText = styled.Text`
  font-size: ${typography.sizes.xs}px;
  font-weight: ${typography.weights.medium};
  color: ${({ theme }) => theme.status.error};
  flex: 1;
`;

export const HolidayBadge = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme }) => theme.status.warning}20;
  padding: ${spacing.xs}px ${spacing.sm}px;
  border-radius: ${borderRadius.sm}px;
  margin-left: ${spacing.sm}px;
  gap: ${spacing.xs / 2}px;
`;

export const HolidayBadgeText = styled.Text`
  font-size: ${typography.sizes.xs}px;
  font-weight: ${typography.weights.semibold};
  color: ${({ theme }) => theme.status.warning};
`;

export const DraftBadge = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme }) => theme.primary}20;
  padding: ${spacing.xs}px ${spacing.sm}px;
  border-radius: ${borderRadius.sm}px;
  margin-left: ${spacing.sm}px;
  gap: ${spacing.xs / 2}px;
  border-width: 1px;
  border-color: ${({ theme }) => theme.primary}40;
`;

export const DraftBadgeText = styled.Text`
  font-size: ${typography.sizes.xs}px;
  font-weight: ${typography.weights.semibold};
  color: ${({ theme }) => theme.primary};
`;

export const DraftWarning = styled.View`
  flex-direction: row;
  align-items: center;
  background-color: ${({ theme }) => theme.primary}15;
  padding: ${spacing.sm}px ${spacing.md}px;
  border-radius: ${borderRadius.sm}px;
  margin-top: ${spacing.xs}px;
  margin-bottom: ${spacing.xs}px;
  gap: ${spacing.xs}px;
  border-left-width: 3px;
  border-left-color: ${({ theme }) => theme.primary};
`;

export const DraftWarningText = styled.Text`
  font-size: ${typography.sizes.xs}px;
  font-weight: ${typography.weights.medium};
  color: ${({ theme }) => theme.primary};
  flex: 1;
`;

export const GenerateReportButton = styled.TouchableOpacity<{ disabled?: boolean; theme?: any }>`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: ${spacing.sm}px;
  background-color: ${(props: any) => props.theme.primary};
  padding: ${spacing.md}px ${spacing.lg}px;
  border-radius: ${borderRadius.md}px;
  margin-top: ${spacing.md}px;
  min-height: 48px;
  opacity: ${props => (props.disabled ? 0.6 : 1)};
`;

export const GenerateReportButtonText = styled.Text<{ hidden?: boolean; theme?: any }>`
  font-size: ${typography.sizes.sm}px;
  font-weight: ${typography.weights.semibold};
  color: ${(props: any) => props.theme.background.primary};
  opacity: ${(props: { hidden?: boolean }) => (props.hidden ? 0 : 1)};
`;

export const GenerateReportSecondaryButton = styled(GenerateReportButton)`
  background-color: transparent;
  border-width: 1px;
  border-color: ${(props: any) => props.theme.primary};
  margin-top: ${spacing.xs}px;
`;

export const GenerateReportSecondaryButtonText = styled(GenerateReportButtonText)`
  color: ${(props: any) => props.theme.primary};
`;

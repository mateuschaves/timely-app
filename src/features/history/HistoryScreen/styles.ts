import styled from 'styled-components/native';
import { FlatList, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography, shadows } from '@/theme';

export const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: ${colors.background.primary};
  padding-bottom: 100px;
`;

export const FilterContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: ${spacing.md}px;
  background-color: ${colors.background.primary};
  border-bottom-width: 1px;
  border-bottom-color: ${colors.border.light};
`;

export const FilterButton = styled.TouchableOpacity`
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
  border-radius: ${borderRadius.md}px;
  background-color: ${colors.background.secondary};
`;

export const FilterButtonText = styled.Text`
  font-size: ${typography.sizes.xl}px;
  font-weight: ${typography.weights.bold};
  color: ${colors.text.primary};
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
  color: ${colors.text.primary};
  text-transform: capitalize;
`;

export const List = styled(FlatList)`
  flex: 1;
  padding: ${spacing.md}px;
`;

export const EntryCard = styled.View`
  background-color: ${colors.background.primary};
  border-radius: ${borderRadius.md}px;
  padding: ${spacing.md}px;
  margin-bottom: ${spacing.sm}px;
  border-width: 1px;
  border-color: ${colors.border.light};
`;

interface EntryTypeProps {
  type: 'entry' | 'exit';
}

export const EntryType = styled.Text<EntryTypeProps>`
  font-size: ${typography.sizes.sm}px;
  font-weight: ${typography.weights.semibold};
  color: ${(props: EntryTypeProps) => (props.type === 'entry' ? colors.status.success : colors.status.error)};
  margin-bottom: ${spacing.sm}px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const EntryDate = styled.Text`
  font-size: ${typography.sizes.sm}px;
  color: ${colors.text.secondary};
`;

export const EmptyState = styled.View`
  flex: 1;
  align-items: center;
  justify-content: center;
  padding: ${spacing.xxl}px;
`;

export const EmptyStateText = styled.Text`
  font-size: ${typography.sizes.md}px;
  color: ${colors.text.tertiary};
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
  background-color: ${colors.background.primary};
  border-top-width: 1px;
  border-top-color: ${colors.border.light};
`;

export const PaginationButton = styled.TouchableOpacity`
  padding: ${spacing.sm}px ${spacing.md}px;
  border-radius: ${borderRadius.md}px;
  background-color: ${colors.background.secondary};
`;

export const PaginationButtonText = styled.Text`
  font-size: ${typography.sizes.sm}px;
  font-weight: ${typography.weights.medium};
  color: ${colors.text.primary};
`;

export const PaginationInfo = styled.Text`
  font-size: ${typography.sizes.sm}px;
  font-weight: ${typography.weights.medium};
  color: ${colors.text.secondary};
`;

interface DayGroupCardProps {
  incomplete?: boolean;
}

export const DayGroupCard = styled.View<DayGroupCardProps>`
  background-color: ${colors.background.primary};
  border-radius: ${borderRadius.lg}px;
  padding: ${spacing.md}px;
  margin-bottom: ${spacing.md}px;
  border-width: 1px;
  border-color: ${(props: DayGroupCardProps) => props.incomplete ? colors.status.warning : colors.border.light};
  border-style: ${(props: DayGroupCardProps) => props.incomplete ? 'dashed' : 'solid'};
  opacity: ${(props: DayGroupCardProps) => props.incomplete ? 0.9 : 1};
`;

export const DayHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${spacing.md}px;
  padding-bottom: ${spacing.sm}px;
  border-bottom-width: 1px;
  border-bottom-color: ${colors.border.light};
`;

export const HeaderRight = styled.View`
  flex-direction: row;
  align-items: center;
`;

export const DayDate = styled.Text`
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.semibold};
  color: ${colors.text.primary};
  text-transform: capitalize;
`;

interface DurationBadgeProps {
  incomplete?: boolean;
}

export const DurationBadge = styled.View<DurationBadgeProps>`
  background-color: ${(props: DurationBadgeProps) => props.incomplete ? colors.status.warning + '20' : colors.background.secondary};
  padding: ${spacing.xs}px ${spacing.sm}px;
  border-radius: ${borderRadius.sm}px;
  border-width: ${(props: DurationBadgeProps) => props.incomplete ? '1px' : '0px'};
  border-color: ${(props: DurationBadgeProps) => props.incomplete ? colors.status.warning : 'transparent'};
`;

export const DurationText = styled.Text<DurationBadgeProps>`
  font-size: ${typography.sizes.xs}px;
  font-weight: ${typography.weights.medium};
  color: ${(props: DurationBadgeProps) => props.incomplete ? colors.status.warning : colors.text.primary};
`;

export const DayEntriesContainer = styled.View`
  gap: ${spacing.xs}px;
`;

export const EntryRow = styled.View`
  flex-direction: row;
  align-items: center;
  gap: ${spacing.sm}px;
`;

export const EditButton = styled.TouchableOpacity`
  padding: ${spacing.xs}px;
  margin-left: ${spacing.xs}px;
`;

export const StatsContainer = styled.View`
  padding: ${spacing.md}px;
  padding-bottom: 0;
`;

export const StatsCard = styled.View`
  background-color: ${colors.background.primary};
  border-radius: ${borderRadius.lg}px;
  padding: ${spacing.lg}px;
  margin-bottom: ${spacing.md}px;
  shadow-color: ${shadows.sm.shadowColor};
  shadow-offset: ${shadows.sm.shadowOffset.width}px ${shadows.sm.shadowOffset.height}px;
  shadow-opacity: ${shadows.sm.shadowOpacity};
  shadow-radius: ${shadows.sm.shadowRadius}px;
  elevation: ${shadows.sm.elevation};
`;

export const StatsTitle = styled.Text`
  font-size: ${typography.sizes.lg}px;
  font-weight: ${typography.weights.bold};
  color: ${colors.text.primary};
  margin-bottom: ${spacing.lg}px;
  text-align: center;
`;

export const StatsRow = styled.View`
  flex-direction: row;
  justify-content: space-between;
  margin-bottom: ${spacing.md}px;
`;

export const StatsItem = styled.View`
  flex: 1;
  align-items: center;
`;

export const StatsLabel = styled.Text`
  font-size: ${typography.sizes.sm}px;
  color: ${colors.text.secondary};
  margin-bottom: ${spacing.xs}px;
  text-align: center;
`;

export const StatsValue = styled.Text`
  font-size: ${typography.sizes.xl}px;
  font-weight: ${typography.weights.bold};
  color: ${colors.text.primary};
  text-align: center;
`;

export const StatsDifference = styled.View<{ status: 'over' | 'under' | 'exact' }>`
  align-items: center;
  margin-bottom: ${spacing.md}px;
  padding: ${spacing.sm}px;
  border-radius: ${borderRadius.md}px;
  background-color: ${props => {
    if (props.status === 'over') return colors.status.success;
    if (props.status === 'under') return colors.status.error;
    return colors.background.secondary;
  }};
`;

export const StatsDifferenceText = styled.Text<{ status: 'over' | 'under' | 'exact' }>`
  font-size: ${typography.sizes.lg}px;
  font-weight: ${typography.weights.bold};
  color: ${props => {
    if (props.status === 'exact') return colors.text.primary;
    return colors.text.inverse;
  }};
`;

interface EntryIndicatorProps {
  type: 'entry' | 'exit';
}

export const EntryIndicator = styled.View<EntryIndicatorProps>`
  width: 12px;
  height: 12px;
  border-radius: 6px;
  background-color: ${(props: EntryIndicatorProps) => 
    props.type === 'entry' ? colors.status.success : colors.status.error
  };
`;

export const EntryContent = styled.View`
  flex: 1;
`;

export const EntryLabel = styled.Text`
  font-size: ${typography.sizes.xs}px;
  font-weight: ${typography.weights.medium};
  color: ${colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: ${spacing.xs / 2}px;
`;

export const EntryTime = styled.Text`
  font-size: ${typography.sizes.lg}px;
  font-weight: ${typography.weights.bold};
  color: ${colors.text.primary};
`;

export const ConnectionLineContainer = styled.View`
  flex-direction: row;
  align-items: center;
  margin-left: 17px;
  margin-vertical: ${spacing.sm}px;
  padding-horizontal: ${spacing.xs}px;
  gap: ${spacing.sm}px;
  min-height: 32px;
`;

export const ConnectionLineLeft = styled.View`
  flex: 1;
  min-width: 16px;
  height: 2px;
  background-color: ${colors.border.medium};
`;

export const ConnectionLineRight = styled.View`
  flex: 1;
  min-width: 16px;
  height: 2px;
  background-color: ${colors.border.medium};
`;

export const HoursWorkedBadge = styled.View`
  background-color: ${colors.background.secondary};
  padding: ${spacing.xs}px ${spacing.sm}px;
  border-radius: ${borderRadius.sm}px;
  border-width: 1px;
  border-color: ${colors.border.light};
  min-width: 50px;
  align-items: center;
`;

export const HoursWorkedText = styled.Text`
  font-size: ${typography.sizes.xs}px;
  font-weight: ${typography.weights.semibold};
  color: ${colors.text.primary};
`;

interface WorkPeriodContainerProps {
  isLast?: boolean;
}

export const WorkPeriodContainer = styled.View<WorkPeriodContainerProps>`
  margin-bottom: ${(props: WorkPeriodContainerProps) => props.isLast ? '0px' : spacing.md + 'px'};
`;

export const IntervalSeparator = styled.View`
  flex-direction: row;
  align-items: center;
  margin-vertical: ${spacing.lg}px;
  gap: ${spacing.sm}px;
`;

export const IntervalLine = styled.View`
  flex: 1;
  height: 1px;
  background-color: ${colors.border.medium};
`;

export const IntervalLabel = styled.Text`
  font-size: ${typography.sizes.xs}px;
  font-weight: ${typography.weights.medium};
  color: ${colors.text.tertiary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding-horizontal: ${spacing.xs}px;
`;

interface StatusBadgeProps {
  status: 'over' | 'under' | 'exact';
}

export const StatusBadge = styled.View<StatusBadgeProps>`
  background-color: ${(props: StatusBadgeProps) => {
    if (props.status === 'over') return colors.status.success + '20';
    if (props.status === 'under') return colors.status.error + '20';
    return colors.background.secondary;
  }};
  padding: ${spacing.xs}px ${spacing.sm}px;
  border-radius: ${borderRadius.sm}px;
  border-width: 1px;
  border-color: ${(props: StatusBadgeProps) => {
    if (props.status === 'over') return colors.status.success;
    if (props.status === 'under') return colors.status.error;
    return colors.border.light;
  }};
`;

export const StatusText = styled.Text<StatusBadgeProps>`
  font-size: ${typography.sizes.xs}px;
  font-weight: ${typography.weights.semibold};
  color: ${(props: StatusBadgeProps) => {
    if (props.status === 'over') return colors.status.success;
    if (props.status === 'under') return colors.status.error;
    return colors.text.primary;
  }};
`;



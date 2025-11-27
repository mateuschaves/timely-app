import styled from 'styled-components/native';
import { FlatList, TouchableOpacity } from 'react-native';
import { colors, spacing, borderRadius, typography, shadows } from '@/theme';

export const Container = styled.SafeAreaView`
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

export const ConnectionLine = styled.View`
  width: 2px;
  height: ${spacing.md}px;
  background-color: ${colors.border.medium};
  margin-left: 5px;
  margin-vertical: ${spacing.xs}px;
`;

export const HoursWorkedBadge = styled.View`
  margin-top: ${spacing.xs}px;
  align-self: flex-start;
  background-color: ${colors.background.secondary};
  padding: ${spacing.xs / 2}px ${spacing.sm}px;
  border-radius: ${borderRadius.sm}px;
`;

export const HoursWorkedText = styled.Text`
  font-size: ${typography.sizes.xs}px;
  font-weight: ${typography.weights.medium};
  color: ${colors.text.secondary};
`;



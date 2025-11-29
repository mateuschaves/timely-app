import styled from 'styled-components/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, borderRadius, typography, shadows } from '@/theme';

export const Container = styled(SafeAreaView)`
  flex: 1;
  background-color: ${colors.background.secondary};
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

export const HeaderTitle = styled.Text`
  font-size: ${typography.sizes.lg}px;
  font-weight: ${typography.weights.semibold};
  color: ${colors.text.primary};
  flex: 1;
  text-align: center;
`;

export const Content = styled.View`
  flex: 1;
  padding: ${spacing.lg}px;
`;

export const SettingsCard = styled.View`
  background-color: ${colors.background.primary};
  border-radius: ${borderRadius.lg}px;
  padding: ${spacing.md}px;
  margin-bottom: ${spacing.lg}px;
  shadow-color: ${shadows.sm.shadowColor};
  shadow-offset: ${shadows.sm.shadowOffset.width}px ${shadows.sm.shadowOffset.height}px;
  shadow-opacity: ${shadows.sm.shadowOpacity};
  shadow-radius: ${shadows.sm.shadowRadius}px;
  elevation: ${shadows.sm.elevation};
`;

export const SettingSection = styled.View`
  margin-bottom: ${spacing.sm}px;
`;

export const SettingLabel = styled.Text`
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.semibold};
  color: ${colors.text.primary};
  margin-bottom: ${spacing.sm}px;
`;

export const InputContainer = styled.View`
  background-color: ${colors.background.secondary};
  border-radius: ${borderRadius.md}px;
  overflow: hidden;
`;

export const Input = styled.TextInput`
  padding: ${spacing.sm}px ${spacing.md}px;
  min-height: 80px;
  font-size: ${typography.sizes.md}px;
  color: ${colors.text.primary};
  font-weight: ${typography.weights.regular};
  line-height: 22px;
  text-align-vertical: top;
`;

export const DayRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: ${spacing.sm}px 0;
  min-height: 48px;
`;

export const DayInfo = styled.View`
  flex: 1;
`;

export const DayName = styled.Text`
  font-size: ${typography.sizes.md}px;
  color: ${colors.text.primary};
  font-weight: ${typography.weights.regular};
  line-height: 22px;
`;


export const TimeRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: ${spacing.md}px;
  margin-top: ${spacing.xs}px;
  margin-bottom: ${spacing.sm}px;
  margin-left: ${spacing.md}px;
`;

export const TimeInput = styled.TextInput`
  flex: 1;
  background-color: ${colors.background.secondary};
  border-radius: ${borderRadius.md}px;
  padding: ${spacing.sm}px ${spacing.md}px;
  min-height: 48px;
  font-size: ${typography.sizes.lg}px;
  color: ${colors.text.primary};
  font-weight: ${typography.weights.semibold};
  text-align: center;
`;

export const TimeSeparator = styled.Text`
  font-size: ${typography.sizes.lg}px;
  color: ${colors.text.secondary};
  font-weight: ${typography.weights.medium};
`;

export const SaveButton = styled.TouchableOpacity<{ disabled?: boolean }>`
  background-color: ${colors.primary};
  border-radius: ${borderRadius.lg}px;
  padding: ${spacing.md}px ${spacing.lg}px;
  align-items: center;
  justify-content: center;
  margin-top: ${spacing.sm}px;
  opacity: ${(props: { disabled?: boolean }) => (props.disabled ? 0.6 : 1)};
`;

export const SaveButtonText = styled.Text`
  color: ${colors.text.inverse};
  font-size: ${typography.sizes.md}px;
  font-weight: ${typography.weights.semibold};
`;

export const HolidayRow = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  padding: ${spacing.sm}px 0;
  border-bottom-width: 1px;
  border-bottom-color: ${colors.border.light};
`;

export const HolidayInfo = styled.View`
  flex: 1;
  margin-right: ${spacing.md}px;
`;

export const HolidayDate = styled.Text`
  font-size: ${typography.sizes.sm}px;
  color: ${colors.text.secondary};
  font-weight: ${typography.weights.regular};
`;

export const HolidayName = styled.Text`
  font-size: ${typography.sizes.md}px;
  color: ${colors.text.primary};
  font-weight: ${typography.weights.medium};
  margin-top: ${spacing.xs}px;
`;

export const HolidayActions = styled.View`
  flex-direction: row;
  gap: ${spacing.sm}px;
`;

export const HolidayActionButton = styled.TouchableOpacity`
  padding: ${spacing.sm}px;
`;

export const AddHolidayButton = styled.TouchableOpacity`
  flex-direction: row;
  align-items: center;
  justify-content: center;
  padding: ${spacing.md}px;
  border-radius: ${borderRadius.md}px;
  border-width: 1px;
  border-color: ${colors.primary};
  border-style: dashed;
  margin-top: ${spacing.sm}px;
`;

export const AddHolidayButtonText = styled.Text`
  font-size: ${typography.sizes.md}px;
  color: ${colors.primary};
  font-weight: ${typography.weights.semibold};
  margin-left: ${spacing.xs}px;
`;

export const HolidayInputRow = styled.View`
  flex-direction: column;
  align-items: center;
  gap: ${spacing.sm}px;
  margin-top: ${spacing.sm}px;
  margin-bottom: ${spacing.sm}px;
`;

export const HolidayDateInput = styled.TextInput`
  width: 100%;
  background-color: ${colors.background.secondary};
  border-radius: ${borderRadius.md}px;
  padding: ${spacing.sm}px ${spacing.md}px;
  height: 48px;
  font-size: ${typography.sizes.md}px;
  color: ${colors.text.primary};
  font-weight: ${typography.weights.regular};
`;

export const HolidayNameInput = styled.TextInput`
  width: 100%;
  background-color: ${colors.background.secondary};
  border-radius: ${borderRadius.md}px;
  padding: ${spacing.sm}px ${spacing.md}px;
  height: 48px;
  font-size: ${typography.sizes.md}px;
  color: ${colors.text.primary};
  font-weight: ${typography.weights.regular};
`;

export const EmptyHolidaysText = styled.Text`
  font-size: ${typography.sizes.sm}px;
  color: ${colors.text.tertiary};
  text-align: center;
  padding: ${spacing.md}px;
  font-style: italic;
`;

export const DatePickerButton = styled.TouchableOpacity`
  width: 100%;
  background-color: ${colors.background.secondary};
  border-radius: ${borderRadius.md}px;
  padding: ${spacing.sm}px ${spacing.md}px;
  height: 48px;
  justify-content: center;
  flex-direction: column;
`;

export const DatePickerButtonLabel = styled.Text`
  font-size: ${typography.sizes.xs}px;
  color: ${colors.text.secondary};
  font-weight: ${typography.weights.regular};
  margin-bottom: 2px;
  line-height: ${typography.sizes.xs}px;
`;

export const DatePickerButtonContent = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: ${spacing.xs}px;
`;

export const DatePickerButtonText = styled.Text<{ placeholder?: boolean }>`
  font-size: ${typography.sizes.md}px;
  color: ${(props: { placeholder?: boolean }) => (props.placeholder ? colors.text.tertiary : colors.text.primary)};
  font-weight: ${typography.weights.medium};
  text-align: center;
`;

export const CalendarModal = styled.View`
  background-color: ${colors.background.primary};
  border-radius: ${borderRadius.lg}px;
  padding: ${spacing.lg}px;
  max-height: 500px;
`;

export const CalendarHeader = styled.View`
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${spacing.md}px;
`;

export const CalendarMonthYear = styled.Text`
  font-size: ${typography.sizes.lg}px;
  font-weight: ${typography.weights.semibold};
  color: ${colors.text.primary};
`;

export const CalendarNavButton = styled.TouchableOpacity`
  padding: ${spacing.xs}px;
`;

export const CalendarWeekDays = styled.View`
  flex-direction: row;
  margin-bottom: ${spacing.xs}px;
`;

export const CalendarWeekDay = styled.Text`
  flex: 1;
  text-align: center;
  font-size: ${typography.sizes.sm}px;
  font-weight: ${typography.weights.semibold};
  color: ${colors.text.secondary};
  padding: ${spacing.xs}px;
`;

export const CalendarDays = styled.View`
  flex-direction: row;
  flex-wrap: wrap;
`;

export const CalendarDay = styled.TouchableOpacity<{ isSelected?: boolean; isCurrentMonth?: boolean; isToday?: boolean }>`
  width: 14.28%;
  aspect-ratio: 1;
  justify-content: center;
  align-items: center;
  border-radius: ${borderRadius.md}px;
  background-color: ${(props: { isSelected?: boolean; isCurrentMonth?: boolean; isToday?: boolean }) => {
    if (props.isSelected) return colors.primary;
    if (props.isToday && !props.isSelected) return colors.background.secondary;
    return 'transparent';
  }};
  margin: 2px;
`;

export const CalendarDayText = styled.Text<{ isSelected?: boolean; isCurrentMonth?: boolean; isToday?: boolean }>`
  font-size: ${typography.sizes.md}px;
  font-weight: ${(props: { isSelected?: boolean; isCurrentMonth?: boolean; isToday?: boolean }) => (props.isToday || props.isSelected ? typography.weights.semibold : typography.weights.regular)};
  color: ${(props: { isSelected?: boolean; isCurrentMonth?: boolean; isToday?: boolean }) => {
    if (props.isSelected) return colors.text.inverse;
    if (!props.isCurrentMonth) return colors.text.tertiary;
    if (props.isToday) return colors.primary;
    return colors.text.primary;
  }};
`;

export const ModalOverlay = styled.View`
  flex: 1;
  background-color: rgba(0, 0, 0, 0.5);
  justify-content: center;
  align-items: center;
  padding: ${spacing.lg}px;
`;


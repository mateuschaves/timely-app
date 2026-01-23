import React, { useMemo, useState } from 'react';
import { ListRenderItem } from 'react-native';
import { useTranslation } from '@/i18n';
import { useNavigation } from '@react-navigation/native';
import { startOfMonth, endOfMonth, format, parseISO, subMonths, addMonths } from 'date-fns';
import { ptBR, enUS, fr, de } from 'date-fns/locale';
import { useAbsences } from '@/features/absences/hooks/useAbsences';
import { AbsenceDay, AbsenceEntry } from '@/api/get-absences';
import { useTheme } from '@/theme/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { capitalizeFirstLetter } from '@/utils/string';
import {
  Container,
  MonthNavigation,
  MonthNavigationButton,
  MonthNavigationText,
  DaysList,
  DayCard,
  DayHeader,
  DayDate,
  AbsencesList,
  AbsenceCard,
  AbsenceReason,
  AbsenceDescription,
  EmptyState,
  EmptyStateText,
  AddButton,
  AddButtonText,
  LoadingContainer,
} from './styles';
import { ActivityIndicator } from 'react-native';

const getMonthRange = (date: Date = new Date()) => {
  const start = startOfMonth(date);
  const end = endOfMonth(date);

  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    month: date,
  };
};

const getDateLocale = (language: string) => {
  switch (language) {
    case 'pt-BR':
      return ptBR;
    case 'fr-FR':
      return fr;
    case 'de-DE':
      return de;
    default:
      return enUS;
  }
};

export function AbsencesListScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

  const { startDate, endDate, month } = useMemo(() => getMonthRange(currentMonth), [currentMonth]);

  const { data, isLoading } = useAbsences({ startDate, endDate });

  const dateLocale = getDateLocale(i18n.language);

  const currentMonthFormatted = useMemo(() => {
    return format(month, 'MMMM yyyy', { locale: dateLocale });
  }, [month, dateLocale]);

  const handlePreviousMonth = () => {
    setCurrentMonth((prev) => subMonths(prev, 1));
    setExpandedDays(new Set());
  };

  const handleNextMonth = () => {
    setCurrentMonth((prev) => addMonths(prev, 1));
    setExpandedDays(new Set());
  };

  const canGoNextMonth = useMemo(() => {
    const today = new Date();
    const nextMonth = addMonths(currentMonth, 1);
    const nextMonthStart = startOfMonth(nextMonth);
    const todayStart = startOfMonth(today);
    return nextMonthStart <= todayStart;
  }, [currentMonth]);

  const toggleDay = (date: string) => {
    const newExpanded = new Set(expandedDays);
    if (newExpanded.has(date)) {
      newExpanded.delete(date);
    } else {
      newExpanded.add(date);
    }
    setExpandedDays(newExpanded);
  };

  const handleAddAbsence = () => {
    navigation.navigate('AddAbsence');
  };

  const renderAbsence = (absence: AbsenceEntry) => (
    <AbsenceCard key={absence.id}>
      <AbsenceReason>{absence.reason}</AbsenceReason>
      {absence.description && (
        <AbsenceDescription>{absence.description}</AbsenceDescription>
      )}
    </AbsenceCard>
  );

  const renderDay: ListRenderItem<AbsenceDay> = ({ item }) => {
    const isExpanded = expandedDays.has(item.date);
    const date = parseISO(item.date);
    const dayNumber = format(date, 'dd', { locale: dateLocale });
    const dayName = format(date, 'EEEE', { locale: dateLocale });
    const formattedDate = `${dayNumber} ${capitalizeFirstLetter(dayName)}`;

    return (
      <DayCard>
        <DayHeader onPress={() => toggleDay(item.date)} activeOpacity={0.7}>
          <DayDate>{formattedDate}</DayDate>
          <Ionicons
            name={isExpanded ? 'chevron-up' : 'chevron-down'}
            size={20}
            color={theme.text.secondary}
          />
        </DayHeader>

        {isExpanded && item.absences && item.absences.length > 0 && (
          <AbsencesList>
            {item.absences.map(renderAbsence)}
          </AbsencesList>
        )}
      </DayCard>
    );
  };

  return (
    <Container>
      <MonthNavigation>
        <MonthNavigationButton onPress={handlePreviousMonth} activeOpacity={0.7}>
          <Ionicons name="chevron-back" size={24} color={theme.text.primary} />
        </MonthNavigationButton>

        <MonthNavigationText>{currentMonthFormatted}</MonthNavigationText>

        <MonthNavigationButton
          onPress={handleNextMonth}
          activeOpacity={0.7}
          disabled={!canGoNextMonth}
        >
          <Ionicons
            name="chevron-forward"
            size={24}
            color={canGoNextMonth ? theme.text.primary : theme.text.tertiary}
          />
        </MonthNavigationButton>
      </MonthNavigation>

      {isLoading ? (
        <LoadingContainer>
          <ActivityIndicator size="large" color={theme.primary} />
        </LoadingContainer>
      ) : (
        <DaysList
          data={data?.data || []}
          keyExtractor={(item: AbsenceDay, index: number) => `${item.date}-${index}`}
          renderItem={renderDay}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <EmptyState>
              <EmptyStateText>{t('absences.empty')}</EmptyStateText>
            </EmptyState>
          }
          ListHeaderComponent={
            <AddButton onPress={handleAddAbsence} activeOpacity={0.7}>
              <Ionicons name="add-circle" size={20} color={theme.text.inverse} />
              <AddButtonText>{t('absences.addNew')}</AddButtonText>
            </AddButton>
          }
        />
      )}
    </Container>
  );
}

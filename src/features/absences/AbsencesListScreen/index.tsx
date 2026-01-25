import React, { useMemo, useState } from 'react';
import { ListRenderItem, Modal } from 'react-native';
import { useTranslation } from '@/i18n';
import { useNavigation } from '@react-navigation/native';
import { startOfMonth, endOfMonth, format, parseISO, subMonths, addMonths } from 'date-fns';
import { ptBR, enUS, fr, de } from 'date-fns/locale';
import { useAbsences } from '@/features/absences/hooks/useAbsences';
import { AbsenceDay, AbsenceEntry } from '@/api/get-absences';
import { useTheme } from '@/theme/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { capitalizeFirstLetter } from '@/utils/string';
import { Button } from '@/components/Button';
import {
  Container,
  Header,
  BackButton,
  HeaderTitle,
  ListHeaderWrapper,
  MonthChip,
  MonthChipLeft,
  MonthChipText,
  MonthPickerModalWrapper,
  MonthPickerModalOverlay,
  MonthPickerModalContent,
  MonthPickerModalHeader,
  MonthPickerModalTitle,
  MonthPickerCloseButton,
  MonthPickerList,
  MonthOption,
  MonthOptionText,
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

const MONTHS_PICKER_RANGE = 24;

export function AbsencesListScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
  const [showMonthPicker, setShowMonthPicker] = useState(false);

  const { startDate, endDate, month } = useMemo(() => getMonthRange(currentMonth), [currentMonth]);

  const { data, isLoading } = useAbsences({ startDate, endDate });

  const dateLocale = getDateLocale(i18n.language);

  const currentMonthFormatted = useMemo(() => {
    return format(month, 'MMMM yyyy', { locale: dateLocale });
  }, [month, dateLocale]);

  const availableMonths = useMemo(() => {
    const today = new Date();
    const from = subMonths(startOfMonth(today), MONTHS_PICKER_RANGE - 1);
    const months: { date: Date; label: string }[] = [];
    let d = from;
    while (d <= today) {
      months.push({
        date: d,
        label: format(d, 'MMMM yyyy', { locale: dateLocale }),
      });
      d = addMonths(d, 1);
    }
    return months.reverse();
  }, [dateLocale]);

  const handleSelectMonth = (date: Date) => {
    setCurrentMonth(startOfMonth(date));
    setExpandedDays(new Set());
    setShowMonthPicker(false);
  };

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

  const listHeader = (
    <ListHeaderWrapper>
      <MonthChip onPress={() => setShowMonthPicker(true)} activeOpacity={0.7}>
        <MonthChipLeft>
          <Ionicons name="calendar-outline" size={20} color={theme.text.primary} />
          <MonthChipText>{currentMonthFormatted}</MonthChipText>
        </MonthChipLeft>
        <Ionicons name="chevron-down" size={20} color={theme.text.secondary} />
      </MonthChip>
      <Button title={t('absences.addNew')} onPress={handleAddAbsence} />
    </ListHeaderWrapper>
  );

  return (
    <Container>
      <Header>
        <BackButton onPress={() => navigation.goBack()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={24} color={theme.text.primary} />
        </BackButton>
        <HeaderTitle>{t('absences.title')}</HeaderTitle>
      </Header>

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
          ListHeaderComponent={listHeader}
        />
      )}

      <Modal
        visible={showMonthPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMonthPicker(false)}
      >
        <MonthPickerModalWrapper>
          <MonthPickerModalOverlay
            activeOpacity={1}
            onPress={() => setShowMonthPicker(false)}
          />
          <MonthPickerModalContent>
          <MonthPickerModalHeader>
            <MonthPickerModalTitle>{t('absences.selectMonth')}</MonthPickerModalTitle>
            <MonthPickerCloseButton onPress={() => setShowMonthPicker(false)}>
              <Ionicons name="close" size={24} color={theme.text.primary} />
            </MonthPickerCloseButton>
          </MonthPickerModalHeader>
          <MonthPickerList>
            {availableMonths.map(({ date, label }) => {
              const isSelected =
                format(date, 'yyyy-MM') === format(currentMonth, 'yyyy-MM');
              return (
                <MonthOption
                  key={label}
                  onPress={() => handleSelectMonth(date)}
                  activeOpacity={0.7}
                  selected={isSelected}
                >
                  <MonthOptionText selected={isSelected}>{label}</MonthOptionText>
                  {isSelected && (
                    <Ionicons
                      name="checkmark"
                      size={20}
                      color={theme.primary}
                      style={{ marginLeft: 'auto' }}
                    />
                  )}
                </MonthOption>
              );
            })}
          </MonthPickerList>
        </MonthPickerModalContent>
        </MonthPickerModalWrapper>
      </Modal>
    </Container>
  );
}

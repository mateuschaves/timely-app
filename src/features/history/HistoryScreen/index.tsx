import React, { useState, useMemo } from 'react';
import { ListRenderItem, RefreshControl, ActivityIndicator } from 'react-native';
import { useTranslation } from '@/i18n';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { useHistory } from '../hooks/useHistory';
import { ClockHistoryDay, ClockHistoryEvent } from '@/api/get-clock-history';
import { ClockAction } from '@/api/types';
import { getMonthRange, formatDateForAPI, getPreviousMonth, getNextMonth, formatTime, formatDate } from '@/utils/date';
import { colors, spacing, typography } from '@/theme';
import { AppStackParamList } from '@/navigation/AppNavigator';
import {
  Container,
  List,
  EmptyState,
  EmptyStateText,
  FilterContainer,
  FilterButton,
  FilterButtonText,
  DatePickerButton,
  DatePickerText,
  LoadingContainer,
  DayGroupCard,
  DayHeader,
  DayDate,
  DayEntriesContainer,
  EntryRow,
  EntryIndicator,
  EntryContent,
  EntryLabel,
  EntryTime,
  ConnectionLineContainer,
  ConnectionLineLeft,
  ConnectionLineRight,
  DurationBadge,
  DurationText,
  HoursWorkedBadge,
  HoursWorkedText,
  WorkPeriodContainer,
  IntervalSeparator,
  IntervalLine,
  IntervalLabel,
  HeaderRight,
  StatusBadge,
  StatusText,
  EditButton,
  StatsContainer,
  StatsCard,
  StatsTitle,
  StatsRow,
  StatsItem,
  StatsLabel,
  StatsValue,
  StatsDifference,
  StatsDifferenceText,
} from './styles';

type NavigationProp = NativeStackNavigationProp<AppStackParamList>;

export function HistoryScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation<NavigationProp>();
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  const { start, end } = getMonthRange(selectedMonth);
  const startDate = useMemo(
    () => formatDateForAPI(start),
    [start]
  );
  const endDate = useMemo(
    () => formatDateForAPI(end),
    [end]
  );

  const { days, summary, isLoading, refetch, isRefetching } = useHistory({
    startDate,
    endDate,
  });

  const handlePreviousMonth = () => {
    setSelectedMonth(getPreviousMonth(selectedMonth));
  };

  const handleNextMonth = () => {
    setSelectedMonth(getNextMonth(selectedMonth));
  };

  const renderItem: ListRenderItem<ClockHistoryDay> = ({ item }) => {
    const events = item.events || [];
    const hasIncomplete = events.some((e, i) => {
      if (e.action === ClockAction.CLOCK_IN) {
        const nextExit = events.slice(i + 1).find(event => event.action === ClockAction.CLOCK_OUT);
        return !nextExit;
      }
      return false;
    });

    return (
      <DayGroupCard incomplete={hasIncomplete}>
        <DayHeader>
          <DayDate>{formatDate(item.date, i18n.language)}</DayDate>
          <HeaderRight>
            {item.totalWorkedTime && (
              <DurationBadge style={{ marginRight: spacing.sm }}>
                <DurationText>{item.totalWorkedTime}</DurationText>
              </DurationBadge>
            )}
            {item.status && item.hoursDifferenceFormatted && (
              <StatusBadge status={item.status}>
                <StatusText status={item.status}>
                  {item.status === 'over' ? '+' : ''}{item.hoursDifferenceFormatted}
                </StatusText>
              </StatusBadge>
            )}
            {!item.totalWorkedTime && hasIncomplete && (
              <DurationBadge incomplete>
                <DurationText>{t('history.pendingExit')}</DurationText>
              </DurationBadge>
            )}
          </HeaderRight>
        </DayHeader>

        <DayEntriesContainer>
          {events.length === 0 ? (
            <EntryRow>
              <EntryContent>
                <EntryLabel>{t('history.noEntries')}</EntryLabel>
              </EntryContent>
            </EntryRow>
          ) : (
            (() => {
              const periods: ClockHistoryEvent[][] = [];
              let currentPeriod: ClockHistoryEvent[] = [];

              events.forEach((event, index) => {
                if (event.action === ClockAction.CLOCK_IN) {
                  if (currentPeriod.length > 0) {
                    periods.push([...currentPeriod]);
                    currentPeriod = [];
                  }
                  currentPeriod.push(event);
                } else if (event.action === ClockAction.CLOCK_OUT) {
                  currentPeriod.push(event);
                  periods.push([...currentPeriod]);
                  currentPeriod = [];
                }
              });

              if (currentPeriod.length > 0) {
                periods.push(currentPeriod);
              }

              return periods.map((period, periodIndex) => {
                const isLastPeriod = periodIndex === periods.length - 1;
                const entryEvent = period.find(e => e.action === ClockAction.CLOCK_IN);
                const exitEvent = period.find(e => e.action === ClockAction.CLOCK_OUT);
                const workedTime = exitEvent?.workedTime;
                const hasPreviousPeriod = periodIndex > 0;

                return (
                  <React.Fragment key={`period-${periodIndex}`}>
                    {hasPreviousPeriod && (
                      <IntervalSeparator>
                        <IntervalLine />
                        <IntervalLabel>{t('history.interval')}</IntervalLabel>
                        <IntervalLine />
                      </IntervalSeparator>
                    )}
                    <WorkPeriodContainer isLast={isLastPeriod}>
                      {entryEvent && (
                        <>
                          <EntryRow>
                            <EntryIndicator type="entry" />
                            <EntryContent>
                              <EntryLabel>{t('history.entry')}</EntryLabel>
                              <EntryTime>{formatTime(entryEvent.hour, i18n.language)}</EntryTime>
                            </EntryContent>
                            <EditButton
                              onPress={() => navigation.navigate('EditEvent', { event: entryEvent })}
                              activeOpacity={0.7}
                            >
                              <Ionicons name="create-outline" size={20} color={colors.text.secondary} />
                            </EditButton>
                          </EntryRow>
                          {exitEvent && (
                            <>
                              <ConnectionLineContainer>
                                <ConnectionLineLeft />
                                <HoursWorkedBadge>
                                  <HoursWorkedText>{workedTime || '--'}</HoursWorkedText>
                                </HoursWorkedBadge>
                                <ConnectionLineRight />
                              </ConnectionLineContainer>
                              <EntryRow>
                                <EntryIndicator type="exit" />
                                <EntryContent>
                                  <EntryLabel>{t('history.exit')}</EntryLabel>
                                  <EntryTime>{formatTime(exitEvent.hour, i18n.language)}</EntryTime>
                                </EntryContent>
                                <EditButton
                                  onPress={() => navigation.navigate('EditEvent', { event: exitEvent })}
                                  activeOpacity={0.7}
                                >
                                  <Ionicons name="create-outline" size={20} color={colors.text.secondary} />
                                </EditButton>
                              </EntryRow>
                            </>
                          )}
                        </>
                      )}
                      {!entryEvent && exitEvent && (
                        <EntryRow>
                          <EntryIndicator type="exit" />
                          <EntryContent>
                            <EntryLabel>{t('history.exit')}</EntryLabel>
                            <EntryTime>{formatTime(exitEvent.hour, i18n.language)}</EntryTime>
                          </EntryContent>
                          <EditButton
                            onPress={() => navigation.navigate('EditEvent', { event: exitEvent })}
                            activeOpacity={0.7}
                          >
                            <Ionicons name="create-outline" size={20} color={colors.text.secondary} />
                          </EditButton>
                        </EntryRow>
                      )}
                    </WorkPeriodContainer>
                  </React.Fragment>
                );
              });
            })()
          )}
        </DayEntriesContainer>
      </DayGroupCard>
    );
  };

  const monthName = selectedMonth.toLocaleDateString(
    i18n.language === 'pt-BR' ? 'pt-BR' : 'en-US',
    { month: 'long', year: 'numeric' }
  );

  if (isLoading) {
    return (
      <Container>
        <LoadingContainer>
          <ActivityIndicator size="large" color={colors.primary} />
        </LoadingContainer>
      </Container>
    );
  }

  return (
    <Container>
      <FilterContainer>
        <FilterButton onPress={handlePreviousMonth}>
          <FilterButtonText>‹</FilterButtonText>
        </FilterButton>
        <DatePickerButton>
          <DatePickerText>{monthName}</DatePickerText>
        </DatePickerButton>
        <FilterButton onPress={handleNextMonth}>
          <FilterButtonText>›</FilterButtonText>
        </FilterButton>
      </FilterContainer>

      {summary && (
        <StatsContainer>
          <StatsCard>
            <StatsTitle>{t('history.monthlyStats')}</StatsTitle>
            
            <StatsRow>
              <StatsItem>
                <StatsLabel>{t('history.workedHours')}</StatsLabel>
                <StatsValue>{summary.totalWorkedHoursFormatted}</StatsValue>
              </StatsItem>
              <StatsItem>
                <StatsLabel>{t('history.expectedHours')}</StatsLabel>
                <StatsValue>{summary.totalExpectedHoursFormatted}</StatsValue>
              </StatsItem>
            </StatsRow>

            <StatsDifference status={summary.status}>
              <StatsDifferenceText status={summary.status}>
                {summary.status === 'over' ? '+' : ''}{summary.hoursDifferenceFormatted}
              </StatsDifferenceText>
            </StatsDifference>

            <StatsRow>
              <StatsItem>
                <StatsLabel>{t('history.daysWorked')}</StatsLabel>
                <StatsValue>{summary.daysWorked} / {summary.totalDays}</StatsValue>
              </StatsItem>
              <StatsItem>
                <StatsLabel>{t('history.averagePerDay')}</StatsLabel>
                <StatsValue>{summary.averageHoursPerDayFormatted}</StatsValue>
              </StatsItem>
            </StatsRow>
          </StatsCard>
        </StatsContainer>
      )}

      {days.length === 0 ? (
        <EmptyState>
          <EmptyStateText>{t('history.empty')}</EmptyStateText>
        </EmptyState>
      ) : (
        <List
          data={days}
          keyExtractor={(item) => item.date}
          renderItem={renderItem}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </Container>
  );
}

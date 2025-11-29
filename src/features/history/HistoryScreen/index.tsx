import React, { useMemo, useState, useEffect } from 'react';
import { ListRenderItem } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@/i18n';
import { useNavigation } from '@react-navigation/native';
import { startOfMonth, endOfMonth, format, parseISO, subMonths, addMonths } from 'date-fns';
import { ptBR, enUS, fr, de } from 'date-fns/locale';
import { getClockHistory, ClockHistoryDay, ClockHistoryEvent, GetClockHistoryResponse } from '@/api/get-clock-history';
import { ClockAction } from '@/api/types';
import { colors } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import {
    Container,
    ScrollContent,
    MonthNavigation,
    MonthNavigationButton,
    MonthNavigationText,
    MonthSummaryCard,
    SummaryMainRow,
    SummaryMainItem,
    SummaryDivider,
    SummaryItemLabel,
    SummaryItemValue,
    SummaryDifferenceRow,
    SummaryDifferenceLabel,
    SummaryDifferenceValue,
    DaysList,
    DayCard,
    DayHeader,
    DayDate,
    DayHeaderRight,
    DayTotalHoursBadge,
    DayTotalHours,
    DayStatusBadge,
    DayStatusText,
    DayExpandIcon,
    EventsList,
    EventGroup,
    EventRow,
    EventIndicator,
    EventContent,
    EventTime,
    EventType,
    ConnectionLine,
    EventDuration,
    EventDurationText,
    DurationDivider,
    DurationDividerLine,
    DurationDividerText,
    PeriodSeparator,
    PeriodSeparatorLine,
    PeriodSeparatorText,
    EmptyState,
    EmptyStateText,
    EventEditButton,
    ListHeaderContainer,
    OrderIssueWarning,
    OrderIssueText,
} from './styles';
import { HistorySkeletonLoader } from './SkeletonLoader';

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

export function HistoryScreen() {
    const { t, i18n } = useTranslation();
    const navigation = useNavigation<any>();
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
    const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());

    const { startDate, endDate, month } = useMemo(() => getMonthRange(currentMonth), [currentMonth]);

    // Obter timezone do dispositivo
    const deviceTimezone = useMemo(() => {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
    }, []);

    const { data, isLoading } = useQuery<GetClockHistoryResponse>({
        queryKey: ['clockHistory', startDate, endDate, deviceTimezone],
        queryFn: () => getClockHistory({ startDate, endDate, timezone: deviceTimezone }),
    });

    const dateLocale = getDateLocale(i18n.language);

    const [hasAutoExpanded, setHasAutoExpanded] = useState(false);

    // Expandir o dia atual automaticamente quando os dados carregarem (apenas uma vez)
    useEffect(() => {
        if (data?.data && data.data.length > 0 && !hasAutoExpanded) {
            const today = new Date();
            const todayString = format(today, 'yyyy-MM-dd');

            // Encontrar o dia atual nos dados
            const todayData = data.data.find((day) => {
                const dayDate = parseISO(day.date);
                const dayString = format(dayDate, 'yyyy-MM-dd');
                return dayString === todayString;
            });

            if (todayData) {
                setExpandedDays(new Set([todayData.date]));
                setHasAutoExpanded(true);
            }
        }
    }, [data, hasAutoExpanded]);

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

    const monthSummary = useMemo(() => {
        if (!data?.summary) {
            return {
                totalWorkedHoursFormatted: '0min',
                totalExpectedHoursFormatted: '0h',
                hoursDifferenceFormatted: '0h',
                status: 'exact' as const,
            };
        }

        return {
            totalWorkedHoursFormatted: data?.summary?.totalWorkedHoursFormatted || '0min',
            totalExpectedHoursFormatted: data?.summary?.totalExpectedHoursFormatted || '0h',
            hoursDifferenceFormatted: data?.summary?.hoursDifferenceFormatted || '0h',
            status: data?.summary?.status || 'exact',
        };
    }, [data]);

    const toggleDay = (date: string) => {
        const newExpanded = new Set(expandedDays);
        if (newExpanded.has(date)) {
            newExpanded.delete(date);
        } else {
            newExpanded.add(date);
        }
        setExpandedDays(newExpanded);
    };

    const renderEvent = (event: ClockHistoryEvent, index: number, events: ClockHistoryEvent[]) => {
        const isEntry = event.action === ClockAction.CLOCK_IN;
        const eventDate = parseISO(event.hour);
        const formattedHour = format(eventDate, 'HH:mm', { locale: dateLocale });

        // Verificar se o próximo evento é a saída correspondente
        const nextEvent = index < events.length - 1 ? events[index + 1] : null;
        const isNextExit = nextEvent && nextEvent.action === ClockAction.CLOCK_OUT;

        return (
            <EventGroup key={event.id}>
                <EventRow>
                    <EventIndicator type={isEntry ? 'entry' : 'exit'} />
                    <EventContent>
                        <EventType type={isEntry ? 'entry' : 'exit'}>
                            {isEntry ? t('history.entry') : t('history.exit')}
                        </EventType>
                        <EventTime>{formattedHour}</EventTime>
                    </EventContent>
                    <EventEditButton
                        onPress={() => navigation.navigate('EditEvent', { event })}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="create-outline" size={20} color={colors.text.secondary} />
                    </EventEditButton>
                </EventRow>

                {/* Se for entrada e a próxima for saída, mostrar divisor com duração no meio e saída */}
                {isEntry && isNextExit && nextEvent && (
                    <>
                        {/* Divisor com duração no meio */}
                        {nextEvent.workedTime && (
                            <DurationDivider>
                                <DurationDividerLine />
                                <DurationDividerText>{nextEvent.workedTime}</DurationDividerText>
                                <DurationDividerLine />
                            </DurationDivider>
                        )}
                        <ConnectionLine />
                        <EventRow>
                            <EventIndicator type="exit" />
                            <EventContent>
                                <EventType type="exit">{t('history.exit')}</EventType>
                                <EventTime>{format(parseISO(nextEvent.hour), 'HH:mm', { locale: dateLocale })}</EventTime>
                            </EventContent>
                            <EventEditButton
                                onPress={() => navigation.navigate('EditEvent', { event: nextEvent })}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="create-outline" size={20} color={colors.text.secondary} />
                            </EventEditButton>
                        </EventRow>
                    </>
                )}

                {/* Se for saída isolada e tiver workedTime, mostrar duração */}
                {!isEntry && !isNextExit && event.workedTime && (
                    <EventDuration>
                        <EventDurationText>{event.workedTime}</EventDurationText>
                    </EventDuration>
                )}
            </EventGroup>
        );
    };

    const renderDay: ListRenderItem<ClockHistoryDay> = ({ item }) => {
        const isExpanded = expandedDays.has(item.date);
        const date = parseISO(item.date);
        const dayNumber = format(date, 'dd', { locale: dateLocale });
        const dayName = format(date, 'EEEE', { locale: dateLocale });
        const formattedDate = `${dayNumber} ${dayName}`;

        // Verificar se o dia está incompleto (tem entrada mas não tem saída)
        const isIncomplete = (() => {
            if (!item.events || item.events.length === 0) return false;

            // Verificar se o último evento é uma entrada (clock-in)
            const lastEvent = item.events[item.events.length - 1];
            const isLastEntry = lastEvent.action === ClockAction.CLOCK_IN;

            return isLastEntry;
        })();

        // Verificar se há problema de ordem (saída antes de entrada)
        const hasOrderIssue = (() => {
            if (!item.events || item.events.length < 2) return false;

            // Verificar se o primeiro evento é uma saída (clock-out)
            const firstEvent = item.events[0];
            const isFirstExit = firstEvent.action === ClockAction.CLOCK_OUT;

            // Verificar se há alguma entrada depois de uma saída sem ter uma entrada antes
            for (let i = 0; i < item.events.length; i++) {
                const event = item.events[i];
                if (event.action === ClockAction.CLOCK_OUT) {
                    // Se a próxima não for uma entrada imediatamente após, ou se for a primeira, há problema
                    const nextEvent = item.events[i + 1];
                    if (i === 0 || (nextEvent && nextEvent.action !== ClockAction.CLOCK_IN)) {
                        return true;
                    }
                }
            }

            return isFirstExit;
        })();

        return (
            <DayCard incomplete={isIncomplete} hasOrderIssue={hasOrderIssue}>
                {hasOrderIssue && (
                    <OrderIssueWarning>
                        <Ionicons name="warning" size={16} color={colors.status.error} />
                        <OrderIssueText>{t('history.orderIssue')}</OrderIssueText>
                    </OrderIssueWarning>
                )}
                <DayHeader onPress={() => toggleDay(item.date)} activeOpacity={0.7}>
                    <DayDate>{formattedDate}</DayDate>
                    <DayHeaderRight>
                        <DayTotalHoursBadge>
                            <DayTotalHours>{item.totalWorkedTime || '00:00'}</DayTotalHours>
                        </DayTotalHoursBadge>
                        {item.status && item.hoursDifferenceFormatted && (
                            <DayStatusBadge status={item.status}>
                                <DayStatusText status={item.status}>
                                    {item.status === 'over'
                                        ? `+${item.hoursDifferenceFormatted}`
                                        : item.status === 'under'
                                            ? `-${item.hoursDifferenceFormatted.replace('-', '')}`
                                            : t('history.exact')
                                    }
                                </DayStatusText>
                            </DayStatusBadge>
                        )}
                        {item.events && item.events.length > 0 && (
                            <DayExpandIcon>
                                <Ionicons
                                    name={isExpanded ? "chevron-up" : "chevron-down"}
                                    size={20}
                                    color={colors.text.secondary}
                                />
                            </DayExpandIcon>
                        )}
                    </DayHeaderRight>
                </DayHeader>

                {isExpanded && item.events && item.events.length > 0 && (
                    <EventsList>
                        {item.events
                            .map((event, index) => {
                                // Se for saída e a anterior foi entrada, não renderizar (já foi renderizada junto com a entrada)
                                const isEntry = event.action === ClockAction.CLOCK_IN;
                                if (!isEntry && index > 0) {
                                    const prevEvent = item.events[index - 1];
                                    const prevIsEntry = prevEvent.action === ClockAction.CLOCK_IN;
                                    if (prevIsEntry) {
                                        return null; // Esta saída já foi renderizada junto com a entrada anterior
                                    }
                                }

                                // Verificar se há um intervalo antes deste evento (saída seguida de entrada)
                                const hasInterval = isEntry && index > 0 && item.events[index - 1].action !== ClockAction.CLOCK_IN;

                                return (
                                    <React.Fragment key={event.id}>
                                        {hasInterval && (
                                            <PeriodSeparator>
                                                <PeriodSeparatorLine />
                                                <PeriodSeparatorText>{t('history.interval')}</PeriodSeparatorText>
                                                <PeriodSeparatorLine />
                                            </PeriodSeparator>
                                        )}
                                        {renderEvent(event, index, item.events)}
                                    </React.Fragment>
                                );
                            })
                            .filter(Boolean)}
                    </EventsList>
                )}
            </DayCard>
        );
    };

    return (
        <Container>
            <MonthNavigation>
                <MonthNavigationButton onPress={handlePreviousMonth} activeOpacity={0.7}>
                    <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
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
                        color={canGoNextMonth ? colors.text.primary : colors.text.tertiary}
                    />
                </MonthNavigationButton>
            </MonthNavigation>

            {isLoading ? (
                <ScrollContent>
                    <HistorySkeletonLoader />
                </ScrollContent>
            ) : (
                <DaysList
                    data={data?.data || []}
                    keyExtractor={(item: ClockHistoryDay, index: number) => `${item.date}-${index}`}
                    renderItem={renderDay}
                    showsVerticalScrollIndicator={false}
                    ListHeaderComponent={
                        <ListHeaderContainer>
                            <MonthSummaryCard>
                                <SummaryMainRow>
                                    <SummaryMainItem>
                                        <SummaryItemValue>{monthSummary.totalWorkedHoursFormatted}</SummaryItemValue>
                                        <SummaryItemLabel>{t('history.totalWorked')}</SummaryItemLabel>
                                    </SummaryMainItem>

                                    {data?.summary && (
                                        <>
                                            <SummaryDivider />
                                            <SummaryMainItem>
                                                <SummaryItemValue>{monthSummary.totalExpectedHoursFormatted}</SummaryItemValue>
                                                <SummaryItemLabel>{t('history.expectedHours')}</SummaryItemLabel>
                                            </SummaryMainItem>
                                        </>
                                    )}
                                </SummaryMainRow>

                                {data?.summary && (
                                    <SummaryDifferenceRow>
                                        <SummaryDifferenceLabel>{t('history.difference')}</SummaryDifferenceLabel>
                                        <SummaryDifferenceValue status={monthSummary.status}>
                                            {monthSummary.hoursDifferenceFormatted}
                                        </SummaryDifferenceValue>
                                    </SummaryDifferenceRow>
                                )}
                            </MonthSummaryCard>
                        </ListHeaderContainer>
                    }
                    ListEmptyComponent={
                        <EmptyState>
                            <EmptyStateText>{t('history.empty')}</EmptyStateText>
                        </EmptyState>
                    }
                />
            )}
        </Container>
    );
}

import React, { useMemo, useState, useEffect } from 'react';
import { ListRenderItem } from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '@/i18n';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { startOfMonth, endOfMonth, format, parseISO, subMonths, addMonths } from 'date-fns';
import { ptBR, enUS, fr, de } from 'date-fns/locale';
import * as Localization from 'expo-localization';
import { getClockHistory, ClockHistoryDay, ClockHistoryEvent, GetClockHistoryResponse } from '@/api/get-clock-history';
import { ClockAction } from '@/api/types';
import { useTheme } from '@/theme/context/ThemeContext';
import { Ionicons } from '@expo/vector-icons';
import { capitalizeFirstLetter } from '@/utils/string';
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
    SummaryItemValueSmall,
    SummaryDifferenceRow,
    SummaryDifferenceLabel,
    SummaryDifferenceValue,
    GenerateReportButton,
    GenerateReportButtonText,
    DaysList,
    DayCard,
    DayHeader,
    DayDateContainer,
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
    HolidayBadge,
    HolidayBadgeText,
    AbsenceBadge,
    AbsenceBadgeText,
    AbsenceCard,
    AbsenceReason,
    AbsenceDescription,
    NotesContainer,
    NotesBubble,
    NotesText,
    NotesShowMore,
    NotesShowMoreText,
    AddAbsenceButton,
    AddAbsenceButtonText,
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

// Helpers extraídos para facilitar testes unitários da lógica de dias
export function isIncompleteDay(day: ClockHistoryDay): boolean {
    if (!day.events || day.events.length === 0) return false;

    const lastEvent = day.events[day.events.length - 1];
    return lastEvent.action === ClockAction.CLOCK_IN;
}

export function hasOrderIssue(day: ClockHistoryDay): boolean {
    if (!day.events || day.events.length < 2) return false;

    const firstEvent = day.events[0];
    const isFirstExit = firstEvent.action === ClockAction.CLOCK_OUT;

    for (let i = 0; i < day.events.length; i++) {
        const event = day.events[i];
        if (event.action === ClockAction.CLOCK_OUT) {
            const nextEvent = day.events[i + 1];
            if (i === 0 || (nextEvent && nextEvent.action !== ClockAction.CLOCK_IN)) {
                return true;
            }
        }
    }

    return isFirstExit;
}

// Helper para gerar o testID do botão de edição (facilita testes unitários)
export function getEditButtonTestId(eventId: string): string {
    return `history-edit-button-${eventId}`;
}

export function HistoryScreen() {
    const { t, i18n } = useTranslation();
    const navigation = useNavigation<any>();
    const { theme } = useTheme();
    const queryClient = useQueryClient();
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
    const [expandedDays, setExpandedDays] = useState<Set<string>>(new Set());
    const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});

    const { startDate, endDate, month } = useMemo(() => getMonthRange(currentMonth), [currentMonth]);

    // Obter timezone do dispositivo
    const deviceTimezone = useMemo(() => {
        return Intl.DateTimeFormat().resolvedOptions().timeZone;
    }, []);

    const { data, isLoading } = useQuery<GetClockHistoryResponse>({
        queryKey: ['clockHistory', startDate, endDate, deviceTimezone],
        queryFn: () => getClockHistory({ startDate, endDate, timezone: deviceTimezone }),
        refetchOnWindowFocus: true,
    });

    // Atualiza os dados quando a tela entrar em foco
    useFocusEffect(
        React.useCallback(() => {
            // Invalida a query para forçar um refetch quando a tela entrar em foco
            queryClient.invalidateQueries({
                queryKey: ['clockHistory', startDate, endDate, deviceTimezone],
            });
        }, [queryClient, startDate, endDate, deviceTimezone])
    );

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

    const handleNavigateToReportPreview = () => {
        navigation.navigate('ReportPreview', {
            startDate,
            endDate,
            monthLabel: currentMonthFormatted,
        });
    };

    // Função para formatação monetária
    const formatCurrency = useMemo(() => {
        const localeData = Localization.getLocales()[0];
        const locale = localeData?.languageTag || 'pt-BR';
        const currencyCode = localeData?.currencyCode || 'BRL';
        const formatter = new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currencyCode,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
        return (value: number) => formatter.format(value);
    }, []);

    const monthSummary = useMemo(() => {
        if (!data?.summary) {
            return {
                totalWorkedHoursFormatted: '0min',
                totalExpectedHoursFormatted: '0h',
                hoursDifferenceFormatted: '0h',
                status: 'exact' as const,
                totalEarningsFormatted: undefined as string | undefined,
            };
        }

        const totalEarningsFormatted = data?.summary?.totalEarnings !== undefined &&
            data?.summary?.totalEarnings !== null &&
            typeof data.summary.totalEarnings === 'number'
            ? formatCurrency(data.summary.totalEarnings)
            : undefined;

        return {
            totalWorkedHoursFormatted: data?.summary?.totalWorkedHoursFormatted || '0min',
            totalExpectedHoursFormatted: data?.summary?.totalExpectedHoursFormatted || '0h',
            hoursDifferenceFormatted: data?.summary?.hoursDifferenceFormatted || '0h',
            status: data?.summary?.status || 'exact',
            totalEarningsFormatted,
        };
    }, [data, formatCurrency]);

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

        const expanded = expandedNotes[event.id] === true;
        const maxChars = 140;
        const hasLongNotes = (event.notes || '').length > maxChars;
        const previewText = hasLongNotes ? (event.notes || '').slice(0, maxChars).trim() + '…' : (event.notes || '');

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
                        testID={getEditButtonTestId(event.id)}
                        onPress={() => navigation.navigate('EditEvent', { event })}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="create-outline" size={20} color={theme.text.secondary} />
                    </EventEditButton>
                </EventRow>

                {event.notes && (
                    <NotesContainer>
                        <NotesBubble>
                            <NotesText numberOfLines={expanded ? undefined : 4}>
                                {expanded ? event.notes : previewText}
                            </NotesText>
                        </NotesBubble>
                        {hasLongNotes && (
                            <NotesShowMore onPress={() => setExpandedNotes(prev => ({ ...prev, [event.id]: !expanded }))} activeOpacity={0.7}>
                                <NotesShowMoreText>{expanded ? t('common.close') : t('history.notesShowMore')}</NotesShowMoreText>
                            </NotesShowMore>
                        )}
                    </NotesContainer>
                )}

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
                        {/* Notas entre entrada e saída, sem quebrar layout */}
                        {(nextEvent.notes || event.notes) && (
                            <NotesContainer>
                                <NotesBubble>
                                    {(() => {
                                        const entryHasNotes = !!event.notes;
                                        const exitHasNotes = !!nextEvent.notes;
                                        const targetEvent = exitHasNotes ? nextEvent : event;
                                        const expanded = expandedNotes[targetEvent.id] === true;
                                        const text = targetEvent.notes || '';
                                        const maxChars = 140;
                                        const hasLongNotes = text.length > maxChars;
                                        const previewText = hasLongNotes ? text.slice(0, maxChars).trim() + '…' : text;
                                        return (
                                            <>
                                                <NotesText numberOfLines={expanded ? undefined : 4}>
                                                    {expanded ? text : previewText}
                                                </NotesText>
                                                {hasLongNotes && (
                                                    <NotesShowMore onPress={() => setExpandedNotes(prev => ({ ...prev, [targetEvent.id]: !expanded }))} activeOpacity={0.7}>
                                                        <NotesShowMoreText>{expanded ? t('common.close') : t('history.notesShowMore')}</NotesShowMoreText>
                                                    </NotesShowMore>
                                                )}
                                            </>
                                        );
                                    })()}
                                </NotesBubble>
                            </NotesContainer>
                        )}
                        <EventRow>
                            <EventIndicator type="exit" />
                            <EventContent>
                                <EventType type="exit">{t('history.exit')}</EventType>
                                <EventTime>{format(parseISO(nextEvent.hour), 'HH:mm', { locale: dateLocale })}</EventTime>
                            </EventContent>
                            <EventEditButton
                                testID={getEditButtonTestId(nextEvent.id)}
                                onPress={() => navigation.navigate('EditEvent', { event: nextEvent })}
                                activeOpacity={0.7}
                            >
                                <Ionicons name="create-outline" size={20} color={theme.text.secondary} />
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
        const formattedDate = `${dayNumber} ${capitalizeFirstLetter(dayName)}`;

        const isIncomplete = isIncompleteDay(item);
        const hasOrderIssueFlag = hasOrderIssue(item);

        // Verificar se o dia é feriado (algum evento tem isHoliday: true)
        const isHoliday = (() => {
            if (!item.events || item.events.length === 0) return false;
            return item.events.some(event => event.isHoliday === true);
        })();

        return (
            <DayCard incomplete={isIncomplete} hasOrderIssue={hasOrderIssueFlag}>
                {hasOrderIssueFlag && (
                    <OrderIssueWarning>
                        <Ionicons name="warning" size={16} color={theme.status.error} />
                        <OrderIssueText>{t('history.orderIssue')}</OrderIssueText>
                    </OrderIssueWarning>
                )}
                <DayHeader onPress={() => toggleDay(item.date)} activeOpacity={0.7}>
                    <DayDateContainer>
                        <DayDate>{formattedDate}</DayDate>
                        {isHoliday && (
                            <HolidayBadge>
                                <Ionicons name="calendar" size={12} color={theme.status.warning} />
                                <HolidayBadgeText>{t('history.holiday')}</HolidayBadgeText>
                            </HolidayBadge>
                        )}
                        {item.absence && (
                            <AbsenceBadge>
                                <Ionicons name="document-text" size={12} color={theme.status.info} />
                                <AbsenceBadgeText>{t('history.absenceJustified')}</AbsenceBadgeText>
                            </AbsenceBadge>
                        )}
                    </DayDateContainer>
                    <DayHeaderRight>
                        {!isIncomplete && (
                            <DayTotalHoursBadge>
                                <DayTotalHours>{item.totalWorkedTime || '00:00'}</DayTotalHours>
                            </DayTotalHoursBadge>
                        )}
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
                        {((item.events && item.events.length > 0) || item.absence) && (
                            <DayExpandIcon>
                                <Ionicons
                                    name={isExpanded ? "chevron-up" : "chevron-down"}
                                    size={20}
                                    color={theme.text.secondary}
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

                {isExpanded && item.absence && (
                    <AbsenceCard>
                        <AbsenceReason>
                            <Ionicons name="document-text" size={16} color={theme.status.info} /> {item.absence.reason}
                        </AbsenceReason>
                        {item.absence.description && (
                            <AbsenceDescription>{item.absence.description}</AbsenceDescription>
                        )}
                    </AbsenceCard>
                )}

                {isExpanded && (!item.events || item.events.length === 0) && !item.absence && (
                    <AddAbsenceButton
                        onPress={() => navigation.navigate('AddAbsence', { date: item.date })}
                        activeOpacity={0.7}
                    >
                        <Ionicons name="add-circle-outline" size={18} color={theme.text.secondary} />
                        <AddAbsenceButtonText>{t('history.addAbsence')}</AddAbsenceButtonText>
                    </AddAbsenceButton>
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
                                        <SummaryItemValueSmall>{monthSummary.totalWorkedHoursFormatted}</SummaryItemValueSmall>
                                        <SummaryItemLabel>{t('history.totalWorked')}</SummaryItemLabel>
                                    </SummaryMainItem>

                                    {data?.summary && (
                                        <>
                                            <SummaryDivider />
                                            <SummaryMainItem>
                                                <SummaryItemValueSmall>{monthSummary.totalExpectedHoursFormatted}</SummaryItemValueSmall>
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

                                {monthSummary.totalEarningsFormatted && (
                                    <SummaryDifferenceRow>
                                        <SummaryDifferenceLabel>{t('history.totalEarnings')}</SummaryDifferenceLabel>
                                        <SummaryDifferenceValue status={undefined}>
                                            {monthSummary.totalEarningsFormatted}
                                        </SummaryDifferenceValue>
                                    </SummaryDifferenceRow>
                                )}

                                <GenerateReportButton onPress={handleNavigateToReportPreview} activeOpacity={0.7}>
                                    <Ionicons name="document-text" size={16} color={theme.text.inverse} />
                                    <GenerateReportButtonText>
                                        {t('history.generateReport')}
                                    </GenerateReportButtonText>
                                </GenerateReportButton>
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

import React, { useState, useEffect, useMemo } from 'react';
import { Alert, Keyboard, ScrollView, Switch, Modal, TouchableWithoutFeedback } from 'react-native';
import { useTranslation } from '@/i18n';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/context/ThemeContext';
import { spacing } from '@/theme';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { updateUserSettings, WorkSchedule, CustomHoliday } from '@/api/update-user-settings';
import { getUserSettings } from '@/api/get-user-settings';
import { useFeedback } from '@/utils/feedback';
import { capitalizeFirstLetter } from '@/utils/string';
import { format, parseISO, isValid, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay, addMonths, subMonths, getDay } from 'date-fns';
import { ptBR, enUS, fr, de } from 'date-fns/locale';
import * as Localization from 'expo-localization';
import {
    Container,
    Content,
    Header,
    HeaderTitle,
    BackButton,
    SettingsCard,
    SettingSection,
    SettingLabel,
    DayRow,
    DayInfo,
    DayName,
    TimeRow,
    TimeInput,
    TimeSeparator,
    SaveButton,
    SaveButtonText,
    HolidayRow,
    HolidayInfo,
    HolidayDate,
    HolidayName,
    HolidayActions,
    HolidayActionButton,
    AddHolidayButton,
    AddHolidayButtonText,
    HolidayInputRow,
    HolidayNameInput,
    EmptyHolidaysText,
    DatePickerButton,
    DatePickerButtonLabel,
    DatePickerButtonContent,
    DatePickerButtonText,
    CalendarModal,
    CalendarHeader,
    CalendarMonthYear,
    CalendarNavButton,
    CalendarWeekDays,
    CalendarWeekDay,
    CalendarDays,
    CalendarDay,
    CalendarDayText,
    ModalOverlay,
    HourlyRateInput,
} from './styles';

interface DaySchedule {
    enabled: boolean;
    startTime: string;
    endTime: string;
}


const defaultSchedule: DaySchedule = {
    enabled: false,
    startTime: '09:00',
    endTime: '18:00',
};

export function WorkSettingsScreen() {
    const { t, i18n } = useTranslation();
    const navigation = useNavigation();
    const queryClient = useQueryClient();
    const { showSuccess } = useFeedback();
    const { theme } = useTheme();
    const [days, setDays] = useState<Record<string, DaySchedule>>({
        monday: { ...defaultSchedule },
        tuesday: { ...defaultSchedule },
        wednesday: { ...defaultSchedule },
        thursday: { ...defaultSchedule },
        friday: { ...defaultSchedule },
        saturday: { ...defaultSchedule },
        sunday: { ...defaultSchedule },
    });
    const [customHolidays, setCustomHolidays] = useState<CustomHoliday[]>([]);
    const [newHolidayDate, setNewHolidayDate] = useState('');
    const [newHolidayName, setNewHolidayName] = useState('');
    const [isAddingHoliday, setIsAddingHoliday] = useState(false);
    const [editingHolidayIndex, setEditingHolidayIndex] = useState<number | null>(null);
    const [editingHolidayOriginal, setEditingHolidayOriginal] = useState<CustomHoliday | null>(null);
    const [showCalendarModal, setShowCalendarModal] = useState(false);
    const [calendarMonth, setCalendarMonth] = useState<Date>(new Date());
    const [hourlyRate, setHourlyRate] = useState<string>('');

    const dayNames = [
        { key: 'monday', label: capitalizeFirstLetter(t('profile.monday')) },
        { key: 'tuesday', label: capitalizeFirstLetter(t('profile.tuesday')) },
        { key: 'wednesday', label: capitalizeFirstLetter(t('profile.wednesday')) },
        { key: 'thursday', label: capitalizeFirstLetter(t('profile.thursday')) },
        { key: 'friday', label: capitalizeFirstLetter(t('profile.friday')) },
        { key: 'saturday', label: capitalizeFirstLetter(t('profile.saturday')) },
        { key: 'sunday', label: capitalizeFirstLetter(t('profile.sunday')) },
    ];

    const { data: settingsData } = useQuery({
        queryKey: ['userSettings'],
        queryFn: getUserSettings,
    });

    const updateSettingsMutation = useMutation({
        mutationFn: updateUserSettings,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['userSettings'] });
            await queryClient.invalidateQueries({ queryKey: ['clockHistory'] });
            await queryClient.refetchQueries({ queryKey: ['userSettings'] });
            showSuccess(t('profile.workSettingsSuccess'));
            navigation.goBack();
        },
        onError: (error: any) => {
            Alert.alert(
                t('common.error'),
                error.response?.data?.message || t('profile.workSettingsError')
            );
        },
    });

    // Funções para formatação monetária
    const getCurrencyFormatter = useMemo(() => {
        const localeData = Localization.getLocales()[0];
        const locale = localeData?.languageTag || 'pt-BR';
        const currencyCode = localeData?.currencyCode || 'BRL';
        return new Intl.NumberFormat(locale, {
            style: 'currency',
            currency: currencyCode,
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        });
    }, []);

    const formatCurrency = (value: number | string): string => {
        if (!value) return '';
        const numValue = typeof value === 'string' ? parseFloat(value.replace(/[^\d,.-]/g, '').replace(',', '.')) : value;
        if (isNaN(numValue)) return '';
        return getCurrencyFormatter.format(numValue);
    };

    const parseCurrencyValue = (value: string): number | undefined => {
        if (!value || !value.trim()) return undefined;

        // Remove todos os caracteres não numéricos exceto vírgula e ponto
        let cleaned = value.replace(/[^\d,.-]/g, '').trim();
        if (!cleaned) return undefined;

        // Remove múltiplos separadores, mantém apenas o último como decimal
        const parts = cleaned.split(/[.,]/);
        if (parts.length > 2) {
            // Se há mais de 2 partes, os separadores anteriores eram de agrupamento
            cleaned = parts.slice(0, -1).join('') + '.' + parts[parts.length - 1];
        } else if (parts.length === 2) {
            // Tem um separador decimal
            cleaned = parts[0].replace(/[^\d]/g, '') + '.' + parts[1].replace(/[^\d]/g, '');
        } else {
            // Apenas números inteiros
            cleaned = cleaned.replace(/[^\d]/g, '');
        }

        const numValue = parseFloat(cleaned);
        return isNaN(numValue) || numValue < 0 ? undefined : numValue;
    };

    const handleHourlyRateChange = (value: string) => {
        // Remove símbolos de moeda formatados, mas mantém apenas números e separadores decimais
        // Não formata durante a digitação para evitar problemas com o cursor
        const cleaned = value.replace(/[^\d,.-]/g, '');

        // Se está vazio, limpa o campo
        if (!cleaned) {
            setHourlyRate('');
            return;
        }

        // Durante a digitação, apenas aceita números e separadores
        // A formatação completa acontece no onBlur
        setHourlyRate(cleaned);
    };

    const handleHourlyRateBlur = () => {
        if (!hourlyRate || !hourlyRate.trim()) {
            setHourlyRate('');
            return;
        }

        // Remove todos os caracteres não numéricos, exceto vírgula e ponto
        const numericOnly = hourlyRate.replace(/[^\d,.-]/g, '');
        if (!numericOnly) {
            setHourlyRate('');
            return;
        }

        // Tenta parsear o valor usando a função de parse
        const parsed = parseCurrencyValue(hourlyRate);

        // Se não conseguiu parsear, tenta parse simples
        let numValue = parsed;
        if (numValue === undefined || isNaN(numValue)) {
            // Remove todos os caracteres não numéricos e normaliza separador decimal
            const cleaned = numericOnly.replace(/\./g, '').replace(',', '.');
            const simpleParsed = parseFloat(cleaned);
            if (!isNaN(simpleParsed) && simpleParsed >= 0) {
                numValue = simpleParsed;
            }
        }

        // Se conseguiu parsear, formata como moeda
        if (numValue !== undefined && !isNaN(numValue) && numValue >= 0) {
            const formatted = formatCurrency(numValue);
            setHourlyRate(formatted);
        } else {
            // Se não conseguiu, limpa o campo
            setHourlyRate('');
        }
    };

    useEffect(() => {
        if (settingsData) {
            const workSchedule = settingsData.workSchedule || {};

            setDays(prev => ({
                ...prev,
                monday: workSchedule.monday
                    ? { enabled: true, startTime: workSchedule.monday.start, endTime: workSchedule.monday.end }
                    : { ...defaultSchedule },
                tuesday: workSchedule.tuesday
                    ? { enabled: true, startTime: workSchedule.tuesday.start, endTime: workSchedule.tuesday.end }
                    : { ...defaultSchedule },
                wednesday: workSchedule.wednesday
                    ? { enabled: true, startTime: workSchedule.wednesday.start, endTime: workSchedule.wednesday.end }
                    : { ...defaultSchedule },
                thursday: workSchedule.thursday
                    ? { enabled: true, startTime: workSchedule.thursday.start, endTime: workSchedule.thursday.end }
                    : { ...defaultSchedule },
                friday: workSchedule.friday
                    ? { enabled: true, startTime: workSchedule.friday.start, endTime: workSchedule.friday.end }
                    : { ...defaultSchedule },
                saturday: workSchedule.saturday
                    ? { enabled: true, startTime: workSchedule.saturday.start, endTime: workSchedule.saturday.end }
                    : { ...defaultSchedule },
                sunday: workSchedule.sunday
                    ? { enabled: true, startTime: workSchedule.sunday.start, endTime: workSchedule.sunday.end }
                    : { ...defaultSchedule },
            }));

            // Carregar feriados customizados
            if (settingsData.customHolidays) {
                setCustomHolidays(settingsData.customHolidays);
            }

            // Carregar valor por hora e formatar como moeda
            if (settingsData.hourlyRate !== undefined && settingsData.hourlyRate !== null) {
                const formatted = formatCurrency(settingsData.hourlyRate);
                setHourlyRate(formatted);
            }
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [settingsData]);

    const handleSave = () => {
        Keyboard.dismiss();

            const workSchedule: WorkSchedule = {};

            if (days.monday.enabled) {
                workSchedule.monday = {
                    start: days.monday.startTime,
                    end: days.monday.endTime,
                };
            }
            if (days.tuesday.enabled) {
                workSchedule.tuesday = {
                    start: days.tuesday.startTime,
                    end: days.tuesday.endTime,
                };
            }
            if (days.wednesday.enabled) {
                workSchedule.wednesday = {
                    start: days.wednesday.startTime,
                    end: days.wednesday.endTime,
                };
            }
            if (days.thursday.enabled) {
                workSchedule.thursday = {
                    start: days.thursday.startTime,
                    end: days.thursday.endTime,
                };
            }
            if (days.friday.enabled) {
                workSchedule.friday = {
                    start: days.friday.startTime,
                    end: days.friday.endTime,
                };
            }
            if (days.saturday.enabled) {
                workSchedule.saturday = {
                    start: days.saturday.startTime,
                    end: days.saturday.endTime,
                };
            }
            if (days.sunday.enabled) {
                workSchedule.sunday = {
                    start: days.sunday.startTime,
                    end: days.sunday.endTime,
                };
            }

        const hourlyRateValue = parseCurrencyValue(hourlyRate);

        updateSettingsMutation.mutate({
                workSchedule,
            customHolidays: customHolidays,
            hourlyRate: hourlyRateValue,
        });
    };

    const handleTimeChange = (value: string, dayKey: string, type: 'start' | 'end') => {
        const numbers = value.replace(/[^0-9]/g, '');

        if (numbers.length === 0) {
            setDays(prev => ({
                ...prev,
                [dayKey]: {
                    ...prev[dayKey],
                    [type === 'start' ? 'startTime' : 'endTime']: '',
                },
            }));
            return;
        }

        let formatted = '';

        if (numbers.length <= 2) {
            formatted = numbers;
        } else {
            const hours = numbers.slice(0, 2);
            const minutes = numbers.slice(2, 4);

            let formattedHours = hours;
            let formattedMinutes = minutes;

            const hoursNum = parseInt(hours, 10);
            if (hoursNum > 23) {
                formattedHours = '23';
            }

            const minutesNum = parseInt(minutes, 10);
            if (minutesNum > 59) {
                formattedMinutes = '59';
            }

            formatted = `${formattedHours}:${formattedMinutes}`;
        }

        setDays(prev => ({
            ...prev,
            [dayKey]: {
                ...prev[dayKey],
                [type === 'start' ? 'startTime' : 'endTime']: formatted,
            },
        }));
    };

    const handleTimeBlur = (dayKey: string, type: 'start' | 'end') => {
        const currentTime = type === 'start' ? days[dayKey].startTime : days[dayKey].endTime;

        if (!currentTime || currentTime.length < 5) {
            const numbers = currentTime.replace(/[^0-9]/g, '');

            if (numbers.length === 0) {
                const defaultTime = type === 'start' ? '09:00' : '18:00';
                setDays(prev => ({
                    ...prev,
                    [dayKey]: {
                        ...prev[dayKey],
                        [type === 'start' ? 'startTime' : 'endTime']: defaultTime,
                    },
                }));
                return;
            }

            let formatted = '';
            if (numbers.length <= 2) {
                formatted = `${numbers.padStart(2, '0')}:00`;
            } else {
                const hours = numbers.slice(0, 2);
                const minutes = numbers.slice(2, 4).padEnd(2, '0');
                formatted = `${hours}:${minutes}`;
            }

            setDays(prev => ({
                ...prev,
                [dayKey]: {
                    ...prev[dayKey],
                    [type === 'start' ? 'startTime' : 'endTime']: formatted,
                },
            }));
        }
    };

    const handleToggleDay = (dayKey: string) => {
        setDays(prev => ({
            ...prev,
            [dayKey]: {
                ...prev[dayKey],
                enabled: !prev[dayKey].enabled,
            },
        }));
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

    const dateLocale = getDateLocale(i18n.language);

    const handleDateSelect = (date: Date) => {
        const dateString = format(date, 'yyyy-MM-dd');
        setNewHolidayDate(dateString);
        setShowCalendarModal(false);
    };

    const calendarDays = useMemo(() => {
        const monthStart = startOfMonth(calendarMonth);
        const monthEnd = endOfMonth(calendarMonth);
        const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0, locale: dateLocale });
        const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0, locale: dateLocale });
        return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
    }, [calendarMonth, dateLocale]);

    const selectedDate = useMemo(() => {
        if (!newHolidayDate) return null;
        try {
            const date = parseISO(newHolidayDate);
            return isValid(date) ? date : null;
        } catch {
            return null;
        }
    }, [newHolidayDate]);

    const today = new Date();

    const weekDayLabels = useMemo(() => {
        const labels: string[] = [];
        const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        weekDays.forEach((day) => {
            const dayIndex = weekDays.indexOf(day);
            const dayDate = new Date(2024, 0, dayIndex + 7);
            labels.push(format(dayDate, 'EEEEEE', { locale: dateLocale }).toUpperCase());
        });
        return labels;
    }, [dateLocale]);

    const handleAddHoliday = () => {
        if (!newHolidayDate || !newHolidayName.trim()) {
            Alert.alert(t('common.error'), t('profile.holidayDateAndNameRequired'));
            return;
        }

        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(newHolidayDate)) {
            Alert.alert(t('common.error'), t('profile.holidayDateInvalid'));
            return;
        }

        const date = parseISO(newHolidayDate);
        if (!isValid(date)) {
            Alert.alert(t('common.error'), t('profile.holidayDateInvalid'));
            return;
        }

        const holiday: CustomHoliday = {
            date: newHolidayDate,
            name: newHolidayName.trim(),
        };

        setCustomHolidays([...customHolidays, holiday]);
        setNewHolidayDate('');
        setNewHolidayName('');
        setIsAddingHoliday(false);
    };

    const handleEditHoliday = (index: number) => {
        const holiday = customHolidays[index];
        setNewHolidayDate(holiday.date);
        setNewHolidayName(holiday.name);
        setEditingHolidayIndex(index);
        setEditingHolidayOriginal(holiday);
        setIsAddingHoliday(true);
        // Ajustar o mês do calendário para a data do feriado sendo editado
        try {
            const date = parseISO(holiday.date);
            if (isValid(date)) {
                setCalendarMonth(date);
            }
        } catch { }
    };

    const handleSaveHoliday = () => {
        if (!newHolidayDate || !newHolidayName.trim()) {
            Alert.alert(t('common.error'), t('profile.holidayDateAndNameRequired'));
            return;
        }

        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(newHolidayDate)) {
            Alert.alert(t('common.error'), t('profile.holidayDateInvalid'));
            return;
        }

        const date = parseISO(newHolidayDate);
        if (!isValid(date)) {
            Alert.alert(t('common.error'), t('profile.holidayDateInvalid'));
            return;
        }

        const newHoliday: CustomHoliday = {
            date: newHolidayDate,
            name: newHolidayName.trim(),
        };

        if (editingHolidayIndex !== null && editingHolidayOriginal) {
            // Estamos editando - substituir o feriado na posição original
            const updated = [...customHolidays];
            updated[editingHolidayIndex] = newHoliday;
            setCustomHolidays(updated);
        } else {
            // Estamos adicionando um novo feriado
            setCustomHolidays([...customHolidays, newHoliday]);
        }

        setNewHolidayDate('');
        setNewHolidayName('');
        setEditingHolidayIndex(null);
        setEditingHolidayOriginal(null);
        setIsAddingHoliday(false);
    };

    const handleCancelHoliday = () => {
        setNewHolidayDate('');
        setNewHolidayName('');
        setIsAddingHoliday(false);
        setEditingHolidayIndex(null);
        setEditingHolidayOriginal(null);
    };

    const handleRemoveHoliday = (index: number) => {
        Alert.alert(
            t('common.confirm'),
            t('profile.holidayRemoveConfirm'),
            [
                { text: t('common.cancel'), style: 'cancel' },
                {
                    text: t('common.delete'),
                    style: 'destructive',
                    onPress: () => {
                        const updated = customHolidays.filter((_, i) => i !== index);
                        setCustomHolidays(updated);
                    },
                },
            ]
        );
    };

    const formatHolidayDate = (dateString: string) => {
        try {
            const date = parseISO(dateString);
            if (!isValid(date)) return dateString;

            const localeMap: Record<string, any> = {
                'pt-BR': require('date-fns/locale/pt-BR'),
                'en-US': require('date-fns/locale/en-US'),
                'fr-FR': require('date-fns/locale/fr'),
                'de-DE': require('date-fns/locale/de'),
            };

            const locale = localeMap[i18n.language] || localeMap['en-US'];
            return format(date, 'dd/MM/yyyy', { locale });
        } catch {
            return dateString;
        }
    };

    return (
        <Container>
            <Header>
                <BackButton onPress={() => navigation.goBack()}>
                    <Ionicons name="arrow-back" size={24} color={theme.text.primary} />
                </BackButton>
                <HeaderTitle>{t('profile.workSettings')}</HeaderTitle>
            </Header>
            <Content>
                <ScrollView showsVerticalScrollIndicator={false}>
                    <SettingsCard>
                        <SettingSection>
                            <SettingLabel>{t('profile.workHours')}</SettingLabel>
                            {dayNames.map((day) => {
                                const daySchedule = days[day.key];
                                return (
                                    <React.Fragment key={day.key}>
                                        <DayRow>
                                            <DayInfo>
                                                <DayName>{day.label}</DayName>
                                            </DayInfo>
                                            <Switch
                                                value={daySchedule.enabled}
                                                onValueChange={() => handleToggleDay(day.key)}
                                                disabled={updateSettingsMutation.isPending}
                                                trackColor={{ false: theme.border.medium, true: theme.primary }}
                                                thumbColor={theme.background.primary}
                                            />
                                        </DayRow>
                                        {daySchedule.enabled && (
                                            <TimeRow>
                                                <TimeInput
                                                    value={daySchedule.startTime}
                                                    onChangeText={(value: string) => handleTimeChange(value, day.key, 'start')}
                                                    onBlur={() => handleTimeBlur(day.key, 'start')}
                                                    placeholder="09:00"
                                                    placeholderTextColor={theme.text.tertiary}
                                                    keyboardType="number-pad"
                                                    maxLength={5}
                                                    editable={!updateSettingsMutation.isPending}
                                                />
                                                <TimeSeparator>—</TimeSeparator>
                                                <TimeInput
                                                    value={daySchedule.endTime}
                                                    onChangeText={(value: string) => handleTimeChange(value, day.key, 'end')}
                                                    onBlur={() => handleTimeBlur(day.key, 'end')}
                                                    placeholder="18:00"
                                                    placeholderTextColor={theme.text.tertiary}
                                                    keyboardType="number-pad"
                                                    maxLength={5}
                                                    editable={!updateSettingsMutation.isPending}
                                                />
                                            </TimeRow>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </SettingSection>
                    </SettingsCard>

                    <SettingsCard>
                        <SettingSection>
                            <SettingLabel>{t('profile.hourlyRate')}</SettingLabel>
                            <HourlyRateInput
                                value={hourlyRate}
                                onChangeText={handleHourlyRateChange}
                                onBlur={handleHourlyRateBlur}
                                onEndEditing={handleHourlyRateBlur}
                                placeholder={getCurrencyFormatter.format(0) || t('profile.hourlyRatePlaceholder')}
                                placeholderTextColor={theme.text.tertiary}
                                keyboardType="decimal-pad"
                                editable={!updateSettingsMutation.isPending}
                            />
                        </SettingSection>
                    </SettingsCard>

                    <SettingsCard>
                        <SettingSection>
                            <SettingLabel>{t('profile.customHolidays')}</SettingLabel>
                            {customHolidays.length === 0 && !isAddingHoliday && (
                                <EmptyHolidaysText>{t('profile.noCustomHolidays')}</EmptyHolidaysText>
                            )}
                            {customHolidays.map((holiday, index) => {
                                // Se estamos editando este feriado, não mostrar na lista
                                if (editingHolidayOriginal && editingHolidayOriginal.date === holiday.date && editingHolidayOriginal.name === holiday.name) {
                                    return null;
                                }
                                return (
                                    <HolidayRow key={`${holiday.date}-${holiday.name}-${index}`}>
                                        <HolidayInfo>
                                            <HolidayDate>{formatHolidayDate(holiday.date)}</HolidayDate>
                                            <HolidayName>{holiday.name}</HolidayName>
                                        </HolidayInfo>
                                        <HolidayActions>
                                            <HolidayActionButton
                                                onPress={() => handleEditHoliday(index)}
                                                disabled={updateSettingsMutation.isPending || isAddingHoliday}
                                            >
                                                <Ionicons name="create-outline" size={20} color={theme.primary} />
                                            </HolidayActionButton>
                                            <HolidayActionButton
                                                onPress={() => handleRemoveHoliday(index)}
                                                disabled={updateSettingsMutation.isPending || isAddingHoliday}
                                            >
                                                <Ionicons name="trash-outline" size={20} color={theme.status.error} />
                                            </HolidayActionButton>
                                        </HolidayActions>
                                    </HolidayRow>
                                );
                            })}
                            {isAddingHoliday && (
                                <React.Fragment>
                                    <HolidayInputRow>
                                        <DatePickerButton
                                            onPress={() => {
                                                if (newHolidayDate) {
                                                    try {
                                                        const date = parseISO(newHolidayDate);
                                                        if (isValid(date)) {
                                                            setCalendarMonth(date);
                                                        }
                                                    } catch { }
                                                }
                                                setShowCalendarModal(true);
                                            }}
                                            disabled={updateSettingsMutation.isPending}
                                            activeOpacity={0.7}
                                        >
                                            <DatePickerButtonLabel>
                                                {newHolidayDate ? t('profile.holidayDate') : t('profile.selectDate')}
                                            </DatePickerButtonLabel>
                                            <DatePickerButtonContent>
                                                <DatePickerButtonText placeholder={!newHolidayDate}>
                                                    {newHolidayDate
                                                        ? formatHolidayDate(newHolidayDate)
                                                        : '—'}
                                                </DatePickerButtonText>
                                                <Ionicons
                                                    name="calendar-outline"
                                                    size={20}
                                                    color={theme.text.secondary}
                                                />
                                            </DatePickerButtonContent>
                                        </DatePickerButton>
                                        <HolidayNameInput
                                            value={newHolidayName}
                                            onChangeText={setNewHolidayName}
                                            placeholder={t('profile.holidayNamePlaceholder')}
                                            placeholderTextColor={theme.text.tertiary}
                                            editable={!updateSettingsMutation.isPending}
                                        />
                                    </HolidayInputRow>
                                    <HolidayActions style={{ justifyContent: 'flex-end', marginTop: spacing.xs }}>
                                        <HolidayActionButton
                                            onPress={handleCancelHoliday}
                                            disabled={updateSettingsMutation.isPending}
                                        >
                                            <Ionicons name="close-circle-outline" size={24} color={theme.text.secondary} />
                                        </HolidayActionButton>
                                        <HolidayActionButton
                                            onPress={handleSaveHoliday}
                                            disabled={updateSettingsMutation.isPending}
                                        >
                                            <Ionicons name="checkmark-circle-outline" size={24} color={theme.primary} />
                                        </HolidayActionButton>
                                    </HolidayActions>
                                </React.Fragment>
                            )}
                            {!isAddingHoliday && (
                                <AddHolidayButton
                                    onPress={() => setIsAddingHoliday(true)}
                                    disabled={updateSettingsMutation.isPending}
                                    activeOpacity={0.7}
                                >
                                    <Ionicons name="add-circle-outline" size={20} color={theme.primary} />
                                    <AddHolidayButtonText>{t('profile.addHoliday')}</AddHolidayButtonText>
                                </AddHolidayButton>
                            )}
                        </SettingSection>
                    </SettingsCard>

                    <SaveButton onPress={handleSave} disabled={updateSettingsMutation.isPending} activeOpacity={0.7}>
                        <SaveButtonText>{updateSettingsMutation.isPending ? t('common.loading') : t('common.save')}</SaveButtonText>
                    </SaveButton>
                </ScrollView>
            </Content>
            <Modal
                visible={showCalendarModal}
                transparent
                animationType="fade"
                onRequestClose={() => setShowCalendarModal(false)}
            >
                <TouchableWithoutFeedback onPress={() => setShowCalendarModal(false)}>
                    <ModalOverlay>
                        <TouchableWithoutFeedback>
                            <CalendarModal>
                                <CalendarHeader>
                                    <CalendarNavButton
                                        onPress={() => setCalendarMonth(subMonths(calendarMonth, 1))}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="chevron-back" size={24} color={theme.text.primary} />
                                    </CalendarNavButton>
                                    <CalendarMonthYear>
                                        {format(calendarMonth, 'MMMM yyyy', { locale: dateLocale })}
                                    </CalendarMonthYear>
                                    <CalendarNavButton
                                        onPress={() => setCalendarMonth(addMonths(calendarMonth, 1))}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="chevron-forward" size={24} color={theme.text.primary} />
                                    </CalendarNavButton>
                                </CalendarHeader>
                                <CalendarWeekDays>
                                    {weekDayLabels.map((label, index) => (
                                        <CalendarWeekDay key={index}>{label}</CalendarWeekDay>
                                    ))}
                                </CalendarWeekDays>
                                <CalendarDays>
                                    {calendarDays.map((day, index) => {
                                        const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
                                        const isCurrentMonth = isSameMonth(day, calendarMonth);
                                        const isTodayDate = isSameDay(day, today);
                                        return (
                                            <CalendarDay
                                                key={index}
                                                isSelected={isSelected}
                                                isCurrentMonth={isCurrentMonth}
                                                isToday={isTodayDate}
                                                onPress={() => handleDateSelect(day)}
                                                activeOpacity={0.7}
                                                disabled={!isCurrentMonth}
                                            >
                                                <CalendarDayText
                                                    isSelected={isSelected}
                                                    isCurrentMonth={isCurrentMonth}
                                                    isToday={isTodayDate}
                                                >
                                                    {format(day, 'd')}
                                                </CalendarDayText>
                                            </CalendarDay>
                                        );
                                    })}
                                </CalendarDays>
                            </CalendarModal>
                        </TouchableWithoutFeedback>
                    </ModalOverlay>
                </TouchableWithoutFeedback>
            </Modal>
        </Container>
    );
}

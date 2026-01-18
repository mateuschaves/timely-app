import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Alert, Keyboard, ScrollView, Switch, Modal, TouchableWithoutFeedback, TouchableOpacity, Platform, View } from 'react-native';
import { useTranslation } from '@/i18n';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/context/ThemeContext';
import { borderRadius, spacing } from '@/theme';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { updateUserSettings, WorkSchedule, CustomHoliday, HourMultipliers } from '@/api/update-user-settings';
import { getUserSettings } from '@/api/get-user-settings';
import { useFeedback } from '@/utils/feedback';
import { capitalizeFirstLetter } from '@/utils/string';
import { format, parseISO, isValid, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay, addMonths, subMonths, getDay } from 'date-fns';
import { ptBR, enUS, fr, de } from 'date-fns/locale';
import * as Localization from 'expo-localization';
import DateTimePicker from '@react-native-community/datetimepicker';
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
    TimeHint,
    SectionDivider,
    TimePickerTitle,
    TimePickerWrapper,
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
    TimePickerModal,
    WorkTypeContainer,
    WorkTypeButton,
    WorkTypeButtonText,
} from './styles';

interface DaySchedule {
    enabled: boolean;
    startTime: string;
    endTime: string;
    workType?: 'hybrid' | 'remote'; // Apenas para dias que podem ser híbridos ou remotos
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
    const { theme, colorScheme } = useTheme();
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
    const [lunchBreakMinutes, setLunchBreakMinutes] = useState<string>('');
    const [timeFormat12h, setTimeFormat12h] = useState<boolean | null>(null); // null = usar detecção automática
    const [nightMultiplier, setNightMultiplier] = useState<string>('');
    const [weekendMultiplier, setWeekendMultiplier] = useState<string>('');
    const [holidayMultiplier, setHolidayMultiplier] = useState<string>('');

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

    // Verificar se o usuário tem possibilidade de trabalhar remoto
    const canWorkRemote = useMemo(() => {
        const workMode = settingsData?.workMode;
        return workMode === 'hybrid' || workMode === 'remote';
    }, [settingsData?.workMode]);

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

    // Função para detectar automaticamente se o dispositivo/locale usa formato de 12h (AM/PM)
    const detectAuto12HourFormat = useMemo(() => {
        try {
            const localeData = Localization.getLocales()[0];
            const locale = localeData?.languageTag || i18n.language || 'pt-BR';
            const formatter = new Intl.DateTimeFormat(locale, { hour: 'numeric' });
            const options: any = formatter.resolvedOptions?.() || {};
            if (typeof options.hour12 === 'boolean') {
                return options.hour12;
            }
        } catch {
            // Ignora erro e usa fallback baseado no idioma
        }
        return i18n.language?.startsWith('en');
    }, [i18n.language]);

    // Usar preferência salva ou detecção automática
    const is12HourFormat = timeFormat12h !== null ? timeFormat12h : detectAuto12HourFormat;

    // Determinar locale para DateTimePicker no iOS (para controlar formato 12/24h)
    const getPickerLocale = useMemo(() => {
        if (Platform.OS !== 'ios') {
            return undefined; // Android usa is24Hour
        }
        // No iOS, usar locale que force o formato desejado
        // Locales que usam 12h: en-US, en-CA, etc.
        // Locales que usam 24h: en-GB, pt-BR, de-DE, fr-FR, etc.
        if (is12HourFormat) {
            return 'en-US'; // Força formato 12h
        } else {
            return 'en-GB'; // Força formato 24h
        }
    }, [is12HourFormat]);

    const formatTimeForDisplay = useCallback((time24: string): string => {
        if (!time24 || time24.length < 4) return time24;
        if (!is12HourFormat) return time24;

        const [hoursStr, minutesStr = '00'] = time24.split(':');
        const hours = parseInt(hoursStr, 10);
        const minutes = parseInt(minutesStr, 10);
        if (isNaN(hours) || isNaN(minutes)) return time24;

        const localeData = Localization.getLocales()[0];
        const locale = localeData?.languageTag || (i18n.language?.startsWith('en') ? 'en-US' : i18n.language || 'pt-BR');

        const date = new Date();
        date.setHours(hours, minutes, 0, 0);
        return date.toLocaleTimeString(locale, {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true,
        });
    }, [is12HourFormat, i18n.language]);

    // Estado para o time picker nativo
    const [timePickerState, setTimePickerState] = useState<{
        dayKey: string | null;
        type: 'start' | 'end' | null;
    }>({
        dayKey: null,
        type: null,
    });

    const openTimePicker = (dayKey: string, type: 'start' | 'end') => {
        console.log('openTimePicker called:', dayKey, type);
        setTimePickerState({ dayKey, type });
    };

    const getPickerInitialDate = () => {
        if (!timePickerState.dayKey || !timePickerState.type) {
            return new Date();
        }
        const daySchedule = days[timePickerState.dayKey];
        const time24 = timePickerState.type === 'start' ? daySchedule.startTime : daySchedule.endTime;
        const [hoursStr = '09', minutesStr = '00'] = (time24 && time24.includes(':')) ? time24.split(':') : (
            timePickerState.type === 'start' ? ['09', '00'] : ['18', '00']
        );
        const hours = parseInt(hoursStr, 10);
        const minutes = parseInt(minutesStr, 10);
        const date = new Date();
        if (!isNaN(hours)) date.setHours(hours);
        if (!isNaN(minutes)) date.setMinutes(minutes);
        date.setSeconds(0, 0);
        return date;
    };

    const handleTimePicked = (event: any, date?: Date) => {
        // Android: fecha ao cancelar
        if (event?.type === 'dismissed') {
            setTimePickerState({ dayKey: null, type: null });
            return;
        }

        // iOS/Android: enquanto o usuário está girando o spinner, vamos atualizando o horário,
        // mas só fechamos automaticamente no Android (para manter o comportamento de diálogo).
        if (!date || !timePickerState.dayKey || !timePickerState.type) {
            return;
        }

        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const value24 = `${hours}:${minutes}`;

        handleTimeChange(value24, timePickerState.dayKey, timePickerState.type);

        if (Platform.OS === 'android') {
            setTimePickerState({ dayKey: null, type: null });
        }
    };

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

    // Funções para formatação de porcentagem (para multiplicadores)
    const formatPercentage = (multiplier: number | string): string => {
        if (!multiplier) return '';
        const numValue = typeof multiplier === 'string' ? parseFloat(multiplier) : multiplier;
        if (isNaN(numValue) || numValue < 1) return '';
        
        // Converter de multiplicador para porcentagem (ex: 1.20 -> 20%)
        const percentage = (numValue - 1) * 100;
        return `${percentage.toFixed(0)}%`;
    };

    const parsePercentageValue = (value: string): number | undefined => {
        if (!value || !value.trim()) return undefined;
        
        // Remove caracteres não numéricos exceto ponto e vírgula
        let cleaned = value.replace(/[^\d,.-]/g, '').trim();
        if (!cleaned) return undefined;
        
        // Normaliza separador decimal
        cleaned = cleaned.replace(',', '.');
        
        const numValue = parseFloat(cleaned);
        if (isNaN(numValue) || numValue < 0) return undefined;
        
        // Converter de porcentagem para multiplicador (ex: 20% -> 1.20)
        return 1 + (numValue / 100);
    };

    const handleMultiplierChange = (value: string, setter: (value: string) => void) => {
        // Permite apenas números durante a digitação
        const cleaned = value.replace(/[^\d,.-]/g, '');
        setter(cleaned);
    };

    const handleMultiplierBlur = (value: string, setter: (value: string) => void) => {
        if (!value || !value.trim()) {
            setter('');
            return;
        }

        // Parseia o valor
        const multiplier = parsePercentageValue(value);
        
        if (multiplier !== undefined && !isNaN(multiplier) && multiplier >= 1) {
            // Formata como porcentagem
            const formatted = formatPercentage(multiplier);
            setter(formatted);
        } else {
            // Se não conseguiu parsear, limpa o campo
            setter('');
        }
    };

    useEffect(() => {
        if (settingsData) {
            const workSchedule = settingsData.workSchedule || {};

            setDays(prev => ({
                ...prev,
                monday: workSchedule.monday
                    ? { enabled: true, startTime: workSchedule.monday.start, endTime: workSchedule.monday.end, workType: workSchedule.monday.workType }
                    : { ...defaultSchedule },
                tuesday: workSchedule.tuesday
                    ? { enabled: true, startTime: workSchedule.tuesday.start, endTime: workSchedule.tuesday.end, workType: workSchedule.tuesday.workType }
                    : { ...defaultSchedule },
                wednesday: workSchedule.wednesday
                    ? { enabled: true, startTime: workSchedule.wednesday.start, endTime: workSchedule.wednesday.end, workType: workSchedule.wednesday.workType }
                    : { ...defaultSchedule },
                thursday: workSchedule.thursday
                    ? { enabled: true, startTime: workSchedule.thursday.start, endTime: workSchedule.thursday.end, workType: workSchedule.thursday.workType }
                    : { ...defaultSchedule },
                friday: workSchedule.friday
                    ? { enabled: true, startTime: workSchedule.friday.start, endTime: workSchedule.friday.end, workType: workSchedule.friday.workType }
                    : { ...defaultSchedule },
                saturday: workSchedule.saturday
                    ? { enabled: true, startTime: workSchedule.saturday.start, endTime: workSchedule.saturday.end, workType: workSchedule.saturday.workType }
                    : { ...defaultSchedule },
                sunday: workSchedule.sunday
                    ? { enabled: true, startTime: workSchedule.sunday.start, endTime: workSchedule.sunday.end, workType: workSchedule.sunday.workType }
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

            // Carregar minutos de almoço
            if (settingsData.lunchBreakMinutes !== undefined && settingsData.lunchBreakMinutes !== null) {
                setLunchBreakMinutes(String(settingsData.lunchBreakMinutes));
            }

            // Carregar preferência de formato de hora (null = usar detecção automática)
            if (settingsData.timeFormat12h !== undefined) {
                setTimeFormat12h(settingsData.timeFormat12h);
            }

            // Carregar multiplicadores de hora
            if (settingsData.hourMultipliers) {
                if (settingsData.hourMultipliers.night !== undefined && settingsData.hourMultipliers.night !== null) {
                    setNightMultiplier(formatPercentage(settingsData.hourMultipliers.night));
                }
                if (settingsData.hourMultipliers.weekend !== undefined && settingsData.hourMultipliers.weekend !== null) {
                    setWeekendMultiplier(formatPercentage(settingsData.hourMultipliers.weekend));
                }
                if (settingsData.hourMultipliers.holiday !== undefined && settingsData.hourMultipliers.holiday !== null) {
                    setHolidayMultiplier(formatPercentage(settingsData.hourMultipliers.holiday));
                }
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
                ...(canWorkRemote && days.monday.workType ? { workType: days.monday.workType } : {}),
            };
        }
        if (days.tuesday.enabled) {
            workSchedule.tuesday = {
                start: days.tuesday.startTime,
                end: days.tuesday.endTime,
                ...(canWorkRemote && days.tuesday.workType ? { workType: days.tuesday.workType } : {}),
            };
        }
        if (days.wednesday.enabled) {
            workSchedule.wednesday = {
                start: days.wednesday.startTime,
                end: days.wednesday.endTime,
                ...(canWorkRemote && days.wednesday.workType ? { workType: days.wednesday.workType } : {}),
            };
        }
        if (days.thursday.enabled) {
            workSchedule.thursday = {
                start: days.thursday.startTime,
                end: days.thursday.endTime,
                ...(canWorkRemote && days.thursday.workType ? { workType: days.thursday.workType } : {}),
            };
        }
        if (days.friday.enabled) {
            workSchedule.friday = {
                start: days.friday.startTime,
                end: days.friday.endTime,
                ...(canWorkRemote && days.friday.workType ? { workType: days.friday.workType } : {}),
            };
        }
        if (days.saturday.enabled) {
            workSchedule.saturday = {
                start: days.saturday.startTime,
                end: days.saturday.endTime,
                ...(canWorkRemote && days.saturday.workType ? { workType: days.saturday.workType } : {}),
            };
        }
        if (days.sunday.enabled) {
            workSchedule.sunday = {
                start: days.sunday.startTime,
                end: days.sunday.endTime,
                ...(canWorkRemote && days.sunday.workType ? { workType: days.sunday.workType } : {}),
            };
        }

        const hourlyRateValue = parseCurrencyValue(hourlyRate);
        const lunchBreakMinutesValue = lunchBreakMinutes.trim() ? parseInt(lunchBreakMinutes.trim(), 10) : undefined;

        // Parse multipliers
        const nightMultiplierValue = parsePercentageValue(nightMultiplier);
        const weekendMultiplierValue = parsePercentageValue(weekendMultiplier);
        const holidayMultiplierValue = parsePercentageValue(holidayMultiplier);

        // Build hourMultipliers object only if at least one value is defined
        const hourMultipliers: HourMultipliers | undefined =
            nightMultiplierValue !== undefined || weekendMultiplierValue !== undefined || holidayMultiplierValue !== undefined
                ? {
                    night: nightMultiplierValue,
                    weekend: weekendMultiplierValue,
                    holiday: holidayMultiplierValue,
                }
                : undefined;

        updateSettingsMutation.mutate({
            workSchedule,
            customHolidays: customHolidays,
            hourlyRate: hourlyRateValue,
            lunchBreakMinutes: lunchBreakMinutesValue && !isNaN(lunchBreakMinutesValue) && lunchBreakMinutesValue >= 0 ? lunchBreakMinutesValue : undefined,
            hourMultipliers: hourMultipliers,
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
                    {/* Seção: Horários de Trabalho */}
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
                                            <>
                                                <TimeRow>
                                                    <TouchableOpacity
                                                        style={{ flex: 1 }}
                                                        activeOpacity={0.7}
                                                        onPress={() => {
                                                            console.log('TouchableOpacity pressed for start time');
                                                            Keyboard.dismiss();
                                                            openTimePicker(day.key, 'start');
                                                        }}
                                                        disabled={updateSettingsMutation.isPending}
                                                    >
                                                        <TimeInput
                                                            value={formatTimeForDisplay(daySchedule.startTime)}
                                                            placeholder={is12HourFormat ? '9:00 AM' : '09:00'}
                                                            placeholderTextColor={theme.text.tertiary}
                                                            keyboardType="number-pad"
                                                            maxLength={5}
                                                            editable={false}
                                                            pointerEvents="none"
                                                            selectTextOnFocus={false}
                                                        />
                                                    </TouchableOpacity>
                                                    <TimeSeparator>—</TimeSeparator>
                                                    <TouchableOpacity
                                                        style={{ flex: 1 }}
                                                        activeOpacity={0.7}
                                                        onPress={() => {
                                                            console.log('TouchableOpacity pressed for end time');
                                                            Keyboard.dismiss();
                                                            openTimePicker(day.key, 'end');
                                                        }}
                                                        disabled={updateSettingsMutation.isPending}
                                                    >
                                                        <TimeInput
                                                            value={formatTimeForDisplay(daySchedule.endTime)}
                                                            placeholder={is12HourFormat ? '6:00 PM' : '18:00'}
                                                            placeholderTextColor={theme.text.tertiary}
                                                            keyboardType="number-pad"
                                                            maxLength={5}
                                                            editable={false}
                                                            pointerEvents="none"
                                                            selectTextOnFocus={false}
                                                        />
                                                    </TouchableOpacity>
                                                </TimeRow>
                                                {is12HourFormat && (
                                                    <TimeHint>
                                                        {formatTimeForDisplay(daySchedule.startTime)} — {formatTimeForDisplay(daySchedule.endTime)}
                                                    </TimeHint>
                                                )}
                                                {canWorkRemote && (
                                                    <WorkTypeContainer>
                                                        <WorkTypeButton
                                                            theme={theme}
                                                            selected={daySchedule.workType === 'hybrid'}
                                                            onPress={() => {
                                                                setDays(prev => ({
                                                                    ...prev,
                                                                    [day.key]: {
                                                                        ...prev[day.key],
                                                                        workType: prev[day.key].workType === 'hybrid' ? undefined : 'hybrid',
                                                                    },
                                                                }));
                                                            }}
                                                            activeOpacity={0.7}
                                                        >
                                                            <WorkTypeButtonText theme={theme} selected={daySchedule.workType === 'hybrid'}>
                                                                {t('profile.workType.hybrid')}
                                                            </WorkTypeButtonText>
                                                        </WorkTypeButton>
                                                        <WorkTypeButton
                                                            theme={theme}
                                                            selected={daySchedule.workType === 'remote'}
                                                            onPress={() => {
                                                                setDays(prev => ({
                                                                    ...prev,
                                                                    [day.key]: {
                                                                        ...prev[day.key],
                                                                        workType: prev[day.key].workType === 'remote' ? undefined : 'remote',
                                                                    },
                                                                }));
                                                            }}
                                                            activeOpacity={0.7}
                                                        >
                                                            <WorkTypeButtonText theme={theme} selected={daySchedule.workType === 'remote'}>
                                                                {t('profile.workType.remote')}
                                                            </WorkTypeButtonText>
                                                        </WorkTypeButton>
                                                    </WorkTypeContainer>
                                                )}
                                            </>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </SettingSection>

                        <SectionDivider />

                        <SettingSection>
                            <DayRow>
                                <DayInfo>
                                    <DayName>{t('profile.timeFormat12h')}</DayName>
                                </DayInfo>
                                <Switch
                                    value={is12HourFormat}
                                    onValueChange={(value) => setTimeFormat12h(value)}
                                    disabled={updateSettingsMutation.isPending}
                                    trackColor={{ false: theme.border.medium, true: theme.primary }}
                                    thumbColor={theme.background.primary}
                                />
                            </DayRow>
                        </SettingSection>

                        <SectionDivider />

                        <SettingSection>
                            <SettingLabel>{t('profile.lunchBreakMinutes')}</SettingLabel>
                            <HourlyRateInput
                                value={lunchBreakMinutes}
                                onChangeText={(value: string) => {
                                    const numbers = value.replace(/[^0-9]/g, '');
                                    setLunchBreakMinutes(numbers);
                                }}
                                placeholder={t('profile.lunchBreakMinutesPlaceholder')}
                                placeholderTextColor={theme.text.tertiary}
                                keyboardType="number-pad"
                                editable={!updateSettingsMutation.isPending}
                            />
                        </SettingSection>
                    </SettingsCard>

                    {/* Seção: Configurações Financeiras */}
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

                    {/* Seção: Multiplicadores de Hora */}
                    <SettingsCard>
                        <SettingSection>
                            <SettingLabel>{t('profile.hourMultipliers')}</SettingLabel>
                            <TimeHint>{t('profile.hourMultipliersDescription')}</TimeHint>
                            
                            <DayName style={{ marginTop: spacing.sm, marginBottom: spacing.xs }}>{t('profile.nightMultiplier')}</DayName>
                            <TimeHint style={{ marginBottom: spacing.sm }}>{t('profile.nightMultiplierHint')}</TimeHint>
                            <HourlyRateInput
                                value={nightMultiplier}
                                onChangeText={(value: string) => handleMultiplierChange(value, setNightMultiplier)}
                                onBlur={() => handleMultiplierBlur(nightMultiplier, setNightMultiplier)}
                                onEndEditing={() => handleMultiplierBlur(nightMultiplier, setNightMultiplier)}
                                placeholder={t('profile.nightMultiplierPlaceholder')}
                                placeholderTextColor={theme.text.tertiary}
                                keyboardType="decimal-pad"
                                editable={!updateSettingsMutation.isPending}
                            />

                            <DayName style={{ marginTop: spacing.md, marginBottom: spacing.xs }}>{t('profile.weekendMultiplier')}</DayName>
                            <HourlyRateInput
                                value={weekendMultiplier}
                                onChangeText={(value: string) => handleMultiplierChange(value, setWeekendMultiplier)}
                                onBlur={() => handleMultiplierBlur(weekendMultiplier, setWeekendMultiplier)}
                                onEndEditing={() => handleMultiplierBlur(weekendMultiplier, setWeekendMultiplier)}
                                placeholder={t('profile.weekendMultiplierPlaceholder')}
                                placeholderTextColor={theme.text.tertiary}
                                keyboardType="decimal-pad"
                                editable={!updateSettingsMutation.isPending}
                            />

                            <DayName style={{ marginTop: spacing.md, marginBottom: spacing.xs }}>{t('profile.holidayMultiplier')}</DayName>
                            <HourlyRateInput
                                value={holidayMultiplier}
                                onChangeText={(value: string) => handleMultiplierChange(value, setHolidayMultiplier)}
                                onBlur={() => handleMultiplierBlur(holidayMultiplier, setHolidayMultiplier)}
                                onEndEditing={() => handleMultiplierBlur(holidayMultiplier, setHolidayMultiplier)}
                                placeholder={t('profile.holidayMultiplierPlaceholder')}
                                placeholderTextColor={theme.text.tertiary}
                                keyboardType="decimal-pad"
                                editable={!updateSettingsMutation.isPending}
                            />
                        </SettingSection>
                    </SettingsCard>

                    {/* Seção: Feriados */}
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
                visible={!!(timePickerState.dayKey && timePickerState.type)}
                transparent
                animationType="fade"
                onRequestClose={() => setTimePickerState({ dayKey: null, type: null })}
            >
                <TouchableWithoutFeedback onPress={() => setTimePickerState({ dayKey: null, type: null })}>
                    <ModalOverlay>
                        <TouchableWithoutFeedback>
                            <TimePickerModal>
                                {timePickerState.dayKey && timePickerState.type && (
                                    <>
                                        <TimePickerTitle>
                                            {dayNames.find(d => d.key === timePickerState.dayKey)?.label || ''}
                                        </TimePickerTitle>
                                        <TimePickerWrapper>
                                            <DateTimePicker
                                                value={getPickerInitialDate()}
                                                mode="time"
                                                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                                                is24Hour={!is12HourFormat}
                                                locale={getPickerLocale}
                                                onChange={handleTimePicked}
                                                textColor={colorScheme === 'dark' ? '#FFFFFF' : '#000000'}
                                                themeVariant={colorScheme === 'dark' ? 'dark' : 'light'}
                                                style={{
                                                    backgroundColor: 'transparent',
                                                }}
                                            />
                                        </TimePickerWrapper>
                                        {Platform.OS === 'ios' && (
                                            <TouchableOpacity
                                                onPress={() => setTimePickerState({ dayKey: null, type: null })}
                                                style={{
                                                    marginTop: spacing.lg,
                                                    paddingHorizontal: spacing.xl,
                                                    paddingVertical: spacing.md,
                                                    backgroundColor: colorScheme === 'dark' ? '#1a1a1a' : theme.primary,
                                                    borderRadius: borderRadius.md,
                                                    width: '100%',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    borderWidth: colorScheme === 'dark' ? 1 : 0,
                                                    borderColor: colorScheme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'transparent',
                                                }}
                                                activeOpacity={0.7}
                                            >
                                                <SaveButtonText>{t('common.done')}</SaveButtonText>
                                            </TouchableOpacity>
                                        )}
                                    </>
                                )}
                            </TimePickerModal>
                        </TouchableWithoutFeedback>
                    </ModalOverlay>
                </TouchableWithoutFeedback>
            </Modal>
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

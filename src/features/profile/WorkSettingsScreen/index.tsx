import React, { useState, useEffect, useMemo } from 'react';
import { Alert, Keyboard, ScrollView, Switch, Modal, TouchableWithoutFeedback } from 'react-native';
import { useTranslation } from '@/i18n';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '@/theme';
import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { updateUserSettings, WorkSchedule, CustomHoliday } from '@/api/update-user-settings';
import { getUserSettings } from '@/api/get-user-settings';
import { useFeedback } from '@/utils/feedback';
import { format, parseISO, isValid, startOfMonth, endOfMonth, eachDayOfInterval, startOfWeek, endOfWeek, isSameMonth, isSameDay, addMonths, subMonths, getDay } from 'date-fns';
import { ptBR, enUS, fr, de } from 'date-fns/locale';
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

    const dayNames = [
        { key: 'monday', label: t('profile.monday') },
        { key: 'tuesday', label: t('profile.tuesday') },
        { key: 'wednesday', label: t('profile.wednesday') },
        { key: 'thursday', label: t('profile.thursday') },
        { key: 'friday', label: t('profile.friday') },
        { key: 'saturday', label: t('profile.saturday') },
        { key: 'sunday', label: t('profile.sunday') },
    ];

    const { data: settingsData } = useQuery({
        queryKey: ['userSettings'],
        queryFn: getUserSettings,
    });

    const updateSettingsMutation = useMutation({
        mutationFn: updateUserSettings,
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['userSettings', 'clockHistory'] });
            await queryClient.refetchQueries({ queryKey: ['userSettings', 'clockHistory'] });
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
        }
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

        updateSettingsMutation.mutate({
            workSchedule,
            customHolidays: customHolidays,
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
                    <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
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
                                                trackColor={{ false: colors.border.medium, true: colors.primary }}
                                                thumbColor={colors.background.primary}
                                            />
                                        </DayRow>
                                        {daySchedule.enabled && (
                                            <TimeRow>
                                                <TimeInput
                                                    value={daySchedule.startTime}
                                                    onChangeText={(value: string) => handleTimeChange(value, day.key, 'start')}
                                                    onBlur={() => handleTimeBlur(day.key, 'start')}
                                                    placeholder="09:00"
                                                    placeholderTextColor={colors.text.tertiary}
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
                                                    placeholderTextColor={colors.text.tertiary}
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
                                                <Ionicons name="create-outline" size={20} color={colors.primary} />
                                            </HolidayActionButton>
                                            <HolidayActionButton
                                                onPress={() => handleRemoveHoliday(index)}
                                                disabled={updateSettingsMutation.isPending || isAddingHoliday}
                                            >
                                                <Ionicons name="trash-outline" size={20} color={colors.status.error} />
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
                                                    color={colors.text.secondary}
                                                />
                                            </DatePickerButtonContent>
                                        </DatePickerButton>
                                        <HolidayNameInput
                                            value={newHolidayName}
                                            onChangeText={setNewHolidayName}
                                            placeholder={t('profile.holidayNamePlaceholder')}
                                            placeholderTextColor={colors.text.tertiary}
                                            editable={!updateSettingsMutation.isPending}
                                        />
                                    </HolidayInputRow>
                                    <HolidayActions style={{ justifyContent: 'flex-end', marginTop: spacing.xs }}>
                                        <HolidayActionButton
                                            onPress={handleCancelHoliday}
                                            disabled={updateSettingsMutation.isPending}
                                        >
                                            <Ionicons name="close-circle-outline" size={24} color={colors.text.secondary} />
                                        </HolidayActionButton>
                                        <HolidayActionButton
                                            onPress={handleSaveHoliday}
                                            disabled={updateSettingsMutation.isPending}
                                        >
                                            <Ionicons name="checkmark-circle-outline" size={24} color={colors.primary} />
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
                                    <Ionicons name="add-circle-outline" size={20} color={colors.primary} />
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
                                        <Ionicons name="chevron-back" size={24} color={colors.text.primary} />
                                    </CalendarNavButton>
                                    <CalendarMonthYear>
                                        {format(calendarMonth, 'MMMM yyyy', { locale: dateLocale })}
                                    </CalendarMonthYear>
                                    <CalendarNavButton
                                        onPress={() => setCalendarMonth(addMonths(calendarMonth, 1))}
                                        activeOpacity={0.7}
                                    >
                                        <Ionicons name="chevron-forward" size={24} color={colors.text.primary} />
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

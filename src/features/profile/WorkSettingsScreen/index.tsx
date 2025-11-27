import React, { useState, useEffect } from 'react';
import { Alert, Keyboard, ScrollView, Switch } from 'react-native';
import { useTranslation } from '@/i18n';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { updateUserSettings, WorkSchedule } from '@/api/update-user-settings';
import { getUserSettings } from '@/api/get-user-settings';
import {
    Container,
    Content,
    Header,
    HeaderTitle,
    BackButton,
    SettingsCard,
    SettingSection,
    SettingLabel,
    InputContainer,
    Input,
    DayRow,
    DayInfo,
    DayName,
    TimeRow,
    TimeInput,
    TimeSeparator,
    SaveButton,
    SaveButtonText,
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
    const [workAddress, setWorkAddress] = useState('');
    const [days, setDays] = useState<Record<string, DaySchedule>>({
        monday: { ...defaultSchedule },
        tuesday: { ...defaultSchedule },
        wednesday: { ...defaultSchedule },
        thursday: { ...defaultSchedule },
        friday: { ...defaultSchedule },
        saturday: { ...defaultSchedule },
        sunday: { ...defaultSchedule },
    });
    const [isSaving, setIsSaving] = useState(false);

    const dayNames = [
        { key: 'monday', label: t('profile.monday') },
        { key: 'tuesday', label: t('profile.tuesday') },
        { key: 'wednesday', label: t('profile.wednesday') },
        { key: 'thursday', label: t('profile.thursday') },
        { key: 'friday', label: t('profile.friday') },
        { key: 'saturday', label: t('profile.saturday') },
        { key: 'sunday', label: t('profile.sunday') },
    ];

    const { data: settingsData, isLoading: isLoadingSettings } = useQuery({
        queryKey: ['userSettings'],
        queryFn: getUserSettings,
    });

    useEffect(() => {
        if (settingsData) {
            if (settingsData.workLocation?.coordinates) {
                setWorkAddress(`${settingsData.workLocation.coordinates[1]}, ${settingsData.workLocation.coordinates[0]}`);
            }

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
        }
    }, [settingsData]);

    const handleSave = async () => {
        setIsSaving(true);
        Keyboard.dismiss();

        try {
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

            const workLocation = workAddress.trim()
                ? (() => {
                    const coords = workAddress.trim().split(',').map(Number).filter(n => !isNaN(n));
                    if (coords.length === 2) {
                        return {
                            type: 'Point' as const,
                            coordinates: [coords[1], coords[0]] as [number, number],
                        };
                    }
                    return undefined;
                })()
                : undefined;

            await updateUserSettings({
                workSchedule,
                customHolidays: [],
                ...(workLocation && { workLocation }),
            });

            queryClient.invalidateQueries({ queryKey: ['userSettings'] });
            navigation.goBack();
        } catch (error: any) {
            Alert.alert(
                t('common.error'),
                error.response?.data?.message || t('profile.workSettingsError')
            );
        } finally {
            setIsSaving(false);
        }
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
                            <SettingLabel>{t('profile.workAddress')}</SettingLabel>
                            <InputContainer>
                                <Input
                                    value={workAddress}
                                    onChangeText={setWorkAddress}
                                    placeholder={t('profile.workAddressPlaceholder')}
                                    placeholderTextColor={colors.text.tertiary}
                                    multiline
                                    numberOfLines={3}
                                    editable={!isSaving}
                                />
                            </InputContainer>
                        </SettingSection>
                    </SettingsCard>

                    <SettingsCard>
                        <SettingSection>
                            <SettingLabel>{t('profile.workHours')}</SettingLabel>
                            {dayNames.map((day, index) => {
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
                                                disabled={isSaving}
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
                                                    editable={!isSaving}
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
                                                    editable={!isSaving}
                                                />
                                            </TimeRow>
                                        )}
                                    </React.Fragment>
                                );
                            })}
                        </SettingSection>
                    </SettingsCard>

                    <SaveButton onPress={handleSave} disabled={isSaving} activeOpacity={0.7}>
                        <SaveButtonText>{isSaving ? t('common.loading') : t('common.save')}</SaveButtonText>
                    </SaveButton>
                </ScrollView>
            </Content>
        </Container>
    );
}

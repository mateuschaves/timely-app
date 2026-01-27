import React, { useState } from 'react';
import { Alert, Keyboard, Platform, TouchableWithoutFeedback, Text } from 'react-native';
import { useTranslation } from '@/i18n';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '@/navigation/AppNavigator';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/context/ThemeContext';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { format } from 'date-fns';
import { useFeedback } from '@/utils/feedback';
import { useCreateAbsence } from '@/features/absences/hooks/useAbsences';
import { Button } from '@/components/Button';
import { usePremiumFeatures } from '@/features/subscriptions';
import {
  Container,
  Header,
  HeaderTitle,
  BackButton,
  Content,
  InputContainer,
  InputLabel,
  Input,
  PickerButton,
  PickerValue,
  ModalOverlay,
  PickerModal,
  PickerTitle,
  PickerActions,
  PickerActionButton,
  PickerActionText,
  ButtonContainer,
} from './styles';

type AddAbsenceRouteParams = {
  AddAbsence: {
    date?: string;
  };
};

type AddAbsenceRouteProp = RouteProp<AddAbsenceRouteParams, 'AddAbsence'>;

export function AddAbsenceScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const route = useRoute<AddAbsenceRouteProp>();
  const { showSuccess, showError } = useFeedback();
  const { theme, colorScheme } = useTheme();
  const createAbsenceMutation = useCreateAbsence();
  const { hasJustifiedAbsences } = usePremiumFeatures();
  
  const initialDate = route.params?.date ? new Date(route.params.date) : new Date();
  
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [reason, setReason] = useState<string>('');
  const [description, setDescription] = useState<string>('');

  const handleDateChange = (event: DateTimePickerEvent, pickedDate?: Date) => {
    if (Platform.OS !== 'ios') {
      setShowDatePicker(false);
    }

    if (event.type === 'dismissed' || !pickedDate) return;

    setSelectedDate(pickedDate);
  };

  const formattedDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';

  const openDatePicker = () => {
    if (createAbsenceMutation.isPending) return;
    Keyboard.dismiss();
    setShowDatePicker(true);
  };

  const closePickers = () => {
    setShowDatePicker(false);
  };

  const handleSave = async () => {
    // Check premium access first
    if (!hasJustifiedAbsences) {
      navigation.navigate('Paywall', { feature: 'justified_absences' });
      return;
    }

    if (!reason.trim()) {
      Alert.alert(t('common.error'), t('history.absenceReasonRequired'));
      return;
    }

    createAbsenceMutation.mutate(
      {
        date: formattedDate,
        reason: reason.trim(),
        description: description.trim() || undefined,
      },
      {
        onSuccess: () => {
          showSuccess(t('history.absenceSuccess'));
          navigation.goBack();
        },
        onError: (error: any) => {
          console.error('Error creating absence:', error);
          
          // Check if the error is about existing clock records
          const errorMessage = error?.response?.data?.message || error?.message || '';
          
          if (errorMessage.toLowerCase().includes('clock') || errorMessage.toLowerCase().includes('registro')) {
            showError(t('history.absenceClockRecordsExist'));
          } else {
            showError(t('history.absenceError'));
          }
        },
      }
    );
  };

  const renderDatePicker = () => {
    if (!showDatePicker) return null;

    if (Platform.OS === 'ios') {
      return (
        <ModalOverlay onPress={closePickers}>
          <PickerModal onStartShouldSetResponder={() => true}>
            <PickerTitle>{t('history.absenceDate')}</PickerTitle>
            <DateTimePicker
              value={selectedDate}
              mode="date"
              display="spinner"
              onChange={handleDateChange}
              style={{ width: '100%' }}
              themeVariant={colorScheme}
            />
            <PickerActions>
              <PickerActionButton onPress={closePickers}>
                <PickerActionText>{t('common.done')}</PickerActionText>
              </PickerActionButton>
            </PickerActions>
          </PickerModal>
        </ModalOverlay>
      );
    }

    return (
      <DateTimePicker
        value={selectedDate}
        mode="date"
        display="default"
        onChange={handleDateChange}
        themeVariant={colorScheme}
      />
    );
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <Container>
        <Header>
          <BackButton onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color={theme.text.primary} />
          </BackButton>
          <HeaderTitle>
            {t('history.addAbsenceTitle')}
            {!hasJustifiedAbsences && (
              <Text style={{ fontSize: 12, color: theme.status.warning }}>
                {' '}({t('profile.premiumFeature')})
              </Text>
            )}
          </HeaderTitle>
        </Header>

        <Content>
          {!hasJustifiedAbsences && (
            <InputContainer>
              <Text style={{ 
                color: theme.status.warning, 
                fontSize: 14, 
                textAlign: 'center',
                padding: 12,
                backgroundColor: theme.background.secondary,
                borderRadius: 8,
                marginBottom: 8
              }}>
                ⭐ {t('profile.justifiedAbsencesPremiumMessage')}
              </Text>
            </InputContainer>
          )}
          <InputContainer>
            <InputLabel>{t('history.absenceDate')}</InputLabel>
            <PickerButton onPress={openDatePicker}>
              <PickerValue>{formattedDate}</PickerValue>
              <Ionicons name="calendar-outline" size={20} color={theme.text.primary} />
            </PickerButton>
          </InputContainer>

          <InputContainer>
            <InputLabel>{t('history.absenceReason')}</InputLabel>
            <Input
              value={reason}
              onChangeText={setReason}
              placeholder={t('history.absenceReasonPlaceholder')}
              placeholderTextColor={theme.text.secondary}
              editable={!createAbsenceMutation.isPending}
              maxLength={100}
            />
          </InputContainer>

          <InputContainer>
            <InputLabel>{t('history.absenceDescription')}</InputLabel>
            <Input
              value={description}
              onChangeText={setDescription}
              placeholder={t('history.absenceDescriptionPlaceholder')}
              placeholderTextColor={theme.text.secondary}
              editable={!createAbsenceMutation.isPending}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              style={{ minHeight: 100 }}
              maxLength={500}
            />
          </InputContainer>

          <ButtonContainer>
            <Button
              title={t('common.save')}
              onPress={handleSave}
              isLoading={createAbsenceMutation.isPending}
            />
          </ButtonContainer>
        </Content>

        {renderDatePicker()}
      </Container>
    </TouchableWithoutFeedback>
  );
}

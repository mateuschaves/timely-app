import React, { useState } from 'react';
import { Alert, Keyboard, Platform, TouchableWithoutFeedback } from 'react-native';
import { useTranslation } from '@/i18n';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/context/ThemeContext';
import { useQueryClient } from '@tanstack/react-query';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { createAbsence } from '@/api';
import { format } from 'date-fns';
import { useFeedback } from '@/utils/feedback';
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
  SaveButton,
  SaveButtonText,
} from './styles';

type AddAbsenceRouteParams = {
  AddAbsence: {
    date?: string;
  };
};

type AddAbsenceRouteProp = RouteProp<AddAbsenceRouteParams, 'AddAbsence'>;

export function AddAbsenceScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute<AddAbsenceRouteProp>();
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useFeedback();
  const { theme, colorScheme } = useTheme();
  
  const initialDate = route.params?.date ? new Date(route.params.date) : new Date();
  
  const [selectedDate, setSelectedDate] = useState<Date>(initialDate);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [reason, setReason] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  const handleDateChange = (event: DateTimePickerEvent, pickedDate?: Date) => {
    if (Platform.OS !== 'ios') {
      setShowDatePicker(false);
    }

    if (event.type === 'dismissed' || !pickedDate) return;

    setSelectedDate(pickedDate);
  };

  const formattedDate = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : '';

  const openDatePicker = () => {
    if (isSaving) return;
    Keyboard.dismiss();
    setShowDatePicker(true);
  };

  const closePickers = () => {
    setShowDatePicker(false);
  };

  const handleSave = async () => {
    if (!reason.trim()) {
      Alert.alert(t('common.error'), t('history.absenceReason') + ' é obrigatório');
      return;
    }

    try {
      setIsSaving(true);

      await createAbsence({
        date: formattedDate,
        reason: reason.trim(),
        description: description.trim() || undefined,
      });

      showSuccess(t('history.absenceSuccess'));
      
      // Invalidate queries to refresh the history
      queryClient.invalidateQueries({ queryKey: ['clock-history'] });
      
      navigation.goBack();
    } catch (error: any) {
      console.error('Error creating absence:', error);
      
      // Check if the error is about existing clock records
      const errorMessage = error?.response?.data?.message || error?.message || '';
      
      if (errorMessage.toLowerCase().includes('clock') || errorMessage.toLowerCase().includes('registro')) {
        showError(t('history.absenceClockRecordsExist'));
      } else {
        showError(t('history.absenceError'));
      }
    } finally {
      setIsSaving(false);
    }
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
            <Ionicons name="chevron-back" size={24} color={theme.text} />
          </BackButton>
          <HeaderTitle>{t('history.addAbsenceTitle')}</HeaderTitle>
        </Header>

        <Content>
          <InputContainer>
            <InputLabel>{t('history.absenceDate')}</InputLabel>
            <PickerButton onPress={openDatePicker}>
              <PickerValue>{formattedDate}</PickerValue>
              <Ionicons name="calendar-outline" size={20} color={theme.text} />
            </PickerButton>
          </InputContainer>

          <InputContainer>
            <InputLabel>{t('history.absenceReason')}</InputLabel>
            <Input
              value={reason}
              onChangeText={setReason}
              placeholder={t('history.absenceReasonPlaceholder')}
              placeholderTextColor={theme.textSecondary}
              editable={!isSaving}
              maxLength={100}
            />
          </InputContainer>

          <InputContainer>
            <InputLabel>{t('history.absenceDescription')}</InputLabel>
            <Input
              value={description}
              onChangeText={setDescription}
              placeholder={t('history.absenceDescriptionPlaceholder')}
              placeholderTextColor={theme.textSecondary}
              editable={!isSaving}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
              style={{ minHeight: 100 }}
              maxLength={500}
            />
          </InputContainer>

          <ButtonContainer>
            <SaveButton onPress={handleSave} disabled={isSaving}>
              <SaveButtonText>{isSaving ? t('common.loading') : t('common.save')}</SaveButtonText>
            </SaveButton>
          </ButtonContainer>
        </Content>

        {renderDatePicker()}
      </Container>
    </TouchableWithoutFeedback>
  );
}

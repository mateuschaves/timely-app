import React, { useState, useEffect } from 'react';
import { Alert, Keyboard, KeyboardAvoidingView, Modal, Platform, TouchableWithoutFeedback, View, TouchableOpacity } from 'react-native';
import { useTranslation } from '@/i18n';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/context/ThemeContext';
import { useQueryClient } from '@tanstack/react-query';
import DateTimePicker, { DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { updateClockEvent, deleteClockEvent, confirmClockEvent } from '@/api';
import { ClockHistoryEvent } from '@/api/get-clock-history';
import { format, parseISO } from 'date-fns';
import { useFeedback } from '@/utils/feedback';
import { Button } from '@/components/Button';
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
  DeleteButton,
  DeleteButtonText,
  ConfirmButton,
  ConfirmButtonText,
} from './styles';

type EditEventRouteParams = {
  EditEvent: {
    event: ClockHistoryEvent;
  };
};

type EditEventRouteProp = RouteProp<EditEventRouteParams, 'EditEvent'>;

export function EditEventScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute<EditEventRouteProp>();
  const queryClient = useQueryClient();
  const { showSuccess } = useFeedback();
  const { theme, colorScheme } = useTheme();
  const { event } = route.params;

  const [selectedDateTime, setSelectedDateTime] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (event.hour) {
      const eventDate = parseISO(event.hour);
      if (!isNaN(eventDate.getTime())) {
        const normalizedDate = new Date(eventDate);
        normalizedDate.setSeconds(0, 0);
        setSelectedDateTime(normalizedDate);
      }
    }

    setNotes(event.notes || '');
  }, [event.hour, event.notes]);

  useEffect(() => {
    if (!selectedDateTime && event.hour) {
      const fallbackDate = parseISO(event.hour);
      if (!isNaN(fallbackDate.getTime())) {
        fallbackDate.setSeconds(0, 0);
        setSelectedDateTime(fallbackDate);
      }
    }
  }, [event.hour, selectedDateTime]);

  const mergeDateAndTime = (pickedDate: Date, baseDate: Date, type: 'date' | 'time') => {
    const nextDate = new Date(baseDate);

    if (type === 'date') {
      nextDate.setFullYear(pickedDate.getFullYear(), pickedDate.getMonth(), pickedDate.getDate());
    } else {
      nextDate.setHours(pickedDate.getHours(), pickedDate.getMinutes(), 0, 0);
    }

    nextDate.setSeconds(0, 0);
    return nextDate;
  };

  const handleDateChange = (eventChange: DateTimePickerEvent, pickedDate?: Date) => {
    if (Platform.OS !== 'ios') {
      setShowDatePicker(false);
    }

    if (eventChange.type === 'dismissed' || !pickedDate) return;

    setSelectedDateTime(current => mergeDateAndTime(pickedDate, current || new Date(), 'date'));
  };

  const handleTimeChange = (eventChange: DateTimePickerEvent, pickedDate?: Date) => {
    if (Platform.OS !== 'ios') {
      setShowTimePicker(false);
    }

    if (eventChange.type === 'dismissed' || !pickedDate) return;

    setSelectedDateTime(current => mergeDateAndTime(pickedDate, current || new Date(), 'time'));
  };

  const formattedDate = selectedDateTime ? format(selectedDateTime, 'yyyy-MM-dd') : '';
  const formattedTime = selectedDateTime ? format(selectedDateTime, 'HH:mm') : '';

  const openDatePicker = () => {
    if (isSaving || isDeleting) return;
    Keyboard.dismiss();
    setShowDatePicker(true);
  };

  const openTimePicker = () => {
    if (isSaving || isDeleting) return;
    Keyboard.dismiss();
    setShowTimePicker(true);
  };

  const closePickers = () => {
    setShowDatePicker(false);
    setShowTimePicker(false);
  };

  const handleSave = async () => {
    if (!selectedDateTime) {
      Alert.alert(t('common.error'), t('history.hourRequired'));
      return;
    }

    try {
      const hourDate = new Date(selectedDateTime);
      if (isNaN(hourDate.getTime())) {
        Alert.alert(t('common.error'), t('history.invalidHour'));
        return;
      }

      setIsSaving(true);
      Keyboard.dismiss();

      await updateClockEvent(event.id, {
        hour: hourDate.toISOString(),
        ...(event.photoUrl && { photoUrl: event.photoUrl }),
        notes: notes?.trim() ? notes.trim() : null,
      });

      // Invalidar todas as queries do histórico e forçar refetch
      await queryClient.invalidateQueries({ queryKey: ['clockHistory'] });
      await queryClient.refetchQueries({ queryKey: ['clockHistory'] });

      // Invalidar outras queries relacionadas
      queryClient.invalidateQueries({ queryKey: ['lastEvent'] });
      queryClient.invalidateQueries({ queryKey: ['timeClockEntries'] });

      showSuccess(t('history.updateEventSuccess'));
      navigation.goBack();
    } catch (error: any) {
      console.error('Erro ao atualizar evento:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        t('history.updateEventError');
      Alert.alert(t('common.error'), errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      t('history.deleteEventTitle'),
      t('history.deleteEventConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              setIsDeleting(true);
              Keyboard.dismiss();

              await deleteClockEvent(event.id);

              // Invalidar e refetch imediatamente
              await queryClient.invalidateQueries({ queryKey: ['clockHistory'] });
              await queryClient.refetchQueries({ queryKey: ['clockHistory'] });
              queryClient.invalidateQueries({ queryKey: ['timeClockEntries'] });
              queryClient.invalidateQueries({ queryKey: ['lastEvent'] });

              showSuccess(t('history.deleteEventSuccess'));
              navigation.goBack();
            } catch (error: any) {
              console.error('Erro ao deletar evento:', error);
              const errorMessage =
                error.response?.data?.message ||
                error.message ||
                t('history.deleteEventError');
              Alert.alert(t('common.error'), errorMessage);
            } finally {
              setIsDeleting(false);
            }
          },
        },
      ]
    );
  };

  const handleConfirm = async () => {
    try {
      setIsConfirming(true);
      Keyboard.dismiss();

      await confirmClockEvent(event.id);

      // Invalidar e refetch imediatamente
      await queryClient.invalidateQueries({ queryKey: ['clockHistory'] });
      await queryClient.refetchQueries({ queryKey: ['clockHistory'] });
      queryClient.invalidateQueries({ queryKey: ['timeClockEntries'] });
      queryClient.invalidateQueries({ queryKey: ['lastEvent'] });

      showSuccess(t('history.confirmEventSuccess'));
      navigation.goBack();
    } catch (error: any) {
      console.error('Erro ao confirmar evento:', error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        t('history.confirmEventError');
      Alert.alert(t('common.error'), errorMessage);
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <Container>
      <Header>
        <BackButton onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text.primary} />
        </BackButton>
        <HeaderTitle>{t('history.editEvent')}</HeaderTitle>
      </Header>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 84 : 0}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss} accessible={false}>
          <Content>
            <InputContainer>
              <InputLabel>{t('history.date')}</InputLabel>
              <PickerButton onPress={openDatePicker} disabled={isSaving || isDeleting || isConfirming} activeOpacity={0.7}>
                <PickerValue placeholder={!formattedDate}>
                  {formattedDate || 'YYYY-MM-DD'}
                </PickerValue>
              </PickerButton>
            </InputContainer>

            <InputContainer>
              <InputLabel>{t('history.hour')}</InputLabel>
              <PickerButton onPress={openTimePicker} disabled={isSaving || isDeleting || isConfirming} activeOpacity={0.7}>
                <PickerValue placeholder={!formattedTime}>
                  {formattedTime || 'HH:mm'}
                </PickerValue>
              </PickerButton>
            </InputContainer>

            <InputContainer>
              <InputLabel>{t('history.notes')}</InputLabel>
              <View style={{ position: 'relative' }}>
                <Input
                  value={notes}
                  onChangeText={setNotes}
                  placeholder={t('history.notes')}
                  placeholderTextColor={theme.text.tertiary}
                  editable={!isSaving && !isDeleting && !isConfirming}
                  multiline
                  numberOfLines={3}
                  style={{ minHeight: 80, textAlignVertical: 'top', paddingRight: notes?.length ? 48 : 16 }}
                />
                {!!notes?.length && (
                  <TouchableOpacity
                    onPress={() => setNotes('')}
                    disabled={isSaving || isDeleting || isConfirming}
                    activeOpacity={0.7}
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: 12,
                      padding: 4,
                      borderRadius: 12,
                      backgroundColor: theme.background.secondary,
                    }}
                  >
                    <Ionicons name="close-circle" size={20} color={theme.text.tertiary} />
                  </TouchableOpacity>
                )}
              </View>
            </InputContainer>

            <ButtonContainer>
              <Button
                title={t('common.save')}
                onPress={handleSave}
                isLoading={isSaving}
                disabled={isDeleting}
              />

              <Button
                title={t('common.delete')}
                onPress={handleDelete}
                isLoading={isDeleting}
                destructive
                disabled={isSaving}
              />
            </ButtonContainer>
          </Content>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>

      <Modal
        visible={showDatePicker}
        transparent
        animationType="fade"
        onRequestClose={closePickers}
      >
        <ModalOverlay>
          <PickerModal>
            <PickerTitle>{t('history.date')}</PickerTitle>
            <DateTimePicker
              value={selectedDateTime || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              themeVariant={colorScheme === 'dark' ? 'dark' : 'light'}
              textColor={colorScheme === 'dark' ? '#FFFFFF' : '#000000'}
            />
            {Platform.OS === 'ios' && (
              <PickerActions>
                <PickerActionButton onPress={closePickers} activeOpacity={0.7}>
                  <PickerActionText>{t('common.done')}</PickerActionText>
                </PickerActionButton>
              </PickerActions>
            )}
          </PickerModal>
        </ModalOverlay>
      </Modal>

      <Modal
        visible={showTimePicker}
        transparent
        animationType="fade"
        onRequestClose={closePickers}
      >
        <ModalOverlay>
          <PickerModal>
            <PickerTitle>{t('history.hour')}</PickerTitle>
            <DateTimePicker
              value={selectedDateTime || new Date()}
              mode="time"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              is24Hour
              onChange={handleTimeChange}
              themeVariant={colorScheme === 'dark' ? 'dark' : 'light'}
              textColor={colorScheme === 'dark' ? '#FFFFFF' : '#000000'}
            />
            {Platform.OS === 'ios' && (
              <PickerActions>
                <PickerActionButton onPress={closePickers} activeOpacity={0.7}>
                  <PickerActionText>{t('common.done')}</PickerActionText>
                </PickerActionButton>
              </PickerActions>
            )}
          </PickerModal>
        </ModalOverlay>
      </Modal>
    </Container>
  );
}


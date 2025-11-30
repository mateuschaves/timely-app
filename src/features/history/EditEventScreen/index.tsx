import React, { useState, useEffect } from 'react';
import { Alert, Keyboard } from 'react-native';
import { useTranslation } from '@/i18n';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/theme';
import { useQueryClient } from '@tanstack/react-query';
import { updateClockEvent, deleteClockEvent } from '@/api';
import { ClockHistoryEvent } from '@/api/get-clock-history';
import { format, parseISO } from 'date-fns';
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
  ButtonContainer,
  SaveButton,
  SaveButtonText,
  DeleteButton,
  DeleteButtonText,
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
  const { event } = route.params;

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (event.hour) {
      const eventDate = parseISO(event.hour);
      setDate(format(eventDate, 'yyyy-MM-dd'));
      setTime(format(eventDate, 'HH:mm'));
    }
  }, [event.hour]);

  const handleSave = async () => {
    if (!date.trim() || !time.trim()) {
      Alert.alert(t('common.error'), t('history.hourRequired'));
      return;
    }

    try {
      // Combina data e hora
      const dateTimeString = `${date}T${time}:00`;
      const hourDate = new Date(dateTimeString);
      if (isNaN(hourDate.getTime())) {
        Alert.alert(t('common.error'), t('history.invalidHour'));
        return;
      }

      setIsSaving(true);
      Keyboard.dismiss();

      await updateClockEvent(event.id, {
        hour: hourDate.toISOString(),
        ...(event.photoUrl && { photoUrl: event.photoUrl }),
        ...(event.notes && { notes: event.notes }),
      });

      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['clockHistory', 'lastEvent', 'timeClockEntries'] }),
        queryClient.refetchQueries({ queryKey: ['clockHistory', 'lastEvent', 'timeClockEntries'] })
      ]);

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

  return (
    <Container>
      <Header>
        <BackButton onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </BackButton>
        <HeaderTitle>{t('history.editEvent')}</HeaderTitle>
      </Header>
      <Content>
        <InputContainer>
          <InputLabel>{t('history.date')}</InputLabel>
          <Input
            value={date}
            onChangeText={setDate}
            placeholder="2024-07-16"
            placeholderTextColor={colors.text.tertiary}
            editable={!isSaving && !isDeleting}
          />
        </InputContainer>

        <InputContainer>
          <InputLabel>{t('history.hour')}</InputLabel>
          <Input
            value={time}
            onChangeText={setTime}
            placeholder="08:00"
            placeholderTextColor={colors.text.tertiary}
            editable={!isSaving && !isDeleting}
          />
        </InputContainer>

        <ButtonContainer>
          <SaveButton onPress={handleSave} disabled={isSaving || isDeleting} activeOpacity={0.7}>
            <SaveButtonText>
              {isSaving ? t('common.loading') : t('common.save')}
            </SaveButtonText>
          </SaveButton>

          <DeleteButton onPress={handleDelete} disabled={isSaving || isDeleting} activeOpacity={0.7}>
            <DeleteButtonText>
              {isDeleting ? t('common.loading') : t('common.delete')}
            </DeleteButtonText>
          </DeleteButton>
        </ButtonContainer>
      </Content>
    </Container>
  );
}


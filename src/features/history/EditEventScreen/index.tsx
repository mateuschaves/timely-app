import React, { useState, useEffect } from 'react';
import { Alert, Keyboard, View, TouchableOpacity } from 'react-native';
import { useTranslation } from '@/i18n';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/context/ThemeContext';
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
  const { theme, colorScheme } = useTheme();
  const { event } = route.params;

  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (event.hour) {
      const eventDate = parseISO(event.hour);
      setDate(format(eventDate, 'yyyy-MM-dd'));
      setTime(format(eventDate, 'HH:mm'));
    }
    if (event.notes) {
      setNotes(event.notes || '');
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

  return (
    <Container>
      <Header>
        <BackButton onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text.primary} />
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
            placeholderTextColor={theme.text.tertiary}
            editable={!isSaving && !isDeleting}
          />
        </InputContainer>

        <InputContainer>
          <InputLabel>{t('history.hour')}</InputLabel>
          <Input
            value={time}
            onChangeText={setTime}
            placeholder="08:00"
            placeholderTextColor={theme.text.tertiary}
            editable={!isSaving && !isDeleting}
          />
        </InputContainer>

        <InputContainer>
          <InputLabel>{t('history.notes')}</InputLabel>
          <View style={{ position: 'relative' }}>
            <Input
              value={notes}
              onChangeText={setNotes}
              placeholder={t('history.notes')}
              placeholderTextColor={theme.text.tertiary}
              editable={!isSaving && !isDeleting}
              multiline
              numberOfLines={3}
              style={{ minHeight: 80, textAlignVertical: 'top', paddingRight: notes?.length ? 48 : 16 }}
            />
            {!!notes?.length && (
              <TouchableOpacity
                onPress={() => setNotes('')}
                disabled={isSaving || isDeleting}
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


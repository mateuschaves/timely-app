import React, { useState, useEffect, useRef } from 'react';
import { Alert, Keyboard, TextInput } from 'react-native';
import { useTranslation } from '@/i18n';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing } from '@/theme';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateClockEvent, deleteClockEvent } from '@/api';
import { ClockHistoryEvent } from '@/api/get-clock-history';
import { formatTime } from '@/utils/date';
import { parseISO, formatISO } from 'date-fns';
import { useFeedback } from '@/utils/feedback';
import {
  Container,
  Header,
  HeaderTitle,
  BackButton,
  Content,
  InputCard,
  InputLabel,
  TimeInput,
  ActionsContainer,
  SaveButton,
  DeleteButton,
  SaveButtonText,
  DeleteButtonText,
} from './styles';

type EditEventRouteParams = {
  EditEvent: {
    event: ClockHistoryEvent;
  };
};

type EditEventRouteProp = RouteProp<EditEventRouteParams, 'EditEvent'>;

export function EditEventScreen() {
  const { t, i18n } = useTranslation();
  const navigation = useNavigation();
  const route = useRoute<EditEventRouteProp>();
  const queryClient = useQueryClient();
  const { showSuccess } = useFeedback();
  const { event } = route.params;
  const inputRef = useRef<TextInput>(null);
  
  const [time, setTime] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const eventDate = parseISO(event.hour);
    const timeString = formatTime(event.hour, i18n.language);
    setTime(timeString);
    
    const timeout = setTimeout(() => {
      inputRef.current?.focus();
    }, 100);
    return () => clearTimeout(timeout);
  }, [event.hour, i18n.language]);

  const handleTimeChange = (value: string) => {
    const numbers = value.replace(/[^0-9]/g, '');
    
    if (numbers.length === 0) {
      setTime('');
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
    
    setTime(formatted);
  };

  const handleTimeBlur = () => {
    if (!time || time.length < 5) {
      const numbers = time.replace(/[^0-9]/g, '');
      
      if (numbers.length === 0) {
        const eventDate = parseISO(event.hour);
        const timeString = formatTime(event.hour, i18n.language);
        setTime(timeString);
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
      
      setTime(formatted);
    }
  };

  const updateMutation = useMutation({
    mutationFn: (data: { hour: string }) => updateClockEvent(event.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clockHistory'] });
      queryClient.invalidateQueries({ queryKey: ['lastEvent'] });
      showSuccess(t('history.updateEventSuccess'));
      navigation.goBack();
    },
    onError: (error: any) => {
      console.error('Erro ao atualizar evento:', error);
      Alert.alert(
        t('common.error'),
        error.response?.data?.message || t('history.updateEventError')
      );
      setIsSaving(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteClockEvent(event.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clockHistory'] });
      queryClient.invalidateQueries({ queryKey: ['lastEvent'] });
      navigation.goBack();
    },
    onError: (error: any) => {
      console.error('Erro ao deletar evento:', error);
      Alert.alert(
        t('common.error'),
        error.response?.data?.message || t('history.deleteEventError')
      );
      setIsDeleting(false);
    },
  });

  const handleSave = async () => {
    Keyboard.dismiss();
    
    if (!time.trim() || time.length < 5) {
      Alert.alert(t('common.error'), t('history.invalidTime'));
      return;
    }

    const [hours, minutes] = time.split(':').map(Number);
    const eventDate = parseISO(event.hour);
    const newDate = new Date(eventDate);
    newDate.setHours(hours, minutes, 0, 0);
    
    const newHour = formatISO(newDate);
    
    if (newHour === event.hour) {
      navigation.goBack();
      return;
    }

    setIsSaving(true);
    updateMutation.mutate({ hour: newHour });
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
          onPress: () => {
            setIsDeleting(true);
            deleteMutation.mutate();
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
        <InputCard>
          <InputLabel>{t('history.time')}</InputLabel>
          <TimeInput
            ref={inputRef}
            value={time}
            onChangeText={handleTimeChange}
            onBlur={handleTimeBlur}
            placeholder="09:00"
            placeholderTextColor={colors.text.tertiary}
            keyboardType="number-pad"
            maxLength={5}
            editable={!isSaving && !isDeleting}
          />
        </InputCard>
        
        <ActionsContainer>
          <SaveButton
            onPress={handleSave}
            disabled={isSaving || isDeleting}
            activeOpacity={0.7}
          >
            <SaveButtonText>
              {isSaving ? t('common.loading') : t('common.save')}
            </SaveButtonText>
          </SaveButton>
          
          <DeleteButton
            onPress={handleDelete}
            disabled={isSaving || isDeleting}
            activeOpacity={0.7}
          >
            <DeleteButtonText>
              {isDeleting ? t('common.loading') : t('common.delete')}
            </DeleteButtonText>
          </DeleteButton>
        </ActionsContainer>
      </Content>
    </Container>
  );
}


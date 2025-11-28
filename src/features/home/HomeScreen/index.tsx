import React, { useEffect, useRef, useMemo, useState } from 'react';
import { Animated, Easing, Modal } from 'react-native';
import { useTranslation } from '@/i18n';
import { useAuthContext } from '@/features/auth';
import { useTimeClock } from '@/features/time-clock/hooks/useTimeClock';
import { useLocation } from '@/features/time-clock/hooks/useLocation';
import { useLastEvent } from '../hooks/useLastEvent';
import { useQueryClient } from '@tanstack/react-query';
import { colors, spacing } from '@/theme';
import { Container, WelcomeCard, WelcomeMessage, StatusCard, LastEventInfo, LastEventTime, ButtonContainer, ClockButton, ClockButtonInner, ClockButtonText, ConfirmModal, ConfirmModalContent, ConfirmModalTitle, ConfirmModalMessage, ConfirmModalActions, ConfirmButton, CancelButton, ConfirmButtonText, CancelButtonText } from './styles';


export function HomeScreen() {
  const { t, i18n } = useTranslation();
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const { clock, isClocking } = useTimeClock();
  const { lastEvent, nextAction, isLoading: isLoadingLastEvent } = useLastEvent();
  const { requestLocationPermission } = useLocation();
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingClockAction, setPendingClockAction] = useState<string | null>(null);

  const buttonText = useMemo(() => {
    if (isClocking) return t('home.clocking');

    if (nextAction === 'clock-out') {
      return t('home.clockOutButton');
    }
    return t('home.clockInButton');
  }, [nextAction, isClocking, t]);

  const statusMessage = useMemo(() => {
    const userName = user?.name?.split(' ')[0] || '';

    if (nextAction === 'clock-out') {
      if (userName) {
        return t('home.breakMessageWithName', { name: userName });
      }
      return t('home.breakMessage');
    }

    if (userName) {
      return t('home.welcomeMessageWithName', { name: userName });
    }
    return t('home.welcomeMessage');
  }, [nextAction, user?.name, t]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '--:--';
    return date.toLocaleTimeString(
      i18n.language === 'pt-BR' ? 'pt-BR' : 'en-US',
      { hour: '2-digit', minute: '2-digit' }
    );
  };

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();

    return () => pulse.stop();
  }, [pulseAnim]);

  const handlePress = () => {
    if (isClocking) return;

    const now = new Date().toISOString();
    setPendingClockAction(now);
    setShowConfirmModal(true);
  };

  const handleClock = async () => {
    if (!pendingClockAction) return;

    const now = pendingClockAction;
    setShowConfirmModal(false);
    setPendingClockAction(null);

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      await requestLocationPermission();
      await clock({
        hour: now,
      }, nextAction as 'clock-in' | 'clock-out');
      
      // Refetch imediato para atualizar o botão instantaneamente
      await queryClient.refetchQueries({ queryKey: ['lastEvent'] });
    } catch (error: any) {
      console.error('Erro ao processar ponto:', error);
      throw error;
    }
  };

  const handleCancelConfirm = () => {
    setShowConfirmModal(false);
    setPendingClockAction(null);
  };

  const getConfirmMessage = () => {
    const currentTime = new Date().toLocaleTimeString(
      i18n.language === 'pt-BR' ? 'pt-BR' : 'en-US',
      { hour: '2-digit', minute: '2-digit' }
    );

    if (nextAction === 'clock-out') {
      return t('home.confirmClockOut', { time: currentTime });
    }
    return t('home.confirmClockIn', { time: currentTime });
  };


  return (
    <Container>
      {!isLoadingLastEvent && (
        <WelcomeCard style={{ position: 'absolute', top: spacing.xl + 20, width: '100%', marginHorizontal: spacing.lg }}>
          <WelcomeMessage>{statusMessage}</WelcomeMessage>
          {lastEvent && (
            <LastEventInfo>
              {lastEvent.action === 'clock-in' ? t('home.lastEntry') : t('home.lastExit')}:{' '}
              <LastEventTime>{formatTime(lastEvent.hour)}</LastEventTime>
            </LastEventInfo>
          )}
        </WelcomeCard>
      )}

      <ButtonContainer>
        <Animated.View
          style={{
            transform: [{ scale: scaleAnim }],
          }}
        >
          <ClockButton
            onPress={handlePress}
            disabled={isClocking}
            activeOpacity={0.8}
          >
            <Animated.View
              style={{
                position: 'absolute',
                width: '100%',
                height: '100%',
                borderRadius: 9999,
                borderWidth: 2,
                borderColor: colors.primary,
                opacity: pulseAnim.interpolate({
                  inputRange: [1, 1.2],
                  outputRange: [0.3, 0],
                }),
                transform: [{ scale: pulseAnim }],
              }}
            />
            <ClockButtonInner>
              <ClockButtonText>{buttonText}</ClockButtonText>
            </ClockButtonInner>
          </ClockButton>
        </Animated.View>
      </ButtonContainer>

      <Modal
        visible={showConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={handleCancelConfirm}
      >
        <ConfirmModal>
          <ConfirmModalContent>
            <ConfirmModalTitle>
              {nextAction === 'clock-out' ? t('home.confirmClockOutTitle') : t('home.confirmClockInTitle')}
            </ConfirmModalTitle>
            <ConfirmModalMessage>
              {getConfirmMessage()}
            </ConfirmModalMessage>
            <ConfirmModalActions>
              <CancelButton onPress={handleCancelConfirm} style={{ marginRight: spacing.sm }}>
                <CancelButtonText>{t('common.cancel')}</CancelButtonText>
              </CancelButton>
              <ConfirmButton onPress={handleClock} disabled={isClocking}>
                <ConfirmButtonText>{t('common.confirm')}</ConfirmButtonText>
              </ConfirmButton>
            </ConfirmModalActions>
          </ConfirmModalContent>
        </ConfirmModal>
      </Modal>
    </Container>
  );
}

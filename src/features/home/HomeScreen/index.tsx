import React, { useEffect, useRef, useMemo, useState } from 'react';
import { Animated, Easing, Modal, Platform, View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from '@/i18n';
import { useAuthContext } from '@/features/auth';
import { useTimeClock } from '@/features/time-clock/hooks/useTimeClock';
import { useLocation } from '@/features/time-clock/hooks/useLocation';
import { useLastEvent } from '../hooks/useLastEvent';
import { useQueryClient } from '@tanstack/react-query';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useFeedback } from '@/utils/feedback';
import { useWorkSettings } from '@/features/profile';
import { LocationCoordinates, ClockAction } from '@/api/types';
import { colors, spacing } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { Container, WelcomeCard, WelcomeMessage, LastEventInfo, LastEventTime, ButtonContainer, ClockButton, ClockButtonInner, ClockButtonText, ClockButtonLoadingContainer, ConfirmModal, ConfirmModalContent, ConfirmModalTitle, ConfirmModalMessage, ConfirmModalActions, ConfirmButton, CancelButton, ConfirmButtonText, CancelButtonText, WorkSettingsCard, WorkSettingsCardContent, WorkSettingsCardIcon, WorkSettingsCardMessage } from './styles';


export function HomeScreen() {
  const { t, i18n } = useTranslation();
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { showError } = useFeedback();
  const { clock, isClocking } = useTimeClock();
  const { lastEvent, nextAction, isLoading: isLoadingLastEvent } = useLastEvent();
  const { requestLocationPermission } = useLocation();
  const { hasWorkSettings, canShowCard } = useWorkSettings();
  const [isProcessing, setIsProcessing] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [pendingClockAction, setPendingClockAction] = useState<string | null>(null);

  const buttonText = useMemo(() => {
    if (isClocking) return t('home.clocking');

    if (nextAction === ClockAction.CLOCK_OUT) {
      return t('home.clockOutButton');
    }
    return t('home.clockInButton');
  }, [nextAction, isClocking, t]);

  const statusMessage = useMemo(() => {
    const userName = user?.name?.split(' ')[0] || '';

    if (nextAction === ClockAction.CLOCK_OUT) {
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

  // Estado para controlar a cor da StatusBar
  const [statusBarColor, setStatusBarColor] = useState<string>(colors.background.secondary);

  // Configurar StatusBar para corresponder ao background do WelcomeCard
  useFocusEffect(
    React.useCallback(() => {
      setStatusBarColor(colors.background.secondary);

      return () => {
        // Restaurar StatusBar padrão ao sair da tela
        setStatusBarColor(colors.background.primary);
      };
    }, [])
  );

  const handlePress = () => {
    if (isClocking) return;

    const now = new Date().toISOString();
    setPendingClockAction(now);
    setShowConfirmModal(true);
  };

  const handleClock = async () => {
    if (!pendingClockAction || isProcessing) return;

    const now = pendingClockAction;
    setShowConfirmModal(false);
    setPendingClockAction(null);
    setIsProcessing(true);

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
      // Solicitar permissão de localização e obter coordenadas (opcional)
      // Se falhar, permite continuar sem localização já que a API aceita
      console.log('Solicitando permissão de localização...');
      let location: LocationCoordinates | null = null;

      try {
        // Timeout reduzido para 6 segundos (já que useLocation tem timeout de 5s)
        const locationPromise = requestLocationPermission();
        const timeoutPromise = new Promise<null>((resolve) => {
          setTimeout(() => {
            console.log('Timeout ao obter localização, continuando sem localização');
            resolve(null);
          }, 6000); // 6 segundos de timeout (maior que o timeout interno de 5s)
        });

        location = await Promise.race([locationPromise, timeoutPromise]);
        console.log('Localização obtida:', location ? 'Sim' : 'Não');
      } catch (locationError: any) {
        console.warn('Erro ao obter localização, continuando sem localização:', locationError);
        // Continua sem localização
      }

      // Se a localização não foi obtida, apenas avisa mas continua
      if (!location) {
        console.log('Continuando sem localização (opcional na API)');
      }

      console.log('Fazendo clock...', location ? 'com localização' : 'sem localização');
      await clock({
        hour: now,
      }, nextAction);

      console.log('Clock realizado com sucesso');
      // Refetch imediato para atualizar o botão instantaneamente
      await queryClient.refetchQueries({ queryKey: ['lastEvent'] });
    } catch (error: any) {
      console.error('Erro ao processar ponto:', error);
      console.error('Detalhes do erro:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });

      // Mostrar erro ao usuário
      const errorMessage = error.response?.data?.message || error.message || (nextAction === ClockAction.CLOCK_OUT ? t('home.clockOutError') : t('home.clockInError')) || 'Erro ao processar ponto. Tente novamente.';
      showError(errorMessage);
    } finally {
      setIsProcessing(false);
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

    if (nextAction === ClockAction.CLOCK_OUT) {
      return t('home.confirmClockOut', { time: currentTime });
    }
    return t('home.confirmClockIn', { time: currentTime });
  };


  return (
    <Container>
      <StatusBar style="dark" backgroundColor={statusBarColor} />
      {Platform.OS === 'ios' && (
        <View
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: insets.top,
            backgroundColor: statusBarColor,
            zIndex: 1000,
          }}
        />
      )}
      {!isLoadingLastEvent && (
        <WelcomeCard style={{ position: 'absolute', top: spacing.xl + 20, width: '100%', marginHorizontal: spacing.lg }}>
          <WelcomeMessage>{statusMessage}</WelcomeMessage>
          {lastEvent && (
            <LastEventInfo>
              {lastEvent.action === ClockAction.CLOCK_IN ? t('home.lastEntry') : t('home.lastExit')}:{' '}
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
            disabled={isClocking || isProcessing}
            activeOpacity={0.8}
            style={{ opacity: (isClocking || isProcessing) ? 0.7 : 1 }}
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
              {isClocking || isProcessing ? (
                <ClockButtonLoadingContainer>
                  <ActivityIndicator size="large" color={colors.text.inverse} />
                </ClockButtonLoadingContainer>
              ) : (
                <ClockButtonText>{buttonText}</ClockButtonText>
              )}
            </ClockButtonInner>
            {(isClocking || isProcessing) && (
              <Animated.View
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  borderRadius: 9999,
                  zIndex: 1,
                }}
              />
            )}
          </ClockButton>
        </Animated.View>
      </ButtonContainer>

      {canShowCard && !hasWorkSettings && (
        <View style={{
          position: 'absolute',
          bottom: insets.bottom + 85,
          left: 0,
          right: 0,
          alignItems: 'center',
          paddingHorizontal: spacing.lg,
        }}>
          <WorkSettingsCard
            onPress={() => navigation.navigate('WorkSettings')}
            activeOpacity={0.7}
          >
            <WorkSettingsCardContent>
              <WorkSettingsCardIcon>
                <Ionicons name="alert-circle" size={20} color="#FF8C00" />
              </WorkSettingsCardIcon>
              <WorkSettingsCardMessage>{t('home.workSettingsNotConfiguredHint')}</WorkSettingsCardMessage>
            </WorkSettingsCardContent>
          </WorkSettingsCard>
        </View>
      )}

      <Modal
        visible={showConfirmModal}
        transparent
        animationType="fade"
        onRequestClose={handleCancelConfirm}
      >
        <ConfirmModal>
          <ConfirmModalContent>
            <ConfirmModalTitle>
              {nextAction === ClockAction.CLOCK_OUT ? t('home.confirmClockOutTitle') : t('home.confirmClockInTitle')}
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

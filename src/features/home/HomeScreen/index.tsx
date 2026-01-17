import React, { useEffect, useRef, useMemo, useState, useCallback } from 'react';
import { Animated, Easing, Modal, Platform, View, ActivityIndicator } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from '@/i18n';
import { useAuthContext } from '@/features/auth';
import { useTimeClock } from '@/features/time-clock/hooks/useTimeClock';
import { useLocation } from '@/features/time-clock/hooks/useLocation';
import { useLiveActivity } from '@/features/time-clock/hooks/useLiveActivity';
import { useLastEvent } from '../hooks/useLastEvent';
import { useQueryClient } from '@tanstack/react-query';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { useFeedback } from '@/utils/feedback';
import { useWorkSettings, useHourlyRate } from '@/features/profile';
import { LocationCoordinates, ClockAction } from '@/api/types';
import { useTheme } from '@/theme/context/ThemeContext';
import { spacing } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { getForegroundPermissionsAsync } from 'expo-location';
import { Container, WelcomeCard, WelcomeMessage, LastEventInfo, LastEventTime, ButtonContainer, ClockButton, ClockButtonInner, ClockButtonText, ClockButtonLoadingContainer, ConfirmModal, ConfirmModalContent, ConfirmModalTitle, ConfirmModalMessage, ConfirmModalActions, ConfirmButton, CancelButton, ConfirmButtonText, CancelButtonText, WorkSettingsCard, WorkSettingsCardContent, WorkSettingsCardIcon, WorkSettingsCardMessage, WorkSettingsCardCloseButton } from './styles';


export function HomeScreen() {
  const { t, i18n } = useTranslation();
  const { user } = useAuthContext();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const navigation = useNavigation<any>();
  const { showError } = useFeedback();
  const { theme, colorScheme } = useTheme();
  const { clock, isClocking } = useTimeClock();
  const { lastEvent, nextAction, isLoading: isLoadingLastEvent } = useLastEvent();
  const { requestLocationPermission } = useLocation();
  const { startWorkSessionActivity, stopWorkSessionActivity } = useLiveActivity();
  const { hasWorkSettings, canShowCard } = useWorkSettings();
  const { hasHourlyRate, canShowCard: canShowHourlyRateCard } = useHourlyRate();
  const [hasLocationPermission, setHasLocationPermission] = useState<boolean | null>(null);
  const [isCheckingLocation, setIsCheckingLocation] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [closedWarnings, setClosedWarnings] = useState<Set<string>>(new Set());
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

  // Verificar permissão de localização ao carregar
  useEffect(() => {
    const checkLocationPermission = async () => {
      try {
        const { status } = await getForegroundPermissionsAsync();
        setHasLocationPermission(status === 'granted');
      } catch (error) {
        console.error('Erro ao verificar permissão de localização:', error);
        setHasLocationPermission(false);
      } finally {
        setIsCheckingLocation(false);
      }
    };

    checkLocationPermission();
  }, []);

  // Verificar novamente quando a tela recebe foco
  useFocusEffect(
    useCallback(() => {
      const checkLocationPermission = async () => {
        try {
          const { status } = await getForegroundPermissionsAsync();
          setHasLocationPermission(status === 'granted');
        } catch (error) {
          console.error('Erro ao verificar permissão de localização:', error);
          setHasLocationPermission(false);
        } finally {
          setIsCheckingLocation(false);
        }
      };

      checkLocationPermission();

      // Refazer queries de userSettings quando a tela recebe foco para atualizar os hints
      queryClient.invalidateQueries({ queryKey: ['userSettings'] });
    }, [queryClient])
  );

  // Manage Live Activity based on current user state (clocked in or not)
  useEffect(() => {
    const manageLiveActivity = async () => {
      if (Platform.OS !== 'ios' || isLoadingLastEvent) return;

      // If the last event was a clock-in (nextAction is clock-out), it means user is working
      if (lastEvent && nextAction === ClockAction.CLOCK_OUT) {
        // User is working - ensure Live Activity is active
        const entryTime = new Date(lastEvent.hour);
        await startWorkSessionActivity(entryTime);
        console.log('Live Activity restored/started for active session');
      } else {
        // User is not working - ensure Live Activity is inactive
        await stopWorkSessionActivity();
        console.log('Live Activity stopped - no active session');
      }
    };

    manageLiveActivity();
  }, [lastEvent, nextAction, isLoadingLastEvent, startWorkSessionActivity, stopWorkSessionActivity]);


  const handleRequestLocationPermission = async () => {
    setIsCheckingLocation(true);
    try {
      await requestLocationPermission();
      const { status } = await getForegroundPermissionsAsync();
      setHasLocationPermission(status === 'granted');
    } catch (error) {
      console.error('Erro ao solicitar permissão de localização:', error);
      setHasLocationPermission(false);
    } finally {
      setIsCheckingLocation(false);
    }
  };

  // Determinar a cor e o estilo da StatusBar baseado no tema
  // A cor deve ser igual ao background.secondary (mesma do WelcomeCard) para continuidade visual
  // Tema claro: #f5f5f5 (cinza claro), Tema escuro: #1e1e1e (cinza escuro)
  const statusBarColor = useMemo(() => theme.background.secondary, [theme.background.secondary]);
  
  // No modo escuro (background escuro #1e1e1e), usa 'light' (texto claro)
  // No modo claro (background claro #f5f5f5), usa 'dark' (texto escuro)
  const statusBarStyle = useMemo(() => {
    return colorScheme === 'dark' ? 'light' : 'dark';
  }, [colorScheme]);

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
      
      // Manage Live Activity based on action
      if (Platform.OS === 'ios') {
        if (nextAction === ClockAction.CLOCK_IN) {
          // Started work - start Live Activity
          const entryTime = new Date(now);
          await startWorkSessionActivity(entryTime);
          console.log('Live Activity started for entry:', now);
        } else if (nextAction === ClockAction.CLOCK_OUT) {
          // Exited work - stop Live Activity
          await stopWorkSessionActivity();
          console.log('Live Activity ended for exit');
        }
      }
      
      // As queries já são invalidadas e refeitas pelo useTimeClock hook
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
      <StatusBar style={statusBarStyle} backgroundColor={statusBarColor} />
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
                borderColor: colorScheme === 'dark' ? '#2a2a2a' : theme.primary,
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
                  <ActivityIndicator size="large" color={colorScheme === 'dark' ? theme.text.primary : theme.text.inverse} />
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

      {/* Avisos empilhados */}
      {(() => {
        const showLocation = !isCheckingLocation && hasLocationPermission === false && !closedWarnings.has('location');
        const showHourlyRate = canShowHourlyRateCard && !hasHourlyRate && !closedWarnings.has('hourlyRate');
        const showWorkSettings = canShowCard && !hasWorkSettings && !closedWarnings.has('workSettings');

        if (!showLocation && !showHourlyRate && !showWorkSettings) {
          return null;
        }

        let baseOffset = insets.bottom + 10;
        const locationOffset = baseOffset;
        const hourlyRateOffset = baseOffset + (showLocation ? 90 : 0);
        const workSettingsOffset = baseOffset + (showLocation ? 90 : 0) + (showHourlyRate ? 90 : 0);

        const handleCloseWarning = (warningId: string) => {
          setClosedWarnings(prev => new Set(prev).add(warningId));
        };

        return (
          <>
            {showLocation && (
              <View style={{
                position: 'absolute',
                bottom: locationOffset,
                left: 0,
                right: 0,
                alignItems: 'center',
                paddingHorizontal: spacing.lg,
              }}>
                <WorkSettingsCard
                  onPress={handleRequestLocationPermission}
                  activeOpacity={0.7}
                  disabled={isCheckingLocation}
                >
                  <WorkSettingsCardContent>
                    <WorkSettingsCardIcon>
                      <Ionicons name="location-outline" size={20} color="#FF8C00" />
                    </WorkSettingsCardIcon>
                    <WorkSettingsCardMessage>{t('home.locationPermissionRequired')}</WorkSettingsCardMessage>
                    <WorkSettingsCardCloseButton
                      onPress={() => handleCloseWarning('location')}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="close" size={18} color="#8B6914" />
                    </WorkSettingsCardCloseButton>
                  </WorkSettingsCardContent>
                </WorkSettingsCard>
              </View>
            )}
            {showHourlyRate && (
              <View style={{
                position: 'absolute',
                bottom: hourlyRateOffset,
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
                      <Ionicons name="cash-outline" size={20} color="#FF8C00" />
                    </WorkSettingsCardIcon>
                    <WorkSettingsCardMessage>{t('home.hourlyRateNotConfigured')}</WorkSettingsCardMessage>
                    <WorkSettingsCardCloseButton
                      onPress={() => handleCloseWarning('hourlyRate')}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="close" size={18} color="#8B6914" />
                    </WorkSettingsCardCloseButton>
                  </WorkSettingsCardContent>
                </WorkSettingsCard>
              </View>
            )}
            {showWorkSettings && (
              <View style={{
                position: 'absolute',
                bottom: workSettingsOffset,
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
                    <WorkSettingsCardCloseButton
                      onPress={() => handleCloseWarning('workSettings')}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="close" size={18} color="#8B6914" />
                    </WorkSettingsCardCloseButton>
                  </WorkSettingsCardContent>
                </WorkSettingsCard>
              </View>
            )}
          </>
        );
      })()}

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

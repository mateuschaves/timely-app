import React, { useState, useCallback } from 'react';
import { Alert, ActivityIndicator, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/context/ThemeContext';
import { useGeofencing } from '@/features/time-clock/hooks/useGeofencing';
import { useLocation } from '@/features/time-clock/hooks/useLocation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUserSettings, WorkLocation } from '@/api/update-user-settings';
import { useFeedback } from '@/utils/feedback';
import {
  Container,
  Content,
  Header,
  HeaderTitle,
  BackButton,
  Section,
  SectionTitle,
  SectionDescription,
  Card,
  Row,
  Label,
  Value,
  Button,
  ButtonText,
  StatusBadge,
  StatusText,
  WarningBox,
  WarningText,
  LocationInfo,
  CoordinatesText,
} from './styles';

export function WorkplaceLocationScreen() {
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { showSuccess, showError } = useFeedback();
  const queryClient = useQueryClient();
  
  const {
    isAvailable,
    isMonitoring,
    hasPermission,
    startMonitoring,
    stopMonitoring,
    requestPermission,
    workplaceLocation,
  } = useGeofencing();
  
  const { requestLocationPermission, isLoading: isLoadingLocation } = useLocation();
  
  const [isSetting, setIsSetting] = useState(false);

  const updateSettingsMutation = useMutation({
    mutationFn: updateUserSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userSettings'] });
      showSuccess('Localização do trabalho salva com sucesso!');
    },
    onError: (error: any) => {
      showError(error.message || 'Erro ao salvar localização');
    },
  });

  const handleSetCurrentLocation = useCallback(async () => {
    setIsSetting(true);
    try {
      // Request location permission
      const location = await requestLocationPermission();
      
      if (!location) {
        Alert.alert(
          'Permissão necessária',
          'Precisamos da permissão de localização para definir o local de trabalho.'
        );
        return;
      }

      // Save workplace location
      await updateSettingsMutation.mutateAsync({
        workLocation: location,
      });

      // Request always permission for geofencing
      const permissionGranted = await requestPermission();
      
      if (permissionGranted) {
        // Start monitoring
        await startMonitoring();
      } else {
        Alert.alert(
          'Permissão adicional necessária',
          'Para detectar automaticamente quando você chega ao trabalho com o app fechado, precisamos da permissão "Sempre" de localização. Você pode habilitar isso nas configurações do dispositivo.',
          [
            { text: 'Agora não', style: 'cancel' },
            { 
              text: 'Abrir Configurações', 
              onPress: () => {
                if (Platform.OS === 'ios') {
                  // Open iOS settings
                  // Linking.openURL('app-settings:');
                }
              }
            },
          ]
        );
      }
    } catch (error) {
      console.error('Error setting workplace location:', error);
      showError('Erro ao definir localização do trabalho');
    } finally {
      setIsSetting(false);
    }
  }, [requestLocationPermission, updateSettingsMutation, requestPermission, startMonitoring, showError]);

  const handleToggleMonitoring = useCallback(async () => {
    if (isMonitoring) {
      stopMonitoring();
      showSuccess('Detecção automática desativada');
    } else {
      if (!hasPermission) {
        const granted = await requestPermission();
        if (!granted) {
          Alert.alert(
            'Permissão necessária',
            'Precisamos da permissão "Sempre" de localização para detectar quando você chega ao trabalho com o app fechado.'
          );
          return;
        }
      }
      
      const success = await startMonitoring();
      if (success) {
        showSuccess('Detecção automática ativada');
      } else {
        showError('Erro ao ativar detecção automática');
      }
    }
  }, [isMonitoring, hasPermission, requestPermission, startMonitoring, stopMonitoring, showSuccess, showError]);

  if (!isAvailable) {
    return (
      <Container>
        <Header>
          <BackButton onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
          </BackButton>
          <HeaderTitle>Localização do Trabalho</HeaderTitle>
        </Header>
        <Content>
          <WarningBox>
            <Ionicons name="information-circle" size={24} color={theme.colors.warning} />
            <WarningText>
              Detecção automática de chegada ao trabalho não está disponível neste dispositivo. 
              Este recurso requer iOS.
            </WarningText>
          </WarningBox>
        </Content>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <BackButton onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </BackButton>
        <HeaderTitle>Localização do Trabalho</HeaderTitle>
      </Header>
      
      <Content>
        <Section>
          <SectionTitle>Detecção Automática</SectionTitle>
          <SectionDescription>
            Configure o local de trabalho para ser notificado automaticamente quando chegar ou sair, 
            mesmo com o aplicativo fechado.
          </SectionDescription>

          <Card>
            <Row>
              <Label>Status</Label>
              <StatusBadge active={isMonitoring}>
                <StatusText active={isMonitoring}>
                  {isMonitoring ? 'Ativo' : 'Inativo'}
                </StatusText>
              </StatusBadge>
            </Row>

            {workplaceLocation && (
              <>
                <Row style={{ marginTop: 16 }}>
                  <Label>Localização Salva</Label>
                  <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
                </Row>
                <LocationInfo>
                  <CoordinatesText>
                    Lat: {workplaceLocation.coordinates[1].toFixed(6)}{'\n'}
                    Lon: {workplaceLocation.coordinates[0].toFixed(6)}
                  </CoordinatesText>
                </LocationInfo>
              </>
            )}

            {!workplaceLocation && (
              <WarningBox style={{ marginTop: 16 }}>
                <Ionicons name="alert-circle" size={20} color={theme.colors.warning} />
                <WarningText>
                  Nenhuma localização configurada. Defina a localização do trabalho para ativar a detecção automática.
                </WarningText>
              </WarningBox>
            )}
          </Card>

          {!workplaceLocation ? (
            <Button onPress={handleSetCurrentLocation} disabled={isSetting || isLoadingLocation}>
              {isSetting || isLoadingLocation ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <>
                  <ButtonText>Usar Localização Atual</ButtonText>
                </>
              )}
            </Button>
          ) : (
            <>
              <Button onPress={handleToggleMonitoring}>
                <ButtonText>
                  {isMonitoring ? 'Desativar Detecção' : 'Ativar Detecção'}
                </ButtonText>
              </Button>

              <Button variant="secondary" onPress={handleSetCurrentLocation} disabled={isSetting || isLoadingLocation}>
                {isSetting || isLoadingLocation ? (
                  <ActivityIndicator color={theme.colors.text} />
                ) : (
                  <ButtonText variant="secondary">Atualizar Localização</ButtonText>
                )}
              </Button>
            </>
          )}
        </Section>

        <Section>
          <SectionTitle>Como Funciona</SectionTitle>
          <Card>
            <SectionDescription>
              1. Defina a localização do seu trabalho{'\n'}
              2. Ative a detecção automática{'\n'}
              3. Quando você chegar ou sair do trabalho, receberá uma notificação para registrar o ponto{'\n'}
              4. Toque na notificação para confirmar e registrar{'\n\n'}
              ⚠️ Para funcionar com o app fechado, é necessário conceder permissão "Sempre" de localização.
            </SectionDescription>
          </Card>
        </Section>

        {!hasPermission && workplaceLocation && (
          <WarningBox>
            <Ionicons name="alert-circle" size={24} color={theme.colors.warning} />
            <WarningText>
              Permissão "Sempre" de localização não concedida. A detecção automática não funcionará com o app fechado. 
              Habilite nas configurações do dispositivo.
            </WarningText>
          </WarningBox>
        )}
      </Content>
    </Container>
  );
}

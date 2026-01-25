import React, { useState, useCallback, useEffect } from 'react';
import { Alert, ActivityIndicator, Platform, Linking, Modal, View, StyleSheet, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/context/ThemeContext';
import { useGeofencing } from '@/features/time-clock/hooks/useGeofencing';
import { useLocation } from '@/features/time-clock/hooks/useLocation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUserSettings, WorkLocation } from '@/api/update-user-settings';
import { useFeedback } from '@/utils/feedback';
import { useTranslation } from '@/i18n';
import { MapLocationPicker } from './MapLocationPicker';
import { LocationCoordinates } from '@/api/types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '@/config/storage';
import { MapPreview } from './MapPreview';
import { spacing } from '@/theme';
import { Button } from '@/components/Button';
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
  const { t } = useTranslation();

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
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationCoordinates | null>(null);
  const [selectedRadius, setSelectedRadius] = useState<number>(100);
  const [storedRadius, setStoredRadius] = useState<number | null>(null);

  // Load stored radius on mount
  useEffect(() => {
    const loadRadius = async () => {
      try {
        const radius = await AsyncStorage.getItem(STORAGE_KEYS.WORKPLACE_RADIUS);
        if (radius) {
          const radiusValue = parseInt(radius, 10);
          setStoredRadius(radiusValue);
          setSelectedRadius(radiusValue);
        }
      } catch (error) {
        console.error('Error loading radius:', error);
      }
    };
    loadRadius();
  }, []);

  const updateSettingsMutation = useMutation({
    mutationFn: updateUserSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userSettings'] });
      showSuccess(t('profile.workplaceLocationSaved'));
    },
    onError: (error: any) => {
      showError(error.message || t('profile.workplaceLocationError'));
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

      // Save workplace location (without radius - API doesn't store it)
      await updateSettingsMutation.mutateAsync({
        workLocation: location,
      });

      // Save radius locally for native geofencing
      await AsyncStorage.setItem(STORAGE_KEYS.WORKPLACE_RADIUS, '100');
      setStoredRadius(100);

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
                  Linking.openURL('app-settings:');
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

  const handleMapLocationChange = useCallback((location: LocationCoordinates, radius: number) => {
    setSelectedLocation(location);
    setSelectedRadius(radius);
  }, []);

  const handleSaveMapLocation = useCallback(async () => {
    if (!selectedLocation) return;

    setIsSetting(true);
    try {
      // Save workplace location (without radius - API doesn't store it)
      await updateSettingsMutation.mutateAsync({
        workLocation: selectedLocation,
      });

      // Save radius locally for native geofencing
      await AsyncStorage.setItem(STORAGE_KEYS.WORKPLACE_RADIUS, selectedRadius.toString());
      setStoredRadius(selectedRadius);

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
                  Linking.openURL('app-settings:');
                }
              }
            },
          ]
        );
      }

      setShowMapPicker(false);
    } catch (error) {
      console.error('Error saving workplace location:', error);
      showError('Erro ao salvar localização do trabalho');
    } finally {
      setIsSetting(false);
    }
  }, [selectedLocation, selectedRadius, updateSettingsMutation, requestPermission, startMonitoring, showError]);

  const handleToggleMonitoring = useCallback(async () => {
    if (isMonitoring) {
      stopMonitoring();
      showSuccess(t('profile.geofenceDeactivated'));
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
        showSuccess(t('profile.geofenceActivated'));
      } else {
        showError(t('profile.geofenceActivationError'));
      }
    }
  }, [isMonitoring, hasPermission, requestPermission, startMonitoring, stopMonitoring, showSuccess, showError, t]);

  if (!isAvailable) {
    return (
      <Container>
        <Header>
          <BackButton onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.text.primary} />
          </BackButton>
          <HeaderTitle>Localização do Trabalho</HeaderTitle>
        </Header>
        <Content>
          <WarningBox>
            <Ionicons name="information-circle" size={24} color={theme.status.warning} />
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
          <Ionicons name="arrow-back" size={24} color={theme.text.primary} />
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
                  <Ionicons name="checkmark-circle" size={20} color={theme.status.success} />
                </Row>
                <MapPreview
                  location={workplaceLocation}
                  radius={storedRadius || undefined}
                />
                {storedRadius && (
                  <View style={{ marginTop: spacing.sm }}>
                    <Text style={[styles.radiusText, { color: theme.text.secondary }]}>
                      Raio de detecção: {storedRadius}m
                    </Text>
                  </View>
                )}
              </>
            )}

            {!workplaceLocation && (
              <WarningBox style={{ marginTop: 16 }}>
                <Ionicons name="alert-circle" size={20} color={theme.status.warning} />
                <WarningText>
                  Nenhuma localização configurada. Defina a localização do trabalho para ativar a detecção automática.
                </WarningText>
              </WarningBox>
            )}
          </Card>

          {!workplaceLocation ? (
            <Button
              title="Usar Localização Atual"
              onPress={handleSetCurrentLocation}
              disabled={isSetting || isLoadingLocation}
              isLoading={isSetting || isLoadingLocation}
            />
          ) : (
            <>
              <Button
                title={isMonitoring ? 'Desativar Detecção' : 'Ativar Detecção'}
                onPress={handleToggleMonitoring}
              />

              <Button
                title="Atualizar Localização"
                variant="secondary"
                onPress={handleSetCurrentLocation}
                disabled={isSetting || isLoadingLocation}
                isLoading={isSetting || isLoadingLocation}
              />
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
            <Ionicons name="alert-circle" size={24} color={theme.status.warning} />
            <WarningText>
              Permissão "Sempre" de localização não concedida. A detecção automática não funcionará com o app fechado.
              Habilite nas configurações do dispositivo.
            </WarningText>
          </WarningBox>
        )}
      </Content>

      <Modal
        visible={showMapPicker}
        animationType="slide"
        presentationStyle="fullScreen"
        onRequestClose={() => setShowMapPicker(false)}
      >
        <MapLocationPicker
          initialLocation={workplaceLocation || undefined}
          initialRadius={storedRadius || 100}
          onLocationChange={handleMapLocationChange}
          onClose={async () => {
            setShowMapPicker(false);
            if (selectedLocation) {
              await handleSaveMapLocation();
            }
          }}
        />
      </Modal>
    </Container>
  );
}

const styles = StyleSheet.create({
  radiusText: {
    fontSize: 12,
    textAlign: 'center',
  },
});

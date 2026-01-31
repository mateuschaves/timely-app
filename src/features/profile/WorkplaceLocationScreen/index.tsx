import React, { useState, useCallback, useEffect } from 'react';
import { Alert, ActivityIndicator, Platform, Linking, Modal, View, StyleSheet, Text, Switch } from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AppStackParamList } from '@/navigation/AppNavigator';
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
import { usePremiumFeatures } from '@/features/subscriptions';
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
  const navigation = useNavigation<NativeStackNavigationProp<AppStackParamList>>();
  const { theme } = useTheme();
  const { showSuccess, showError } = useFeedback();
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const { hasGeofencing } = usePremiumFeatures();

  const {
    isAvailable,
    isMonitoring,
    hasPermission,
    hasPremiumAccess,
    startMonitoring,
    stopMonitoring,
    requestPermission,
    refreshStatus,
    workplaceLocation,
  } = useGeofencing();

  const { requestLocationPermission, isLoading: isLoadingLocation } = useLocation();

  const [isSetting, setIsSetting] = useState(false);
  const [showMapPicker, setShowMapPicker] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationCoordinates | null>(null);
  const [selectedRadius, setSelectedRadius] = useState<number>(100);
  const [storedRadius, setStoredRadius] = useState<number | null>(null);

  useFocusEffect(
    useCallback(() => {
      refreshStatus();
    }, [refreshStatus])
  );

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
          t('profile.permissionRequired'),
          t('profile.locationPermissionRequired')
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
          t('profile.additionalPermissionRequired'),
          t('profile.alwaysLocationPermissionForBackground'),
          [
            { text: t('profile.notNow'), style: 'cancel' },
            {
              text: t('profile.openSettings'),
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
      showError(t('profile.errorSettingLocation'));
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
          t('profile.additionalPermissionRequired'),
          t('profile.alwaysLocationPermissionForBackground'),
          [
            { text: t('profile.notNow'), style: 'cancel' },
            {
              text: t('profile.openSettings'),
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
      showError(t('profile.errorSavingLocation'));
    } finally {
      setIsSetting(false);
    }
  }, [selectedLocation, selectedRadius, updateSettingsMutation, requestPermission, startMonitoring, showError]);

  const handleToggleMonitoring = useCallback(async () => {
    // Check premium access first
    if (!hasGeofencing) {
      navigation.navigate('Paywall', { feature: 'geofencing' });
      return;
    }

    const newMonitoringState = !isMonitoring;

    try {
      if (newMonitoringState) {
        if (!hasPermission) {
          const granted = await requestPermission();
          if (!granted) {
            Alert.alert(
              t('profile.permissionRequired'),
              t('profile.alwaysLocationPermissionMessage')
            );
            return;
          }
        }

        const success = await startMonitoring();
        if (success) {
          // Update backend with new setting
          await updateSettingsMutation.mutateAsync({
            autoDetectArrival: true,
          });
          showSuccess(t('profile.geofenceActivated'));
        } else {
          showError(t('profile.geofenceActivationError'));
        }
      } else {
        stopMonitoring();
        // Update backend with new setting
        await updateSettingsMutation.mutateAsync({
          autoDetectArrival: false,
        });
        showSuccess(t('profile.geofenceDeactivated'));
      }
    } catch (error) {
      console.error('Error toggling geofencing:', error);
      showError(t('profile.geofenceActivationError'));
    }
  }, [hasGeofencing, navigation, isMonitoring, hasPermission, requestPermission, startMonitoring, stopMonitoring, updateSettingsMutation, showSuccess, showError, t]);

  if (!isAvailable) {
    return (
      <Container>
        <Header>
          <BackButton onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={theme.text.primary} />
          </BackButton>
          <HeaderTitle>{t('profile.workplaceLocationTitle')}</HeaderTitle>
        </Header>
        <Content>
          <WarningBox>
            <Ionicons name="information-circle" size={24} color={theme.status.warning} />
            <WarningText>
              {t('profile.workplaceLocationNotAvailable')}
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
        <HeaderTitle>{t('profile.workplaceLocationTitle')}</HeaderTitle>
      </Header>

      <Content>
        <Section>
          <SectionTitle>
            {t('profile.automaticDetectionTitle')}
            {!hasGeofencing && (
              <Text style={{ fontSize: 12, color: theme.status.warning, marginLeft: 8 }}>
                ({t('profile.premiumFeature')})
              </Text>
            )}
          </SectionTitle>
          <SectionDescription>
            {t('profile.automaticDetectionDescription')}
          </SectionDescription>

          {!hasGeofencing && (
            <WarningBox style={{ marginBottom: 16 }}>
              <Ionicons name="star" size={20} color={theme.status.warning} />
              <WarningText>
                {t('profile.geofencingPremiumMessage')}
              </WarningText>
            </WarningBox>
          )}

          <Card>
            {workplaceLocation ? (
              <Row>
                <Label>{t('profile.automaticDetection')}</Label>
                <Switch
                  value={isMonitoring}
                  onValueChange={handleToggleMonitoring}
                  trackColor={{
                    false: theme.colors?.borderLight ?? '#767577',
                    true: theme.colors?.success ?? '#34C759',
                  }}
                  thumbColor={isMonitoring ? '#fff' : '#f4f3f4'}
                />
              </Row>
            ) : (
              <Row>
                <Label>Status</Label>
                <StatusBadge active={false}>
                  <StatusText active={false}>{t('profile.inactive')}</StatusText>
                </StatusBadge>
              </Row>
            )}

            {workplaceLocation && (
              <>
                <Row style={{ marginTop: 16 }}>
                  <Label>{t('profile.locationSaved')}</Label>
                  <Ionicons name="checkmark-circle" size={20} color={theme.status.success} />
                </Row>
                <MapPreview
                  location={workplaceLocation}
                  radius={storedRadius || undefined}
                  onPress={() => setShowMapPicker(true)}
                />
                {storedRadius && (
                  <View style={{ marginTop: spacing.sm }}>
                    <Text style={[styles.radiusText, { color: theme.text.secondary }]}>
                      {t('profile.detectionRadiusMeters', { radius: storedRadius })}
                    </Text>
                  </View>
                )}
              </>
            )}

            {!workplaceLocation && (
              <WarningBox style={{ marginTop: 16 }}>
                <Ionicons name="alert-circle" size={20} color={theme.status.warning} />
                <WarningText>
                  {t('profile.noLocationConfigured')}
                </WarningText>
              </WarningBox>
            )}
          </Card>

          {!workplaceLocation ? (
            <Button
              title={t('profile.setLocation')}
              onPress={() => setShowMapPicker(true)}
              disabled={isSetting || isLoadingLocation}
              isLoading={isSetting || isLoadingLocation}
            />
          ) : (
            <Button
              title={t('profile.updateLocation')}
              variant="secondary"
              onPress={() => setShowMapPicker(true)}
              disabled={isSetting || isLoadingLocation}
              isLoading={isSetting || isLoadingLocation}
            />
          )}
        </Section>

        <Section>
          <SectionTitle>{t('profile.howItWorksTitle')}</SectionTitle>
          <Card>
            <SectionDescription>
              {t('profile.howItWorksDescription')}
            </SectionDescription>
          </Card>
        </Section>

        {!hasPermission && workplaceLocation && (
          <WarningBox>
            <Ionicons name="alert-circle" size={24} color={theme.status.warning} />
            <WarningText>
              {t('profile.alwaysPermissionNotGranted')}
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
          onLocationChange={(location, radius) => {
            setSelectedLocation(location);
            setSelectedRadius(radius);
          }}
          onClose={() => setShowMapPicker(false)}
          onConfirm={async (location, radius) => {
            setSelectedLocation(location);
            setSelectedRadius(radius);
            setShowMapPicker(false);
            
            // Save the location
            setIsSetting(true);
            try {
              await updateSettingsMutation.mutateAsync({
                workLocation: location,
              });
              await AsyncStorage.setItem(STORAGE_KEYS.WORKPLACE_RADIUS, radius.toString());
              setStoredRadius(radius);
              
              const permissionGranted = await requestPermission();
              if (permissionGranted) {
                await startMonitoring();
              } else {
                Alert.alert(
                  t('profile.additionalPermissionRequired'),
                  t('profile.alwaysLocationPermissionForBackground'),
                  [
                    { text: t('profile.notNow'), style: 'cancel' },
                    {
                      text: t('profile.openSettings'),
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
              console.error('Error saving workplace location:', error);
              showError(t('profile.errorSavingLocation'));
            } finally {
              setIsSetting(false);
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

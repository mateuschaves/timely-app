import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Alert, ActivityIndicator, TextInput, FlatList, Keyboard, Platform } from 'react-native';
import { useTranslation } from '@/i18n';
import { spacing } from '@/theme';
import { useTheme } from '@/theme/context/ThemeContext';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useOnboarding } from '../context/OnboardingContext';
import { OnboardingStackParamList, WorkModel } from '../types';
import { useGeocoding, AddressSuggestion } from '../hooks/useGeocoding';
import { LocationCoordinates } from '@/api/types';
import { useLocation } from '@/features/time-clock/hooks/useLocation';
// expo-maps requires a development build, not available in Expo Go
// Import with error handling
let AppleMaps: any = null;
let GoogleMaps: any = null;
let mapsAvailable = false;

try {
  const maps = require('expo-maps');
  // Check if maps object exists and has the expected exports
  if (maps && typeof maps === 'object') {
    if (maps.AppleMaps) {
      AppleMaps = maps.AppleMaps;
    }
    if (maps.GoogleMaps) {
      GoogleMaps = maps.GoogleMaps;
    }
    mapsAvailable = !!(AppleMaps && GoogleMaps);
    if (mapsAvailable) {
      console.log('expo-maps loaded successfully');
    } else {
      console.warn('expo-maps loaded but AppleMaps/GoogleMaps not found:', Object.keys(maps));
    }
  } else {
    console.warn('expo-maps module exists but is not an object:', typeof maps);
  }
} catch (error: any) {
  // Maps not available (e.g., in Expo Go or not properly linked)
  console.warn('expo-maps not available. Make sure you ran: cd ios && pod install');
  console.warn('Error:', error?.message || error);
}
import {
  Container,
  Header,
  CloseButton,
  CloseButtonText,
  Content,
  Title,
  Subtitle,
  SearchContainer,
  SearchInputWrapper,
  SearchInput,
  SearchLoadingIndicator,
  SuggestionsList,
  SuggestionItem,
  SuggestionText,
  MapContainer,
  ButtonContainer,
  ContinueButton,
  ContinueButtonText,
  LoadingContainer,
  ErrorText,
  CurrentLocationButton,
  CurrentLocationButtonText,
} from './styles';

type NavigationProp = NativeStackNavigationProp<OnboardingStackParamList, 'WorkLocation'>;
type RouteProp = RouteProp<OnboardingStackParamList, 'WorkLocation'>;

interface CameraPosition {
  coordinates: {
    latitude: number;
    longitude: number;
  };
  zoom: number;
}

export function WorkLocationScreen() {
  const { t } = useTranslation();
  const { colorScheme, theme } = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<RouteProp>();
  const { completeOnboarding, skipOnboarding } = useOnboarding();
  const { workModel } = route.params;
  const { requestLocationPermission } = useLocation();
  const { searchAddresses, reverseGeocode, isSearching, error: geocodingError } = useGeocoding();

  // Cor do loading baseada no tema e estado do botão
  const getLoadingColor = () => {
    if (colorScheme === 'dark') {
      // No modo escuro, o botão tem fundo branco (primary) quando ativo
      // ou cinza (#999999) quando disabled
      // Usar preto para contraste em ambos os casos
      return '#000000';
    }
    // No modo claro, o botão tem fundo preto, usar branco
    return '#ffffff';
  };

  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [selectedLocation, setSelectedLocation] = useState<LocationCoordinates | null>(null);
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [cameraPosition, setCameraPosition] = useState<CameraPosition | null>(null);
  const [isLoadingCurrentLocation, setIsLoadingCurrentLocation] = useState(false);
  const [isLoadingContinue, setIsLoadingContinue] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const isSelectingRef = useRef(false);
  const lastSelectedQueryRef = useRef<string>('');

  // Buscar sugestões quando o usuário digita
  useEffect(() => {
    // Não buscar se estiver selecionando uma sugestão
    if (isSelectingRef.current) {
      return;
    }

    // Não buscar se a query for igual à última selecionada (evita busca após seleção)
    if (searchQuery === lastSelectedQueryRef.current) {
      return;
    }

    // Se não há query suficiente, limpar sugestões
    if (searchQuery.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      // Verificar novamente antes de buscar
      if (isSelectingRef.current || searchQuery === lastSelectedQueryRef.current) {
        return;
      }

      const results = await searchAddresses(searchQuery);

      // Verificar uma última vez antes de atualizar o estado
      if (!isSelectingRef.current && searchQuery !== lastSelectedQueryRef.current) {
        setSuggestions(results);
        setShowSuggestions(true);
      }
    }, 500); // Debounce de 500ms

    return () => clearTimeout(timeoutId);
  }, [searchQuery, searchAddresses]);

  // Inicializar mapa com localização atual (opcional)
  useEffect(() => {
    const initializeMap = async () => {
      try {
        const loc = await requestLocationPermission();
        if (loc) {
          const [longitude, latitude] = loc.coordinates;
          setCameraPosition({
            coordinates: { latitude, longitude },
            zoom: 14,
          });
        } else {
          // Se não conseguir localização, usar uma localização padrão (São Paulo)
          setCameraPosition({
            coordinates: { latitude: -23.5505, longitude: -46.6333 },
            zoom: 12,
          });
        }
      } catch (error) {
        // Em caso de erro, usar localização padrão
        setCameraPosition({
          coordinates: { latitude: -23.5505, longitude: -46.6333 },
          zoom: 12,
        });
      }
    };

    initializeMap();
  }, []);

  const handleSelectSuggestion = async (suggestion: AddressSuggestion) => {
    Keyboard.dismiss();

    // Marcar que estamos selecionando ANTES de qualquer outra operação
    isSelectingRef.current = true;

    const addressText = suggestion.formatted_address || suggestion.display_name;

    // Limpar sugestões imediatamente e esconder a lista
    setSuggestions([]);
    setShowSuggestions(false);
    setSelectedAddress(addressText);

    const coordinates: LocationCoordinates = {
      type: 'Point',
      coordinates: [parseFloat(suggestion.lon), parseFloat(suggestion.lat)],
    };

    setSelectedLocation(coordinates);
    setCameraPosition({
      coordinates: {
        latitude: parseFloat(suggestion.lat),
        longitude: parseFloat(suggestion.lon),
      },
      zoom: 15,
    });

    // Salvar a query selecionada para evitar nova busca
    lastSelectedQueryRef.current = addressText;

    // Atualizar o campo de busca
    setSearchQuery(addressText);

    // Resetar o flag após um tempo suficiente
    setTimeout(() => {
      isSelectingRef.current = false;
    }, 1000);
  };

  const handleMapClick = async (event: any) => {
    const { latitude, longitude } = event.coordinates;

    const coordinates: LocationCoordinates = {
      type: 'Point',
      coordinates: [longitude, latitude],
    };

    setSelectedLocation(coordinates);

    // Fazer reverse geocoding para obter o endereço
    const address = await reverseGeocode(coordinates);
    if (address) {
      setSelectedAddress(address);
      setSearchQuery(address);
    }
  };

  const handleGetCurrentLocation = async () => {
    setIsLoadingCurrentLocation(true);
    try {
      const loc = await requestLocationPermission();
      if (loc) {
        const [longitude, latitude] = loc.coordinates;
        setSelectedLocation(loc);
        setCameraPosition({
          coordinates: { latitude, longitude },
          zoom: 15,
        });

        // Fazer reverse geocoding
        const address = await reverseGeocode(loc);
        if (address) {
          setSelectedAddress(address);
          setSearchQuery(address);
        }
      }
    } catch (error) {
      Alert.alert(
        t('common.error'),
        t('onboarding.workLocation.locationError')
      );
    } finally {
      setIsLoadingCurrentLocation(false);
    }
  };

  const handleSkip = () => {
    Alert.alert(
      t('onboarding.skipConfirmTitle'),
      t('onboarding.skipConfirmMessage'),
      [
        {
          text: t('onboarding.cancelSkip'),
          style: 'cancel',
        },
        {
          text: t('onboarding.skipConfirmButton'),
          onPress: async () => {
            try {
              await skipOnboarding();
            } catch (error) {
              console.error('Error skipping onboarding:', error);
              Alert.alert(
                t('common.error'),
                t('onboarding.error.skipFailed')
              );
            }
          },
        },
      ]
    );
  };

  const handleContinue = async () => {
    if (!selectedLocation) {
      Alert.alert(
        t('common.error'),
        t('onboarding.workLocation.selectLocationError')
      );
      return;
    }

    setIsLoadingContinue(true);
    try {
      await completeOnboarding(workModel, selectedLocation);
    } catch (error) {
      console.error('Error completing onboarding:', error);
      Alert.alert(
        t('common.error'),
        t('onboarding.error.completeFailed')
      );
    } finally {
      setIsLoadingContinue(false);
    }
  };

  const renderSuggestion = ({ item }: { item: AddressSuggestion }) => (
    <SuggestionItem onPress={() => handleSelectSuggestion(item)}>
      <SuggestionText>{item.formatted_address || item.display_name}</SuggestionText>
    </SuggestionItem>
  );

  return (
    <Container>
      <Header>
        <CloseButton onPress={handleSkip} activeOpacity={0.6}>
          <CloseButtonText>×</CloseButtonText>
        </CloseButton>
      </Header>

      <Content>
        <Title>{t('onboarding.workLocation.title')}</Title>
        <Subtitle>{t('onboarding.workLocation.subtitle')}</Subtitle>

        <SearchContainer>
          <SearchInputWrapper>
            <SearchInput
              value={searchQuery}
              onChangeText={setSearchQuery}
              placeholder={t('onboarding.workLocation.searchPlaceholder')}
              placeholderTextColor="#999"
              onFocus={() => {
                if (suggestions.length > 0 && !isSelectingRef.current) {
                  setShowSuggestions(true);
                }
              }}
            />
            {isSearching && (
              <SearchLoadingIndicator>
                <ActivityIndicator size="small" />
              </SearchLoadingIndicator>
            )}
          </SearchInputWrapper>
          {showSuggestions && suggestions.length > 0 && (
            <SuggestionsList>
              <FlatList
                data={suggestions}
                renderItem={renderSuggestion}
                keyExtractor={(item) => item.place_id.toString()}
                keyboardShouldPersistTaps="handled"
              />
            </SuggestionsList>
          )}
        </SearchContainer>

        {geocodingError && (
          <ErrorText>{geocodingError}</ErrorText>
        )}

        {cameraPosition && mapsAvailable && AppleMaps && GoogleMaps ? (
          <MapContainer>
            {Platform.OS === 'ios' ? (
              <AppleMaps.View
                style={{ flex: 1 }}
                cameraPosition={cameraPosition}
                onMapClick={handleMapClick}
                markers={selectedLocation ? [{
                  id: 'selected',
                  coordinates: {
                    latitude: selectedLocation.coordinates[1],
                    longitude: selectedLocation.coordinates[0],
                  },
                  title: selectedAddress || t('onboarding.workLocation.selectedLocation'),
                }] : []}
              />
            ) : Platform.OS === 'android' ? (
              <GoogleMaps.View
                style={{ flex: 1 }}
                cameraPosition={cameraPosition}
                onMapClick={handleMapClick}
                markers={selectedLocation ? [{
                  id: 'selected',
                  coordinates: {
                    latitude: selectedLocation.coordinates[1],
                    longitude: selectedLocation.coordinates[0],
                  },
                  title: selectedAddress || t('onboarding.workLocation.selectedLocation'),
                }] : []}
              />
            ) : null}
            <CurrentLocationButton onPress={handleGetCurrentLocation} disabled={isLoadingCurrentLocation}>
              {isLoadingCurrentLocation ? (
                <ActivityIndicator
                  size="small"
                  color={getLoadingColor()}
                  animating={true}
                  style={{ opacity: 1 }}
                />
              ) : (
                <CurrentLocationButtonText disabled={isLoadingCurrentLocation}>
                  {t('onboarding.workLocation.useCurrentLocation')}
                </CurrentLocationButtonText>
              )}
            </CurrentLocationButton>
          </MapContainer>
        ) : (
          <MapContainer style={{ justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' }}>
            <Subtitle style={{ textAlign: 'center', padding: spacing.lg }}>
              {t('onboarding.workLocation.mapNotAvailable')}
            </Subtitle>
            <CurrentLocationButton onPress={handleGetCurrentLocation} disabled={isLoadingCurrentLocation}>
              {isLoadingCurrentLocation ? (
                <ActivityIndicator
                  size="small"
                  color={getLoadingColor()}
                  animating={true}
                  style={{ opacity: 1 }}
                />
              ) : (
                <CurrentLocationButtonText disabled={isLoadingCurrentLocation}>
                  {t('onboarding.workLocation.useCurrentLocation')}
                </CurrentLocationButtonText>
              )}
            </CurrentLocationButton>
          </MapContainer>
        )}

        {selectedAddress && (
          <Subtitle style={{ marginTop: 12, fontSize: 14 }}>
            {t('onboarding.workLocation.selectedAddress')}: {selectedAddress}
          </Subtitle>
        )}
      </Content>

      <ButtonContainer>
        <ContinueButton
          onPress={handleContinue}
          disabled={!selectedLocation || isLoadingContinue}
          loading={isLoadingContinue}
          activeOpacity={0.8}
        >
          {isLoadingContinue ? (
            <ActivityIndicator size="small" color={getLoadingColor()} />
          ) : (
            <ContinueButtonText disabled={!selectedLocation}>
              {t('onboarding.workModel.continue')}
            </ContinueButtonText>
          )}
        </ContinueButton>
      </ButtonContainer>
    </Container>
  );
}

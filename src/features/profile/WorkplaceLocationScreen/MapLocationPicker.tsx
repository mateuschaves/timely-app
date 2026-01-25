import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  Platform,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import Slider from '@react-native-community/slider';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/context/ThemeContext';
import { spacing, borderRadius, typography } from '@/theme';
import { LocationCoordinates } from '@/api/types';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from '@/i18n';

interface MapLocationPickerProps {
  initialLocation?: LocationCoordinates;
  initialRadius?: number;
  onLocationChange?: (location: LocationCoordinates, radius: number) => void;
  onClose: () => void;
  onConfirm?: (location: LocationCoordinates, radius: number) => void;
}

interface SearchResult {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
}

const MIN_RADIUS = 50;
const MAX_RADIUS = 500;
const DEFAULT_RADIUS = 100;
const FALLBACK_LAT = -23.5505;
const FALLBACK_LNG = -46.6333;

export function MapLocationPicker({
  initialLocation,
  initialRadius = DEFAULT_RADIUS,
  onLocationChange,
  onClose,
  onConfirm,
}: MapLocationPickerProps) {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const mapRef = useRef<MapView>(null);

  const [selectedLocation, setSelectedLocation] = useState<LocationCoordinates | null>(
    initialLocation ?? null
  );
  const [selectedAddress, setSelectedAddress] = useState<string>('');
  const [radius, setRadius] = useState(initialRadius);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showMap, setShowMap] = useState(!!initialLocation);
  const [showRadiusSlider, setShowRadiusSlider] = useState(false);

  const defaultCoords = {
    latitude:
      typeof initialLocation?.coordinates?.[1] === 'number'
        ? initialLocation.coordinates[1]
        : FALLBACK_LAT,
    longitude:
      typeof initialLocation?.coordinates?.[0] === 'number'
        ? initialLocation.coordinates[0]
        : FALLBACK_LNG,
  };

  const [region, setRegion] = useState({
    latitude: defaultCoords.latitude,
    longitude: defaultCoords.longitude,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });

  useEffect(() => {
    if (!initialLocation?.coordinates?.length) return;
    const lat =
      typeof initialLocation.coordinates[1] === 'number' ? initialLocation.coordinates[1] : FALLBACK_LAT;
    const lng =
      typeof initialLocation.coordinates[0] === 'number' ? initialLocation.coordinates[0] : FALLBACK_LNG;
    const r = {
      latitude: lat,
      longitude: lng,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    setRegion(r);
    setShowMap(true);
    reverseGeocode(lat, lng);
  }, [initialLocation]);

  const reverseGeocode = async (latitude: number, longitude: number) => {
    try {
      const { reverseGeocodeAsync } = await import('expo-location');
      const results = await reverseGeocodeAsync({ latitude, longitude });
      if (results.length > 0) {
        const addr = results[0];
        const parts = [addr.street, addr.streetNumber, addr.district, addr.city, addr.region].filter(Boolean);
        setSelectedAddress(parts.join(', ') || `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
      }
    } catch {
      setSelectedAddress(`${latitude.toFixed(6)}, ${longitude.toFixed(6)}`);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.length < 3) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const { geocodeAsync } = await import('expo-location');
      const results = await geocodeAsync(query);
      const mapped: SearchResult[] = results.slice(0, 5).map((r, index) => ({
        id: `${index}`,
        name: query,
        address: query,
        latitude: r.latitude,
        longitude: r.longitude,
      }));
      setSearchResults(mapped);
    } catch {
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectSearchResult = (result: SearchResult) => {
    Keyboard.dismiss();
    const loc: LocationCoordinates = {
      type: 'Point',
      coordinates: [result.longitude, result.latitude],
    };
    setSelectedLocation(loc);
    setSelectedAddress(result.address);
    setSearchQuery('');
    setSearchResults([]);
    setShowMap(true);

    const r = {
      latitude: result.latitude,
      longitude: result.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    setRegion(r);
    setTimeout(() => {
      mapRef.current?.animateToRegion(r, 500);
    }, 100);
  };

  const handleMapPress = (e: { nativeEvent: { coordinate: { latitude: number; longitude: number } } }) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    const loc: LocationCoordinates = {
      type: 'Point',
      coordinates: [longitude, latitude],
    };
    setSelectedLocation(loc);
    reverseGeocode(latitude, longitude);
  };

  const handleUseCurrentLocation = async () => {
    try {
      const {
        getCurrentPositionAsync,
        requestForegroundPermissionsAsync,
        getForegroundPermissionsAsync,
      } = await import('expo-location');

      const { status } = await getForegroundPermissionsAsync();
      if (status !== 'granted') {
        const { status: newStatus } = await requestForegroundPermissionsAsync();
        if (newStatus !== 'granted') return;
      }

      const location = await getCurrentPositionAsync({});
      const loc: LocationCoordinates = {
        type: 'Point',
        coordinates: [location.coords.longitude, location.coords.latitude],
      };
      setSelectedLocation(loc);
      setShowMap(true);

      const r = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setRegion(r);
      setTimeout(() => {
        mapRef.current?.animateToRegion(r, 500);
      }, 100);
      reverseGeocode(location.coords.latitude, location.coords.longitude);
    } catch (err) {
      console.error('Error getting current location:', err);
    }
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      if (onConfirm) {
        onConfirm(selectedLocation, radius);
      } else {
        onLocationChange?.(selectedLocation, radius);
        onClose();
      }
    }
  };

  const handleRadiusChange = (value: number) => {
    const r = Math.round(value);
    setRadius(r);
  };

  const coords = selectedLocation
    ? {
        latitude:
          typeof selectedLocation.coordinates?.[1] === 'number'
            ? selectedLocation.coordinates[1]
            : defaultCoords.latitude,
        longitude:
          typeof selectedLocation.coordinates?.[0] === 'number'
            ? selectedLocation.coordinates[0]
            : defaultCoords.longitude,
      }
    : defaultCoords;

  const primary = theme?.primary ?? '#000000';

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: theme.background.primary }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.sm }]}>
        <TouchableOpacity
          onPress={onClose}
          style={[styles.headerButton, { backgroundColor: theme.background.secondary }]}
        >
          <Ionicons name="close" size={20} color={theme.text.primary} />
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: theme.text.primary }]}>
          {t('profile.location')}
        </Text>

        <TouchableOpacity
          onPress={handleConfirm}
          disabled={!selectedLocation}
          style={[
            styles.headerButton,
            {
              backgroundColor: selectedLocation ? '#007AFF' : theme.background.secondary,
            },
          ]}
        >
          <Ionicons
            name="checkmark"
            size={20}
            color={selectedLocation ? '#FFFFFF' : theme.text.tertiary}
          />
        </TouchableOpacity>
      </View>

      <View style={[styles.divider, { backgroundColor: theme.border.light }]} />

      {/* Current Location Option */}
      <TouchableOpacity
        style={styles.optionRow}
        onPress={handleUseCurrentLocation}
      >
        <Ionicons name="navigate" size={20} color={theme.text.primary} />
        <Text style={[styles.optionText, { color: theme.text.primary }]}>
          {t('profile.currentLocation')}
        </Text>
      </TouchableOpacity>

      <View style={[styles.divider, { backgroundColor: theme.border.light }]} />

      {/* Selected Location Display */}
      {selectedAddress && (
        <>
          <TouchableOpacity
            style={styles.optionRow}
            onPress={() => setShowRadiusSlider(!showRadiusSlider)}
          >
            <Ionicons name="location" size={20} color="#007AFF" />
            <View style={styles.selectedLocationInfo}>
              <Text style={[styles.optionText, { color: theme.text.primary }]} numberOfLines={1}>
                {selectedAddress}
              </Text>
              <Text style={[styles.radiusInfo, { color: theme.text.secondary }]}>
                {t('profile.detectionRadius')}: {radius}m
              </Text>
            </View>
            <Ionicons
              name={showRadiusSlider ? 'chevron-up' : 'chevron-down'}
              size={20}
              color={theme.text.tertiary}
            />
          </TouchableOpacity>

          {showRadiusSlider && (
            <View style={[styles.radiusSliderContainer, { backgroundColor: theme.background.secondary }]}>
              <Slider
                style={styles.slider}
                minimumValue={MIN_RADIUS}
                maximumValue={MAX_RADIUS}
                value={radius}
                onValueChange={handleRadiusChange}
                minimumTrackTintColor="#007AFF"
                maximumTrackTintColor={theme.border.light}
                thumbTintColor="#007AFF"
                step={10}
              />
              <View style={styles.radiusLimits}>
                <Text style={[styles.radiusLimitText, { color: theme.text.tertiary }]}>
                  {MIN_RADIUS}m
                </Text>
                <Text style={[styles.radiusLimitText, { color: theme.text.tertiary }]}>
                  {MAX_RADIUS}m
                </Text>
              </View>
            </View>
          )}

          <View style={[styles.divider, { backgroundColor: theme.border.light }]} />
        </>
      )}

      {/* Map View */}
      {showMap && (
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            {...(Platform.OS === 'android' ? { provider: PROVIDER_GOOGLE } : {})}
            style={styles.map}
            initialRegion={region}
            onPress={handleMapPress}
            showsUserLocation
            showsMyLocationButton={false}
            mapType="standard"
          >
            {selectedLocation && (
              <>
                <Marker
                  coordinate={{ latitude: coords.latitude, longitude: coords.longitude }}
                  pinColor={primary}
                />
                <Circle
                  center={{ latitude: coords.latitude, longitude: coords.longitude }}
                  radius={Number.isFinite(radius) && radius > 0 ? radius : DEFAULT_RADIUS}
                  strokeColor="#007AFF"
                  fillColor="rgba(0, 122, 255, 0.2)"
                  strokeWidth={2}
                />
              </>
            )}
          </MapView>

          {/* Floating locate button on map */}
          <TouchableOpacity
            style={[styles.floatingLocateButton, { backgroundColor: theme.background.primary }]}
            onPress={handleUseCurrentLocation}
          >
            <Ionicons name="locate" size={22} color="#007AFF" />
          </TouchableOpacity>
        </View>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <View style={[styles.searchResultsContainer, { backgroundColor: theme.background.primary }]}>
          <FlatList
            data={searchResults}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.searchResultItem}
                onPress={() => handleSelectSearchResult(item)}
              >
                <Ionicons name="location-outline" size={20} color={theme.text.secondary} />
                <Text style={[styles.searchResultText, { color: theme.text.primary }]} numberOfLines={2}>
                  {item.address}
                </Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}

      {/* Search Bar */}
      <View style={[styles.searchContainer, { paddingBottom: insets.bottom + spacing.md }]}>
        <View style={[styles.searchBar, { backgroundColor: theme.background.secondary }]}>
          <Ionicons name="search" size={20} color={theme.text.tertiary} />
          <TextInput
            style={[styles.searchInput, { color: theme.text.primary }]}
            placeholder={t('profile.searchAddress')}
            placeholderTextColor={theme.text.tertiary}
            value={searchQuery}
            onChangeText={handleSearch}
            returnKeyType="search"
          />
          {isSearching && <ActivityIndicator size="small" color={theme.text.tertiary} />}
          {searchQuery.length > 0 && !isSearching && (
            <TouchableOpacity onPress={() => { setSearchQuery(''); setSearchResults([]); }}>
              <Ionicons name="close-circle" size={20} color={theme.text.tertiary} />
            </TouchableOpacity>
          )}
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
  },
  headerButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
  },
  divider: {
    height: 1,
    marginHorizontal: spacing.md,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  optionText: {
    fontSize: typography.sizes.md,
    flex: 1,
  },
  selectedLocationInfo: {
    flex: 1,
  },
  radiusInfo: {
    fontSize: typography.sizes.sm,
    marginTop: 2,
  },
  radiusSliderContainer: {
    marginHorizontal: spacing.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  slider: {
    width: '100%',
    height: 40,
  },
  radiusLimits: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  radiusLimitText: {
    fontSize: typography.sizes.xs,
  },
  mapContainer: {
    flex: 1,
    margin: spacing.md,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  floatingLocateButton: {
    position: 'absolute',
    right: spacing.md,
    bottom: spacing.md,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  searchResultsContainer: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: 80,
    maxHeight: 200,
    borderRadius: borderRadius.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  searchResultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  searchResultText: {
    flex: 1,
    fontSize: typography.sizes.md,
  },
  searchContainer: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.sm,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.lg,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.sizes.md,
    paddingVertical: spacing.xs,
  },
});

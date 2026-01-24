import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Platform } from 'react-native';
import Slider from '@react-native-community/slider';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '@/theme/context/ThemeContext';
import { spacing, borderRadius, typography } from '@/theme';
import { LocationCoordinates } from '@/api/types';

interface MapLocationPickerProps {
  initialLocation?: LocationCoordinates;
  initialRadius?: number;
  onLocationChange: (location: LocationCoordinates, radius: number) => void;
  onClose: () => void;
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
}: MapLocationPickerProps) {
  const { theme } = useTheme();
  const mapRef = useRef<MapView>(null);

  const [selectedLocation, setSelectedLocation] = useState<LocationCoordinates | null>(
    initialLocation ?? null
  );
  const [radius, setRadius] = useState(initialRadius);

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
    mapRef.current?.animateToRegion(r, 500);
  }, [initialLocation]);

  const handleMapPress = (e: { nativeEvent: { coordinate: { latitude: number; longitude: number } } }) => {
    const { latitude, longitude } = e.nativeEvent.coordinate;
    const loc: LocationCoordinates = {
      type: 'Point',
      coordinates: [longitude, latitude],
    };
    setSelectedLocation(loc);
    onLocationChange(loc, radius);
  };

  const handleRadiusChange = (value: number) => {
    const r = Math.round(value);
    setRadius(r);
    if (selectedLocation) onLocationChange(selectedLocation, r);
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationChange(selectedLocation, radius);
      onClose();
    }
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

      const r = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      setRegion(r);
      mapRef.current?.animateToRegion(r, 500);
      onLocationChange(loc, radius);
    } catch (err) {
      console.error('Error getting current location:', err);
    }
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
    <View style={styles.container}>
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
              strokeColor={primary}
              fillColor={`${primary}30`}
              strokeWidth={2}
            />
          </>
        )}
      </MapView>

      <View style={[styles.header, { backgroundColor: theme.background.primary }]}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={theme.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text.primary }]}>
          Selecionar Localização
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={[styles.controlsContainer, { backgroundColor: theme.background.primary }]}>
        <TouchableOpacity
          onPress={handleUseCurrentLocation}
          style={[styles.currentLocationButton, { backgroundColor: theme.primary }]}
        >
          <Ionicons name="locate" size={20} color={theme.text.inverse} />
        </TouchableOpacity>

        <View style={styles.radiusContainer}>
          <View style={styles.radiusHeader}>
            <Ionicons name="radio-button-on" size={16} color={theme.primary} />
            <Text style={[styles.radiusLabel, { color: theme.text.primary }]}>
              Raio de Precisão: {radius}m
            </Text>
          </View>
          <Slider
            style={styles.slider}
            minimumValue={MIN_RADIUS}
            maximumValue={MAX_RADIUS}
            value={radius}
            onValueChange={handleRadiusChange}
            minimumTrackTintColor={theme.primary}
            maximumTrackTintColor={theme.border.light}
            thumbTintColor={theme.primary}
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

        <TouchableOpacity
          onPress={handleConfirm}
          disabled={!selectedLocation}
          style={[
            styles.confirmButton,
            {
              backgroundColor: selectedLocation ? theme.primary : theme.border.light,
              opacity: selectedLocation ? 1 : 0.5,
            },
          ]}
        >
          <Text
            style={[
              styles.confirmButtonText,
              { color: selectedLocation ? theme.text.inverse : theme.text.tertiary },
            ]}
          >
            Confirmar Localização
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    paddingTop: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
    zIndex: 1,
  },
  closeButton: { padding: spacing.xs },
  headerTitle: {
    fontSize: typography.sizes.lg,
    fontWeight: typography.weights.semibold,
  },
  controlsContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
    zIndex: 1,
  },
  currentLocationButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.round,
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'flex-end',
    marginBottom: spacing.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  radiusContainer: { marginBottom: spacing.md },
  radiusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.sm,
    gap: spacing.xs,
  },
  radiusLabel: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.medium,
  },
  slider: { width: '100%', height: 40 },
  radiusLimits: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  radiusLimitText: { fontSize: typography.sizes.xs },
  confirmButton: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  confirmButtonText: {
    fontSize: typography.sizes.md,
    fontWeight: typography.weights.semibold,
  },
});

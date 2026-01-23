import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, Text, Slider, Platform } from 'react-native';
import { GoogleMaps, AppleMaps } from 'expo-maps';
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

const MIN_RADIUS = 50; // 50 meters
const MAX_RADIUS = 500; // 500 meters
const DEFAULT_RADIUS = 100; // 100 meters

export function MapLocationPicker({
  initialLocation,
  initialRadius = DEFAULT_RADIUS,
  onLocationChange,
  onClose,
}: MapLocationPickerProps) {
  const { theme } = useTheme();
  const googleMapRef = useRef<GoogleMaps.MapView>(null);
  const appleMapRef = useRef<AppleMaps.MapView>(null);
  const [selectedLocation, setSelectedLocation] = useState<LocationCoordinates | null>(
    initialLocation || null
  );
  const [radius, setRadius] = useState(initialRadius);
  
  const defaultCoordinates = {
    latitude: initialLocation?.coordinates[1] || -23.5505,
    longitude: initialLocation?.coordinates[0] || -46.6333,
  };

  const [cameraPosition, setCameraPosition] = useState({
    coordinates: defaultCoordinates,
    zoom: 15,
  });

  useEffect(() => {
    if (initialLocation) {
      const coords = {
        latitude: initialLocation.coordinates[1],
        longitude: initialLocation.coordinates[0],
      };
      const newCameraPosition = {
        coordinates: coords,
        zoom: 15,
      };
      setCameraPosition(newCameraPosition);
      
      // Update camera position on map
      if (Platform.OS === 'android' && googleMapRef.current) {
        googleMapRef.current.setCameraPosition(newCameraPosition);
      } else if (Platform.OS === 'ios' && appleMapRef.current) {
        appleMapRef.current.setCameraPosition(newCameraPosition);
      }
    }
  }, [initialLocation]);

  const handleMapClick = (event: { coordinates: { latitude: number; longitude: number } }) => {
    const { latitude, longitude } = event.coordinates;
    const newLocation: LocationCoordinates = {
      type: 'Point',
      coordinates: [longitude, latitude],
    };
    setSelectedLocation(newLocation);
    onLocationChange(newLocation, radius);
  };

  const handleRadiusChange = (value: number) => {
    const newRadius = Math.round(value);
    setRadius(newRadius);
    if (selectedLocation) {
      onLocationChange(selectedLocation, newRadius);
    }
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationChange(selectedLocation, radius);
      onClose();
    }
  };

  const handleUseCurrentLocation = async () => {
    try {
      const { getCurrentPositionAsync, requestForegroundPermissionsAsync, getForegroundPermissionsAsync } = await import('expo-location');
      
      const { status } = await getForegroundPermissionsAsync();
      if (status !== 'granted') {
        const { status: newStatus } = await requestForegroundPermissionsAsync();
        if (newStatus !== 'granted') {
          return;
        }
      }

      const location = await getCurrentPositionAsync({});
      const newLocation: LocationCoordinates = {
        type: 'Point',
        coordinates: [location.coords.longitude, location.coords.latitude],
      };
      
      setSelectedLocation(newLocation);
      
      const newCameraPosition = {
        coordinates: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        zoom: 15,
      };
      
      setCameraPosition(newCameraPosition);
      
      // Update camera position on map
      if (Platform.OS === 'android' && googleMapRef.current) {
        googleMapRef.current.setCameraPosition(newCameraPosition);
      } else if (Platform.OS === 'ios' && appleMapRef.current) {
        appleMapRef.current.setCameraPosition(newCameraPosition);
      }
      
      onLocationChange(newLocation, radius);
    } catch (error) {
      console.error('Error getting current location:', error);
    }
  };

  const coordinates = selectedLocation
    ? {
        latitude: selectedLocation.coordinates[1],
        longitude: selectedLocation.coordinates[0],
      }
    : defaultCoordinates;

  const markers = selectedLocation
    ? [
        {
          id: 'selected',
          coordinates,
        },
      ]
    : [];

  const circles = selectedLocation
    ? [
        {
          id: 'radius',
          center: coordinates,
          radius,
          color: `${theme.primary}30`,
          lineColor: theme.primary,
          lineWidth: 2,
        },
      ]
    : undefined;

  return (
    <View style={styles.container}>
      {Platform.OS === 'android' ? (
        <GoogleMaps.View
          ref={googleMapRef}
          style={styles.map}
          cameraPosition={cameraPosition}
          onMapClick={handleMapClick}
          markers={markers}
          circles={circles}
          uiSettings={{
            myLocationButtonEnabled: false,
          }}
          properties={{
            mapType: GoogleMaps.MapType.NORMAL,
            isMyLocationEnabled: true,
          }}
        />
      ) : (
        <AppleMaps.View
          ref={appleMapRef}
          style={styles.map}
          cameraPosition={cameraPosition}
          onMapClick={handleMapClick}
          markers={markers}
          circles={circles}
          uiSettings={{
            myLocationButtonEnabled: false,
          }}
          properties={{
            mapType: AppleMaps.MapType.STANDARD,
            isMyLocationEnabled: true,
          }}
        />
      )}

      {/* Header with close button */}
      <View style={[styles.header, { backgroundColor: theme.background.primary }]}>
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Ionicons name="close" size={24} color={theme.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.text.primary }]}>
          Selecionar Localização
        </Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Controls overlay */}
      <View style={[styles.controlsContainer, { backgroundColor: theme.background.primary }]}>
        {/* Current location button */}
        <TouchableOpacity
          onPress={handleUseCurrentLocation}
          style={[styles.currentLocationButton, { backgroundColor: theme.primary }]}
        >
          <Ionicons name="locate" size={20} color={theme.text.inverse} />
        </TouchableOpacity>

        {/* Radius control */}
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

        {/* Confirm button */}
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
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
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
  closeButton: {
    padding: spacing.xs,
  },
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
  radiusContainer: {
    marginBottom: spacing.md,
  },
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
  slider: {
    width: '100%',
    height: 40,
  },
  radiusLimits: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  radiusLimitText: {
    fontSize: typography.sizes.xs,
  },
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

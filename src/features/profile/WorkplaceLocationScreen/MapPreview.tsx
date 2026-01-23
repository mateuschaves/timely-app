import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { GoogleMaps, AppleMaps } from 'expo-maps';
import { useTheme } from '@/theme/context/ThemeContext';
import { LocationCoordinates } from '@/api/types';
import { spacing, borderRadius } from '@/theme';

interface MapPreviewProps {
  location: LocationCoordinates;
  radius?: number;
  height?: number;
}

export function MapPreview({ location, radius, height = 200 }: MapPreviewProps) {
  const { theme } = useTheme();

  const coordinates = {
    latitude: location.coordinates[1],
    longitude: location.coordinates[0],
  };

  const cameraPosition = {
    coordinates,
    zoom: 15,
  };

  const markers = [
    {
      id: 'workplace',
      coordinates,
    },
  ];

  const circles = radius
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

  if (Platform.OS === 'android') {
    return (
      <View style={[styles.container, { height }]}>
        <GoogleMaps.View
          style={styles.map}
          cameraPosition={cameraPosition}
          markers={markers}
          circles={circles}
          uiSettings={{
            scrollGesturesEnabled: false,
            zoomGesturesEnabled: false,
            tiltGesturesEnabled: false,
            rotationGesturesEnabled: false,
            zoomControlsEnabled: false,
          }}
          properties={{
            mapType: GoogleMaps.MapType.NORMAL,
          }}
        />
      </View>
    );
  }

  // iOS - Apple Maps
  const appleCircles = radius
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
    <View style={[styles.container, { height }]}>
      <AppleMaps.View
        style={styles.map}
        cameraPosition={cameraPosition}
        markers={markers}
        circles={appleCircles}
        uiSettings={{
          scrollGesturesEnabled: false,
          zoomGesturesEnabled: false,
          tiltGesturesEnabled: false,
          rotationGesturesEnabled: false,
        }}
        properties={{
          mapType: AppleMaps.MapType.STANDARD,
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.md,
    borderRadius: borderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.1)',
  },
  map: {
    flex: 1,
  },
});

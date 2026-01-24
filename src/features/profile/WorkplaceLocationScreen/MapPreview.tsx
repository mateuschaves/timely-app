import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import { useTheme } from '@/theme/context/ThemeContext';
import { LocationCoordinates } from '@/api/types';
import { spacing, borderRadius } from '@/theme';

interface MapPreviewProps {
  location: LocationCoordinates;
  radius?: number;
  height?: number;
}

const FALLBACK_LAT = -23.5505;
const FALLBACK_LNG = -46.6333;

export function MapPreview({ location, radius, height = 200 }: MapPreviewProps) {
  const { theme } = useTheme();

  const lat = typeof location?.coordinates?.[1] === 'number' ? location.coordinates[1] : FALLBACK_LAT;
  const lng = typeof location?.coordinates?.[0] === 'number' ? location.coordinates[0] : FALLBACK_LNG;
  const primary = theme?.primary ?? '#000000';
  const safeRadius = typeof radius === 'number' && Number.isFinite(radius) && radius > 0 ? radius : 0;

  return (
    <View style={[styles.container, { height }]}>
      <MapView
        {...(Platform.OS === 'android' ? { provider: PROVIDER_GOOGLE } : {})}
        style={styles.map}
        initialRegion={{
          latitude: lat,
          longitude: lng,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        }}
        scrollEnabled={false}
        zoomEnabled={false}
        pitchEnabled={false}
        rotateEnabled={false}
        mapType="standard"
      >
        <Marker coordinate={{ latitude: lat, longitude: lng }} pinColor={primary} />
        {safeRadius > 0 && (
          <Circle
            center={{ latitude: lat, longitude: lng }}
            radius={safeRadius}
            strokeColor={primary}
            fillColor={`${primary}30`}
            strokeWidth={2}
          />
        )}
      </MapView>
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

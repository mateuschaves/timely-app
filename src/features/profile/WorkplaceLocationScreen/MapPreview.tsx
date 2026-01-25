import React from 'react';
import { View, StyleSheet, Platform, TouchableOpacity } from 'react-native';
import MapView, { Marker, Circle, PROVIDER_GOOGLE } from 'react-native-maps';
import { useTheme } from '@/theme/context/ThemeContext';
import { LocationCoordinates } from '@/api/types';
import { spacing, borderRadius } from '@/theme';

interface MapPreviewProps {
  location: LocationCoordinates;
  radius?: number;
  height?: number;
  onPress?: () => void;
}

const FALLBACK_LAT = -23.5505;
const FALLBACK_LNG = -46.6333;

export function MapPreview({ location, radius, height = 200, onPress }: MapPreviewProps) {
  const { theme } = useTheme();

  const lat = typeof location?.coordinates?.[1] === 'number' ? location.coordinates[1] : FALLBACK_LAT;
  const lng = typeof location?.coordinates?.[0] === 'number' ? location.coordinates[0] : FALLBACK_LNG;
  const primary = theme?.primary ?? '#000000';
  const safeRadius = typeof radius === 'number' && Number.isFinite(radius) && radius > 0 ? radius : 0;

  const mapView = (
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
      pointerEvents={onPress ? 'none' : 'auto'}
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
  );

  return (
    <View style={[styles.container, { height }]}>
      {mapView}
      {onPress ? (
        <TouchableOpacity
          style={styles.touchOverlay}
          onPress={onPress}
          activeOpacity={1}
        />
      ) : null}
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
    position: 'relative',
  },
  map: {
    flex: 1,
  },
  touchOverlay: {
    ...StyleSheet.absoluteFillObject,
  },
});

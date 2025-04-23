import React, { useMemo } from 'react';
import { Image, Platform, View } from 'react-native';
import { Marker, Polygon, LatLng } from 'react-native-maps';

interface Props {
  bounds: LatLng[];
  image: any; // require(...) or remote URI
}

const getCenter = (points: LatLng[]): LatLng => {
  const lats = points.map((p) => p.latitude);
  const lngs = points.map((p) => p.longitude);
  return {
    latitude: (Math.min(...lats) + Math.max(...lats)) / 2,
    longitude: (Math.min(...lngs) + Math.max(...lngs)) / 2,
  };
};

// Expand polygon by n degrees of latitude/longitude
const expandPolygon = (points: LatLng[], offset = 0.001): LatLng[] => {
  return points.map((p) => ({
    latitude: p.latitude + (p.latitude > 0 ? offset : -offset),
    longitude: p.longitude + (p.longitude > 0 ? offset : -offset),
  }));
};

export const MysteryZone = ({ bounds, image }: Props) => {
  const center = useMemo(() => getCenter(bounds), [bounds]);
  const expandedBounds = useMemo(() => expandPolygon(bounds, 0.001), [bounds]);

  return (
    <>
      {/* Solid inner mask */}
      <Polygon
        coordinates={bounds}
        fillColor="rgba(0,0,0,0.85)"
        strokeColor="transparent"
        strokeWidth={0}
        zIndex={10}
      />

      {/* Outer faded edge */}
      <Polygon
        coordinates={expandedBounds}
        fillColor={Platform.OS === 'ios' ? 'rgba(0,0,0,0.4)' : 'rgba(0,0,0,0.3)'}
        strokeColor="transparent"
        strokeWidth={0}
        zIndex={9}
      />

      {/* Decorative center image */}
      <Marker coordinate={center} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
        <Image
          source={image}
          style={{ width: 90, height: 90, opacity: 0.9 }}
          resizeMode="contain"
        />
      </Marker>
    </>
  );
};

import React from 'react';
import { Image } from 'react-native';
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

export const MysteryZone = ({ bounds, image }: Props) => {
  const center = getCenter(bounds);

  return (
    <>
      <Polygon
        coordinates={bounds}
        fillColor="rgba(255,255,255,0.85)"
        strokeColor="transparent"
        strokeWidth={0}
      />
      <Marker coordinate={center} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false}>
        <Image
          source={image}
          style={{ width: 80, height: 80, opacity: 0.9 }}
          resizeMode="contain"
        />
      </Marker>
    </>
  );
};

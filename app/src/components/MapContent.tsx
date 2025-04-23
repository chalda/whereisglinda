import Constants from 'expo-constants';
import { Asset } from 'expo-asset';
import { MysteryZone } from './MysteryZone';

import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View, Platform, Text } from 'react-native';
import MapView, {
  PROVIDER_GOOGLE,
  MapViewProps,
  Polyline,
  Marker,
  Region,
  Callout,
} from 'react-native-maps';
import { Location } from '../types';

// if (Platform.OS === 'web') {
//   // ts-ignore-next-line
//   Image.resolveAssetSource = (source) => {
//     uri: source;
//   };
// }

// {/* <Image source={Asset.fromModule(require('../assets/logo.png')) */}

const bus = Asset.fromModule(require('../assets/glinda_icon.png'));
const seaMonster = Asset.fromModule(require('../assets/octopus_icon.png'));

//const bus = Image.resolveAssetSource(glinda_icon_source);

type MapContentProps = {
  locations: Location[];
  latestLocation?: Location | null;
  geofence?: Location[] | null; // Ensure geofence is typed as an array of Location
};

const googleMapsApiKey = Constants?.expoConfig?.extra?.googleMapsApiKey;

const BROOKLYN_REGION: Region = {
  latitude: 40.6782,
  longitude: -73.9442,
  latitudeDelta: 0.05,
  longitudeDelta: 0.05,
};

const RECENTER_TIMEOUT_MS = 10000;

const pirateMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#e0d8b0' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#5b4422' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#fcf1dc' }] },
  {
    featureType: 'landscape',
    elementType: 'geometry.fill',
    stylers: [{ color: '#f9f5d7' }],
  },
  {
    featureType: 'administrative',
    elementType: 'geometry',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'poi',
    elementType: 'geometry',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'road',
    elementType: 'geometry',
    stylers: [{ color: '#a68f6a' }],
  },
  {
    featureType: 'water',
    elementType: 'geometry',
    stylers: [{ color: '#a3c7d6' }],
  },
  {
    featureType: 'administrative.country',
    elementType: 'geometry.stroke',
    stylers: [{ color: '#523735' }],
  },
];

const MapContent: React.FC<MapContentProps> = ({ locations, geofence, latestLocation }) => {
  const mapRef = useRef<MapView>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isUserInteracting, setIsUserInteracting] = useState(false);

  const centerMap = (location: Location) => {
    const region: Region = {
      latitude: location.latitude,
      longitude: location.longitude,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };
    mapRef.current?.animateToRegion(region, 1000);
  };

  useEffect(() => {
    if (!latestLocation) {
      mapRef.current?.animateToRegion(BROOKLYN_REGION, 1000);
      return;
    }

    if (!isUserInteracting) {
      centerMap(latestLocation);
    }
  }, [latestLocation, isUserInteracting]);

  const scheduleRecenter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsUserInteracting(false);
    }, RECENTER_TIMEOUT_MS);
  };

  const handleRegionChange = () => {
    if (!isUserInteracting) setIsUserInteracting(true);
    scheduleRecenter();
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={BROOKLYN_REGION}
        onRegionChange={handleRegionChange}
        customMapStyle={pirateMapStyle}
        {...(Platform.OS === 'web' && { googleMapsApiKey })}>
        {/* Path */}
        {locations.length > 1 && (
          <Polyline
            coordinates={locations.map((loc) => ({
              latitude: loc.latitude,
              longitude: loc.longitude,
            }))}
            strokeColor="#b22222"
            strokeWidth={3}
            lineDashPattern={[10, 12]}
          />
        )}

        {/* Marker for last known location */}
        {latestLocation && (
          <Marker
            coordinate={{
              latitude: latestLocation.latitude,
              longitude: latestLocation.longitude,
            }}
            anchor={{ x: 0.5, y: 0.5 }}
            image={bus.uri}
            title="Last Known Location"></Marker>
        )}

        {/* Geofence Polygon */}
        {geofence && <MysteryZone bounds={geofence} image={seaMonster} />}
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    minHeight: 200,
    minWidth: 200,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  fogOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
});

export default MapContent;

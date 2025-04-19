import Constants from 'expo-constants';
import { Asset } from 'expo-asset';

import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View, Platform, Text, Image } from 'react-native';
import MapView, {
  PROVIDER_GOOGLE,
  MapViewProps,
  Polyline,
  Marker,
  Polygon,
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
console.log(bus);
//const bus = Image.resolveAssetSource(glinda_icon_source);

type MapContentProps = {
  locations: Location[];
  geofence?: [Location, Location, Location, Location]; // Rectangular box
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

const seaCreatures = [
  { id: 'snake1', title: 'Sea Serpent', latitude: 40.67, longitude: -73.95 },
  { id: 'kraken', title: 'The Kraken', latitude: 40.66, longitude: -73.92 },
];

const MapContent: React.FC<MapContentProps> = ({ locations, geofence }) => {
  const mapRef = useRef<MapView>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const tiltAnim = useRef(new Animated.Value(0)).current;

  const lastLocation = locations[locations.length - 1];

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
    if (!lastLocation) {
      mapRef.current?.animateToRegion(BROOKLYN_REGION, 1000);
      return;
    }

    if (!isUserInteracting) {
      centerMap(lastLocation);
    }
  }, [lastLocation, isUserInteracting]);

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

  const isInsideGeofence = () => {
    if (!geofence || !lastLocation) return false;

    const lats = geofence.map((pt) => pt.latitude);
    const lngs = geofence.map((pt) => pt.longitude);
    const [minLat, maxLat] = [Math.min(...lats), Math.max(...lats)];
    const [minLng, maxLng] = [Math.min(...lngs), Math.max(...lngs)];

    return (
      lastLocation.latitude >= minLat &&
      lastLocation.latitude <= maxLat &&
      lastLocation.longitude >= minLng &&
      lastLocation.longitude <= maxLng
    );
  };

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(tiltAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
        Animated.timing(tiltAnim, {
          toValue: -1,
          duration: 500,
          useNativeDriver: true,
          easing: Easing.inOut(Easing.sin),
        }),
      ])
    ).start();
  }, []);

  const tilt = tiltAnim.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-5deg', '0deg', '5deg'],
  });

  const getTimeAgo = (timestamp: number | string) => {
    const seconds = Math.floor((Date.now() - new Date(timestamp).getTime()) / 1000);
    if (seconds < 60) return `${seconds}s ago`;
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    return `${Math.floor(seconds / 3600)}h ago`;
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
        {lastLocation && (
          <Marker
            coordinate={{
              latitude: lastLocation.latitude,
              longitude: lastLocation.longitude,
            }}
            anchor={{ x: 0.5, y: 0.5 }}
            image={bus.uri}
            title="Last Known Location">
            {/* <Animated.View style={{ transform: [{ rotate: tilt }] }}>
              <Image
                source={require('../assets/glinda_icon.png')}
                style={{ width: 50, height: 50 }}
                resizeMode="contain"
              />
            </Animated.View> */}
            <Callout>
              <View style={{ padding: 4 }}>
                <Text>Last known location</Text>
              </View>
            </Callout>
          </Marker>
        )}

        {/* Geofence Polygon */}
        {geofence && (
          <Polygon
            coordinates={geofence}
            strokeColor="#8B4513"
            fillColor="rgba(139, 69, 19, 0.1)"
            strokeWidth={2}
          />
        )}

        {/* Sea Creatures */}
        {seaCreatures.map((creature) => (
          <Marker
            key={creature.id}
            coordinate={{
              latitude: creature.latitude,
              longitude: creature.longitude,
            }}
            image={require('../assets/octopus_icon.png')} // custom icon
            title={creature.title}>
            {/* <Image
              source={require('../assets/octopus_icon.png')}
              style={{ width: 40, height: 40 }}
              resizeMode="contain"
            /> */}
          </Marker>
        ))}
      </MapView>

      {/* Fog overlay when inside geofence */}
      {isInsideGeofence() && <View style={styles.fogOverlay} pointerEvents="none" />}
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

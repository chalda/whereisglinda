import React, { useEffect, useContext, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import MapView, {
  PROVIDER_GOOGLE,
  Polyline,
  Marker,
  Region,
  Callout,
} from 'react-native-maps';
import Constants from 'expo-constants';
import { Asset } from 'expo-asset';
import { Location } from '../types';
import { AppContext } from '../AppContext';
import { MysteryZone } from '../components/MysteryZone';

const bus = Asset.fromModule(require('../assets/glinda_icon.png'));
const seaMonster = Asset.fromModule(require('../assets/octopus_icon.png'));

const googleMapsApiKey = Constants?.expoConfig?.extra?.googleMapsApiKey;

const BROOKLYN_REGION: Region = {
  latitude: 40.6782,
  longitude: -73.9442,
  latitudeDelta: 0.12,
  longitudeDelta: 0.12,
};

const Map: React.FC = () => {
  const { locations, latestLocation, geofence, activeTrip } = useContext(AppContext);
  const mapRef = useRef<MapView>(null);

  const [hasCenteredOnce, setHasCenteredOnce] = useState(false);

  const centerOnBus = () => {
    const target = latestLocation || locations?.[locations.length - 1];
    if (target) {
      const region: Region = {
        latitude: target.latitude,
        longitude: target.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      };
      mapRef.current?.animateToRegion(region, 1000);
      setHasCenteredOnce(true);
    }
  };

  useEffect(() => {
    if (!hasCenteredOnce) {
      if (activeTrip && (latestLocation || locations?.length)) {
        centerOnBus();
      } else {
        mapRef.current?.animateToRegion(BROOKLYN_REGION, 1000);
      }
    }
  }, [activeTrip, latestLocation, locations]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        provider={PROVIDER_GOOGLE}
        initialRegion={BROOKLYN_REGION}
        showsUserLocation={false}
        showsMyLocationButton={false}
        toolbarEnabled={false}
        showsCompass={false}
        zoomTapEnabled={true}
        zoomControlEnabled={false}
        pitchEnabled={false}
        rotateEnabled={false}
        customMapStyle={pirateMapStyle}
        onPanDrag={() => setHasCenteredOnce(true)}
        {...(Platform.OS === 'web' && { googleMapsApiKey })}>
        {locations?.length > 1 && (
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

        {(latestLocation || locations?.length > 0) && (
          <Marker
            coordinate={
              latestLocation || locations[locations.length - 1]
            }
            anchor={{ x: 0.5, y: 0.5 }}
            image={bus.uri}
            title="Last Known Location">
            <Callout>
              <Text>Glinda</Text>
            </Callout>
          </Marker>
        )}

        {geofence && <MysteryZone bounds={geofence} image={seaMonster} />}
      </MapView>

      {/* Recenter Button */}
      {activeTrip && (
        <TouchableOpacity style={styles.recenterButton} onPress={centerOnBus}>
          <Text style={styles.recenterText}>🎯 Center</Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const pirateMapStyle = [
  { elementType: 'geometry', stylers: [{ color: '#e0d8b0' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#5b4422' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#fcf1dc' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'road', stylers: [{ color: '#a68f6a' }] },
  { featureType: 'water', stylers: [{ color: '#a3c7d6' }] },
  { featureType: 'administrative', stylers: [{ visibility: 'off' }] },
  {
    featureType: 'all',
    elementType: 'labels',
    stylers: [{ visibility: 'off' }],
  },
  {
    featureType: 'road',
    elementType: 'labels',
    stylers: [{ visibility: 'on' }],
  },
  {
    featureType: 'road',
    elementType: 'labels.text.fill',
    stylers: [{ visibility: 'on', color: '#4d3824' }],
  },
];

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
  recenterButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#FFD800',
    padding: 10,
    borderRadius: 8,
    elevation: 4,
  },
  recenterText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
});

export default Map;

import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import MapView, { PROVIDER_GOOGLE, MapViewProps, Polyline } from 'react-native-maps';
import Constants from 'expo-constants';

type LocationProps = {
  id: string;
  latitude: number;
  longitude: number;
};

type MapContentProps = {
  locations: LocationProps[]; // Updated to use locations instead of markers
};

const googleMapsApiKey = Constants.expoConfig.extra?.googleMapsApiKey;

const MapContent: React.FC<MapContentProps> = ({ locations }) => {
  const initialRegion: MapViewProps['region'] = {
    latitude: 40.6782, // Latitude for Brooklyn, NY
    longitude: -73.9442, // Longitude for Brooklyn, NY
    latitudeDelta: 0.05, // Zoom level for latitude
    longitudeDelta: 0.05, // Zoom level for longitude
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE} // Use Google Maps as the provider
        initialRegion={initialRegion}
        {...(Platform.OS === 'web' && { googleMapsApiKey })} // Pass API key for web
      >
        {/* Render the route as a Polyline */}
        <Polyline
          coordinates={locations.map((location) => ({
            latitude: location.latitude,
            longitude: location.longitude,
          }))}
          strokeColor="#FF0000" // Red color for the route
          strokeWidth={4} // Width of the route line
        />
      </MapView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

export default MapContent;

import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE, MapViewProps } from 'react-native-maps';
import Constants from 'expo-constants';

type MarkerProps = {
  id: string;
  latitude: number;
  longitude: number;
};

type MapContentProps = {
  markers: MarkerProps[];
};

const googleMapsApiKey = Constants.expoConfig.extra?.googleMapsApiKey;

const MapContent: React.FC<MapContentProps> = ({ markers }) => {
  const initialRegion: MapViewProps['region'] = {
    latitude: 37.7749, // Default latitude (e.g., San Francisco)
    longitude: -122.4194, // Default longitude
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  };

  return (
    <View style={styles.container}>
      <MapView
        style={styles.map}
        provider={PROVIDER_GOOGLE} // Use Google Maps as the provider
        initialRegion={initialRegion}
        {...(Platform.OS === 'web' && { googleMapsApiKey })} // Pass API key for web
      >
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            coordinate={{ latitude: marker.latitude, longitude: marker.longitude }}
            title={`Marker ${marker.id}`}
          />
        ))}
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

// const { width, height } = Dimensions.get('window');
// const ASPECT_RATIO = width / height;
// const LATITUDE = 37.78825;
// const LONGITUDE = -122.4324;
// const LATITUDE_DELTA = 0.0922;
// const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

// const region = {
//   latitude: LATITUDE,
//   longitude: LONGITUDE,
//   latitudeDelta: LATITUDE_DELTA,
//   longitudeDelta: LONGITUDE_DELTA,
// };

// export const MapContent = () => {
//   const [map, setMap] = React.useState(null);

//   const onLoad = React.useCallback((m) => {
//     const bounds = new window.google.maps.LatLngBounds({ lat: LATITUDE, lng: LONGITUDE });
//     m.fitBounds(bounds);
//     //   mapref.current.map = map;

//     setMap(m);
//   }, []);

//   const onUnmount = React.useCallback(() => {
//     setMap(null);
//   }, []);

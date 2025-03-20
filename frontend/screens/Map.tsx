import { RouteProp, useRoute } from '@react-navigation/native';
import { StyleSheet, View } from 'react-native';
import React from 'react';

import { RootStackParamList } from '../navigation';
import LocationMarkers from '../components/LocationMarkers'; // Import the new LocationMarkers component

type MapScreenRouteProp = RouteProp<RootStackParamList, 'Map'>;

export default function Map() {
  const prop = useRoute<MapScreenRouteProp>();

  return (
    <View style={styles.container}>
      <LocationMarkers /> {/* Use the LocationMarkers component */}
    </View>
  );
}

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    width: '100%',
    height: '100%',
    minHeight: 200,
    minWidth: 200,
  },
  map: {
    flex: 1,
    padding: 24,
    width: '100%',
    height: '100%',
    minHeight: 200,
    minWidth: 200,
  },
});
// // import * as location from 'expo-location';
// import { StyleSheet, Text, View, Dimensions } from 'react-native';
// import MapView from 'src/node_modules/react-native-web-maps/dist/index.js';

// import { Container } from './Container';

// // type MapContentProps = {
// //   title: string;
// //   path: string;
// // };

// export const MapContent = () => {
//   // const { width, height } = Dimensions.get('window');
//   // const ASPECT_RATIO = width / height;
//   const LATITUDE = 37.78825;
//   const LONGITUDE = -122.4324;
//   const LATITUDE_DELTA = 0.0922;
//   //const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;
//   const LONGITUDE_DELTA = LATITUDE_DELTA * 1;

//   const region = {
//     latitude: LATITUDE,
//     longitude: LONGITUDE,
//     latitudeDelta: LATITUDE_DELTA,
//     longitudeDelta: LONGITUDE_DELTA,
//   };
//   const center = {
//     lat: -3.745,
//     lng: -38.523,
//   };

//   // const mapref = useRef(null);

//   // const [loaded, setLoaded] = React.useState(false);
//   // React.useEffect(() => {
//   //   setLoaded(isLoaded);
//   // }, [isLoaded]);

//   // const [map, setMap] = React.useState(null);

//   // const onLoad = React.useCallback((map) => {
//   //   // This is just an example of getting and using the map instance!!! don't just blindly copy!
//   //   const bounds = new window.google.maps.LatLngBounds(center);
//   //   map.fitBounds(bounds);
//   //   //  mapref.current.map = map;

//   //   setMap(map);
//   // }, []);

//   // const onUnmount = React.useCallback(function callback(map) {
//   //   setMap(null);
//   // }, []);

//   // console.log(isLoaded);
//   // debugger;

//   // const [map, setMap] = React.useState(null);

//   // const onLoad = React.useCallback(function callback(m) {
//   //   // This is just an example of getting and using the map instance!!! don't just blindly copy!
//   //   // const bounds = new window.google.maps.LatLngBounds(center);
//   //   mapref.current.map = m;

//   //   setMap(m);
//   // }, []);

//   // const onUnmount = React.useCallback(function callback(m) {
//   //   setMap(null);
//   // }, []);
//   return (
//     <MapView
//       region={region}
//       onRegionChange={() => {}}
//       onPress={() => {}}
//       defaultZoom={15}
//       // center={center}
//       // zoom={15}
//       // onLoad={onLoad}
//       // onUnmount={onUnmount}
//       onZoomChanged={() => {}}
//       // ref={mapref}
//       initialRegion={region}
//     />
//   );
// };

// //      <LoadScript>

// //

// /* <MapView style={styles.map} options={6} provider={PROVIDER_GOOGLE} initialRegion={region */
// const styles = StyleSheet.create({
//   separator: {
//     backgroundColor: '#d1d5db',
//     height: 1,
//     marginVertical: 30,
//     width: '80%',
//   },
//   title: {
//     fontSize: 20,
//     fontWeight: 'bold',
//   },
//   container: {
//     ...StyleSheet.absoluteFillObject,
//     justifyContent: 'flex-end',
//     alignItems: 'center',
//   },
//   map: {
//     ...StyleSheet.absoluteFillObject,
//   },
// });

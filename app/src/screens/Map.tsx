import React, { useContext } from 'react';
import { View, StyleSheet } from 'react-native';

import MapContent from '../components/MapContent';
import { AppContext } from '../AppContext';

import { RouteProp } from '@react-navigation/native';

import { HeaderNavigatorParamList } from '../navigation';

type MapScreenRouteProp = RouteProp<HeaderNavigatorParamList, 'Map'>;

const Map: React.FC = () => {
  const { locations, latestLocation, geofence } = useContext(AppContext);

  return (
    <View style={styles.container}>
      <MapContent locations={locations} latestLocation={latestLocation} geofence={geofence} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Map;

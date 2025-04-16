import React, { useEffect, useContext } from 'react';
import { View, StyleSheet } from 'react-native';

import AppControls from '../components/AppControls';
import MapContent from '../components/MapContent';
import { AppContext } from '../AppContext';

import { RouteProp } from '@react-navigation/native';

import { RootStackParamList } from '../navigation/RootStack';

type MapScreenRouteProp = RouteProp<RootStackParamList, 'Map'>;

const Map: React.FC = () => {
  const { locations } = useContext(AppContext);

  return (
    <View style={styles.container}>
      <AppControls />
      <MapContent locations={locations} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default Map;

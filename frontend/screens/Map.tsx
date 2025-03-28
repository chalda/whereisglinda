import React, { useEffect, useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import MapContent from '../components/MapContent';
import AppControls from '../components/AppControls';
import { AppContext } from '../context/AppContext';
import { fetchAppState, fetchLocations } from '../utils/api';

const Map: React.FC = () => {
  const { locations, setLocations, setAppState } = useContext(AppContext);

  const loadAppState = async () => {
    try {
      const data = await fetchAppState(); // Fetch app state without an API key
      setAppState(data);
    } catch (err) {
      console.error('Failed to fetch app state:', err.message);
    }
  };

  const loadLocations = async () => {
    try {
      const data = await fetchLocations(); // Fetch locations without an API key
      setLocations(data);
    } catch (err) {
      console.error('Failed to fetch locations:', err.message);
    }
  };

  const handleRefresh = async () => {
    await loadAppState();
    await loadLocations();
  };

  useEffect(() => {
    handleRefresh();
  }, []);

  return (
    <View style={styles.container}>
      <AppControls onRefresh={handleRefresh} />
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

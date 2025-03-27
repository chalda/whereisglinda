import React, { useEffect, useContext } from 'react';
import { View, StyleSheet } from 'react-native';
import MapContent from '../components/MapContent';
import AppControls from '../components/AppControls';
import { AppContext } from '../context/AppContext';
import { apiFetch } from '../utils/api';
import { Location } from '../types';

const Map: React.FC = () => {
  const { locations, setLocations, setAppState } = useContext(AppContext);

  const fetchAppState = async () => {
    try {
      const data = await apiFetch(null, '/state'); // Fetch app state without an API key
      setAppState(data);
    } catch (err) {
      console.error('Failed to fetch app state:', err.message);
    }
  };

  const fetchLocations = async () => {
    try {
      const data = await apiFetch<Location[]>(null, '/api/locations'); // Fetch locations without an API key
      setLocations(data);
    } catch (err) {
      console.error('Failed to fetch locations:', err.message);
    }
  };

  const handleRefresh = async () => {
    await fetchAppState();
    await fetchLocations();
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

import React, { useContext, useEffect, useState } from 'react';
import { View, Text, StyleSheet, Button } from 'react-native';
import { AppContext } from '../context/AppContext';
import MapContent from '../components/MapContent';

const Map = () => {
  const { appState, locations, setLocations, fetchAppStateAndLocations, apiKey } =
    useContext(AppContext); // Ensure setLocations and apiKey are retrieved from AppContext
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Function to handle manual refresh
  const handleRefresh = async () => {
    await fetchAppStateAndLocations();
  };

  // Effect to manage location subscription based on rideStatus
  useEffect(() => {
    let eventSource;

    const subscribeToLocations = async () => {
      try {
        eventSource = new EventSource('http://localhost:8080/subscribe', {
          headers: { Authorization: apiKey }, // Use apiKey from AppContext
        });

        eventSource.onmessage = (event) => {
          const location = JSON.parse(event.data);
          setLocations((prevLocations) => [...prevLocations, location]); // Use setLocations from AppContext
        };

        eventSource.onerror = () => {
          console.error('Error with location subscription');
          eventSource.close();
        };
      } catch (error) {
        console.error('Failed to subscribe to locations:', error);
      }
    };

    if (appState.rideStatus !== 'Home' && !isSubscribed) {
      console.log('Activating location subscription...');
      subscribeToLocations();
      setIsSubscribed(true);
    } else if (appState.rideStatus === 'Home' && isSubscribed) {
      console.log('Deactivating location subscription...');
      if (eventSource) {
        eventSource.close();
      }
      setIsSubscribed(false);
    }

    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [appState.rideStatus, isSubscribed]);

  return (
    <View style={styles.container}>
      {/* Display the ride status */}
      <View style={styles.statusContainer}>
        <Text style={styles.statusText}>{appState.rideStatus}</Text>
        <Button title="Refresh" onPress={handleRefresh} />
      </View>

      {/* Use MapContent to render the map and markers */}
      <MapContent markers={locations} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  statusContainer: {
    backgroundColor: '#000',
    padding: 16,
    alignItems: 'center',
  },
  statusText: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
});

export default Map;

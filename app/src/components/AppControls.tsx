import React, { useContext, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Switch } from 'react-native';

import LocationTracker from './LocationTracker'; // Import LocationTracker for location tracking
import { AppContext } from '../AppContext'; // Import AppContext for global state
import { createNewTrip, setRideStatus } from '../utils/api'; // Import updateAppState for API calls

//type AppControlsProps

const AppControls = () => {
  const { apiKey, userRole, appState, setAppState } = useContext(AppContext);
  const [geobox, setGeobox] = useState<string>(JSON.stringify(appState?.homeGeobox || []));
  const [trackingEnabled, setTrackingEnabled] = useState<boolean>(false);

  const canEditAppStatus = userRole === 'admin' || userRole === 'driver';
  const canEditGeobox = userRole === 'admin';
  const canEditTracking = userRole === 'admin' || userRole === 'bus';
  const canCreateNewTrip = userRole === 'admin' || userRole === 'driver' || userRole === 'bus';

  // const handleUpdateHomeGeobox = async () => {
  //   try {
  //     const updatedAppState = {
  //       tripId: appState.i
  //       homeGeobox: JSON.parse(geobox),
  //     };

  //     const response = await setHomeGeobox(apiKey!, homeGeobox);
  //     setAppState(response);
  //     console.log('App state updated successfully');
  //   } catch (err) {
  //     console.error('Failed to update app state:', err.message);
  //   }
  // };
  const handleCreateNewTrip = async () => {
    try {
      const response = await createNewTrip(apiKey);
      // Update app state with new trip ID
      setAppState({ ...appState, activeTripId: response.tripId });
    } catch (err) {
      console.error('Failed to create new trip:', err.message);
    }
  };

  const handleUpdateAppStatus = async (newStatus: string) => {
    try {
      const response = await setRideStatus(apiKey, newStatus);
      // Update app state with new trip ID
      setAppState({ ...appState, rideStatus: newStatus });
    } catch (err) {
      console.error('Failed to create new trip:', err.message);
    }
  };

  if (!userRole) {
    // If the user is not authenticated, only show the status as text
    return (
      <View style={styles.container}>
        <Text style={styles.label}>Bus Status:</Text>
        <Text style={styles.text}>{appState?.rideStatus || 'N/A'}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Ride Status:</Text>
      <TextInput
        style={styles.input}
        value={appState?.rideStatus}
        onChangeText={handleUpdateAppStatus}
        placeholder="Ride Status"
        disabled={!canEditAppStatus}
      />

      <Button title="Start New Trip" onPress={handleCreateNewTrip} disabled={!canCreateNewTrip} />

      <Text style={styles.label}>Geobox:</Text>
      {canEditGeobox ? (
        <TextInput
          style={styles.input}
          value={geobox}
          onChangeText={setGeobox}
          placeholder="Geobox JSON"
        />
      ) : (
        <Text style={styles.text}>{JSON.stringify(appState?.homeGeobox || [])}</Text>
      )}

      <Text style={styles.label}>Turn on bus tracking:</Text>
      <Switch
        value={trackingEnabled}
        onValueChange={setTrackingEnabled}
        disabled={!canEditTracking || appState?.rideStatus === 'Home'}
      />
      {appState.rideStatus === 'Home' ? (
        <Text style={styles.text}>Tracking is turned off while inside the home geobox</Text>
      ) : null}

      <LocationTracker
        apiKey={apiKey}
        trackingEnabled={trackingEnabled}
        rideStatus={appState?.rideStatus || ''}
        activeTripId={appState?.activeTripId}
        onTrackingDisabled={() => setTrackingEnabled(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#f9f9f9',
    borderBottomWidth: 1,
    borderColor: '#ccc',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 4,
    marginTop: 4,
  },
  text: {
    fontSize: 16,
    marginTop: 4,
  },
});

export default AppControls;

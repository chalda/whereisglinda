import React, { useContext, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Switch } from 'react-native';

import LocationTracker from './LocationTracker'; // Import LocationTracker for location tracking
import { AppContext } from '../context/AppContext'; // Import AppContext for global state
import { createNewTrip, setRideStatus } from '../utils/api'; // Import updateAppState for API calls

type AppControlsProps = {
  onRefresh: () => void;
};

const AppControls: React.FC<AppControlsProps> = ({ onRefresh }) => {
  const { apiKey, userRole, appState, setAppState } = useContext(AppContext);
  const [geobox, setGeobox] = useState<string>(JSON.stringify(appState?.homeGeobox || []));
  const [trackingEnabled, setTrackingEnabled] = useState<boolean>(false);

  const canEditAppStatus = userRole === 'admin';
  const canEditGeobox = userRole === 'admin';
  const canEditTracking = userRole === 'admin' || userRole === 'driver' || userRole === 'bus';
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
      const newTripId = await createNewTrip(apiKey);
      // Update app state with new trip ID
      setAppState({ ...appState, tripId: newTripId.tripID });
    } catch (err) {
      console.error('Failed to create new trip:', err.message);
    }
  };

  const handleUpdateAppStatus = async (newStatus: string) => {
    try {
      const newTripId = await setRideStatus(apiKey, newStatus);
      // Update app state with new trip ID
      setAppState({ ...appState, rideStatus: newStatus });
    } catch (err) {
      console.error('Failed to create new trip:', err.message);
    }
  };

  if (!apiKey) {
    // If the user is not authenticated, only show the status as text
    return (
      <View style={styles.container}>
        <Text style={styles.label}>App Status:</Text>
        <Text style={styles.text}>{appState?.rideStatus || 'N/A'}</Text>
        <Button title="Refresh" onPress={onRefresh} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>App Status:</Text>
      {canEditAppStatus ? (
        <TextInput
          style={styles.input}
          value={appState.rideStatus}
          onChangeText={handleUpdateAppStatus}
          placeholder="Ride Status"
        />
      ) : (
        <Text style={styles.text}>{appState?.rideStatus || 'N/A'}</Text>
      )}
      <Button title="Refresh" onPress={onRefresh} />

      {canCreateNewTrip && <Button title="Start New Trip" onPress={handleCreateNewTrip} />}

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

      <Text style={styles.label}>Tracking:</Text>
      {canEditTracking ? (
        <Switch value={trackingEnabled} onValueChange={setTrackingEnabled} />
      ) : (
        <Text style={styles.text}>{trackingEnabled ? 'Enabled' : 'Disabled'}</Text>
      )}

      <LocationTracker
        apiKey={apiKey}
        trackingEnabled={trackingEnabled}
        rideStatus={appState?.rideStatus || ''}
        tripId={appState?.tripId}
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

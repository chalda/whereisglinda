import React, { useContext, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Switch } from 'react-native';
import { AppContext } from '../context/AppContext'; // Import AppContext for global state
import LocationTracker from './LocationTracker'; // Import LocationTracker for location tracking
import { updateAppState, createNewTrip } from '../utils/api'; // Import updateAppState for API calls

type AppControlsProps = {
  onRefresh: () => void;
};

const AppControls: React.FC<AppControlsProps> = ({ onRefresh }) => {
  const { apiKey, userRole, appState, setAppState } = useContext(AppContext);
  const [rideId, setRideId] = useState<string>(appState?.rideStatus || '');
  const [geobox, setGeobox] = useState<string>(JSON.stringify(appState?.homeGeobox || []));
  const [trackingEnabled, setTrackingEnabled] = useState<boolean>(false);

  const canEditAppStatus = userRole === 'admin';
  const canEditRideId = userRole === 'admin' || userRole === 'driver';
  const canEditGeobox = userRole === 'admin';
  const canEditTracking = userRole === 'admin' || userRole === 'driver' || userRole === 'bus';
  const canCreateNewTrip = userRole === 'admin' || userRole === 'driver' || userRole === 'bus';

  const handleUpdateAppState = async () => {
    try {
      const updatedAppState = {
        rideStatus: rideId,
        homeGeobox: JSON.parse(geobox),
      };

      const response = await updateAppState(apiKey!, updatedAppState);
      setAppState(response);
      console.log('App state updated successfully');
    } catch (err) {
      console.error('Failed to update app state:', err.message);
    }
  };
  const handleCreateNewTrip = async () => {
    try {
      const newTripId = await createNewTrip(apiKey);
      // Update app state with new trip ID
      setAppState({ ...appState, tripId: newTripId.tripID });
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
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.label}>App Status:</Text>
      {canEditAppStatus ? (
        <TextInput
          style={styles.input}
          value={rideId}
          onChangeText={setRideId}
          placeholder="App Status"
        />
      ) : (
        <Text style={styles.text}>{appState?.rideStatus || 'N/A'}</Text>
      )}

      {canCreateNewTrip && <Button title="New Trip" onPress={handleCreateNewTrip} />}

      <Text style={styles.label}>Ride ID:</Text>
      {canEditRideId ? (
        <TextInput
          style={styles.input}
          value={rideId}
          onChangeText={setRideId}
          placeholder="Ride ID"
        />
      ) : (
        <Text style={styles.text}>{appState?.rideStatus || 'N/A'}</Text>
      )}

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

      {(canEditAppStatus || canEditRideId || canEditGeobox || canEditTracking) && (
        <Button title="Update App State" onPress={handleUpdateAppState} />
      )}

      <Button title="Refresh" onPress={onRefresh} />

      <LocationTracker
        apiKey={apiKey}
        trackingEnabled={trackingEnabled}
        rideStatus={appState?.rideStatus || ''}
        rideId={rideId}
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

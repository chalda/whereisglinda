import React, { useContext, useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Switch } from 'react-native';

import LocationTracker from './LocationTracker'; // Import LocationTracker for location tracking
import { AppContext } from '../AppContext'; // Import AppContext for global state
import { createNewTrip, updateTrip, fetchAppState, endTrip } from '../utils/api'; // Import updateAppState for API calls

const AppControls = () => {
  const { apiKey, userRole, appState, setAppState } = useContext(AppContext);
  const [geobox, setGeobox] = useState<string>(JSON.stringify(appState?.homeGeobox || []));
  const [trackingEnabled, setTrackingEnabled] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);
  const [rideStatus, setRideStatus] = useState<string>(appState?.rideStatus || '');

  const canEditAppStatus = userRole === 'admin' || userRole === 'driver';
  const canEditGeobox = userRole === 'admin';
  const canEditTracking = userRole === 'admin' || userRole === 'bus';
  const canCreateNewTrip = userRole === 'admin' || userRole === 'driver' || userRole === 'bus';

  const handleCreateNewTrip = async () => {
    try {
      setLoading(true);
      const response = await createNewTrip(apiKey);
      setAppState({ ...appState, activeTripId: response.tripId });
    } catch (err) {
      console.error('Failed to create new trip:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEndTrip = async () => {
    try {
      setLoading(true);
      await endTrip(apiKey);
      // Refetch app state after ending the trip
      const updatedAppState = await fetchAppState(apiKey);
      setAppState(updatedAppState);
    } catch (err) {
      console.error('Failed to end trip:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAppStatus = async () => {
    if (!appState?.activeTripId) {
      console.error('No active trip to update ride status.');
      return;
    }

    try {
      setLoading(true);
      await updateTrip(apiKey, appState.activeTripId, { rideStatus });
      setAppState({ ...appState, rideStatus });
    } catch (err) {
      console.error('Failed to update ride status:', err.message);
    } finally {
      setLoading(false);
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

  const isDisabled = appState?.activeTripId === null;

  return (
    <View style={styles.container}>
      {appState?.activeTripId ? (
        <View style={styles.row}>
          <Text style={styles.label}>Trip Number: {appState.activeTripId}</Text>
          <Button title="End Trip" onPress={handleEndTrip} disabled={loading} />
        </View>
      ) : (
        <Button
          title="Start New Trip"
          onPress={handleCreateNewTrip}
          disabled={loading || !canCreateNewTrip}
        />
      )}

      <Text style={styles.label}>Ride Status:</Text>
      <TextInput
        style={styles.input}
        value={rideStatus}
        onChangeText={setRideStatus}
        onBlur={handleUpdateAppStatus}
        placeholder="Ride Status"
        editable={!isDisabled && canEditAppStatus}
      />

      <Text style={styles.label}>Geobox:</Text>
      {canEditGeobox ? (
        <TextInput
          style={styles.input}
          value={geobox}
          onChangeText={setGeobox}
          placeholder="Geobox JSON"
          editable={!isDisabled}
        />
      ) : (
        <Text style={styles.text}>{JSON.stringify(appState?.homeGeobox || [])}</Text>
      )}

      <Text style={styles.label}>Turn on bus tracking:</Text>
      <Switch
        value={trackingEnabled}
        onValueChange={setTrackingEnabled}
        disabled={!canEditTracking || isDisabled || appState?.rideStatus === 'Not active'}
      />
      {appState?.rideStatus === 'Not active' ? (
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
});

export default AppControls;

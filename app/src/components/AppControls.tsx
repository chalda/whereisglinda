import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

import LocationTracker from './LocationTracker';
import { AppContext } from '../AppContext';
import { createNewTrip, updateTrip, endTrip, fetchActiveTrip } from '../utils/api';

const AppControls = () => {
  const { apiKey, userRole, activeTrip, activeTripId, setActiveTrip, geobox } = useContext(AppContext);
  const [loading, setLoading] = useState<boolean>(false);
  const [trackingEnabled, setTrackingEnabled] = useState<boolean>(false);

  const canEditAppStatus = userRole === 'admin' || userRole === 'driver';
  const canCreateNewTrip = userRole === 'admin' || userRole === 'driver' || userRole === 'bus';

  const refetchActiveTrip = async () => {
    try {
      const trip = await fetchActiveTrip(apiKey);
      setActiveTrip(trip);

      // Disable tracking if the trip is no longer active
      if (!trip || trip.rideStatus === 'Not active') {
        setTrackingEnabled(false);
      }
    } catch (err) {
      console.error('Failed to refetch active trip:', err.message);
    }
  };

  const handleCreateNewTrip = async () => {
    try {
      setLoading(true);
      await createNewTrip(apiKey);
      await refetchActiveTrip();
      setTrackingEnabled(true); // Enable tracking when a new trip is started
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
      await refetchActiveTrip();
      setTrackingEnabled(false); // Disable tracking when the trip ends
    } catch (err) {
      console.error('Failed to end trip:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateRideStatus = async (newRideStatus: string) => {
    if (!activeTrip) {
      console.error('No active trip to update ride status.');
      return;
    }

    try {
      setLoading(true);
      await updateTrip(apiKey, activeTripId!, { rideStatus: newRideStatus });
      setActiveTrip({ ...activeTrip, rideStatus: newRideStatus });
    } catch (err) {
      console.error('Failed to update ride status:', err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {activeTrip ? (
        <View style={styles.row}>
          <Text style={styles.label}>Trip Number: {activeTripId}</Text>
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
      <Text style={styles.text}>{activeTrip?.rideStatus || 'N/A'}</Text>

      <Text style={styles.label}>Geobox:</Text>
      {geobox ? (
        <Text style={styles.text}>{JSON.stringify(geobox, null, 2)}</Text> // Prettified JSON
      ) : (
        <Text style={styles.text}>Loading geobox...</Text>
      )}

      <LocationTracker
        apiKey={apiKey}
        trackingEnabled={trackingEnabled}
        activeTripId={activeTripId}
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
  text: {
    fontSize: 16,
    marginTop: 4,
    fontFamily: 'monospace', // Optional: Use monospace font for JSON
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
});

export default AppControls;

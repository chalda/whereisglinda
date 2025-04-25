import React, { useContext, useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, TextInput } from 'react-native';

import { AppContext } from '../AppContext';
import { createNewTrip, updateTrip, endTrip, fetchActiveTrip } from '../utils/api';

const AppControls = () => {
  const { apiKey, userRole, activeTrip, setActiveTrip, geofence, setLocationTrackingEnabled } =
    useContext(AppContext);
  const [loading, setLoading] = useState<boolean>(false);

  const canEditAppStatus = userRole === 'admin' || userRole === 'driver';
  const canCreateNewTrip = userRole === 'admin' || userRole === 'driver' || userRole === 'bus';

  const handleCreateNewTrip = async () => {
    try {
      setLoading(true);
      await createNewTrip(apiKey);
      const trip = await fetchActiveTrip(apiKey);
      setActiveTrip(trip);
      setLocationTrackingEnabled(!!trip?.tripId);
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
      const trip = await fetchActiveTrip(apiKey);
      setActiveTrip(trip);
      setLocationTrackingEnabled(!!trip?.tripId);
    } catch (err) {
      console.error('Failed to end trip:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // const handleUpdateRideStatus = async (newRideStatus: string) => {
  //   if (!activeTrip) {
  //     console.error('No active trip to update ride status.');
  //     return;
  //   }

  //   try {
  //     setLoading(true);
  //     await updateTrip(apiKey, activeTripId!, { rideStatus: newRideStatus });
  //     setActiveTrip({ ...activeTrip, rideStatus: newRideStatus });
  //   } catch (err) {
  //     console.error('Failed to update ride status:', err.message);
  //   } finally {
  //     setLoading(false);
  //   }
  // };

  return (
    <View style={styles.container}>
      {activeTrip ? (
        <View style={styles.row}>
          <Text style={styles.label}>Trip Number: {activeTrip?.tripId}</Text>
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

      <Text style={styles.label}>Geofence:</Text>
      {geofence ? (
        <Text style={styles.text}>{JSON.stringify(geofence, null, 2)}</Text> // Prettified JSON
      ) : (
        <Text style={styles.text}>Loading geofence...</Text>
      )}
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

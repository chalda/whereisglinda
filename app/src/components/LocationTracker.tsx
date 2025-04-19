import * as Location from 'expo-location';
import React, { useEffect, useRef } from 'react';
import { Alert, Platform } from 'react-native';

import { sendLocation } from '../utils/api';

type LocationTrackerProps = {
  apiKey: string;
  trackingEnabled: boolean;
  rideStatus: string;
  activeTripId: number;
  onTrackingDisabled: () => void;
};

const LocationTracker: React.FC<LocationTrackerProps> = ({
  apiKey,
  trackingEnabled,
  rideStatus,
  activeTripId,
  onTrackingDisabled,
}) => {
  // Use 'number' instead of 'NodeJS.Timeout'
  const trackingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const requestLocationPermission = async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'web') {
        return true;
      }

      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Denied', 'Location permission is required to enable tracking.');
        return false;
      }

      return true;
    } catch (err) {
      console.error('Error requesting location permission:', err);
      Alert.alert('Error', 'Failed to request location permission.');
      return false;
    }
  };

  const startLocationTracking = async () => {
    if (trackingIntervalRef.current) {
      return; // Prevent multiple intervals
    }
  
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      onTrackingDisabled();
      return;
    }
  
    trackingIntervalRef.current = setInterval(async () => {
      try {
        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;
  
        await sendLocation(apiKey, latitude, longitude, activeTripId);
        console.log('Location sent to backend:', { latitude, longitude, activeTripId });
      } catch (err) {
        console.error('Failed to send location:', err.message);
      }
    }, 5000);
  };

  const stopLocationTracking = () => {
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
      trackingIntervalRef.current = null;
      console.log('Location tracking stopped.');
    }
  };

  useEffect(() => {
    if (rideStatus === 'Home' && trackingEnabled) {
      Alert.alert(
        'Tracking Disabled',
        'Location tracking has been stopped because the status is "Home".'
      );
      onTrackingDisabled();
      stopLocationTracking();
      return;
    }

    if (trackingEnabled) {
      startLocationTracking();
    } else {
      stopLocationTracking();
    }

    return () => {
      stopLocationTracking();
    };
  }, [trackingEnabled, rideStatus]);

  return null;
};

export default LocationTracker;

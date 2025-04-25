import * as Location from 'expo-location';
import React, { useEffect, useRef } from 'react';
import { Alert, Platform } from 'react-native';

import { sendLocation } from '../utils/api';
import { TripLocation } from '../types';

type LocationTrackerProps = {
  apiKey: string;
  trackingEnabled: boolean;
  activeTripId: number | null | undefined;
  onTrackingDisabled?: () => void;
};

const LocationTracker: React.FC<LocationTrackerProps> = ({
  apiKey,
  trackingEnabled,
  activeTripId,
  onTrackingDisabled = () => {}, // Default no-op function
}) => {
  const trackingIntervalRef = useRef<number | null>(null); // Use `number` for React Native

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
      const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
      if (backgroundStatus !== 'granted') {
        console.log('Background location permission denied');
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

        await sendLocation(apiKey, latitude, longitude, activeTripId!);
        console.log('Location sent to backend:', { latitude, longitude, activeTripId });
      } catch (err) {
        console.error('Failed to send location:', err.message);
      }
    }, 5000) as unknown as number; // Cast to `number` for React Native
  };

  const stopLocationTracking = () => {
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
      trackingIntervalRef.current = null;
      console.log('Location tracking stopped.');
    }
  };

  useEffect(() => {
    if (!activeTripId && trackingEnabled) {
      Alert.alert(
        'Tracking Disabled',
        'Location tracking has been stopped because the trip is no longer active.'
      );
      onTrackingDisabled();
      stopLocationTracking();
      return;
    }

    if (trackingEnabled) {
      startLocationTracking();
    } else {
      onTrackingDisabled();
      stopLocationTracking();
    }

    return () => {
      onTrackingDisabled();
      stopLocationTracking();
    };
  }, [trackingEnabled, activeTripId]);

  return null;
};

export default LocationTracker;

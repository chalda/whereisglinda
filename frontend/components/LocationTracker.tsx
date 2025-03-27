import React, { useEffect, useRef } from 'react';
import { Alert, Platform } from 'react-native';
import * as Location from 'expo-location'; // Import expo-location for location handling
import { apiFetch } from '../utils/api'; // Import apiFetch for API calls

type LocationTrackerProps = {
  apiKey: string;
  trackingEnabled: boolean;
  rideStatus: string;
  rideId: string;
  onTrackingDisabled: () => void; // Callback to disable tracking when rideStatus is "Home"
};

const LocationTracker: React.FC<LocationTrackerProps> = ({
  apiKey,
  trackingEnabled,
  rideStatus,
  rideId,
  onTrackingDisabled,
}) => {
  const trackingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Request location permissions
  const requestLocationPermission = async (): Promise<boolean> => {
    try {
      if (Platform.OS === 'web') {
        // Web does not require explicit permission handling
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

  // Start location tracking
  const startLocationTracking = async () => {
    const hasPermission = await requestLocationPermission();
    if (!hasPermission) {
      onTrackingDisabled(); // Disable tracking if permission is denied
      return;
    }

    trackingIntervalRef.current = setInterval(async () => {
      try {
        const location = await Location.getCurrentPositionAsync({});
        const { latitude, longitude } = location.coords;

        // Send location to the backend
        await apiFetch(apiKey, '/handlers/locations', {
          method: 'POST',
          body: JSON.stringify({ latitude, longitude, rideId }),
        });
        console.log('Location sent to backend:', { latitude, longitude, rideId });
      } catch (err) {
        console.error('Failed to send location:', err.message);
      }
    }, 5000); // Send location every 5 seconds
  };

  // Stop location tracking
  const stopLocationTracking = () => {
    if (trackingIntervalRef.current) {
      clearInterval(trackingIntervalRef.current);
      trackingIntervalRef.current = null;
      console.log('Location tracking stopped.');
    }
  };

  useEffect(() => {
    // Stop location tracking if the status is "Home"
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
      stopLocationTracking(); // Cleanup on component unmount
    };
  }, [trackingEnabled, rideStatus]);

  return null; // This component does not render anything
};

export default LocationTracker;

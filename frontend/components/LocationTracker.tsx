import React, { useEffect } from 'react';
import { Alert, Platform, PermissionsAndroid } from 'react-native';

type LocationTrackerProps = {
  apiKey: string;
  trackingEnabled: boolean;
};

const LocationTracker: React.FC<LocationTrackerProps> = ({ apiKey, trackingEnabled }) => {
  useEffect(() => {
    let intervalId: number | null = null;

    const requestLocationPermission = async () => {
      if (Platform.OS === 'android') {
        try {
          const granted = await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
            {
              title: 'Location Permission',
              message: 'This app needs access to your location to track your position.',
              buttonNeutral: 'Ask Me Later',
              buttonNegative: 'Cancel',
              buttonPositive: 'OK',
            }
          );
          return granted === PermissionsAndroid.RESULTS.GRANTED;
        } catch (err) {
          console.warn(err);
          return false;
        }
      }
      return true; // iOS and web handle permissions differently
    };

    const sendLocationUpdate = async (latitude: number, longitude: number) => {
      try {
        const response = await fetch('/api/location-update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ apiKey, latitude, longitude }),
        });

        if (!response.ok) {
          console.error('Failed to send location update:', await response.text());
        }
      } catch (error) {
        console.error('Error sending location update:', error);
      }
    };

    const startTracking = async () => {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) {
        showAlert('Permission Denied', 'Location permission is required to track your position.');
        return;
      }

      intervalId = window.setInterval(() => {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            sendLocationUpdate(latitude, longitude);
          },
          (error) => {
            console.error('Error fetching location:', error);
            showAlert('Location Error', 'Unable to fetch location. Please check your settings.');
          },
          { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
        );
      }, 30000); // Send location every 30 seconds
    };

    const showAlert = (title: string, message: string) => {
      if (Platform.OS === 'web') {
        window.alert(`${title}: ${message}`);
      } else {
        Alert.alert(title, message);
      }
    };

    if (trackingEnabled) {
      startTracking();
    } else if (intervalId !== null) {
      clearInterval(intervalId);
    }

    return () => {
      if (intervalId !== null) {
        clearInterval(intervalId);
      }
    };
  }, [trackingEnabled, apiKey]);

  return null; // This component does not render anything
};

export default LocationTracker;

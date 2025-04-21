import * as Location from 'expo-location';
import { Platform } from 'react-native';

const requestLocationPermissions = async () => {
  if (Platform.OS === 'web') {
    // Web-specific logic
    if (!navigator.geolocation) {
      console.log('Geolocation is not supported by this browser.');
      return;
    }

    try {
      const permission = await navigator.permissions.query({ name: 'geolocation' });
      if (permission.state === 'granted') {
        console.log('Location permissions granted');
      } else if (permission.state === 'prompt') {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            console.log('Location permissions granted:', position);
          },
          (error) => {
            console.error('Location permissions denied:', error);
          }
        );
      } else {
        console.log('Location permissions denied');
      }
    } catch (error) {
      console.error('Error requesting location permissions:', error);
    }
  } else {
    // iOS and Android-specific logic
    try {
      const { status: foregroundStatus } = await Location.requestForegroundPermissionsAsync();
      if (foregroundStatus !== 'granted') {
        console.log('Foreground location permission denied');
        return;
      }

      if (Platform.OS !== 'web') {
        const { status: backgroundStatus } = await Location.requestBackgroundPermissionsAsync();
        if (backgroundStatus !== 'granted') {
          console.log('Background location permission denied');
          return;
        }
      }

      console.log('Location permissions granted');
    } catch (error) {
      console.error('Error requesting location permissions:', error);
    }
  }
};

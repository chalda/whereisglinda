import React, { useEffect, useState } from 'react';
import { Alert, Platform } from 'react-native';
import MapContent from '../MapContent'; // Assuming MapContent is the map component

type Marker = {
  id: string;
  latitude: number;
  longitude: number;
};

const LocationMarkers: React.FC = () => {
  const [markers, setMarkers] = useState<Marker[]>([]);

  const fetchLocationUpdates = async () => {
    try {
      const response = await fetch('/api/location-updates', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data: Marker[] = await response.json();
        setMarkers(data); // Update markers with the fetched data
      } else {
        console.error('Failed to fetch location updates:', await response.text());
      }
    } catch (error) {
      console.error('Error fetching location updates:', error);
      showAlert('Error', 'Unable to fetch location updates. Please try again later.');
    }
  };

  const showAlert = (title: string, message: string) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
    } else {
      Alert.alert(title, message);
    }
  };

  useEffect(() => {
    // Fetch location updates every 30 seconds
    const intervalId = setInterval(fetchLocationUpdates, 30000);

    // Fetch immediately on mount
    fetchLocationUpdates();

    return () => {
      clearInterval(intervalId); // Cleanup interval on unmount
    };
  }, []);

  return <MapContent markers={markers} />; // Pass markers to the MapContent component
};

export default LocationMarkers;

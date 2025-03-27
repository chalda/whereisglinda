import { useEffect } from 'react';
import { Location } from '../types';

type UseSubscribeProps = {
  onLocationUpdate: (location: Location) => void; // Callback to handle location updates
};

const useSubscribe = ({ onLocationUpdate }: UseSubscribeProps) => {
  useEffect(() => {
    const eventSource = new EventSource('/subscribe'); // Connect to the /subscribe endpoint

    eventSource.onmessage = (event) => {
      try {
        const location: Location = JSON.parse(event.data); // Parse the location data
        onLocationUpdate(location); // Append the new location to the locations array
      } catch (err) {
        console.error('Failed to parse location update:', err);
      }
    };

    eventSource.onerror = (err) => {
      console.error('Error with /subscribe connection:', err);
      eventSource.close(); // Close the connection on error
    };

    return () => {
      eventSource.close(); // Cleanup the connection on component unmount
    };
  }, [onLocationUpdate]);
};

export default useSubscribe;

import { useEffect, useRef } from 'react';
import { Location } from '../types'; // Import the Location type

type UseSubscribeProps = {
  onLocationUpdate: (location: Location) => void;
  enabled: boolean;
};

const useSubscribe = ({ onLocationUpdate, enabled }: UseSubscribeProps) => {
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (enabled) {
      eventSourceRef.current = new EventSource('/locations/subscribe');

      eventSourceRef.current.onmessage = (event) => {
        try {
          const location: Location = JSON.parse(event.data);
          onLocationUpdate(location);
        } catch (err) {
          console.error('Failed to parse location update:', err);
        }
      };

      eventSourceRef.current.onerror = (err) => {
        console.error('Error with /subscribe connection:', err);
        eventSourceRef.current?.close();
      };
    } else {
      eventSourceRef.current?.close();
    }

    return () => {
      eventSourceRef.current?.close();
    };
  }, [onLocationUpdate, enabled]);
};

export default useSubscribe;

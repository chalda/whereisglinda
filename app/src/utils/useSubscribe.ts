import Constants from 'expo-constants';
import { useEffect, useRef } from 'react';
import EventSource from 'react-native-sse';

import { Location } from '../types';

const backendUrl: string = Constants?.expoConfig?.extra?.backendUrl;

type UseSubscribeProps = {
  onLocationUpdate: (location: Location) => void;
  enabled: boolean;
};

const useSubscribe = ({ onLocationUpdate, enabled }: UseSubscribeProps) => {
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    if (enabled && !eventSourceRef.current) {
      const es = new EventSource(`${backendUrl}/locations/subscribe`);
      eventSourceRef.current = es;

      es.addEventListener('open', () => {
        console.log('Open SSE connection.');
      });

      es.addEventListener('message', (event) => {
        try {
          const location: Location = JSON.parse(event?.data);
          onLocationUpdate(location);
        } catch (err) {
          console.error('Failed to parse location update:', err);
        }
      });

      es.addEventListener('error', (err) => {
        console.error('Error with /subscribe connection:', err);
        es.close();
      });

      es.addEventListener('close', () => {
        console.log('Close SSE connection.');
      });

      es.open();
    }

    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.removeAllEventListeners();
        eventSourceRef.current.close();
        eventSourceRef.current = null;
        console.log('Cleaned up SSE connection.');
      }
    };
  }, [enabled]); // Only reinitialize when `enabled` changes
};

export default useSubscribe;

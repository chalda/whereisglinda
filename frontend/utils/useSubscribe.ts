import Constants from 'expo-constants';
import { useEffect, useRef } from 'react';
import EventSource from 'react-native-sse';

import { Location } from '../types'; // Import the Location type

const backendUrl: string = Constants.expoConfig.extra.backendUrl;
const es = new EventSource(`${backendUrl}/locations/subscribe`);

type UseSubscribeProps = {
  onLocationUpdate: (location: Location) => void;
  enabled: boolean;
};

const useSubscribe = ({ onLocationUpdate, enabled }: UseSubscribeProps) => {
  useEffect(() => {
    if (enabled) {
      es.addEventListener('open', (event) => {
        console.log('Open SSE connection.');
      });

      es.addEventListener('message', (event) => {
        try {
          const location: Location = JSON.parse(event.data);
          onLocationUpdate(location);
        } catch (err) {
          console.error('Failed to parse location update:', err);
        }
      });

      es.addEventListener('error', (err) => {
        console.error('Error with /subscribe connection:', err);
        es.close();
      });

      es.addEventListener('close', (event) => {
        console.log('Close SSE connection.');
      });

      es.open();
    } else {
      es.removeAllEventListeners();
      es.close();
    }

    return () => {
      es.removeAllEventListeners();
      es.close();
    };
  }, [onLocationUpdate, enabled]);
};

export default useSubscribe;

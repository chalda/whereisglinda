import Constants from 'expo-constants';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import EventSourcePolyfill from 'react-native-sse';

import { TripLocation } from '../types';

const backendUrl: string = Constants?.expoConfig?.extra?.backendUrl;

type UseSubscribeProps = {
  onLocationUpdate: (location: TripLocation) => void;
  enabled: boolean;
};

const useSubscribe = ({ onLocationUpdate, enabled }: UseSubscribeProps) => {
  const eventSourceRef = useRef<EventSource | null>(null);
  let retry = 0;

  useEffect(() => {
    if (enabled && eventSourceRef.current === null) {
      const EventSourceImpl =
        typeof window !== 'undefined' && 'EventSource' in window
          ? window.EventSource
          : EventSourcePolyfill;

      const es = new EventSourceImpl(`${backendUrl}/locations/subscribe`);
      eventSourceRef.current = es;

      es.addEventListener('open', () => {
        console.log('Open SSE connection.');
      });

      es.addEventListener('message', (event) => {
        try {
          const location: TripLocation = JSON.parse(event?.data);
          console.log(location);
          if (location) {
            onLocationUpdate(location); // @tslint-ignore-line
          }
        } catch (err) {
          console.error('Failed to parse location update:', err);
        }
      });

      es.addEventListener('ping', (event) => {
        console.log('ping');
      });

      es.addEventListener('error', (err) => {
        console.error('Error with /subscribe connection:', err);
        es.close();
        if (eventSourceRef.current.removeAllEventListeners)
          eventSourceRef.current.removeAllEventListeners();
        eventSourceRef.current = null;
        console.log('Close SSE connection.');

        console.log('Cleaned up SSE connection.');
        if (enabled) {
          retry++;
        }
      });

      es.addEventListener('close', () => {
        console.log('Close SSE connection.');
      });

      if (es.open) es.open();
    }

    return () => {
      if (eventSourceRef.current) {
        if (eventSourceRef.current.removeAllEventListeners)
          eventSourceRef.current.removeAllEventListeners();
        eventSourceRef.current.close();
        eventSourceRef.current = null;
        console.log('Cleaned up SSE connection.');
      }
    };
  }, [enabled, retry]); // Only reinitialize when `enabled` changes
};

export default useSubscribe;

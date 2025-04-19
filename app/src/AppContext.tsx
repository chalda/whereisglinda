import React, { createContext, useState, useEffect } from 'react';
import debounce from 'lodash.debounce';

import { AppState, Location, UserRole } from './types';
import { fetchLocations, fetchAppState } from './utils/api';
import useSubscribe from './utils/useSubscribe';

export interface AppContextProps {
  apiKey: string;
  setApiKey: (key: string) => void;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  appState: AppState | null;
  setAppState: (state: AppState) => void;
  locations: Location[];
  setLocations: (locations: Location[]) => void;
  activeTripId: number | null;
  setActiveTripId: (tripId: number) => void;
}

export const AppContext = createContext<AppContextProps>({} as AppContextProps);

export type AppProviderProps = {
  children: React.ReactNode;
};
export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [appState, setAppState] = useState<AppState | null>(null);
  const [locations, setLocations] = useState<Location[]>([]);
  const [activeTripId, setActiveTripId] = useState<number | null>(null);
  const [locationSubscriptionEnabled, setLocationSubscriptionEnabled] = useState(false);

  useEffect(() => {
    const fetchState = async () => {
      try {
        const data = await fetchAppState();
        setAppState(data);
      } catch (err) {
        console.error('Failed to fetch app state:', err.message);
      }
    };

    const intervalId = setInterval(fetchState, 30 * 1000); // 30 seconds

    return () => {
      clearInterval(intervalId);
    };
  }, []);

  useEffect(() => {
    const debounceSetSubscription = debounce((enabled: boolean) => {
      setLocationSubscriptionEnabled(enabled);
    }, 1000); // Debounce to 1 second

    if (appState && appState.rideStatus !== 'Home') {
      debounceSetSubscription(true);
    } else {
      debounceSetSubscription(false);
    }

    return () => {
      debounceSetSubscription.cancel(); // Cancel debounce on cleanup
    };
  }, [appState]);

  const loadAppState = async () => {
    try {
      const data = await fetchAppState(); // Fetch app state without an API key
      setAppState(data);
    } catch (err) {
      console.error('Failed to fetch app state:', err.message);
    }
  };

  const loadLocations = async () => {
    try {
      const data = await fetchLocations(); // Fetch locations without an API key
      setLocations(data);
    } catch (err) {
      console.error('Failed to fetch locations:', err.message);
    }
  };

  const handleRefresh = async () => {
    await loadAppState();
    await loadLocations();
  };

  useEffect(() => {
    handleRefresh();
  }, []);

  // Subscribe to the latest location updates
  useSubscribe({
    onLocationUpdate: (location) => {
      setLocations((prevLocations) => [...prevLocations, location]); // Append the new location to the array
    },
    enabled: locationSubscriptionEnabled,
  });

  return (
    <AppContext.Provider
      value={{
        apiKey,
        setApiKey,
        userRole,
        setUserRole,
        appState,
        setAppState,
        locations,
        setLocations,
        activeTripId,
        setActiveTripId,
      }}>
      {children}
    </AppContext.Provider>
  );
};
